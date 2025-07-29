"use client"

import { Check } from "lucide-react"
import type { DonationPlan } from "@/lib/schemas"
import { formatAmount } from "@/lib/donation-plans"

interface DonationPlanCardProps {
  plan: DonationPlan
  isSelected?: boolean
  onSelect?: (plan: DonationPlan) => void
  isLoading?: boolean
}

export function DonationPlanCard({ plan, isSelected = false, onSelect, isLoading = false }: DonationPlanCardProps) {
  const handleSelect = () => {
    if (onSelect && !isLoading) {
      onSelect(plan)
    }
  }

  return (
    <div
      className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm scale-[1.01]'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={handleSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-primary truncate">
            {formatAmount(plan.amount, plan.currency)}
          </div>
          <div className="text-xs text-muted-foreground">
            {plan.interval === 'monthly' ? 'per maand' : plan.interval === 'annually' ? 'per jaar' : 'eenmalig'}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ml-3 ${
          isSelected
            ? 'border-primary bg-primary'
            : 'border-muted-foreground'
        }`}>
          {isSelected && (
            <Check className="h-3 w-3 text-primary-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}