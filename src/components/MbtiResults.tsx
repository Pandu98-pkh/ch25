import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MbtiResult } from './MbtiAssessment';
import { ArrowRight, Award, Book, Briefcase, BrainCircuit, CheckSquare, Clock, Gauge, RefreshCcw, Users } from 'lucide-react';
import { cn } from '../utils/cn';

export interface MbtiResultsProps {
  result: MbtiResult;
  onStartNewAssessment: () => void;
}

// MBTI type descriptions
const mbtiTypeDescriptions: { [key: string]: string } = {
  'INTJ': 'Pemilik arsitek (the Architect) memiliki pola pikir yang analitis, strategis, dan visioner. Mereka mampu melihat gambaran besar dan merencanakan solusi jangka panjang dengan detail yang cermat. Tipe ini menghargai logika, efisiensi, dan memiliki standar tinggi untuk diri sendiri dan orang lain.',
  'INTP': 'Pemilik logika (the Logician) adalah pemikir abstrak yang penuh kreativitas dengan kemampuan analisis mendalam. Mereka menikmati tantangan intelektual dan eksplorasi ide-ide baru. Tipe ini menghargai ketepatan, logika, dan inovasi di atas segala hal.',
  'ENTJ': 'Pemilik komandan (the Commander) adalah pemimpin alami dengan kemampuan strategis tinggi. Mereka percaya diri, tegas, dan berorientasi hasil. Tipe ini mampu melihat potensi di segala situasi dan mengorganisir sumber daya untuk mencapai tujuan.',
  'ENTP': 'Pemilik inovator (the Debater) adalah pemikir kreatif dan cerdas yang menikmati tantangan intelektual. Mereka cepat mengenali pola dan hubungan antara ide-ide, serta selalu mencari peluang baru. Tipe ini menikmati argumentasi sebagai cara mengembangkan pemahaman.',
  'INFJ': 'Pemilik advokat (the Advocate) adalah idealis yang penuh wawasan dengan standar moral tinggi. Mereka memiliki intuisi yang tajam tentang orang dan situasi, serta berdedikasi pada nilai-nilai dan misi mereka. Tipe ini mencari makna dan koneksi dalam segala hal.',
  'INFP': 'Pemilik mediator (the Mediator) adalah idealis yang penuh empati dengan nilai-nilai pribadi yang kuat. Mereka didorong oleh prinsip dan keinginan untuk memahami sifat manusia. Tipe ini menghargai keotentikan, kreativitas, dan pengembangan diri.',
  'ENFJ': 'Pemilik protagonis (the Protagonist) adalah pemimpin karismatik dan inspiratif yang peduli dengan perkembangan orang lain. Mereka mampu mengenali potensi dalam diri orang dan memotivasi mereka untuk tumbuh. Tipe ini menghargai harmoni, kerjasama, dan pemenuhan diri.',
  'ENFP': 'Pemilik kampanye (the Campaigner) adalah individu antusias dan kreatif yang melihat kemungkinan di mana-mana. Mereka menghubungkan orang dan ide dengan energi dan wawasan. Tipe ini menghargai kebebasan, inovasi, dan koneksi interpersonal.',
  'ISTJ': 'Pemilik logistik (the Logistician) adalah individu praktis dan faktual yang dapat diandalkan. Mereka bertanggung jawab, terorganisir, dan berorientasi pada detail. Tipe ini menghargai tradisi, keamanan, dan pendekatan metodis.',
  'ISFJ': 'Pemilik pembela (the Defender) adalah individu loyal dan perhatian dengan daya observasi tinggi. Mereka mendukung orang lain dengan pendekatan praktis dan realistis. Tipe ini menghargai keamanan, stabilitas, dan melayani kebutuhan praktis orang lain.',
  'ESTJ': 'Pemilik eksekutif (the Executive) adalah administrator yang efisien dan berorientasi pada hasil. Mereka praktis, tegas, dan mengorganisir proyek serta orang untuk mencapai tujuan. Tipe ini menghargai kejelasan, struktur, dan tradisi.',
  'ESFJ': 'Pemilik konsul (the Consul) adalah individu sosial dan penuh perhatian yang menciptakan harmoni dalam lingkungan mereka. Mereka memiliki kesadaran tinggi akan kebutuhan orang lain dan berusaha memfasilitasi tradisi dan ikatan sosial. Tipe ini menghargai koneksi, loyalitas, dan stabilitas.',
  'ISTP': 'Pemilik virtuoso (the Virtuoso) adalah pengamat yang tenang dengan kemampuan teknis yang kuat. Mereka adalah pemecah masalah praktis yang beradaptasi dengan cepat pada situasi baru. Tipe ini menghargai efisiensi, logika, dan keterampilan praktis.',
  'ISFP': 'Pemilik adventurer (the Adventurer) adalah individu artistik dan spontan yang menikmati momen saat ini. Mereka sensitif terhadap kebutuhan orang lain dan mengekspresikan diri melalui tindakan praktis. Tipe ini menghargai kebebasan, keindahan, dan pengalaman sensori.',
  'ESTP': 'Pemilik pengusaha (the Entrepreneur) adalah individu energetik dan berorientasi tindakan yang menikmati tantangan. Mereka adalah pemecah masalah yang praktis dengan kemampuan negosiasi yang kuat. Tipe ini menghargai kebebasan, dinamisme, dan hasil nyata.',
  'ESFP': 'Pemilik penghibur (the Entertainer) adalah individu spontan dan antusias yang menikmati berada di pusat perhatian. Mereka praktis, berpikiran terbuka, dan menambahkan kegembiraan pada situasi. Tipe ini menghargai kesenangan, pengalaman, dan koneksi interpersonal.'
};

