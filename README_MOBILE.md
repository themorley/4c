# 4c Mobile App

A React Native mobile application for the 4c Sports Betting EV Calculator, built with Expo.

## Features

- **EV Calculator**: Calculate expected value, optimal bet sizes using Kelly Criterion, and potential winnings
- **Wong Teaser Calculator**: Calculate EV for multi-leg teaser bets with configurable push handling
- **Persistent Storage**: Bankroll values are automatically saved and synced across tabs
- **Mobile-Optimized UI**: Clean, responsive design optimized for mobile devices

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (will be installed automatically)
- For iOS development: **Xcode** (Mac only)
- For Android development: **Android Studio**

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

   This will open the Expo DevTools in your browser and show a QR code.

## Running on Your Device

### Option 1: Expo Go App (Easiest for Testing)

1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code:**
   - **iOS**: Open the Camera app and scan the QR code
   - **Android**: Open the Expo Go app and scan the QR code

3. The app will load on your device!

### Option 2: iOS Simulator (Mac only)

```bash
npm run ios
```

This will open the iOS Simulator and run the app.

### Option 3: Android Emulator

1. Make sure Android Studio is installed and an emulator is running
2. Run:
   ```bash
   npm run android
   ```

## Project Structure

```
4c-mobile/
├── App.tsx                 # Main app entry point with navigation
├── src/
│   ├── screens/
│   │   ├── EVCalculatorScreen.tsx    # EV Calculator screen
│   │   └── WongTeaserScreen.tsx      # Wong Teaser screen
│   └── utils/
│       ├── oddsCalculations.ts       # Core calculation functions
│       └── storage.ts                # AsyncStorage utilities
├── package.json
├── app.json                # Expo configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Features Explained

### EV Calculator

The EV Calculator helps you determine:
- **Expected Value (EV)**: Whether a bet is profitable in the long run
- **True Probability**: The actual probability based on sharp book lines
- **Kelly Criterion**: Optimal bet size as a percentage of bankroll
- **Optimal Wager**: Rounded bet size based on favorite/underdog status
- **Potential Win**: Expected winnings if the bet hits

**How it works:**
1. Enter your bankroll
2. Enter sharp book lines (the "true" market odds)
3. Select which side you're betting (favorite or underdog)
4. Enter the recreational book line (the odds you're getting)
5. Calculate to see if the bet has positive EV and optimal bet size

### Wong Teaser Calculator

The Wong Teaser Calculator helps you evaluate multi-leg teaser bets:
- **Multiple Legs**: Configure 2, 3, or 4 leg teasers
- **Push Handling**: Choose how pushes are handled (loss, void, or leg push)
- **Combined Probability**: Calculates the true probability of all legs winning
- **Teaser EV**: Expected value for the entire teaser

**How it works:**
1. Enter your bankroll
2. Configure number of legs and teaser odds
3. Set push handling preference
4. For each leg, enter:
   - Home or Away
   - Teaser line (after points are added)
   - Book odds on that teaser line
5. Calculate to see teaser EV and optimal wager

## Building for Production

### iOS

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

4. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

### Android

1. **Build for Android:**
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play:**
   ```bash
   eas submit --platform android
   ```

## Development Tips

- **Hot Reloading**: Changes to your code will automatically reload in the app
- **Debugging**: Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open the developer menu
- **TypeScript**: The project uses TypeScript for type safety
- **Styling**: Uses React Native StyleSheet for mobile-optimized styling

## Troubleshooting

### "expo: command not found"
- Make sure you've run `npm install`
- Try installing Expo CLI globally: `npm install -g expo-cli`

### App won't load on device
- Make sure your phone and computer are on the same WiFi network
- Try restarting the Expo server: `npm start -- --clear`

### Build errors
- Clear cache: `expo start --clear`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Next Steps

- Add more betting calculators (parlays, round robins, etc.)
- Add bet history tracking
- Add push notifications for line movements
- Add dark mode support
- Add data export/import functionality

## Support

For issues or questions, please check the Expo documentation:
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
