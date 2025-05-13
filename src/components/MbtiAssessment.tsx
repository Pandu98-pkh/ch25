import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, XCircle } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);

  // Calculate progress
  useEffect(() => {
    const answeredQuestions = Object.keys(answers).length;
    setProgress((answeredQuestions / mbtiQuestions.length) * 100);
  }, [answers]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Auto-advance to next question
    if (currentQuestion < mbtiQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mbtiQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
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

  const handleSubmit = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < mbtiQuestions.length) {
      // Show a message that not all questions are answered
      alert(t('mbti.pleaseAnswerAll', 'Mohon jawab semua pertanyaan sebelum menyelesaikan penilaian.'));
      return;
    }
    
    const result = calculateResults();
    onComplete(result);
  };

  const handleConfirmCancel = () => {
    setShowConfirmExit(true);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      {showConfirmExit ? (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('mbti.confirmExit', 'Yakin ingin keluar?')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('mbti.exitWarning', 'Jawaban Anda tidak akan disimpan. Apakah Anda yakin ingin keluar dari penilaian ini?')}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmExit(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              {t('mbti.continue', 'Lanjutkan Penilaian')}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {t('mbti.exit', 'Keluar')}
            </button>
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
            <div className="p-6">
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
                    <button
                      key={value}
                      onClick={() => handleAnswer(mbtiQuestions[currentQuestion].id, value)}
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        answers[mbtiQuestions[currentQuestion].id] === value
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      )}
                    >
                      {value}
                    </button>
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
