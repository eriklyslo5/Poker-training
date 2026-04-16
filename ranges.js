// GTO Preflop Opening Ranges for 6-Max Cash Games
// Actions: "raise" = open raise, "fold" = fold
// Positions: UTG, HJ (Hijack), CO (Cutoff), BTN (Button), SB (Small Blind)
//
// Hand notation:
//   "AKs" = suited, "AKo" = offsuit, "AA" = pair
//
// Ranges based on commonly accepted GTO 6-max opening strategies (RFI only).

const RANGES = {
  UTG: {
    raise: [
      // Pairs
      "AA","KK","QQ","JJ","TT","99","88","77","66",
      // Suited broadways
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s",
      "QJs","QTs","Q9s",
      "JTs","J9s",
      "T9s","T8s",
      "98s","87s","76s","65s",
      // Offsuit broadways
      "AKo","AQo","AJo","ATo",
      "KQo","KJo",
      "QJo"
    ]
  },

  HJ: {
    raise: [
      // Pairs
      "AA","KK","QQ","JJ","TT","99","88","77","66","55",
      // Suited
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s",
      "QJs","QTs","Q9s","Q8s",
      "JTs","J9s","J8s",
      "T9s","T8s",
      "98s","97s",
      "87s","76s","65s","54s",
      // Offsuit
      "AKo","AQo","AJo","ATo","A9o",
      "KQo","KJo","KTo",
      "QJo","QTo",
      "JTo"
    ]
  },

  CO: {
    raise: [
      // Pairs
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      // Suited
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
      // Offsuit
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
      // Pairs
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      // Suited
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
      // Offsuit
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
      // Pairs
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      // Suited
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
      // Offsuit
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
  }
};

// Full 13x13 grid labels (rows = first card, cols = second card)
// Above diagonal = suited, below diagonal = offsuit, diagonal = pairs
const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

function getHandLabel(row, col) {
  if (row === col) return RANKS[row] + RANKS[col];           // pair
  if (col > row) return RANKS[row] + RANKS[col] + "s";      // suited
  return RANKS[col] + RANKS[row] + "o";                      // offsuit
}

// Build a Set for quick lookup
function getRangeSet(position) {
  return new Set(RANGES[position]?.raise || []);
}

// Get all positions
function getPositions() {
  return Object.keys(RANGES);
}
