// =============================================
//  GTO Preflop Ranges for 6-Max Cash Games
// =============================================
//
// RANGES        — RFI (raise first in) when folded to you
// FACING_RAISE  — 3-bet / call / fold when someone has opened
// FACING_3BET   — 4-bet / call / fold when you opened and got 3-bet
// COLD_VS_3BET  — 4-bet / call / fold when cold-facing a 3-bet
//
// Positions: UTG, HJ, CO, BTN, SB, BB

var TABLE_POSITIONS = ["UTG","HJ","CO","BTN","SB","BB"];
var RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

function getHandLabel(row, col) {
  if (row === col) return RANKS[row] + RANKS[col];
  if (col > row)   return RANKS[row] + RANKS[col] + "s";
  return RANKS[col] + RANKS[row] + "o";
}


// =============================================
//  RFI — Raise First In (folded to hero)
// =============================================
var RANGES = {
  UTG: {
    raise: [
      "AA","KK","QQ","JJ","TT","99","88","77","66",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s",
      "QJs","QTs","Q9s",
      "JTs","J9s",
      "T9s","T8s",
      "98s","87s","76s","65s",
      "AKo","AQo","AJo","ATo",
      "KQo","KJo",
      "QJo"
    ]
  },
  HJ: {
    raise: [
      "AA","KK","QQ","JJ","TT","99","88","77","66","55",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s",
      "QJs","QTs","Q9s","Q8s",
      "JTs","J9s","J8s",
      "T9s","T8s",
      "98s","97s",
      "87s","76s","65s","54s",
      "AKo","AQo","AJo","ATo","A9o",
      "KQo","KJo","KTo",
      "QJo","QTo",
      "JTo"
    ]
  },
  CO: {
    raise: [
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s",
      "QJs","QTs","Q9s","Q8s","Q7s",
      "JTs","J9s","J8s","J7s",
      "T9s","T8s","T7s",
      "98s","97s","96s",
      "87s","86s",
      "76s","75s",
      "65s","64s",
      "54s","53s",
      "43s",
      "AKo","AQo","AJo","ATo","A9o","A8o","A7o","A6o","A5o",
      "KQo","KJo","KTo","K9o",
      "QJo","QTo","Q9o",
      "JTo","J9o",
      "T9o",
      "98o"
    ]
  },
  BTN: {
    raise: [
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s","K2s",
      "QJs","QTs","Q9s","Q8s","Q7s","Q6s","Q5s","Q4s",
      "JTs","J9s","J8s","J7s","J6s",
      "T9s","T8s","T7s","T6s",
      "98s","97s","96s","95s",
      "87s","86s","85s",
      "76s","75s","74s",
      "65s","64s","63s",
      "54s","53s","52s",
      "43s","42s",
      "32s",
      "AKo","AQo","AJo","ATo","A9o","A8o","A7o","A6o","A5o","A4o","A3o","A2o",
      "KQo","KJo","KTo","K9o","K8o","K7o",
      "QJo","QTo","Q9o","Q8o",
      "JTo","J9o","J8o",
      "T9o","T8o",
      "98o","97o",
      "87o","86o",
      "76o","75o",
      "65o","64o",
      "54o"
    ]
  },
  SB: {
    raise: [
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s",
      "QJs","QTs","Q9s","Q8s","Q7s","Q6s","Q5s",
      "JTs","J9s","J8s","J7s","J6s",
      "T9s","T8s","T7s","T6s",
      "98s","97s","96s",
      "87s","86s","85s",
      "76s","75s",
      "65s","64s",
      "54s","53s",
      "43s",
      "AKo","AQo","AJo","ATo","A9o","A8o","A7o","A6o","A5o","A4o","A3o","A2o",
      "KQo","KJo","KTo","K9o","K8o",
      "QJo","QTo","Q9o",
      "JTo","J9o",
      "T9o","T8o",
      "98o","97o",
      "87o",
      "76o",
      "65o"
    ]
  },
  BB: {
    raise: [
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s","K2s",
      "QJs","QTs","Q9s","Q8s","Q7s","Q6s","Q5s","Q4s",
      "JTs","J9s","J8s","J7s","J6s","J5s",
      "T9s","T8s","T7s","T6s",
      "98s","97s","96s","95s",
      "87s","86s","85s",
      "76s","75s","74s",
      "65s","64s","63s",
      "54s","53s",
      "43s",
      "AKo","AQo","AJo","ATo","A9o","A8o","A7o","A6o","A5o","A4o","A3o","A2o",
      "KQo","KJo","KTo","K9o","K8o","K7o",
      "QJo","QTo","Q9o","Q8o",
      "JTo","J9o","J8o",
      "T9o","T8o",
      "98o","97o",
      "87o","86o",
      "76o","75o",
      "65o","64o",
      "54o"
    ]
  }
};


