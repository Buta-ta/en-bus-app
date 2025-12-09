// On importe les scripts Firebase nécessaires
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

// ========================================================
// ✅ C'EST LE FICHIER LE PLUS IMPORTANT À METTRE À JOUR
// ========================================================
// Utilisez EXACTEMENT le même objet firebaseConfig que dans votre app.js
const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_API_KEY",
  authDomain: "votre-vrai-domaine.firebaseapp.com",
  projectId: "votre-vrai-project-id",
  storageBucket: "votre-vrai-bucket.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
// ========================================================

// On initialise Firebase dans ce service worker
firebase.initializeApp(firebaseConfig);

// On récupère l'instance du service de messagerie
const messaging = firebase.messaging();

// (Optionnel) Gérer les notifications en arrière-plan
// Ce code s'exécute si vous voulez personnaliser la notification avant qu'elle ne s'affiche
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192.png' // L'icône qui sera affichée
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});