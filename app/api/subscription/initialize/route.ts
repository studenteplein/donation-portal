import { NextRequest, NextResponse } from "next/server"
import { Effect, Schema } from "effect"
import { initializeTransaction } from "@/lib/paystack-service"
import { CreateSubscriptionRequestSchema } from "@/lib/schemas"
import { getPlanById } from "@/lib/donation-plans"
import * as Option from "effect/Option"
import { BadRequestError } from "@/lib/errors"
import { pipe } from "effect/Function"
import { ParseError } from "effect/ParseResult"
import { PaystackError } from "@/lib/paystack-service"

export async function POST(request: NextRequest) {
  const handlerEffect: Effect.Effect<NextResponse, BadRequestError | ParseError | PaystackError | unknown, never> = Effect.gen(function* () {
    const body = yield* Effect.tryPromise(() => request.json());
    const validated = yield* Schema.decodeUnknown(CreateSubscriptionRequestSchema)(body);
    
    // Get plan by internal id
    const plan = yield* pipe(
      Effect.succeed(Option.fromNullable(getPlanById(validated.planId))),
      Effect.flatMap(o =>
        Option.isSome(o) ? Effect.succeed(o.value) : Effect.fail(new BadRequestError("Invalid plan"))
      )
    );
    
    // Ensure email is properly trimmed and validated before sending to Paystack
    const trimmedEmail = validated.email.trim();
    if (!trimmedEmail || trimmedEmail.length === 0) {
      return yield* Effect.fail(new BadRequestError("Email is required"));
    }

    // For one-off donations, don't include the plan field (they're transactions, not subscriptions)
    const initializationRequest = {
      email: trimmedEmail,
      amount: plan.amount * 100,
      ...(plan.interval !== "one-off" && plan.planCode ? { plan: plan.planCode } : {}),
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/donation/callback`,
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        plan_interval: plan.interval,
        first_name: validated.firstName?.trim(),
        last_name: validated.lastName?.trim(),
        phone: validated.phone
      }
    };
    
    
    const result: { status: boolean; message?: string; data: { access_code: string; authorization_url: string; reference: string } } = yield* initializeTransaction(initializationRequest);
    if (!result.status) {
      return yield* Effect.fail(new BadRequestError(result.message ?? "Failed to initialize transaction"));
    }
    return NextResponse.json({
      access_code: result.data.access_code,
      authorization_url: result.data.authorization_url,
      reference: result.data.reference
    });
  });
  return Effect.runPromise(
    handlerEffect.pipe(
      Effect.catchTags({
        ParseError: () => Effect.succeed(NextResponse.json({ error: "Invalid input" }, { status: 400 })),
        BadRequestError: (e: BadRequestError) => Effect.succeed(NextResponse.json({ error: e.message }, { status: 400 })),
      }),
      Effect.catchAll((e: unknown) => {
        console.error("Error initializing subscription:", e);
        return Effect.succeed(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
      })
    )
  );
}