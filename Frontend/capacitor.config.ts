import type { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'com.enbus.app',
  appName: 'En-Bus',
  webDir: 'www',
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
  // ✅ ON FORCE L'AJOUT DE LA PROPRIÉTÉ MANQUANTE
  resources: {
    icon: {
      sources: ["resources/logo-1024x1024.png"]
    },
    splash: {
      sources: ["resources/logo-1024x1024.png"]
    }
  }
} as const; // On utilise "as const" pour aider TypeScript

// On exporte en s'assurant que ça respecte le type attendu
export default config as CapacitorConfig;