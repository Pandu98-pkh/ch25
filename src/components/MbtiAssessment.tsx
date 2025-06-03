import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, XCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';



// Question model for MBTI assessment
interface MbtiQuestion {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  direction: 'positive' | 'negative'; // positive maps to first letter (E,S,T,J), negative to second (I,N,F,P)
}

export interface MbtiResult {
  type: string; // e.g., "INTJ", "ENFP"
  scores: {
    EI: number; // 0-100, percentage towards I
    SN: number; // 0-100, percentage towards N
    TF: number; // 0-100, percentage towards F
    JP: number; // 0-100, percentage towards P
  };
  strengths: string[];
  weaknesses: string[];
  careerSuggestions: string[];
  learningStyle: string;
  compatibleTypes: string[];
}

interface MbtiAssessmentProps {
  onComplete: (result: MbtiResult) => void;
  onCancel: () => void;
}

// MBTI questionnaire with 60 questions (15 for each dimension)
const mbtiQuestions: MbtiQuestion[] = [
// Extraversion (E) vs Introversion (I) questions
{ id: 1, text: "Saya menikmati menjadi pusat perhatian dalam acara sosial.", dimension: 'EI', direction: 'positive' },
{ id: 2, text: "Saya lebih suka menghabiskan waktu dengan sekelompok kecil teman dekat daripada di acara sosial besar.", dimension: 'EI', direction: 'negative' },
{ id: 3, text: "Saya cenderung berpikir keras dan memproses pikiran saya melalui percakapan.", dimension: 'EI', direction: 'positive' },
{ id: 4, text: "Saya membutuhkan waktu sendiri untuk mengisi energi setelah bersosialisasi.", dimension: 'EI', direction: 'negative' },
{ id: 5, text: "Saya sering berinisiatif dalam bertemu orang baru.", dimension: 'EI', direction: 'positive' },
{ id: 6, text: "Saya lebih suka berpikir dalam-dalam sebelum berbagi pikiran saya dengan orang lain.", dimension: 'EI', direction: 'negative' },
{ id: 7, text: "Saya merasa berenergi ketika berada di sekitar orang lain.", dimension: 'EI', direction: 'positive' },
{ id: 8, text: "Saya merasa kelelahan berada di lingkungan yang sangat menstimulasi terlalu lama.", dimension: 'EI', direction: 'negative' },
{ id: 9, text: "Saya secara alami berbicara dan berbagi pendapat dalam diskusi kelompok.", dimension: 'EI', direction: 'positive' },
{ id: 10, text: "Saya lebih suka mendengarkan dan mengamati sebelum berkontribusi dalam percakapan.", dimension: 'EI', direction: 'negative' },
{ id: 11, text: "Saya merasa nyaman memperkenalkan diri kepada orang baru.", dimension: 'EI', direction: 'positive' },
{ id: 12, text: "Saya menghargai percakapan satu lawan satu yang mendalam daripada interaksi kelompok yang lebih luas.", dimension: 'EI', direction: 'negative' },
{ id: 13, text: "Saya cenderung memiliki lingkaran teman dan kenalan yang luas.", dimension: 'EI', direction: 'positive' },
{ id: 14, text: "Saya membutuhkan waktu tenang untuk mengumpulkan pikiran dan menjadi paling produktif.", dimension: 'EI', direction: 'negative' },
{ id: 15, text: "Saya lebih suka bekerja dalam tim daripada secara mandiri.", dimension: 'EI', direction: 'positive' },

// Sensing (S) vs Intuition (N) questions
{ id: 16, text: "Saya lebih fokus pada fakta konkret dan detail daripada teori abstrak.", dimension: 'SN', direction: 'positive' },
{ id: 17, text: "Saya menikmati berpikir tentang kemungkinan dan apa yang bisa terjadi daripada apa yang ada.", dimension: 'SN', direction: 'negative' },
{ id: 18, text: "Saya mempercayai informasi yang berasal langsung dari panca indera saya.", dimension: 'SN', direction: 'positive' },
{ id: 19, text: "Saya sering memperhatikan pola dan koneksi yang tidak disadari orang lain.", dimension: 'SN', direction: 'negative' },
{ id: 20, text: "Saya lebih suka instruksi langkah demi langkah ketika mempelajari sesuatu yang baru.", dimension: 'SN', direction: 'positive' },
{ id: 21, text: "Saya lebih tertarik pada ide inovatif daripada metode yang sudah mapan.", dimension: 'SN', direction: 'negative' },
{ id: 22, text: "Saya menghargai solusi praktis berdasarkan apa yang telah berhasil di masa lalu.", dimension: 'SN', direction: 'positive' },
{ id: 23, text: "Saya menikmati membayangkan skenario yang belum ada.", dimension: 'SN', direction: 'negative' },
{ id: 24, text: "Saya memperhatikan detail spesifik di lingkungan saya.", dimension: 'SN', direction: 'positive' },
{ id: 25, text: "Saya lebih suka fokus pada gambaran besar daripada detail.", dimension: 'SN', direction: 'negative' },
{ id: 26, text: "Saya mengandalkan pengalaman langsung saya ketika membuat keputusan.", dimension: 'SN', direction: 'positive' },
{ id: 27, text: "Saya menikmati berpikir tentang konsep teoretis dan ide abstrak.", dimension: 'SN', direction: 'negative' },
{ id: 28, text: "Saya lebih suka bekerja dengan masalah dunia nyata yang nyata.", dimension: 'SN', direction: 'positive' },
{ id: 29, text: "Saya sering berpikir tentang kemungkinan dan skenario masa depan.", dimension: 'SN', direction: 'negative' },
{ id: 30, text: "Saya lebih nyaman dengan informasi faktual dan konkret daripada konsep teoretis.", dimension: 'SN', direction: 'positive' },

// Thinking (T) vs Feeling (F) questions
{ id: 31, text: "Saya membuat keputusan terutama berdasarkan logika dan analisis objektif.", dimension: 'TF', direction: 'positive' },
{ id: 32, text: "Ketika membuat keputusan, saya mempertimbangkan bagaimana perasaan orang lain tentang hasilnya.", dimension: 'TF', direction: 'negative' },
{ id: 33, text: "Saya percaya lebih penting untuk jujur daripada bijaksana.", dimension: 'TF', direction: 'positive' },
{ id: 34, text: "Saya berusaha menjaga harmoni dalam kelompok dan menghindari konflik.", dimension: 'TF', direction: 'negative' },
{ id: 35, text: "Saya cenderung menganalisis masalah daripada berempati dengannya.", dimension: 'TF', direction: 'positive' },
{ id: 36, text: "Saya mempertimbangkan bagaimana keputusan akan mempengaruhi perasaan dan kebutuhan orang.", dimension: 'TF', direction: 'negative' },
{ id: 37, text: "Saya menghargai keadilan berdasarkan standar dan prinsip yang jelas.", dimension: 'TF', direction: 'positive' },
{ id: 38, text: "Saya menghargai kasih sayang dan empati ketika menyelesaikan konflik.", dimension: 'TF', direction: 'negative' },
{ id: 39, text: "Saya lebih suka fokus pada fakta dan data daripada emosi orang.", dimension: 'TF', direction: 'positive' },
{ id: 40, text: "Saya pandai memahami perasaan orang lain.", dimension: 'TF', direction: 'negative' },
{ id: 41, text: "Saya merasa mudah memberikan kritik yang konstruktif.", dimension: 'TF', direction: 'positive' },
{ id: 42, text: "Saya menghindari mengkritik orang lain karena khawatir menyakiti perasaan mereka.", dimension: 'TF', direction: 'negative' },
{ id: 43, text: "Saya menghargai objektivitas dan ketidakberpihakan dalam pengambilan keputusan.", dimension: 'TF', direction: 'positive' },
{ id: 44, text: "Saya secara alami mempertimbangkan bagaimana tindakan saya akan mempengaruhi emosi orang lain.", dimension: 'TF', direction: 'negative' },
{ id: 45, text: "Saya cenderung lebih yakin dengan argumen rasional daripada daya tarik emosional.", dimension: 'TF', direction: 'positive' },

// Judging (J) vs Perceiving (P) questions
{ id: 46, text: "Saya lebih suka memiliki segala sesuatu yang direncanakan dan diselesaikan sebelumnya.", dimension: 'JP', direction: 'positive' },
{ id: 47, text: "Saya lebih suka membuka pilihan dan fleksibel dengan rencana.", dimension: 'JP', direction: 'negative' },
{ id: 48, text: "Saya suka memiliki rencana terperinci sebelum memulai proyek.", dimension: 'JP', direction: 'positive' },
{ id: 49, text: "Saya menikmati beradaptasi dengan situasi baru saat muncul.", dimension: 'JP', direction: 'negative' },
{ id: 50, text: "Saya merasa paling nyaman ketika segala sesuatu terorganisir dan terstruktur.", dimension: 'JP', direction: 'positive' },
{ id: 51, text: "Saya lebih suka menyisakan ruang untuk spontanitas dan perubahan mendadak.", dimension: 'JP', direction: 'negative' },
{ id: 52, text: "Saya suka membuat keputusan segera dan melanjutkan.", dimension: 'JP', direction: 'positive' },
{ id: 53, text: "Saya lebih suka terus mengumpulkan informasi sebelum membuat keputusan akhir.", dimension: 'JP', direction: 'negative' },
{ id: 54, text: "Saya lebih suka lingkungan yang teratur dan terstruktur.", dimension: 'JP', direction: 'positive' },
{ id: 55, text: "Saya menikmati mengeksplorasi kemungkinan berbeda dan membuka pilihan.", dimension: 'JP', direction: 'negative' },
{ id: 56, text: "Saya suka menyelesaikan satu proyek sebelum memulai yang lain.", dimension: 'JP', direction: 'positive' },
{ id: 57, text: "Saya sering bekerja pada beberapa proyek secara bersamaan, beralih di antara mereka sesuai kebutuhan.", dimension: 'JP', direction: 'negative' },
{ id: 58, text: "Memenuhi tenggat waktu dan komitmen sangat penting bagi saya.", dimension: 'JP', direction: 'positive' },
{ id: 59, text: "Saya melihat tenggat waktu lebih sebagai panduan daripada komitmen ketat.", dimension: 'JP', direction: 'negative' },
{ id: 60, text: "Saya lebih suka memiliki rutinitas yang ditetapkan dalam kehidupan sehari-hari saya.", dimension: 'JP', direction: 'positive' },
];

