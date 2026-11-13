// Cole aqui a configuracao do aplicativo Web do Firebase Console.
// Project settings > Your apps > Web app > SDK setup and configuration.
export const firebaseConfig = {
  apiKey: 'COLE_AQUI',
  authDomain: 'COLE_AQUI',
  projectId: 'COLE_AQUI',
  appId: 'COLE_AQUI'
};
export const firebaseReady = !Object.values(firebaseConfig).some(v => v === 'COLE_AQUI');
