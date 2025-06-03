import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';

// RIASEC categories
export type RiasecCategory = 'realistic' | 'investigative' | 'artistic' | 'social' | 'enterprising' | 'conventional';

// Question interface
export interface RiasecQuestion {
  id: number;
  text: string;
  category: RiasecCategory;
}

// Result interface
export interface RiasecResult {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  timestamp: string;
  topCategories: RiasecCategory[];
  recommendedCareers: RecommendedCareer[];
}

// Recommended career interface
export interface RecommendedCareer {
  title: string;
  match: number; // Percentage match (0-100)
  description: string;
  categories: RiasecCategory[];
  educationRequired: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  outlookGrowth: number; // Percentage
}

// Props interface
interface RiasecAssessmentProps {
  onComplete: (result: RiasecResult) => void;
  onCancel: () => void;
}

// Generate RIASEC questions (50+ questions based on Holland's theory)
const generateQuestions = (): RiasecQuestion[] => {
  return [
    // Realistic questions
    { id: 1, text: "Saya suka bekerja dengan tangan dan alat-alat", category: "realistic" },
    { id: 2, text: "Saya lebih suka aktivitas fisik daripada membaca buku", category: "realistic" },
    { id: 3, text: "Saya senang memperbaiki peralatan elektronik", category: "realistic" },
    { id: 4, text: "Saya suka bekerja di luar ruangan", category: "realistic" },
    { id: 5, text: "Saya lebih suka membangun sesuatu daripada membaca tentangnya", category: "realistic" },
    { id: 6, text: "Saya suka bekerja dengan mesin dan peralatan mekanik", category: "realistic" },
    { id: 7, text: "Saya menikmati aktivitas yang membutuhkan kekuatan fisik", category: "realistic" },
    { id: 8, text: "Saya tertarik pada pekerjaan yang melibatkan perbaikan atau konstruksi", category: "realistic" },
    { id: 9, text: "Saya lebih memilih tugas praktis daripada teoretis", category: "realistic" },
    
    // Investigative questions
    { id: 10, text: "Saya suka memecahkan teka-teki dan masalah", category: "investigative" },
    { id: 11, text: "Saya menikmati eksperimen ilmiah", category: "investigative" },
    { id: 12, text: "Saya tertarik mempelajari cara kerja sesuatu", category: "investigative" },
    { id: 13, text: "Saya suka menganalisis data dan informasi", category: "investigative" },
    { id: 14, text: "Saya menikmati pelajaran matematika dan sains", category: "investigative" },
    { id: 15, text: "Saya tertarik pada penelitian dan penemuan", category: "investigative" },
    { id: 16, text: "Saya suka mengajukan pertanyaan dan mencari jawaban", category: "investigative" },
    { id: 17, text: "Saya menikmati pemecahan masalah yang kompleks", category: "investigative" },
    { id: 18, text: "Saya tertarik pada teori dan abstraksi", category: "investigative" },
    
    // Artistic questions
    { id: 19, text: "Saya senang mengekspresikan diri secara kreatif", category: "artistic" },
    { id: 20, text: "Saya menikmati seni, musik, atau menulis", category: "artistic" },
    { id: 21, text: "Saya suka membuat karya seni atau kerajinan", category: "artistic" },
    { id: 22, text: "Saya tertarik pada aktivitas yang memungkinkan saya bebas berekspresi", category: "artistic" },
    { id: 23, text: "Saya menikmati mendesain sesuatu yang baru", category: "artistic" },
    { id: 24, text: "Saya suka memiliki kebebasan untuk berinovasi", category: "artistic" },
    { id: 25, text: "Saya tertarik pada profesi yang berhubungan dengan seni", category: "artistic" },
    { id: 26, text: "Saya memiliki imajinasi yang kuat", category: "artistic" },
    { id: 27, text: "Saya menikmati kreativitas dan originalitas", category: "artistic" },
    
    // Social questions
    { id: 28, text: "Saya suka membantu orang lain", category: "social" },
    { id: 29, text: "Saya menikmati bekerja dalam kelompok", category: "social" },
    { id: 30, text: "Saya tertarik pada pengembangan dan kesejahteraan orang lain", category: "social" },
    { id: 31, text: "Saya suka mengajar atau melatih orang", category: "social" },
    { id: 32, text: "Saya menikmati diskusi tentang masalah sosial", category: "social" },
    { id: 33, text: "Saya tertarik pada pekerjaan yang melibatkan interaksi dengan banyak orang", category: "social" },
    { id: 34, text: "Saya suka mendengarkan masalah orang lain", category: "social" },
    { id: 35, text: "Saya memiliki kemampuan komunikasi yang baik", category: "social" },
    { id: 36, text: "Saya senang memberikan dukungan emosional", category: "social" },
    
    // Enterprising questions
    { id: 37, text: "Saya suka memimpin orang lain", category: "enterprising" },
    { id: 38, text: "Saya menikmati meyakinkan orang lain tentang ide saya", category: "enterprising" },
    { id: 39, text: "Saya tertarik pada penjualan atau pemasaran", category: "enterprising" },
    { id: 40, text: "Saya suka membuat keputusan penting", category: "enterprising" },
    { id: 41, text: "Saya menikmati kompetisi dan pencapaian tujuan", category: "enterprising" },
    { id: 42, text: "Saya tertarik pada politik atau debat", category: "enterprising" },
    { id: 43, text: "Saya suka bertanggung jawab atas proyek", category: "enterprising" },
    { id: 44, text: "Saya menikmati memulai inisiatif baru", category: "enterprising" },
    { id: 45, text: "Saya senang menegosiasikan atau berargumen", category: "enterprising" },
    
    // Conventional questions
    { id: 46, text: "Saya suka mengikuti instruksi yang jelas", category: "conventional" },
    { id: 47, text: "Saya menikmati mengatur dan menyusun data", category: "conventional" },
    { id: 48, text: "Saya tertarik pada detail dan akurasi", category: "conventional" },
    { id: 49, text: "Saya suka bekerja dengan angka dan catatan", category: "conventional" },
    { id: 50, text: "Saya menikmati menyusun sistem untuk mengatur informasi", category: "conventional" },
    { id: 51, text: "Saya tertarik pada pekerjaan kantor atau administratif", category: "conventional" },
    { id: 52, text: "Saya suka rutinitas dan keteraturan", category: "conventional" },
    { id: 53, text: "Saya menikmati bekerja dengan prosedur yang terstruktur", category: "conventional" },
    { id: 54, text: "Saya senang mengikuti aturan dan pedoman", category: "conventional" },
  ];
};

