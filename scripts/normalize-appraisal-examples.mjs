import fs from 'node:fs';

const path = new URL('../src/data/appraisal.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const taskMap = {
  qa: {
    junior: 'menjalankan test case dasar, smoke test, dan menulis bug report',
    middle: 'menyusun test scenario, melakukan regression, dan membantu bug triage',
    senior: 'menentukan strategi pengujian, membaca pola defect, dan menjaga quality gate release',
    lead: 'mengarahkan prioritas quality improvement, keputusan release, dan pengembangan tim QA',
  },
  frontend: {
    junior: 'mengerjakan implementasi UI sederhana, perbaikan styling, dan bug visual',
    middle: 'mengembangkan fitur frontend end-to-end, integrasi API, dan menangani issue browser',
    senior: 'menjaga arsitektur komponen, performa frontend, dan standar implementasi UI',
    lead: 'mengarahkan arsitektur frontend, konsistensi UX engineering, dan coaching tim frontend',
  },
  backend: {
    junior: 'mengerjakan endpoint sederhana, memperbaiki bug service, dan menangani query dasar',
    middle: 'mengembangkan API inti, integrasi antar service, dan mengoptimalkan reliability',
    senior: 'menentukan desain service, membaca incident, dan menjaga scalability serta observability',
    lead: 'mengarahkan arsitektur backend, prioritas technical debt, dan reliability lintas service',
  },
};

