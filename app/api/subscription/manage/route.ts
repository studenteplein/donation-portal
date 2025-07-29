import { NextRequest, NextResponse } from "next/server"
import { Effect } from "effect"
import { generateSubscriptionManagementLink, fetchSubscription } from "@/lib/paystack-service"
import * as Option from "effect/Option"
import { BadRequestError } from "@/lib/errors"
import { pipe } from "effect/Function"
import { PaystackError } from "@/lib/paystack-service"

export async function POST(request: NextRequest) {
  const handlerEffect: Effect.Effect<NextResponse, BadRequestError | PaystackError | unknown, never> = Effect.gen(function* () {
    const body = yield* Effect.tryPromise(() => request.json());
    const subscription_code = yield* pipe(
      Effect.succeed(Option.fromNullable(body.subscription_code)),
      Effect.flatMap(o =>
        Option.isSome(o) ? Effect.succeed(o.value) : Effect.fail(new BadRequestError("Subscription code is required"))
      )
    );
    const result: { status: boolean; message?: string; data: { link: string } } = yield* generateSubscriptionManagementLink(subscription_code);
    if (!result.status) {
      return yield* Effect.fail(new BadRequestError(result.message ?? "Failed to generate management link"));
    }
    return NextResponse.json({ link: result.data.link });
  });
  return Effect.runPromise(
    handlerEffect.pipe(
      Effect.catchTag("BadRequestError", (e: BadRequestError) => Effect.succeed(NextResponse.json({ error: e.message }, { status: 400 }))),
      Effect.catchAll((e: unknown) => {
        console.error("Error generating management link:", e);
        return Effect.succeed(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
      })
    )
  );
}

export async function GET(request: NextRequest) {
  const handlerEffect: Effect.Effect<NextResponse, BadRequestError | PaystackError | unknown, never> = Effect.gen(function* () {
    const { searchParams } = new URL(request.url);
    const subscription_code = yield* pipe(
      Effect.succeed(Option.fromNullable(searchParams.get("subscription_code"))),
      Effect.flatMap(o =>
        Option.isSome(o) ? Effect.succeed(o.value) : Effect.fail(new BadRequestError("Subscription code is required"))
      )
    );
    const result: { status: boolean; message?: string; data: any } = yield* fetchSubscription(subscription_code);
    if (!result.status) {
      return yield* Effect.fail(new BadRequestError(result.message ?? "Failed to fetch subscription"));
    }
    return NextResponse.json(result.data);
  });
  return Effect.runPromise(
    handlerEffect.pipe(
      Effect.catchTag("BadRequestError", (e: BadRequestError) => Effect.succeed(NextResponse.json({ error: e.message }, { status: 400 }))),
      Effect.catchAll((e: unknown) => {
        console.error("Error fetching subscription:", e);
        return Effect.succeed(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
      })
    )
  );
}