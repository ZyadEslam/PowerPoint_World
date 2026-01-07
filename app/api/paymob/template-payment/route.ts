import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import User from "@/app/models/user";

// Paymob API endpoints
const PAYMOB_API_BASE = "https://accept.paymob.com/api";

interface PaymobAuthResponse {
  token: string;
}

interface PaymobOrderResponse {
  id: number;
}

interface PaymobPaymentKeyResponse {
  token: string;
}

interface BillingData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  street: string;
  city: string;
  state: string;
  country: string;
  building: string;
  floor: string;
  apartment: string;
  postal_code: string;
}

// Step 1: Get Authentication Token
async function getAuthToken(): Promise<string> {
  const response = await fetch(`${PAYMOB_API_BASE}/auth/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Paymob");
  }

  const data: PaymobAuthResponse = await response.json();
  return data.token;
}

// Step 2: Create Order
async function createPaymobOrder(
  authToken: string,
  amountCents: number,
  merchantOrderId: string
): Promise<number> {
  const response = await fetch(`${PAYMOB_API_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: merchantOrderId,
      items: [],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Paymob order");
  }

  const data: PaymobOrderResponse = await response.json();
  return data.id;
}

// Step 3: Get Payment Key
async function getPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  billingData: BillingData,
  integrationId: number
): Promise<string> {
  const response = await fetch(`${PAYMOB_API_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: integrationId,
      lock_order_when_paid: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get payment key");
  }

  const data: PaymobPaymentKeyResponse = await response.json();
  return data.token;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in to purchase" },
        { status: 401 }
      );
    }

    // Validate environment variables
    if (!process.env.PAYMOB_API_KEY || !process.env.PAYMOB_INTEGRATION_ID) {
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 500 }
      );
    }

    await dbConnect();

    const { purchaseId } = await req.json();

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      );
    }

    // Find the pending purchase
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      userId: session.user.id,
      paymentStatus: "pending",
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found or already processed" },
        { status: 404 }
      );
    }

    // Get user details
    const user = await User.findById(session.user.id);
    const userName = user?.name || session.user.name || "Customer";
    const nameParts = userName.split(" ");

    // Convert amount to cents (Paymob uses piasters for EGP)
    const amountCents = Math.round(purchase.purchasePrice * 100);

    // Step 1: Get auth token
    const authToken = await getAuthToken();

    // Step 2: Create order
    const paymobOrderId = await createPaymobOrder(
      authToken,
      amountCents,
      purchase._id.toString()
    );

    // Update purchase with Paymob order ID
    purchase.paymobOrderId = String(paymobOrderId);
    await purchase.save();

    // Step 3: Get payment key
    const billingData: BillingData = {
      first_name: nameParts[0] || "Customer",
      last_name: nameParts.slice(1).join(" ") || "N/A",
      phone_number: "N/A",
      email: session.user.email,
      street: "N/A",
      city: "Cairo",
      state: "Cairo",
      country: "EG",
      building: "N/A",
      floor: "N/A",
      apartment: "N/A",
      postal_code: "N/A",
    };

    const paymentKey = await getPaymentKey(
      authToken,
      paymobOrderId,
      amountCents,
      billingData,
      parseInt(process.env.PAYMOB_INTEGRATION_ID)
    );

    // Return payment key and iframe URL
    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return NextResponse.json({
      success: true,
      paymentKey,
      orderId: paymobOrderId,
      iframeUrl,
      purchaseId: purchase._id,
      receiptNumber: purchase.receiptNumber,
    });
  } catch (error) {
    console.error("Template payment error:", error);
    return NextResponse.json(
      {
        error: "Payment Error",
        message:
          error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 }
    );
  }
}

