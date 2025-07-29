import { Schema } from "effect"

export const DonationPlanSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  amount: Schema.Number,
  currency: Schema.String,
  interval: Schema.Literal("monthly", "annually", "one-off"),
  planCode: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String)
})

export const CreateSubscriptionRequestSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)),
  planId: Schema.String,
  firstName: Schema.optional(Schema.String),
  lastName: Schema.optional(Schema.String),
  phone: Schema.optional(Schema.String)
})

export const PaystackCustomerSchema = Schema.Struct({
  id: Schema.Number,
  first_name: Schema.String,
  last_name: Schema.String,
  email: Schema.String,
  customer_code: Schema.String,
  phone: Schema.String,
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  risk_action: Schema.String
})

export const PaystackSubscriptionSchema = Schema.Struct({
  id: Schema.Number,
  domain: Schema.String,
  status: Schema.String,
  subscription_code: Schema.String,
  email_token: Schema.String,
  amount: Schema.Number,
  cron_expression: Schema.String,
  next_payment_date: Schema.String,
  open_invoice: Schema.Union(Schema.String, Schema.Null),
  plan: Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    plan_code: Schema.String,
    description: Schema.Union(Schema.String, Schema.Null),
    amount: Schema.Number,
    interval: Schema.String,
    send_invoices: Schema.Boolean,
    send_sms: Schema.Boolean,
    currency: Schema.String
  }),
  authorization: Schema.Struct({
    authorization_code: Schema.String,
    bin: Schema.String,
    last4: Schema.String,
    exp_month: Schema.String,
    exp_year: Schema.String,
    channel: Schema.String,
    card_type: Schema.String,
    bank: Schema.String,
    country_code: Schema.String,
    brand: Schema.String,
    reusable: Schema.Boolean,
    signature: Schema.String,
    account_name: Schema.String
  }),
  customer: PaystackCustomerSchema,
  created_at: Schema.String,
  updated_at: Schema.String
})

export const WebhookEventSchema = Schema.Struct({
  event: Schema.String,
  data: Schema.Record({ key: Schema.String, value: Schema.Unknown })
})

export type DonationPlan = Schema.Schema.Type<typeof DonationPlanSchema>
export type CreateSubscriptionRequest = Schema.Schema.Type<typeof CreateSubscriptionRequestSchema>
export type PaystackCustomer = Schema.Schema.Type<typeof PaystackCustomerSchema>
export type PaystackSubscription = Schema.Schema.Type<typeof PaystackSubscriptionSchema>
export type WebhookEvent = Schema.Schema.Type<typeof WebhookEventSchema>