"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { DonationPlanCard } from "./donation-plan-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MONTHLY_PLANS, ANNUAL_PLANS, ONE_OFF_PLANS } from "@/lib/donation-plans"
import type { DonationPlan } from "@/lib/schemas"

interface DonationPlansGridProps {
  onPlanSelect?: (plan: DonationPlan) => void
  selectedPlan?: DonationPlan | null
  onNext?: () => void
  errors?: Record<string, string>
}

export function DonationPlansGrid({ onPlanSelect, selectedPlan, onNext, errors }: DonationPlansGridProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "annual" | "one-off">("one-off")

  const activePlans = activeTab === "monthly" ? MONTHLY_PLANS 
    : activeTab === "annual" ? ANNUAL_PLANS 
    : ONE_OFF_PLANS

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Kies Jou Impak</CardTitle>
          <CardDescription>
            Kies 'n eenmalige, maandeliks of jaarlikse donasie wat jou pas.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center mb-8">
            <div className="flex border border-border/50 rounded-full p-1 bg-muted/50 backdrop-blur-sm shadow-inner">
              <Button
                variant={activeTab === "one-off" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("one-off")}
                className="rounded-full px-4 text-xs"
              >
                Eenmalig
              </Button>
              <Button
                variant={activeTab === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("monthly")}
                className="rounded-full px-4 text-xs"
              >
                Maandeliks
              </Button>
              <Button
                variant={activeTab === "annual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("annual")}
                className="rounded-full px-4 text-xs"
              >
                Jaarliks
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {activePlans.map((plan) => (
              <DonationPlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={onPlanSelect}
              />
            ))}
          </div>

          {activeTab === "monthly" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Maandelikse planne verskaf volgehoue ondersteuning vir studente met voorspelbare impak
              </p>
            </div>
          )}

          {activeTab === "annual" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Jaarlikse planne help om verwerkingskoste te verminder en volgehoue ondersteuning te bied
              </p>
            </div>
          )}

          {activeTab === "one-off" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Maak 'n eenmalige donasie om studente te ondersteun sonder langtermynverpligting
              </p>
            </div>
          )}

          {errors?.plan && (
            <div className="mt-4 text-center">
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{errors.plan}</p>
            </div>
          )}

          {selectedPlan && onNext && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={onNext}
                size="sm"
              >
                Volgende Stap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 