const descriptors = {
  communication: [
    'update penting ke rekan terkait',
    'ringkasan isu dan keputusan',
    'pembagian konteks untuk pihak yang perlu tahu',
    'alur koordinasi lintas fungsi',
  ],
  'ownership-responsibility': [
    'status tindak lanjut pekerjaan',
    'penutupan issue sampai benar-benar tuntas',
    'eskalasi risiko atau blocker yang relevan',
    'kejelasan akuntabilitas pekerjaan',
  ],
  'quality-of-work': [
    'hasil implementasi atau analisis yang diserahkan',
    'validasi detail, edge case, dan kelengkapan output',
    'pengecekan ulang sebelum handoff ke pihak lain',
    'minimnya revisi dan rework di tahap berikutnya',
  ],
  accomplishment: [
    'pemecahan target menjadi milestone kerja yang jelas',
    'pengelolaan prioritas, waktu, dan dependency',
    'fokus pada komitmen yang paling penting',
    'kestabilan pencapaian target tim atau squad',
  ],
  'problem-solving-innovation': [
    'identifikasi akar masalah yang benar-benar relevan',
    'opsi solusi yang dipertimbangkan sebelum eksekusi',
    'inisiatif mencoba pendekatan yang lebih efektif',
    'pencegahan masalah berulang di masa berikutnya',
  ],
  teamwork: [
    'kolaborasi harian dengan rekan satu tim',
    'handoff dan alignment antarperan',
    'kesediaan membantu saat tim lain atau rekan terhambat',
    'kelancaran kerja tim secara keseluruhan',
  ],
  integrity: [
    'transparansi status, kendala, dan konsekuensi pekerjaan',
    'kejujuran saat ada kekeliruan, risiko, atau estimasi meleset',
    'konsistensi terhadap komitmen yang sudah disepakati',
    'kepercayaan tim terhadap hasil kerja dan sikap profesionalnya',
  ],
  'keep-improving': [
    'pemanfaatan feedback untuk perbaikan kerja berikutnya',
    'inisiatif belajar di luar kebutuhan minimum tugas',
    'eksperimen kecil untuk memperbaiki cara kerja tim',
    'kemajuan kualitas kerja dari waktu ke waktu',
  ],
  'customer-focused': [
    'pemahaman terhadap dampak pekerjaan ke pengguna atau klien',
    'ketelitian melihat pain point, edge case, atau kebutuhan nyata',
    'upaya menyesuaikan solusi dengan konteks pelanggan',
    'pengalaman pengguna akhir yang lebih konsisten',
  ],
  'business-acumen': [
    'pemahaman terhadap prioritas bisnis di balik pekerjaan',
    'pemilihan trade-off antara effort, risiko, dan dampak',
    'kejelian melihat konsekuensi keputusan ke produk atau bisnis',
    'keterhubungan output teknis dengan tujuan bisnis',
  ],
  'managerial-courage': [
    'keberanian menyampaikan feedback atau keputusan yang perlu',
    'ketegasan saat standar kerja tidak terpenuhi',
    'kemampuan mengambil keputusan sulit dengan alasan yang jelas',
    'kejelasan arah tim saat menghadapi situasi yang menantang',
  ],
  'managing-people': [
    'coaching dan pengarahan kerja anggota tim',
    'delegasi yang sesuai kapasitas, prioritas, dan konteks',
    'follow-up terhadap perkembangan dan hambatan anggota tim',
    'pertumbuhan performa tim secara berkelanjutan',
  ],
  'strive-for-excellence': [
    'inisiatif menambah kualitas di luar permintaan dasar',
    'perbaikan reusable yang tidak hanya menyelesaikan task saat ini',
    'usaha menjaga standar hasil tetap tinggi dari awal sampai akhir',
    'dampak kerja yang melampaui ekspektasi awal',
  ],
};

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildBullets(goalCode, task, rating) {
  const [first, second, third, fourth] = descriptors[goalCode] ?? descriptors['strive-for-excellence'];

  const templates = {
    1: [
      `Dalam konteks ${task}, ${first} sering belum terlihat jelas dan masih memerlukan banyak arahan.`,
      `${capitalize(second)} kerap belum cukup matang untuk langsung dipakai sebagai dasar tindak lanjut.`,
      `${capitalize(third)} sering muncul terlambat, sehingga risiko atau celah baru terlihat setelah mulai berdampak.`,
      `Akibatnya, ${fourth} masih banyak bergantung pada klarifikasi dan follow-up tambahan dari rekan atau atasan.`,
    ],
    2: [
      `Dalam konteks ${task}, ${first} sudah mulai terlihat, tetapi belum konsisten pada situasi yang lebih kompleks.`,
      `${capitalize(second)} cukup membantu di kasus sederhana, namun masih sering perlu dipertegas atau dilengkapi.`,
      `${capitalize(third)} belum selalu muncul secara proaktif, sehingga peluang mencegah issue lebih awal masih sering terlewat.`,
      `Dampaknya, ${fourth} belum stabil dan masih menimbulkan siklus klarifikasi yang sebenarnya bisa dikurangi.`,
    ],
    3: [
      `Dalam konteks ${task}, ${first} sudah memenuhi kebutuhan dasar pekerjaan sehari-hari.`,
      `${capitalize(second)} umumnya bisa dipakai untuk melanjutkan pekerjaan, walau sesekali masih perlu dirapikan agar lebih solid.`,
      `${capitalize(third)} mulai terlihat di momen penting, tetapi belum selalu muncul sebelum diminta.`,
      `Jika diperkuat lebih konsisten, ${fourth} dapat membantu tim bergerak lebih cepat dan lebih rapi.`,
    ],
    4: [
      `Dalam konteks ${task}, ${first} cukup konsisten dan mulai memberi nilai tambah di luar kebutuhan minimum.`,
      `${capitalize(second)} umumnya sudah rapi untuk dipakai sebagai dasar keputusan, review, atau handoff.`,
      `${capitalize(third)} biasanya muncul di waktu yang tepat sehingga issue bisa ditangani lebih cepat.`,
      `Hasilnya, ${fourth} terasa positif walau skalanya belum selalu meluas ke area yang lebih besar.`,
    ],
    5: [
      `Dalam konteks ${task}, ${first} terlihat kuat dan sering membantu tim melampaui standar yang diminta.`,
      `${capitalize(second)} umumnya matang, tajam, dan jarang membutuhkan koreksi berarti.`,
      `${capitalize(third)} dilakukan secara proaktif sehingga tim bisa mengantisipasi risiko dan peluang perbaikan lebih awal.`,
      `Dampaknya, ${fourth} ikut meningkatkan kepercayaan tim dan kualitas delivery secara nyata.`,
    ],
    6: [
      `Dalam konteks ${task}, ${first} menjadi acuan yang sering diikuti orang lain.`,
      `${capitalize(second)} sangat matang dan kerap dipakai sebagai benchmark untuk pekerjaan serupa.`,
      `${capitalize(third)} dilakukan sangat cepat dan tepat, bahkan sebelum masalah terlihat oleh kebanyakan orang.`,
      `Hasilnya, ${fourth} memberi dampak luas pada standar kerja tim, squad, maupun organisasi.`,
    ],
  };

  return templates[rating];
}

let updatedCount = 0;

for (const item of data.items) {
  for (const role of Object.keys(item.examples)) {
    for (const level of Object.keys(item.examples[role])) {
      const currentValue = item.examples[role][level];
      const intro = typeof currentValue === 'string'
        ? currentValue.split(/\n\n|\n- /)[0].trim()
        : String(currentValue.info ?? '').trim();
      const bullets = buildBullets(item.goal.code, taskMap[role][level], item.rating);
      item.examples[role][level] = {
        info: intro,
        example: bullets,
      };
      updatedCount += 1;
    }
  }
}

data.meta.version = 7;

if (!data.meta.notes.includes('examples may include bullet-form detail for clearer case-based guidance')) {
  data.meta.notes.push('examples may include bullet-form detail for clearer case-based guidance');
}

if (!data.meta.notes.includes('examples use structured info + example[] objects for each role level')) {
  data.meta.notes.push('examples use structured info + example[] objects for each role level');
}

fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Normalized ${updatedCount} examples.`);