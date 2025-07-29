import { Effect, pipe } from "effect"
import { Schema } from "effect"
import type { CreateSubscriptionRequest, PaystackSubscription, DonationPlan } from "./schemas"
import { ParseError } from "effect/ParseResult"
import { PaystackSubscriptionSchema } from "./schemas"

export class PaystackError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = "PaystackError"
  }
}

export interface PaystackConfig {
  readonly secretKey: string
  readonly baseUrl: string
}

export const PaystackConfigLive = Effect.succeed<PaystackConfig>({
  secretKey: process.env.NEXT_PAYSTACK_SECRET_KEY!,
  baseUrl: "https://api.paystack.co"
})

export const initializeTransaction = (request: {
  email: string
  amount: number
  plan?: string
  callback_url?: string
  metadata?: Record<string, unknown>
}) =>
  Effect.gen(function* () {
    const config = yield* PaystackConfigLive
    
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${config.baseUrl}/transaction/initialize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }),
      catch: (error) => new PaystackError(`Failed to initialize transaction: ${error}`)
    })

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => "Unknown error"
      })
      return yield* Effect.fail(
        new PaystackError(`Transaction initialization failed: ${errorText}`, response.status)
      )
    }

    const InitializeResponse = Schema.Struct({
      status: Schema.Boolean,
      message: Schema.optional(Schema.String),
      data: Schema.Struct({
        access_code: Schema.String,
        authorization_url: Schema.String,
        reference: Schema.String
      })
    })

    const data = yield* pipe(
      Effect.tryPromise({
        try: () => response.json(),
        catch: (error) => new PaystackError(`Failed to parse response: ${error}`)
      }),
      Effect.flatMap(Schema.decodeUnknown(InitializeResponse))
    )

    return data
  })

export const createSubscription = (request: {
  customer: string
  plan: string
  authorization?: string
  start_date?: string
}) =>
  Effect.gen(function* () {
    const config = yield* PaystackConfigLive
    
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${config.baseUrl}/subscription`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }),
      catch: (error) => new PaystackError(`Failed to create subscription: ${error}`)
    })

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => "Unknown error"
      })
      return yield* Effect.fail(
        new PaystackError(`Subscription creation failed: ${errorText}`, response.status)
      )
    }

    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => new PaystackError(`Failed to parse response: ${error}`)
    })

    return data
  })

export const fetchSubscription = (subscriptionCode: string) =>
  Effect.gen(function* () {
    const config = yield* PaystackConfigLive
    
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${config.baseUrl}/subscription/${subscriptionCode}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
            "Content-Type": "application/json",
          },
        }),
      catch: (error) => new PaystackError(`Failed to fetch subscription: ${error}`)
    })

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => "Unknown error"
      })
      return yield* Effect.fail(
        new PaystackError(`Failed to fetch subscription: ${errorText}`, response.status)
      )
    }

    const FetchSubscriptionResponse = Schema.Struct({
      status: Schema.Boolean,
      message: Schema.optional(Schema.String),
      data: PaystackSubscriptionSchema
    })

    const data = yield* pipe(
      Effect.tryPromise({
        try: () => response.json(),
        catch: (error) => new PaystackError(`Failed to parse response: ${error}`)
      }),
      Effect.flatMap(Schema.decodeUnknown(FetchSubscriptionResponse))
    )

    return data
  })

export const createCustomer = (request: {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
}) =>
  Effect.gen(function* () {
    const config = yield* PaystackConfigLive
    
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${config.baseUrl}/customer`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }),
      catch: (error) => new PaystackError(`Failed to create customer: ${error}`)
    })

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => "Unknown error"
      })
      return yield* Effect.fail(
        new PaystackError(`Customer creation failed: ${errorText}`, response.status)
      )
    }

    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => new PaystackError(`Failed to parse response: ${error}`)
    })

    return data
  })

export const generateSubscriptionManagementLink = (subscriptionCode: string) =>
  Effect.gen(function* () {
    const config = yield* PaystackConfigLive
    
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${config.baseUrl}/subscription/${subscriptionCode}/manage/link`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
          },
        }),
      catch: (error) => new PaystackError(`Failed to generate management link: ${error}`)
    })

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => "Unknown error"
      })
      return yield* Effect.fail(
        new PaystackError(`Failed to generate management link: ${errorText}`, response.status)
      )
    }

    const ManagementLinkResponse = Schema.Struct({
      status: Schema.Boolean,
      message: Schema.optional(Schema.String),
      data: Schema.Struct({
        link: Schema.String
      })
    })

    const data = yield* pipe(
      Effect.tryPromise({
        try: () => response.json(),
        catch: (error) => new PaystackError(`Failed to parse response: ${error}`)
      }),
      Effect.flatMap(Schema.decodeUnknown(ManagementLinkResponse))
    )

    return data
  })

export const verifyTransaction = (reference: string) =>
  Effect.gen(function* () {
    const config = yield* PaystackConfigLive
    
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${config.baseUrl}/transaction/verify/${reference}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.secretKey}`,
          },
        }),
      catch: (error) => new PaystackError(`Failed to verify transaction: ${error}`)
    })

    if (!response.ok) {
      const errorText = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => "Unknown error"
      })
      return yield* Effect.fail(
        new PaystackError(`Transaction verification failed: ${errorText}`, response.status)
      )
    }

    const VerifyResponse = Schema.Struct({
      status: Schema.Boolean,
      message: Schema.optional(Schema.String),
      data: Schema.Struct({
        id: Schema.Number,
        reference: Schema.String,
        amount: Schema.Number,
        currency: Schema.String,
        status: Schema.String,
        paid_at: Schema.String,
        customer: Schema.Struct({
          email: Schema.String,
          customer_code: Schema.String
        }),
        plan: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
        authorization: Schema.Record({key: Schema.String, value: Schema.Unknown}),
        metadata: Schema.Record({key: Schema.String, value: Schema.Unknown})
      })
    })

    const data = yield* pipe(
      Effect.tryPromise({
        try: () => response.json(),
        catch: (error) => new PaystackError(`Failed to parse response: ${error}`)
      }),
      Effect.flatMap(Schema.decodeUnknown(VerifyResponse))
    )

    return data
  })