// Helper function to get learning tips based on MBTI type
function getLearningTips(type: string): string[] {
  // Default tips that apply to most types
  const defaultTips = [
    'Identifikasi lingkungan belajar yang paling cocok untuk Anda',
    'Pertimbangkan untuk mencatat informasi dengan cara yang sesuai gaya belajar Anda',
    'Sesuaikan jadwal belajar dengan ritme energi alami Anda',
    'Gabungkan minat pribadi dengan materi pembelajaran ketika memungkinkan'
  ];
  
  // Type-specific learning tips
  const typeTips: {[key: string]: string[]} = {
    'INTJ': [
      'Cari koneksi teoretis dan sistematis dalam materi',
      'Tetapkan tujuan jangka panjang untuk pembelajaran Anda',
      'Luangkan waktu untuk merefleksikan dan mengintegrasikan konsep',
      'Prioritaskan pembelajaran mandiri dengan sumber yang mendalam'
    ],
    'INTP': [
      'Eksplorasi berbagai sudut pandang tentang suatu topik',
      'Mencari tantangan intelektual dalam materi pembelajaran',
      'Jelajahi pertanyaan "mengapa" di balik konsep',
      'Struktur pembelajaran Anda dengan waktu untuk analisis mendalam'
    ],
    'ENTJ': [
      'Tentukan tujuan jelas dan struktur untuk pembelajaran Anda',
      'Diskusikan ide dengan orang lain untuk menguji pemahaman',
      'Hubungkan pembelajaran dengan tujuan jangka panjang',
      'Cari penerapan praktis dari konsep teoretis'
    ],
    'ENTP': [
      'Cari materi pembelajaran yang menantang asumsi',
      'Diskusikan ide dengan berbagai perspektif',
      'Eksperimen dengan pendekatan baru dan inovatif',
      'Hubungkan topik yang berbeda untuk menemukan pola'
    ],
    'INFJ': [
      'Cari makna dan tujuan dalam apa yang Anda pelajari',
      'Kaitkan konsep baru dengan nilai-nilai pribadi',
      'Pertimbangkan bagaimana pengetahuan dapat membantu orang lain',
      'Luangkan waktu untuk refleksi mendalam dan sintesis'
    ],
    'INFP': [
      'Ekspresikan pemahaman Anda melalui media kreatif',
      'Kaitkan pembelajaran dengan nilai-nilai personal',
      'Belajar dalam lingkungan yang harmonis dan tenang',
      'Jelajahi cara menerapkan pengetahuan untuk membantu orang lain'
    ],
    'ENFJ': [
      'Pelajari bersama orang lain ketika memungkinkan',
      'Cari cara menerapkan pengetahuan untuk membimbing atau membantu',
      'Diskusikan ide untuk memperdalam pemahaman',
      'Fokus pada bagaimana pembelajaran dapat meningkatkan hubungan'
    ],
    'ENFP': [
      'Cari ragam pendekatan dan sumber belajar',
      'Hubungkan materi dengan minat personal',
      'Eksperimen dengan cara kreatif untuk memahami konsep',
      'Diskusikan ide dengan orang lain untuk menginspirasi pemikiran baru'
    ],
    'ISTJ': [
      'Buat jadwal belajar yang terstruktur dan konsisten',
      'Fokus pada detail faktual dan informasi spesifik',
      'Praktikkan pembelajaran langkah demi langkah',
      'Terapkan informasi baru pada situasi praktis'
    ],
    'ISFJ': [
      'Kaitkan informasi baru dengan pengalaman masa lalu',
      'Buat catatan terorganisir dan sistematis',
      'Belajar dalam lingkungan yang tenang dan stabil',
      'Praktikkan penerapan praktis dari konsep'
    ],
    'ESTJ': [
      'Atur pembelajaran dengan jadwal dan struktur yang jelas',
      'Fokus pada aplikasi praktis dan hasil nyata',
      'Jaga akuntabilitas dengan tenggat waktu',
      'Berlatih menerapkan pengetahuan dalam skenario dunia nyata'
    ],
    'ESFJ': [
      'Berpartisipasi dalam grup belajar terstruktur',
      'Cari cara untuk menerapkan pembelajaran dalam membantu orang lain',
      'Diskusikan aplikasi praktis dari konsep',
      'Belajar melalui contoh konkret dan skenario dunia nyata'
    ],
    'ISTP': [
      'Fokus pada pembelajaran berbasis pengalaman',
      'Eksperimen dengan penerapan praktis',
      'Pecah proyek besar menjadi langkah-langkah praktis',
      'Jelajahi cara kerja sistem dan mekanisme'
    ],
    'ISFP': [
      'Cari elemen kreatif dan estetika dalam materi',
      'Kaitkan pembelajaran dengan nilai personal',
      'Terapkan konsep dalam proyek hands-on',
      'Buat ruang untuk fleksibilitas dalam pendekatan belajar'
    ],
    'ESTP': [
      'Berpartisipasi dalam pembelajaran aktif dan berbasis aksi',
      'Fokus pada penerapan langsung dan hasil segera',
      'Belajar melalui pengalaman langsung dan trial-and-error',
      'Gunakan studi kasus dan contoh dunia nyata'
    ],
    'ESFP': [
      'Gabungkan pembelajaran dengan aktivitas sosial',
      'Gunakan pendekatan praktis dan berbasis pengalaman',
      'Buat pembelajaran menjadi menyenangkan dan interaktif',
      'Terapkan konsep dalam situasi kehidupan nyata'
    ],
  };
  
  return typeTips[type] || defaultTips;
}

