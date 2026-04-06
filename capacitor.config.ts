import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chefpro.app.nova',
  appName: 'CHEF NOVO 2.0',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;