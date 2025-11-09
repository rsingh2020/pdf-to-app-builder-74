import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.12c1a247dac74e8b9d1b1d205cfcfdc3',
  appName: 'Alpha Card',
  webDir: 'dist',
  server: {
    url: 'https://12c1a247-dac7-4e8b-9d1b-1d205cfcfdc3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#F5F5F7",
      showSpinner: false,
    },
  },
};

export default config;
