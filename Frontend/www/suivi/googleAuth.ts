import { SocialLogin } from '@capgo/capacitor-social-login';

// Initialisation (à appeler au démarrage de l'app)
export async function initGoogleAuth() {
  await SocialLogin.initialize({
    google: {
      webClientId: '518160239652-r8nir369fnkur0id4a51dj4rju1ug754.apps.googleusercontent.com',
    },
  });
}

// Connexion
export async function signInWithGoogle() {
  try {
    const result = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile'],
      },
    });
    
    console.log('Connexion réussie:', result);
    return result;
  } catch (error) {
    console.error('Erreur connexion Google:', error);
    throw error;
  }
}

// Déconnexion
export async function signOutGoogle() {
  await SocialLogin.logout({ provider: 'google' });
}