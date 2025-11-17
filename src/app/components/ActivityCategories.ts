export const CATEGORIES = [
  "Kerja",
  "Belajar",
  "Personal",
  "Kesehatan",
  "Kebersihan / Rumah",
  "Proyek",
  "Hiburan",
  "Olahraga",
  "Kreativitas",
  "Finance / Keuangan",
];

export const SUBCATEGORIES: Record<string, string[]> = {
  Kerja: [
    "Administrasi",
    "Dokumentasi",
    "Coding / Programming",
    "Desain",
    "Rapat / Meeting",
    "Riset",
  ],
  Belajar: ["Membaca", "Menulis", "Bahasa", "Musik", "Seni & Craft"],
  Personal: ["Manajemen Waktu"],
  Kesehatan: ["Kebugaran", "Yoga", "Meditasi"],
  "Kebersihan / Rumah": [
    "Kebersihan Rumah",
    "Laundry",
    "Belanja",
    "Memasak",
    "Maintenance Rumah",
  ],
  Proyek: ["Project Task"],
  Hiburan: ["Editing Foto / Video", "Social Media"],
  Olahraga: ["Kebugaran", "Yoga"],
  Kreativitas: ["Editing Foto / Video", "Desain"],
  "Finance / Keuangan": ["Budgeting", "Keuangan Pribadi"],
};
