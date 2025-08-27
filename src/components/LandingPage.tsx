import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, Calendar, BarChart3, Shield, ArrowRight, Star, CheckCircle, Globe, ChevronDown, PlayCircle, Award, Heart, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Dr. Sarah Wijaya",
      role: "Kepala Sekolah SMA Negeri 1 Jakarta",
      text: "Counselor Hub telah merevolusi cara kami memberikan dukungan kepada siswa. Sistem yang sangat lengkap dan mudah digunakan!",
      rating: 5
    },
    {
      name: "Ahmad Fauzi",
      role: "Konselor Sekolah",
      text: "Dengan fitur assessment mental health yang terintegrasi, saya dapat memberikan bantuan yang lebih tepat sasaran kepada siswa.",
      rating: 5
    },
    {
      name: "Maria Sari",
      role: "Siswa Kelas XII",
      text: "Aplikasi ini membantu saya memahami diri sendiri lebih baik dan merencanakan karir masa depan dengan lebih jelas.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Mental Health Assessment",
      description: "Tes psikologi standar (PHQ-9, GAD-7, DASS-21) untuk pemantauan kesehatan mental siswa",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Student Management",
      description: "Sistem manajemen data siswa yang komprehensif dengan tracking perkembangan akademik",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Calendar,
      title: "Session Scheduling",
      description: "Penjadwalan sesi konseling yang fleksibel dengan reminder otomatis",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Dashboard analitik mendalam dengan laporan progress siswa yang detail",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Target,
      title: "Career Guidance",
      description: "Panduan karir dengan assessment RIASEC dan MBTI untuk eksplorasi masa depan",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Keamanan data tingkat enterprise dengan enkripsi end-to-end",
      color: "from-gray-500 to-slate-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Siswa Terdaftar" },
    { number: "500+", label: "Sekolah Partner" },
    { number: "15,000+", label: "Sesi Konseling" },
    { number: "98%", label: "Tingkat Kepuasan" }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 shadow-sm border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Counselor Hub
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                Fitur
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                Tentang
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                Testimoni
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'en' ? 'ID' : 'EN'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - WHAT & WHY */}
      <section className={`pt-32 pb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Platform Konseling
                  </span>
                  <br />
                  <span className="text-gray-900">
                    Terdepan untuk Sekolah
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  <strong>WHAT:</strong> Sistem manajemen konseling terintegrasi yang menggabungkan teknologi AI dengan pendekatan psikologi profesional.
                  <br/><br/>
                  <strong>WHY:</strong> Karena setiap siswa berhak mendapatkan dukungan mental health yang berkualitas dan personal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                <button
                  onClick={() => scrollToSection('demo')}
                  className="group px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-indigo-50 flex items-center justify-center"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Lihat Demo
                </button>
              </div>

              {/* Debug Tools untuk Mobile Testing */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => navigate('/test-login')}
                  className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  🔧 Test Login API
                </button>
                <button
                  onClick={() => navigate('/network-test')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                >
                  🌐 Network Test
                </button>
                <button
                  onClick={() => window.open('/api/debug/users', '_blank')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                >
                  📊 Debug Users
                </button>
                <button
                  onClick={() => window.open('/health', '_blank')}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  💚 Health Check
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dashboard Siswa</h3>
                      <p className="text-sm text-gray-600">Pantau progress secara real-time</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Mental Health Score</span>
                      <span className="text-sm font-bold text-green-600">85/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">24</div>
                      <div className="text-xs text-gray-600">Sesi</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">98%</div>
                      <div className="text-xs text-gray-600">Progress</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">A+</div>
                      <div className="text-xs text-gray-600">Grade</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - HOW */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HOW:
              </span> Bagaimana Kami Membantu?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform komprehensif dengan fitur-fitur canggih yang dirancang khusus untuk kebutuhan konseling sekolah modern
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - WHO & WHERE */}
      <section id="about" className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  WHO & WHERE:
                </span> Untuk Siapa dan Dimana?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Untuk Siswa</h3>
                    <p className="text-gray-600">Platform self-assessment dan tracking personal growth untuk mengembangkan potensi diri secara maksimal.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Untuk Konselor</h3>
                    <p className="text-gray-600">Tools profesional untuk manajemen kasus, assessment, dan monitoring progress siswa dengan efektif.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Untuk Sekolah</h3>
                    <p className="text-gray-600">Sistem manajemen holistik yang meningkatkan kualitas layanan konseling dan wellbeing siswa.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">🏫 Tersedia di Seluruh Indonesia</h4>
                  <p className="text-gray-600">
                    Dari Sabang sampai Merauke, kami mendukung digitalisasi layanan konseling sekolah untuk menciptakan generasi yang sehat mental dan berprestasi.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">SMA/SMK</h4>
                    <p className="text-sm text-gray-600">Fokus pada persiapan karir dan masa depan</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">SMP</h4>
                    <p className="text-sm text-gray-600">Pendampingan masa transisi remaja</p>
                  </div>
                </div>

                <div className="space-y-6 mt-12">
                  <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Universitas</h4>
                    <p className="text-sm text-gray-600">Support mental health mahasiswa</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Institusi</h4>
                    <p className="text-sm text-gray-600">Kustomisasi untuk kebutuhan khusus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - WHEN */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WHEN:
              </span> Kapan Mulai Menggunakan?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sekarang adalah waktu yang tepat! Dengarkan pengalaman pengguna yang telah merasakan manfaatnya.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl italic text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-indigo-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentTestimonial ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Mulai gratis hari ini - Tidak perlu kartu kredit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Transformasi Layanan Konseling Sekolah Anda?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan sekolah yang telah mempercayai Counselor Hub untuk meningkatkan wellbeing siswa.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Mulai Sekarang - Gratis
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white hover:text-indigo-600"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Counselor Hub</span>
              </div>
              <p className="text-gray-400">
                Platform konseling sekolah terdepan yang menggabungkan teknologi dengan pendekatan psikologi profesional.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mental Health Assessment</li>
                <li>Student Management</li>
                <li>Session Scheduling</li>
                <li>Analytics & Reports</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Training</li>
                <li>Customer Support</li>
                <li>Community</li>
                <li><button onClick={() => navigate('/test-login')} className="hover:text-white transition-colors">🔧 Test Login</button></li>
                <li><button onClick={() => navigate('/network-test')} className="hover:text-white transition-colors">🌐 Network Test</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@counselorhub.id</li>
                <li>+62 21 1234 5678</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Counselor Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
      >
        <ChevronDown className="h-6 w-6 transform rotate-180" />
      </button>
    </div>
  );
}
