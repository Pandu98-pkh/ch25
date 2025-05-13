import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
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
  
  // Calculate progress
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);
  
  // Handle answer selection
  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Auto-advance to next question if not the last one
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  // Navigate through questions
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const goToNextQuestion = () => {
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
      
      // Call the onComplete callback with the result
      onComplete(result);
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
  
  // Check if assessment is complete
  const isComplete = Object.keys(answers).length === questions.length;
  
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
      <div className="p-8 flex-grow bg-white min-h-[400px]">
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
            <button
              key={value}
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
              onClick={onCancel}
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
