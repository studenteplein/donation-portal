"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Heart, Mail, CreditCard } from "lucide-react"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [transactionData, setTransactionData] = useState<any>(null)

  useEffect(() => {
    const reference = searchParams.get("reference")
    const trxref = searchParams.get("trxref")
    
    const txRef = reference || trxref

    if (!txRef) {
      setStatus("error")
      setMessage("Geen transaksieverwysing gevind nie")
      return
    }

    verifyTransaction(txRef)
  }, [searchParams])

  const verifyTransaction = async (reference: string) => {
    try {
      const response = await fetch(`/api/subscription/verify?reference=${reference}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transaction verification failed")
      }

      if (data.status === "success") {
        setStatus("success")
        const isSubscription = data.transaction.plan
        setMessage(isSubscription 
          ? "Jou herhalende skenking is suksesvol opgestel!" 
          : "Jou skenking is suksesvol verwerk!")
        
        // Only store non-sensitive data needed for UI
        const safeTransactionData = {
          amount: data.transaction.amount,
          currency: data.transaction.currency,
          reference: data.transaction.reference,
          plan: data.transaction.plan,
          customer: {
            email: data.transaction.customer?.email
          },
          metadata: {
            plan_interval: data.transaction.metadata?.plan_interval
          }
        }
        
        setTransactionData(safeTransactionData)
      } else {
        setStatus("error")
        setMessage(data.gateway_response || "Betaling was nie suksesvol nie")
      }
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Iets het verkeerd gegaan")
    }
  }

  const handleContinue = () => {
    router.push("/")
  }

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Jou betaling word geverifieer...</h2>
              <p className="text-muted-foreground">Wag asseblief terwyl ons jou transaksie bevestig</p>
            </div>
          </div>
        )

      case "success":
        const isSubscription = transactionData?.plan
        const planInterval = transactionData?.metadata?.plan_interval
        const donationAmount = transactionData ? new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: transactionData.currency || "ZAR",
          minimumFractionDigits: 0,
        }).format(transactionData.amount / 100) : ""

        const getFrequencyText = () => {
          if (!isSubscription) return null
          switch (planInterval) {
            case "monthly": return "Maandeliks"
            case "annually": return "Jaarliks"
            default: return "Herhalend"
          }
        }

        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full"></div>
              </div>
              <Heart className="h-12 w-12 mx-auto text-primary relative z-10 mt-4 fill-current" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">
                Baie dankie!
              </h2>
              <p className="text-lg font-medium text-foreground">
                {message}
              </p>
      
            </div>
            
            {transactionData && (
              <div className="bg-gradient-to-r from-muted/50 to-secondary/50 p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Opsomming:
                  </h3>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-medium text-foreground">Bedrag</span>
                    <span className="text-xl font-bold text-primary">{donationAmount}</span>
                  </div>
                  
                  {isSubscription && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="font-medium text-foreground">Frekwensie</span>
                      <span className="text-muted-foreground">{getFrequencyText()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-medium text-foreground">E-posadres</span>
                    <span className="text-muted-foreground">{transactionData.customer?.email}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-foreground">Verwysing</span>
                    <span className="text-sm text-muted-foreground font-mono">{transactionData.reference}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Mail className="h-4 w-4" />
                <p className="text-sm">
                  Jy sal 'n bevestigingse-pos ontvang.
                </p>
              </div>
              
              {isSubscription && (
                <div className="bg-secondary p-4 rounded-lg border border-border">
                  <p className="text-sm text-secondary-foreground">
                    <strong>Herhalende betaling:</strong> Jou kaart sal {planInterval === "annually" ? "jaarliks" : "maandeliks"} met {donationAmount} gedebiteer word. 
                    Jy kan jou inskrywing te eniger tyd bestuur of kanselleer via die e-pos wat ons stuur.
                  </p>
                </div>
              )}
              
              <Button onClick={handleContinue} className="w-full">
                Terug na Tuisblad
              </Button>
            </div>
          </div>
        )

      case "error":
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-destructive/10 rounded-full"></div>
              </div>
              <XCircle className="h-12 w-12 mx-auto text-destructive relative z-10 mt-4" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-destructive">
                Betaling Onsuksesvol
              </h2>
              <p className="text-lg font-medium text-foreground">
                Ons kon nie jou skenking verwerk nie
              </p>
              <p className="text-destructive font-medium">
                {message}
              </p>
            </div>
            
            <div className="bg-destructive/5 p-6 rounded-xl border border-destructive/20">
              <h3 className="font-semibold text-foreground mb-3">
                Wat het gebeur?
              </h3>
              <div className="text-sm text-muted-foreground space-y-2 text-left">
                <p>• Jou kaart is nie gedebiteer nie</p>
                <p>• Geen skenking is verwerk nie</p>
                <p>• Jy kan veilig weer probeer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">
                  Algemene oplossings:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Gaan jou kaartbesonderhede na en probeer weer</li>
                  <li>• Maak seker jy het voldoende fondse</li>
                  <li>• Kontak jou bank as die probleem voortduur</li>
                  <li>• Probeer 'n ander betalingsmetode</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button onClick={handleContinue} className="w-full">
                  Probeer Weer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "mailto:support@studenteplein.com"}
                  className="w-full"
                >
                  Kontak Ondersteuning
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getCardTitle = () => {
    switch (status) {
      case "success": return "Skenking Voltooi"
      case "error": return "Betalingsprobleem"
      default: return "Betaling word verwerk..."
    }
  }

  const getCardDescription = () => {
    switch (status) {
      case "success": return "Jy dra nou by tot 'n lewenskragtige Afrikaanse studentelewe op Stellenbosch."
      case "error": return "Kom ons maak dit reg..."
      default: return "Jou skenkingtransaksie word geverifieer"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-slate-100 dark:from-slate-900 dark:via-background dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getCardTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getCardDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-slate-100 dark:from-slate-900 dark:via-background dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Betaling word verwerk...</CardTitle>
            <CardDescription className="text-base">
              Jou skenkingtransaksie word geverifieer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Wag asseblief terwyl ons jou betaling verwerk...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}