import { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Brain,
  AlertCircle,
  CheckCircle,
  BarChart3,
  TrendingDown,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAssessments } from '../contexts/AssessmentContext';

// Import test data
import { DASS21_QUESTIONS, QUESTION_CATEGORIES } from '../data/dass21Data';

// PHQ-9 Questions with bilingual support
const PHQ9_QUESTIONS = [
  {
    id: "Kurang minat atau kesenangan dalam melakukan hal-hal",
    en: "Little interest or pleasure in doing things"
  },
  {
    id: "Merasa sedih, depresi, atau putus asa",
    en: "Feeling down, depressed, or hopeless"
  },
  {
    id: "Kesulitan tertidur atau tetap tidur, atau tidur terlalu banyak",
    en: "Trouble falling or staying asleep, or sleeping too much"
  },
  {
    id: "Merasa lelah atau memiliki sedikit energi",
    en: "Feeling tired or having little energy"
  },
  {
    id: "Nafsu makan buruk atau makan berlebihan",
    en: "Poor appetite or overeating"
  },
  {
    id: "Merasa buruk tentang diri sendiri atau merasa gagal atau mengecewakan diri sendiri atau keluarga",
    en: "Feeling bad about yourself or that you are a failure or have let yourself or your family down"
  },
  {
    id: "Kesulitan berkonsentrasi pada hal-hal seperti membaca koran atau menonton televisi",
    en: "Trouble concentrating on things, such as reading the newspaper or watching television"
  },
  {
    id: "Bergerak atau berbicara sangat lambat sehingga orang lain dapat memperhatikan. Atau sebaliknya — sangat gelisah sehingga bergerak lebih banyak dari biasanya",
    en: "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual"
  },
  {
    id: "Pikiran bahwa lebih baik mati atau menyakiti diri sendiri dengan cara tertentu",
    en: "Thoughts that you would be better off dead or of hurting yourself in some way"
  }
];

// GAD-7 Questions with bilingual support
const GAD7_QUESTIONS = [
  {
    id: "Merasa gugup, cemas, atau tegang",
    en: "Feeling nervous, anxious, or on edge"
  },
  {
    id: "Tidak dapat menghentikan atau mengendalikan kekhawatiran",
    en: "Not being able to stop or control worrying"
  },
  {
    id: "Terlalu khawatir tentang berbagai hal",
    en: "Worrying too much about different things"
  },
  {
    id: "Kesulitan untuk rileks",
    en: "Trouble relaxing"
  },
  {
    id: "Sangat gelisah sehingga sulit untuk duduk diam",
    en: "Being so restless that it's hard to sit still"
  },
  {
    id: "Mudah kesal atau mudah tersinggung",
    en: "Becoming easily annoyed or irritable"
  },
  {
    id: "Merasa takut seolah-olah sesuatu yang mengerikan akan terjadi",
    en: "Feeling afraid as if something awful might happen"
  }
];

// Response options for all tests
const RESPONSE_OPTIONS = [
  { value: 0, text: "Not at all", label: "Tidak sama sekali" },
  { value: 1, text: "Several days", label: "Beberapa hari" },
  { value: 2, text: "More than half the days", label: "Lebih dari setengah hari" },
  { value: 3, text: "Nearly every day", label: "Hampir setiap hari" }
];

// Test phases
enum TestPhase {
  INFO = 'INFO',
  PHQ9 = 'PHQ9',
  DASS21 = 'DASS21',
  GAD7 = 'GAD7',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS'
}

