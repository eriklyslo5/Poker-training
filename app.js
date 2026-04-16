// =============================================
//  Poker Opening Range Trainer — App Logic
//  Includes: Live Table simulation, RFI quiz,
//  Explore modes, dynamic action buttons
// =============================================

(function () {
  "use strict";

  // ---- DOM refs ----
  var modeSelect      = document.getElementById("mode-select");
  var positionSelect  = document.getElementById("position-select");
  var positionGroup   = document.getElementById("position-group");
  var openerSelect    = document.getElementById("opener-select");
  var openerGroup     = document.getElementById("opener-group");
  var dealBtn         = document.getElementById("deal-btn");
  var tableArea       = document.getElementById("table-area");
  var pokerTable      = document.getElementById("poker-table");
  var situationPrompt = document.getElementById("situation-prompt");
  var handArea        = document.getElementById("hand-area");
  var card1           = document.getElementById("card-1");
  var card2           = document.getElementById("card-2");
  var actionArea      = document.getElementById("action-area");
  var actionButtons   = document.getElementById("action-buttons");
  var feedbackEl      = document.getElementById("feedback");
  var feedbackIcon    = document.getElementById("feedback-icon");
  var feedbackText    = document.getElementById("feedback-text");
  var exploreArea     = document.getElementById("explore-area");
  var rangeGrid       = document.getElementById("range-grid");
  var exploreVsArea   = document.getElementById("explore-vs-area");
  var rangeGridVs     = document.getElementById("range-grid-vs");
  var correctCount    = document.getElementById("correct-count");
  var wrongCount      = document.getElementById("wrong-count");
  var accuracyEl      = document.getElementById("accuracy");
  var resetBtn        = document.getElementById("reset-btn");

  // ---- State ----
  var score   = { correct: 0, wrong: 0 };
  var waiting = false;       // blocks input during animation/feedback
  var simTimers = [];        // active setTimeout IDs for simulation animation

  // Current hand state (used by all quiz modes)
  var currentState = null;
  // {
  //   heroPos, handLabel, row, col,
  //   potState: "unopened"|"raised"|"3bet",
  //   raiserPos, threeBettorPos,
  //   correctAction: "raise"|"fold"|"3bet"|"call"|"4bet"
  // }


  // ==================================================
  //  Card rendering
  // ==================================================
  var SUIT_SYMBOLS = { s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663" };
  var SUIT_COLORS  = { s: "black", h: "red", d: "red", c: "black" };
  var ALL_SUITS    = ["s","h","d","c"];

  function randomSuit() { return ALL_SUITS[Math.floor(Math.random() * 4)]; }

  function renderCard(el, rank, suit) {
    el.textContent = rank + SUIT_SYMBOLS[suit];
    el.className   = "card " + SUIT_COLORS[suit];
  }

  function renderRandomCards(el1, el2, row, col) {
    var rank1 = RANKS[row], rank2 = RANKS[col];
    if (row === col) {
      var suits = shuffleArray([].concat(ALL_SUITS));
      renderCard(el1, rank1, suits[0]);
      renderCard(el2, rank2, suits[1]);
    } else if (col > row) {
      var s = randomSuit();
      renderCard(el1, rank1, s);
      renderCard(el2, rank2, s);
    } else {
      var s1 = randomSuit(), s2 = randomSuit();
      while (s2 === s1) s2 = randomSuit();
      renderCard(el1, rank2, s1);
      renderCard(el2, rank1, s2);
    }
  }


  // ==================================================
  //  Populate position dropdown
  // ==================================================
  TABLE_POSITIONS.forEach(function(pos) {
    var opt = document.createElement("option");
    opt.value = pos;
    opt.textContent = pos;
    positionSelect.appendChild(opt);
  });


  // ==================================================
  //  Table seat management
  // ==================================================
  function buildTable() {
    pokerTable.querySelectorAll(".seat").forEach(function(el) { el.remove(); });
    TABLE_POSITIONS.forEach(function(pos) {
      var seat = document.createElement("div");
      seat.className = "seat";
      seat.dataset.pos = pos;
      seat.innerHTML = '<span class="seat-label">' + pos + '</span><span class="seat-action"></span>';
      pokerTable.appendChild(seat);
    });
  }

  function resetAllSeats() {
    pokerTable.querySelectorAll(".seat").forEach(function(seat) {
      seat.className = "seat";
      seat.dataset.pos = seat.dataset.pos; // keep data-pos
      seat.querySelector(".seat-action").textContent = "";
    });
  }

  function getSeat(pos) {
    return pokerTable.querySelector('.seat[data-pos="' + pos + '"]');
  }

  function setSeatState(pos, cssClass, actionText) {
    var seat = getSeat(pos);
    if (!seat) return;
    // Animate
    seat.classList.add("acting");
    setTimeout(function() { seat.classList.remove("acting"); }, 400);
    // Apply state
    seat.classList.add(cssClass);
    if (actionText) seat.querySelector(".seat-action").textContent = actionText;
  }

  function clearSimTimers() {
    simTimers.forEach(function(t) { clearTimeout(t); });
    simTimers = [];
  }


  // ==================================================
  //  Populate openers (for explore-vs mode)
  // ==================================================
  function populateOpeners() {
    openerSelect.innerHTML = "";
    var heroPos = resolvePosition();
    var heroIdx = TABLE_POSITIONS.indexOf(heroPos);

    TABLE_POSITIONS.forEach(function(pos, i) {
      if (i < heroIdx && FACING_RAISE[heroPos] && FACING_RAISE[heroPos][pos]) {
        var opt = document.createElement("option");
        opt.value = pos;
        opt.textContent = pos;
        openerSelect.appendChild(opt);
      }
    });

    if (openerSelect.options.length === 0) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No openers";
      openerSelect.appendChild(opt);
    }
  }


  // ==================================================
  //  Resolve position (handles "random")
  // ==================================================
  function resolvePosition() {
    var val = positionSelect.value;
    if (val === "random") {
      return TABLE_POSITIONS[Math.floor(Math.random() * TABLE_POSITIONS.length)];
    }
    return val;
  }


  // ==================================================
  //  Dynamic action buttons
  // ==================================================
  // actions: array of { id, label, cssClass, action }
  function showActionButtons(actions) {
    actionButtons.innerHTML = "";
    actions.forEach(function(a) {
      var btn = document.createElement("button");
      btn.className = "btn " + a.cssClass;
      btn.textContent = a.label;
      btn.id = a.id;
      btn.addEventListener("click", function() { handleAnswer(a.action); });
      actionButtons.appendChild(btn);
    });
    actionArea.classList.remove("hidden");
  }

  function disableActionButtons() {
    actionButtons.querySelectorAll(".btn").forEach(function(b) { b.disabled = true; });
  }

  // Button configs per pot state
  function getButtonsForState(potState) {
    if (potState === "unopened") {
      return [
        { id: "raise-btn", label: "Raise", cssClass: "btn-raise", action: "raise" },
        { id: "fold-btn",  label: "Fold",  cssClass: "btn-fold",  action: "fold" }
      ];
    }
    if (potState === "raised") {
      return [
        { id: "3bet-btn", label: "3-Bet", cssClass: "btn-3bet", action: "3bet" },
        { id: "call-btn", label: "Call",   cssClass: "btn-call", action: "call" },
        { id: "fold-btn", label: "Fold",   cssClass: "btn-fold", action: "fold" }
      ];
    }
    if (potState === "3bet") {
      return [
        { id: "4bet-btn", label: "4-Bet", cssClass: "btn-4bet", action: "4bet" },
        { id: "call-btn", label: "Call",   cssClass: "btn-call", action: "call" },
        { id: "fold-btn", label: "Fold",   cssClass: "btn-fold", action: "fold" }
      ];
    }
    return [];
  }


  // ==================================================
  //  Determine hero's correct action
  // ==================================================
  function computeCorrectAction(heroPos, handLabel, potState, raiserPos, threeBettorPos) {
    if (potState === "unopened") {
      return getRangeSet(heroPos).has(handLabel) ? "raise" : "fold";
    }
    if (potState === "raised" && raiserPos) {
      return getCorrectActionVsRaise(heroPos, raiserPos, handLabel);
    }
    if (potState === "3bet") {
      // Hero is cold-facing a 3-bet (they haven't acted yet)
      return getCorrectActionColdVs3Bet(heroPos, handLabel);
    }
    return "fold";
  }


  // ==================================================
  //  LIVE TABLE — Full simulation
  // ==================================================
  function dealLiveTable() {
    if (waiting) return;
    clearSimTimers();
    hideFeedback();
    resetAllSeats();
    handArea.classList.add("hidden");
    actionArea.classList.add("hidden");
    situationPrompt.classList.add("hidden");
    situationPrompt.textContent = "";

    var heroPos = resolvePosition();
    var heroIdx = TABLE_POSITIONS.indexOf(heroPos);

    // Mark hero seat
    setSeatState(heroPos, "hero", "YOU");

    // Deal hands to all players
    var playerHands = {};
    TABLE_POSITIONS.forEach(function(pos) {
      playerHands[pos] = randomHandLabel();
    });

    // Simulation state
    var potState = "unopened";
    var raiserPos = null;
    var threeBettorPos = null;

    // Build the action sequence for players BEFORE hero
    var actionsBeforeHero = [];
    for (var i = 0; i < TABLE_POSITIONS.length; i++) {
      var pos = TABLE_POSITIONS[i];
      if (pos === heroPos) break; // stop when we reach hero
      actionsBeforeHero.push(pos);
    }

    // Animate each player's action with delays
    var DELAY = 600;
    var step = 0;

    function processNextPlayer() {
      if (step >= actionsBeforeHero.length) {
        // All players before hero have acted — it's hero's turn
        presentHeroDecision(heroPos, playerHands[heroPos], potState, raiserPos, threeBettorPos);
        return;
      }

      var pos = actionsBeforeHero[step];
      var hand = playerHands[pos].label;
      var action = getAIAction(pos, hand, potState, raiserPos);

      // Apply action
      if (action === "fold") {
        setSeatState(pos, "folded", "fold");
      } else if (action === "raise") {
        setSeatState(pos, "opener", "RAISE");
        raiserPos = pos;
        potState = "raised";
      } else if (action === "3bet") {
        setSeatState(pos, "three-bettor", "3-BET");
        threeBettorPos = pos;
        potState = "3bet";
      } else if (action === "call") {
        setSeatState(pos, "caller", "CALL");
      } else if (action === "4bet") {
        // Treat 4-bet as a very aggressive action — rare in simulation
        setSeatState(pos, "three-bettor", "4-BET");
        potState = "3bet"; // keep at 3bet level for simplicity
      }

      step++;
      var timer = setTimeout(processNextPlayer, DELAY);
      simTimers.push(timer);
    }

    // Start the animation
    var startTimer = setTimeout(processNextPlayer, DELAY);
    simTimers.push(startTimer);
  }

  function presentHeroDecision(heroPos, handData, potState, raiserPos, threeBettorPos) {
    var handLabel = handData.label;
    var correctAction = computeCorrectAction(heroPos, handLabel, potState, raiserPos, threeBettorPos);

    currentState = {
      heroPos: heroPos,
      handLabel: handLabel,
      row: handData.row,
      col: handData.col,
      potState: potState,
      raiserPos: raiserPos,
      threeBettorPos: threeBettorPos,
      correctAction: correctAction
    };

    // Build situation description
    var desc = "";
    if (potState === "unopened") {
      desc = "Folded to you in " + heroPos + ". What do you do?";
    } else if (potState === "raised") {
      desc = raiserPos + " raises. You are in " + heroPos + ". What do you do?";
    } else if (potState === "3bet") {
      desc = raiserPos + " raises, " + threeBettorPos + " 3-bets. You are in " + heroPos + ".";
    }

    situationPrompt.textContent = desc;
    situationPrompt.classList.remove("hidden");

    // Show hero's cards
    renderRandomCards(card1, card2, handData.row, handData.col);
    handArea.classList.remove("hidden");

    // Show appropriate buttons
    showActionButtons(getButtonsForState(potState));
  }


  // ==================================================
  //  RFI QUIZ — simple raise/fold
  // ==================================================
  function dealRFI() {
    if (waiting) return;
    clearSimTimers();
    hideFeedback();
    resetAllSeats();

    var heroPos = resolvePosition();
    var heroIdx = TABLE_POSITIONS.indexOf(heroPos);

    // Show table: everyone before hero folds, hero highlighted
    for (var i = 0; i < heroIdx; i++) {
      setSeatState(TABLE_POSITIONS[i], "folded", "fold");
    }
    setSeatState(heroPos, "hero", "YOU");

    var hand = randomHandLabel();
    var correctAction = getRangeSet(heroPos).has(hand.label) ? "raise" : "fold";

    currentState = {
      heroPos: heroPos,
      handLabel: hand.label,
      row: hand.row,
      col: hand.col,
      potState: "unopened",
      raiserPos: null,
      threeBettorPos: null,
      correctAction: correctAction
    };

    situationPrompt.textContent = "You are in " + heroPos + ". Folded to you.";
    situationPrompt.classList.remove("hidden");

    renderRandomCards(card1, card2, hand.row, hand.col);
    handArea.classList.remove("hidden");
    showActionButtons(getButtonsForState("unopened"));
  }


  // ==================================================
  //  Handle answer (shared by all quiz modes)
  // ==================================================
  function handleAnswer(action) {
    if (!currentState || waiting) return;

    var correct = (action === currentState.correctAction);
    var ACTION_LABELS = {
      "raise": "Raise", "fold": "Fold",
      "3bet": "3-Bet", "call": "Call",
      "4bet": "4-Bet"
    };
    var correctLabel = ACTION_LABELS[currentState.correctAction] || currentState.correctAction;

    if (correct) {
      score.correct++;
      showFeedback(true, "Correct!");
    } else {
      var detail = currentState.handLabel;
      if (currentState.potState === "unopened") {
        detail += " from " + currentState.heroPos + " \u2192 " + correctLabel;
      } else if (currentState.potState === "raised") {
        detail += " in " + currentState.heroPos + " vs " + currentState.raiserPos + " open \u2192 " + correctLabel;
      } else if (currentState.potState === "3bet") {
        detail += " in " + currentState.heroPos + " vs 3-bet \u2192 " + correctLabel;
      }
      showFeedback(false, "Wrong \u2014 " + detail);
    }

    updateScore();
    disableActionButtons();

    waiting = true;
    var timer = setTimeout(function() {
      waiting = false;
      dealCurrentMode();
    }, 1600);
    simTimers.push(timer);
  }


  // ==================================================
  //  Keyboard shortcuts
  // ==================================================
  document.addEventListener("keydown", function(e) {
    var mode = modeSelect.value;
    if (mode !== "live" && mode !== "quiz") return;
    var key = e.key.toLowerCase();

    if (key === "r" || key === "3") {
      // Raise (RFI) or 3-bet (facing raise) — context-dependent
      if (currentState) {
        if (currentState.potState === "unopened") handleAnswer("raise");
        else if (currentState.potState === "raised") handleAnswer("3bet");
        else if (currentState.potState === "3bet") handleAnswer("4bet");
      }
    } else if (key === "4") {
      handleAnswer("4bet");
    } else if (key === "c") {
      handleAnswer("call");
    } else if (key === "f") {
      handleAnswer("fold");
    } else if (key === "d") {
      dealCurrentMode();
    }
  });


  // ==================================================
  //  Explore modes
  // ==================================================
  function buildGrid() {
    rangeGrid.innerHTML = "";
    var pos = resolvePosition();
    var rangeSet = getRangeSet(pos);

    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var label = getHandLabel(r, c);
        var cell = document.createElement("div");
        var inRange = rangeSet.has(label);
        cell.className = "grid-cell " + (inRange ? "raise" : "fold");
        cell.textContent = label;
        cell.title = label + (inRange ? " \u2014 Raise" : " \u2014 Fold");
        rangeGrid.appendChild(cell);
      }
    }
  }

  function buildVsGrid() {
    rangeGridVs.innerHTML = "";
    var heroPos = resolvePosition();
    var openerPos = openerSelect.value;
    if (!openerPos) return;

    var data = getFacingRaiseData(heroPos, openerPos);

    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var label = getHandLabel(r, c);
        var cell = document.createElement("div");
        var cls = "fold", tip = "Fold";
        if (data) {
          if (data.threeBet.has(label))  { cls = "threeBet"; tip = "3-Bet"; }
          else if (data.call.has(label)) { cls = "call-cell"; tip = "Call"; }
        }
        cell.className = "grid-cell " + cls;
        cell.textContent = label;
        cell.title = label + " \u2014 " + tip;
        rangeGridVs.appendChild(cell);
      }
    }
  }


  // ==================================================
  //  Mode switching
  // ==================================================
  function updateMode() {
    var mode = modeSelect.value;
    clearSimTimers();
    waiting = false;

    // Hide everything
    handArea.classList.add("hidden");
    actionArea.classList.add("hidden");
    situationPrompt.classList.add("hidden");
    exploreArea.classList.add("hidden");
    exploreVsArea.classList.add("hidden");
    hideFeedback();
    resetAllSeats();

    // Show/hide controls
    positionGroup.classList.remove("hidden");
    openerGroup.classList.add("hidden");
    dealBtn.classList.remove("hidden");

    switch (mode) {
      case "live":
        tableArea.classList.remove("hidden");
        break;
      case "quiz":
        tableArea.classList.remove("hidden");
        break;
      case "explore":
        tableArea.classList.remove("hidden");
        dealBtn.classList.add("hidden");
        buildGrid();
        showTableRFI(resolvePosition());
        break;
      case "explore-vs":
        tableArea.classList.remove("hidden");
        dealBtn.classList.add("hidden");
        openerGroup.classList.remove("hidden");
        populateOpeners();
        if (openerSelect.value) {
          showTableScenario(resolvePosition(), openerSelect.value);
          buildVsGrid();
        }
        break;
    }
  }

  function dealCurrentMode() {
    var mode = modeSelect.value;
    if (mode === "live") dealLiveTable();
    else if (mode === "quiz") dealRFI();
  }

  // Helpers for explore table views
  function showTableRFI(heroPos) {
    resetAllSeats();
    var idx = TABLE_POSITIONS.indexOf(heroPos);
    for (var i = 0; i < idx; i++) setSeatState(TABLE_POSITIONS[i], "folded", "fold");
    setSeatState(heroPos, "hero", "YOU");
  }

  function showTableScenario(heroPos, openerPos) {
    resetAllSeats();
    var opIdx = TABLE_POSITIONS.indexOf(openerPos);
    var heroIdx = TABLE_POSITIONS.indexOf(heroPos);
    TABLE_POSITIONS.forEach(function(pos, i) {
      if (pos === openerPos) setSeatState(pos, "opener", "RAISE");
      else if (pos === heroPos) setSeatState(pos, "hero", "YOU");
      else {
        var between = opIdx < heroIdx ? (i > opIdx && i < heroIdx) : (i > opIdx || i < heroIdx);
        if (between) setSeatState(pos, "folded", "fold");
      }
    });
  }


  // ==================================================
  //  Event listeners
  // ==================================================
  modeSelect.addEventListener("change", updateMode);

  positionSelect.addEventListener("change", function() {
    var mode = modeSelect.value;
    if (mode === "explore") {
      buildGrid();
      showTableRFI(resolvePosition());
    } else if (mode === "explore-vs") {
      populateOpeners();
      if (openerSelect.value) {
        showTableScenario(resolvePosition(), openerSelect.value);
        buildVsGrid();
      }
    }
  });

  openerSelect.addEventListener("change", function() {
    if (modeSelect.value === "explore-vs" && openerSelect.value) {
      showTableScenario(resolvePosition(), openerSelect.value);
      buildVsGrid();
    }
  });

  dealBtn.addEventListener("click", dealCurrentMode);

  resetBtn.addEventListener("click", function() {
    score = { correct: 0, wrong: 0 };
    updateScore();
  });


  // ==================================================
  //  Feedback & Score
  // ==================================================
  function showFeedback(isCorrect, msg) {
    feedbackEl.classList.remove("hidden", "correct", "wrong");
    feedbackEl.classList.add(isCorrect ? "correct" : "wrong");
    feedbackIcon.textContent = isCorrect ? "\u2714" : "\u2718";
    feedbackText.textContent = " " + msg;
  }

  function hideFeedback() {
    feedbackEl.classList.add("hidden");
    feedbackEl.classList.remove("correct", "wrong");
  }

  function updateScore() {
    correctCount.textContent = score.correct;
    wrongCount.textContent   = score.wrong;
    var total = score.correct + score.wrong;
    accuracyEl.textContent = total > 0
      ? Math.round((score.correct / total) * 100) + "%"
      : "\u2014";
  }


  // ==================================================
  //  Utility
  // ==================================================
  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }


  // ==================================================
  //  Init
  // ==================================================
  buildTable();
  updateMode();
  dealCurrentMode();

})();
