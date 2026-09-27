# Principles of Management — Quiz Hub

A static, GitHub Pages-friendly quiz site. Name-based login, per-module MCQ
quizzes, a shared leaderboard, a full review of wrong answers at the end of
every attempt, and downloadable lecture slides for every module.

## What's included

```
index.html          Home page — quiz list (from quizzes/manifest.json) + slide downloads
quiz.html            Quiz runner (?id=<quiz-id>)
leaderboard.html      Standalone leaderboard view (?id=<quiz-id>)
css/style.css         Shared styling
js/app.js             Login, header, leaderboard read/write
js/quiz-engine.js     Quiz rendering, scoring, review screen
js/firebase-config.js Firebase keys (reused from the Fundamentals of Management site)
quizzes/manifest.json List of published quizzes
quizzes/*.json         One file per module (50 questions each, except Module 4: 49, Module 5: 51)
ppt/*.pptx             Lecture slide decks, one per module (Module 1 has 3 parts)
firestore.rules.txt   Security rules (same rules as the Fundamentals of Management site)
```

## 1. Publish it on GitHub Pages

1. Create a new repo, e.g. `learnwithrk/Principles-of-Management`, and push
   every file above into it (keep the folder structure).
2. In the repo: **Settings → Pages → Source → Deploy from a branch**,
   branch `main`, folder `/ (root)`. Save.
3. Your site will be live at:
   `https://learnwithrk.github.io/Principles-of-Management/`

## 2. Leaderboard (Firebase)

`js/firebase-config.js` here points at the **same Firebase project** already
set up for the Fundamentals of Management site
(`quiz-hub-836f8`), and the Firestore rules
(`firestore.rules.txt`) are unchanged — everyone's scores go into the same
`scores` collection, namespaced by `quizId`, so both sites can safely share
one Firebase project without any extra setup. If you'd rather keep this
subject's scores in a separate Firebase project, create one the same way as
described in the original repo's README and swap in its `firebaseConfig`
values.

## 3. Modules

| # | Module | Questions | Slides |
|---|--------|-----------|--------|
| 1 | Introduction to Management | 50 | 3 parts (Meaning · Functions/Levels/Theories · Indian Ethos/21st Century) |
| 2 | Planning and Decision Making | 50 | 1 deck |
| 3 | Organizing | 50 | 1 deck |
| 4 | Staffing and Leadership | 49 | 1 deck |
| 5 | Motivation and Controlling | 51 | 1 deck |

## 4. Add a new module later

Same as the original repo: drop a `quizzes/<id>.json` file
(`{ "id", "title", "subtitle", "questions": [{ "q", "options", "answer" }] }`,
`answer` = zero-based index of the correct option), add one entry to
`quizzes/manifest.json`, commit and push.

## Notes

- Every question in the source material had its correct answer listed as
  option A — options have been shuffled (each module reshuffled with its
  own fixed seed) so the pattern doesn't give the answer away, and the
  `answer` index in each JSON file reflects the shuffled order.
