# StudentePlein Donation Portal

A secure, modern donation platform built for StudentePlein - supporting Afrikaans student life at Stellenbosch University. This Next.js application enables recurring and one-time donations with seamless Paystack integration.

![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)
![Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-orange?logo=cloudflare)

## 🎯 Features

### Core Functionality
- **💰 Flexible Donations**: Monthly, annual, and one-time donation options
- **🔄 Recurring Subscriptions**: Automated recurring donations via Paystack
- **📱 Responsive Design**: Mobile-first, accessible interface
- **🌍 Multilingual**: Afrikaans interface with proper localization
- **⚡ Performance**: Optimized for fast loading and smooth interactions

### Security Features
- **🛡️ Enterprise Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **🔒 Secure Payment Processing**: PCI-compliant Paystack integration
- **✅ Input Validation**: Comprehensive server-side validation with Zod schemas
- **🚨 Webhook Security**: HMAC signature verification for payment webhooks
- **🔐 Type Safety**: Full TypeScript implementation with strict checking

### Developer Experience
- **📁 Modern Architecture**: Next.js App Router with server components
- **🎨 Beautiful UI**: Shadcn/ui components with Tailwind CSS
- **🧪 Effect-Based**: Functional programming with Effect-TS
- **📊 Form Handling**: React Hook Form with validation
- **🔧 Development Tools**: ESLint, TypeScript, hot reload

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Paystack account for payment processing

### Installation

1. **Clone the repository**
   ```bash
   git clone [studenteplein/donation-portal](https://github.com/studenteplein/donation-portal.git)
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create your environment variables in Cloudflare Workers settings or locally:
   ```bash
   # Required for payment processing
   NEXT_PAYSTACK_SECRET_KEY=your_paystack_secret_key
   
   # App configuration
   NEXT_PUBLIC_APP_URL=https://skenk.studenteplein.org.za
   
   # Plan codes (already configured in wrangler.toml)
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
donation-portal/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── subscription/         # Payment processing endpoints
│   │   │   ├── initialize/       # Start payment flow
│   │   │   ├── verify/           # Verify transactions
│   │   │   └── manage/           # Subscription management
│   │   └── webhooks/
│   │       └── paystack/         # Payment webhooks
│   ├── donation/
│   │   └── callback/             # Payment success/failure page
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Homepage with donation flow
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── donation-plans-grid.tsx   # Plan selection interface
│   ├── donor-info-form.tsx       # User information form
│   └── project-showcase.tsx      # Project highlights
├── lib/                          # Utilities and configurations
│   ├── schemas.ts                # Zod validation schemas
│   ├── paystack-service.ts       # Payment service integration
│   ├── donation-plans.ts         # Plan definitions
│   └── utils.ts                  # Helper utilities
├── middleware.ts                 # Security headers and middleware
├── wrangler.toml                 # Cloudflare Workers configuration
└── next.config.ts                # Next.js configuration
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Cloudflare Deployment
npm run preview      # Preview build locally
npm run deploy       # Deploy to Cloudflare
npm run cf-typegen   # Generate Cloudflare types
```

### Code Quality

The project enforces high code quality standards:
- **TypeScript**: Strict type checking enabled
- **ESLint**: Extended Next.js configuration
- **Security**: Comprehensive security headers via middleware
- **Validation**: All inputs validated with Zod schemas

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 15.3.0 |
| **TypeScript** | Type safety and developer experience | 5.0+ |
| **Effect-TS** | Functional programming and error handling | 3.17+ |
| **Tailwind CSS** | Utility-first CSS framework | 4.0+ |
| **Zod** | Schema validation | 4.0+ |
| **React Hook Form** | Form state management | 7.61+ |
| **Paystack** | Payment processing | Latest API |

## 🏗️ Architecture

### Payment Flow
1. **Plan Selection**: User chooses donation amount and frequency
2. **Information Collection**: Secure form with validation
3. **Payment Initialization**: Server-side Paystack transaction creation
4. **Payment Processing**: Redirect to Paystack secure checkout
5. **Verification**: Server-side transaction verification
6. **Confirmation**: Success page with transaction details

### Security Architecture
- **Middleware Security**: Headers applied at edge level
- **Input Validation**: All user inputs validated server-side
- **Payment Security**: Webhook signatures verified with HMAC
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Graceful error boundaries throughout

## 🔒 Security

This application implements enterprise-grade security:

### Security Headers
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security**: Enforces HTTPS
- **Referrer-Policy**: Controls referrer information

### Payment Security
- **PCI Compliance**: No card data stored locally
- **Webhook Verification**: HMAC SHA-512 signature validation
- **Secure Redirects**: Validated callback URLs
- **Data Filtering**: Sensitive data excluded from logs

### Development Security
- **Type Safety**: Prevents runtime type errors
- **Input Validation**: Server-side validation with Zod
- **Error Boundaries**: Graceful error handling
- **Security Auditing**: Regular dependency vulnerability checks

## 🌐 Deployment

### Cloudflare Workers

The application is optimized for Cloudflare Workers deployment:

1. **Build & Deploy**
   ```bash
   npm run deploy
   ```

2. **Environment Variables**
   Set in Cloudflare Workers dashboard:
   - `NEXT_PAYSTACK_SECRET_KEY`: Paystack secret key
   - Plan codes are configured in `wrangler.toml`

3. **Custom Domain**
   Configure custom domain in Cloudflare dashboard pointing to:
   `https://skenk.studenteplein.org.za`

### Performance Optimizations
- **Edge Computing**: Deployed on Cloudflare's global network
- **Static Generation**: Pages pre-rendered where possible
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic bundle optimization

## 🎨 Customization

### Styling
- **Tailwind Config**: Customize theme in `tailwind.config.js`
- **Components**: Modify UI components in `components/ui/`
- **Colors**: Update brand colors in CSS variables

### Content
- **Copy**: Update text content in component files
- **Plans**: Modify donation plans in `lib/donation-plans.ts`
- **Metadata**: Update SEO information in `app/layout.tsx`

### Payment Integration
- **Paystack Plans**: Configure in Paystack dashboard
- **Webhooks**: Update webhook handlers in `app/api/webhooks/`
- **Validation**: Modify schemas in `lib/schemas.ts`

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next .open-next
npm run build
```

**Type Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Payment Issues**
- Verify Paystack API keys are correct
- Check webhook signature verification
- Ensure callback URLs are whitelisted

**Deployment Issues**
- Verify Cloudflare environment variables
- Check wrangler.toml configuration
- Ensure Next.js version compatibility (15.3.0)

### Development Tips
- Use browser dev tools to debug payment flows
- Check server logs for webhook processing
- Test with Paystack test keys before production
- Verify CSP headers don't block required resources

## 📝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Standards
- Follow TypeScript strict mode
- Maintain test coverage
- Use conventional commit messages
- Ensure security best practices

## 📄 License

This project is proprietary to StudentePlein. All rights reserved.

## 🤝 Support

For support, please contact:
- **Technical Issues**: [Create an issue](https://github.com/repository/issues)
- **General Support**: support@studenteplein.com
- **Payment Issues**: Verify with Paystack support

---

**Built with ❤️ for Afrikaanse studentelewe at Stellenbosch University**

*StudentePlein - Ons bou sedert 2020 'n lewenskragtige Afrikaanse studentelewe op Stellenbosch.*