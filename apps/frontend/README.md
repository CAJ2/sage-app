# Sage App Frontend

The frontend is built using Vue 3 and Nuxt 3.
Check out the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
nx dev frontend
```

## Build & Install

The frontend is designed to be packaged as a cross-platform mobile app using Capacitor, or simply run in the browser.

### Mobile App

Capacitor and dependencies should be installed, for instructions visit the [Capacitor Docs](https://capacitorjs.com/docs/getting-started/environment-setup)

```bash
# Generate a build of the Nuxt project
# Uses the dev API by default, for prod use frontend:generate:prod
nx run frontend:generate
# Sync Capacitor
nx run frontend:sync

# ANDROID
# Open in Android Studio to run/install/debug
nx run frontend:android:open
# OR package an APK
nx run frontend:android:build

# iOS
nx run frontend:ios:open
```
Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
