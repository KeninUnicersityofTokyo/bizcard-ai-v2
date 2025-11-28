import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recardai.app',
  appName: 'ReCard AI',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Replace this with your actual Vercel deployment URL
    url: 'https://bizcard-ai-v2.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      autoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: true,
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      iosClientId: "752015050176-gfsq0ma629qtame5voqi7ctpqtg03ehq.apps.googleusercontent.com",
      serverClientId: "752015050176-gfsq0ma629qtame5voqi7ctpqtg03ehq.apps.googleusercontent.com", // Fallback to iOS ID if Web ID is unknown, might need update
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