// =============================================
//  FACING RAISE — 3-bet / Call when someone opened
//  FACING_RAISE[heroPos][openerPos]
// =============================================
var FACING_RAISE = {
  HJ: {
    UTG: {
      threeBet: ["AA","KK","QQ","AKs","AKo"],
      call:     ["JJ","TT","99","AQs","AJs","ATs","KQs","QJs","JTs","T9s","98s"]
    }
  },
  CO: {
    UTG: {
      threeBet: ["AA","KK","QQ","AKs","AKo"],
      call:     ["JJ","TT","99","88","AQs","AJs","ATs","A5s","KQs","KJs","QJs","JTs","T9s","98s","87s"]
    },
    HJ: {
      threeBet: ["AA","KK","QQ","JJ","AKs","AKo","AQs"],
      call:     ["TT","99","88","77","AJs","ATs","A5s","A4s","KQs","KJs","KTs","QJs","QTs","JTs","J9s","T9s","98s","87s","76s"]
    }
  },
  BTN: {
    UTG: {
      threeBet: ["AA","KK","QQ","AKs","AKo","A5s"],
      call:     ["JJ","TT","99","88","77","AQs","AJs","ATs","A4s","A3s","KQs","KJs","KTs","QJs","QTs","JTs","J9s","T9s","T8s","98s","87s","76s","65s"]
    },
    HJ: {
      threeBet: ["AA","KK","QQ","JJ","AKs","AKo","AQs","A5s","A4s"],
      call:     ["TT","99","88","77","66","AJs","ATs","A9s","A3s","A2s","KQs","KJs","KTs","K9s","QJs","QTs","Q9s","JTs","J9s","T9s","T8s","98s","97s","87s","76s","65s","54s"]
    },
    CO: {
      threeBet: ["AA","KK","QQ","JJ","TT","AKs","AKo","AQs","AQo","AJs","A5s","A4s","K9s"],
      call:     ["99","88","77","66","55","ATs","A9s","A8s","A7s","A6s","A3s","A2s","KQs","KJs","KTs","KQo","QJs","QTs","Q9s","JTs","J9s","J8s","T9s","T8s","98s","97s","87s","86s","76s","75s","65s","64s","54s","53s"]
    }
  },
  SB: {
    UTG: {
      threeBet: ["AA","KK","QQ","AKs","AKo","AQs"],
      call:     ["JJ","TT","99","AJs","KQs"]
    },
    HJ: {
      threeBet: ["AA","KK","QQ","JJ","AKs","AKo","AQs","AJs"],
      call:     ["TT","99","ATs","KQs","KJs","QJs"]
    },
    CO: {
      threeBet: ["AA","KK","QQ","JJ","TT","AKs","AKo","AQs","AQo","AJs","A5s","A4s"],
      call:     ["99","88","ATs","A9s","KQs","KJs","KTs","QJs","QTs","JTs"]
    },
    BTN: {
      threeBet: ["AA","KK","QQ","JJ","TT","99","AKs","AKo","AQs","AQo","AJs","AJo","ATs","A9s","A5s","A4s","A3s","KQs","KJs","K9s"],
      call:     ["88","77","A8s","A7s","A6s","A2s","KTs","K8s","QJs","QTs","Q9s","JTs","J9s","T9s","98s","87s"]
    }
  },
  BB: {
    UTG: {
      threeBet: ["AA","KK","QQ","AKs","AKo","A5s"],
      call:     ["JJ","TT","99","88","77","66","55","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A4s","A3s","A2s","KQs","KJs","KTs","K9s","K8s","K7s","QJs","QTs","Q9s","JTs","J9s","T9s","T8s","98s","97s","87s","76s","65s","54s"]
    },
    HJ: {
      threeBet: ["AA","KK","QQ","JJ","AKs","AKo","AQs","A5s","A4s"],
      call:     ["TT","99","88","77","66","55","44","AJs","ATs","A9s","A8s","A7s","A6s","A3s","A2s","KQs","KJs","KTs","K9s","K8s","K7s","K6s","QJs","QTs","Q9s","Q8s","JTs","J9s","J8s","T9s","T8s","T7s","98s","97s","96s","87s","86s","76s","75s","65s","64s","54s","53s","43s"]
    },
    CO: {
      threeBet: ["AA","KK","QQ","JJ","TT","AKs","AKo","AQs","AQo","A5s","A4s","A3s","K9s"],
      call:     ["99","88","77","66","55","44","33","22","AJs","ATs","A9s","A8s","A7s","A6s","A2s","KQs","KJs","KTs","KQo","K8s","K7s","K6s","K5s","QJs","QTs","Q9s","Q8s","Q7s","JTs","J9s","J8s","J7s","T9s","T8s","T7s","98s","97s","96s","87s","86s","85s","76s","75s","65s","64s","54s","53s","43s"]
    },
    BTN: {
      threeBet: ["AA","KK","QQ","JJ","TT","99","AKs","AKo","AQs","AQo","AJs","AJo","ATs","A9s","A8s","A5s","A4s","A3s","A2s","K9s","K8s","Q9s"],
      call:     ["88","77","66","55","44","33","22","A7s","A6s","ATo","A9o","KQs","KJs","KTs","KQo","KJo","K7s","K6s","K5s","K4s","K3s","QJs","QTs","Q8s","Q7s","Q6s","QJo","JTs","J9s","J8s","J7s","J6s","JTo","T9s","T8s","T7s","T6s","T9o","98s","97s","96s","95s","98o","87s","86s","85s","84s","76s","75s","74s","65s","64s","63s","54s","53s","52s","43s","42s","32s"]
    },
    SB: {
      threeBet: ["AA","KK","QQ","JJ","TT","99","88","AKs","AKo","AQs","AQo","AJs","AJo","ATs","ATo","A9s","A8s","A7s","A5s","A4s","A3s","A2s","KQs","KQo","KJs","KTs","K9s","K8s","QJs","QTs","Q9s","JTs","J9s","T9s"],
      call:     ["77","66","55","44","33","22","A9o","A8o","A7o","A6s","A6o","A5o","A4o","A3o","A2o","KJo","KTo","K9o","K7s","K6s","K5s","K4s","K3s","K2s","K8o","QTo","Q8s","Q7s","Q6s","Q5s","Q9o","J8s","J7s","J6s","J5s","J9o","T8s","T7s","T6s","T8o","98o","97s","96s","95s","87o","86s","85s","84s","76o","75s","74s","73s","65o","64s","63s","62s","54o","53s","52s","43s","42s","32s"]
    }
  }
};


