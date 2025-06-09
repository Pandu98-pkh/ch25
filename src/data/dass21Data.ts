// DASS-21 Questions array with bilingual support
export const DASS21_QUESTIONS = [
  {
    id: "Saya merasa sulit untuk bersantai",
    en: "I found it hard to wind down"
  },
  {
    id: "Saya menyadari mulut saya kering",
    en: "I was aware of dryness of my mouth"
  },
  {
    id: "Saya sepertinya tidak bisa merasakan perasaan positif sama sekali",
    en: "I couldn't seem to experience any positive feeling at all"
  },
  {
    id: "Saya mengalami kesulitan bernapas (misalnya bernapas terlalu cepat, sesak napas tanpa aktivitas fisik)",
    en: "I experienced breathing difficulty (eg. excessively rapid breathing, breathlessness in the absence of physical exertion)"
  },
  {
    id: "Saya merasa sulit untuk memulai melakukan sesuatu",
    en: "I found it difficult to work up the initiative to do things"
  },
  {
    id: "Saya cenderung bereaksi berlebihan terhadap situasi",
    en: "I tended to over-react to situations"
  },
  {
    id: "Saya mengalami gemetar (misalnya di tangan)",
    en: "I experienced trembling (eg. in the hands)"
  },
  {
    id: "Saya merasa menggunakan banyak energi saraf",
    en: "I felt that I was using a lot of nervous energy"
  },
  {
    id: "Saya khawatir tentang situasi di mana saya mungkin panik dan membuat diri saya terlihat bodoh",
    en: "I was worried about situations in which I might panic and make a fool of myself"
  },
  {
    id: "Saya merasa tidak ada yang bisa saya nantikan",
    en: "I felt that I had nothing to look forward to"
  },
  {
    id: "Saya mendapati diri saya menjadi gelisah",
    en: "I found myself getting agitated"
  },
  {
    id: "Saya merasa sulit untuk rileks",
    en: "I found it difficult to relax"
  },
  {
    id: "Saya merasa sedih dan putus asa",
    en: "I felt down-hearted and blue"
  },
  {
    id: "Saya tidak toleran terhadap hal apapun yang menghalangi saya melakukan apa yang ingin saya lakukan",
    en: "I was intolerant of anything that kept me from getting on with what I was doing"
  },
  {
    id: "Saya merasa hampir panik",
    en: "I felt I was close to panic"
  },
  {
    id: "Saya tidak bisa menjadi antusias tentang apapun",
    en: "I was unable to become enthusiastic about anything"
  },
  {
    id: "Saya merasa tidak berharga sebagai seseorang",
    en: "I felt I wasn't worth much as a person"
  },
  {
    id: "Saya merasa agak sensitif",
    en: "I felt that I was rather touchy"
  },
  {
    id: "Saya menyadari detak jantung saya tanpa aktivitas fisik (misalnya merasakan detak jantung meningkat, jantung berdebar)",
    en: "I was aware of the action of my heart in the absence of physical exertion (eg. sense of heart rate increase, heart missing a beat)"
  },
  {
    id: "Saya merasa takut tanpa alasan yang jelas",
    en: "I felt scared without any good reason"
  },
  {
    id: "Saya merasa hidup tidak berarti",
    en: "I felt that life was meaningless"
  }
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
