# My House Maker

## Overview

The My House Maker is a sample application built to spotlight LaunchDarkly’s most impactful 'day 1" use cases. Key user actions are toggled by a feature flag so product teams can deliver value safely and iteratively. We gate the AI Builder behind the flag `buildWithAi` to roll out transformational experiences to targeted individules, we graduate customers into premium support with `premiumSupport`, and we vet new AI models via `modelSelectionGemini25Pro` before promoting them broadly. These patterns illustrate why LaunchDarkly matters: teams can test, segment, and control exposure in production without redeploying, reducing risk, accelerating feedback loops, and letting marketing, product, and customer success coordinate launches in real time.

## Core Features

- Personalized onboarding and authentication backed by Supabase.
- Room customization with curated presets and contextual upsells.
- AI Builder that generates recommended room designs from natural-language prompts.
- Shopping cart, checkout, and pricing workflows that persist for signed-in and guest users.
- Live chat helper surfaced only to users provisioned with LaunchDarkly's premium support flag.

## Tech Stack

- Vite
- TypeScript
- React
- launchdarkly-react-client-sdk
- shadcn-ui
- Tailwind CSS
- Supabase

## LaunchDarkly Integration

LaunchDarkly powers progressive delivery throughout the app:

- `buildWithAi` toggles access to the AI Builder entry point on the customization page.
- `modelSelectionGemini25Pro` unlocks the Gemini 2.5 Pro model inside the AI Builder.
- `premium-support` (consumed via the SDK as `premiumSupport`) gates live chat support and related premium messaging.

### Required Feature Flags

| Flag key | Suggested variations | Default | Where it is used |
| --- | --- | --- | --- |
| `buildWithAi` | `true` / `false` | `true` in staging, `false` in production until rollout | Controls the “Build with AI” CTA in `src/pages/Customize.tsx`. |
| `modelSelectionGemini25Pro` | `true` / `false` | `false` | Shows the Gemini 2.5 Pro option in `src/pages/AIBuilder.tsx`. |
| `premium-support` | `true` / `false` | `false` | Enables live chat access in `src/App.tsx` and `src/pages/Settings.tsx`. For hook-based access, expose to React as `premiumSupport`. |

> **Note:** When using `useFlags`, LaunchDarkly maps hyphenated keys to camelCase properties (for example, `premium-support` becomes `flags.premiumSupport`). Direct SDK calls should still reference the canonical flag key (`premium-support`).

### Configure LaunchDarkly

1. Create (or reuse) a LaunchDarkly project for My House Maker.
2. Add environments as needed (for example, `production`, `staging`, `development`).
3. Within each environment, create the feature flags shown above. Use the recommended defaults and document targeting rules for premium users or internal testers.
4. Add the Supabase-authenticated users (by email) or segments that should receive premium features.
5. Confirm each flag returns the expected variation through the LaunchDarkly debugger or by inspecting the in-app console logs.

### Retrieve the Client-side SDK Key

1. Open LaunchDarkly and navigate to the project you configured.
2. Choose **Project settings** → **Environments**.
3. For each environment, use **Show SDK keys** to reveal credentials and copy the **Client-side ID** (`clientSideID`).  
   See the LaunchDarkly docs for the full walkthrough: [View SDK credentials](https://launchdarkly.com/docs/home/account/environment/keys#view-sdk-credentials).
4. Store the ID in `VITE_LAUNCHDARKLY_CLIENT_SIDE_ID` for the environment you are targeting.

## Environment Variables

Create a `.env` file (or configure Codespaces secrets) with the following minimum variables:

```
VITE_LAUNCHDARKLY_CLIENT_SIDE_ID=<your-client-side-id>
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Local Development

```sh
git clone <REPO_URL>
cd my-house-maker
npm install
npm run dev
```

The dev server runs on Vite’s default port. Update the `.env` file with your LaunchDarkly and Supabase values before starting the app.

## Deploy with GitHub Codespaces

1. In GitHub, click **Code** → **Codespaces** → **Create codespace on main** (or the branch you want).
2. Wait for the dev container to build; it installs Node.js, pnpm/npm, and project dependencies.
3. Add environment variables:
   - Go to **Codespaces** → **Manage secrets** and add `VITE_LAUNCHDARKLY_CLIENT_SIDE_ID`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
   - Alternatively, create a `.env` file at the workspace root with the values.
4. From the integrated terminal run:
   ```sh
   npm install
   npm run dev -- --host
   ```
5. Use the forwarded port to preview the running application. Feature-flag changes propagate automatically thanks to LaunchDarkly’s streaming client.
6. Commit changes directly from the Codespace and push when you are ready.

## Production Deployment

- Build the optimized bundle with `npm run build`.
- Serve the `dist` output with your hosting provider of choice.
- Ensure the production environment uses the correct LaunchDarkly client-side ID and flag targeting rules prior to rollout.
