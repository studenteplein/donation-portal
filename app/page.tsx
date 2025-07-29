"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { BookOpen, Trophy, Users, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DonationPlansGrid } from "@/components/donation-plans-grid"
import { DonorInfoForm } from "@/components/donor-info-form"
import { Logo } from "@/components/logo"
import { ProjectShowcase } from "@/components/project-showcase"
import type { DonationPlan } from "@/lib/schemas"

declare global {
  interface Window {
    PaystackPop: unknown
  }
}

export default function DonationPortal() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<DonationPlan | null>(null)
  const [donorInfo, setDonorInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDonationFocused, setIsDonationFocused] = useState(false)
  const [manuallyFocused, setManuallyFocused] = useState(false)
  
  const donationSectionRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const isDonationFocusedRef = useRef(isDonationFocused)
  const manuallyFocusedRef = useRef(manuallyFocused)
  const stableDonationPositionRef = useRef<number | null>(null)

  // Update refs when state changes
  useEffect(() => {
    isDonationFocusedRef.current = isDonationFocused
  }, [isDonationFocused])

  useEffect(() => {
    manuallyFocusedRef.current = manuallyFocused
  }, [manuallyFocused])

  // Simple on/off switch based on scroll position
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const donationElement = donationSectionRef.current
    
    if (!donationElement) return
    
    // Calculate stable position only when form is NOT focused (not transformed)
    if (!isDonationFocusedRef.current && stableDonationPositionRef.current === null) {
      const donationRect = donationElement.getBoundingClientRect()
      stableDonationPositionRef.current = scrollY + donationRect.top
    }
    
    // Use the stable position for all calculations
    const stableDonationTop = stableDonationPositionRef.current
    if (stableDonationTop === null) return
    
    // Simple thresholds - more reasonable for user scrolling
    const focusThreshold = stableDonationTop - 500  // Focus when 500px before donation form
    const unfocusThreshold = stableDonationTop - 600 // Unfocus when 600px before donation form
    
    console.log(`Scroll: ${scrollY}px, isDonationFocused: ${isDonationFocusedRef.current}`)
    console.log(`Stable donation top: ${stableDonationTop}, Focus at: ${focusThreshold}, Unfocus at: ${unfocusThreshold}`)
    
    // Simple on/off switch - enable focus on all devices but control scrolling behavior
    if (!isDonationFocusedRef.current && !manuallyFocusedRef.current && scrollY > focusThreshold) {
      console.log('🔴 FOCUS ON - scrolled past focus threshold')
      setIsDonationFocused(true)
      
      const isMobile = window.innerWidth < 640
      if (isMobile) {
        // On mobile, scroll to donation form position to position it at top of viewport
        setTimeout(() => {
          donationElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          })
        }, 200)
      } else {
        // Desktop behavior remains unchanged
        setTimeout(() => {
          donationElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          })
        }, 200)
      }
    } 
    else if (isDonationFocusedRef.current && scrollY < unfocusThreshold) {
      console.log('🟢 FOCUS OFF - scrolled above unfocus threshold')
      setIsDonationFocused(false)
      setManuallyFocused(false) // Reset manual flag
      // Reset stable position so it can be recalculated when needed
      stableDonationPositionRef.current = null
    }
  }, [])

  // Simplified scroll detection for better reliability
  useEffect(() => {
    // Add scroll event listener with throttling
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [handleScroll])

  const projects = [
    {
      icon: BookOpen,
      title: "Parallele leersisteem in Afrikaans",
      description: "Ons ondersteun 1000+ lede met studies in Afrikaans"
    },
    {
      icon: Trophy,
      title: "Debatvereniging",
      description: "2024 en 2025 nasionale debatkampioene"
    },
    {
      icon: Star,
      title: "Sosiale ekosisteem",
      description: "Studente mag weer sokkie en lag in Afrikaans."
    }
  ]

  const validateStep1 = () => {
    if (!selectedPlan) {
      setErrors({ plan: "Kies asseblief 'n donasiebedrag" })
      return false
    }
    setErrors({})
    return true
  }

  const validateEmail = (email: string): string | null => {
    // Trim whitespace
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
      return "E-pos word vereis"
    }
    
    // More comprehensive email regex that matches RFC 5322 specification
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(trimmedEmail)) {
      return "Voorsien asseblief 'n geldige e-posadres"
    }
    
    // Additional checks for common issues
    if (trimmedEmail.length > 254) {
      return "E-posadres is te lank"
    }
    
    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return "E-posadres mag nie begin of eindig met 'n punt nie"
    }
    
    if (trimmedEmail.includes('..')) {
      return "E-posadres mag nie opeenvolgende punte hê nie"
    }
    
    const [localPart, domain] = trimmedEmail.split('@')
    if (localPart.length > 64) {
      return "E-posadres gebruikernaam is te lank"
    }
    
    if (!domain || domain.length < 4) {
      return "Voorsien asseblief 'n geldige domein"
    }
    
    // Check for valid TLD (at least 2 characters)
    const domainParts = domain.split('.')
    const tld = domainParts[domainParts.length - 1]
    if (!tld || tld.length < 2) {
      return "Voorsien asseblief 'n geldige domein uitbreiding"
    }
    
    return null
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    const emailError = validateEmail(donorInfo.email)
    if (emailError) {
      newErrors.email = emailError
    }

    if (!donorInfo.firstName.trim()) {
      newErrors.firstName = "Voornaam word vereis"
    }

    if (!donorInfo.lastName.trim()) {
      newErrors.lastName = "Van word vereis"
    }

    // Phone validation
    const phoneDigitsOnly = donorInfo.phone.replace(/\D/g, '')
    if (!phoneDigitsOnly) {
      newErrors.phone = "Selfoonnommer word vereis"
    } else if (!phoneDigitsOnly.startsWith('0')) {
      newErrors.phone = "Selfoonnommer moet begin met 0"
    } else if (phoneDigitsOnly.length < 10) {
      newErrors.phone = "Selfoonnommer moet 10 syfers wees"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handlePlanSelect = (plan: DonationPlan) => {
    setSelectedPlan(plan)
    setErrors(prev => ({ ...prev, plan: "" }))
  }

  const handleDonorInfoChange = (info: typeof donorInfo) => {
    setDonorInfo(info)
    // Clear errors when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.email
      delete newErrors.firstName
      delete newErrors.lastName
      delete newErrors.phone
      return newErrors
    })
  }

  const handleDonate = async () => {
    if (!validateStep2() || !selectedPlan) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/subscription/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: donorInfo.email.trim(),
          planId: selectedPlan.id,
          firstName: donorInfo.firstName.trim(),
          lastName: donorInfo.lastName.trim(),
          phone: donorInfo.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect to Paystack
      window.location.href = data.authorization_url

    } catch (error) {
      console.error("Payment initialization error:", error)
      setErrors({ 
        submit: error instanceof Error ? error.message : "Payment initialization failed. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 transition-all duration-700 relative">
      {/* Overlay when donation form is focused */}
      {isDonationFocused && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 transition-all duration-700" />
      )}
      
      {/* Header with Logo */}
      <div className={`absolute top-0 left-0 z-50 p-2 sm:p-4 md:p-6 transition-all duration-700 ${
        isDonationFocused ? 'opacity-60 scale-90' : 'opacity-90'
      }`}>
        <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="w-[120px] h-[51px] sm:w-[140px] sm:h-[60px] md:w-[160px] md:h-[68px]">
            <Logo 
              className="w-full h-full drop-shadow-2xl filter brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-300" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div 
        ref={heroSectionRef}
        className={`relative overflow-hidden rounded-br-[3rem] lg:rounded-br-[4rem] transition-all duration-700 ease-in-out hero-blur-transition ${
          isDonationFocused 
            ? 'transform -translate-y-12 scale-95 opacity-30 blur-sm' 
            : 'transform translate-y-0 scale-100 opacity-100'
        }`}
        style={{
          backgroundImage: `url('/hero.JPG')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Creative overlay blend */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#183340]/95 via-slate-900/80 to-[#183340]/70 rounded-br-[3rem] lg:rounded-br-[4rem]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 rounded-br-[3rem] lg:rounded-br-[4rem]"></div>
        
        {/* Subtle pattern overlay for texture */}
        <div className="absolute inset-0 opacity-20 rounded-br-[3rem] lg:rounded-br-[4rem]" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #183340 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white shadow-lg">
              WORD 'N SKENKER
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-medium text-white mb-8 leading-tight">
              Bou saam aan 'n <strong>Lewenskragtige Afrikaanse Studentelewe</strong> op Stellenbosch
            </h1>
            <p className="text-xl lg:text-2xl text-gray-100 mb-12 leading-relaxed">
              Ons bou sedert 2020 'n <strong>lewenskragtige Afrikaanse studentelewe op Stellenbosch. Help ons asseblief om dit te versterk.</strong> 
            </p>
            
            {/* Project Showcase */}
            <ProjectShowcase projects={projects} />
            
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed mb-0">
              StudentePlein is 'n nie-winsgewende organisasie, gestig deur oud-Maties. Ons is onafhanklik en doen ons eie ding.
            </p>
            
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div 
        className={`transition-all duration-700 ease-in-out ${
          isDonationFocused 
            ? 'min-h-screen flex items-center justify-center p-0 sm:py-8' 
            : ''
        }`}
      >
        <div 
          ref={donationSectionRef}
          id="donation-form" 
          className={`relative bg-gradient-to-b from-slate-50/90 via-white/80 to-slate-100/90 dark:from-slate-900/95 dark:via-gray-900/90 dark:to-slate-800/95 backdrop-blur-sm shadow-2xl transition-all duration-700 ease-in-out w-full max-w-4xl mx-auto ${
            isDonationFocused 
              ? 'min-h-screen sm:min-h-fit sm:transform sm:scale-110 sm:shadow-3xl bg-white sm:bg-white/98 dark:bg-gray-900 sm:dark:bg-gray-900/98 sm:rounded-3xl sm:relative z-50' 
              : 'transform scale-100 min-h-fit'
          }`}
        >
        <div className={`transition-all duration-700 flex-1 flex flex-col w-full ${
          isDonationFocused 
            ? 'min-h-screen flex justify-center items-center p-4 sm:container sm:mx-auto sm:px-4 sm:py-12 sm:px-8 sm:justify-start sm:items-start sm:min-h-fit' 
            : 'container mx-auto px-4 py-8 sm:py-12 lg:py-16 pb-12 sm:pb-16'
        }`}>
          <div className={`${isDonationFocused ? 'w-full sm:max-w-2xl sm:mx-auto' : 'max-w-2xl mx-auto'}`}>
            {/* Progress Indicators */}
            <div className={`flex justify-center ${isDonationFocused ? 'mb-2 sm:mb-6 lg:mb-8' : 'mb-4 sm:mb-6 lg:mb-8'}`}>
              <div className={`flex items-center ${isDonationFocused ? 'space-x-2 sm:space-x-4' : 'space-x-4'}`}>
                <div className="flex items-center">
                  <div className={`${isDonationFocused ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8'} rounded-full flex items-center justify-center ${isDonationFocused ? 'text-xs sm:text-sm' : 'text-sm'} font-medium ${
                    currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    1
                  </div>
                  <span className={`ml-2 ${isDonationFocused ? 'text-xs sm:text-sm' : 'text-sm'} font-medium`}>Kies Bedrag</span>
                </div>
                
                <div className={`${isDonationFocused ? 'w-6 sm:w-12' : 'w-12'} h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                
                <div className="flex items-center">
                  <div className={`${isDonationFocused ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8'} rounded-full flex items-center justify-center ${isDonationFocused ? 'text-xs sm:text-sm' : 'text-sm'} font-medium ${
                    currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className={`ml-2 ${isDonationFocused ? 'text-xs sm:text-sm' : 'text-sm'} font-medium`}>Jou Besonderhede</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="relative transition-all duration-500">
              {/* Step 1: Plan Selection */}
              {currentStep === 1 && (
                <div className="transition-all duration-500 ease-in-out">
                  <DonationPlansGrid 
                    onPlanSelect={handlePlanSelect}
                    selectedPlan={selectedPlan}
                    onNext={handleNextStep}
                    errors={errors}
                  />
                </div>
              )}

              {/* Step 2: Donor Information */}
              {currentStep === 2 && (
                <div className="transition-all duration-500 ease-in-out">
                  <DonorInfoForm
                  donorInfo={donorInfo}
                  onDonorInfoChange={handleDonorInfoChange}
                  selectedPlan={selectedPlan}
                  onBack={handlePrevStep}
                  onSubmit={handleDonate}
                  isLoading={isLoading}
                  errors={errors}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}