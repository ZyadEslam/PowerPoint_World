import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import Template from "@/app/models/template";
import User from "@/app/models/user";

// Paymob HMAC verification
function verifyHMAC(
  data: Record<string, unknown>,
  hmac: string,
  secretKey: string
): boolean {
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

  let concatenatedString = "";
  for (const key of hmacKeys) {
    const keys = key.split(".");
    let value: unknown = data;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    concatenatedString += String(value ?? "");
  }

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
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const transactionData = body.obj;
    const success = transactionData.success;
    const paymobOrderId = transactionData.order?.id;
    const transactionId = transactionData.id;
    const merchantOrderId = transactionData.order?.merchant_order_id;

    await dbConnect();

    // Find purchase by merchantOrderId (our MongoDB purchase ID) or paymobOrderId
    let purchase = null;

    // merchantOrderId format: purchaseId_timestamp - extract the actual ID
    if (merchantOrderId) {
      const actualPurchaseId = merchantOrderId.split("_")[0];
      purchase = await Purchase.findById(actualPurchaseId);
    }

    if (!purchase && paymobOrderId) {
      purchase = await Purchase.findOne({ paymobOrderId: String(paymobOrderId) });
    }

    if (purchase) {
      // Update payment status
      purchase.paymentStatus = success ? "paid" : "failed";
      purchase.paymobTransactionId = String(transactionId);

      if (success) {
        purchase.status = "active";

        // Increment template purchase count
        await Template.findByIdAndUpdate(purchase.templateId, {
          $inc: { purchaseCount: 1 },
        });

        // Add purchase to user's purchased templates
        await User.findByIdAndUpdate(purchase.userId, {
          $addToSet: { purchasedTemplates: purchase._id },
        });
      }

      await purchase.save();
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Template webhook error:", error);
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

// Handle GET for Paymob callback redirect
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const successParam = searchParams.get("success");
  const success = successParam === "true";
  const merchantOrderId = searchParams.get("merchant_order_id");
  const transactionId = searchParams.get("id");
  const paymobOrderId = searchParams.get("order");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const locale = "ar"; // Use Arabic locale

  if (success) {
    try {
      await dbConnect();

      let purchase = null;

      // merchantOrderId format: purchaseId_timestamp - extract the actual ID
      if (merchantOrderId) {
        const actualPurchaseId = merchantOrderId.split("_")[0];
        purchase = await Purchase.findById(actualPurchaseId);
      }

      if (!purchase && paymobOrderId) {
        purchase = await Purchase.findOne({ paymobOrderId: String(paymobOrderId) });
      }

      if (purchase) {
        // Update payment status if not already updated by webhook
        if (purchase.paymentStatus !== "paid") {
          purchase.paymentStatus = "paid";
          purchase.paymobTransactionId = String(transactionId);
          purchase.status = "active";
          await purchase.save();

          // Increment template purchase count
          await Template.findByIdAndUpdate(purchase.templateId, {
            $inc: { purchaseCount: 1 },
          });

          // Add purchase to user's purchased templates
          await User.findByIdAndUpdate(purchase.userId, {
            $addToSet: { purchasedTemplates: purchase._id },
          });
        }

        // Redirect to purchase success page
        const redirectUrl = new URL(
          `/${locale}/my-templates?purchase=success&id=${purchase._id}`,
          baseUrl
        );
        return NextResponse.redirect(redirectUrl.toString());
      }
    } catch (error) {
      console.error("Payment callback error:", error);
    }

    // Fallback redirect
    const redirectUrl = new URL(`/${locale}/my-templates?purchase=success`, baseUrl);
    return NextResponse.redirect(redirectUrl.toString());
  } else {
    // Payment failed
    if (merchantOrderId) {
      try {
        await dbConnect();
        const actualPurchaseId = merchantOrderId.split("_")[0];
        const purchase = await Purchase.findById(actualPurchaseId);
        if (purchase && purchase.paymentStatus === "pending") {
          purchase.paymentStatus = "failed";
          await purchase.save();
        }
      } catch (error) {
        console.error("Failed payment handling error:", error);
      }
    }

    const redirectUrl = new URL(`/${locale}/templates?payment=failed`, baseUrl);
    return NextResponse.redirect(redirectUrl.toString());
  }
}

