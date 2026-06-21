# PrithviProof: An Uncertainty-Aware Personal Carbon Audit and Action Verification Assistant

## Overview
PrithviProof is a rigorous, uncertainty-aware tool designed to help individuals understand, track, and genuinely reduce their carbon emissions. It replaces generic carbon calculators with a methodology grounded in evidence, separating actions into distinct lifecycle stages and incorporating confidence intervals into all calculations.

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

### Running the App
Start the development server:
```bash
npm run dev
```
Access the application at `http://localhost:3000`. By default, Judge Demo Mode is enabled, allowing core functionality to work deterministically without external backend dependencies.

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build production application
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript compilation check
- `npm run format`: Format code with Prettier
- `npm run test`: Run Vitest unit tests
- `npm run test:e2e`: Run Playwright end-to-end tests

## Architecture & Tech Stack
- **Framework:** Next.js App Router
- **UI:** React, Tailwind CSS, Lucide Icons
- **Language:** strict TypeScript
- **Validation:** Zod
- **Backend/Auth:** Firebase (optional in Judge Demo mode)
- **Testing:** Vitest, React Testing Library, Playwright

See `docs/BUILD_SPEC.md` for the comprehensive application specification.
