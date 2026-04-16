// =============================================
//  Poker Opening Range Trainer — App Logic
// =============================================

(function () {
  "use strict";

  // ---- DOM refs ----
  const modeSelect     = document.getElementById("mode-select");
  const positionSelect = document.getElementById("position-select");
  const positionGroup  = document.getElementById("position-group");
  const openerSelect   = document.getElementById("opener-select");
  const openerGroup    = document.getElementById("opener-group");
  const dealBtn        = document.getElementById("deal-btn");

  // RFI quiz
  const quizArea       = document.getElementById("quiz-area");
  const card1          = document.getElementById("card-1");
  const card2          = document.getElementById("card-2");
  const raiseBtn       = document.getElementById("raise-btn");
  const foldBtn        = document.getElementById("fold-btn");
  const feedback       = document.getElementById("feedback");
  const feedbackIcon   = document.getElementById("feedback-icon");
  const feedbackText   = document.getElementById("feedback-text");

  // Scenario quiz
  const scenarioArea       = document.getElementById("scenario-area");
  const scenarioDesc       = document.getElementById("scenario-description");
  const cardS1             = document.getElementById("card-s1");
  const cardS2             = document.getElementById("card-s2");
  const threeBetBtn        = document.getElementById("threeBet-btn");
  const callBtn            = document.getElementById("call-btn");
  const foldSBtn           = document.getElementById("fold-s-btn");
  const scenarioFeedback     = document.getElementById("scenario-feedback");
  const scenarioFeedbackIcon = document.getElementById("scenario-feedback-icon");
  const scenarioFeedbackText = document.getElementById("scenario-feedback-text");

  // Explore
  const exploreArea    = document.getElementById("explore-area");
  const rangeGrid      = document.getElementById("range-grid");
  const exploreVsArea  = document.getElementById("explore-vs-area");
  const rangeGridVs    = document.getElementById("range-grid-vs");

  // Table
  const tableArea      = document.getElementById("table-area");
  const pokerTable     = document.getElementById("poker-table");

  // Score
  const correctCount   = document.getElementById("correct-count");
  const wrongCount     = document.getElementById("wrong-count");
  const accuracy       = document.getElementById("accuracy");
  const resetBtn       = document.getElementById("reset-btn");

  // ---- State ----
  let score       = { correct: 0, wrong: 0 };
  let currentHand = null;
  let currentScenario = null;  // { heroPos, openerPos, handLabel, correctAction }
  let waiting     = false;

  // ---- Card helpers ----
  const SUIT_SYMBOLS = { s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663" };
  const SUIT_COLORS  = { s: "black", h: "red", d: "red", c: "black" };
  const ALL_SUITS    = ["s","h","d","c"];

  function randomSuit()  { return ALL_SUITS[Math.floor(Math.random() * 4)]; }

  function renderCard(el, rank, suit) {
    el.textContent = rank + SUIT_SYMBOLS[suit];
    el.className   = "card " + SUIT_COLORS[suit];
  }

  function renderRandomCards(el1, el2, row, col) {
    const rank1 = RANKS[row];
    const rank2 = RANKS[col];

    if (row === col) {
      const suits = shuffleArray([...ALL_SUITS]);
      renderCard(el1, rank1, suits[0]);
      renderCard(el2, rank2, suits[1]);
    } else if (col > row) {
      const suit = randomSuit();
      renderCard(el1, rank1, suit);
      renderCard(el2, rank2, suit);
    } else {
      const suit1 = randomSuit();
      let suit2 = randomSuit();
      while (suit2 === suit1) suit2 = randomSuit();
      renderCard(el1, rank2, suit1);
      renderCard(el2, rank1, suit2);
    }
  }

  // ---- Populate positions ----
  getPositions().forEach(pos => {
    const opt = document.createElement("option");
    opt.value = pos;
    opt.textContent = pos;
    positionSelect.appendChild(opt);
  });

  // ---- Build poker table seats ----
  function buildTable() {
    // Remove existing seats
    pokerTable.querySelectorAll(".seat, .action-chip").forEach(el => el.remove());

    TABLE_POSITIONS.forEach(pos => {
      const seat = document.createElement("div");
      seat.className = "seat";
      seat.dataset.pos = pos;
      seat.innerHTML = '<span class="seat-label">' + pos + '</span><span class="seat-action"></span>';
      pokerTable.appendChild(seat);
    });
  }

  function resetTableSeats() {
    pokerTable.querySelectorAll(".seat").forEach(seat => {
      seat.classList.remove("hero","opener","folded");
      seat.querySelector(".seat-action").textContent = "";
    });
    pokerTable.querySelectorAll(".action-chip").forEach(el => el.remove());
  }

  function setSeatState(pos, state, actionText) {
    const seat = pokerTable.querySelector('.seat[data-pos="' + pos + '"]');
    if (!seat) return;
    seat.classList.add(state);
    if (actionText) {
      seat.querySelector(".seat-action").textContent = actionText;
    }
  }

  // Show the table scenario: opener raises, everyone between folds, hero is highlighted
  function showTableScenario(heroPos, openerPos) {
    resetTableSeats();
    const posIndex = p => TABLE_POSITIONS.indexOf(p);
    const opIdx = posIndex(openerPos);
    const heroIdx = posIndex(heroPos);

    TABLE_POSITIONS.forEach((pos, i) => {
      if (pos === openerPos) {
        setSeatState(pos, "opener", "RAISE");
      } else if (pos === heroPos) {
        setSeatState(pos, "hero", "YOU");
      } else {
        // Positions between opener and hero fold
        // In clockwise order: opener acts, then positions after fold until hero
        const isBetween = opIdx < heroIdx
          ? (i > opIdx && i < heroIdx)
          : (i > opIdx || i < heroIdx);
        if (isBetween) {
          setSeatState(pos, "folded", "fold");
        }
      }
    });
  }

  // Show table for RFI: hero highlighted, everyone before folded
  function showTableRFI(heroPos) {
    resetTableSeats();
    const heroIdx = TABLE_POSITIONS.indexOf(heroPos);

    TABLE_POSITIONS.forEach((pos, i) => {
      if (pos === heroPos) {
        setSeatState(pos, "hero", "YOU");
      } else if (i < heroIdx) {
        setSeatState(pos, "folded", "fold");
      }
    });
  }

  // ---- Populate openers based on selected hero position ----
  function populateOpeners() {
    openerSelect.innerHTML = "";
    const heroPos = positionSelect.value;
    const heroIdx = TABLE_POSITIONS.indexOf(heroPos);

    // Openers are positions that act before hero
    TABLE_POSITIONS.forEach((pos, i) => {
      if (i < heroIdx && FACING_RAISE[heroPos]?.[pos]) {
        const opt = document.createElement("option");
        opt.value = pos;
        opt.textContent = pos;
        openerSelect.appendChild(opt);
      }
    });

    // If no openers available, show message
    if (openerSelect.options.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No openers (UTG acts first)";
      openerSelect.appendChild(opt);
    }
  }

  // ---- Mode switching ----
  function updateMode() {
    const mode = modeSelect.value;

    // Hide all sections
    quizArea.classList.add("hidden");
    scenarioArea.classList.add("hidden");
    exploreArea.classList.add("hidden");
    exploreVsArea.classList.add("hidden");
    hideFeedback();
    hideScenarioFeedback();

    // Show/hide controls
    const showDeal = (mode === "quiz" || mode === "scenario");
    dealBtn.classList.toggle("hidden", !showDeal);

    // Position selector: always show
    positionGroup.classList.remove("hidden");

    // Opener selector: only for vs-raise modes
    const showOpener = (mode === "scenario" || mode === "explore-vs");
    openerGroup.classList.toggle("hidden", !showOpener);

    if (showOpener) {
      populateOpeners();
    }

    switch (mode) {
      case "quiz":
        quizArea.classList.remove("hidden");
        tableArea.classList.remove("hidden");
        showTableRFI(positionSelect.value);
        break;
      case "scenario":
        scenarioArea.classList.remove("hidden");
        tableArea.classList.remove("hidden");
        break;
      case "explore":
        exploreArea.classList.remove("hidden");
        tableArea.classList.remove("hidden");
        showTableRFI(positionSelect.value);
        buildGrid();
        break;
      case "explore-vs":
        exploreVsArea.classList.remove("hidden");
        tableArea.classList.remove("hidden");
        if (openerSelect.value) {
          showTableScenario(positionSelect.value, openerSelect.value);
          buildVsGrid();
        }
        break;
    }
  }

  modeSelect.addEventListener("change", updateMode);

  positionSelect.addEventListener("change", () => {
    const mode = modeSelect.value;
    if (mode === "explore") {
      showTableRFI(positionSelect.value);
      buildGrid();
    } else if (mode === "quiz") {
      showTableRFI(positionSelect.value);
    }
    if (mode === "scenario" || mode === "explore-vs") {
      populateOpeners();
      if (mode === "explore-vs" && openerSelect.value) {
        showTableScenario(positionSelect.value, openerSelect.value);
        buildVsGrid();
      }
    }
  });

  openerSelect.addEventListener("change", () => {
    const mode = modeSelect.value;
    if (mode === "explore-vs" && openerSelect.value) {
      showTableScenario(positionSelect.value, openerSelect.value);
      buildVsGrid();
    }
  });


  // ==================================================
  //  EXPLORE: RFI 13×13 grid
  // ==================================================
  function buildGrid() {
    rangeGrid.innerHTML = "";
    const rangeSet = getRangeSet(positionSelect.value);

    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 13; c++) {
        const label = getHandLabel(r, c);
        const cell  = document.createElement("div");
        const inRange = rangeSet.has(label);
        cell.className = "grid-cell " + (inRange ? "raise" : "fold");
        cell.textContent = label;
        cell.title = label + (inRange ? " \u2014 Raise" : " \u2014 Fold");
        rangeGrid.appendChild(cell);
      }
    }
  }

  // ==================================================
  //  EXPLORE VS: Facing raise 13×13 grid
  // ==================================================
  function buildVsGrid() {
    rangeGridVs.innerHTML = "";
    const heroPos   = positionSelect.value;
    const openerPos = openerSelect.value;
    if (!openerPos) return;

    const data = getFacingRaiseData(heroPos, openerPos);

    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 13; c++) {
        const label = getHandLabel(r, c);
        const cell  = document.createElement("div");
        let cls = "fold";
        let tip = "Fold";
        if (data) {
          if (data.threeBet.has(label))    { cls = "threeBet"; tip = "3-Bet"; }
          else if (data.call.has(label))   { cls = "call-cell"; tip = "Call"; }
        }
        cell.className = "grid-cell " + cls;
        cell.textContent = label;
        cell.title = label + " \u2014 " + tip;
        rangeGridVs.appendChild(cell);
      }
    }
  }


  // ==================================================
  //  QUIZ: RFI deal
  // ==================================================
  function dealHandRFI() {
    if (waiting) return;

    const position = positionSelect.value;
    const rangeSet = getRangeSet(position);

    const r = Math.floor(Math.random() * 13);
    const c = Math.floor(Math.random() * 13);
    const label = getHandLabel(r, c);
    const isRaise = rangeSet.has(label);

    currentHand = { label, isRaise };

    renderRandomCards(card1, card2, r, c);
    showTableRFI(position);
    hideFeedback();
    raiseBtn.disabled = false;
    foldBtn.disabled  = false;
  }

  function answerRFI(action) {
    if (!currentHand || waiting) return;

    const correct = (action === "raise") === currentHand.isRaise;
    const correctAction = currentHand.isRaise ? "Raise" : "Fold";

    if (correct) {
      score.correct++;
      showFeedback(true, "Correct!");
    } else {
      score.wrong++;
      showFeedback(false, "Wrong \u2014 " + currentHand.label + " is a " + correctAction + " from " + positionSelect.value);
    }

    updateScore();
    raiseBtn.disabled = true;
    foldBtn.disabled  = true;

    waiting = true;
    setTimeout(() => { waiting = false; dealHandRFI(); }, 1400);
  }

  raiseBtn.addEventListener("click", () => answerRFI("raise"));
  foldBtn.addEventListener("click",  () => answerRFI("fold"));


  // ==================================================
  //  SCENARIO: Facing raise deal
  // ==================================================
  function dealScenario() {
    if (waiting) return;

    const heroPos   = positionSelect.value;
    const openerPos = openerSelect.value;
    if (!openerPos) return;

    // Random hand
    const r = Math.floor(Math.random() * 13);
    const c = Math.floor(Math.random() * 13);
    const label = getHandLabel(r, c);
    const correctAction = getCorrectActionVsRaise(heroPos, openerPos, label);

    currentScenario = { heroPos, openerPos, handLabel: label, correctAction };

    // Update table
    showTableScenario(heroPos, openerPos);

    // Description
    scenarioDesc.textContent = openerPos + " opens. You are in " + heroPos + ". What do you do?";

    renderRandomCards(cardS1, cardS2, r, c);
    hideScenarioFeedback();
    threeBetBtn.disabled = false;
    callBtn.disabled     = false;
    foldSBtn.disabled    = false;
  }

  function answerScenario(action) {
    if (!currentScenario || waiting) return;

    const correct = (action === currentScenario.correctAction);
    const ACTION_LABELS = { "3bet": "3-Bet", "call": "Call", "fold": "Fold" };
    const correctLabel = ACTION_LABELS[currentScenario.correctAction];

    if (correct) {
      score.correct++;
      showScenarioFeedback(true, "Correct!");
    } else {
      score.wrong++;
      showScenarioFeedback(false,
        "Wrong \u2014 " + currentScenario.handLabel +
        " vs " + currentScenario.openerPos + " open: " + correctLabel
      );
    }

    updateScore();
    threeBetBtn.disabled = true;
    callBtn.disabled     = true;
    foldSBtn.disabled    = true;

    waiting = true;
    setTimeout(() => { waiting = false; dealScenario(); }, 1600);
  }

  threeBetBtn.addEventListener("click", () => answerScenario("3bet"));
  callBtn.addEventListener("click",     () => answerScenario("call"));
  foldSBtn.addEventListener("click",    () => answerScenario("fold"));


  // ---- Deal button dispatches to current mode ----
  dealBtn.addEventListener("click", () => {
    if (modeSelect.value === "quiz") dealHandRFI();
    else if (modeSelect.value === "scenario") dealScenario();
  });


  // ---- Keyboard shortcuts ----
  document.addEventListener("keydown", e => {
    const mode = modeSelect.value;
    const key = e.key.toLowerCase();

    if (mode === "quiz") {
      if (key === "r") answerRFI("raise");
      else if (key === "f") answerRFI("fold");
      else if (key === "d") dealHandRFI();
    } else if (mode === "scenario") {
      if (key === "3" || key === "r") answerScenario("3bet");
      else if (key === "c") answerScenario("call");
      else if (key === "f") answerScenario("fold");
      else if (key === "d") dealScenario();
    }
  });


  // ---- Feedback helpers ----
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

  function showScenarioFeedback(isCorrect, msg) {
    scenarioFeedback.classList.remove("hidden", "correct", "wrong");
    scenarioFeedback.classList.add(isCorrect ? "correct" : "wrong");
    scenarioFeedbackIcon.textContent = isCorrect ? "\u2714" : "\u2718";
    scenarioFeedbackText.textContent = " " + msg;
  }
  function hideScenarioFeedback() {
    scenarioFeedback.classList.add("hidden");
    scenarioFeedback.classList.remove("correct", "wrong");
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
  buildTable();
  updateMode();
  dealHandRFI();
})();
