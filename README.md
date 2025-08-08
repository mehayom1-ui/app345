# My Wellness App

A React Native wellness application with authentication, breathing exercises, entertainment features, and personal wellness tracking.


### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation & Setup
```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## 📁 Project Structure

### Core App Files
- `App.tsx` - Main application entry point
- `app.json` - Expo configuration
- `package.json` - Dependencies and scripts

### Navigation
- `navigation/RootNavigator.tsx` - Main navigation structure
- `navigation/AuthStack.tsx` - Authentication flow screens
- `navigation/MainTabs.tsx` - Main tab navigation

### Screens
Located in `screens/` directory:
- **Authentication**: `LoginScreen.tsx`, `RegisterScreen.tsx`, `ResetScreen.tsx`
- **Main Features**: `MainScreen.tsx`, `BreathingScreen.tsx`, `ListenScreen.tsx`
- **Wellness**: `MyPromiseScreen.tsx`, `StatsScreen.tsx`, `EntertainmentScreen.tsx`
- **Content**: `MaamarimScreen.tsx`, `WatchScreen.tsx`, `FAQScreen.tsx`
- **Profile**: `ProfileScreen.tsx`, `SplashScreen.tsx`, `OnboardingScreen.tsx`

### Components
Located in `components/` directory:
- **UI Components**: `ThemedText.tsx`, `ThemedView.tsx`, `Collapsible.tsx`
- **Custom Components**: `HelloWave.tsx`, `ParallaxScrollView.tsx`, `HapticTab.tsx`
- **UI Elements**: `components/ui/` - Background images, icons, tab bars

### Assets
- **Images**: `assets/images/` - All app icons and graphics
- **Fonts**: `assets/fonts/SpaceMono-Regular.ttf`

### Configuration
- `constants/Colors.ts` - App color scheme
- `hooks/` - Custom React hooks for theming
- `services/firebase.ts` - Firebase configuration
- `scripts/` - Utility scripts for project management

## 🎯 Key Features

### Authentication System
- Login/Register screens with form validation
- Password reset functionality
- Secure authentication flow

### Wellness Features
- **Breathing Exercises**: Guided breathing with visual feedback
- **My Promise**: Personal wellness commitments tracking
- **Statistics**: Progress tracking and analytics
- **Entertainment**: Relaxing content and activities

### Content Sections
- **Listen**: Audio content and meditation
- **Watch**: Video wellness content
- **Read**: Text-based wellness content (Maamarim)
- **FAQ**: Help and support information

## 🛠 Development

### Adding New Screens
1. Create screen in `screens/` directory
2. Add to navigation in `navigation/` files
3. Update tab navigation if needed

### Styling
- Use `ThemedText` and `ThemedView` for consistent theming
- Colors defined in `constants/Colors.ts`
- Responsive design with Expo's responsive utilities

### Firebase Integration
- Configuration in `services/firebase.ts`
- Authentication and data storage
- Audio upload scripts in `scripts/`

## 📱 App Flow

1. **Splash Screen** → Welcome animation
2. **Onboarding** → App introduction
3. **Authentication** → Login/Register
4. **Main Tabs** → Core app features
   - Home: Main dashboard
   - Breathing: Exercise sessions
   - Listen: Audio content
   - Profile: User settings

## 🔧 Scripts

```bash
# Reset project (clears cache and reinstalls)
npm run reset-project

# Upload audio to Firebase
npm run upload-audio
```

## 📦 Dependencies

Key packages:
- `expo` - React Native framework
- `@react-navigation` - Navigation system
- `firebase` - Backend services
- `expo-av` - Audio/video playback
- `expo-haptics` - Haptic feedback

## 🚨 Troubleshooting

### Common Issues
1. **Metro bundler issues**: Run `npx expo start --clear`
2. **Dependencies**: Delete `node_modules` and run `npm install`
3. **Cache issues**: Use `npm run reset-project`

### Development Tips
- Use Expo Go app for quick testing
- Enable hot reload for faster development
- Check Expo documentation for platform-specific issues

## 📄 License

This project is part of a wellness application designed to help users with mental health and wellness activities.

---

**Happy Coding! 🎉**