export const RiasecAssessment = ({ onComplete, onCancel }: RiasecAssessmentProps) => {
  const { t } = useLanguage();
  const [questions] = useState<RiasecQuestion[]>(generateQuestions());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Calculate progress
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

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
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
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
  }, [countdown, currentQuestion, questions.length, countdownTimer]);
  
  // Handle answer selection
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
    if (currentQuestion < questions.length - 1) {
      setCountdown(3);
    }
  };
  
  // Navigate through questions
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      // Clear countdown when manually navigating
      setCountdown(null);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        setCountdownTimer(null);
      }
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Clear countdown when manually navigating
      setCountdown(null);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        setCountdownTimer(null);
      }
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const skipCountdown = () => {
    setCountdown(null);
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  // Submit assessment
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Calculate category scores
      const scores = {
        realistic: 0,
        investigative: 0,
        artistic: 0,
        social: 0,
        enterprising: 0,
        conventional: 0
      };
      
      // Count questions per category for averaging
      const counts = {
        realistic: 0,
        investigative: 0,
        artistic: 0,
        social: 0,
        enterprising: 0,
        conventional: 0
      };
      
      // Sum up scores by category
      Object.entries(answers).forEach(([questionId, value]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question) {
          scores[question.category] += value;
          counts[question.category]++;
        }
      });
      
      // Calculate average score for each category (0-100)
      Object.keys(scores).forEach(category => {
        const typedCategory = category as RiasecCategory;
        if (counts[typedCategory] > 0) {
          scores[typedCategory] = Math.round((scores[typedCategory] / (counts[typedCategory] * 5)) * 100);
        }
      });
      
      // Find top 3 categories
      const topCategories = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category as RiasecCategory);
      
      // Here we would normally call the ML API for career recommendations
      // For now, let's simulate API call with mock recommendations
      
      // Mock career recommendations based on top categories
      const mockRecommendations = getMockRecommendations(topCategories, scores);
      
      // Prepare final result
      const result: RiasecResult = {
        ...scores,
        timestamp: new Date().toISOString(),
        topCategories,
        recommendedCareers: mockRecommendations
      };
      
      // Call the modified complete handler that exits fullscreen
      handleComplete(result);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get mock recommendations - in a real app, this would come from the ML backend
  const getMockRecommendations = (
    topCategories: RiasecCategory[], 
    scores: Record<RiasecCategory, number>
  ): RecommendedCareer[] => {
    // Career database with RIASEC categories
    const careerDatabase: Record<string, Omit<RecommendedCareer, 'match'> & { primaryCategories: RiasecCategory[] }> = {
      'Software Engineer': {
        title: 'Software Engineer',
        description: 'Merancang, mengembangkan, dan memelihara aplikasi perangkat lunak.',
        primaryCategories: ['investigative', 'realistic', 'conventional'],
        categories: ['investigative', 'realistic', 'conventional'],
        educationRequired: 'Sarjana Ilmu Komputer atau bidang terkait',
        salary: { min: 8000000, max: 25000000, currency: 'IDR' },
        outlookGrowth: 22
      },
      'Graphic Designer': {
        title: 'Graphic Designer',
        description: 'Membuat elemen visual untuk mengkomunikasikan ide kepada konsumen.',
        primaryCategories: ['artistic', 'realistic'],
        categories: ['artistic', 'realistic', 'enterprising'],
        educationRequired: 'Diploma/Sarjana Desain Grafis atau bidang terkait',
        salary: { min: 5000000, max: 15000000, currency: 'IDR' },
        outlookGrowth: 3
      },
      'Teacher': {
        title: 'Teacher',
        description: 'Mendidik siswa dalam berbagai mata pelajaran dan tingkatan.',
        primaryCategories: ['social', 'artistic'],
        categories: ['social', 'artistic', 'conventional'],
        educationRequired: 'Sarjana Pendidikan',
        salary: { min: 3500000, max: 10000000, currency: 'IDR' },
        outlookGrowth: 4
      },
      'Marketing Manager': {
        title: 'Marketing Manager',
        description: 'Mengembangkan dan melaksanakan strategi pemasaran untuk produk atau layanan.',
        primaryCategories: ['enterprising', 'social'],
        categories: ['enterprising', 'social', 'conventional'],
        educationRequired: 'Sarjana Pemasaran, Komunikasi, atau Bisnis',
        salary: { min: 10000000, max: 25000000, currency: 'IDR' },
        outlookGrowth: 10
      },
      'Accountant': {
        title: 'Accountant',
        description: 'Menyiapkan dan memeriksa catatan keuangan, memastikan akurasi dan kepatuhan pada hukum.',
        primaryCategories: ['conventional', 'investigative'],
        categories: ['conventional', 'investigative', 'enterprising'],
        educationRequired: 'Sarjana Akuntansi',
        salary: { min: 7000000, max: 18000000, currency: 'IDR' },
        outlookGrowth: 7
      },
      'Civil Engineer': {
        title: 'Civil Engineer',
        description: 'Merancang, membangun, dan memelihara infrastruktur seperti jalan, jembatan, dan gedung.',
        primaryCategories: ['realistic', 'investigative'],
        categories: ['realistic', 'investigative', 'conventional'],
        educationRequired: 'Sarjana Teknik Sipil',
        salary: { min: 7500000, max: 20000000, currency: 'IDR' },
        outlookGrowth: 8
      },
      'Psychologist': {
        title: 'Psychologist',
        description: 'Meneliti perilaku manusia dan proses mental, serta memberikan terapi untuk masalah psikologis.',
        primaryCategories: ['investigative', 'social'],
        categories: ['investigative', 'social', 'artistic'],
        educationRequired: 'Master atau Doktor Psikologi',
        salary: { min: 8000000, max: 25000000, currency: 'IDR' },
        outlookGrowth: 14
      },
      'Event Planner': {
        title: 'Event Planner',
        description: 'Mengatur dan mengkoordinasikan acara profesional, pribadi, atau sosial.',
        primaryCategories: ['enterprising', 'social'],
        categories: ['enterprising', 'social', 'artistic'],
        educationRequired: 'Diploma/Sarjana Event Management atau bidang terkait',
        salary: { min: 5000000, max: 15000000, currency: 'IDR' },
        outlookGrowth: 8
      },
      'Financial Analyst': {
        title: 'Financial Analyst',
        description: 'Menganalisis data keuangan untuk membantu perusahaan membuat keputusan bisnis.',
        primaryCategories: ['conventional', 'investigative'],
        categories: ['conventional', 'investigative', 'enterprising'],
        educationRequired: 'Sarjana Keuangan, Ekonomi, atau Statistik',
        salary: { min: 8000000, max: 20000000, currency: 'IDR' },
        outlookGrowth: 11
      },
      'Interior Designer': {
        title: 'Interior Designer',
        description: 'Merancang dan mendekorasi ruangan dalam bangunan untuk memenuhi kebutuhan fungsional dan estetika.',
        primaryCategories: ['artistic', 'enterprising'],
        categories: ['artistic', 'enterprising', 'realistic'],
        educationRequired: 'Sarjana Desain Interior',
        salary: { min: 6000000, max: 18000000, currency: 'IDR' },
        outlookGrowth: 5
      }
    };
    
    // Calculate match percentage for each career based on user's RIASEC profile
    const results: RecommendedCareer[] = [];
    
    Object.values(careerDatabase).forEach(career => {
      // Calculate match score (simple weighted algorithm)
      let matchScore = 0;
      let maxPossibleScore = 0;
      
      // Give more weight to primary categories
      career.primaryCategories.forEach(category => {
        matchScore += scores[category] * 2;
        maxPossibleScore += 200; // Max score is 100 * weight 2
      });
      
      // Add other categories with less weight
      career.categories
        .filter(category => !career.primaryCategories.includes(category))
        .forEach(category => {
          matchScore += scores[category];
          maxPossibleScore += 100; // Max score is 100 * weight 1
        });
      
      // Calculate percentage match
      const matchPercentage = Math.round((matchScore / maxPossibleScore) * 100);
      
      results.push({
        ...career,
        match: matchPercentage
      });
    });
    
    // Sort by match percentage (descending) and return top 10
    return results.sort((a, b) => b.match - a.match).slice(0, 10);
  };
  
  const handleStartAssessment = () => {
    setShowIntroduction(false);
    // Enter fullscreen when starting assessment
    enterFullscreen();
  };

  const handleConfirmCancel = () => {
    setShowConfirmExit(true);
  };
  
  // Modified onComplete to exit fullscreen
  const handleComplete = (result: RiasecResult) => {
    exitFullscreen();
    onComplete(result);
  };

  // Modified onCancel to exit fullscreen  
  const handleCancel = () => {
    exitFullscreen();
    onCancel();
  };
  
  // Check if assessment is complete
  const isComplete = Object.keys(answers).length === questions.length;
  
  if (showIntroduction) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              {t('riasec.title', 'Penilaian Minat Karir RIASEC')}
            </h1>
            <button
              onClick={handleCancel}
              className="text-white/80 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            {t('riasec.subtitle', 'Holland Code - Temukan Minat Karir yang Sesuai dengan Kepribadian Anda')}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 p-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* About the Assessment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                {t('riasec.intro.aboutTitle', 'Tentang Penilaian RIASEC')}
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {t('riasec.intro.description', 'RIASEC (Holland Code) adalah teori minat karir yang dikembangkan oleh Dr. John Holland. Tes ini mengidentifikasi enam tipe kepribadian yang berbeda dan mencocokkannya dengan lingkungan kerja yang sesuai untuk membantu Anda menemukan karir yang paling cocok.')}
                </p>
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">{t('riasec.intro.categories', 'Enam Kategori RIASEC:')}</h4>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                    <div className="flex items-start">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 flex-shrink-0">R</span>
                      <div>
                        <strong className="text-gray-900">Realistic</strong>
                        <p className="text-gray-600">Praktis, hands-on, suka bekerja dengan tools dan mesin</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 flex-shrink-0">I</span>
                      <div>
                        <strong className="text-gray-900">Investigative</strong>
                        <p className="text-gray-600">Analitis, ilmiah, suka memecahkan masalah</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 flex-shrink-0">A</span>
                      <div>
                        <strong className="text-gray-900">Artistic</strong>
                        <p className="text-gray-600">Kreatif, ekspresif, suka seni dan desain</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 flex-shrink-0">S</span>
                      <div>
                        <strong className="text-gray-900">Social</strong>
                        <p className="text-gray-600">Membantu, berinteraksi, suka bekerja dengan orang</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 flex-shrink-0">E</span>
                      <div>
                        <strong className="text-gray-900">Enterprising</strong>
                        <p className="text-gray-600">Memimpin, persuasif, suka bisnis dan politik</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold mr-3 mt-0.5 flex-shrink-0">C</span>
                      <div>
                        <strong className="text-gray-900">Conventional</strong>
                        <p className="text-gray-600">Terorganisir, detail, suka struktur dan data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                {t('riasec.intro.detailsTitle', 'Detail Penilaian')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">54</div>
                  <div className="text-sm text-blue-800 font-medium">{t('riasec.intro.questions', 'Pertanyaan')}</div>
                  <div className="text-xs text-blue-600 mt-1">9 per kategori</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">10-15</div>
                  <div className="text-sm text-green-800 font-medium">{t('riasec.intro.minutes', 'Menit')}</div>
                  <div className="text-xs text-green-600 mt-1">Estimasi waktu</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">1-5</div>
                  <div className="text-sm text-purple-800 font-medium">{t('riasec.intro.scale', 'Skala Penilaian')}</div>
                  <div className="text-xs text-purple-600 mt-1">Likert scale</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">10+</div>
                  <div className="text-sm text-orange-800 font-medium">Rekomendasi</div>
                  <div className="text-xs text-orange-600 mt-1">Karir cocok</div>
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
                {t('riasec.intro.termsTitle', 'Syarat dan Ketentuan')}
              </h2>
              <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                    <span>{t('riasec.intro.term1', 'Jawab berdasarkan preferensi dan minat alami Anda, bukan berdasarkan kemampuan atau keterampilan.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                    <span>{t('riasec.intro.term2', 'Fokus pada aktivitas yang Anda NIKMATI, bukan yang Anda rasa "seharusnya" Anda sukai.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                    <span>{t('riasec.intro.term3', 'Hasil ini adalah panduan untuk eksplorasi karir, bukan batasan pilihan hidup Anda.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                    <span>{t('riasec.intro.term4', 'Rekomendasi karir berdasarkan data pasar kerja Indonesia dan dapat berubah seiring waktu.')}</span>
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
                <div className="bg-emerald-100 rounded-full p-2 mr-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                {t('riasec.intro.results', 'Anda Akan Mendapat:')}
              </h2>
              <div className="bg-white rounded-lg p-5 border border-gray-200 space-y-4">
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <div>
                    <strong className="text-gray-900">Profil RIASEC lengkap</strong>
                    <p className="text-sm text-gray-600">Skor untuk setiap kategori minat dengan visualisasi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <div>
                    <strong className="text-gray-900">Top 3 kategori dominan</strong>
                    <p className="text-sm text-gray-600">Minat utama yang paling cocok dengan kepribadian Anda</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <div>
                    <strong className="text-gray-900">Rekomendasi karir</strong>
                    <p className="text-sm text-gray-600">10+ profesi dengan tingkat kecocokan dan detail informasi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <div>
                    <strong className="text-gray-900">Informasi karir detail</strong>
                    <p className="text-sm text-gray-600">Gaji, pendidikan, prospek, dan deskripsi pekerjaan</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <div>
                    <strong className="text-gray-900">Holland Code analysis</strong>
                    <p className="text-sm text-gray-600">Panduan pengembangan karir berdasarkan teori Holland</p>
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
                {t('riasec.intro.instructionsTitle', 'Petunjuk Pengerjaan')}
              </h2>
              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                <ol className="space-y-4 text-gray-700 text-sm">
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                    <div>
                      <strong>Baca aktivitas dengan cermat</strong>
                      <p className="text-gray-600 mt-1">Pahami setiap pernyataan aktivitas yang ditanyakan</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                    <div>
                      <strong>Skala 1-5</strong>
                      <p className="text-gray-600 mt-1">1 = Sangat Tidak Setuju, 5 = Sangat Setuju</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                    <div>
                      <strong>Fokus pada minat, bukan kemampuan</strong>
                      <p className="text-gray-600 mt-1">Pertimbangkan apakah Anda SUKA aktivitas tersebut</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                    <div>
                      <strong>Navigasi mudah</strong>
                      <p className="text-gray-600 mt-1">Gunakan tombol untuk berpindah antar pertanyaan</p>
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
                  <div className="flex items-center mb-2">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold mr-2">R</span>
                    <p className="text-sm text-gray-700 italic">"Saya suka bekerja dengan tangan dan alat-alat"</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sangat Tidak Setuju</span>
                    <span>Sangat Setuju</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    {[1,2,3,4,5].map(num => (
                      <div key={num} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center mb-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold mr-2">A</span>
                    <p className="text-sm text-gray-700 italic">"Saya senang mengekspresikan diri secara kreatif"</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sangat Tidak Setuju</span>
                    <span>Sangat Setuju</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    {[1,2,3,4,5].map(num => (
                      <div key={num} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center text-lg"
          >
            <CheckCircle className="h-6 w-6 mr-3" />
            {t('riasec.intro.startButton', 'Mulai Penilaian RIASEC')}
          </button>
          <button
            onClick={handleCancel}
            className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-4 px-8 rounded-lg transition-colors duration-200"
          >
            {t('riasec.intro.cancelButton', 'Batal')}
          </button>
        </div>
      </div>
    );
  }
  
  if (showConfirmExit) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('riasec.confirmExit', 'Yakin ingin keluar?')}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  {t('riasec.exitWarning', 'Progres penilaian Anda akan hilang. Apakah Anda yakin ingin keluar?')}
                </p>
                
                {/* Progress Summary */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        {t('riasec.progressWillBeLost', 'Progress yang akan hilang')}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>{Object.keys(answers).length} dari {questions.length} pertanyaan sudah dijawab ({progress}%)</li>
                          <li>Estimasi waktu tersisa: {Math.ceil((questions.length - Object.keys(answers).length) * 0.5)} menit</li>
                          <li>Semua jawaban akan dihapus dan tidak dapat dipulihkan</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Question Info */}
                {Object.keys(answers).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          {t('riasec.currentProgress', 'Progress saat ini')}
                        </h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Anda sedang di pertanyaan {currentQuestion + 1} dari {questions.length}. 
                          Kategori: {t(`riasec.categories.${questions[currentQuestion].category}`, questions[currentQuestion].category)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('riasec.continue', 'Lanjutkan Penilaian')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('riasec.exit', 'Keluar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto overflow-hidden">
      <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('riasec.title', 'Penilaian Minat Karir RIASEC')}</h2>
        <p className="text-base text-gray-600">
          {t('riasec.description', 'Jawab semua pertanyaan untuk mengetahui minat dan potensi karir terbaik Anda.')}
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="px-8 py-5 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">
            {t('riasec.progress', 'Kemajuan')}: {progress}%
          </span>
          <span className="text-sm font-medium px-3 py-1 bg-brand-50 rounded-full text-brand-700">
            {Object.keys(answers).length}/{questions.length} {t('riasec.questionsAnswered', 'pertanyaan dijawab')}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-full h-3 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question */}
      <div className="p-8 flex-grow bg-white min-h-[400px] relative">
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-base font-semibold text-gray-700 flex items-center">
              <span className="flex items-center justify-center bg-brand-100 text-brand-700 h-8 w-8 rounded-full text-sm font-bold mr-3">
                {currentQuestion + 1}
              </span>
              {t('riasec.of', 'dari')} {questions.length}
            </h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {t('riasec.category', 'Kategori')}:
              </span>
              <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-sm font-medium rounded-full text-indigo-700">
                {t(`riasec.categories.${questions[currentQuestion].category}`, questions[currentQuestion].category)}
              </span>
            </div>
          </div>
          <p className="text-xl font-medium text-gray-900">
            {questions[currentQuestion].text}
          </p>
        </div>
        
        {/* Answer options */}
        <div className="space-y-3 mb-8">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="w-full">
              <button
                onClick={() => handleAnswer(questions[currentQuestion].id, value)}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 border-2 rounded-xl text-left transition-all duration-200",
                  answers[questions[currentQuestion].id] === value
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-base font-medium">
                  {t(`riasec.answerOptions.${value}`, {
                    1: 'Sangat Tidak Setuju',
                    2: 'Tidak Setuju',
                    3: 'Netral',
                    4: 'Setuju',
                    5: 'Sangat Setuju'
                  }[value])}
                </span>
                {answers[questions[currentQuestion].id] === value ? (
                  <div className="flex items-center justify-center bg-brand-100 h-8 w-8 rounded-full">
                    <CheckCircle className="h-5 w-5 text-brand-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-gray-200"></div>
                )}
              </button>
              
              {/* Countdown Progress Bar - Only show under selected answer */}
              {countdown !== null && answers[questions[currentQuestion].id] === value && (
                <div className="mt-3 px-5 transform transition-all duration-300 ease-out">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-brand-600 font-medium animate-pulse">
                      {t('riasec.countdown.autoAdvance', 'Otomatis lanjut dalam')} {countdown} {t('riasec.countdown.seconds', 'detik')}
                    </span>
                  </div>
                  <div className="w-full bg-brand-100 rounded-full h-2 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-[950ms] ease-linear shadow-sm"
                      style={{ 
                        width: `${((3 - countdown) / 3) * 100}%`,
                        boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Navigation */}
        <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-6">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className={cn(
              "inline-flex items-center px-5 py-2.5 border-2 rounded-xl text-sm font-medium transition-colors duration-200",
              currentQuestion === 0
                ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            )}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            {t('riasec.previous', 'Sebelumnya')}
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={handleConfirmCancel}
              className="inline-flex items-center px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
            >
              {t('riasec.cancel', 'Batal')}
            </button>
            
            {isComplete ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center px-5 py-2.5 border-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isSubmitting
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white border-transparent shadow-md hover:shadow-lg"
                )}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('riasec.processing', 'Memproses...')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t('riasec.submit', 'Kirim Penilaian')}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestion === questions.length - 1}
                className={cn(
                  "inline-flex items-center px-5 py-2.5 border-2 rounded-xl text-sm font-medium transition-colors duration-200",
                  currentQuestion === questions.length - 1
                    ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                {t('riasec.next', 'Berikutnya')}
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Help text */}
      <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="p-2 bg-yellow-50 rounded-full mr-3 flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('riasec.helpTitle', 'Petunjuk')}</h4>
            <p className="text-sm text-gray-600">
              {t('riasec.helpText', 'Berikan jawaban yang jujur untuk hasil yang paling akurat. Tidak ada jawaban benar atau salah. Jawaban menunjukkan preferensi Anda, bukan kemampuan.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiasecAssessment;