export default function IntegratedMentalHealthTestPage() {
  const navigate = useNavigate();
  const { addAssessment } = useAssessments();
  
  // Test state
  const [currentPhase, setCurrentPhase] = useState<TestPhase>(TestPhase.INFO);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Responses for each test
  const [phq9Responses, setPhq9Responses] = useState<number[]>(Array(PHQ9_QUESTIONS.length).fill(-1));
  const [dass21Responses, setDass21Responses] = useState<number[]>(Array(DASS21_QUESTIONS.length).fill(-1));
  const [gad7Responses, setGad7Responses] = useState<number[]>(Array(GAD7_QUESTIONS.length).fill(-1));
  
  // Exit confirmation state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    // Timer (total 15 minutes for all tests)
  const initialTime = 900; // 15 minutes
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Start countdown timer when test begins
  const startTimer = () => {
    if (!timerStarted) {
      setTimerStarted(true);
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp) {
      handleSubmitAllTests();
    }
  }, [isTimeUp]);

  // Get current questions and responses based on phase
  const getCurrentQuestions = () => {
    switch (currentPhase) {
      case TestPhase.PHQ9: return PHQ9_QUESTIONS;
      case TestPhase.DASS21: return DASS21_QUESTIONS;
      case TestPhase.GAD7: return GAD7_QUESTIONS;
      default: return [];
    }
  };

  const getCurrentResponses = () => {
    switch (currentPhase) {
      case TestPhase.PHQ9: return phq9Responses;
      case TestPhase.DASS21: return dass21Responses;
      case TestPhase.GAD7: return gad7Responses;
      default: return [];
    }
  };

  const setCurrentResponses = (responses: number[]) => {
    switch (currentPhase) {
      case TestPhase.PHQ9: setPhq9Responses(responses); break;
      case TestPhase.DASS21: setDass21Responses(responses); break;
      case TestPhase.GAD7: setGad7Responses(responses); break;
    }  };
  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const currentResponses = getCurrentResponses();
    return currentResponses[currentQuestionIndex] !== -1;
  };

  // Check if we can navigate forward (only if answered)
  const canNavigateForward = () => {
    return isCurrentQuestionAnswered();
  };

  // Handle exit confirmation
  const handleExitAttempt = () => {
    setShowExitConfirmation(true);
  };

  const confirmExit = () => {
    navigate('/app/mental-health');
  };

  const cancelExit = () => {
    setShowExitConfirmation(false);
  };

  // Navigation functions - Modified to check if answered
  const goToNextQuestion = () => {
    if (!canNavigateForward()) return; // Don't navigate if not answered
    
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next phase
      moveToNextPhase();
    }
  };

  const goToPreviousQuestion = () => {
    // Disabled - no back navigation allowed
    return;
  };

  const moveToNextPhase = () => {
    setCurrentQuestionIndex(0);
    switch (currentPhase) {
      case TestPhase.PHQ9: 
        setCurrentPhase(TestPhase.DASS21);
        break;
      case TestPhase.DASS21:
        setCurrentPhase(TestPhase.GAD7);
        break;
      case TestPhase.GAD7:
        handleSubmitAllTests();
        break;
    }
  };
  // Answer selection - TIDAK langsung ke soal berikutnya
  const selectAnswer = (value: number) => {
    const currentResponses = getCurrentResponses();
    const newResponses = [...currentResponses];
    newResponses[currentQuestionIndex] = value;
    setCurrentResponses(newResponses);
  };
  // Calculate scores with reverse scoring (100 = normal)
  const calculateScores = () => {
    // PHQ-9 Score (0-27) - Normal scoring: 0 = sehat
    const phq9RawScore = phq9Responses.reduce((total, response) => total + (response >= 0 ? response : 0), 0);

    // DASS-21 Scores (each subscale 0-42) - Normal scoring: 0 = sehat
    const depressionRawScore = dass21Responses.filter((_, index) => QUESTION_CATEGORIES[index] === 'depression')
      .reduce((total, response) => total + (response >= 0 ? response * 2 : 0), 0);
    const anxietyRawScore = dass21Responses.filter((_, index) => QUESTION_CATEGORIES[index] === 'anxiety')
      .reduce((total, response) => total + (response >= 0 ? response * 2 : 0), 0);
    const stressRawScore = dass21Responses.filter((_, index) => QUESTION_CATEGORIES[index] === 'stress')
      .reduce((total, response) => total + (response >= 0 ? response * 2 : 0), 0);

    // GAD-7 Score (0-21) - Normal scoring: 0 = sehat
    const gad7RawScore = gad7Responses.reduce((total, response) => total + (response >= 0 ? response : 0), 0);

    // Overall Mental Health Score - Reverse scoring: 100 = sehat
    // Calculate average of normalized scores (0-100) then reverse it
    const normalizedPhq9 = (phq9RawScore / 27) * 100;
    const normalizedDepression = (depressionRawScore / 42) * 100;
    const normalizedAnxiety = (anxietyRawScore / 42) * 100;
    const normalizedStress = (stressRawScore / 42) * 100;
    const normalizedGad7 = (gad7RawScore / 21) * 100;
    
    const averageNormalizedScore = (normalizedPhq9 + normalizedDepression + normalizedAnxiety + normalizedStress + normalizedGad7) / 5;
    const overallScore = Math.round(100 - averageNormalizedScore);    return {
      overall: overallScore,
      phq9: phq9RawScore,
      depression: depressionRawScore,
      anxiety: anxietyRawScore,
      stress: stressRawScore,
      gad7: gad7RawScore,
      rawScores: {
        phq9: phq9RawScore,
        gad7: gad7RawScore,
        depression: depressionRawScore,
        anxiety: anxietyRawScore,
        stress: stressRawScore
      }
    };
  };
  // Generate comprehensive analysis based on scores
  const generateAnalysis = (scores: any) => {
    const { overall, phq9, depression, anxiety, stress, gad7 } = scores;
    
    let analysis = `HASIL ANALISIS KESEHATAN MENTAL KOMPREHENSIF\n`;
    analysis += `${'='.repeat(60)}\n\n`;
    
    // Header dengan timestamp
    // analysis += `Tanggal Asesmen: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}\n`;
    // analysis += `Durasi Pengerjaan: ${Math.floor((initialTime - timeRemaining) / 60)} menit ${(initialTime - timeRemaining) % 60} detik\n\n`;
    
    // Overall score dengan visualisasi
    //analysis += `🎯 SKOR KESEHATAN MENTAL KESELURUHAN: ${overall}/100\n`;
    //const scoreBar = '█'.repeat(Math.floor(overall / 5)) + '░'.repeat(20 - Math.floor(overall / 5));
    //analysis += `   [${scoreBar}] ${overall}%\n\n`;
    
    // Status dan interpretasi
    if (overall >= 85) {
      analysis += `📊 STATUS: KESEHATAN MENTAL SANGAT BAIK 💚\n`;
      analysis += `✨ Interpretasi: Anda memiliki kesehatan mental yang sangat baik dengan resiliensi tinggi.\n`;
      analysis += `   Kemampuan mengelola stres dan emosi berada pada level optimal.\n\n`;
    } else if (overall >= 70) {
      analysis += `📊 STATUS: KESEHATAN MENTAL BAIK ✅\n`;
      analysis += `✨ Interpretasi: Kondisi kesehatan mental Anda cukup baik, namun ada beberapa area\n`;
      analysis += `   yang memerlukan perhatian untuk mencegah penurunan lebih lanjut.\n\n`;
    } else if (overall >= 55) {
      analysis += `📊 STATUS: MEMERLUKAN PERHATIAN KHUSUS ⚠️\n`;
      analysis += `✨ Interpretasi: Terdapat gejala yang signifikan dan memerlukan intervensi profesional.\n`;
      analysis += `   Kondisi ini dapat mempengaruhi fungsi sehari-hari dan kualitas hidup.\n\n`;
    } else {
      analysis += `📊 STATUS: MEMERLUKAN BANTUAN SEGERA 🚨\n`;
      analysis += `✨ Interpretasi: Kondisi ini menunjukkan gejala berat yang memerlukan perhatian\n`;
      analysis += `   medis dan psikologis segera untuk mencegah komplikasi lebih lanjut.\n\n`;
    }

    // Analisis per domain dengan kategori severitas
    analysis += `📋 ANALISIS RINCI PER DOMAIN:\n`;
    analysis += `${'-'.repeat(50)}\n\n`;
    
    // PHQ-9 Analysis
    const phq9Severity = phq9 <= 4 ? 'Minimal' : phq9 <= 9 ? 'Ringan' : phq9 <= 14 ? 'Sedang' : phq9 <= 19 ? 'Sedang-Berat' : 'Berat';
    analysis += `🧠 DEPRESI (PHQ-9): ${phq9}/27 - ${phq9Severity}\n`;
    if (phq9 <= 4) {
      analysis += `   ✅ Tidak ada atau minimal gejala depresi. Mood dan motivasi dalam kondisi baik.\n`;
    } else if (phq9 <= 9) {
      analysis += `   ⚡ Gejala depresi ringan. Mungkin mengalami penurunan mood sesekali.\n`;
    } else if (phq9 <= 14) {
      analysis += `   ⚠️ Gejala depresi sedang. Mempengaruhi aktivitas sehari-hari.\n`;
    } else if (phq9 <= 19) {
      analysis += `   🔴 Gejala depresi sedang-berat. Gangguan signifikan pada fungsi harian.\n`;
    } else {
      analysis += `   🚨 Gejala depresi berat. Memerlukan intervensi segera.\n`;
    }
    
    // Check for specific PHQ-9 symptoms
    const highPhq9Items = phq9Responses
      .map((value, index) => ({ value, index }))
      .filter(item => item.value >= 2)
      .sort((a, b) => b.value - a.value);
    
    if (highPhq9Items.length > 0) {
      analysis += `   🎯 Gejala utama: `;
      const symptoms = [
        'kehilangan minat', 'perasaan sedih', 'gangguan tidur', 'kelelahan',
        'masalah nafsu makan', 'perasaan gagal', 'kesulitan konsentrasi',
        'gerakan lambat/gelisah', 'pikiran berbahaya'
      ];
      const symptomNames = highPhq9Items.map(item => symptoms[item.index]);
      analysis += symptomNames.slice(0, 3).join(', ') + '\n';
    }
    analysis += '\n';

    // DASS-21 Depression Analysis
    const dassDepSeverity = depression <= 9 ? 'Normal' : depression <= 13 ? 'Ringan' : depression <= 20 ? 'Sedang' : depression <= 27 ? 'Berat' : 'Sangat Berat';
    analysis += `😔 DEPRESI (DASS-21): ${depression}/42 - ${dassDepSeverity}\n`;
    if (depression <= 9) {
      analysis += `   ✅ Level depresi dalam rentang normal.\n`;
    } else if (depression <= 13) {
      analysis += `   ⚡ Depresi ringan, dapat dikelola dengan strategi self-help.\n`;
    } else if (depression <= 20) {
      analysis += `   ⚠️ Depresi sedang, disarankan konsultasi profesional.\n`;
    } else {
      analysis += `   🚨 Depresi berat, memerlukan intervensi segera.\n`;
    }
    analysis += '\n';

    // DASS-21 Anxiety Analysis
    const dassAnxSeverity = anxiety <= 7 ? 'Normal' : anxiety <= 9 ? 'Ringan' : anxiety <= 14 ? 'Sedang' : anxiety <= 19 ? 'Berat' : 'Sangat Berat';
    analysis += `😰 KECEMASAN (DASS-21): ${anxiety}/42 - ${dassAnxSeverity}\n`;
    if (anxiety <= 7) {
      analysis += `   ✅ Level kecemasan dalam rentang normal.\n`;
    } else if (anxiety <= 9) {
      analysis += `   ⚡ Kecemasan ringan, dapat dikelola dengan teknik relaksasi.\n`;
    } else if (anxiety <= 14) {
      analysis += `   ⚠️ Kecemasan sedang, pertimbangkan terapi atau konseling.\n`;
    } else {
      analysis += `   🚨 Kecemasan berat, memerlukan bantuan profesional.\n`;
    }
    analysis += '\n';

    // DASS-21 Stress Analysis
    const dassStrSeverity = stress <= 14 ? 'Normal' : stress <= 18 ? 'Ringan' : stress <= 25 ? 'Sedang' : stress <= 33 ? 'Berat' : 'Sangat Berat';
    analysis += `😤 STRES (DASS-21): ${stress}/42 - ${dassStrSeverity}\n`;
    if (stress <= 14) {
      analysis += `   ✅ Level stres dalam rentang normal.\n`;
    } else if (stress <= 18) {
      analysis += `   ⚡ Stres ringan, perlu perbaikan manajemen stres.\n`;
    } else if (stress <= 25) {
      analysis += `   ⚠️ Stres sedang, butuh strategi coping yang lebih efektif.\n`;
    } else {
      analysis += `   🚨 Stres berat, dapat mengganggu fungsi fisik dan mental.\n`;
    }
    analysis += '\n';

    // GAD-7 Analysis
    const gad7Severity = gad7 <= 4 ? 'Minimal' : gad7 <= 9 ? 'Ringan' : gad7 <= 14 ? 'Sedang' : 'Berat';
    analysis += `😟 KECEMASAN UMUM (GAD-7): ${gad7}/21 - ${gad7Severity}\n`;
    if (gad7 <= 4) {
      analysis += `   ✅ Tidak ada atau minimal kecemasan umum.\n`;
    } else if (gad7 <= 9) {
      analysis += `   ⚡ Kecemasan umum ringan, dapat dikelola dengan self-care.\n`;
    } else if (gad7 <= 14) {
      analysis += `   ⚠️ Kecemasan umum sedang, pertimbangkan konseling.\n`;
    } else {
      analysis += `   🚨 Kecemasan umum berat, memerlukan evaluasi klinis.\n`;
    }
    analysis += '\n';

    // Risk factors and patterns
    analysis += `🔍 ANALISIS POLA DAN FAKTOR RISIKO:\n`;
    analysis += `${'-'.repeat(40)}\n`;
    
    const highestDomain = Math.max(phq9/27, depression/42, anxiety/42, stress/42, gad7/21);
    if (phq9/27 === highestDomain || depression/42 === highestDomain) {
      analysis += `• Domain utama yang terdampak: DEPRESI\n`;
      analysis += `  Fokus intervensi: Aktivasi perilaku, terapi kognitif\n`;
    } else if (anxiety/42 === highestDomain || gad7/21 === highestDomain) {
      analysis += `• Domain utama yang terdampak: KECEMASAN\n`;
      analysis += `  Fokus intervensi: Teknik relaksasi, terapi eksposur\n`;
    } else if (stress/42 === highestDomain) {
      analysis += `• Domain utama yang terdampak: STRES\n`;
      analysis += `  Fokus intervensi: Manajemen stres, mindfulness\n`;
    }

    // Comorbidity analysis
    const significantDomains = [
      phq9 > 9 ? 'PHQ-9' : null,
      depression > 13 ? 'DASS-Depresi' : null,
      anxiety > 9 ? 'DASS-Kecemasan' : null,
      stress > 18 ? 'DASS-Stres' : null,
      gad7 > 9 ? 'GAD-7' : null
    ].filter(Boolean);

    if (significantDomains.length > 1) {
      analysis += `• Komorbiditas: Terdapat ${significantDomains.length} domain dengan gejala signifikan\n`;
      analysis += `  (${significantDomains.join(', ')})\n`;
      analysis += `  Rekomendasi: Pendekatan terintegrasi dan holistik\n`;
    }
    analysis += '\n';

    // Detailed recommendations
    analysis += `💡 REKOMENDASI KOMPREHENSIF:\n`;
    analysis += `${'='.repeat(40)}\n\n`;
    
    analysis += `🏥 LANGKAH SEGERA:\n`;
    if (overall >= 85) {
      analysis += `• Pertahankan gaya hidup sehat yang sudah berjalan\n`;
      analysis += `• Lakukan asesmen berkala setiap 6 bulan\n`;
      analysis += `• Jadilah role model kesehatan mental bagi orang lain\n`;
    } else if (overall >= 70) {
      analysis += `• Evaluasi dan perbaiki area yang bermasalah\n`;
      analysis += `• Tingkatkan aktivitas self-care harian\n`;
      analysis += `• Asesmen lanjutan dalam 3 bulan\n`;
    } else if (overall >= 55) {
      analysis += `• WAJIB konsultasi dengan psikolog/konselor dalam 1-2 minggu\n`;
      analysis += `• Pertimbangkan psikoterapi (CBT, DBT, atau lainnya)\n`;
      analysis += `• Monitoring ketat oleh profesional kesehatan mental\n`;
    } else {
      analysis += `• SEGERA kunjungi psikiater atau layanan darurat mental health\n`;
      analysis += `• Evaluasi untuk kemungkinan medikasi\n`;
      analysis += `• Sistem dukungan 24/7 harus aktif\n`;
      analysis += `• Hospitalisasi mungkin diperlukan jika ada risiko tinggi\n`;
    }
    analysis += '\n';

    analysis += `🧘 STRATEGI SELF-CARE:\n`;
    analysis += `• Tidur: 7-9 jam per malam, jadwal konsisten\n`;
    analysis += `• Olahraga: Minimal 30 menit, 3x seminggu\n`;
    analysis += `• Nutrisi: Diet seimbang, hindari alkohol berlebihan\n`;
    analysis += `• Mindfulness: Meditasi 10-15 menit harian\n`;
    analysis += `• Sosial: Pertahankan koneksi dengan support system\n`;
    analysis += `• Hobi: Aktivitas yang memberikan kegembiraan\n\n`;

    analysis += `🎯 TERAPI YANG DIREKOMENDASIKAN:\n`;
    if (phq9 > 14 || depression > 20) {
      analysis += `• Cognitive Behavioral Therapy (CBT) untuk depresi\n`;
      analysis += `• Behavioral Activation untuk meningkatkan motivasi\n`;
    }
    if (anxiety > 14 || gad7 > 14) {
      analysis += `• Exposure and Response Prevention untuk kecemasan\n`;
      analysis += `• Acceptance and Commitment Therapy (ACT)\n`;
    }
    if (stress > 25) {
      analysis += `• Stress Management Training\n`;
      analysis += `• Mindfulness-Based Stress Reduction (MBSR)\n`;
    }
    analysis += `• Family/couples therapy jika diperlukan\n\n`;

    analysis += `📞 KONTAK DARURAT:\n`;
    analysis += `• Hotline Crisis: 119 ext 8\n`;
    analysis += `• Halo Kemkes: 1500-567\n`;
    analysis += `• LSM Jangan Bunuh Diri: 021-9696-9293\n`;
    analysis += `• Emergency: 112 atau rumah sakit terdekat\n\n`;

    // Special alerts
    if (phq9Responses[8] > 0) {
      analysis += `🚨 PERINGATAN KHUSUS:\n`;
      analysis += `Terdeteksi adanya pikiran untuk menyakiti diri sendiri.\n`;
      analysis += `SEGERA hubungi layanan krisis atau orang terdekat.\n`;
      analysis += `JANGAN biarkan diri sendiri tanpa pengawasan.\n\n`;
    }

    analysis += `📋 FOLLOW-UP:\n`;
    analysis += `• Asesmen ulang: ${overall >= 70 ? '3 bulan' : overall >= 55 ? '1 bulan' : '2 minggu'}\n`;
    analysis += `• Target perbaikan skor: +10-15 poin dalam 3 bulan\n`;
    analysis += `• Indikator keberhasilan: Perbaikan fungsi sehari-hari\n\n`;

    analysis += `${'-'.repeat(60)}\n`;
    analysis += `Catatan: Hasil ini adalah asesmen awal dan bukan diagnosis klinis.\n`;
    analysis += `Untuk diagnosis dan treatment plan yang akurat, konsultasi dengan\n`;
    analysis += `profesional kesehatan mental tetap diperlukan.\n`;    return analysis;
  };

  // Submit all tests dengan mode tunggu
  const handleSubmitAllTests = async () => {
    // Tampilkan mode processing
    setCurrentPhase(TestPhase.PROCESSING);
    
    // Simulasi waktu processing (2-3 detik)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const scores = calculateScores();
    
    // Create comprehensive assessment
    const risk: 'low' | 'moderate' | 'high' = scores.overall >= 70 ? 'low' : scores.overall >= 55 ? 'moderate' : 'high';
      // Flatten all responses into a single array
    const allResponses = [
      ...phq9Responses.map((value, index) => ({ 
        questionId: index + 1, 
        answer: value >= 0 ? value : 0,
        category: 'phq9',
        question: typeof PHQ9_QUESTIONS[index] === 'object' 
          ? PHQ9_QUESTIONS[index].id 
          : PHQ9_QUESTIONS[index]
      })),
      ...dass21Responses.map((value, index) => ({ 
        questionId: PHQ9_QUESTIONS.length + index + 1, 
        answer: value >= 0 ? value : 0,
        category: QUESTION_CATEGORIES[index],
        question: typeof DASS21_QUESTIONS[index] === 'object' 
          ? DASS21_QUESTIONS[index].id 
          : DASS21_QUESTIONS[index]
      })),
      ...gad7Responses.map((value, index) => ({ 
        questionId: PHQ9_QUESTIONS.length + DASS21_QUESTIONS.length + index + 1, 
        answer: value >= 0 ? value : 0,
        category: 'gad7',
        question: typeof GAD7_QUESTIONS[index] === 'object' 
          ? GAD7_QUESTIONS[index].id 
          : GAD7_QUESTIONS[index]
      }))
    ];// Generate comprehensive analysis
    const detailedAnalysis = generateAnalysis(scores);
    
    const assessment = {
      type: 'Integrated Mental Health',
      score: scores.overall,
      date: format(new Date(), 'yyyy-MM-dd'),
      risk,
      notes: detailedAnalysis, // Save the full detailed analysis
      responses: allResponses,
      subScores: {
        depression: scores.depression,
        anxiety: scores.anxiety,
        stress: scores.stress,
        overall: scores.overall,
        phq9: scores.phq9,
        gad7: scores.gad7
      },
      mlPrediction: {
        trend: scores.overall >= 70 ? 'stable' : scores.overall >= 55 ? 'stable' : 'worsening' as 'improving' | 'stable' | 'worsening',
        confidence: 0.85,
        nextPredictedScore: scores.overall
      }
    };    try {
      await addAssessment(assessment);
      setCurrentPhase(TestPhase.RESULTS);
    } catch (error) {
      console.error('Error saving integrated assessment:', error);
      setCurrentPhase(TestPhase.RESULTS);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColorClass = () => {
    if (timeRemaining < 60) return 'bg-red-600 text-white';
    if (timeRemaining < 300) return 'bg-yellow-600 text-white';
    return 'bg-indigo-600 text-white';
  };
  const getPhaseProgress = () => {
    const phases = [TestPhase.PHQ9, TestPhase.DASS21, TestPhase.GAD7];
    const currentPhaseIndex = phases.indexOf(currentPhase);
    const totalQuestions = PHQ9_QUESTIONS.length + DASS21_QUESTIONS.length + GAD7_QUESTIONS.length;
    
    let completedQuestions = 0;
    if (currentPhaseIndex > 0) completedQuestions += PHQ9_QUESTIONS.length;
    if (currentPhaseIndex > 1) completedQuestions += DASS21_QUESTIONS.length;
    completedQuestions += currentQuestionIndex;
    
    return (completedQuestions / totalQuestions) * 100;
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case TestPhase.PHQ9: return 'Test Depresi (PHQ-9)';
      case TestPhase.DASS21: return 'Test Depresi, Kecemasan & Stres (DASS-21)';
      case TestPhase.GAD7: return 'Test Kecemasan Umum (GAD-7)';
      default: return '';    }
  };

  // Informasi Detail Test Page
  if (currentPhase === TestPhase.INFO) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Test Kesehatan Mental Komprehensif
                </h1>
                <p className="text-blue-100 text-lg">
                  Evaluasi menyeluruh terhadap kondisi kesehatan mental Anda
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                  Tentang Test Ini
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Test ini adalah kombinasi dari tiga instrumen penilaian kesehatan mental yang telah tervalidasi secara klinis: 
                    <strong> PHQ-9</strong> untuk mengukur tingkat depresi, <strong>DASS-21</strong> untuk mengevaluasi depresi, 
                    kecemasan, dan stres, serta <strong>GAD-7</strong> untuk mengidentifikasi gangguan kecemasan umum.
                  </p>
                </div>
              </div>

              {/* Test Components */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Komponen Test</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PHQ-9 */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-purple-900">PHQ-9</h4>
                    </div>
                    <p className="text-purple-800 text-sm mb-2"><strong>Fokus:</strong> Depresi</p>
                    <p className="text-purple-800 text-sm mb-2"><strong>Jumlah Pertanyaan:</strong> 9</p>
                    <p className="text-purple-700 text-sm">
                      Mengukur gejala depresi mayor berdasarkan kriteria DSM-5
                    </p>
                  </div>

                  {/* DASS-21 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <BarChart3 className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h4 className="font-semibold text-yellow-900">DASS-21</h4>
                    </div>
                    <p className="text-yellow-800 text-sm mb-2"><strong>Fokus:</strong> Depresi, Kecemasan, Stres</p>
                    <p className="text-yellow-800 text-sm mb-2"><strong>Jumlah Pertanyaan:</strong> 21</p>
                    <p className="text-yellow-700 text-sm">
                      Mengevaluasi tiga domain utama kesehatan mental secara komprehensif
                    </p>
                  </div>

                  {/* GAD-7 */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <AlertCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-green-900">GAD-7</h4>
                    </div>
                    <p className="text-green-800 text-sm mb-2"><strong>Fokus:</strong> Kecemasan Umum</p>
                    <p className="text-green-800 text-sm mb-2"><strong>Jumlah Pertanyaan:</strong> 7</p>
                    <p className="text-green-700 text-sm">
                      Mengidentifikasi gejala gangguan kecemasan generalisata
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                  Informasi Penting
                </h3>
                <div className="space-y-4">
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-amber-800">Waktu Pengerjaan</h4>
                        <p className="text-sm text-amber-700">
                          Total waktu: <strong>15 menit</strong> untuk menyelesaikan seluruh test (37 pertanyaan)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">Sistem Penilaian</h4>
                        <p className="text-sm text-blue-700">
                          <strong>Skor 100 = Kondisi mental sangat baik</strong><br/>
                          Semakin rendah skor = Memerlukan lebih banyak perhatian
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Brain className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-purple-800">Kerahasiaan</h4>
                        <p className="text-sm text-purple-700">
                          Semua jawaban Anda bersifat rahasia dan hanya digunakan untuk evaluasi kesehatan mental
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Petunjuk Pengerjaan</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                      <span>Jawablah semua pertanyaan berdasarkan <strong>perasaan dan pengalaman Anda dalam 2 minggu terakhir</strong></span>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                      <span>Pilih opsi yang paling menggambarkan kondisi Anda dengan jujur</span>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                      <span>Setelah memilih jawaban, klik tombol <strong>"Selanjutnya"</strong> untuk melanjutkan ke pertanyaan berikutnya</span>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                      <span>Anda dapat kembali ke pertanyaan sebelumnya menggunakan tombol <strong>"Sebelumnya"</strong></span>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">5</span>
                      <span>Timer akan dimulai setelah Anda klik <strong>"Mulai Test"</strong></span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Response Scale */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skala Jawaban</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {RESPONSE_OPTIONS.map((option, index) => (
                      <div key={option.value} className="p-4 text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-yellow-500' : 
                          index === 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          {option.value}
                        </div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500 mt-1">{option.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    Penting untuk Diketahui
                  </h4>
                  <ul className="space-y-2 text-red-800 text-sm">
                    <li>• Test ini adalah <strong>alat skrining awal</strong> dan bukan pengganti diagnosis klinis</li>
                    <li>• Hasil test memberikan gambaran umum kondisi kesehatan mental Anda</li>
                    <li>• Jika hasil menunjukkan gejala yang signifikan, segera konsultasi dengan profesional kesehatan mental</li>
                    <li>• Dalam kondisi darurat atau ada pikiran untuk menyakiti diri, segera hubungi layanan krisis</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setCurrentPhase(TestPhase.PHQ9);
                    startTimer();
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Mulai Test Sekarang
                  </div>
                </button>
                <button
                  onClick={() => navigate('/app/mental-health')}
                  className="px-8 py-4 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing/Loading state
  if (currentPhase === TestPhase.PROCESSING) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-xl rounded-xl p-8 text-center">
            {/* Animated Brain Icon */}
            <div className="mb-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Brain className="h-10 w-10 text-blue-600 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Menganalisis Hasil Test
            </h2>
            <p className="text-gray-600 mb-6">
              Sistem sedang memproses jawaban Anda dan menyiapkan analisis komprehensif...
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>

            {/* Processing Steps */}
            <div className="text-left space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Mengumpulkan data jawaban</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Menghitung skor per domain</span>
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin mr-2"></div>
                <span>Menyusun analisis komprehensif</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2"></div>
                <span>Membuat rekomendasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (currentPhase === TestPhase.RESULTS) {
    const scores = calculateScores();
    // const detailedAnalysis = generateAnalysis(scores);
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Test Kesehatan Mental Selesai
              </h1>
              <p className="text-green-100 text-center">
                Hasil analisis komprehensif telah dibuat berdasarkan tiga aspek kesehatan mental
              </p>
            </div>

            {/* Results Content */}
            <div className="p-8">
              {/* Overall Score */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-green-100 mb-4">
                  <div className="text-4xl font-bold text-gray-800">{scores.overall}</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Skor Kesehatan Mental Keseluruhan
                </h2>
                <p className="text-gray-600">
                  {scores.overall >= 85 ? 'Sangat Baik' : 
                   scores.overall >= 70 ? 'Baik' : 
                   scores.overall >= 55 ? 'Perlu Perhatian' : 
                   scores.overall >= 40 ? 'Memerlukan Bantuan' : 'Memerlukan Bantuan Segera'}
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Sistem penilaian: 100 = Normal/Sehat, semakin rendah = perlu lebih banyak perhatian
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Depresi (PHQ-9)', score: scores.phq9, maxScore: 27, icon: Brain, color: 'purple' },
                  { label: 'Depresi (DASS-21)', score: scores.depression, maxScore: 42, icon: TrendingDown, color: 'blue' },
                  { label: 'Kecemasan (DASS-21)', score: scores.anxiety, maxScore: 42, icon: AlertCircle, color: 'yellow' },
                  { label: 'Stres (DASS-21)', score: scores.stress, maxScore: 42, icon: BarChart3, color: 'red' },
                  { label: 'Kecemasan Umum (GAD-7)', score: scores.gad7, maxScore: 21, icon: Brain, color: 'indigo' }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <item.icon className={`h-5 w-5 text-${item.color}-600 mr-2`} />
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{item.score}/{item.maxScore}</div>
                    <div className="text-xs text-gray-500 mb-1">0 = Normal/Sehat</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`bg-${item.color}-600 h-2 rounded-full`}
                        style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>              {/* Analysis - Modern Redesigned Version */}
              <div className="space-y-6 mb-8">
                {/* Analysis Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 flex items-center">
                    <Brain className="h-6 w-6 mr-3" />
                    Analisis & Rekomendasi Komprehensif
                  </h3>
                  <p className="text-blue-100">
                    Hasil evaluasi berdasarkan PHQ-9, DASS-21, dan GAD-7 dengan rekomendasi tindakan yang dipersonalisasi
                  </p>
                </div>

                {/* Overall Status Card */}
                <div className={`rounded-xl p-6 border-l-4 ${
                  scores.overall >= 85 ? 'bg-green-50 border-green-500' :
                  scores.overall >= 70 ? 'bg-yellow-50 border-yellow-500' :
                  scores.overall >= 55 ? 'bg-orange-50 border-orange-500' :
                  'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center mb-3">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      scores.overall >= 85 ? 'bg-green-500' :
                      scores.overall >= 70 ? 'bg-yellow-500' :
                      scores.overall >= 55 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Status Kesehatan Mental
                    </h4>
                  </div>
                  <p className={`text-lg font-medium mb-2 ${
                    scores.overall >= 85 ? 'text-green-800' :
                    scores.overall >= 70 ? 'text-yellow-800' :
                    scores.overall >= 55 ? 'text-orange-800' :
                    'text-red-800'
                  }`}>
                    {scores.overall >= 85 ? '💚 KESEHATAN MENTAL SANGAT BAIK' :
                     scores.overall >= 70 ? '✅ KESEHATAN MENTAL BAIK' :
                     scores.overall >= 55 ? '⚠️ MEMERLUKAN PERHATIAN KHUSUS' :
                     '🚨 MEMERLUKAN BANTUAN SEGERA'}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {scores.overall >= 85 ? 'Anda memiliki kesehatan mental yang sangat baik dengan resiliensi tinggi. Kemampuan mengelola stres dan emosi berada pada level optimal.' :
                     scores.overall >= 70 ? 'Kondisi kesehatan mental Anda cukup baik, namun ada beberapa area yang memerlukan perhatian untuk mencegah penurunan lebih lanjut.' :
                     scores.overall >= 55 ? 'Terdapat gejala yang signifikan dan memerlukan intervensi profesional. Kondisi ini dapat mempengaruhi fungsi sehari-hari dan kualitas hidup.' :
                     'Kondisi ini menunjukkan gejala berat yang memerlukan perhatian medis dan psikologis segera untuk mencegah komplikasi lebih lanjut.'}
                  </p>
                </div>

                {/* Domain Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PHQ-9 Analysis */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Depresi (PHQ-9)</h4>
                        <p className="text-sm text-gray-500">{scores.phq9}/27 - {scores.phq9 <= 4 ? 'Minimal' : scores.phq9 <= 9 ? 'Ringan' : scores.phq9 <= 14 ? 'Sedang' : scores.phq9 <= 19 ? 'Sedang-Berat' : 'Berat'}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${scores.phq9 <= 4 ? 'bg-green-500' : scores.phq9 <= 9 ? 'bg-yellow-500' : scores.phq9 <= 14 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${(scores.phq9/27)*100}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {scores.phq9 <= 4 ? 'Tidak ada atau minimal gejala depresi. Mood dan motivasi dalam kondisi baik.' :
                       scores.phq9 <= 9 ? 'Gejala depresi ringan. Mungkin mengalami penurunan mood sesekali.' :
                       scores.phq9 <= 14 ? 'Gejala depresi sedang. Mempengaruhi aktivitas sehari-hari.' :
                       scores.phq9 <= 19 ? 'Gejala depresi sedang-berat. Gangguan signifikan pada fungsi harian.' :
                       'Gejala depresi berat. Memerlukan intervensi segera.'}
                    </p>
                  </div>

                  {/* DASS-21 Anxiety */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Kecemasan (DASS-21)</h4>
                        <p className="text-sm text-gray-500">{scores.anxiety}/42 - {scores.anxiety <= 7 ? 'Normal' : scores.anxiety <= 9 ? 'Ringan' : scores.anxiety <= 14 ? 'Sedang' : scores.anxiety <= 19 ? 'Berat' : 'Sangat Berat'}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${scores.anxiety <= 7 ? 'bg-green-500' : scores.anxiety <= 9 ? 'bg-yellow-500' : scores.anxiety <= 14 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${(scores.anxiety/42)*100}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {scores.anxiety <= 7 ? 'Level kecemasan dalam rentang normal.' :
                       scores.anxiety <= 9 ? 'Kecemasan ringan, dapat dikelola dengan teknik relaksasi.' :
                       scores.anxiety <= 14 ? 'Kecemasan sedang, pertimbangkan terapi atau konseling.' :
                       'Kecemasan berat, memerlukan bantuan profesional.'}
                    </p>
                  </div>

                  {/* DASS-21 Stress */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <BarChart3 className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Stres (DASS-21)</h4>
                        <p className="text-sm text-gray-500">{scores.stress}/42 - {scores.stress <= 14 ? 'Normal' : scores.stress <= 18 ? 'Ringan' : scores.stress <= 25 ? 'Sedang' : scores.stress <= 33 ? 'Berat' : 'Sangat Berat'}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${scores.stress <= 14 ? 'bg-green-500' : scores.stress <= 18 ? 'bg-yellow-500' : scores.stress <= 25 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${(scores.stress/42)*100}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {scores.stress <= 14 ? 'Level stres dalam rentang normal.' :
                       scores.stress <= 18 ? 'Stres ringan, perlu perbaikan manajemen stres.' :
                       scores.stress <= 25 ? 'Stres sedang, butuh strategi coping yang lebih efektif.' :
                       'Stres berat, dapat mengganggu fungsi fisik dan mental.'}
                    </p>
                  </div>

                  {/* GAD-7 */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <Brain className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Kecemasan Umum (GAD-7)</h4>
                        <p className="text-sm text-gray-500">{scores.gad7}/21 - {scores.gad7 <= 4 ? 'Minimal' : scores.gad7 <= 9 ? 'Ringan' : scores.gad7 <= 14 ? 'Sedang' : 'Berat'}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${scores.gad7 <= 4 ? 'bg-green-500' : scores.gad7 <= 9 ? 'bg-yellow-500' : scores.gad7 <= 14 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${(scores.gad7/21)*100}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {scores.gad7 <= 4 ? 'Tidak ada atau minimal kecemasan umum.' :
                       scores.gad7 <= 9 ? 'Kecemasan umum ringan, dapat dikelola dengan self-care.' :
                       scores.gad7 <= 14 ? 'Kecemasan umum sedang, pertimbangkan konseling.' :
                       'Kecemasan umum berat, memerlukan evaluasi klinis.'}
                    </p>
                  </div>
                </div>

                {/* Recommendations Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
                    <h4 className="text-xl font-bold text-white flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Rekomendasi Tindakan
                    </h4>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Immediate Actions */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        🏥 Langkah Segera
                      </h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-sm text-gray-700">
                          {scores.overall >= 85 ? (
                            <>
                              <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Pertahankan gaya hidup sehat yang sudah berjalan</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Lakukan asesmen berkala setiap 6 bulan</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Jadilah role model kesehatan mental bagi orang lain</li>
                            </>
                          ) : scores.overall >= 70 ? (
                            <>
                              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>Evaluasi dan perbaiki area yang bermasalah</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>Tingkatkan aktivitas self-care harian</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>Asesmen lanjutan dalam 3 bulan</li>
                            </>
                          ) : scores.overall >= 55 ? (
                            <>
                              <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span><strong>WAJIB konsultasi dengan psikolog/konselor dalam 1-2 minggu</strong></li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Pertimbangkan psikoterapi (CBT, DBT, atau lainnya)</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Monitoring ketat oleh profesional kesehatan mental</li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span><strong>SEGERA kunjungi psikiater atau layanan darurat mental health</strong></li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Evaluasi untuk kemungkinan medikasi</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Sistem dukungan 24/7 harus aktif</li>
                              <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Hospitalisasi mungkin diperlukan jika ada risiko tinggi</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Self Care Strategies */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        🧘 Strategi Self-Care
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h6 className="font-medium text-blue-900 mb-2">💤 Pola Tidur</h6>
                          <p className="text-sm text-blue-800">7-9 jam per malam, jadwal konsisten</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h6 className="font-medium text-green-900 mb-2">🏃‍♂️ Aktivitas Fisik</h6>
                          <p className="text-sm text-green-800">Minimal 30 menit, 3x seminggu</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h6 className="font-medium text-yellow-900 mb-2">🥗 Nutrisi</h6>
                          <p className="text-sm text-yellow-800">Diet seimbang, hindari alkohol berlebihan</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h6 className="font-medium text-purple-900 mb-2">🧠 Mindfulness</h6>
                          <p className="text-sm text-purple-800">Meditasi 10-15 menit harian</p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                        📞 Kontak Darurat
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-red-800 mr-2">Crisis Hotline:</span>
                          <span className="text-red-700">119 ext 8</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-red-800 mr-2">Halo Kemkes:</span>
                          <span className="text-red-700">1500-567</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-red-800 mr-2">Jangan Bunuh Diri:</span>
                          <span className="text-red-700">021-9696-9293</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-red-800 mr-2">Emergency:</span>
                          <span className="text-red-700">112</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Schedule */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-indigo-900 mb-3">📋 Jadwal Follow-up</h5>
                      <div className="text-sm text-indigo-800">
                        <p><strong>Asesmen ulang:</strong> {scores.overall >= 70 ? '3 bulan' : scores.overall >= 55 ? '1 bulan' : '2 minggu'}</p>
                        <p><strong>Target perbaikan skor:</strong> +10-15 poin dalam 3 bulan</p>
                        <p><strong>Indikator keberhasilan:</strong> Perbaikan fungsi sehari-hari</p>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-500 italic">
                        <strong>Catatan:</strong> Hasil ini adalah asesmen awal dan bukan diagnosis klinis. 
                        Untuk diagnosis dan treatment plan yang akurat, konsultasi dengan profesional kesehatan mental tetap diperlukan.
                      </p>
                    </div>
                  </div>                </div>
              </div>

              

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/app/mental-health')}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Lihat Dashboard Kesehatan Mental
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg shadow-sm hover:bg-gray-700 transition-colors"
                >
                  Cetak Hasil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }  // Time's up overlay
  if (isTimeUp) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-red-600 mr-2" />
            <h2 className="text-2xl font-bold text-red-600">Waktu Habis!</h2>
          </div>
          <p className="text-gray-700 mb-4 text-center">
            Waktu untuk test telah berakhir. Jawaban yang sudah Anda berikan akan diproses sekarang.
          </p>
        </div>
      </div>
    );
  }

  // Main test interface
  const currentQuestions = getCurrentQuestions();
  const currentResponses = getCurrentResponses();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Test Kesehatan Mental Komprehensif
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {getPhaseTitle()}
                </p>
              </div>
              <div className="text-purple-100 flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <div className={`px-3 py-1.5 rounded-md font-mono font-medium ${getTimerColorClass()}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-purple-100 mb-1">
                <span>Pertanyaan {currentQuestionIndex + 1} dari {currentQuestions.length}</span>
                <span>Total Progress: {Math.round(getPhaseProgress())}%</span>
              </div>
              <div className="w-full bg-purple-400 h-2 rounded-full">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getPhaseProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-semibold text-sm">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {currentPhase} - Pertanyaan {currentQuestionIndex + 1} dari {currentQuestions.length}
                  </span>
                </div>                <button 
                  onClick={handleExitAttempt}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Keluar
                </button>
              </div>
                <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  {typeof currentQuestions[currentQuestionIndex] === 'object' 
                    ? currentQuestions[currentQuestionIndex].id 
                    : currentQuestions[currentQuestionIndex]
                  }
                </h2>
                {typeof currentQuestions[currentQuestionIndex] === 'object' && (
                  <p className="text-base text-gray-600 italic">
                    {currentQuestions[currentQuestionIndex].en}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                {RESPONSE_OPTIONS.map((option) => (
                  <div key={option.value} className="relative">
                    <button
                      onClick={() => selectAnswer(option.value)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 ${
                        currentResponses[currentQuestionIndex] === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <p className="text-sm text-gray-500">{option.text}</p>
                        </div>
                        <div className="ml-auto text-lg font-semibold text-gray-400">
                          {option.value}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
              {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={true}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sebelumnya (Tidak Tersedia)
              </button>
              
              <button
                onClick={goToNextQuestion}
                disabled={!canNavigateForward()}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  canNavigateForward()
                    ? 'text-white bg-purple-600 hover:bg-purple-700 shadow-sm'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                {currentPhase === TestPhase.GAD7 && currentQuestionIndex === GAD7_QUESTIONS.length - 1 
                  ? 'Selesai' 
                  : 'Selanjutnya'
                }
                {canNavigateForward() ? (
                  <ArrowRight className="w-4 h-4 ml-2" />
                ) : (
                  <div className="w-4 h-4 ml-2 text-xs">!</div>
                )}
              </button>
            </div>
            
            {/* Answer reminder */}
            {!isCurrentQuestionAnswered() && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Silakan pilih jawaban untuk melanjutkan ke pertanyaan berikutnya
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              currentPhase === TestPhase.PHQ9 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Check className="w-4 h-4 mr-1" />
              PHQ-9 (Depresi)
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              currentPhase === TestPhase.DASS21 ? 'bg-purple-100 text-purple-800' : 
              currentPhase === TestPhase.GAD7 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {currentPhase === TestPhase.GAD7 ? <Check className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
              DASS-21 (Depresi, Kecemasan, Stres)
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              currentPhase === TestPhase.GAD7 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {currentPhase === TestPhase.GAD7 ? <Check className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
              GAD-7 (Kecemasan Umum)
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
            Petunjuk
          </h3>          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Test ini terdiri dari 3 bagian: PHQ-9 (9 pertanyaan), DASS-21 (21 pertanyaan), dan GAD-7 (7 pertanyaan)</li>
            <li>• Total waktu: 15 menit untuk semua test</li>
            <li>• Jawablah berdasarkan perasaan Anda dalam 2 minggu terakhir</li>
            <li>• <strong>PENTING:</strong> Anda tidak dapat kembali ke soal sebelumnya setelah memilih jawaban</li>
            <li>• Pastikan jawaban Anda sudah tepat sebelum melanjutkan ke soal berikutnya</li>
            <li>• Sistem penilaian terbalik: 100 = kondisi mental sangat baik, semakin rendah = perlu lebih banyak perhatian</li>
          </ul>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Keluar
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari test? Semua progress akan hilang dan Anda perlu mengulang dari awal.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelExit}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
