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
- Save this client-side SDK ID as this will be entered into the Codespaces secrets section once we run the Codespace. Only one client-side SDK ID is needed for us to connect all of our feature flags.
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


- Repeat the steps above two more times for the `premium-support` and `model-selection-gemini-2-5-pro` feature flags. 

LaunchDarkly powers progressive delivery throughout the app:

- `buildWithAi` toggles access to the AI Builder entry point on the customization page.
- `modelSelectionGemini25Pro` unlocks the Gemini 2.5 Pro model inside the AI Builder.
- `premium-support` (consumed via the SDK as `premiumSupport`) gates live chat support and related premium messaging.


> **Note:** When using `useFlags`, LaunchDarkly maps hyphenated keys to camelCase properties (for example, `premium-support` becomes `flags.premiumSupport`). Direct SDK calls should still reference the canonical flag key (`premium-support`).

### Run the Application!

- now that we have LaunchDarkly setup and the required information gathered, we can now use GitHub Codespaces to run the application and test out our changes live.
- On this page, click on the top right green button "<> Code", and then "Codespaces", and then the three dots and "+ New with options..."
- IMAGE
- Keep all of the settings options the same and then paste in the client-side SDK ID that we saved from earlier and click "Create codespace".
- Allow this to warm up for about a minute, and when ready run in the console below `npm run dev`
- This will deploy the application and prompt you with a a "open in browser option". Click on that option or navigate to blue hyperlink "http://localhost:8080" in the output of terminal.
- IMAGE OF TERMINAL

### Test Use Cases of the Application and LaunchDarkly

- On the applcation is running, you can click around and use the application as a normal user. To start to see the new features that we gated behind the feature flags, create a new user and make sure to include "realtor.com" as the email address. This will match the rule that we created above to allow these flags to only show to these types of users.
- Once the user is created, navigate to the main customize page of the application and you can now see the "Build with AI" button. Click on that, keep the first AI model selection, and type out a prompt to see your customized results. If you select the second AI model, it will always return a failed response. This second AI model is also wrapped in a feature flag hook in the code to disable/enable at any moment. Go into the LaunchDarkly UI and disable that flag by turning it off, go back to that page (no page reload required) and see that it is no longer there.
   - IMAGE OF Prompt
   - IMAGE OF DISABLE
 
- Another feature flag we implemented was a "premium" user that has access to a live chat feature. In the settings page (top right profile button, and then settings if logged in as a user), scroll down to "Premium Preferences" and make sure the flag is turned on. If you are logged in as a non "realtor.com" user, this option will not be available to enable and display a message stating to reach out to their account contact for premium licensing.
   - IMAGE OF SUPPORT

## How This All Works

- In this lab, all of the code for this project is already added in to allow you to test out the LaunchDarkly UI and see some example use cases of how LaunchDarkly can help with feature flag implementation. In this section, we will go through what was added to the code base to make this all possible. 

### Code Instrumentation with LaunchDarkly SDK

- Because this project is written in React, the LaunchDarkly React SDK was downloaded from here [Documentation](https://launchdarkly.com/docs/sdk/client-side/react/react-web#install-the-sdk)
- Once this was installed into the project, we can then start to leverage the SDK and hooks that allow us to wrap some of our code in feature flags.

#### Importing the LaunchDarkly SDK components into the root of the application:
   - ```javascript
     import { LDProvider, useLDClient, useFlags } from 'launchdarkly-react-client-sdk';
     ```
- We then make sure to wrap our application call in the file `App.tsx` to ensure we initialize the LaunchDarkly client and make it available via React Context for our entire application.

   - ```javascript
     return (
       <LDProvider 
         clientSideID={import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SIDE_ID}
         context={ldContext}
         options={{
           diagnosticOptOut: false,
         }}
       >
         <AppContent />
       </LDProvider>
     );
     ```
- This does multiple steps at once:
   - Initializes the LaunchDarkly client
   - Connects to LaunchDarkly using the client-side ID
   - Provides user context (who is viewing the app)
   - Makes LaunchDarkly available to all child components
 
#### Adding the feature flag to specific components

- By calling the flags hook, in each of our pages that have a feature we want to gate behind a feature flag we setup in LaunchDarkly, we can get the status of the feature flag itself, and check the user contents to see if the rules we created allow the user to see this feature.
   - ```javascript
        const flags = useFlags();
     ```
   - Example in `customize.tsx`:
   - ```javascript
              {flags.buildWithAi && (
			              <Button
			                onClick={() => {
			                  // Track when button is clicked (before navigation)
			                  const clickTime = Date.now();
			                  
			                  // Store click time in sessionStorage for AIBuilder to calculate response time
			                  sessionStorage.setItem('aiBuilderStartTime', clickTime.toString());
			                  
			                  // Track custom event in LaunchDarkly
			                  if (ldClient) {
			                    ldClient.track('build-with-ai-button-click', {
			                      page: 'customize',
			                      clickTime: clickTime,
			                    });
			                    console.log('✅ Event sent to LaunchDarkly: build-with-ai-button-click', {
			                      timestamp: new Date(clickTime).toISOString(),
			                    });
			                  }
			                  navigate("/ai-builder");
			                }}
			                variant="default"
			                size="lg"
			                className="gap-2 animate-pulse"
			              >
			                <Sparkles className="h-5 w-5" />
			                Build with AI
			                <Badge variant="secondary" className="ml-1">NEW</Badge>
			              </Button>
            )}
     ```
   - In this example, we wrap the entire "build with AI" button in a feature flag logic to either show or hide this button. If the flag result comes back true, the button is displayed, if returned false, the button does not show. This example also shows how we can add custom events like metric tracking and user event count to see the performance of the new feature, and to see how many users are clicking on it. 
 
  #### Using LaunchDarkly Context
  -  This hook returns the LaunchDarkly client instance for advanced operations like user context, and adding metric/event capturing.
		- Provides direct access to the LaunchDarkly client
		- Track custom analytics events
		- Get flag values using .variation()
		- Identify/re-identify users
   - ```javascript
      if (ldClient) {
        ldClient.track('build-with-ai-button-click', {
           page: 'customize',
           clickTime: clickTime,
        });
     ```




### Other notes

- If running this outside of Codespaces, store the client-side ID in `VITE_LAUNCHDARKLY_CLIENT_SIDE_ID` in an .env file in the root of the project for the environment you are targeting.

## Environment Variables

Create a `.env` file (or configure Codespaces secrets) with the following minimum variables:

```
VITE_LAUNCHDARKLY_CLIENT_SIDE_ID=<your-client-side-id>
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
The Supabase credentials are stored as secrets in the CodeSpace configuration. If you would like these to test out with another deployment method besides codespaces, either retrieve them once you create the Codespace in the .env file, run a `cat` command to display them in the terminal output, or reach out to me at `bvogs1014@gmail.com` for access. 

## Local Development

```sh
git clone <REPO_URL>
cd my-house-maker
npm install
npm run dev
```

The dev server runs on Vite’s default port. Update the `.env` file with your LaunchDarkly and Supabase values before starting the app.

If there are any other questions please create a GitHub issue or reach out to me directly at `bvogs1014@gmail.com`
Thank you!
