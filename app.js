// =============================================
//  Poker Opening Range Trainer — App Logic
// =============================================

(function () {
  "use strict";

  // ---- DOM refs ----
  const positionSelect = document.getElementById("position-select");
  const modeSelect     = document.getElementById("mode-select");
  const dealBtn        = document.getElementById("deal-btn");
  const quizArea       = document.getElementById("quiz-area");
  const exploreArea    = document.getElementById("explore-area");
  const card1          = document.getElementById("card-1");
  const card2          = document.getElementById("card-2");
  const raiseBtn       = document.getElementById("raise-btn");
  const foldBtn        = document.getElementById("fold-btn");
  const feedback       = document.getElementById("feedback");
  const feedbackIcon   = document.getElementById("feedback-icon");
  const feedbackText   = document.getElementById("feedback-text");
  const correctCount   = document.getElementById("correct-count");
  const wrongCount     = document.getElementById("wrong-count");
  const accuracy       = document.getElementById("accuracy");
  const resetBtn       = document.getElementById("reset-btn");
  const rangeGrid      = document.getElementById("range-grid");

  // ---- State ----
  let score    = { correct: 0, wrong: 0 };
  let currentHand = null;   // { label, isRaise }
  let waiting  = false;     // true while feedback is showing

  // ---- Card rendering helpers ----
  const SUIT_SYMBOLS = { s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663" };
  const SUIT_COLORS  = { s: "black", h: "red", d: "red", c: "black" };
  const ALL_SUITS    = ["s","h","d","c"];

  function randomSuit()  { return ALL_SUITS[Math.floor(Math.random() * 4)]; }

  function renderCard(el, rank, suit) {
    el.textContent = rank + SUIT_SYMBOLS[suit];
    el.className   = "card " + SUIT_COLORS[suit];
  }

  // ---- Populate positions ----
  getPositions().forEach(pos => {
    const opt = document.createElement("option");
    opt.value = pos;
    opt.textContent = pos;
    positionSelect.appendChild(opt);
  });

  // ---- Mode switching ----
  function updateMode() {
    const mode = modeSelect.value;
    if (mode === "quiz") {
      quizArea.classList.remove("hidden");
      exploreArea.classList.add("hidden");
      dealBtn.classList.remove("hidden");
    } else {
      quizArea.classList.add("hidden");
      exploreArea.classList.remove("hidden");
      dealBtn.classList.add("hidden");
      buildGrid();
    }
    hideFeedback();
  }
  modeSelect.addEventListener("change", updateMode);
  positionSelect.addEventListener("change", () => {
    if (modeSelect.value === "explore") buildGrid();
  });

  // ---- Explore: build 13×13 grid ----
  function buildGrid() {
    rangeGrid.innerHTML = "";
    const rangeSet = getRangeSet(positionSelect.value);

    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 13; c++) {
        const label = getHandLabel(r, c);
        const cell  = document.createElement("div");
        cell.className = "grid-cell " + (rangeSet.has(label) ? "raise" : "fold");
        cell.textContent = label;
        cell.title = label + (rangeSet.has(label) ? " — Raise" : " — Fold");
        rangeGrid.appendChild(cell);
      }
    }
  }

  // ---- Quiz: deal a random hand ----
  function dealHand() {
    if (waiting) return;

    const position = positionSelect.value;
    const rangeSet = getRangeSet(position);

    // Pick a random cell from the 13×13 matrix
    const r = Math.floor(Math.random() * 13);
    const c = Math.floor(Math.random() * 13);
    const label = getHandLabel(r, c);
    const isRaise = rangeSet.has(label);

    currentHand = { label, isRaise };

    // Render two cards with random suits
    const rank1 = RANKS[r];
    const rank2 = RANKS[c];

    if (r === c) {
      // Pair — pick two different suits
      const suits = shuffleArray([...ALL_SUITS]);
      renderCard(card1, rank1, suits[0]);
      renderCard(card2, rank2, suits[1]);
    } else if (c > r) {
      // Suited
      const suit = randomSuit();
      renderCard(card1, rank1, suit);
      renderCard(card2, rank2, suit);
    } else {
      // Offsuit
      const suit1 = randomSuit();
      let suit2 = randomSuit();
      while (suit2 === suit1) suit2 = randomSuit();
      renderCard(card1, rank2, suit1);
      renderCard(card2, rank1, suit2);
    }

    hideFeedback();
    raiseBtn.disabled = false;
    foldBtn.disabled  = false;
  }

  dealBtn.addEventListener("click", dealHand);

  // ---- Quiz: handle answer ----
  function answer(action) {
    if (!currentHand || waiting) return;

    const correct = (action === "raise") === currentHand.isRaise;
    const correctAction = currentHand.isRaise ? "Raise" : "Fold";

    if (correct) {
      score.correct++;
      showFeedback(true, "Correct!");
    } else {
      score.wrong++;
      showFeedback(false, `Wrong — ${currentHand.label} is a ${correctAction} from ${positionSelect.value}`);
    }

    updateScore();
    raiseBtn.disabled = true;
    foldBtn.disabled  = true;

    // Auto-deal next hand after a short pause
    waiting = true;
    setTimeout(() => {
      waiting = false;
      dealHand();
    }, 1400);
  }

  raiseBtn.addEventListener("click", () => answer("raise"));
  foldBtn.addEventListener("click",  () => answer("fold"));

  // Keyboard shortcuts: R = raise, F = fold, D = deal
  document.addEventListener("keydown", e => {
    if (modeSelect.value !== "quiz") return;
    const key = e.key.toLowerCase();
    if (key === "r") answer("raise");
    else if (key === "f") answer("fold");
    else if (key === "d") dealHand();
  });

  // ---- Feedback display ----
  function showFeedback(isCorrect, msg) {
    feedback.classList.remove("hidden", "correct", "wrong");
    feedback.classList.add(isCorrect ? "correct" : "wrong");
    feedbackIcon.textContent = isCorrect ? "\u2714" : "\u2718";
    feedbackText.textContent = " " + msg;
  }

  function hideFeedback() {
    feedback.classList.add("hidden");
    feedback.classList.remove("correct", "wrong");
  }

  // ---- Score ----
  function updateScore() {
    correctCount.textContent = score.correct;
    wrongCount.textContent   = score.wrong;
    const total = score.correct + score.wrong;
    accuracy.textContent = total > 0
      ? Math.round((score.correct / total) * 100) + "%"
      : "\u2014";
  }

  resetBtn.addEventListener("click", () => {
    score = { correct: 0, wrong: 0 };
    updateScore();
  });

  // ---- Utility ----
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---- Init ----
  updateMode();
  dealHand();
})();
