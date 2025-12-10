# Expo React Native Template

A comprehensive Expo React Native template with TypeScript, navigation, and best practices already configured.

## Features

- ⚡ **Expo SDK 50** - Latest stable version
- 📘 **TypeScript** - Full type safety
- 🧭 **React Navigation** - Stack navigation setup
- 🎨 **Organized Structure** - Clean folder architecture
- 🛠️ **ESLint** - Code linting configured
- 📱 **Cross-platform** - iOS, Android, and Web support

## Quick Start

1. Clone this template
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Run on your device/simulator:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Project Structure

```
├── assets/           # Static assets (images, fonts)
├── src/
│   ├── components/   # Reusable components
│   ├── constants/    # App constants (colors, spacing)
│   ├── hooks/        # Custom React hooks
│   ├── navigation/   # Navigation configuration
│   ├── screens/      # Screen components
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── App.tsx           # Main app entry point
├── app.json          # Expo configuration
└── package.json      # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

## Customization

### App Name and Bundle ID

Update the following in `app.json`:
- `name` - Display name of your app
- `slug` - URL-friendly name
- `ios.bundleIdentifier` - iOS bundle ID
- `android.package` - Android package name

### Adding Screens

1. Create a new screen in `src/screens/`
2. Add the screen to navigation types in `src/navigation/types.ts`
3. Register the screen in your navigator in `App.tsx`

### Adding Navigation

The template uses React Navigation with Stack Navigator. You can:
- Add tab navigation using `@react-navigation/bottom-tabs`
- Add drawer navigation using `@react-navigation/drawer`
- Learn more at [React Navigation docs](https://reactnavigation.org/)

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [React Navigation documentation](https://reactnavigation.org/)
- [TypeScript documentation](https://www.typescriptlang.org/)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details