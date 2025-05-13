// Definisi tipe-tipe data yang diperlukan
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  timeLimit: number; // in minutes
  completed: boolean;
  score?: number;
  lastAttempt?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'document' | 'presentation';
  url: string;
  description?: string;
  duration?: number; // for videos in minutes
  size?: number; // for downloadable files in KB
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'practice' | 'discussion';
  duration: number; // in minutes
  completed: boolean;
  content?: string;
  videoUrl?: string; // Tambahkan properti ini
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  completed: boolean;
  resources: Resource[];
  quizzes: Quiz[];
  lessons: Lesson[];
  releaseDate?: string;
  dueDate?: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  photo: string;
  bio: string;
  email?: string;
}

export interface Discussion {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  overview: string;
  objectives: string[];
  prerequisites?: string[];
  progress: number; // persentase penyelesaian 0-100
  instructors: Instructor[];
  thumbnail: string;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  startDate: string;
  endDate?: string;
  enrollmentCount: number;
  rating: number;
  discussions: Discussion[];
  instructor?: string; // untuk kompatibilitas dengan komponen CareerPage
}

// Mock data kursus
export const mockCourses: Record<string, Course> = {
  '1': {
    id: '1',
    title: 'Pengenalan Perencanaan Karir',
    description: 'Kursus dasar untuk memahami perencanaan karir dan perkembangan profesional.',
    overview: 'Kursus ini dirancang untuk membantu Anda memahami proses perencanaan karir dan mengembangkan strategi yang efektif untuk masa depan profesional Anda. Melalui serangkaian modul interaktif, Anda akan belajar cara mengidentifikasi minat dan kekuatan, menjelajahi berbagai pilihan karir, dan merencanakan langkah-langkah konkret untuk mencapai tujuan karir Anda.',
    objectives: [
      'Mengidentifikasi minat, bakat, dan nilai pribadi',
      'Mengembangkan pemahaman tentang berbagai pilihan karir',
      'Mempelajari cara menetapkan tujuan karir jangka pendek dan jangka panjang',
      'Memahami strategi pengembangan profesional yang efektif'
    ],
    prerequisites: ['Tidak ada prasyarat khusus untuk kursus ini'],
    modules: [
      {
        id: 'm1',
        title: 'Mengenal Diri Sendiri',
        description: 'Memahami minat, bakat, dan nilai-nilai personal.',
        order: 1,
        duration: 45,
        completed: true,
        releaseDate: '2025-04-15',
        resources: [
          {
            id: 'r1',
            title: 'Panduan Analisis SWOT Personal',
            type: 'pdf',
            url: 'https://example.com/swot-analysis.pdf',
            size: 1250
          },
          {
            id: 'r2',
            title: 'Instrumen Penilaian Minat',
            type: 'document',
            url: 'https://example.com/interest-assessment.docx',
            size: 780
          }
        ],
        quizzes: [
          {
            id: 'q1',
            title: 'Kuis Mengenali Diri',
            description: 'Uji pemahaman Anda tentang minat dan nilai personal',
            questions: 10,
            timeLimit: 15,
            completed: true,
            score: 85,
            lastAttempt: '2025-04-20'
          }
        ],
        lessons: [
          {
            id: 'l1-1',
            title: 'Pengantar Eksplorasi Diri',
            type: 'video',
            duration: 12,
            completed: true,
            videoUrl: 'https://youtu.be/bISJxDwTApQ?si=aQmOnh5j1QRhmEXY'
          },
          {
            id: 'l1-2',
            title: 'Mengidentifikasi Minat dan Bakat',
            type: 'reading',
            duration: 15,
            completed: true,
            content: 'Artikel tentang metode identifikasi minat dan bakat'
          },
          {
            id: 'l1-3',
            title: 'Latihan Analisis Nilai Personal',
            type: 'practice',
            duration: 18,
            completed: true
          }
        ]
      },
      {
        id: 'm2',
        title: 'Eksplorasi Karir',
        description: 'Menjelajahi berbagai pilihan karir dan jalur pendidikan.',
        order: 2,
        duration: 60,
        completed: false,
        releaseDate: '2025-04-22',
        resources: [
          {
            id: 'r3',
            title: 'Daftar Profesi dan Jalur Karir',
            type: 'pdf',
            url: 'https://example.com/career-paths.pdf',
            size: 2340
          },
          {
            id: 'r4',
            title: 'Presentasi Tren Pasar Kerja 2025',
            type: 'presentation',
            url: 'https://example.com/job-market-trends.pptx',
            size: 4250
          }
        ],
        quizzes: [
          {
            id: 'q2',
            title: 'Kuis Eksplorasi Karir',
            description: 'Menguji pemahaman tentang berbagai jalur karir',
            questions: 15,
            timeLimit: 20,
            completed: false
          }
        ],
        lessons: [
          {
            id: 'l2-1',
            title: 'Pengantar Jalur Karir',
            type: 'video',
            duration: 18,
            completed: true,
            videoUrl: 'https://example.com/videos/career-paths-intro.mp4'
          },
          {
            id: 'l2-2',
            title: 'Mengenal Berbagai Profesi',
            type: 'reading',
            duration: 20,
            completed: false,
            content: 'Rangkuman berbagai profesi dan persyaratannya'
          },
          {
            id: 'l2-3',
            title: 'Diskusi: Pilihan Karir Masa Depan',
            type: 'discussion',
            duration: 22,
            completed: false
          }
        ]
      },
      {
        id: 'm3',
        title: 'Perencanaan Tujuan Karir',
        description: 'Menyusun rencana dan tujuan karir jangka pendek, menengah, dan panjang.',
        order: 3,
        duration: 75,
        completed: false,
        releaseDate: '2025-04-29',
        resources: [
          {
            id: 'r5',
            title: 'Template Perencanaan Karir',
            type: 'document',
            url: 'https://example.com/career-planning-template.docx',
            size: 950
          },
          {
            id: 'r6',
            title: 'Video Testimoni Perencana Karir Sukses',
            type: 'video',
            url: 'https://example.com/career-success-stories.mp4',
            duration: 18
          }
        ],
        quizzes: [
          {
            id: 'q3',
            title: 'Kuis Perencanaan Tujuan',
            description: 'Evaluasi pemahaman tentang menetapkan tujuan yang SMART',
            questions: 12,
            timeLimit: 18,
            completed: false
          }
        ],
        lessons: [
          {
            id: 'l3-1',
            title: 'Prinsip Penetapan Tujuan SMART',
            type: 'video',
            duration: 15,
            completed: false,
            videoUrl: 'https://example.com/videos/smart-goals.mp4'
          },
          {
            id: 'l3-2',
            title: 'Workshop Perencanaan Karir',
            type: 'practice',
            duration: 35,
            completed: false
          },
          {
            id: 'l3-3',
            title: 'Refleksi Tujuan Pribadi',
            type: 'reading',
            duration: 25,
            completed: false,
            content: 'Panduan untuk melakukan refleksi diri dan menetapkan tujuan'
          }
        ]
      }
    ],
    progress: 40,
    instructors: [
      {
        id: 'i1',
        name: 'Dr. Budi Santoso',
        title: 'Konselor Karir Senior',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'Dr. Budi Santoso adalah konselor karir berpengalaman dengan lebih dari 15 tahun pengalaman membantu siswa menemukan jalur karir yang sesuai. Beliau memiliki gelar doktor di bidang Psikologi Pendidikan dan bersertifikasi sebagai Career Development Facilitator.'
      },
      {
        id: 'i2',
        name: 'Siti Rahayu, M.Psi.',
        title: 'Spesialis Pengembangan Karir',
        photo: 'https://randomuser.me/api/portraits/women/45.jpg',
        bio: 'Siti Rahayu adalah psikolog dengan spesialisasi di bidang pengembangan karir dan bimbingan vokasional. Beliau aktif sebagai pembicara di berbagai seminar karir dan telah menulis beberapa buku tentang perencanaan karir untuk remaja.'
      }
    ],
    thumbnail: 'https://example.com/images/career-planning.jpg',
    category: 'Pengembangan Karir',
    tags: ['perencanaan karir', 'pengembangan diri', 'eksplorasi minat', 'tujuan karir'],
    level: 'beginner',
    startDate: '2025-04-15',
    endDate: '2025-05-20',
    enrollmentCount: 156,
    rating: 4.8,
    instructor: 'Dr. Budi Santoso',
    discussions: [
      {
        id: 'd1',
        authorId: 'u1',
        authorName: 'Ahmad Ridwan',
        authorPhoto: 'https://randomuser.me/api/portraits/men/54.jpg',
        content: 'Saya sangat terbantu dengan materi di modul pertama tentang eksplorasi diri. Sebelumnya saya bingung bagaimana mengidentifikasi minat dan bakat saya secara terstruktur. Terima kasih!',
        timestamp: '2025-04-21T10:15:00',
        likes: 12,
        replies: 3
      },
      {
        id: 'd2',
        authorId: 'u2',
        authorName: 'Dewi Kusuma',
        authorPhoto: 'https://randomuser.me/api/portraits/women/33.jpg',
        content: 'Apakah ada rekomendasi buku atau sumber bacaan tambahan untuk memperdalam pemahaman tentang eksplorasi karir?',
        timestamp: '2025-04-23T14:30:00',
        likes: 5,
        replies: 2
      },
      {
        id: 'd3',
        authorId: 'i1',
        authorName: 'Dr. Budi Santoso',
        authorPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        content: 'Untuk teman-teman yang ingin memperdalam materi, saya rekomendasikan membaca buku "Merancang Masa Depan" karya Prof. Anita Rahayu dan "Strategi Menemukan Karir Impian" oleh Hendra Wijaya. Keduanya tersedia di perpustakaan sekolah kita.',
        timestamp: '2025-04-23T16:20:00',
        likes: 15,
        replies: 0
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Keterampilan Wawancara Kerja',
    description: 'Pelajari teknik menjawab pertanyaan dan mempersiapkan wawancara kerja.',
    overview: 'Kursus ini dirancang untuk membantu Anda menguasai keterampilan wawancara kerja yang penting untuk meningkatkan peluang kesuksesan dalam proses rekrutmen. Anda akan mempelajari teknik menjawab berbagai jenis pertanyaan wawancara, strategi persiapan yang efektif, dan cara membuat kesan yang baik pada pewawancara.',
    objectives: [
      'Memahami berbagai jenis format wawancara dan persiapannya',
      'Mempelajari teknik menjawab pertanyaan wawancara yang sulit',
      'Mengembangkan keterampilan komunikasi verbal dan non-verbal',
      'Berlatih simulasi wawancara dalam lingkungan yang aman'
    ],
    prerequisites: ['Memiliki resume atau CV yang sudah dipersiapkan'],
    modules: [
      {
        id: 'm1',
        title: 'Persiapan Wawancara',
        description: 'Langkah-langkah persiapan sebelum menghadapi wawancara.',
        order: 1,
        duration: 30,
        completed: true,
        releaseDate: '2025-04-15',
        resources: [
          {
            id: 'r1',
            title: 'Checklist Persiapan Wawancara',
            type: 'pdf',
            url: 'https://example.com/interview-checklist.pdf',
            size: 850
          },
          {
            id: 'r2',
            title: 'Template Penelitian Perusahaan',
            type: 'document',
            url: 'https://example.com/company-research.docx',
            size: 680
          }
        ],
        quizzes: [
          {
            id: 'q1',
            title: 'Kuis Persiapan Wawancara',
            description: 'Menguji pemahaman tentang langkah-langkah persiapan wawancara',
            questions: 8,
            timeLimit: 10,
            completed: true,
            score: 90,
            lastAttempt: '2025-04-18'
          }
        ],
        lessons: [
          {
            id: 'l1-1',
            title: 'Penelitian Perusahaan',
            type: 'video',
            duration: 10,
            completed: true,
            videoUrl: 'https://example.com/videos/company-research.mp4'
          },
          {
            id: 'l1-2',
            title: 'Mempersiapkan Dokumen Pendukung',
            type: 'reading',
            duration: 8,
            completed: true,
            content: 'Panduan menyiapkan dokumen yang diperlukan untuk wawancara'
          },
          {
            id: 'l1-3',
            title: 'Perencanaan Perjalanan dan Penampilan',
            type: 'reading',
            duration: 12,
            completed: true,
            content: 'Tips mengatur perjalanan dan berpakaian untuk wawancara'
          }
        ]
      },
      {
        id: 'm2',
        title: 'Menjawab Pertanyaan Sulit',
        description: 'Strategi menjawab pertanyaan wawancara yang menantang.',
        order: 2,
        duration: 45,
        completed: true,
        releaseDate: '2025-04-22',
        resources: [
          {
            id: 'r3',
            title: '50 Pertanyaan Wawancara Umum dan Jawabannya',
            type: 'pdf',
            url: 'https://example.com/interview-questions.pdf',
            size: 1540
          },
          {
            id: 'r4',
            title: 'Teknik STAR untuk Menjawab Pertanyaan Perilaku',
            type: 'presentation',
            url: 'https://example.com/star-technique.pptx',
            size: 2250
          }
        ],
        quizzes: [
          {
            id: 'q2',
            title: 'Kuis Pertanyaan Wawancara',
            description: 'Menguji kemampuan menjawab pertanyaan wawancara',
            questions: 12,
            timeLimit: 20,
            completed: true,
            score: 75,
            lastAttempt: '2025-04-25'
          }
        ],
        lessons: [
          {
            id: 'l2-1',
            title: 'Menjawab Pertanyaan tentang Kekuatan dan Kelemahan',
            type: 'video',
            duration: 15,
            completed: true,
            videoUrl: 'https://example.com/videos/strengths-weaknesses.mp4'
          },
          {
            id: 'l2-2',
            title: 'Teknik STAR untuk Pertanyaan Situasional',
            type: 'video',
            duration: 18,
            completed: true,
            videoUrl: 'https://example.com/videos/star-technique.mp4'
          },
          {
            id: 'l2-3',
            title: 'Menjawab Pertanyaan tentang Gaji',
            type: 'reading',
            duration: 12,
            completed: true,
            content: 'Strategi menjawab pertanyaan terkait ekspektasi gaji'
          }
        ]
      },
      {
        id: 'm3',
        title: 'Simulasi Wawancara',
        description: 'Latihan wawancara melalui roleplay dan umpan balik.',
        order: 3,
        duration: 90,
        completed: false,
        releaseDate: '2025-04-29',
        resources: [
          {
            id: 'r5',
            title: 'Formulir Evaluasi Wawancara',
            type: 'document',
            url: 'https://example.com/interview-evaluation.docx',
            size: 750
          },
          {
            id: 'r6',
            title: 'Video Contoh Wawancara Sukses',
            type: 'video',
            url: 'https://example.com/successful-interview.mp4',
            duration: 22
          }
        ],
        quizzes: [
          {
            id: 'q3',
            title: 'Evaluasi Simulasi',
            description: 'Evaluasi diri setelah melakukan simulasi wawancara',
            questions: 5,
            timeLimit: 15,
            completed: false
          }
        ],
        lessons: [
          {
            id: 'l3-1',
            title: 'Persiapan Simulasi Wawancara',
            type: 'reading',
            duration: 10,
            completed: false,
            content: 'Panduan mempersiapkan sesi simulasi wawancara'
          },
          {
            id: 'l3-2',
            title: 'Simulasi Wawancara Individu',
            type: 'practice',
            duration: 45,
            completed: false
          },
          {
            id: 'l3-3',
            title: 'Simulasi Wawancara Panel',
            type: 'practice',
            duration: 35,
            completed: false
          }
        ]
      }
    ],
    progress: 70,
    instructors: [
      {
        id: 'i1',
        name: 'Siti Aminah, M.Psi.',
        title: 'Spesialis Rekrutmen',
        photo: 'https://randomuser.me/api/portraits/women/28.jpg',
        bio: 'Siti Aminah adalah profesional HR dengan pengalaman lebih dari 10 tahun di bidang rekrutmen dan pengembangan talenta. Beliau telah membantu ratusan kandidat berhasil dalam proses wawancara di berbagai industri.'
      }
    ],
    thumbnail: 'https://example.com/images/interview-skills.jpg',
    category: 'Keterampilan Kerja',
    tags: ['wawancara kerja', 'rekrutmen', 'pengembangan karir', 'komunikasi'],
    level: 'intermediate',
    startDate: '2025-04-15',
    endDate: '2025-05-15',
    enrollmentCount: 124,
    rating: 4.7,
    instructor: 'Siti Aminah, M.Psi.',
    discussions: [
      {
        id: 'd1',
        authorId: 'u1',
        authorName: 'Budi Pratama',
        authorPhoto: 'https://randomuser.me/api/portraits/men/42.jpg',
        content: 'Modul tentang teknik STAR sangat membantu! Saya baru saja menggunakannya di wawancara minggu lalu dan berhasil mendapatkan posisi tersebut.',
        timestamp: '2025-04-26T09:30:00',
        likes: 18,
        replies: 5
      },
      {
        id: 'd2',
        authorId: 'u2',
        authorName: 'Anita Wijaya',
        authorPhoto: 'https://randomuser.me/api/portraits/women/37.jpg',
        content: 'Bagaimana cara terbaik mengatasi kegugupan saat wawancara? Saya selalu merasa sangat cemas meskipun sudah berlatih.',
        timestamp: '2025-04-27T14:15:00',
        likes: 7,
        replies: 4
      },
      {
        id: 'd3',
        authorId: 'i1',
        authorName: 'Siti Aminah, M.Psi.',
        authorPhoto: 'https://randomuser.me/api/portraits/women/28.jpg',
        content: 'Untuk mengatasi kegugupan, cobalah teknik pernapasan 4-7-8 (tarik napas selama 4 detik, tahan 7 detik, dan keluarkan selama 8 detik) sebelum wawancara. Praktik berulang juga sangat penting. Pada modul simulasi kita akan membahas lebih lanjut tentang teknik mengelola kecemasan.',
        timestamp: '2025-04-27T16:45:00',
        likes: 12,
        replies: 2
      }
    ]
  },
  '3': {
    id: '3',
    title: 'Menulis CV dan Surat Lamaran yang Efektif',
    description: 'Belajar teknik menulis CV yang menarik perhatian rekruter.',
    overview: 'Kursus ini akan memandu Anda melalui proses pembuatan CV (Curriculum Vitae) dan surat lamaran yang profesional dan efektif. Anda akan belajar bagaimana membuat dokumen yang menonjolkan kualifikasi, keterampilan, dan pengalaman Anda dengan cara yang menarik perhatian rekruter dan pemberi kerja.',
    objectives: [
      'Memahami prinsip dasar CV dan surat lamaran yang efektif',
      'Mempelajari teknik menyusun struktur dan konten CV',
      'Menguasai cara menulis surat lamaran yang menarik',
      'Mengadaptasi CV dan surat lamaran untuk berbagai posisi dan industri'
    ],
    prerequisites: ['Memahami dasar-dasar komputer dan pengolah kata'],
    modules: [
      {
        id: 'm1',
        title: 'Struktur CV Modern',
        description: 'Format dan elemen penting dalam CV.',
        order: 1,
        duration: 40,
        completed: false,
        releaseDate: '2025-04-15',
        resources: [
          {
            id: 'r1',
            title: 'Template CV untuk Berbagai Industri',
            type: 'document',
            url: 'https://example.com/cv-templates.docx',
            size: 1450
          },
          {
            id: 'r2',
            title: 'Panduan Format CV ATS-Friendly',
            type: 'pdf',
            url: 'https://example.com/ats-friendly-cv.pdf',
            size: 980
          }
        ],
        quizzes: [
          {
            id: 'q1',
            title: 'Kuis Struktur CV',
            description: 'Menguji pemahaman tentang elemen dan struktur CV',
            questions: 10,
            timeLimit: 15,
            completed: false
          }
        ],
        lessons: [
          {
            id: 'l1-1',
            title: 'Prinsip Dasar CV Efektif',
            type: 'video',
            duration: 12,
            completed: false,
            videoUrl: 'https://example.com/videos/cv-basics.mp4'
          },
          {
            id: 'l1-2',
            title: 'Format dan Struktur CV',
            type: 'reading',
            duration: 15,
            completed: false,
            content: 'Panduan lengkap tentang struktur CV yang baik'
          },
          {
            id: 'l1-3',
            title: 'Menyesuaikan CV dengan ATS',
            type: 'video',
            duration: 13,
            completed: false,
            videoUrl: 'https://example.com/videos/ats-optimization.mp4'
          }
        ]
      },
      {
        id: 'm2',
        title: 'Menulis Surat Lamaran',
        description: 'Panduan penulisan surat lamaran yang profesional.',
        order: 2,
        duration: 35,
        completed: false,
        releaseDate: '2025-04-22',
        resources: [
          {
            id: 'r3',
            title: 'Template Surat Lamaran',
            type: 'document',
            url: 'https://example.com/cover-letter-templates.docx',
            size: 950
          },
          {
            id: 'r4',
            title: 'Contoh Surat Lamaran untuk Berbagai Posisi',
            type: 'pdf',
            url: 'https://example.com/sample-cover-letters.pdf',
            size: 1250
          }
        ],
        quizzes: [
          {
            id: 'q2',
            title: 'Evaluasi Surat Lamaran',
            description: 'Menguji pemahaman tentang penulisan surat lamaran yang efektif',
            questions: 8,
            timeLimit: 12,
            completed: false
          }
        ],
        lessons: [
          {
            id: 'l2-1',
            title: 'Struktur Surat Lamaran',
            type: 'reading',
            duration: 10,
            completed: false,
            content: 'Panduan struktur dan format surat lamaran yang profesional'
          },
          {
            id: 'l2-2',
            title: 'Teknik Penulisan yang Menarik',
            type: 'video',
            duration: 15,
            completed: false,
            videoUrl: 'https://example.com/videos/engaging-writing.mp4'
          },
          {
            id: 'l2-3',
            title: 'Workshop Penulisan Surat Lamaran',
            type: 'practice',
            duration: 10,
            completed: false
          }
        ]
      },
      {
        id: 'm3',
        title: 'Mengoptimalkan Dokumen untuk Industri Spesifik',
        description: 'Menyesuaikan CV dan surat lamaran untuk bidang industri tertentu.',
        order: 3,
        duration: 45,
        completed: false,
        releaseDate: '2025-04-29',
        resources: [
          {
            id: 'r5',
            title: 'Panduan Kata Kunci untuk Berbagai Industri',
            type: 'pdf',
            url: 'https://example.com/industry-keywords.pdf',
            size: 850
          },
          {
            id: 'r6',
            title: 'Analisis CV Sukses per Industri',
            type: 'presentation',
            url: 'https://example.com/successful-resumes.pptx',
            size: 1850
          }
        ],
        quizzes: [
          {
            id: 'q3',
            title: 'Adaptasi Dokumen per Industri',
            description: 'Menguji pemahaman tentang penyesuaian dokumen untuk industri spesifik',
            questions: 10,
            timeLimit: 15,
            completed: false
          }
        ],
        lessons: [
          {
            id: 'l3-1',
            title: 'CV untuk Industri Teknologi',
            type: 'reading',
            duration: 12,
            completed: false,
            content: 'Panduan khusus untuk membuat CV di bidang teknologi'
          },
          {
            id: 'l3-2',
            title: 'CV untuk Industri Kesehatan',
            type: 'reading',
            duration: 12,
            completed: false,
            content: 'Panduan khusus untuk membuat CV di bidang kesehatan'
          },
          {
            id: 'l3-3',
            title: 'CV untuk Industri Kreatif',
            type: 'reading',
            duration: 12,
            completed: false,
            content: 'Panduan khusus untuk membuat CV di bidang kreatif dan desain'
          },
          {
            id: 'l3-4',
            title: 'Workshop Adaptasi Dokumen',
            type: 'practice',
            duration: 9,
            completed: false
          }
        ]
      }
    ],
    progress: 10,
    instructors: [
      {
        id: 'i1',
        name: 'Rina Wijaya, S.Psi.',
        title: 'Konsultan Karir & Resume',
        photo: 'https://randomuser.me/api/portraits/women/63.jpg',
        bio: 'Rina Wijaya adalah konsultan karir dan ahli resume dengan lebih dari 8 tahun pengalaman membantu profesional di berbagai tahap karir. Beliau telah membantu lebih dari 1000 klien meningkatkan kualitas CV mereka dan mendapatkan pekerjaan impian.'
      },
      {
        id: 'i2',
        name: 'Hendra Pratama, MM.',
        title: 'Manajer Rekrutmen Senior',
        photo: 'https://randomuser.me/api/portraits/men/76.jpg',
        bio: 'Hendra adalah manajer rekrutmen senior dengan lebih dari 12 tahun pengalaman di perusahaan multinasional. Beliau membagikan perspektif dari sisi rekruter tentang apa yang membuat CV dan surat lamaran menonjol dalam proses seleksi.'
      }
    ],
    thumbnail: 'https://example.com/images/resume-writing.jpg',
    category: 'Dokumen Karir',
    tags: ['CV', 'resume', 'surat lamaran', 'pencarian kerja', 'rekrutmen'],
    level: 'beginner',
    startDate: '2025-04-15',
    endDate: '2025-05-15',
    enrollmentCount: 186,
    rating: 4.9,
    instructor: 'Rina Wijaya, S.Psi.',
    discussions: [
      {
        id: 'd1',
        authorId: 'u1',
        authorName: 'Maya Lestari',
        authorPhoto: 'https://randomuser.me/api/portraits/women/23.jpg',
        content: 'Seberapa penting memasukkan foto dalam CV di Indonesia? Ada yang bilang sebaiknya tidak perlu, tapi beberapa perusahaan sepertinya mengharapkannya.',
        timestamp: '2025-04-17T13:45:00',
        likes: 8,
        replies: 4
      },
      {
        id: 'd2',
        authorId: 'i1',
        authorName: 'Rina Wijaya, S.Psi.',
        authorPhoto: 'https://randomuser.me/api/portraits/women/63.jpg',
        content: 'Pertanyaan bagus, Maya! Di Indonesia, memasukkan foto profesional dalam CV masih umum dilakukan dan banyak perusahaan lokal yang mengharapkannya. Namun, untuk perusahaan multinasional atau jika Anda melamar ke luar negeri, sebaiknya tidak perlu menyertakan foto kecuali diminta spesifik. Dalam kasus apapun, pastikan jika Anda menyertakan foto, gunakan foto profesional dengan latar polos dan pakaian formal.',
        timestamp: '2025-04-17T15:20:00',
        likes: 12,
        replies: 2
      },
      {
        id: 'd3',
        authorId: 'u3',
        authorName: 'Rizki Putra',
        authorPhoto: 'https://randomuser.me/api/portraits/men/67.jpg',
        content: 'Template di modul pertama sangat membantu! Saya langsung membuat ulang CV saya menggunakan template IT Specialist dan mendapatkan lebih banyak panggilan wawancara. Terima kasih!',
        timestamp: '2025-04-25T10:05:00',
        likes: 15,
        replies: 1
      }
    ]
  }
};

// Helper function untuk mendapatkan data kursus berdasarkan id
export const getCourseById = (id: string): Course => {
  const course = mockCourses[id];
  if (!course) {
    throw new Error(`Kursus dengan ID ${id} tidak ditemukan`);
  }
  return course;
};

// Helper function untuk mendapatkan semua sumber daya dari kursus
export const getResourcesFromCourse = (course: Course): Resource[] => {
  return course.modules.flatMap(module => module.resources);
};

// Helper function untuk mendapatkan kursus dan sumber dayanya
export const getCourseWithResources = (id: string) => {
  const course = getCourseById(id);
  const resources = getResourcesFromCourse(course);
  return { course, resources };
};

// Daftar kursus untuk halaman CareerPage
export const coursesList = Object.values(mockCourses).map(course => ({
  id: course.id,
  title: course.title,
  description: course.description,
  instructor: course.instructor || course.instructors[0].name,
  thumbnail: course.thumbnail,
  progress: course.progress,
  category: course.category,
  level: course.level,
  rating: course.rating
}));
