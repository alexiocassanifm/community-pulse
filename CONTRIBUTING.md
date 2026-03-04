# Contributing

Thanks for your interest in contributing to this project!

Please note that this project follows a standard [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold it.

## Getting Started

1. Fork the repository
2. Clone your fork and install dependencies (`npm install`)
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
4. Run the dev server (`npm run dev`)

## Development

- **Code style**: TypeScript strict mode, ESLint enforced. Run `npm run lint` before submitting.
- **File naming**: kebab-case for files (`my-component.tsx`), PascalCase for component exports (`MyComponent`).
- **Commits**: Use conventional-style messages (e.g., `feat:`, `fix:`, `docs:`).
- **Testing**: Playwright E2E tests live in `e2e/`. Run with `npm run test:e2e`.

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint`, `npm run build`, and `npm run test:e2e` to verify everything passes
4. Open a PR with a clear description of what changed and why

## Reporting Issues

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, browser)
