import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.enbus.app',
  appName: 'En-Bus',
  webDir: 'www',

  // Section pour activer le débogage et le live-reload
  server: {
    androidScheme: 'https',
  },
  android: {
    webContentsDebuggingEnabled: true
  },
  
  // Votre configuration de plugins existante est correcte
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
    }
  },

  // LE BLOC "resources" A ÉTÉ SUPPRIMÉ CAR IL EST INVALIDE
};

export default config;