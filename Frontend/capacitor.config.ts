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
        webClientId: '332941537623-5bobgclb5e6q32v7f9didht92oreof2m.apps.googleusercontent.com', // ⬅️ Remplace par ton vrai Client ID
      },
    },
  },
};

export default config;