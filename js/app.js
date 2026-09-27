/* ==========================================================
   QuizApp — shared across every page (index.html, quiz.html)
   Handles: name login, Firestore leaderboard read/write,
   and the top bar. Works with plain <script> tags, no build step.
   ========================================================== */

const QuizApp = (() => {
  const NAME_KEY = "pom_learner_name";
  let db = null;
  let usingFallback = true;

  // ---- Firebase init (optional — falls back to localStorage) ----
  function initFirebase() {
    try {
      const cfg = window.FIREBASE_CONFIG;
      if (!cfg || cfg.apiKey === "YOUR_API_KEY") {
        usingFallback = true;
        return;
      }
      if (window.firebase && !firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      db = firebase.firestore();
      usingFallback = false;
    } catch (e) {
      console.warn("Firebase not available, using local fallback leaderboard.", e);
      usingFallback = true;
    }
  }
  initFirebase();

  // ---------------- Name / login ----------------
  function getName() {
    return (localStorage.getItem(NAME_KEY) || "").trim();
  }
  function setName(name) {
    localStorage.setItem(NAME_KEY, name.trim());
  }
  function clearName() {
    localStorage.removeItem(NAME_KEY);
  }

  // Renders the top navigation bar into #topbar, with a learner chip.
  function renderTopbar(activePage) {
    const el = document.getElementById("topbar");
    if (!el) return;
    const name = getName();
    el.innerHTML = `
      <div class="container">
        <a class="brand" href="index.html">
          <span class="brand-mark">§</span>
          <span class="brand-name">Principles of Management — Quiz Hub</span>
        </a>
        <div class="learner-chip">
          ${name ? `<span>Signed in as <strong>${escapeHtml(name)}</strong></span><button id="switchNameBtn">Switch name</button>`
                 : `<span>Not signed in</span>`}
        </div>
      </div>`;
    const btn = document.getElementById("switchNameBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        clearName();
        location.reload();
      });
    }
  }

  // Renders a login card into `container` (a DOM element) and calls
  // onDone(name) once a name has been submitted. If a name already
  // exists, calls onDone immediately without rendering anything.
  function requireName(container, onDone) {
    const existing = getName();
    if (existing) {
      onDone(existing);
      return;
    }
    container.innerHTML = `
      <div class="login-card">
        <h2>Enter your name to begin</h2>
        <p>Your name will appear on the leaderboard for this quiz.</p>
        <form id="nameForm">
          <div class="field">
            <label for="nameInput">Your name</label>
            <input id="nameInput" type="text" maxlength="40" placeholder="e.g. Priya Sharma" required autofocus />
          </div>
          <button type="submit" class="btn btn-primary btn-full">Continue</button>
        </form>
      </div>`;
    document.getElementById("nameForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const val = document.getElementById("nameInput").value.trim();
      if (!val) return;
      setName(val);
      onDone(val);
    });
  }

  // ---------------- Leaderboard (Firestore or localStorage) ----------------

  function localKey(quizId) {
    return `pom_leaderboard_${quizId}`;
  }

  async function submitScore({ quizId, quizTitle, name, score, total }) {
    const percent = Math.round((score / total) * 100);
    const record = { quizId, quizTitle, name, score, total, percent, timestamp: Date.now() };

    if (usingFallback || !db) {
      const list = JSON.parse(localStorage.getItem(localKey(quizId)) || "[]");
      list.push(record);
      localStorage.setItem(localKey(quizId), JSON.stringify(list));
      return record;
    }

    await db.collection("scores").add({
      ...record,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    return record;
  }

  async function fetchLeaderboard(quizId, limitN = 10) {
    if (usingFallback || !db) {
      const list = JSON.parse(localStorage.getItem(localKey(quizId)) || "[]");
      return list
        .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
        .slice(0, limitN);
    }

    const snap = await db
      .collection("scores")
      .where("quizId", "==", quizId)
      .orderBy("score", "desc")
      .limit(limitN)
      .get();

    return snap.docs.map((d) => d.data());
  }

  function isFallback() {
    return usingFallback;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    getName, setName, clearName,
    renderTopbar, requireName,
    submitScore, fetchLeaderboard, isFallback,
    escapeHtml
  };
})();
