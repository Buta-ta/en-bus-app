import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.enbus.app',
  appName: 'En-Bus',
  webDir: 'www',

  server: {
    androidScheme: 'https',
  },
  
  android: {
    webContentsDebuggingEnabled: true
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#10101A",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#73d700"
    },
    
    // Ajout Google Sign-In
    SocialLogin: {
      google: {
        webClientId: '518160239652-r8nir369fnkur0id4a51dj4rju1ug754.apps.googleusercontent.com', // ⬅️ Remplace par ton vrai Client ID
      },
    },
  },
};

export default config;