import { NextRequest, NextResponse } from "next/server"
import { Effect } from "effect"
import { Schema } from "effect"
import { WebhookEventSchema } from "@/lib/schemas"
import crypto from "crypto"
import * as Option from "effect/Option"
import { BadRequestError } from "@/lib/errors"
import { pipe } from "effect/Function"
import { ParseError } from "effect/ParseResult"

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.NEXT_PAYSTACK_SECRET_KEY!
  const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  const handlerEffect: Effect.Effect<NextResponse, BadRequestError | ParseError | unknown, never> = Effect.gen(function* () {
    const payload = yield* Effect.tryPromise(() => request.text());
    const signature = yield* pipe(
      Effect.succeed(Option.fromNullable(request.headers.get('x-paystack-signature'))),
      Effect.flatMap(o => Option.isSome(o) ? Effect.succeed(o.value) : Effect.fail(new BadRequestError("Missing signature")))
    );
    if (!verifyWebhookSignature(payload, signature)) {
      return yield* Effect.fail(new BadRequestError("Invalid signature"));
    }
    const webhookData = yield* Effect.try({
      try: () => JSON.parse(payload),
      catch: () => new BadRequestError("Invalid JSON payload")
    });
    const validatedEvent = yield* Schema.decodeUnknown(WebhookEventSchema)(webhookData);
    console.log(`Received webhook event: ${validatedEvent.event}`);
    switch (validatedEvent.event) {
      case 'subscription.create':
        handleSubscriptionCreate(validatedEvent.data);
        break;
      case 'subscription.disable':
        handleSubscriptionDisable(validatedEvent.data);
        break;
      case 'subscription.not_renew':
        handleSubscriptionNotRenew(validatedEvent.data);
        break;
      case 'invoice.create':
        handleInvoiceCreate(validatedEvent.data);
        break;
      case 'invoice.payment_failed':
        handleInvoicePaymentFailed(validatedEvent.data);
        break;
      case 'invoice.update':
        handleInvoiceUpdate(validatedEvent.data);
        break;
      case 'charge.success':
        handleChargeSuccess(validatedEvent.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${validatedEvent.event}`);
    }
    return NextResponse.json({ status: "success" });
  });
  return Effect.runPromise(
    handlerEffect.pipe(
      Effect.catchTags({
        ParseError: () => Effect.succeed(NextResponse.json({ error: "Invalid webhook data" }, { status: 400 })),
        BadRequestError: (e: BadRequestError) => Effect.succeed(NextResponse.json({ error: e.message }, { status: 400 })),
      }),
      Effect.catchAll((e: unknown) => {
        console.error("Webhook processing error:", e);
        return Effect.succeed(NextResponse.json({ error: "Webhook processing failed" }, { status: 500 }));
      })
    )
  );
}

function handleSubscriptionCreate(data: any) {
  console.log("Subscription created:", {
    subscription_code: data.subscription_code,
    customer_email: data.customer.email,
    plan_name: data.plan.name,
    amount: data.amount,
    status: data.status
  })
  
  // Here you would typically:
  // 1. Store subscription in your database
  // 2. Send welcome email to customer
  // 3. Update customer status
  // 4. Log the event for analytics
}

function handleSubscriptionDisable(data: any) {
  console.log("Subscription disabled:", {
    subscription_code: data.subscription_code,
    customer_email: data.customer.email,
    status: data.status
  })
  
  // Here you would typically:
  // 1. Update subscription status in database
  // 2. Send cancellation confirmation email
  // 3. Revoke customer access if applicable
  // 4. Log the event for analytics
}

function handleSubscriptionNotRenew(data: any) {
  console.log("Subscription set to not renew:", {
    subscription_code: data.subscription_code,
    customer_email: data.customer.email,
    next_payment_date: data.next_payment_date
  })
  
  // Here you would typically:
  // 1. Update subscription renewal status
  // 2. Send notification about upcoming cancellation
  // 3. Offer retention incentives
}

function handleInvoiceCreate(data: any) {
  console.log("Invoice created:", {
    invoice_code: data.invoice_code,
    subscription_code: data.subscription.subscription_code,
    amount: data.amount,
    due_date: data.due_date
  })
  
  // Here you would typically:
  // 1. Log upcoming payment attempt
  // 2. Send payment reminder if needed
}

function handleInvoicePaymentFailed(data: any) {
  console.log("Invoice payment failed:", {
    invoice_code: data.invoice_code,
    subscription_code: data.subscription.subscription_code,
    amount: data.amount,
    description: data.description
  })
  
  // Here you would typically:
  // 1. Update payment status in database
  // 2. Send payment failure notification
  // 3. Provide recovery options
  // 4. Update subscription status if needed
}

function handleInvoiceUpdate(data: any) {
  console.log("Invoice updated:", {
    invoice_code: data.invoice_code,
    status: data.status,
    paid: data.paid
  })
  
  // Here you would typically:
  // 1. Update invoice status in database
  // 2. Update subscription payment history
}

function handleChargeSuccess(data: any) {
  console.log("Charge successful:", {
    reference: data.reference,
    amount: data.amount,
    customer_email: data.customer.email,
    status: data.status
  })
  
  // Here you would typically:
  // 1. Update payment records
  // 2. Send payment confirmation
  // 3. Update customer account status
}