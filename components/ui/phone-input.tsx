import * as React from "react"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends Omit<React.ComponentProps<"input">, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  onValidationError?: (error: string | null) => void
  externalError?: string
}

function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digitsOnly = value.replace(/\D/g, '')
  
  // Limit to 10 digits
  const limited = digitsOnly.slice(0, 10)
  
  // Format: 082 832 2321
  if (limited.length <= 3) {
    return limited
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`
  } else {
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
  }
}

function validatePhoneNumber(value: string): string | null {
  const digitsOnly = value.replace(/\D/g, '')
  
  if (digitsOnly.length === 0) {
    return 'Selfoonnommer word vereis'
  }
  
  if (!digitsOnly.startsWith('0')) {
    return 'Selfoonnommer moet begin met 0'
  }
  
  if (digitsOnly.length < 10) {
    return 'Selfoonnommer moet 10 syfers wees'
  }
  
  return null
}

function PhoneInput({ 
  className, 
  value, 
  onChange, 
  onValidationError,
  externalError,
  disabled,
  ...props 
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = React.useState(formatPhoneNumber(value))
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setDisplayValue(formatPhoneNumber(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPhoneNumber(inputValue)
    const digitsOnly = inputValue.replace(/\D/g, '')
    
    setDisplayValue(formatted)
    onChange(digitsOnly)
    
    // Validate and set error
    const validationError = validatePhoneNumber(formatted)
    setError(validationError)
    onValidationError?.(validationError)
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {/* South African Flag */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <span className="text-base">🇿🇦</span>
        </div>
        
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent pl-12 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            (externalError || error) 
              ? "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-destructive" 
              : "",
            className
          )}
          {...props}
        />
      </div>
      
      {(externalError || (!externalError && error)) && (
        <p className="text-xs text-destructive mt-1">{externalError || error}</p>
      )}
    </div>
  )
}

export { PhoneInput } 