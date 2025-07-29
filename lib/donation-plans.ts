import type { DonationPlan } from "./schemas"

export const MONTHLY_PLANS: DonationPlan[] = [
  {
    id: "monthly-100",
    name: "R100 Monthly",
    amount: 100,
    currency: "ZAR",
    interval: "monthly",
    planCode: process.env.NEXT_PUBLIC_PLAN_MONTHLY_100 || "PLN_6esb90pg4anp9zq",
    description: "Support with R100 monthly"
  },
  {
    id: "monthly-200",
    name: "R200 Monthly",
    amount: 200,
    currency: "ZAR",
    interval: "monthly",
    planCode: process.env.NEXT_PUBLIC_PLAN_MONTHLY_200 || "PLN_gbdvu0avcfc0pam",
    description: "Support with R200 monthly"
  },
  {
    id: "monthly-500",
    name: "R500 Monthly",
    amount: 500,
    currency: "ZAR",
    interval: "monthly",
    planCode: process.env.NEXT_PUBLIC_PLAN_MONTHLY_500 || "PLN_cxf9b3batni3vbw",
    description: "Support with R500 monthly"
  },
  {
    id: "monthly-1000",
    name: "R1,000 Monthly",
    amount: 1000,
    currency: "ZAR",
    interval: "monthly",
    planCode: process.env.NEXT_PUBLIC_PLAN_MONTHLY_1000 || "PLN_pjim6eus6gb4cps",
    description: "Support with R1,000 monthly"
  },
  {
    id: "monthly-2000",
    name: "R2,000 Monthly",
    amount: 2000,
    currency: "ZAR",
    interval: "monthly",
    planCode: process.env.NEXT_PUBLIC_PLAN_MONTHLY_2000 || "PLN_3qmpozj5pw7zywn",
    description: "Support with R2,000 monthly"
  },
  {
    id: "monthly-5000",
    name: "R5,000 Monthly",
    amount: 5000,
    currency: "ZAR",
    interval: "monthly",
    planCode: process.env.NEXT_PUBLIC_PLAN_MONTHLY_5000 || "PLN_wbvihpcg770t4et",
    description: "Support with R5,000 monthly"
  }
]

export const ANNUAL_PLANS: DonationPlan[] = [
  {
    id: "annual-1200",
    name: "R1,200 Annually",
    amount: 1200,
    currency: "ZAR",
    interval: "annually",
    planCode: process.env.NEXT_PUBLIC_PLAN_ANNUAL_1200 || "PLN_95wv2r523jlipyo",
    description: "Support with R1,200 annually"
  },
  {
    id: "annual-2400",
    name: "R2,400 Annually",
    amount: 2400,
    currency: "ZAR",
    interval: "annually",
    planCode: process.env.NEXT_PUBLIC_PLAN_ANNUAL_2400 || "PLN_71kwj3au6tcys9p",
    description: "Support with R2,400 annually"
  },
  {
    id: "annual-6000",
    name: "R6,000 Annually",
    amount: 6000,
    currency: "ZAR",
    interval: "annually",
    planCode: process.env.NEXT_PUBLIC_PLAN_ANNUAL_6000 || "PLN_zc8fhee0zlrwtqf",
    description: "Support with R6,000 annually"
  },
  {
    id: "annual-12000",
    name: "R12,000 Annually",
    amount: 12000,
    currency: "ZAR",
    interval: "annually",
    planCode: process.env.NEXT_PUBLIC_PLAN_ANNUAL_12000 || "PLN_bm2ybbv7m421xbv",
    description: "Support with R12,000 annually"
  },
  {
    id: "annual-15000",
    name: "R15,000 Annually",
    amount: 15000,
    currency: "ZAR",
    interval: "annually",
    planCode: process.env.NEXT_PUBLIC_PLAN_ANNUAL_15000 || "PLN_2yp34fcr8vj03j5",
    description: "Support with R15,000 annually"
  },
  {
    id: "annual-20000",
    name: "R20,000 Annually",
    amount: 20000,
    currency: "ZAR",
    interval: "annually",
    planCode: process.env.NEXT_PUBLIC_PLAN_ANNUAL_20000 || "PLN_ecx205ldzx198yh",
    description: "Support with R20,000 annually"
  }
]

export const ONE_OFF_PLANS: DonationPlan[] = [
  {
    id: "one-off-1000",
    name: "R1,000 One-Off",
    amount: 1000,
    currency: "ZAR",
    interval: "one-off",
    description: "Support with R1,000 one-time donation"
  },
  {
    id: "one-off-2000",
    name: "R2,000 One-Off",
    amount: 2000,
    currency: "ZAR",
    interval: "one-off",
    description: "Support with R2,000 one-time donation"
  },
  {
    id: "one-off-3000",
    name: "R3,000 One-Off",
    amount: 3000,
    currency: "ZAR",
    interval: "one-off",
    description: "Support with R3,000 one-time donation"
  },
  {
    id: "one-off-4000",
    name: "R4,000 One-Off",
    amount: 4000,
    currency: "ZAR",
    interval: "one-off",
    description: "Support with R4,000 one-time donation"
  },
  {
    id: "one-off-5000",
    name: "R5,000 One-Off",
    amount: 5000,
    currency: "ZAR",
    interval: "one-off",
    description: "Support with R5,000 one-time donation"
  },
  {
    id: "one-off-10000",
    name: "R10,000 One-Off",
    amount: 10000,
    currency: "ZAR",
    interval: "one-off",
    description: "Support with R10,000 one-time donation"
  }
]

export const ALL_PLANS = [...MONTHLY_PLANS, ...ANNUAL_PLANS, ...ONE_OFF_PLANS]

export const getPlanByCode = (planCode: string): DonationPlan | undefined => {
  return ALL_PLANS.find(plan => plan.planCode === planCode)
}

export const getPlanById = (id: string): DonationPlan | undefined => {
  return ALL_PLANS.find(plan => plan.id === id)
}

export const formatAmount = (amount: number, currency: string = "ZAR"): string => {
  // Use en-US locale for consistent formatting across server and client
  // This ensures no hydration mismatches
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("ZAR", "R")
}