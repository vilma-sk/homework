# E-Commerce Checkout Test Suite

Playwright-based end-to-end tests for an e-commerce checkout flow. Covers product selection, shopping bag verification, form validation, discount codes, and order placement.

## Project Structure

```
src/
  fixture/         # Custom Playwright fixtures (page objects, test context)
  pages/           # Page Object Model classes (HomePage, ProductPage, CheckoutPage, etc.)
  utils/           # Utilities (MoneyUtils, form validation assertions)
tests/
  checkout/        # Test specs
  testdata/        # Test data (expected values, validation inputs)
```

## Prerequisites

- Node.js 18+
- Google Chrome installed

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (if not already present):
   ```bash
   npx playwright install
   ```

3. Create a `.env` file in the project root:
   ```
   HOME_PAGE_URL=https://your-app-url.com/
   ```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests in browser (headed mode)
npm run test:headed

# Run with Playwright UI mode
npx playwright test --ui

# Run a specific test file
npx playwright test tests/checkout/ProductPurchaseFlow.spec.ts

# Run tests by tag
npx playwright test --grep @Smoke
```

## Test Reports

After a test run, open the HTML report:
```bash
npx playwright show-report
```

## Configuration

- **Browser:** Google Chrome
- **Parallel execution:** enabled (`fullyParallel: true`)
- **Retries:** 1 locally, 2 in CI
- **Traces:** captured on first retry
- **Test ID attribute:** `data-qa`

See `playwright.config.ts` for full configuration.
