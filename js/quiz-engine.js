/* ==========================================================
   Quiz engine — drives quiz.html
   URL usage: quiz.html?id=5-1-introduction-to-management
   ========================================================== */

(async function () {
  QuizApp.renderTopbar();

  const params = new URLSearchParams(location.search);
  const quizId = params.get("id");
  const root = document.getElementById("quizRoot");

  if (!quizId) {
    root.innerHTML = `<div class="empty-note">No quiz selected. <a href="index.html">Go back to the quiz list</a>.</div>`;
    return;
  }

  let manifest, entry, quizData;
  try {
    manifest = await (await fetch("quizzes/manifest.json")).json();
    entry = manifest.find((q) => q.id === quizId);
    if (!entry) throw new Error("Quiz not found in manifest");
    quizData = await (await fetch(entry.file)).json();
  } catch (e) {
    root.innerHTML = `<div class="empty-note">Couldn't load this quiz (${QuizApp.escapeHtml(e.message)}). <a href="index.html">Go back</a>.</div>`;
    return;
  }

  document.title = quizData.title + " — Quiz";

  // Gate on name, then render the quiz.
  const loginZone = document.createElement("div");
  root.appendChild(loginZone);
  QuizApp.requireName(loginZone, (name) => {
    loginZone.remove();
    renderQuiz(name);
  });

  function renderQuiz(learnerName) {
    const total = quizData.questions.length;
    const selections = new Array(total).fill(null);

    root.insertAdjacentHTML("beforeend", `
      <div class="quiz-header">
        <span class="tag">${QuizApp.escapeHtml(entry.subject || "Quiz")}</span>
        <h1>${QuizApp.escapeHtml(quizData.title)}</h1>
        ${quizData.subtitle ? `<p style="color:var(--ink-soft);margin:0;">${QuizApp.escapeHtml(quizData.subtitle)}</p>` : ""}
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
      </div>
      <div id="questionsZone"></div>
      <div class="submit-bar">
        <span class="hint" id="progressHint">0 of ${total} answered</span>
        <button class="btn btn-primary" id="submitBtn">Submit Quiz</button>
      </div>
      <div id="resultsZone"></div>
    `);

    const qZone = document.getElementById("questionsZone");
    const letters = ["A", "B", "C", "D", "E", "F"];

    quizData.questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "q-card";
      card.innerHTML = `
        <div class="q-num">Question ${qi + 1} of ${total}</div>
        <div class="q-text">${QuizApp.escapeHtml(q.q)}</div>
        <div class="opts" data-qi="${qi}">
          ${q.options.map((opt, oi) => `
            <label class="opt" data-oi="${oi}">
              <input type="radio" name="q${qi}" value="${oi}" />
              <span><strong>${letters[oi]}.</strong> ${QuizApp.escapeHtml(opt)}</span>
            </label>`).join("")}
        </div>`;
      qZone.appendChild(card);
    });

    qZone.addEventListener("change", (e) => {
      if (e.target.type !== "radio") return;
      const qi = parseInt(e.target.name.slice(1), 10);
      const oi = parseInt(e.target.value, 10);
      selections[qi] = oi;

      const optsDiv = qZone.querySelector(`.opts[data-qi="${qi}"]`);
      optsDiv.querySelectorAll(".opt").forEach((el) => el.classList.remove("selected"));
      optsDiv.querySelector(`.opt[data-oi="${oi}"]`).classList.add("selected");

      updateProgress();
    });

    function updateProgress() {
      const answered = selections.filter((s) => s !== null).length;
      document.getElementById("progressFill").style.width = `${(answered / total) * 100}%`;
      document.getElementById("progressHint").textContent = `${answered} of ${total} answered`;
    }

    document.getElementById("submitBtn").addEventListener("click", async () => {
      const answered = selections.filter((s) => s !== null).length;
      if (answered < total) {
        const proceed = confirm(`You've answered ${answered} of ${total} questions. Unanswered questions will be marked wrong. Submit anyway?`);
        if (!proceed) return;
      }

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";

      let score = 0;
      const wrongItems = [];
      quizData.questions.forEach((q, qi) => {
        const isCorrect = selections[qi] === q.answer;
        if (isCorrect) score++;
        else wrongItems.push({ qi, q, given: selections[qi] });
      });

      // Lock the form and mark correct/incorrect inline.
      quizData.questions.forEach((q, qi) => {
        const optsDiv = qZone.querySelector(`.opts[data-qi="${qi}"]`);
        optsDiv.querySelectorAll("input").forEach((inp) => (inp.disabled = true));
        optsDiv.querySelectorAll(".opt").forEach((el) => {
          const oi = parseInt(el.dataset.oi, 10);
          if (oi === q.answer) el.classList.add("review-correct");
          else if (oi === selections[qi]) el.classList.add("review-wrong");
        });
      });
      document.querySelector(".submit-bar").remove();

      let leaderboardRows = [];
      let fallbackNote = "";
      try {
        await QuizApp.submitScore({
          quizId,
          quizTitle: quizData.title,
          name: learnerName,
          score,
          total
        });
        leaderboardRows = await QuizApp.fetchLeaderboard(quizId, 10);
        if (QuizApp.isFallback()) {
          fallbackNote = `<div class="banner">Leaderboard is running in local demo mode (saved only in this browser) because Firebase isn't configured yet in <code>js/firebase-config.js</code>. Once configured, everyone's scores will appear here.</div>`;
        }
      } catch (e) {
        fallbackNote = `<div class="banner">Your score was calculated, but couldn't be saved to the shared leaderboard (${QuizApp.escapeHtml(e.message)}).</div>`;
      }

      renderResults(score, total, wrongItems, leaderboardRows, fallbackNote, learnerName);
      submitBtn.remove();
    });
  }

  function renderResults(score, total, wrongItems, leaderboardRows, fallbackNote, learnerName) {
    const percent = Math.round((score / total) * 100);
    const zone = document.getElementById("resultsZone");
    let html = `
      ${fallbackNote}
      <div class="score-panel">
        <div class="big">${score} / ${total}</div>
        <div class="sub">${percent}% correct</div>
      </div>`;

    if (wrongItems.length === 0) {
      html += `<div class="banner" style="background:var(--good-tint);color:var(--good);border-color:var(--good);">Perfect score — every question answered correctly.</div>`;
    } else {
      html += `<div class="section-head"><h2>Review: questions to revisit</h2><div class="rule"></div></div>`;
      const letters = ["A", "B", "C", "D", "E", "F"];
      wrongItems.forEach(({ qi, q, given }) => {
        html += `
          <div class="review-item">
            <div class="q-text">${qi + 1}. ${QuizApp.escapeHtml(q.q)}</div>
            <div class="review-line wrong">Your answer: ${given === null ? "Not answered" : `${letters[given]}. ${QuizApp.escapeHtml(q.options[given])}`}</div>
            <div class="review-line right">Correct answer: ${letters[q.answer]}. ${QuizApp.escapeHtml(q.options[q.answer])}</div>
          </div>`;
      });
    }

    html += `
      <div class="section-head"><h2>Leaderboard</h2><div class="rule"></div></div>
      <div class="leaderboard">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Score</th><th>%</th></tr></thead>
          <tbody id="lbBody"></tbody>
        </table>
      </div>
      <div style="margin-top:22px;display:flex;gap:10px;">
        <a class="btn btn-ghost" href="index.html">Back to all quizzes</a>
        <a class="btn btn-primary" href="quiz.html?id=${encodeURIComponent(quizId)}">Retake this quiz</a>
      </div>`;

    zone.innerHTML = html;

    const body = document.getElementById("lbBody");
    if (!leaderboardRows.length) {
      body.innerHTML = `<tr><td colspan="4" class="empty">No scores recorded yet.</td></tr>`;
    } else {
      body.innerHTML = leaderboardRows.map((r, i) => `
        <tr class="${r.name === learnerName ? "me" : ""}">
          <td class="rank">${i + 1}</td>
          <td>${QuizApp.escapeHtml(r.name)}</td>
          <td>${r.score}/${r.total}</td>
          <td>${r.percent}%</td>
        </tr>`).join("");
    }

    zone.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
