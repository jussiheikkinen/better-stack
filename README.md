# Better Stack

A modern full-stack template featuring SSR, Rsbuild, Tailwind CSS, Rstest, and Better Auth.

## Why Better Stack?
 
Better Stack provides a modern alternative to Next.js with:
- **Faster builds** with Rsbuild
- **Simpler auth** with Better Auth
- **Modern tooling** (Biome, Rstest, Tailwind 4.x)
- **SSR support** with React 19

## Setup

```bash
# Syntax: pnpm dlx degit <user>/<repo> <target-folder>
pnpm dlx degit jussiheikkinen/better-stack app-shell
```

Install the dependencies:

```bash
pnpm install
```

Configure environment variables:

```bash
cp .env.local.example .env.local
# Add your GitHub OAuth credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For production, change to your domain
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000).

```bash
pnpm run dev
```

Build the app for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## Testing

Run tests:

```bash
pnpm run test
```

Run tests in watch mode:

```bash
pnpm run test:watch
```

## Code Quality

Lint and format code:

```bash
pnpm run check    # Biome check and fix
pnpm run format   # Biome format
```

## Architecture

- **SSR**: Server-side rendering with React 19 and React Router
- **Build**: Rsbuild with separate web and node environments
- **Auth**: Better Auth with GitHub OAuth integration
- **Styling**: Tailwind CSS 4.x
- **Testing**: Rstest with React Testing Library
- **Code Quality**: Biome for linting and formatting

### Medium Priority
- [ ] **Test Coverage**: Expand test coverage for authentication flows and API routes
- [ ] **Component Integration**: Add comprehensive SSR/CSR hydration tests
- [ ] **Performance Monitoring**: Add performance metrics and monitoring
- [ ] **Documentation**: Create comprehensive API documentation and deployment guides

### Low Priority
- [ ] **Micro-frontend Architecture**: Evaluate module federation for team scaling
- [ ] **Advanced Caching**: Implement advanced caching strategies for static assets
- [ ] **Accessibility**: Conduct full accessibility audit and improvements
- [ ] **Internationalization**: Add i18n support for multiple languages

## Learn more

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs
- [Better Auth documentation](https://better-auth.com) - authentication features
- [React Router documentation](https://reactrouter.com) - routing and navigation