export default function MbtiResults({ result, onStartNewAssessment }: MbtiResultsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'careers' | 'learning'>('overview');

  // MBTI dimension full names
  const dimensionNames = {
    E: t('mbti.dimensions.E', 'Extraversion'),
    I: t('mbti.dimensions.I', 'Introversion'),
    S: t('mbti.dimensions.S', 'Sensing'),
    N: t('mbti.dimensions.N', 'Intuition'),
    T: t('mbti.dimensions.T', 'Thinking'),
    F: t('mbti.dimensions.F', 'Feeling'),
    J: t('mbti.dimensions.J', 'Judging'),
    P: t('mbti.dimensions.P', 'Perceiving')
  };

  // Helper to get personality dimension name
  const getDimensionName = (dimension: string, score: number) => {
    if (dimension === 'EI') {
      return score > 50 ? dimensionNames.I : dimensionNames.E;
    } else if (dimension === 'SN') {
      return score > 50 ? dimensionNames.N : dimensionNames.S;
    } else if (dimension === 'TF') {
      return score > 50 ? dimensionNames.F : dimensionNames.T;
    } else if (dimension === 'JP') {
      return score > 50 ? dimensionNames.P : dimensionNames.J;
    }
    return '';
  };

  // Get full dimension letters based on percentages
  const getDimensionLetter = (dimension: string, score: number) => {
    if (dimension === 'EI') {
      return score > 50 ? 'I' : 'E';
    } else if (dimension === 'SN') {
      return score > 50 ? 'N' : 'S';
    } else if (dimension === 'TF') {
      return score > 50 ? 'F' : 'T';
    } else if (dimension === 'JP') {
      return score > 50 ? 'P' : 'J';
    }
    return '';
  };

  // Get description for the MBTI type
  const getTypeDescription = () => {
    return mbtiTypeDescriptions[result.type] || 
      t('mbti.noDescription', 'Deskripsi untuk tipe kepribadian ini belum tersedia.');
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {t('mbti.results.yourType', 'Tipe Kepribadian Anda')}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-5xl font-bold">{result.type}</div>
            <div className="text-lg opacity-90">
              {t('mbti.results.type', 'Tipe')}: {getDimensionLetter('EI', result.scores.EI)}-
              {getDimensionLetter('SN', result.scores.SN)}-
              {getDimensionLetter('TF', result.scores.TF)}-
              {getDimensionLetter('JP', result.scores.JP)}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {['overview', 'details', 'careers', 'learning'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    'py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap',
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {t(`mbti.results.tabs.${tab}`, tab === 'overview' ? 'Ringkasan' : 
                    tab === 'details' ? 'Detail' : 
                    tab === 'careers' ? 'Karir' : 'Gaya Belajar')}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <h2 className="text-xl font-semibold text-indigo-900 mb-3">
                  {result.type}: {t(`mbti.types.${result.type}`, result.type)}
                </h2>
                <p className="text-indigo-800">
                  {getTypeDescription()}
                </p>
              </div>

              {/* Personality Type Visualization - Improved */}
              <div className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('mbti.results.dimensionScores', 'Skor Dimensi Kepribadian')}
                </h3>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  {Object.entries(result.scores).map(([dimension, score]) => (
                    <div key={dimension} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-gray-800">
                          {dimension === 'EI' && `${dimensionNames.E} (E) - ${dimensionNames.I} (I)`}
                          {dimension === 'SN' && `${dimensionNames.S} (S) - ${dimensionNames.N} (N)`}
                          {dimension === 'TF' && `${dimensionNames.T} (T) - ${dimensionNames.F} (F)`}
                          {dimension === 'JP' && `${dimensionNames.J} (J) - ${dimensionNames.P} (P)`}
                        </div>
                        <span className="text-sm font-semibold px-3 py-1 bg-gray-100 rounded-full">
                          {getDimensionName(dimension, score)} {score}%
                        </span>
                      </div>
                      
                      <div className="relative">
                        <div className="flex h-7 rounded-lg overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center transition-all duration-300"
                            style={{ width: `${100 - score}%` }}
                          >
                            {100 - score > 15 && (
                              <span className="text-xs font-medium text-white px-2 text-center">
                                {dimension[0]} {100 - score}%
                              </span>
                            )}
                          </div>
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center transition-all duration-300" 
                            style={{ width: `${score}%` }}
                          >
                            {score > 15 && (
                              <span className="text-xs font-medium text-white px-2 text-center">
                                {dimension[1]} {score}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
                            <span className="font-medium">
                              {dimension === 'EI' && dimensionNames.E}
                              {dimension === 'SN' && dimensionNames.S}
                              {dimension === 'TF' && dimensionNames.T}
                              {dimension === 'JP' && dimensionNames.J}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {dimension === 'EI' && dimensionNames.I}
                              {dimension === 'SN' && dimensionNames.N}
                              {dimension === 'TF' && dimensionNames.F}
                              {dimension === 'JP' && dimensionNames.P}
                            </span>
                            <div className="w-3 h-3 rounded-full bg-pink-500 ml-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <p className="italic">{t('mbti.results.dimensionExplanation', 'Persentase menunjukkan kecenderungan Anda ke salah satu sisi spektrum kepribadian.')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Strengths */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 text-green-500 mr-2" />
                  {t('mbti.results.strengths', 'Kekuatan')}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckSquare className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Gauge className="h-5 w-5 text-amber-500 mr-2" />
                  {t('mbti.results.weaknesses', 'Kelemahan')}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <CheckSquare className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compatible Types */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  {t('mbti.results.compatibleTypes', 'Tipe Kepribadian yang Kompatibel')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.compatibleTypes.map((type, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Careers Tab */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 text-purple-500 mr-2" />
                  {t('mbti.results.careerSuggestions', 'Rekomendasi Karir')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('mbti.results.careerDescription', 'Berdasarkan tipe kepribadian MBTI Anda, berikut adalah pilihan karir yang cocok dengan preferensi alami Anda:')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.careerSuggestions.map((career, index) => (
                    <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-purple-900 font-medium">{career}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-5 mt-6 border border-indigo-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <BrainCircuit className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-indigo-800">
                      {t('mbti.results.careerTip', 'Tips Karir')}
                    </h3>
                    <div className="mt-2 text-sm text-indigo-700">
                      <p>
                        {t('mbti.results.careerTipDescription', 'Saran karir didasarkan pada kecenderungan alami tipe MBTI Anda, namun ingat bahwa kesuksesan karir juga dipengaruhi oleh banyak faktor seperti keterampilan, pendidikan, pengalaman, dan passion pribadi.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Style Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Book className="h-5 w-5 text-green-600 mr-2" />
                  {t('mbti.results.learningStyle', 'Gaya Belajar')}
                </h3>
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                  <p className="text-green-800">
                    {result.learningStyle}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    {t('mbti.results.optimizeLearning', 'Optimalkan Pembelajaran Anda')}
                  </h3>
                  <ul className="space-y-3">
                    {getLearningTips(result.type).map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={onStartNewAssessment}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t('mbti.results.takeAgain', 'Ambil Penilaian Lagi')}
            </button>
            
            <a
              href="#" 
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {t('mbti.results.learnMore', 'Pelajari Lebih Lanjut')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}