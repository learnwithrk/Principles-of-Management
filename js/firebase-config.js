/* ------------------------------------------------------------------
   Firebase configuration
   ------------------------------------------------------------------
   This site uses a free Firebase (Firestore) project purely to store
   quiz attempts so the leaderboard is shared across every visitor,
   not just saved on one person's browser.

   HOW TO GET THESE VALUES (about 5 minutes, no cost):
   1. Go to https://console.firebase.google.com and create a project
      (any name, e.g. "fundamentals-of-management").
   2. In the project, click "Build > Firestore Database" > "Create
      database" > start in PRODUCTION mode > choose any region.
   3. Go to "Firestore Database > Rules" and paste the rules from
      firestore.rules.txt in this repo, then click "Publish".
   4. Back on the project Overview page, click the "</>" (Web) icon to
      register a web app (no Hosting needed). Copy the firebaseConfig
      object it gives you and paste the values below.
   5. Commit this file. That's it — no server, no API keys to hide,
      this config is meant to be public for a client-side web app.
   ------------------------------------------------------------------ */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBXVfW0gnuVOxiUnrItDLSLSiL3wV1m92g",
  authDomain: "quiz-hub-836f8.firebaseapp.com",
  projectId: "quiz-hub-836f8",
  storageBucket: "quiz-hub-836f8.firebasestorage.app",
  messagingSenderId: "61979629946",
  appId: "1:61979629946:web:20ed3344c4871c547e9ec3"
};
