"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Heart, Lock } from "lucide-react"
import type { DonationPlan } from "@/lib/schemas"
import { formatAmount } from "@/lib/donation-plans"

interface DonorInfo {
  email: string
  firstName: string
  lastName: string
  phone: string
}

interface DonorInfoFormProps {
  donorInfo: DonorInfo
  onDonorInfoChange: (info: DonorInfo) => void
  selectedPlan: DonationPlan | null
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
  errors: Record<string, string>
}

export function DonorInfoForm({ 
  donorInfo, 
  onDonorInfoChange, 
  selectedPlan, 
  onBack, 
  onSubmit, 
  isLoading, 
  errors 
}: DonorInfoFormProps) {
  const handleInputChange = (field: keyof DonorInfo, value: string) => {
    onDonorInfoChange({ ...donorInfo, [field]: value })
  }

  if (!selectedPlan) return null

  return (
    <Card className="shadow-2xl border-white/20 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Persoonlike Inligting</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Selected Plan Summary */}
        <div className="bg-muted/30 border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Jou gekose bedrag</span>
            <span className="text-sm font-semibold">
              {formatAmount(selectedPlan.amount, selectedPlan.currency)} {selectedPlan.interval === 'monthly' ? 'per maand' : selectedPlan.interval === 'annually' ? 'per jaar' : 'eenmalig'}
            </span>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-xs">Voornaam *</Label>
            <Input
              id="firstName"
              type="text"
              value={donorInfo.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Jan"
              disabled={isLoading}
              className="h-9"
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-xs">Van *</Label>
            <Input
              id="lastName"
              type="text"
              value={donorInfo.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Marais"
              disabled={isLoading}
              className="h-9"
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs">E-pos Adres *</Label>
          <Input
            id="email"
            type="email"
            value={donorInfo.email}
            onChange={(e) => {
              // Don't trim while typing to avoid cursor jumping, but clean up on blur
              handleInputChange("email", e.target.value)
            }}
            onBlur={(e) => {
              // Trim whitespace when user leaves the field
              const trimmedValue = e.target.value.trim()
              if (trimmedValue !== e.target.value) {
                handleInputChange("email", trimmedValue)
              }
            }}
            placeholder="jan.marais@skenker.co.za"
            disabled={isLoading}
            className="h-9"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs">Selfoonnommer *</Label>
          <PhoneInput
            id="phone"
            value={donorInfo.phone}
            onChange={(value) => handleInputChange("phone", value)}
            placeholder="082 832 2321"
            disabled={isLoading}
            externalError={errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        {errors.submit && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1" 
            size="sm"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Button>
          
          <Button 
            onClick={onSubmit}
            className="flex-1" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Verwerk..." : "Skenk"}
            <Lock className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 Veilige betaling aangedryf deur Paystack</p>
          <p className="mt-1">
            Verskeie betaalopsies: Kaarte, Bankoordrag, Mobiele Geld
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 