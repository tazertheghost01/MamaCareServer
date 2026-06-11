# MamaCare Mobile App

This is the `mamacare-mobile` Expo app for the MamaCare project.

## Prerequisites

- Node.js 18 or later
- npm 10 or later
- Expo CLI is optional but helpful for local development:
  ```bash
  npm install -g expo-cli
  ```

## Install dependencies

From the `mamacare-mobile` folder:

```bash
cd mamacare-mobil
npm install
```

## Run locally

Start the Expo development server:

```bash
npm start
```

Or use one of the platform-specific scripts:

```bash
npm run android
npm run ios
npm run web
```

After the server starts, choose one of these options:

- Open in Expo Go on a physical device
- Launch an Android emulator
- Launch an iOS simulator
- Open in the web browser

## Available scripts

- `npm start` – start the Expo development server
- `npm run android` – start Expo and open the Android device/emulator
- `npm run ios` – start Expo and open the iOS simulator
- `npm run web` – start Expo for web development
- `npm run lint` – run Expo's ESLint checks
- `npm run reset-project` – reset starter project files (moves starter code to `app-example` and creates a blank `app` directory)

## Key dependencies

This app is built with Expo Router and React Native, including:

- `expo` – Expo SDK
- `expo-router` – file-based app routing
- `react-native` – React Native runtime
- `react` / `react-dom`
- `nativewind` / `tailwindcss` – styling utilities
- `react-navigation` packages – navigation support
- `expo-image`, `expo-splash-screen`, `expo-status-bar`, `expo-constants`
- `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`

## Project structure

- `app/` – main app source files and Expo Router routes
- `assets/` – app images and static assets
- `global.css` – global styling
- `package.json` – dependency and script definitions
- `tsconfig.json` – TypeScript configuration

## Notes

- This project uses Expo Router and file-based routing.
- If you see issues with native modules, ensure you are using the Expo-managed workflow and run `npm install` again.
- For more Expo details, visit https://docs.expo.dev
