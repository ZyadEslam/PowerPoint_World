import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongoose";
import Order from "@/app/models/order";

// Paymob HMAC verification
function verifyHMAC(
  data: Record<string, unknown>,
  hmac: string,
  secretKey: string
): boolean {
  // Paymob HMAC calculation order
  const hmacKeys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  // Build string for HMAC calculation
  let concatenatedString = "";
  for (const key of hmacKeys) {
    const keys = key.split(".");
    let value: unknown = data;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    concatenatedString += String(value ?? "");
  }

  // Calculate HMAC
  const calculatedHmac = crypto
    .createHmac("sha512", secretKey)
    .update(concatenatedString)
    .digest("hex");

  return calculatedHmac === hmac;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hmac = req.nextUrl.searchParams.get("hmac");

    // Verify HMAC signature
    if (!process.env.PAYMOB_HMAC_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (hmac && !verifyHMAC(body.obj, hmac, process.env.PAYMOB_HMAC_SECRET)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const transactionData = body.obj;
    const success = transactionData.success;
    const paymobOrderId = transactionData.order?.id;
    const transactionId = transactionData.id;
    const merchantOrderId = transactionData.order?.merchant_order_id;

    // Connect to database
    await dbConnect();

    // Find and update order by merchantOrderId (our MongoDB order ID) or paymobOrderId
    let order = null;

    // merchantOrderId is our actual MongoDB order ID
    if (merchantOrderId) {
      order = await Order.findById(merchantOrderId);
    }

    // Fallback: try to find by paymobOrderId
    if (!order && paymobOrderId) {
      order = await Order.findOne({ paymobOrderId: String(paymobOrderId) });
    }

    if (order) {
      // Update payment status
      order.paymentStatus = success ? "paid" : "failed";
      order.paymobTransactionId = String(transactionId);

      if (success) {
        order.orderState = "Processing";
      }

      await order.save();
    }

    // Always return 200 to acknowledge webhook
    return NextResponse.json({ received: true });
  } catch {
    // Still return 200 to prevent Paymob from retrying
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

// Also handle GET for Paymob callback redirect
export async function GET(req: NextRequest) {
  // Get all search params - Paymob sends params with dots like "data.message"
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  
  // Parse success - Paymob sends "true" or "false" as strings
  const successParam = searchParams.get("success");
  const success = successParam === "true";
  
  const merchantOrderId = searchParams.get("merchant_order_id");
  const transactionId = searchParams.get("id");
  const paymobOrderId = searchParams.get("order");
  
  // Handle "data.message" param - try both with and without encoding
  let errorMessage = searchParams.get("data.message");
  if (!errorMessage) {
    // Try to get from the raw URL since dots in param names can be tricky
    const urlString = req.url;
    const dataMessageMatch = urlString.match(/data\.message=([^&]*)/);
    if (dataMessageMatch) {
      errorMessage = decodeURIComponent(dataMessageMatch[1]);
    }
  }

  // Get base URL - use origin from request if env var not set
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  
  // Default locale
  const locale = "en";

  if (success) {
    // Payment successful - try to find the order
    try {
      await dbConnect();
      
      let order = null;
      
      // First try to find by merchantOrderId (which is our MongoDB order ID)
      if (merchantOrderId) {
        order = await Order.findById(merchantOrderId);
      }
      
      // Fallback: try to find by paymobOrderId
      if (!order && paymobOrderId) {
        order = await Order.findOne({ paymobOrderId: String(paymobOrderId) });
      }
      
      if (order) {
        // Update payment status if not already updated by webhook
        if (order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.paymobTransactionId = String(transactionId);
          order.orderState = "Processing";
          await order.save();
        }
        
        // Redirect to order confirmation with actual order ID
        const redirectUrl = new URL(`/${locale}/order-confirmation/${order._id}`, baseUrl);
        return NextResponse.redirect(redirectUrl.toString());
      }
    } catch {
      // Error handled silently for production
    }
    
    // Fallback - redirect to homepage with success message
    const redirectUrl = new URL(`/${locale}`, baseUrl);
    redirectUrl.searchParams.set("payment", "success");
    return NextResponse.redirect(redirectUrl.toString());
  } else {
    // Payment failed - redirect back to checkout with error
    // Also need to handle the failed order - maybe delete it or mark as failed
    if (merchantOrderId) {
      try {
        await dbConnect();
        const order = await Order.findById(merchantOrderId);
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          await order.save();
        }
      } catch {
        // Error handled silently for production
      }
    }
    
    const redirectUrl = new URL(`/${locale}/checkout`, baseUrl);
    redirectUrl.searchParams.set("payment_failed", "true");
    if (transactionId) {
      redirectUrl.searchParams.set("transaction", transactionId);
    }
    if (errorMessage) {
      redirectUrl.searchParams.set("error", errorMessage);
    }
    return NextResponse.redirect(redirectUrl.toString());
  }
}