export default function MbtiAssessment({ onComplete, onCancel }: MbtiAssessmentProps) {
  const { t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(null);

  // Fullscreen functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  // Handle fullscreen on component mount/unmount
  useEffect(() => {
    return () => {
      // Always exit fullscreen when component unmounts
      exitFullscreen();
    };
  }, []);

  // Calculate progress
  useEffect(() => {
    const answeredQuestions = Object.keys(answers).length;
    setProgress((answeredQuestions / mbtiQuestions.length) * 100);
  }, [answers]);
  
  // Clear countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [countdownTimer]);
  
  // Handle countdown logic
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      // Auto-advance to next question
      if (currentQuestion < mbtiQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
      setCountdown(null);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        setCountdownTimer(null);
      }
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev! - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, currentQuestion, countdownTimer]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear any existing countdown
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    
    // Start countdown if not the last question
    if (currentQuestion < mbtiQuestions.length - 1) {
      setCountdown(3);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mbtiQuestions.length - 1) {
      // Clear countdown when manually navigating
      setCountdown(null);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        setCountdownTimer(null);
      }
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Clear countdown when manually navigating
      setCountdown(null);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        setCountdownTimer(null);
      }
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const skipCountdown = () => {
    setCountdown(null);
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    if (currentQuestion < mbtiQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResults = (): MbtiResult => {
    // Initialize scores for each dimension
    const dimensionScores: {[key: string]: {first: number, second: number}} = {
      EI: {first: 0, second: 0},
      SN: {first: 0, second: 0},
      TF: {first: 0, second: 0},
      JP: {first: 0, second: 0}
    };

    // Calculate raw scores for each dimension
    mbtiQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        // For positive direction questions, higher scores favor the first letter (E, S, T, J)
        // For negative direction questions, higher scores favor the second letter (I, N, F, P)
        if (question.direction === 'positive') {
          // 1-3 favor first letter, 5-7 favor second letter
          if (answer < 4) {
            dimensionScores[question.dimension].first += (4 - answer);
          } else {
            dimensionScores[question.dimension].second += (answer - 4);
          }
        } else {
          // For negative questions, reverse the scoring
          if (answer < 4) {
            dimensionScores[question.dimension].second += (4 - answer);
          } else {
            dimensionScores[question.dimension].first += (answer - 4);
          }
        }
      }
    });
    
    // Calculate percentage scores and determine type
    let type = '';
    const scores: {[key: string]: number} = {};
    
    Object.keys(dimensionScores).forEach(dim => {
      const { first, second } = dimensionScores[dim];
      const total = first + second;
      const secondPercentage = total === 0 ? 50 : Math.round((second / total) * 100);
      scores[dim] = secondPercentage;
      
      // Add the appropriate letter to the type
      type += secondPercentage >= 50 ? dim[1] : dim[0];
    });

    // Mock data for other result properties based on type
    const typeInfo = getMbtiTypeInfo(type);
    
    return {
      type,
      scores: {
        EI: scores.EI,
        SN: scores.SN,
        TF: scores.TF,
        JP: scores.JP
      },
      strengths: typeInfo.strengths,
      weaknesses: typeInfo.weaknesses,
      careerSuggestions: typeInfo.careers,
      learningStyle: typeInfo.learningStyle,
      compatibleTypes: typeInfo.compatibleTypes
    };
  };

  const handleComplete = (result: MbtiResult) => {
    exitFullscreen();
    onComplete(result);
  };

  const handleCancel = () => {
    exitFullscreen();
    onCancel();
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < mbtiQuestions.length) {
      // Show a message that not all questions are answered
      alert(t('mbti.pleaseAnswerAll', 'Mohon jawab semua pertanyaan sebelum menyelesaikan penilaian.'));
      return;
    }
    
    const result = calculateResults();
    handleComplete(result);
  };

  const handleStartAssessment = () => {
    setShowIntroduction(false);
    // Enter fullscreen when starting assessment
    enterFullscreen();
  };

  const handleConfirmCancel = () => {
    setShowConfirmExit(true);
  };

  return (
    <div className="container mx-auto max-w-7xl py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      {showIntroduction ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {t('mbti.title', 'Penilaian Kepribadian MBTI')}
              </h1>
              <button
                onClick={handleCancel}
                className="text-white/80 hover:text-white"
                aria-label="Close"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-indigo-100 mt-2">
              {t('mbti.subtitle', 'Myers-Briggs Type Indicator - Temukan Tipe Kepribadian Anda')}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* About the Assessment */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3">
                    <HelpCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  {t('mbti.intro.aboutTitle', 'Tentang Penilaian MBTI')}
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {t('mbti.intro.description', 'MBTI (Myers-Briggs Type Indicator) adalah instrumen penilaian kepribadian yang mengidentifikasi preferensi psikologis Anda dalam empat dimensi utama. Hasil tes ini akan membantu Anda memahami cara Anda memproses informasi, membuat keputusan, dan berinteraksi dengan dunia.')}
                  </p>
                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">{t('mbti.intro.dimensions', 'Empat Dimensi MBTI:')}</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        <span><strong>Extraversion (E) vs Introversion (I)</strong> - Sumber energi dan fokus perhatian</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        <span><strong>Sensing (S) vs Intuition (N)</strong> - Cara mengumpulkan informasi</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        <span><strong>Thinking (T) vs Feeling (F)</strong> - Cara membuat keputusan</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        <span><strong>Judging (J) vs Perceiving (P)</strong> - Gaya hidup dan struktur</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Assessment Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  {t('mbti.intro.detailsTitle', 'Detail Penilaian')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">60</div>
                    <div className="text-sm text-blue-800 font-medium">{t('mbti.intro.questions', 'Pertanyaan')}</div>
                    <div className="text-xs text-blue-600 mt-1">15 per dimensi</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">15-20</div>
                    <div className="text-sm text-green-800 font-medium">{t('mbti.intro.minutes', 'Menit')}</div>
                    <div className="text-xs text-green-600 mt-1">Estimasi waktu</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">1-7</div>
                    <div className="text-sm text-purple-800 font-medium">{t('mbti.intro.scale', 'Skala Penilaian')}</div>
                    <div className="text-xs text-purple-600 mt-1">Likert scale</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">16</div>
                    <div className="text-sm text-orange-800 font-medium">Tipe Hasil</div>
                    <div className="text-xs text-orange-600 mt-1">Kemungkinan</div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-yellow-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {t('mbti.intro.termsTitle', 'Syarat dan Ketentuan')}
                </h2>
                <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                      <span>{t('mbti.intro.term1', 'Jawab semua pertanyaan dengan jujur berdasarkan preferensi alami Anda, bukan bagaimana Anda "seharusnya" menjawab.')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                      <span>{t('mbti.intro.term2', 'Tidak ada jawaban yang benar atau salah. Setiap jawaban mencerminkan preferensi pribadi Anda.')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                      <span>{t('mbti.intro.term3', 'Hasil penilaian bersifat indikatif dan tidak menentukan kemampuan atau membatasi pilihan karir Anda.')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                      <span>{t('mbti.intro.term4', 'Data dan jawaban Anda akan disimpan secara anonim untuk keperluan analisis dan peningkatan layanan.')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                      <span>{t('mbti.intro.term5', 'Setiap pertanyaan memiliki timer otomatis 3 detik. Anda dapat mengubah jawaban sebelum waktu habis.')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Results Preview */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  {t('mbti.intro.results', 'Anda Akan Mendapat:')}
                </h2>
                <div className="bg-white rounded-lg p-5 border border-gray-200 space-y-3">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <div>
                      <strong className="text-gray-900">Tipe kepribadian Anda</strong>
                      <p className="text-sm text-gray-600">Salah satu dari 16 tipe MBTI (contoh: INTJ, ENFP)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <div>
                      <strong className="text-gray-900">Analisis mendalam</strong>
                      <p className="text-sm text-gray-600">Kekuatan, area pengembangan, dan karakteristik unik</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <div>
                      <strong className="text-gray-900">Rekomendasi karir</strong>
                      <p className="text-sm text-gray-600">Profesi yang cocok dengan tipe kepribadian Anda</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <div>
                      <strong className="text-gray-900">Gaya belajar optimal</strong>
                      <p className="text-sm text-gray-600">Pendekatan pembelajaran yang paling efektif</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <div>
                      <strong className="text-gray-900">Kompatibilitas hubungan</strong>
                      <p className="text-sm text-gray-600">Tipe kepribadian yang cocok untuk kerjasama</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {t('mbti.intro.instructionsTitle', 'Petunjuk Pengerjaan')}
                </h2>
                <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                  <ol className="space-y-4 text-gray-700 text-sm">
                    <li className="flex items-start">
                      <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                      <div>
                        <strong>Baca dengan cermat</strong>
                        <p className="text-gray-600 mt-1">Pahami setiap pernyataan sebelum memberikan jawaban</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                      <div>
                        <strong>Skala 1-7</strong>
                        <p className="text-gray-600 mt-1">1 = Sangat Tidak Setuju, 7 = Sangat Setuju</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                      <div>
                        <strong>Jawab sesuai insting</strong>
                        <p className="text-gray-600 mt-1">Hindari overthinking, ikuti preferensi alami Anda</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                      <div>
                        <strong>Navigasi fleksibel</strong>
                        <p className="text-gray-600 mt-1">Gunakan tombol untuk maju mundur antar pertanyaan</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Sample Questions Preview */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Contoh Pertanyaan
                </h2>
                <div className="bg-purple-50 rounded-lg p-5 border border-purple-200 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <p className="text-sm text-gray-700 italic mb-2">"Saya menikmati menjadi pusat perhatian dalam acara sosial."</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Sangat Tidak Setuju</span>
                      <span>Sangat Setuju</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      {[1,2,3,4,5,6,7].map(num => (
                        <div key={num} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <p className="text-sm text-gray-700 italic mb-2">"Saya lebih fokus pada fakta konkret daripada teori abstrak."</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Sangat Tidak Setuju</span>
                      <span>Sangat Setuju</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      {[1,2,3,4,5,6,7].map(num => (
                        <div key={num} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 p-8 pt-4 border-t border-gray-200">
            <button
              onClick={handleStartAssessment}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center text-lg"
            >
              <CheckCircle className="h-6 w-6 mr-3" />
              {t('mbti.intro.startButton', 'Mulai Penilaian MBTI')}
            </button>
            <button
              onClick={handleCancel}
              className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-4 px-8 rounded-lg transition-colors duration-200"
            >
              {t('mbti.intro.cancelButton', 'Batal')}
            </button>
          </div>
        </div>
      ) : showConfirmExit ? (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 max-w-2xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                {t('mbti.confirmExit', 'Yakin ingin keluar?')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base text-gray-600">
                  {t('mbti.exitWarning', 'Jawaban Anda tidak akan disimpan. Apakah Anda yakin ingin keluar dari penilaian ini?')}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <h3 className="text-xs sm:text-sm font-medium text-red-800">
                        {t('mbti.dataLossWarning', 'Data akan hilang')}
                      </h3>
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>{Object.keys(answers).length} jawaban yang sudah diisi akan hilang</li>
                          <li>Progress {Math.round(progress)}% akan dikosongkan</li>
                          <li>Anda harus memulai dari awal jika ingin mengulang</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="flex-1 px-4 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
                >
                  {t('mbti.continue', 'Lanjutkan Penilaian')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm sm:text-base font-medium"
                >
                  {t('mbti.exit', 'Keluar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('mbti.title', 'Penilaian Kepribadian MBTI')}
            </h1>
            <button
              onClick={handleConfirmCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cancel assessment"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('mbti.progress', 'Kemajuan')}: {Math.round(progress)}%
                </h2>
                <span className="text-sm text-gray-500">
                  {t('mbti.questionCount', 'Pertanyaan')}: {currentQuestion + 1}/{mbtiQuestions.length}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium text-gray-900 mb-6">
                  {mbtiQuestions[currentQuestion].text}
                </h3>

                <div className="grid grid-cols-7 gap-2 text-center mt-6">
                  <div className="col-span-3 text-sm text-left text-gray-600">
                    {t('mbti.stronglyDisagree', 'Sangat Tidak Setuju')}
                  </div>
                  <div className="col-span-1"></div>
                  <div className="col-span-3 text-sm text-right text-gray-600">
                    {t('mbti.stronglyAgree', 'Sangat Setuju')}
                  </div>

                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <div key={value} className="flex flex-col items-center relative">
                      <button
                        onClick={() => handleAnswer(mbtiQuestions[currentQuestion].id, value)}
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center relative z-10",
                          answers[mbtiQuestions[currentQuestion].id] === value
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        )}
                      >
                        {value}
                      </button>
                      
                      {/* Circular Countdown Progress - Only show around selected answer */}
                      {countdown !== null && answers[mbtiQuestions[currentQuestion].id] === value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="h-14 w-14 -rotate-90 transform transition-transform duration-300 ease-out" viewBox="0 0 56 56">
                            {/* Background circle */}
                            <circle
                              cx="28"
                              cy="28"
                              r="26"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              className="text-indigo-100"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="28"
                              cy="28"
                              r="26"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 26}`}
                              strokeDashoffset={`${2 * Math.PI * 26 * (countdown / 3)}`}
                              className="text-indigo-600 transition-all duration-[950ms] ease-linear"
                              style={{
                                strokeLinecap: 'round',
                                transformOrigin: 'center'
                              }}
                            />
                          </svg>
                          {/* Countdown text with smoother animation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-indigo-700 font-bold bg-white/95 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-indigo-100 transition-all duration-200 ease-out transform scale-100 hover:scale-105">
                              {countdown}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    currentQuestion === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  )}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('mbti.previous', 'Sebelumnya')}
                </button>

                {currentQuestion < mbtiQuestions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!answers[mbtiQuestions[currentQuestion].id]}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg",
                      !answers[mbtiQuestions[currentQuestion].id]
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                  >
                    {t('mbti.next', 'Selanjutnya')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg"
                  >
                    {t('mbti.complete', 'Selesaikan Penilaian')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <HelpCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {t('mbti.aboutTest', 'Tentang Tes MBTI')}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>{t('mbti.description', 'Myers-Briggs Type Indicator (MBTI) mengidentifikasi preferensi alami Anda dalam empat dimensi psikologis, menghasilkan 16 tipe kepribadian berbeda. Tes ini membantu Anda memahami kekuatan, kelemahan, dan preferensi komunikasi Anda.')}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get MBTI type information
function getMbtiTypeInfo(type: string): {
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  learningStyle: string;
  compatibleTypes: string[];
} {
  // This would ideally come from a database or API
  const typeInfo: {[key: string]: any} = {
    'INTJ': {
      strengths: ['Analytical', 'Strategic', 'Independent', 'Innovative', 'Determined'],
      weaknesses: ['Perfectionistic', 'Dismissive of emotions', 'Overly critical', 'Arrogant', 'Socially reserved'],
      careers: ['Scientist', 'Engineer', 'Strategist', 'Financial Advisor', 'Systems Analyst'],
      learningStyle: 'Conceptual and theoretical learning with practical applications. Prefers independent study and setting own goals.',
      compatibleTypes: ['ENFP', 'ENTP', 'ENTJ', 'INFJ']
    },
    'INTP': {
      strengths: ['Logical', 'Objective', 'Creative problem-solver', 'Abstract thinker', 'Adaptable'],
      weaknesses: ['Detached', 'Overthinking', 'Procrastination', 'Impatient with inefficiency', 'Neglect practical matters'],
      careers: ['Software Developer', 'Mathematician', 'Professor', 'Research Scientist', 'Architect'],
      learningStyle: 'Self-directed learning focused on understanding concepts and systems. Enjoys exploring theories and abstract ideas.',
      compatibleTypes: ['ENFJ', 'ENTJ', 'ESTJ', 'INFJ']
    },
    'ENTJ': {
      strengths: ['Leadership', 'Efficiency', 'Strategic planning', 'Decisive', 'Confident'],
      weaknesses: ['Impatient', 'Domineering', 'Intolerant', 'Arrogant', 'Cold'],
      careers: ['Executive', 'Entrepreneur', 'Lawyer', 'Management Consultant', 'Business Analyst'],
      learningStyle: 'Structured, goal-oriented learning with practical applications. Enjoys debate and challenging intellectual environments.',
      compatibleTypes: ['INFP', 'INTP', 'ENFP', 'INFJ']
    },
    'ENTP': {
      strengths: ['Innovative', 'Versatile', 'Analytical', 'Enthusiastic', 'Resourceful'],
      weaknesses: ['Argumentative', 'Insensitive', 'Unfocused', 'Disregards rules', 'Procrastination'],
      careers: ['Entrepreneur', 'Creative Director', 'Lawyer', 'Engineer', 'Consultant'],
      learningStyle: 'Dynamic, challenging learning environments. Enjoys debate, questioning assumptions, and creative problem-solving.',
      compatibleTypes: ['INFJ', 'INTJ', 'INFP', 'ENFJ']
    },
    'INFJ': {
      strengths: ['Insightful', 'Principled', 'Creative', 'Dedicated', 'Compassionate'],
      weaknesses: ['Perfectionist', 'Burnout-prone', 'Overly sensitive', 'Private', 'Avoids conflict'],
      careers: ['Counselor', 'Writer', 'Psychologist', 'Teacher', 'Social Worker'],
      learningStyle: 'Values meaning and purpose in learning. Prefers quiet, reflective environments and connecting concepts to human values.',
      compatibleTypes: ['ENFP', 'ENTP', 'INTJ', 'ENFJ']
    },
    'INFP': {
      strengths: ['Empathetic', 'Creative', 'Open-minded', 'Passionate', 'Dedicated'],
      weaknesses: ['Impractical', 'Emotionally vulnerable', 'Self-isolating', 'Unrealistic expectations', 'Takes things personally'],
      careers: ['Writer', 'Counselor', 'Artist', 'Social Worker', 'UX Designer'],
      learningStyle: 'Personalized learning that aligns with values. Prefers creative expression and working at their own pace.',
      compatibleTypes: ['ENFJ', 'ENTJ', 'ESFJ', 'ESTJ']
    },
    'ENFJ': {
      strengths: ['Charismatic', 'Empathetic', 'Organized', 'Altruistic', 'Reliable'],
      weaknesses: ['People-pleasing', 'Overly idealistic', 'Self-sacrificing', 'Approval-seeking', 'Overcommitting'],
      careers: ['Teacher', 'HR Manager', 'Counselor', 'Sales Manager', 'Non-profit Director'],
      learningStyle: 'Collaborative learning environments. Enjoys mentoring others and connecting learning to humanitarian values.',
      compatibleTypes: ['INFP', 'ISFP', 'INTP', 'ISTP']
    },
    'ENFP': {
      strengths: ['Enthusiastic', 'Creative', 'Sociable', 'Expressive', 'Perceptive'],
      weaknesses: ['Unfocused', 'Disorganized', 'People-pleasing', 'Restless', 'Overextending'],
      careers: ['Journalist', 'Marketing Creative', 'Event Planner', 'Entrepreneur', 'Life Coach'],
      learningStyle: 'Interactive, engaging learning with variety. Thrives in creative environments that allow for personal expression.',
      compatibleTypes: ['INTJ', 'INFJ', 'ENTJ', 'INTP']
    },
    'ISTJ': {
      strengths: ['Responsible', 'Detail-oriented', 'Organized', 'Reliable', 'Practical'],
      weaknesses: ['Resistant to change', 'Judgmental', 'Insensitive', 'Rigid', 'Overly traditional'],
      careers: ['Accountant', 'Manager', 'Military Officer', 'Database Administrator', 'Logistician'],
      learningStyle: 'Structured learning with clear objectives. Prefers practical applications and sequential instruction.',
      compatibleTypes: ['ESFP', 'ESTP', 'ISFP', 'ISTP']
    },
    'ISFJ': {
      strengths: ['Supportive', 'Reliable', 'Detail-oriented', 'Patient', 'Observant'],
      weaknesses: ['Overworking', 'Neglecting own needs', 'Resistant to change', 'Overly humble', 'Taking criticism personally'],
      careers: ['Nurse', 'Elementary Teacher', 'Administrative Assistant', 'Social Worker', 'Accountant'],
      learningStyle: 'Practical learning in supportive environments. Prefers clear instructions and helping others in the learning process.',
      compatibleTypes: ['ESFP', 'ESTP', 'ENFP', 'ENTP']
    },
    'ESTJ': {
      strengths: ['Organized', 'Practical', 'Dependable', 'Efficient', 'Logical'],
      weaknesses: ['Inflexible', 'Judgmental', 'Stubborn', 'Insensitive', 'Domineering'],
      careers: ['Business Manager', 'Military Officer', 'Judge', 'Financial Advisor', 'School Principal'],
      learningStyle: 'Structured learning with practical applications. Prefers clear objectives and traditional educational methods.',
      compatibleTypes: ['ISFP', 'ISTP', 'INFP', 'INTP']
    },
    'ESFJ': {
      strengths: ['Cooperative', 'Supportive', 'Organized', 'Practical', 'Conscientious'],
      weaknesses: ['Needy for approval', 'Inflexible', 'Self-sacrificing', 'Sensitive to criticism', 'Difficulty with change'],
      careers: ['Teacher', 'Healthcare Provider', 'Social Worker', 'HR Specialist', 'Event Planner'],
      learningStyle: 'Collaborative learning in harmonious environments. Values practical skills that help others.',
      compatibleTypes: ['ISFP', 'ISTP', 'INFP', 'INTP']
    },
    'ISTP': {
      strengths: ['Practical', 'Logical', 'Adaptable', 'Independent', 'Observant'],
      weaknesses: ['Emotionally detached', 'Risk-taking', 'Commitment-averse', 'Reserved', 'Insensitive'],
      careers: ['Mechanic', 'Engineer', 'Pilot', 'Data Analyst', 'Forensic Scientist'],
      learningStyle: 'Hands-on learning with immediate application. Prefers self-directed exploration of how things work.',
      compatibleTypes: ['ESFJ', 'ESTJ', 'ENFJ', 'ENTJ']
    },
    'ISFP': {
      strengths: ['Artistic', 'Adaptable', 'Curious', 'Sensitive', 'Loyal'],
      weaknesses: ['Conflict-averse', 'Easily stressed', 'Unpredictable', 'Overly private', 'Underestimating abilities'],
      careers: ['Artist', 'Designer', 'Healthcare Provider', 'Veterinarian', 'Craftsperson'],
      learningStyle: 'Experiential, hands-on learning in a supportive environment. Prefers expressing creativity and working at own pace.',
      compatibleTypes: ['ESFJ', 'ESTJ', 'ENFJ', 'ENTJ']
    },
    'ESTP': {
      strengths: ['Energetic', 'Practical', 'Persuasive', 'Adaptable', 'Observant'],
      weaknesses: ['Impatient', 'Risk-taking', 'Blunt', 'Unstructured', 'Commitment-averse'],
      careers: ['Entrepreneur', 'Sales Representative', 'Marketing Executive', 'Paramedic', 'Athletic Coach'],
      learningStyle: 'Active, hands-on learning with real-world applications. Thrives in dynamic environments with immediate feedback.',
      compatibleTypes: ['ISFJ', 'ISTJ', 'INFJ', 'INTJ']
    },
    'ESFP': {
      strengths: ['Enthusiastic', 'Sociable', 'Practical', 'Adaptable', 'Persuasive'],
      weaknesses: ['Easily bored', 'Unfocused', 'Conflict-averse', 'Sensitive to criticism', 'Impulsive'],
      careers: ['Event Planner', 'Sales Representative', 'Travel Agent', 'Chef', 'Performer'],
      learningStyle: 'Interactive, group-based learning with practical applications. Enjoys entertaining and being entertained during learning.',
      compatibleTypes: ['ISFJ', 'ISTJ', 'INFJ', 'INTJ']
    }
  };
  
  // Return default values if type not found
  if (!typeInfo[type]) {
    return {
      strengths: ['Versatile', 'Adaptable', 'Balanced'],
      weaknesses: ['May lack clear preferences'],
      careers: ['Various fields depending on individual strengths'],
      learningStyle: 'Flexible learning style that may incorporate various approaches.',
      compatibleTypes: ['Various types']
    };
  }
  
  return typeInfo[type];
}
