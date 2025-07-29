import { NextRequest, NextResponse } from "next/server"
import { Effect } from "effect"
import { verifyTransaction } from "@/lib/paystack-service"
import * as Option from "effect/Option"
import { BadRequestError, TransactionFailedError } from "@/lib/errors"
import { pipe } from "effect/Function"
import { PaystackError } from "@/lib/paystack-service"

// Helper function to filter sensitive data
function createSafeTransactionResponse(transaction: Record<string, unknown>) {
  const customer = transaction.customer as Record<string, unknown> | undefined
  const metadata = transaction.metadata as Record<string, unknown> | undefined
  
  return {
    amount: transaction.amount,
    currency: transaction.currency,
    reference: transaction.reference,
    plan: transaction.plan,
    customer: {
      email: customer?.email
    },
    metadata: {
      plan_interval: metadata?.plan_interval
    }
  }
}

export async function GET(request: NextRequest) {
  const handlerEffect: Effect.Effect<NextResponse, BadRequestError | TransactionFailedError | PaystackError | unknown, never> = Effect.gen(function* () {
    const { searchParams } = new URL(request.url);
    const reference = yield* pipe(
      Effect.succeed(Option.fromNullable(searchParams.get("reference"))),
      Effect.flatMap(o =>
        Option.isSome(o) ? Effect.succeed(o.value) : Effect.fail(new BadRequestError("Transaction reference is required"))
      )
    );
    const result: { status: boolean; message?: string; data: Record<string, unknown> } = yield* verifyTransaction(reference);
    if (!result.status) {
      return yield* Effect.fail(new BadRequestError(result.message ?? "Failed to verify transaction"));
    }
    const transaction = result.data;
    if (transaction.status !== "success") {
      return yield* Effect.fail(
        new TransactionFailedError(
          String(transaction.status || 'unknown'), 
          String(transaction.gateway_response || 'No gateway response')
        )
      );
    }
    return NextResponse.json({
      status: "success",
      transaction: createSafeTransactionResponse(transaction)
    });
  });
  return Effect.runPromise(
    handlerEffect.pipe(
      Effect.catchTags({
        BadRequestError: (e: BadRequestError) => Effect.succeed(NextResponse.json({ error: e.message }, { status: 400 })),
        TransactionFailedError: (e: TransactionFailedError) => Effect.succeed(NextResponse.json({ error: e.message, status: e.status, gateway_response: e.gateway_response }, { status: 400 })),
      }),
      Effect.catchAll((e: unknown) => {
        console.error("Error verifying transaction:", e);
        return Effect.succeed(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
      })
    )
  );
}

export async function POST(request: NextRequest) {
  const handlerEffect: Effect.Effect<NextResponse, BadRequestError | PaystackError | unknown, never> = Effect.gen(function* () {
    const body = yield* Effect.tryPromise(() => request.json());
    const reference = yield* pipe(
      Effect.succeed(Option.fromNullable(body.reference)),
      Effect.flatMap(o =>
        Option.isSome(o) ? Effect.succeed(o.value) : Effect.fail(new BadRequestError("Transaction reference is required"))
      )
    );
    const result: { status: boolean; message?: string; data: Record<string, unknown> } = yield* verifyTransaction(reference);
    if (!result.status) {
      return yield* Effect.fail(new BadRequestError(result.message ?? "Failed to verify transaction"));
    }
    const transaction = result.data;
    return NextResponse.json({
      status: "success",
      transaction: createSafeTransactionResponse(transaction)
    });
  });
  return Effect.runPromise(
    handlerEffect.pipe(
      Effect.catchTags({
        BadRequestError: (e: BadRequestError) => Effect.succeed(NextResponse.json({ error: e.message }, { status: 400 })),
        TransactionFailedError: (e: TransactionFailedError) => Effect.succeed(NextResponse.json({ error: e.message, status: e.status, gateway_response: e.gateway_response }, { status: 400 })),
      }),
      Effect.catchAll((e: unknown) => {
        console.error("Error verifying transaction:", e);
        return Effect.succeed(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
      })
    )
  );
}