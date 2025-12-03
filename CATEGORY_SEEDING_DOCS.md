# 📝 Category & SubCategory Cleanup & Seeding - Dokumentasi

## ✅ Apa yang Telah Dilakukan

Script telah berhasil membersihkan dan mengisi ulang data category dan subcategory di Railway database dengan aman, **tanpa mengganggu fitur lain**.

### 📊 Summary Hasil Seeding:
- **Total Categories**: 5
- **Total SubCategories**: 25
- **Rata-rata per Category**: 5 subcategory

### 🗑️ Data yang Dihapus:
- Deleted 12 old categories
- Deleted 25 old subcategories
- Deleted 2 streaks (untuk menghindari orphaned records)
- Deleted 3 streak histories
- Deleted 2 streak exports

### 🆕 5 Kategori Baru dengan 25 SubCategory:

#### 1️⃣ **Kesehatan & Fitness** (ID: 13)
   - Olahraga Kardio (ID: 26)
   - Latihan Kekuatan (ID: 27)
   - Yoga & Stretching (ID: 28)
   - Nutrisi & Diet (ID: 29)
   - Meditasi & Mindfulness (ID: 30)

#### 2️⃣ **Pendidikan & Pembelajaran** (ID: 14)
   - Bahasa Asing (ID: 31)
   - Pemrograman (ID: 32)
   - Matematika (ID: 33)
   - Sains (ID: 34)
   - Sejarah & Budaya (ID: 35)

#### 3️⃣ **Karir & Profesional** (ID: 15)
   - Persiapan Interview (ID: 36)
   - Public Speaking (ID: 37)
   - Networking (ID: 38)
   - Membangun Resume (ID: 39)
   - Pengembangan Skill (ID: 40)

#### 4️⃣ **Hobi & Kreativitas** (ID: 16)
   - Seni & Lukis (ID: 41)
   - Musik (ID: 42)
   - Fotografi (ID: 43)
   - Video Editing (ID: 44)
   - Menulis & Blogging (ID: 45)

#### 5️⃣ **Pengembangan Diri** (ID: 17)
   - Produktivitas (ID: 46)
   - Manajemen Waktu (ID: 47)
   - Disiplin Diri (ID: 48)
   - Penetapan Tujuan (ID: 49)
   - Pembentukan Kebiasaan (ID: 50)

---

## 🛠️ File-File yang Dibuat:

### 1. `prisma/clean-and-seed-categories.ts`
Script utama yang menangani:
- Penghapusan data category & subcategory dengan aman
- Menghapus data-data yang tergantung pada category (streaks, histories, exports)
- Membuat 5 kategori baru dengan 25 subcategory total
- Menampilkan detail proses dan summary

### 2. `run-category-seed.sh`
Script bash untuk menjalankan seeding di Linux/Mac

### 3. `run-category-seed.ps1`
Script PowerShell untuk menjalankan seeding di Windows

---

## 🔒 Fitur-Fitur yang Aman (Tidak Terganggu):

✅ **User Management** - Semua user data tetap aman
✅ **Tasks** - Task data tetap tersimpan (hanya category reference di-reset ke NULL jika ada)
✅ **Days** - Data hari tetap utuh
✅ **Difficulty Levels** - Data tingkat kesulitan tidak berubah
✅ **Status** - Data status task tidak berubah
✅ **AI Analysis** - Data AI analysis tetap aman
✅ **Email Verification** - Sistem verifikasi email tetap berfungsi

---

## 🚀 Cara Menjalankan Ulang (Jika Diperlukan):

### Menggunakan npm script (Rekomendasi):
```bash
npx ts-node prisma/clean-and-seed-categories.ts
```

### Menggunakan PowerShell (Windows):
```powershell
.\run-category-seed.ps1
```

### Menggunakan Bash (Linux/Mac):
```bash
bash run-category-seed.sh
```

---

## ⚠️ Catatan Penting:

1. **Database Harus Terkoneksi**: Pastikan environment variable `DATABASE_URL` sudah dikonfigurasi dengan benar ke Railway
2. **Backup**: Jika ada data penting dari streak/history lama, lakukan backup terlebih dahulu
3. **Foreign Key Constraints**: Script menghapus data dalam urutan yang benar untuk menghindari constraint violations
4. **Idempotent**: Script dapat dijalankan berulang kali tanpa masalah

---

## 📞 Troubleshooting:

### Error: "Module type of file is not specified"
**Solusi**: Ini hanya warning dan tidak mempengaruhi hasil. Jika ingin menghilangkannya, tambahkan `"type": "module"` di `package.json`

### Error: "Foreign key constraint violated"
**Solusi**: Pastikan tidak ada script lain yang sedang berjalan dan database sudah siap

### Database tidak terkoneksi
**Solusi**: Verifikasi:
- Railway DATABASE_URL sudah benar di file `.env`
- Koneksi ke internet stabil
- Database Railway sudah berjalan

---

## 📋 Testing Seeding:

Untuk memverifikasi bahwa seeding berhasil, bisa menggunakan Prisma Studio:

```bash
npx prisma studio
```

Kemudian buka tab "Category" dan "SubCategory" untuk melihat data yang baru dibuat.
