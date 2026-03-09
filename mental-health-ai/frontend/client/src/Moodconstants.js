// Maps backend severity ("High"/"Moderate"/"Low") → mood display
// Also maps mood label ("Great"/"Good"/"Okay"/"Bad"/"Awful") → display

export const SEV_TO_MOOD = {
  // Backend severity values (capital first letter)
  high:     { value: 1, emoji: "😞", color: "#EF5350", label: "Awful"  },
  moderate: { value: 2, emoji: "😕", color: "#7BB8D9", label: "Bad"    },
  low:      { value: 4, emoji: "🙂", color: "#7BC67E", label: "Good"   },

  // Legacy keys (in case old sessions exist)
  minimal:  { value: 5, emoji: "😊", color: "#4CAF72", label: "Great"  },
  mild:     { value: 4, emoji: "🙂", color: "#7BC67E", label: "Good"   },
  severe:   { value: 1, emoji: "😞", color: "#EF5350", label: "Awful"  },
};

// Maps backend mood string → display  
export const MOOD_TO_DISPLAY = {
  "Great": { value: 5, emoji: "😊", color: "#4CAF72" },
  "Good":  { value: 4, emoji: "🙂", color: "#7BC67E" },
  "Okay":  { value: 3, emoji: "😐", color: "#E8B84B" },
  "Bad":   { value: 2, emoji: "😕", color: "#7BB8D9" },
  "Awful": { value: 1, emoji: "😞", color: "#EF5350" },
};

export const DEFAULT_MOOD = { value: 3, emoji: "😐", color: "#E8B84B", label: "Okay" };