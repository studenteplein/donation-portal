import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Content Security Policy - Allow Next.js functionality while maintaining security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.paystack.co *.paystack.co",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com data:",
    "img-src 'self' data: https: *.paystack.co",
    "connect-src 'self' api.paystack.co *.paystack.co",
    "frame-src 'self' js.paystack.co *.paystack.co",
    "form-action 'self' *.paystack.co",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ')
  
  // Only apply CSP in production to avoid development issues
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', csp)
  }
  
  // Additional security headers
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  return response
}

export const config = {
  // Apply middleware to specific routes to avoid interfering with Next.js internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}