import { createContext, useContext, useState, ReactNode } from 'react';

// Define translations object type
type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

// Sample translations with RIASEC assessment translations
const translations: Translations = {
  id: {
    // Navigation
    'nav.profile': 'Profil',
    'nav.students': 'Siswa',
    'nav.sessions': 'Sesi Konseling',
    'nav.mentalHealth': 'Kesehatan Mental',
    'nav.behavior': 'Pelacakan Perilaku',
    'nav.career': 'Bimbingan Karir',
    'nav.settings': 'Pengaturan',
    'nav.logout': 'Keluar',

    // Students Page
    'students.title': 'Siswa',
    'students.subtitle': 'Kelola dan pantau profil siswa, kemajuan akademik, dan riwayat konseling',
    'students.search': 'Cari siswa...',
    'students.filter': 'Filter',
    'students.add': 'Tambah Siswa',
    'students.class': 'Kelas',
    'students.grade': 'Tingkat',
    'students.tingkat': 'Tingkat',
    'students.kelas': 'Kelas',
    'students.noStudents': 'Tidak ada siswa ditemukan. Tambahkan siswa pertama untuk memulai!',
    'students.noResults': 'Tidak ada siswa yang cocok dengan kriteria pencarian Anda.',
    'students.delete': 'Hapus',
    'students.edit': 'Edit',
    
    // Student Status
    'status.good': 'Baik',
    'status.warning': 'Perhatian',
    'status.critical': 'Kritis',
    
    // Add Student Form
    'addStudent.title': 'Tambah Siswa Baru',
    'addStudent.fullName': 'Nama Lengkap',
    'addStudent.email': 'Alamat Email',
    'addStudent.grade': 'Tingkat',
    'addStudent.class': 'Kelas',
    'addStudent.selectGrade': 'Pilih Tingkat',
    'addStudent.selectClass': 'Pilih Kelas',
    'addStudent.selectTingkat': 'Pilih Tingkat',
    'addStudent.selectKelas': 'Pilih Kelas',
    'addStudent.academicStatus': 'Status Akademik',
    'addStudent.photoUrl': 'URL Foto',
    'addStudent.photoHelp': 'Biarkan kosong untuk menggunakan avatar default',
    'addStudent.cancel': 'Batal',
    'addStudent.submit': 'Tambah Siswa',
    
    // Student Detail
    'studentDetail.title': 'Profil Siswa',
    'studentDetail.academicStatus': 'Status Akademik',
    'studentDetail.email': 'Email',
    'studentDetail.tingkat': 'Tingkat',
    'studentDetail.kelas': 'Kelas',
    'studentDetail.program': 'Program',
    'studentDetail.mentalHealth': 'Skor Kesehatan Mental',
    'studentDetail.lastCounseling': 'Konseling Terakhir',
    'studentDetail.scheduleSession': 'Jadwalkan Sesi',
    'studentDetail.viewHistory': 'Lihat Riwayat',
    'studentDetail.notAssessed': 'Belum dinilai',
    'studentDetail.never': 'Belum pernah',
    'studentDetail.totalSessions': 'Total Sesi',

    // Sessions Page
    'sessions.title': 'Sesi Konseling',
    'sessions.subtitle': 'Kelola jadwal dan riwayat sesi konseling',
    'sessions.search': 'Cari sesi...',
    'sessions.filter': 'Filter',
    'sessions.schedule': 'Jadwalkan Sesi',
    'sessions.followUp': 'Tindak Lanjut',
    'sessions.viewDetails': 'Lihat Detail',
    'sessions.reschedule': 'Jadwalkan Ulang',
    'sessions.type.academic': 'Akademik',
    'sessions.type.behavioral': 'Perilaku',
    'sessions.type.mental-health': 'Kesehatan Mental',
    'sessions.type.career': 'Karir',

    // Mental Health Page
    'mentalHealth.title': 'Penilaian Kesehatan Mental',
    'mentalHealth.subtitle': 'Pantau dan kelola penilaian kesehatan mental siswa',
    'mentalHealth.search': 'Cari penilaian...',
    'mentalHealth.filter': 'Filter',
    'mentalHealth.newAssessment': 'Penilaian Baru',
    'mentalHealth.riskLevels': 'Tingkat Risiko',
    'mentalHealth.quickStats': 'Statistik Cepat',
    'mentalHealth.totalAssessments': 'Total Penilaian',
    'mentalHealth.highRiskCases': 'Kasus Risiko Tinggi',
    'mentalHealth.score': 'Skor',
    'mentalHealth.threshold': 'Ambang Batas',
    'mentalHealth.viewDetails': 'Lihat Detail',
    'mentalHealth.scheduleFollowUp': 'Jadwalkan Tindak Lanjut',
    'mentalHealth.risk.low': 'Rendah',
    'mentalHealth.risk.moderate': 'Sedang',
    'mentalHealth.risk.high': 'Tinggi',
    'mentalHealth.filterAssessments': 'Filter Penilaian',
    'mentalHealth.allTypes': 'Semua Tipe',
    'mentalHealth.allRisks': 'Semua Tingkat Risiko',
    'mentalHealth.resetFilters': 'Reset Filter',
    'mentalHealth.apply': 'Terapkan',
    'mentalHealth.assessmentDetails': 'Detail Penilaian',
    'mentalHealth.date': 'Tanggal',
    'mentalHealth.followUpDate': 'Tanggal Tindak Lanjut',
    'mentalHealth.followUpNotesPlaceholder': 'Masukkan catatan untuk tindak lanjut...',
    'mentalHealth.followUpScheduled': 'Tindak lanjut berhasil dijadwalkan',
    'mentalHealth.schedule': 'Jadwalkan',
    'mentalHealth.noAssessments': 'Belum ada penilaian kesehatan mental',
    'mentalHealth.notes': 'Catatan',
    'mentalHealth.assessmentType': 'Tipe Penilaian',
    
    // Mental Health Assessment Types
    'assessmentTypes.dass21': 'Skala Depresi Kecemasan Stres (DASS-21)',
    'assessmentTypes.phq9': 'Kuesioner Kesehatan Pasien (PHQ-9)',
    
    // Risk Level Clinical Terminology
    'riskLevels.low': 'Risiko Rendah',
    'riskLevels.moderate': 'Risiko Sedang',
    'riskLevels.high': 'Risiko Tinggi',

    // Behavior Page
    'behavior.title': 'Pelacakan Perilaku',
    'behavior.subtitle': 'Pantau dan catat perilaku siswa untuk identifikasi pola dan intervensi dini',
    'behavior.search': 'Cari catatan perilaku...',
    'behavior.filter': 'Filter',
    'behavior.newRecord': 'Tambah Catatan',
    'behavior.overview': 'Ringkasan Perilaku',
    'behavior.recentRecords': 'Catatan Terbaru',
    'behavior.viewDetails': 'Lihat Detail',
    'behavior.scheduleIntervention': 'Jadwalkan Intervensi',
    'behavior.category.attendance': 'Kehadiran',
    'behavior.category.discipline': 'Kedisiplinan',
    'behavior.category.participation': 'Partisipasi',
    'behavior.category.social': 'Sosial',
    'behavior.severity.positive': 'Positif',
    'behavior.severity.neutral': 'Netral',
    'behavior.severity.minor': 'Ringan',
    'behavior.severity.major': 'Serius',
    'behavior.stats.total': 'Total Catatan',
    'behavior.stats.thisMonth': 'Bulan Ini',
    'behavior.stats.needsAttention': 'Perlu Perhatian',

    // Career Page
    'career.title': 'Bimbingan Karir',
    'career.subtitle': 'Bantu siswa merencanakan masa depan mereka melalui penilaian dan sumber daya karir',
    'career.search': 'Cari penilaian atau sumber daya...',
    'career.filter': 'Filter',
    'career.newAssessment': 'Penilaian Baru',
    'career.assessments': 'Penilaian Karir',
    'career.resources': 'Sumber Daya',
    'career.viewDetails': 'Lihat Detail',
    'career.scheduleDiscussion': 'Jadwalkan Diskusi',
    'career.type.article': 'Artikel',
    'career.type.video': 'Video',
    'career.type.assessment': 'Penilaian',
    'career.type.program': 'Program',
    'career.interests': 'Minat',
    'career.skills': 'Keterampilan',
    'career.values': 'Nilai',
    'career.recommendedPaths': 'Jalur yang Direkomendasikan',
    'career.stats.totalAssessments': 'Total Penilaian',
    'career.stats.resourcesShared': 'Sumber Daya Dibagikan',
    'career.stats.pendingDiscussions': 'Diskusi Tertunda',
    'career.backToAssessments': 'Kembali ke Penilaian Karir',

    // Settings Page
    'settings.subtitle': 'Kelola pengaturan aplikasi dan preferensi pengguna',
    'settings.profile': 'Profil',
    'settings.fullName': 'Nama Lengkap',
    'settings.email': 'Email',
    'settings.notifications': 'Notifikasi',
    'settings.emailNotifications': 'Notifikasi Email',
    'settings.emailNotificationsDesc': 'Terima pembaruan tentang sesi dan perubahan status siswa melalui email',
    'settings.desktopNotifications': 'Notifikasi Desktop',
    'settings.desktopNotificationsDesc': 'Tampilkan notifikasi desktop untuk pengingat dan pembaruan penting',
    'settings.security': 'Keamanan',
    'settings.changePassword': 'Ubah Kata Sandi',
    'settings.appearance': 'Tampilan',
    'settings.darkMode': 'Mode Gelap',
    'settings.darkModeDesc': 'Beralih ke tampilan gelap untuk mengurangi kelelahan mata',

    // Errors
    'errors.loadingStudents': 'Gagal memuat data siswa',
    'errors.loadingStudent': 'Gagal memuat detail siswa',
    'errors.loadingClasses': 'Gagal memuat data kelas',
    'errors.studentNotFound': 'Siswa tidak ditemukan',
    'errors.failedToCreateAssessment': 'Gagal membuat penilaian baru. Silakan coba lagi.',
    
    // Actions
    'actions.backToStudents': 'Kembali ke Daftar Siswa',
    'actions.generateReport': 'Unduh Laporan',
    'actions.generating': 'Sedang Menghasilkan...',
    'actions.retry': 'Coba Lagi',
    
    // Common UI elements
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.close': 'Tutup',

    // Login Page
    'login.platformDescription': 'Platform komprehensif untuk konselor, siswa, dan administrator untuk mengelola dukungan kesehatan mental.',
    'login.students': 'Siswa',
    'login.studentDescription': 'Kelola sesi konseling Anda',
    'login.counselors': 'Konselor',
    'login.counselorDescription': 'Pantau dan dukung siswa Anda',
    'login.admins': 'Admin',
    'login.adminDescription': 'Awasi seluruh sistem',
    'login.allRightsReserved': 'Semua hak dilindungi.',
    'login.welcomeBack': 'Selamat Datang Kembali',
    'login.signInPrompt': 'Silakan masuk ke akun Anda',
    'login.demoCredentials': 'Kredensial Demo',
    'login.adminUser': 'Admin',
    'login.counselorUser': 'Konselor',
    'login.studentUser': 'Siswa',
    'login.loginFailed': 'Gagal masuk',
    'login.username': 'Nama Pengguna',
    'login.enterUsername': 'Masukkan nama pengguna Anda',
    'login.password': 'Kata Sandi',
    'login.enterPassword': 'Masukkan kata sandi Anda',
    'login.rememberMe': 'Ingat saya',
    'login.forgotPassword': 'Lupa kata sandi?',
    'login.signingIn': 'Sedang masuk...',
    'login.signIn': 'Masuk',
    'login.resetPassword': 'Reset Kata Sandi',
    'login.resetInstructions': 'Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mereset kata sandi Anda.',
    'login.email': 'Email',
    'login.enterEmail': 'Masukkan alamat email Anda',
    'login.sendResetLink': 'Kirim Tautan Reset',
    'login.sending': 'Mengirim...',
    'login.resetEmailSent': 'Email telah dikirim! Periksa kotak masuk Anda untuk tautan reset kata sandi.',

    // Layout related translations
    'greeting.morning': 'Selamat Pagi',
    'greeting.afternoon': 'Selamat Siang',
    'greeting.evening': 'Selamat Malam',
    'roles.admin': 'Administrator',
    'roles.counselor': 'Konselor',
    'roles.student': 'Siswa',
    'common.search': 'Cari...',
    'common.dashboard': 'Dasbor',
    'common.profile': 'Profil',
    'common.reports': 'Laporan',
    'common.today': 'Hari Ini',
    
    // CSV Import/Export translations
    'settings.title': 'Pengaturan',
    'settings.tabs.general': 'Umum',
    'settings.tabs.userManagement': 'Manajemen Pengguna',
    'settings.importUsers': 'Impor Pengguna (CSV)',
    'settings.exportUsers': 'Ekspor Pengguna (CSV)',
    'settings.addUser': 'Tambah Pengguna',
    'settings.editUser': 'Edit Pengguna',
    'settings.deleteUser': 'Hapus Pengguna',
    'settings.confirmDelete': 'Konfirmasi Hapus',
    'settings.deleteConfirmation': 'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.',
    'settings.name': 'Nama',
    'settings.username': 'Nama Pengguna',
    'settings.role': 'Peran',
    'settings.actions': 'Tindakan',
    'settings.cancel': 'Batal',
    'settings.confirmImport': 'Konfirmasi Impor',
    'settings.importPreview': 'Pratinjau Impor',
    'settings.importCSVDescription': 'Tinjau pengguna yang akan diimpor dari file CSV Anda. Klik "Impor" untuk menambahkan pengguna ini ke sistem.',
    'settings.searchUsers': 'Cari pengguna...',
    'settings.language': 'Bahasa',

    // Profile Page
    'profile.title': 'Profil Pengguna',
    'profile.subtitle': 'Kelola informasi pribadi dan pengaturan akun Anda',
    'profile.personalInfo': 'Informasi Pribadi',
    'profile.contactInfo': 'Informasi Kontak',
    'profile.accountSettings': 'Pengaturan Akun',
    'profile.name': 'Nama',
    'profile.email': 'Email',
    'profile.phone': 'Telepon',
    'profile.address': 'Alamat',
    'profile.role': 'Peran',
    'profile.bio': 'Biografi',
    'profile.joinedDate': 'Tanggal Bergabung',
    'profile.lastLogin': 'Login Terakhir',
    'profile.updateProfile': 'Perbarui Profil',
    'profile.passwordSection': 'Kata Sandi',
    'profile.currentPassword': 'Kata Sandi Saat Ini',
    'profile.newPassword': 'Kata Sandi Baru',
    'profile.confirmPassword': 'Konfirmasi Kata Sandi',
    'profile.changePassword': 'Ubah Kata Sandi',
    'profile.photoSection': 'Foto Profil',
    'profile.uploadPhoto': 'Unggah Foto',
    'profile.removePhoto': 'Hapus Foto',
    'profile.photoRequirements': 'Ukuran maksimum 5MB. Format: JPG, PNG',
    'profile.saveChanges': 'Simpan Perubahan',
    'profile.cancelChanges': 'Batal',
    'profile.passwordChanged': 'Kata sandi berhasil diubah',
    'profile.profileUpdated': 'Profil berhasil diperbarui',

    // Additional profile translations
    'profile.overview': 'Ringkasan',
    'profile.activity': 'Aktivitas',
    'profile.reports': 'Laporan',
    'profile.roleSpecificDetails': 'Detail Khusus Peran',
    'profile.adminCapabilities': 'Kemampuan Admin',
    'profile.systemAccess': 'Akses Sistem',
    'profile.systemAccessDescription': 'Kelola akses sistem dan izin pengguna',
    'profile.customizeYourProfile': 'Sesuaikan Profil Anda',
    'profile.visualIdentity': 'Identitas Visual',
    'profile.photoDescription': 'Foto profil membantu pengguna lain mengenali Anda',
    'profile.edit': 'Edit',
    'profile.totalUsers': 'Total Pengguna',
    'profile.counselors': 'Konselor',
    'profile.students': 'Siswa',
    'profile.recentActivity': 'Aktivitas Terbaru',

    // Additional student profile related translations
    'profile.studentDetails': 'Detail Siswa',
    'profile.grade': 'Tingkat',
    'profile.class': 'Kelas',
    'profile.academicStatus': 'Status Akademik',
    'student.status.good': 'Baik',
    'profile.lastCounseling': 'Konseling Terakhir',
    'profile.upcomingSessions': 'Sesi Mendatang',
    'sessionTypes.academic': 'Akademik',
    'sessionTypes.career': 'Karir',
    
    // Additional profile details translations
    'profile.adminDetails': 'Detail Administrator',
    'profile.aboutYou': 'Tentang Anda',
    'profile.academicInfo': 'Informasi Akademik',
    'profile.careerPreferences': 'Preferensi Karir',
    'profile.interests': 'Minat',
    'profile.interestsPlaceholder': 'Masukkan minat Anda disini...',
    'profile.careerGoals': 'Tujuan Karir',
    'profile.careerGoalsPlaceholder': 'Masukkan tujuan karir Anda disini...',
    'profile.assignedStudents': 'Siswa yang Ditugaskan',
    'profile.completedSessions': 'Sesi yang Diselesaikan',
    'profile.counselorDetails': 'Detail Konselor',
    'profile.specialization': 'Spesialisasi',
    'profile.certification': 'Sertifikasi',
    'profile.experience': 'Pengalaman',
    'profile.availability': 'Ketersediaan',
    'profile.expertise': 'Keahlian',
    'profile.specializationPlaceholder': 'Masukkan bidang spesialisasi Anda...',
    'profile.certificationPlaceholder': 'Masukkan sertifikasi yang Anda miliki...',
    'profile.schedule': 'Jadwal',
    'profile.viewAllActivity': 'Lihat Semua Aktivitas',

        // Date and time translations
        'date.today': 'Hari Ini',
        'date.yesterday': 'Kemarin',
        'date.tomorrow': 'Besok',
        'date.days.monday': 'Senin',
        'date.days.tuesday': 'Selasa',
        'date.days.wednesday': 'Rabu',
        'date.days.thursday': 'Kamis',
        'date.days.friday': 'Jumat',
        'date.days.saturday': 'Sabtu',
        'date.days.sunday': 'Minggu',
        'date.months.january': 'Januari',
        'date.months.february': 'Februari',
        'date.months.march': 'Maret',
        'date.months.april': 'April',
        'date.months.may': 'Mei',
        'date.months.june': 'Juni',
        'date.months.july': 'Juli',
        'date.months.august': 'Agustus',
        'date.months.september': 'September',
        'date.months.october': 'Oktober',
        'date.months.november': 'November',
        'date.months.december': 'Desember',
        'date.format.short': 'd MMM yyyy',
        'date.format.long': 'd MMMM yyyy',
        'date.format.withTime': 'd MMM yyyy, HH:mm',
        'date.format.dayDate': 'EEEE, d MMMM yyyy',

    // RIASEC results
    'riasec.results.downloading': 'Mengunduh...',
    'riasec.results.nativeShare': 'Bagikan...',
    'riasec.results.copyToClipboard': 'Salin ke clipboard',
    'riasec.results.copied': 'Berhasil disalin!',
    'riasec.results.code': 'Kode RIASEC',
    'riasec.results.score': 'Skor',
    'riasec.results.education': 'Pendidikan',
    'riasec.results.generatedOn': 'Dibuat pada',

    // Common
  'common.back': 'Kembali',
  
  // Errors
  'errors.mlAnalysisFailed': 'Analisis machine learning gagal',
  
  // ML and analysis related
  'mentalHealth.mlDisclaimer.title': 'Analisis AI',
  'mentalHealth.mlDisclaimer.content': 'Sistem ini menggunakan pembelajaran mesin untuk menganalisis data penilaian. Hasil harus ditinjau oleh profesional.',
  'mentalHealth.mlInsights': 'Wawasan ML',
  'mentalHealth.conditionProbability': 'Probabilitas Kondisi',
  'mentalHealth.probability': 'probabilitas',
  'mentalHealth.severityLevel': 'Tingkat Keparahan',
  'mentalHealth.confidenceScore': 'Skor Kepercayaan',
  'mentalHealth.severity.mild': 'Ringan',
  'mentalHealth.severity.moderate': 'Sedang',
  'mentalHealth.severity.severe': 'Parah',
  
  'mentalHealth.riskFactors': 'Faktor Risiko',
  'mentalHealth.recommendedActions': 'Tindakan yang Direkomendasikan',
  'mentalHealth.disclaimerText': 'Rekomendasi ini dihasilkan oleh sistem AI dan harus ditinjau oleh profesional kesehatan mental yang berkualifikasi.',

  'mentalHealth.trendsAndStats': 'Tren & Statistik',
  'mentalHealth.scoreOverTime': 'Skor Seiring Waktu',
  'mentalHealth.noHistoricalData': 'Belum ada data historis tersedia',
  'mentalHealth.takeFirstAssessment': 'Lakukan penilaian pertama Anda',
  
  
  'mentalHealth.questionnaire': 'Kuesioner',
  'mentalHealth.completed': 'selesai',
  'mentalHealth.questionnaireInstructions': 'Silakan jawab pertanyaan berikut berdasarkan pengalaman Anda selama dua minggu terakhir.',
  'mentalHealth.questionnaireInstructions2': 'Untuk setiap pernyataan, pilih opsi yang paling menggambarkan pengalaman Anda.',
  'mentalHealth.selectAssessmentType': 'Pilih jenis penilaian',
  'mentalHealth.continueToQuestions': 'Lanjutkan ke pertanyaan',
  'mentalHealth.analyzingResponses': 'Menganalisis respons...',
  'mentalHealth.submitForAnalysis': 'Kirim untuk analisis',
  
  'mentalHealth.demographicInfo': 'Informasi Demografis',
  'mentalHealth.demographicDisclaimer': 'Informasi ini membantu meningkatkan akurasi analisis kami tetapi bersifat opsional.',
  'mentalHealth.age': 'Usia',
  'mentalHealth.gender': 'Jenis Kelamin',
  'mentalHealth.selectOption': 'Pilih opsi',
  'mentalHealth.previousDiagnosis': 'Diagnosis kesehatan mental sebelumnya',
  'mentalHealth.familyHistory': 'Riwayat keluarga dengan kondisi kesehatan mental',
  'mentalHealth.recentLifeEvents': 'Mengalami kejadian hidup yang signifikan baru-baru ini',
  
  'mentalHealth.responseOptions.notAtAll': 'Tidak sama sekali',
  'mentalHealth.responseOptions.severalDays': 'Beberapa hari',
  'mentalHealth.responseOptions.moreThanHalf': 'Lebih dari setengah hari',
  'mentalHealth.responseOptions.nearlyEveryDay': 'Hampir setiap hari',
  
  'mentalHealth.genderOptions.male': 'Laki-laki',
  'mentalHealth.genderOptions.female': 'Perempuan',
  'mentalHealth.genderOptions.nonBinary': 'Non-biner',
  'mentalHealth.genderOptions.preferNotToSay': 'Memilih untuk tidak menjawab',
  
  // Assessment Types
  'assessmentTypes.gad7': 'Kuesioner Gangguan Kecemasan',
  'assessmentTypes.pss': 'Skala Stres yang Dirasakan',
  'assessmentTypes.pcl5': 'Daftar Periksa PTSD',
  'assessmentTypes.wsas': 'Skala Penyesuaian Kerja & Sosial',
  },
  en: {
    // Navigation
    'nav.profile': 'Profile',
    'nav.students': 'Students',
    'nav.sessions': 'Counseling Sessions',
    'nav.mentalHealth': 'Mental Health',
    'nav.behavior': 'Behavior Tracking',
    'nav.career': 'Career Guidance',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Students Page
    'students.title': 'Students',
    'students.subtitle': 'Manage and monitor student profiles, academic progress, and counseling history',
    'students.search': 'Search students...',
    'students.filter': 'Filter',
    'students.add': 'Add Student',
    'students.class': 'Class',
    'students.grade': 'Grade',
    'students.tingkat': 'Grade',
    'students.kelas': 'Class',
    'students.noStudents': 'No students found. Add your first student to get started!',
    'students.noResults': 'No students match your search criteria.',
    'students.delete': 'Delete',
    'students.edit': 'Edit',
    
    // Student Status
    'status.good': 'Good',
    'status.warning': 'Warning',
    'status.critical': 'Critical',
    
    // Add Student Form
    'addStudent.title': 'Add New Student',
    'addStudent.fullName': 'Full Name',
    'addStudent.email': 'Email Address',
    'addStudent.grade': 'Grade',
    'addStudent.class': 'Class',
    'addStudent.selectGrade': 'Select Grade',
    'addStudent.selectClass': 'Select Class',
    'addStudent.selectTingkat': 'Select Grade',
    'addStudent.selectKelas': 'Select Class',
    'addStudent.academicStatus': 'Academic Status',
    'addStudent.photoUrl': 'Photo URL',
    'addStudent.photoHelp': 'Leave empty to use default avatar',
    'addStudent.cancel': 'Cancel',
    'addStudent.submit': 'Add Student',
    
    // Student Detail
    'studentDetail.title': 'Student Profile',
    'studentDetail.academicStatus': 'Academic Status',
    'studentDetail.email': 'Email',
    'studentDetail.tingkat': 'Grade',
    'studentDetail.kelas': 'Class',
    'studentDetail.program': 'Program',
    'studentDetail.mentalHealth': 'Mental Health Score',
    'studentDetail.lastCounseling': 'Last Counseling',
    'studentDetail.scheduleSession': 'Schedule Session',
    'studentDetail.viewHistory': 'View History',
    'studentDetail.notAssessed': 'Not assessed',
    'studentDetail.never': 'Never',
    'studentDetail.totalSessions': 'Total Sessions',

    // Sessions Page
    'sessions.title': 'Counseling Sessions',
    'sessions.subtitle': 'Manage counseling session schedules and history',
    'sessions.search': 'Search sessions...',
    'sessions.filter': 'Filter',
    'sessions.schedule': 'Schedule Session',
    'sessions.followUp': 'Follow-up',
    'sessions.viewDetails': 'View Details',
    'sessions.reschedule': 'Reschedule',
    'sessions.type.academic': 'Academic',
    'sessions.type.behavioral': 'Behavioral',
    'sessions.type.mental-health': 'Mental Health',
    'sessions.type.career': 'Career',

    // Mental Health Page
    'mentalHealth.title': 'Mental Health Assessments',
    'mentalHealth.subtitle': 'Monitor and manage student mental health assessments',
    'mentalHealth.search': 'Search assessments...',
    'mentalHealth.filter': 'Filter',
    'mentalHealth.newAssessment': 'New Assessment',
    'mentalHealth.riskLevels': 'Risk Levels',
    'mentalHealth.quickStats': 'Quick Stats',
    'mentalHealth.totalAssessments': 'Total Assessments',
    'mentalHealth.highRiskCases': 'High Risk Cases',
    'mentalHealth.score': 'Score',
    'mentalHealth.threshold': 'Threshold',
    'mentalHealth.viewDetails': 'View Details',
    'mentalHealth.scheduleFollowUp': 'Schedule Follow-up',
    'mentalHealth.risk.low': 'Low',
    'mentalHealth.risk.moderate': 'Moderate',
    'mentalHealth.risk.high': 'High',
    'mentalHealth.filterAssessments': 'Filter Assessments',
    'mentalHealth.allTypes': 'All Types',
    'mentalHealth.allRisks': 'All Risk Levels',
    'mentalHealth.resetFilters': 'Reset Filters',
    'mentalHealth.apply': 'Apply',
    'mentalHealth.assessmentDetails': 'Assessment Details',
    'mentalHealth.date': 'Date',
    'mentalHealth.followUpDate': 'Follow-up Date',
    'mentalHealth.followUpNotesPlaceholder': 'Enter notes for follow-up...',
    'mentalHealth.followUpScheduled': 'Follow-up successfully scheduled',
    'mentalHealth.schedule': 'Schedule',
    'mentalHealth.noAssessments': 'No mental health assessments yet',
    'mentalHealth.notes': 'Notes',
    'mentalHealth.assessmentType': 'Assessment Type',
    
    // Mental Health Assessment Types
    'assessmentTypes.dass21': 'Depression Anxiety Stress Scale (DASS-21)',
    'assessmentTypes.phq9': 'Patient Health Questionnaire (PHQ-9)',
    
    // Risk Level Clinical Terminology
    'riskLevels.low': 'Low Risk',
    'riskLevels.moderate': 'Moderate Risk',
    'riskLevels.high': 'High Risk',

    // Behavior Page
    'behavior.title': 'Behavior Tracking',
    'behavior.subtitle': 'Monitor and record student behavior for pattern identification and early intervention',
    'behavior.search': 'Search behavior records...',
    'behavior.filter': 'Filter',
    'behavior.newRecord': 'Add Record',
    'behavior.overview': 'Behavior Overview',
    'behavior.recentRecords': 'Recent Records',
    'behavior.viewDetails': 'View Details',
    'behavior.scheduleIntervention': 'Schedule Intervention',
    'behavior.category.attendance': 'Attendance',
    'behavior.category.discipline': 'Discipline',
    'behavior.category.participation': 'Participation',
    'behavior.category.social': 'Social',
    'behavior.severity.positive': 'Positive',
    'behavior.severity.neutral': 'Neutral',
    'behavior.severity.minor': 'Minor',
    'behavior.severity.major': 'Major',
    'behavior.stats.total': 'Total Records',
    'behavior.stats.thisMonth': 'This Month',
    'behavior.stats.needsAttention': 'Needs Attention',

    // Career Page
    'career.title': 'Career Guidance',
    'career.subtitle': 'Help students plan their future through career assessments and resources',
    'career.search': 'Search assessments or resources...',
    'career.filter': 'Filter',
    'career.newAssessment': 'New Assessment',
    'career.assessments': 'Career Assessments',
    'career.resources': 'Resources',
    'career.viewDetails': 'View Details',
    'career.scheduleDiscussion': 'Schedule Discussion',
    'career.type.article': 'Article',
    'career.type.video': 'Video',
    'career.type.assessment': 'Assessment',
    'career.type.program': 'Program',
    'career.interests': 'Interests',
    'career.skills': 'Skills',
    'career.values': 'Values',
    'career.recommendedPaths': 'Recommended Paths',
    'career.stats.totalAssessments': 'Total Assessments',
    'career.stats.resourcesShared': 'Resources Shared',
    'career.stats.pendingDiscussions': 'Pending Discussions',
    'career.backToAssessments': 'Back to Career Assessments',

    // Settings Page
    'settings.subtitle': 'Manage application settings and user preferences',
    'settings.profile': 'Profile',
    'settings.fullName': 'Full Name',
    'settings.email': 'Email',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.emailNotificationsDesc': 'Receive updates about sessions and student status changes via email',
    'settings.desktopNotifications': 'Desktop Notifications',
    'settings.desktopNotificationsDesc': 'Show desktop notifications for reminders and important updates',
    'settings.security': 'Security',
    'settings.changePassword': 'Change Password',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Switch to dark theme to reduce eye strain',

    // Errors
    'errors.loadingStudents': 'Failed to load students',
    'errors.loadingStudent': 'Failed to load student details',
    'errors.studentNotFound': 'Student not found',
    'errors.failedToCreateAssessment': 'Failed to create new assessment. Please try again.',
    
    // Actions
    'actions.backToStudents': 'Back to Students',
    'actions.generateReport': 'Download Report',
    'actions.generating': 'Generating...',
    'actions.retry': 'Retry',
    
    // Common UI elements
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',

    // Login Page
    'login.platformDescription': 'A comprehensive platform for counselors, students, and administrators to manage mental health support.',
    'login.students': 'Students',
    'login.studentDescription': 'Manage your counseling sessions',
    'login.counselors': 'Counselors',
    'login.counselorDescription': 'Track and support your students',
    'login.admins': 'Admins',
    'login.adminDescription': 'Oversee the entire system',
    'login.allRightsReserved': 'All rights reserved.',
    'login.welcomeBack': 'Welcome Back',
    'login.signInPrompt': 'Please sign in to your account',
    'login.demoCredentials': 'Demo Credentials',
    'login.adminUser': 'Admin',
    'login.counselorUser': 'Counselor',
    'login.studentUser': 'Student',
    'login.loginFailed': 'Login failed',
    'login.username': 'Username',
    'login.enterUsername': 'Enter your username',
    'login.password': 'Password',
    'login.enterPassword': 'Enter your password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot your password?',
    'login.signingIn': 'Signing in...',
    'login.signIn': 'Sign in',
    'login.resetPassword': 'Reset Password',
    'login.resetInstructions': 'Enter your email address and we will send you a link to reset your password.',
    'login.email': 'Email',
    'login.enterEmail': 'Enter your email address',
    'login.sendResetLink': 'Send Reset Link',
    'login.sending': 'Sending...',
    'login.resetEmailSent': 'Email sent! Check your inbox for a password reset link.',

    // Layout related translations
    'greeting.morning': 'Good Morning',
    'greeting.afternoon': 'Good Afternoon',
    'greeting.evening': 'Good Evening',
    'roles.admin': 'Administrator',
    'roles.counselor': 'Counselor',
    'roles.student': 'Student',
    'common.search': 'Search...',
    'common.dashboard': 'Dashboard',
    'common.profile': 'Profile',
    'common.reports': 'Reports',
    'common.today': 'Today',
    
    // CSV Import/Export translations
    'settings.title': 'Settings',
    'settings.tabs.general': 'General',
    'settings.tabs.userManagement': 'User Management',
    'settings.importUsers': 'Import Users (CSV)',
    'settings.exportUsers': 'Export Users (CSV)',
    'settings.addUser': 'Add User',
    'settings.editUser': 'Edit User',
    'settings.deleteUser': 'Delete User',
    'settings.confirmDelete': 'Confirm Delete',
    'settings.deleteConfirmation': 'Are you sure you want to delete this user? This action cannot be undone.',
    'settings.name': 'Name',
    'settings.username': 'Username',
    'settings.role': 'Role',
    'settings.actions': 'Actions',
    'settings.cancel': 'Cancel',
    'settings.confirmImport': 'Confirm Import',
    'settings.importPreview': 'Import Preview',
    'settings.importCSVDescription': 'Review the users that will be imported from your CSV file. Click "Import" to add these users to the system.',
    'settings.searchUsers': 'Search users...',
    'settings.language': 'Language',

    // Profile Page
    'profile.title': 'User Profile',
    'profile.subtitle': 'Manage your personal information and account settings',
    'profile.personalInfo': 'Personal Information',
    'profile.contactInfo': 'Contact Information',
    'profile.accountSettings': 'Account Settings',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.address': 'Address',
    'profile.role': 'Role',
    'profile.bio': 'Biography',
    'profile.joinedDate': 'Joined Date',
    'profile.lastLogin': 'Last Login',
    'profile.updateProfile': 'Update Profile',
    'profile.passwordSection': 'Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm Password',
    'profile.changePassword': 'Change Password',
    'profile.photoSection': 'Profile Photo',
    'profile.uploadPhoto': 'Upload Photo',
    'profile.removePhoto': 'Remove Photo',
    'profile.photoRequirements': 'Maximum size 5MB. Formats: JPG, PNG',
    'profile.saveChanges': 'Save Changes',
    'profile.cancelChanges': 'Cancel',
    'profile.passwordChanged': 'Password successfully changed',
    'profile.profileUpdated': 'Profile successfully updated',

    // Additional profile translations
    'profile.overview': 'Overview',
    'profile.activity': 'Activity',
    'profile.reports': 'Reports',
    'profile.roleSpecificDetails': 'Role-specific Details',
    'profile.adminCapabilities': 'Admin Capabilities',
    'profile.systemAccess': 'System Access',
    'profile.systemAccessDescription': 'Manage system access and user permissions',
    'profile.customizeYourProfile': 'Customize Your Profile',
    'profile.visualIdentity': 'Visual Identity',
    'profile.photoDescription': 'Profile photos help other users recognize you',
    'profile.edit': 'Edit',
    'profile.totalUsers': 'Total Users',
    'profile.counselors': 'Counselors',
    'profile.students': 'Students',
    'profile.recentActivity': 'Recent Activity',

    // RIASEC results
    'riasec.results.downloading': 'Downloading...',
    'riasec.results.nativeShare': 'Share...',
    'riasec.results.copyToClipboard': 'Copy to clipboard',
    'riasec.results.copied': 'Copied!',
    'riasec.results.code': 'RIASEC Code',
    'riasec.results.score': 'Score',
    'riasec.results.education': 'Education',
    'riasec.results.generatedOn': 'Generated on',

    // Common
  'common.back': 'Back',
  
  // Errors
  'errors.mlAnalysisFailed': 'Machine learning analysis failed',
  
  
  // ML and analysis related
  'mentalHealth.mlDisclaimer.title': 'AI Analysis',
  'mentalHealth.mlDisclaimer.content': 'This system uses machine learning to analyze assessment data. Results should be reviewed by professionals.',
  'mentalHealth.mlInsights': 'ML Insights',
  'mentalHealth.conditionProbability': 'Condition Probability',
  'mentalHealth.probability': 'probability',
  'mentalHealth.severityLevel': 'Severity Level',
  'mentalHealth.confidenceScore': 'Confidence Score',
  'mentalHealth.severity.mild': 'Mild',
  'mentalHealth.severity.moderate': 'Moderate',
  'mentalHealth.severity.severe': 'Severe',
  
  'mentalHealth.riskFactors': 'Risk Factors',
  'mentalHealth.recommendedActions': 'Recommended Actions',
  'mentalHealth.disclaimerText': 'These recommendations are generated by an AI system and should be reviewed by a qualified mental health professional.',
  
  'mentalHealth.trendsAndStats': 'Trends & Statistics',
  'mentalHealth.scoreOverTime': 'Score Over Time',
  'mentalHealth.noHistoricalData': 'No historical data available yet',
  'mentalHealth.takeFirstAssessment': 'Take your first assessment',
  
  
  'mentalHealth.questionnaire': 'Questionnaire',
  'mentalHealth.completed': 'completed',
  'mentalHealth.questionnaireInstructions': 'Please answer the following questions based on your experiences over the past two weeks.',
  'mentalHealth.questionnaireInstructions2': 'For each statement, select the option that best describes your experience.',
  'mentalHealth.selectAssessmentType': 'Select assessment type',
  'mentalHealth.continueToQuestions': 'Continue to questions',
  'mentalHealth.analyzingResponses': 'Analyzing responses...',
  'mentalHealth.submitForAnalysis': 'Submit for analysis',
  
  'mentalHealth.demographicInfo': 'Demographic Information',
  'mentalHealth.demographicDisclaimer': 'This information helps improve the accuracy of our analysis but is optional.',
  'mentalHealth.age': 'Age',
  'mentalHealth.gender': 'Gender',
  'mentalHealth.selectOption': 'Select an option',
  'mentalHealth.previousDiagnosis': 'Previous mental health diagnosis',
  'mentalHealth.familyHistory': 'Family history of mental health conditions',
  'mentalHealth.recentLifeEvents': 'Experienced significant life events recently',
  
  'mentalHealth.responseOptions.notAtAll': 'Not at all',
  'mentalHealth.responseOptions.severalDays': 'Several days',
  'mentalHealth.responseOptions.moreThanHalf': 'More than half the days',
  'mentalHealth.responseOptions.nearlyEveryDay': 'Nearly every day',
  
  'mentalHealth.genderOptions.male': 'Male',
  'mentalHealth.genderOptions.female': 'Female',
  'mentalHealth.genderOptions.nonBinary': 'Non-binary',
  'mentalHealth.genderOptions.preferNotToSay': 'Prefer not to say',
  
  // Assessment Types
  'assessmentTypes.gad7': 'Anxiety Disorder Questionnaire',
  'assessmentTypes.pss': 'Perceived Stress Scale',
  'assessmentTypes.pcl5': 'PTSD Checklist',
  'assessmentTypes.wsas': 'Work & Social Adjustment Scale',
  
  }
};

// Create context
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState('id'); // Default language is Indonesian

  const t = (key: string, fallback?: string): string => {
    // Check if key exists in current language
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }

    // Return fallback or key if no translation found
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;