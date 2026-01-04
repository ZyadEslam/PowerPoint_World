import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/authMiddleware";
import { checkPaymentRateLimit } from "@/lib/security/rateLimiter";
import { logPaymentEvent, AuditEventType } from "@/lib/security/auditLogger";

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
  shipping_method?: string;
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
      expiration: 3600, // 1 hour
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
    // Check if authentication is required or allow guest checkout
    const session = await requireAuth();
    const userId = session?.user?.id || "guest";
    const userEmail = session?.user?.email || "guest@checkout.com";

    // Rate limiting
    const rateLimitResult = await checkPaymentRateLimit(req, userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Payment rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // Validate environment variables
    if (!process.env.PAYMOB_API_KEY || !process.env.PAYMOB_INTEGRATION_ID) {
      return NextResponse.json(
        { error: "Service Error", message: "Payment service unavailable" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amount, billingData, merchantOrderId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!billingData) {
      return NextResponse.json(
        { error: "Validation Error", message: "Billing data is required" },
        { status: 400 }
      );
    }

    // Convert amount to cents (Paymob uses piasters for EGP)
    const amountCents = Math.round(amount * 100);

    // Step 1: Get auth token
    const authToken = await getAuthToken();

    // Step 2: Create order
    const orderId = await createPaymobOrder(
      authToken,
      amountCents,
      merchantOrderId || `order_${Date.now()}`
    );

    // Step 3: Get payment key
    const formattedBillingData: BillingData = {
      first_name: billingData.firstName || billingData.name?.split(" ")[0] || "N/A",
      last_name: billingData.lastName || billingData.name?.split(" ").slice(1).join(" ") || "N/A",
      phone_number: billingData.phone || "N/A",
      email: billingData.email || userEmail,
      street: billingData.address || billingData.street || "N/A",
      city: billingData.city || "N/A",
      state: billingData.state || "N/A",
      country: "EG",
      building: billingData.building || "N/A",
      floor: billingData.floor || "N/A",
      apartment: billingData.apartment || "N/A",
      postal_code: billingData.postalCode || "N/A",
    };

    const paymentKey = await getPaymentKey(
      authToken,
      orderId,
      amountCents,
      formattedBillingData,
      parseInt(process.env.PAYMOB_INTEGRATION_ID)
    );

    // Log successful payment creation
    await logPaymentEvent(
      AuditEventType.PAYMENT_CREATED,
      userId,
      userEmail,
      req,
      {
        paymobOrderId: orderId,
        amount: amountCents,
        currency: "EGP",
        merchantOrderId,
      }
    );

    // Return payment key and iframe URL
    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return NextResponse.json({
      success: true,
      paymentKey,
      orderId,
      iframeUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Payment Error",
        message: error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 }
    );
  }
}