// =============================================
//  FACING 3-BET — when you opened and get 3-bet
//  FACING_3BET[openerPos] = { fourBet, call }
// =============================================
var FACING_3BET = {
  UTG: {
    fourBet: ["AA","KK"],
    call:    ["QQ","JJ","AKs","AKo"]
  },
  HJ: {
    fourBet: ["AA","KK","AKs"],
    call:    ["QQ","JJ","TT","AKo","AQs"]
  },
  CO: {
    fourBet: ["AA","KK","AKs","A5s"],
    call:    ["QQ","JJ","TT","AKo","AQs","AJs","KQs"]
  },
  BTN: {
    fourBet: ["AA","KK","QQ","AKs","A5s","A4s"],
    call:    ["JJ","TT","99","AKo","AQs","AQo","AJs","ATs","KQs","KJs"]
  },
  SB: {
    fourBet: ["AA","KK","QQ","AKs","AKo","A5s"],
    call:    ["JJ","TT","AQs","AJs","KQs"]
  }
};


// =============================================
//  COLD vs 3-BET — when you haven't acted and face a 3-bet
//  (Very tight — cold 4-bet/call is rare)
//  COLD_VS_3BET[heroPos] = { fourBet, call }
// =============================================
var COLD_VS_3BET = {
  CO:  { fourBet: ["AA","KK"], call: [] },
  BTN: { fourBet: ["AA","KK"], call: ["QQ","AKs"] },
  SB:  { fourBet: ["AA","KK"], call: [] },
  BB:  { fourBet: ["AA","KK","QQ"], call: ["JJ","TT","AKs","AKo"] }
};


