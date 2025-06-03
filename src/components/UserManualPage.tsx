import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import {
  BookOpen,
  Users,
  Shield,
  GraduationCap,
  Calendar,
  Brain,
  BarChart3,
  Settings,
  FileText,
  Briefcase,
  HelpCircle,
  ChevronRight,
  Search,
  Download,
  Video,
  MessageCircle,
  User
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: string;
  icon: any;
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

const UserManualPage = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Define manual content based on user role
  const getManualSections = (): Section[] => {
    const role = user?.role || 'student';

    switch (role) {
      case 'admin':
        return [
          {
            id: 'overview',
            title: t('userManual.admin.overview.title', 'Overview Dashboard Admin'),
            icon: Shield,
            content: t('userManual.admin.overview.content', 'Sebagai administrator, Anda memiliki akses penuh ke sistem School Counselor Support. Dashboard memberikan ringkasan lengkap aktivitas seluruh sistem, termasuk statistik pengguna, data siswa, dan monitoring keseluruhan.'),
            subsections: [
              {
                id: 'dashboard-stats',
                title: t('userManual.admin.dashboard.title', 'Statistik Dashboard'),
                content: t('userManual.admin.dashboard.content', 'Dashboard menampilkan total pengguna aktif, jumlah konselor dan siswa, serta aktivitas terbaru. Gunakan informasi ini untuk monitoring kesehatan sistem secara keseluruhan.')
              }
            ]
          },
          {
            id: 'user-management',
            title: t('userManual.admin.userManagement.title', 'Manajemen Pengguna'),
            icon: Users,
            content: t('userManual.admin.userManagement.content', 'Kelola semua pengguna sistem termasuk admin, konselor, dan siswa. Anda dapat menambah, mengedit, menghapus, dan mengimpor pengguna secara batch.'),
            subsections: [
              {
                id: 'add-user',
                title: t('userManual.admin.addUser.title', 'Menambah Pengguna Baru'),
                content: t('userManual.admin.addUser.content', '1. Klik tombol "Add User" di halaman User Management\n2. Isi informasi lengkap (nama, email, role, username)\n3. Pastikan ID unik untuk setiap pengguna\n4. Klik "Submit" untuk menyimpan')
              },
              {
                id: 'import-users',
                title: t('userManual.admin.importUsers.title', 'Import Pengguna CSV'),
                content: t('userManual.admin.importUsers.content', '1. Download template CSV dari tombol "Download Template"\n2. Isi data pengguna sesuai format template\n3. Klik "Import Users" dan pilih file CSV\n4. Review data yang akan diimport dan konfirmasi')
              },
              {
                id: 'manage-deleted',
                title: t('userManual.admin.deletedUsers.title', 'Mengelola Pengguna Terhapus'),
                content: t('userManual.admin.deletedUsers.content', 'Sistem menggunakan soft delete. Pengguna yang dihapus dapat dilihat di halaman "User Dihapus" dan dapat dipulihkan jika diperlukan.')
              }
            ]
          },
          {
            id: 'classes-management',
            title: t('userManual.admin.classes.title', 'Manajemen Kelas'),
            icon: GraduationCap,
            content: t('userManual.admin.classes.content', 'Kelola struktur kelas, tambah/hapus kelas, dan kelola siswa dalam setiap kelas. Monitor aktivitas kelas dan distribusi siswa.'),
            subsections: [
              {
                id: 'create-class',
                title: t('userManual.admin.createClass.title', 'Membuat Kelas Baru'),
                content: t('userManual.admin.createClass.content', 'Buat kelas baru dengan informasi tingkat, nama kelas, dan konselor yang bertanggung jawab. Pastikan data lengkap untuk memudahkan manajemen.')
              },
              {
                id: 'assign-students',
                title: t('userManual.admin.assignStudents.title', 'Menugaskan Siswa ke Kelas'),
                content: t('userManual.admin.assignStudents.content', 'Tugaskan siswa ke kelas yang sesuai. Sistem akan otomatis memperbarui data konselor yang bertanggung jawab terhadap siswa tersebut.')
              }
            ]
          },
          {
            id: 'students-overview',
            title: t('userManual.admin.students.title', 'Overview Siswa'),
            icon: GraduationCap,
            content: t('userManual.admin.students.content', 'Monitor semua data siswa dalam sistem, termasuk informasi akademik, riwayat konseling, dan status kesehatan mental. Akses laporan komprehensif untuk setiap siswa.'),
            subsections: [
              {
                id: 'student-reports',
                title: t('userManual.admin.studentReports.title', 'Laporan Siswa'),
                content: t('userManual.admin.studentReports.content', 'Akses laporan lengkap termasuk riwayat sesi konseling, hasil asesmen kesehatan mental, dan progress akademik siswa.')
              }
            ]
          },
          {
            id: 'sessions-monitoring',
            title: t('userManual.admin.sessions.title', 'Monitoring Sesi Konseling'),
            icon: Calendar,
            content: t('userManual.admin.sessions.content', 'Monitor semua sesi konseling yang berlangsung dalam sistem. Lihat statistik, jadwal, dan efektivitas sesi konseling secara keseluruhan.'),
            subsections: [
              {
                id: 'session-analytics',
                title: t('userManual.admin.sessionAnalytics.title', 'Analitik Sesi'),
                content: t('userManual.admin.sessionAnalytics.content', 'Gunakan data analitik untuk memahami pola konseling, konselor paling aktif, dan tren masalah yang sering muncul.')
              }
            ]
          },
          {
            id: 'system-settings',
            title: t('userManual.admin.settings.title', 'Pengaturan Sistem'),
            icon: Settings,
            content: t('userManual.admin.settings.content', 'Konfigurasi pengaturan sistem termasuk preferensi bahasa, notifikasi, backup data, dan pengaturan keamanan sistem.'),
            subsections: [
              {
                id: 'security-settings',
                title: t('userManual.admin.security.title', 'Pengaturan Keamanan'),
                content: t('userManual.admin.security.content', 'Kelola pengaturan keamanan sistem, password policy, dan akses kontrol untuk menjaga keamanan data sensitif.')
              }
            ]
          }
        ];

      case 'counselor':
        return [
          {
            id: 'overview',
            title: t('userManual.counselor.overview.title', 'Dashboard Konselor'),
            icon: User,
            content: t('userManual.counselor.overview.content', 'Dashboard konselor memberikan ringkasan siswa yang Anda tangani, jadwal sesi mendatang, dan notifikasi penting. Gunakan dashboard untuk memantau progress siswa secara keseluruhan.'),
            subsections: [
              {
                id: 'my-students',
                title: t('userManual.counselor.myStudents.title', 'Siswa Saya'),
                content: t('userManual.counselor.myStudents.content', 'Lihat daftar siswa yang menjadi tanggung jawab Anda, status terbaru mereka, dan prioritas penanganan berdasarkan assessment terbaru.')
              }
            ]
          },
          {
            id: 'classes-management',
            title: t('userManual.counselor.classes.title', 'Manajemen Kelas'),
            icon: Users,
            content: t('userManual.counselor.classes.content', 'Kelola kelas-kelas yang Anda tangani. Lihat daftar siswa per kelas, monitor aktivitas, dan identifikasi siswa yang memerlukan perhatian khusus.'),
            subsections: [
              {
                id: 'class-overview',
                title: t('userManual.counselor.classOverview.title', 'Overview Kelas'),
                content: t('userManual.counselor.classOverview.content', 'Dapatkan gambaran umum tentang kondisi kelas, termasuk siswa dengan risiko tinggi dan yang memerlukan intervensi segera.')
              }
            ]
          },
          {
            id: 'sessions',
            title: t('userManual.counselor.sessions.title', 'Sesi Konseling'),
            icon: Calendar,
            content: t('userManual.counselor.sessions.content', 'Jadwalkan, lakukan, dan dokumentasikan sesi konseling dengan siswa. Catat progress dan hasil setiap sesi untuk tracking yang efektif.'),
            subsections: [
              {
                id: 'schedule-session',
                title: t('userManual.counselor.scheduleSession.title', 'Menjadwalkan Sesi'),
                content: t('userManual.counselor.scheduleSession.content', '1. Pilih siswa dari daftar\n2. Tentukan tanggal dan waktu\n3. Pilih jenis sesi (individual/group)\n4. Tambahkan catatan khusus jika diperlukan\n5. Simpan jadwal')
              },
              {
                id: 'session-notes',
                title: t('userManual.counselor.sessionNotes.title', 'Dokumentasi Sesi'),
                content: t('userManual.counselor.sessionNotes.content', 'Catat hasil sesi dengan detail: topik yang dibahas, progress yang dicapai, rencana tindak lanjut, dan rekomendasi untuk sesi berikutnya.')
              }
            ]
          },
          {
            id: 'mental-health',
            title: t('userManual.counselor.mentalHealth.title', 'Kesehatan Mental'),
            icon: Brain,
            content: t('userManual.counselor.mentalHealth.content', 'Monitor kesehatan mental siswa melalui berbagai assessment seperti PHQ-9, GAD-7, dan DASS-21. Analisis hasil untuk menentukan intervensi yang tepat.'),
            subsections: [
              {
                id: 'assessments',
                title: t('userManual.counselor.assessments.title', 'Asesmen Psikologi'),
                content: t('userManual.counselor.assessments.content', 'Gunakan tools asesmen yang tersedia untuk evaluasi komprehensif kondisi mental siswa. Hasil otomatis tersimpan dan dapat dianalisis untuk tren.')
              },
              {
                id: 'intervention',
                title: t('userManual.counselor.intervention.title', 'Rencana Intervensi'),
                content: t('userManual.counselor.intervention.content', 'Berdasarkan hasil asesmen, buat rencana intervensi yang sesuai. Tentukan frekuensi sesi, teknik yang digunakan, dan target outcome.')
              }
            ]
          },
          {
            id: 'behavior-tracking',
            title: t('userManual.counselor.behavior.title', 'Tracking Perilaku'),
            icon: BarChart3,
            content: t('userManual.counselor.behavior.content', 'Catat dan monitor perubahan perilaku siswa. Identifikasi pola, trigger, dan progress dalam pengelolaan perilaku.'),
            subsections: [
              {
                id: 'behavior-logs',
                title: t('userManual.counselor.behaviorLogs.title', 'Log Perilaku'),
                content: t('userManual.counselor.behaviorLogs.content', 'Dokumentasikan insiden perilaku dengan detail konteks, respon yang diberikan, dan hasil observasi untuk analisis lebih lanjut.')
              }
            ]
          },
          {
            id: 'career-guidance',
            title: t('userManual.counselor.career.title', 'Bimbingan Karir'),
            icon: Briefcase,
            content: t('userManual.counselor.career.content', 'Berikan bimbingan karir kepada siswa melalui asesmen minat, eksplorasi jalur karir, dan pengembangan rencana karir jangka panjang.'),
            subsections: [
              {
                id: 'career-assessment',
                title: t('userManual.counselor.careerAssessment.title', 'Asesmen Minat Karir'),
                content: t('userManual.counselor.careerAssessment.content', 'Lakukan asesmen untuk mengidentifikasi minat, bakat, dan potensi karir siswa. Gunakan hasil untuk memberikan rekomendasi yang tepat.')
              }
            ]
          }
        ];

      case 'student':
      default:
        return [
          {
            id: 'overview',
            title: t('userManual.student.overview.title', 'Dashboard Siswa'),
            icon: GraduationCap,
            content: t('userManual.student.overview.content', 'Dashboard Anda menampilkan ringkasan aktivitas konseling, jadwal sesi mendatang, dan progress personal Anda. Gunakan sebagai pusat informasi untuk tracking perkembangan diri.'),
            subsections: [
              {
                id: 'personal-progress',
                title: t('userManual.student.progress.title', 'Progress Personal'),
                content: t('userManual.student.progress.content', 'Monitor perkembangan Anda melalui grafik dan statistik yang menampilkan improvement dalam berbagai aspek kesehatan mental dan akademik.')
              }
            ]
          },
          {
            id: 'sessions',
            title: t('userManual.student.sessions.title', 'Sesi Konseling'),
            icon: Calendar,
            content: t('userManual.student.sessions.content', 'Lihat jadwal sesi konseling Anda, riwayat sesi sebelumnya, dan catat refleksi pribadi setelah setiap sesi konseling.'),
            subsections: [
              {
                id: 'upcoming-sessions',
                title: t('userManual.student.upcomingSessions.title', 'Sesi Mendatang'),
                content: t('userManual.student.upcomingSessions.content', 'Cek jadwal sesi konseling mendatang, siapkan topik yang ingin dibahas, dan pastikan Anda siap untuk sesi tersebut.')
              },
              {
                id: 'session-history',
                title: t('userManual.student.sessionHistory.title', 'Riwayat Sesi'),
                content: t('userManual.student.sessionHistory.content', 'Tinjau kembali catatan sesi sebelumnya, progress yang telah dicapai, dan rencana tindak lanjut yang telah disepakati.')
              }
            ]
          },
          {
            id: 'mental-health',
            title: t('userManual.student.mentalHealth.title', 'Kesehatan Mental'),
            icon: Brain,
            content: t('userManual.student.mentalHealth.content', 'Lakukan self-assessment kesehatan mental secara berkala menggunakan tools yang tersedia. Hasil akan membantu konselor memberikan support yang tepat.'),
            subsections: [
              {
                id: 'self-assessment',
                title: t('userManual.student.selfAssessment.title', 'Self Assessment'),
                content: t('userManual.student.selfAssessment.content', 'Lakukan tes PHQ-9 untuk depresi, GAD-7 untuk kecemasan, dan DASS-21 untuk evaluasi komprehensif. Jawab dengan jujur untuk hasil terbaik.')
              },
              {
                id: 'results-tracking',
                title: t('userManual.student.resultsTracking.title', 'Tracking Hasil'),
                content: t('userManual.student.resultsTracking.content', 'Pantau perubahan skor assessment dari waktu ke waktu untuk melihat progress dan area yang perlu improvement.')
              }
            ]
          },
          {
            id: 'career-planning',
            title: t('userManual.student.career.title', 'Perencanaan Karir'),
            icon: Briefcase,
            content: t('userManual.student.career.content', 'Eksplorasi minat karir, ikuti kursus pengembangan, dan buat rencana karir jangka panjang dengan bantuan konselor.'),
            subsections: [
              {
                id: 'career-exploration',
                title: t('userManual.student.careerExploration.title', 'Eksplorasi Karir'),
                content: t('userManual.student.careerExploration.content', 'Gunakan tools asesmen minat untuk mengidentifikasi bidang karir yang sesuai dengan kepribadian dan minat Anda.')
              },
              {
                id: 'skill-development',
                title: t('userManual.student.skillDevelopment.title', 'Pengembangan Skill'),
                content: t('userManual.student.skillDevelopment.content', 'Ikuti kursus dan program pengembangan yang tersedia untuk mempersiapkan diri memasuki dunia kerja atau pendidikan lanjutan.')
              }
            ]
          },
          {
            id: 'behavior-self-monitoring',
            title: t('userManual.student.behavior.title', 'Self-Monitoring Perilaku'),
            icon: BarChart3,
            content: t('userManual.student.behavior.content', 'Catat dan refleksikan perilaku harian Anda. Identifikasi pola positif dan area yang perlu diperbaiki untuk pengembangan diri.'),
            subsections: [
              {
                id: 'daily-reflection',
                title: t('userManual.student.dailyReflection.title', 'Refleksi Harian'),
                content: t('userManual.student.dailyReflection.content', 'Luangkan waktu setiap hari untuk merefleksikan emosi, perilaku, dan pencapaian. Catat dalam jurnal untuk tracking progress.')
              }
            ]
          },
          {
            id: 'reports',
            title: t('userManual.student.reports.title', 'Laporan Personal'),
            icon: FileText,
            content: t('userManual.student.reports.content', 'Akses laporan progress personal Anda, termasuk summary sesi konseling, hasil assessment, dan pencapaian dalam program pengembangan.'),
            subsections: [
              {
                id: 'progress-reports',
                title: t('userManual.student.progressReports.title', 'Laporan Progress'),
                content: t('userManual.student.progressReports.content', 'Dapatkan laporan berkala tentang perkembangan Anda dalam berbagai aspek, termasuk kesehatan mental dan pengembangan karir.')
              }
            ]
          }
        ];
    }
  };

  const sections = getManualSections();
  const currentSection = sections.find(section => section.id === activeSection);

  // Filter sections based on search term
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (section.subsections && section.subsections.some(sub =>
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'admin':
        return t('userManual.admin.title', 'Panduan Administrator');
      case 'counselor':
        return t('userManual.counselor.title', 'Panduan Konselor');
      case 'student':
      default:
        return t('userManual.student.title', 'Panduan Siswa');
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'admin':
        return t('userManual.admin.description', 'Panduan lengkap untuk administrator dalam mengelola sistem School Counselor Support');
      case 'counselor':
        return t('userManual.counselor.description', 'Panduan komprehensif untuk konselor dalam memberikan dukungan kepada siswa');
      case 'student':
      default:
        return t('userManual.student.description', 'Panduan untuk siswa dalam menggunakan sistem konseling dan pengembangan diri');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-brand-600 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">{getRoleTitle()}</h1>
              <p className="text-sm text-gray-600">{getRoleDescription()}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('userManual.search', 'Cari dalam panduan...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center ${
                    activeSection === section.id
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{section.title}</span>
                  <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>{t('userManual.needHelp', 'Butuh bantuan?')}</span>
            </div>
            <button className="text-brand-600 hover:text-brand-700 text-sm font-medium">
              {t('userManual.contact', 'Kontak Support')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentSection ? (
          <div className="max-w-4xl mx-auto p-8">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <currentSection.icon className="h-8 w-8 text-brand-600 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{currentSection.title}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800">
                      {user?.role === 'admin' ? 'Administrator' : user?.role === 'counselor' ? 'Konselor' : 'Siswa'}
                    </span>
                    <button className="inline-flex items-center text-sm text-gray-600 hover:text-brand-600">
                      <Download className="h-4 w-4 mr-1" />
                      {t('userManual.downloadPDF', 'Download PDF')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Section Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{currentSection.content}</p>
              </div>
            </div>

            {/* Subsections */}
            {currentSection.subsections && currentSection.subsections.length > 0 && (
              <div className="space-y-8">
                {currentSection.subsections.map((subsection) => (
                  <div key={subsection.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{subsection.title}</h2>
                    <div className="prose max-w-none">
                      <div className="text-gray-700 whitespace-pre-line">{subsection.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Resources */}
            <div className="mt-12 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl p-6 border border-brand-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Video className="h-5 w-5 mr-2 text-brand-600" />
                {t('userManual.additionalResources', 'Sumber Daya Tambahan')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <Video className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{t('userManual.videoTutorials', 'Tutorial Video')}</div>
                    <div className="text-sm text-gray-600">{t('userManual.videoDescription', 'Panduan video langkah demi langkah')}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <MessageCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{t('userManual.liveChat', 'Live Chat Support')}</div>
                    <div className="text-sm text-gray-600">{t('userManual.chatDescription', 'Bantuan real-time dari tim support')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('userManual.selectSection', 'Pilih Bagian')}
              </h2>
              <p className="text-gray-600">
                {t('userManual.selectSectionDescription', 'Pilih bagian dari sidebar untuk melihat panduan lengkap')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManualPage;
