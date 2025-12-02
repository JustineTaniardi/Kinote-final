# Implementasi Wajib Input Deskripsi dan Upload Gambar pada End Streak Session

## 📋 Ringkasan Fitur

Ketika user menyelesaikan streak session dengan menekan tombol "Finish" pada timer, user **wajib** untuk:
1. ✅ Memasukan deskripsi (apa yang dilakukan selama streak) - minimum 10 karakter
2. ✅ Upload gambar/foto - format PNG, JPG, GIF, max 5MB

Semua data ini akan **mandatory** dan tidak bisa dilewati. Data akan disimpan ke tabel `StreakHistory` di database.

## 🏗️ Perubahan yang Dilakukan

### 1. **API Endpoint - Validasi Submit** 
   - **File**: `src/app/api/streaks/[id]/submit/route.ts`
   - **Perubahan**: 
     - Menambahkan validation untuk memastikan `description` dan `photoUrl` wajib diisi
     - Menambahkan error handling jika salah satu field kosong
     - Trim dan validasi data sebelum menyimpan ke database

### 2. **Komponen Modal Baru - SessionDetailsModal**
   - **File**: `src/app/components/SessionDetailsModal.tsx`
   - **Fitur**:
     - Form input untuk deskripsi dengan minimum 10 karakter
     - File picker untuk upload gambar (PNG, JPG, GIF, max 5MB)
     - Preview gambar yang dipilih
     - Form validation dengan error messages
     - Loading state saat submit
     - Toast notifications untuk success/error

### 3. **Update StreakContent Component**
   - **File**: `src/app/components/StreakContent.tsx`
   - **Perubahan**:
     - Mengganti import dari `StreakCompletionModal` menjadi `SessionDetailsModal`
     - Menambahkan state `sessionDetailsOpen` dan `completionHistoryId`
     - Update `handleFinishTimer()` untuk:
       - Menangkap `historyId` dari response API `complete-session`
       - Menampilkan `SessionDetailsModal` alih-alih `StreakCompletionModal`

## 🔄 Flow Implementasi

```
1. User selesai dengan Streak Timer
   ↓
2. Timer modal tertutup
   ↓
3. API `/api/streaks/{id}/complete-session` dipanggil
   - Membuat record di StreakHistory dengan endTime kosong
   - Mengembalikan historyId
   ↓
4. SessionDetailsModal terbuka secara otomatis
   ↓
5. User wajib mengisi:
   - Deskripsi (min 10 karakter)
   - Upload gambar (PNG/JPG/GIF, max 5MB)
   ↓
6. User klik "Submit"
   ↓
7. Validation di SessionDetailsModal:
   - Check description tidak kosong dan >= 10 char
   - Check photo sudah dipilih
   ↓
8. API POST `/api/streaks/{id}/submit` dipanggil dengan:
   {
     "historyId": number,
     "description": string,
     "photoUrl": string (base64 atau URL)
   }
   ↓
9. API `/submit` melakukan validation KEDUA:
   - description tidak boleh kosong
   - photoUrl tidak boleh kosong
   ↓
10. Data disimpan ke database (StreakHistory table)
    ↓
11. Modal tertutup, user melihat success message
    ↓
12. Streak count di-refresh
```

## 📊 Data yang Tersimpan di Database

Setelah submit berhasil, data di tabel `StreakHistory` akan terisi:

```sql
INSERT INTO StreakHistory (
  streakId,           -- ID dari streak yang sedang dijalankan
  userId,             -- ID user yang melakukan streak
  title,              -- Judul streak
  description,        -- WAJIB: Deskripsi yang diinput user
  startTime,          -- Waktu mulai session
  endTime,            -- Waktu selesai session
  duration,           -- Total durasi (minutes)
  focusDuration,      -- Focus time (seconds)
  totalBreakTime,     -- Total break time (seconds)
  photoUrl,           -- WAJIB: URL/base64 gambar yang diupload
  verifiedAI,         -- Default: false
  aiNote,             -- AI verification note (opsional)
  breakSessions,      -- JSON data break sessions
  createdAt           -- Timestamp pembuatan
)
VALUES (...)
```

## 🛠️ Cara Kerja SessionDetailsModal

### Props yang Diterima:
```typescript
interface SessionDetailsModalProps {
  isOpen: boolean;              // Modal terbuka/tutup
  onClose: () => void;          // Callback saat modal ditutup
  streakId: number;             // ID streak
  historyId: number;            // ID history record yang baru dibuat
  streakTitle: string;          // Judul streak untuk ditampilkan
  onSubmitSuccess?: () => void; // Callback setelah submit sukses
}
```

### Features:
- ✅ Textarea input untuk deskripsi dengan character counter
- ✅ Drag-and-drop atau click untuk upload gambar
- ✅ Preview gambar sebelum submit
- ✅ File validation (type & size)
- ✅ Form validation sebelum submit
- ✅ Loading state saat submit
- ✅ Error handling dengan toast notifications
- ✅ Disable submit button saat loading

## ⚠️ Validation Rules

### Client-side (SessionDetailsModal):
```
Description:
- Required (tidak boleh kosong)
- Minimum 10 karakter
- Maximum unlimited

Photo:
- Required (wajib upload)
- Format: image/* (PNG, JPG, GIF)
- Max size: 5MB
- Preview sebelum submit
```

### Server-side (API /submit):
```
description:
- Required (tidak boleh kosong atau hanya whitespace)
- Akan di-trim sebelum disimpan

photoUrl:
- Required (tidak boleh kosong atau hanya whitespace)
- Akan di-trim sebelum disimpan
```

## 🧪 Testing

Untuk test flow ini:

1. **Buka halaman Streak**
2. **Pilih activity dan klik "Start" pada timer**
3. **Tunggu timer jalan, kemudian klik "Finish"**
4. **Modal timer akan tertutup**
5. **SessionDetailsModal akan terbuka secara otomatis** ✨
6. **Input deskripsi (min 10 karakter) dan upload gambar**
7. **Klik "Submit"**
8. **Verifikasi di database bahwa data tersimpan dengan benar**

## 📝 SQL Query untuk Verifikasi

```sql
-- Lihat semua streak history dengan deskripsi dan foto
SELECT 
  id,
  streakId,
  userId,
  title,
  description,
  photoUrl,
  startTime,
  endTime,
  duration,
  createdAt
FROM StreakHistory
WHERE description IS NOT NULL 
  AND photoUrl IS NOT NULL
ORDER BY createdAt DESC
LIMIT 10;
```

## 🎯 Next Steps (Optional Enhancements)

1. **Image Optimization**: Compress gambar sebelum upload
2. **Cloud Storage**: Upload gambar ke cloud (S3, Cloudinary) instead of base64
3. **AI Verification**: Implementasi AI verification untuk detect apakah gambar sesuai dengan activity
4. **Gamification**: Badges/points untuk completed sessions dengan foto
5. **Image Gallery**: Tampilkan galeri foto untuk setiap streak

---

✅ **Fitur sudah siap digunakan!**
