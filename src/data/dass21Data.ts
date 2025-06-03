// DASS-21 Questions array
export const DASS21_QUESTIONS = [
  "I found it hard to wind down",
  "I was aware of dryness of my mouth",
  "I couldn't seem to experience any positive feeling at all",
  "I experienced breathing difficulty (eg. excessively rapid breathing, breathlessness in the absence of physical exertion)",
  "I found it difficult to work up the initiative to do things",
  "I tended to over-react to situations",
  "I experienced trembling (eg. in the hands)",
  "I felt that I was using a lot of nervous energy",
  "I was worried about situations in which I might panic and make a fool of myself",
  "I felt that I had nothing to look forward to",
  "I found myself getting agitated",
  "I found it difficult to relax",
  "I felt down-hearted and blue",
  "I was intolerant of anything that kept me from getting on with what I was doing",
  "I felt I was close to panic",
  "I was unable to become enthusiastic about anything",
  "I felt I wasn't worth much as a person",
  "I felt that I was rather touchy",
  "I was aware of the action of my heart in the absence of physical exertion (eg. sense of heart rate increase, heart missing a beat)",
  "I felt scared without any good reason",
  "I felt that life was meaningless"
];

// Categories for each question (used for scoring)
export const QUESTION_CATEGORIES = [
  "stress", "anxiety", "depression", "anxiety", "depression", "stress", "anxiety",
  "stress", "anxiety", "depression", "stress", "stress", "depression", "stress",
  "anxiety", "depression", "depression", "stress", "anxiety", "anxiety", "depression"
];

// DASS-21 severity levels
export const DASS21_SEVERITY = {
  depression: [
    { range: [0, 9], level: 'normal', color: 'green' },
    { range: [10, 13], level: 'mild', color: 'blue' },
    { range: [14, 20], level: 'moderate', color: 'yellow' },
    { range: [21, 27], level: 'severe', color: 'orange' },
    { range: [28, 42], level: 'extremely severe', color: 'red' }
  ],
  anxiety: [
    { range: [0, 7], level: 'normal', color: 'green' },
    { range: [8, 9], level: 'mild', color: 'blue' },
    { range: [10, 14], level: 'moderate', color: 'yellow' },
    { range: [15, 19], level: 'severe', color: 'orange' },
    { range: [20, 42], level: 'extremely severe', color: 'red' }
  ],
  stress: [
    { range: [0, 14], level: 'normal', color: 'green' },
    { range: [15, 18], level: 'mild', color: 'blue' },
    { range: [19, 25], level: 'moderate', color: 'yellow' },
    { range: [26, 33], level: 'severe', color: 'orange' },
    { range: [34, 42], level: 'extremely severe', color: 'red' }
  ]
};

// DASS-21 response options
export const RESPONSE_OPTIONS = [
  { value: 0, text: "Did not apply to me at all" },
  { value: 1, text: "Applied to me to some degree, or some of the time" },
  { value: 2, text: "Applied to me to a considerable degree or a good part of time" },
  { value: 3, text: "Applied to me very much or most of the time" }
];
