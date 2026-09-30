# Deployment & Environment Configuration
## GemiPrompts.store — Production Build Pipelines

> Part of the 60-deployment module. Controls builds, environment variables, and ingress configurations.

---

## 1. Environment Declarations (`.env.example`)

Every environment secret must be fully cataloged inside `.env.example` without placing real key values in version control:

```env
# Supabase Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Server Configurations
PORT=3000
NODE_ENV=production

# Server Secrets
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
```

---

## 2. Full-Stack Production Builds (Express + Vite)

When deploying full-stack architectures:
- **Build Step:** Server code is bundled with `esbuild` into a single, compiled file `dist/server.cjs` to eliminate ES module import runtime errors.
  `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
- **Start Step:** Boots cleanly via `node dist/server.cjs`.

---

## 3. Host and Port Constraints

- In compliance with Cloud Run and local container ingress architectures, all servers **must bind to host 0.0.0.0 and port 3000 exclusively**.
- Never configure dev environments on ports like 3001 or 5173 without proxying them straight back to 3000 inside `server.ts`.
- Set `NODE_ENV=production` on release deployments to disable Hot Module Replacement (HMR) and serve optimized asset bundles.
