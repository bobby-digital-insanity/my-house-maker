# My House Maker

## Overview

The My House Maker is a sample application built to spotlight LaunchDarkly’s most impactful 'day 1" use cases. Key user actions are toggled by a feature flag so product teams can deliver value safely and iteratively. We gate the AI Builder behind the flag `buildWithAi` to roll out transformational experiences to targeted individules, we graduate customers into premium support with `premiumSupport`, and we vet new AI models via `modelSelectionGemini25Pro` before promoting them broadly. These patterns illustrate why LaunchDarkly matters: teams can test, segment, and control exposure in production without redeploying, reducing risk, accelerating feedback loops, and letting marketing, product, and customer success coordinate launches in real time.

This lab guide provides a step-by-step walkthrough for integrating LaunchDarkly into your development workflow. You’ll learn how to implement LaunchDarkly’s SDK, wrap key application features with feature flag hooks, and configure flags directly within the LaunchDarkly user interface. Finally, you’ll deploy the application using GitHub Codespaces to observe your changes in real time.

For a quick rundown of this project, please watch this short video of what this lab accomplishes: XXXXX


## Main Steps

- LaunchDarkly account setup
- Create feature flags in the LaunchDarkly UI
- Run the application inside GitHub Codespaces
- Observe your feature flags in action, no redeploy required
- Enjoy a safer, faster, and more iterative development experience :) 


## Core Application Features

- Room customization options for predefined themes.
- AI Builder that generates recommended room designs from natural language prompts.
- Shopping cart, checkout, and pricing workflows that persist for signed-in and guest users.
- Personalized onboarding and authentication
- Live chat helper surfaced only to users provisioned with LaunchDarkly's premium support flag.

## Tech Stack

- Vite
- TypeScript
- React
- launchdarkly-react-client-sdk
- shadcn-ui
- Tailwind CSS
- Supabase

## Instructions

The steps below outline what is required to run this application and test it out for yourself. This lab is designed to be ran with GitHub Codespaces, but you can run this on your local laptop or any server that you have in mind. 

### LaunchDarkly Setup

- If you do not have a LaunchDarkly account already, sign up for a free trial here: [Free Trial Sign Up](https://app.launchdarkly.com/signup)
- Once you account is created, we will first create a few new feature flags. Once we create the feature flags we will grab the client side ID for communication between our code and the LaunchDarkly client. 

## LaunchDarkly Integration

## Create New Feature Flag in LaunchDarkly UI:

- Please follow the steps below to create a new feature flag or this documentation: [documentation](https://launchdarkly.com/docs/home/flags/new#overview)
- Once logged into your LaunchDarkly account, in the top left of the UI click on top left blue button "+ Create" and then "flag"
   - ![Screenshot of flag creation](https://github.com/bobby-digital-insanity/my-house-maker/blob/main/assets/images/create-flag-button.png)
- Give the flag a new name of "Build with AI" and a description if desired. This will be the first flag that will we will be using in this lab. Leave the other options alone and click on the "create flag" button.
   - ![Screenshot of flag creation name](https://github.com/bobby-digital-insanity/my-house-maker/blob/main/assets/images/name-flag-create.png)
- Once created, on the right side navigation/metadata section, at the very bottom, click on "advanced controls" and toggle on the "Available on client-side SDKs" control.
- This will allow the feature flag to be leveraged with the hooks we have in place on our JS based application. This is not needed if you plan on implementing this on any backend systems like .NET, Java, etc...
- Save this client-side SDK ID as this will be entered into the Codespaces secrects section once we run the Codespace. Only one client-side SDK ID is needed for us to connect all of our feature flags.
   - [View SDK credentials](https://launchdarkly.com/docs/home/account/environment/keys#view-sdk-credentials).
![Screenshot of flag settings](https://github.com/bobby-digital-insanity/my-house-maker/blob/main/assets/images/enable-copy-client-sdk.png)

## Edit New Feature Flag in LaunchDarkly UI:

- On the same page where we copied the client-side SDK ID and enabled the client-side SDK toggle switch, we are going to create some user context based rules to allow this feature to only be enabled when a user from a specific email address logs in.
- Below the first option on the feature flag "Flag is On serving variations based on rules", click on the "+" icon and slelect "Build a custom rule".
- Enter the following information into the text boxes: (when entering the below options, if prompted with "add", click that option")
  - Context Kind: User
  - Attribute: email
  - Operator: contains
  - Values: realtor.com
  - Variation: True
 
   - ![Screenshot of custom rule creation](https://github.com/bobby-digital-insanity/my-house-maker/blob/main/assets/images/email-rule-flag.png)


- Repeate the steps above two more times for the `premium-support` and `model-selection-gemini-2-5-pro` feature flags. 

LaunchDarkly powers progressive delivery throughout the app:

- `buildWithAi` toggles access to the AI Builder entry point on the customization page.
- `modelSelectionGemini25Pro` unlocks the Gemini 2.5 Pro model inside the AI Builder.
- `premium-support` (consumed via the SDK as `premiumSupport`) gates live chat support and related premium messaging.


> **Note:** When using `useFlags`, LaunchDarkly maps hyphenated keys to camelCase properties (for example, `premium-support` becomes `flags.premiumSupport`). Direct SDK calls should still reference the canonical flag key (`premium-support`).


### Other notes

- If running this outside of Codespaces, store the client-sdie ID in `VITE_LAUNCHDARKLY_CLIENT_SIDE_ID` in an .env file in the root of the project for the environment you are targeting.

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
