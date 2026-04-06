import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chefpro.app.nova',
  appName: 'CHEF NOVO 2.0',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  // Adiciona isto para reforçar que só queremos Android
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
