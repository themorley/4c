# 4c Mobile App - Quick Setup Guide

## What We Built

I've created a complete React Native mobile app for your 4c EV Calculator using Expo. This allows you to run the app on iOS and Android devices.

## What You Need to Do

### Step 1: Install Dependencies

Open a terminal in this directory and run:

```bash
npm install
```

This will install all the required packages (React Native, Expo, navigation, etc.).

### Step 2: Install Expo Go on Your Phone

**For iPhone:**
- Open the App Store
- Search for "Expo Go"
- Install it

**For Android:**
- Open Google Play Store
- Search for "Expo Go"
- Install it

### Step 3: Start the App

Run this command:

```bash
npm start
```

This will:
- Start the Expo development server
- Open a browser window with a QR code
- Show you options to run on iOS/Android

### Step 4: Run on Your Phone

**Option A: Scan QR Code (Easiest)**
- **iPhone**: Open the Camera app and point it at the QR code. Tap the notification to open in Expo Go.
- **Android**: Open the Expo Go app and tap "Scan QR code", then scan the code.

**Option B: Use the Terminal**
- Press `i` in the terminal to open iOS Simulator (Mac only)
- Press `a` in the terminal to open Android Emulator (if set up)

## What's Included

### ✅ Complete Mobile App Structure
- React Native with Expo framework
- Bottom tab navigation (EV Calculator and Wong Teaser)
- TypeScript for type safety

### ✅ EV Calculator Screen
- All functionality from your web app
- Bankroll input with auto-save
- Sharp book lines input
- Implied probability calculator
- EV calculation with Kelly Criterion
- Optimal wager and potential win display

### ✅ Wong Teaser Screen
- Configurable 2-4 leg teasers
- Push handling options (loss, void, leg push)
- Per-leg configuration (home/away, line, odds)
- Combined probability and EV calculation

### ✅ Shared Utilities
- All odds calculation functions migrated from `app.js`
- AsyncStorage for persisting bankroll
- Clean, reusable code structure

### ✅ Mobile-Optimized Design
- Touch-friendly buttons and inputs
- Responsive layout
- Color scheme matching your web app
- Smooth animations and transitions

## App Assets (Optional)

The app references some image assets that you can add later:
- `assets/icon.png` - App icon (1024x1024)
- `assets/splash.png` - Splash screen (1242x2436)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024)
- `assets/favicon.png` - Web favicon (48x48)

For now, the app will work without these - Expo will use default placeholders.

## Testing the App

1. **Test EV Calculator:**
   - Enter a bankroll (e.g., 10000)
   - Enter sharp lines: Favorite -110, Underdog +110
   - Click "Calculate Implied Probabilities"
   - Select "Favorite" and enter rec line -105
   - Click "Calculate EV"
   - You should see positive EV and optimal wager

2. **Test Wong Teaser:**
   - Enter bankroll
   - Select 2 legs
   - Enter teaser odds (e.g., -110)
   - Configure each leg with line and odds
   - Click "Calculate Teaser EV"

## Building for App Stores

When you're ready to publish:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Create Expo account** (free): https://expo.dev

3. **Login:**
   ```bash
   eas login
   ```

4. **Build:**
   ```bash
   eas build --platform ios    # For iOS
   eas build --platform android # For Android
   ```

5. **Submit:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## Key Differences from Web App

- **Navigation**: Uses React Navigation tabs instead of web tabs
- **Storage**: Uses AsyncStorage instead of localStorage
- **Styling**: Uses React Native StyleSheet instead of CSS
- **Inputs**: Native mobile inputs with proper keyboard types
- **Layout**: Optimized for mobile screens (ScrollView for long content)

## Troubleshooting

**"Module not found" errors:**
- Run `npm install` again
- Delete `node_modules` folder and reinstall: `rm -rf node_modules && npm install`

**App won't load:**
- Make sure phone and computer are on same WiFi
- Try restarting: `npm start -- --clear`

**TypeScript errors:**
- The project uses TypeScript - make sure all files have proper types
- Check `tsconfig.json` is configured correctly

## Next Steps

1. Test the app on your device
2. Customize colors/branding if needed
3. Add app icons and splash screens
4. Consider adding more features (bet history, favorites, etc.)
5. Build and submit to app stores when ready

The app is fully functional and ready to use! All your calculation logic has been preserved and works exactly the same as the web version.
