# Playwright AI E-commerce Tests

Automated end-to-end testing for e-commerce platforms using Playwright and AI-powered tools.

## Overview

This project contains automated test suites for e-commerce websites, starting with Amazon search functionality. Tests are written using the Playwright testing framework and developed with assistance from Playwright MCP and GitHub Copilot.

## Features

- **Amazon Search Test**: Automated test that searches for "iPhone" on Amazon and verifies results contain product listings
- **Playwright Framework**: Modern, reliable browser automation testing framework
- **Cross-browser Support**: Tests can run on Chromium, Firefox, and WebKit browsers

## Prerequisites

- Node.js 16+ installed
- npm package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ChanukyaV/playwright-ai-ecomm-tests.git
cd playwright-ai-ecomm-tests
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

Execute all tests:
```bash
npm test
```

Run tests with detailed output:
```bash
npx playwright test --reporter=line
```

Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

## Test Structure

```
tests/
├── amazon-search.spec.js    # Amazon search and verify test
```

### Test Details

**amazon-search.spec.js**
- Opens Amazon.com
- Searches for "Iphone" in the search box
- Verifies search results contain iPhone products

## Tools Used

- **Playwright**: Cross-browser automation testing framework
- **Playwright MCP**: For DOM element inspection and locator discovery
- **GitHub Copilot**: AI-powered code generation and testing assistance

## Author

**ChanukyaV** <mail2chanu@gmail.com>

## License

ISC

## Repository

https://github.com/ChanukyaV/playwright-ai-ecomm-tests

---

*Created with Playwright MCP and GitHub Copilot*