// =============================================
//  API functions
// =============================================

function getRangeSet(position) {
  return new Set(RANGES[position]?.raise || []);
}

function getPositions() {
  return Object.keys(RANGES);
}

function getFacingRaiseData(heroPos, openerPos) {
  var data = FACING_RAISE[heroPos]?.[openerPos];
  if (!data) return null;
  return { threeBet: new Set(data.threeBet), call: new Set(data.call) };
}

function getFacing3BetData(openerPos) {
  var data = FACING_3BET[openerPos];
  if (!data) return null;
  return { fourBet: new Set(data.fourBet), call: new Set(data.call) };
}

function getColdVs3BetData(heroPos) {
  var data = COLD_VS_3BET[heroPos];
  if (!data) return null;
  return { fourBet: new Set(data.fourBet), call: new Set(data.call) };
}

function getAllScenarios() {
  var scenarios = [];
  for (var hero of Object.keys(FACING_RAISE)) {
    for (var opener of Object.keys(FACING_RAISE[hero])) {
      scenarios.push({ heroPos: hero, openerPos: opener });
    }
  }
  return scenarios;
}

// Determine correct action vs a raise
function getCorrectActionVsRaise(heroPos, openerPos, handLabel) {
  var data = getFacingRaiseData(heroPos, openerPos);
  if (!data) return "fold";
  if (data.threeBet.has(handLabel)) return "3bet";
  if (data.call.has(handLabel))     return "call";
  return "fold";
}

// Determine correct action when you opened and face a 3-bet
function getCorrectActionVs3Bet(openerPos, handLabel) {
  var data = getFacing3BetData(openerPos);
  if (!data) return "fold";
  if (data.fourBet.has(handLabel)) return "4bet";
  if (data.call.has(handLabel))    return "call";
  return "fold";
}

// Determine correct action when cold-facing a 3-bet
function getCorrectActionColdVs3Bet(heroPos, handLabel) {
  var data = getColdVs3BetData(heroPos);
  if (!data) return "fold";
  if (data.fourBet.has(handLabel)) return "4bet";
  if (data.call.has(handLabel))    return "call";
  return "fold";
}


// =============================================
//  Simulation: decide what an AI player does
// =============================================
// potState: "unopened" | "raised" | "3bet"
// Returns: "fold", "raise", "call", "3bet", "4bet"
function getAIAction(playerPos, handLabel, potState, raiserPos) {
  if (potState === "unopened") {
    // RFI decision
    var rfi = getRangeSet(playerPos);
    return rfi.has(handLabel) ? "raise" : "fold";
  }

  if (potState === "raised") {
    // Facing an open
    var frData = getFacingRaiseData(playerPos, raiserPos);
    if (!frData) {
      // No specific data — use a very tight default
      var tightSet = new Set(["AA","KK","QQ","AKs"]);
      if (tightSet.has(handLabel)) return "3bet";
      return "fold";
    }
    if (frData.threeBet.has(handLabel)) return "3bet";
    if (frData.call.has(handLabel))     return "call";
    return "fold";
  }

  if (potState === "3bet") {
    // Facing a 3-bet — very tight
    var coldData = getColdVs3BetData(playerPos);
    if (!coldData) {
      // Ultra-tight fallback
      var ultraTight = new Set(["AA","KK"]);
      return ultraTight.has(handLabel) ? "call" : "fold";
    }
    if (coldData.fourBet.has(handLabel)) return "4bet";
    if (coldData.call.has(handLabel))    return "call";
    return "fold";
  }

  return "fold";
}

// Generate a random hand label from the 13x13 grid
function randomHandLabel() {
  var r = Math.floor(Math.random() * 13);
  var c = Math.floor(Math.random() * 13);
  return { row: r, col: c, label: getHandLabel(r, c) };
}
