import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.desarrollosrod.jefesenfrente',
  appName: 'Jefes En Frente',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'jefes-en-frente.up.railway.app',
    url: 'https://jefes-en-frente.up.railway.app',
    cleartext: true
  }
};

export default config;
