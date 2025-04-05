# Welcome to Routine Rocket 👋

[![Routine-Rocket Workflow](https://github.com/jrk12b/Routine-Rocket/actions/workflows/node.js.yml/badge.svg)](https://github.com/jrk12b/Routine-Rocket/actions/workflows/node.js.yml)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

Boost your productivity with RoutineRocket! Set habits, track daily progress, and monitor your performance over time—all in one powerful app. Stay consistent, build better routines, and achieve your goals with ease. Download now and launch your habits to success!

## Tech Stack

- Expo
- React Native Node JS

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start --ios
   ```

   ## Internal development Build:

   1. npx expo install expo@latest
   2. npx expo-doctor
   3. eas login
   4. eas credentials
   5. Ensure device is registered: eas device:list and/or eas device:create
   6. eas build -p ios --profile development-simulator (or development to get it on a device)
   7. run npm start and scan QR code with my phone

   ## Production Build:

   1. eas build -p ios --profile production
   2. eas submit --platform ios
   3. This will upload a prod build version app developer account

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).
