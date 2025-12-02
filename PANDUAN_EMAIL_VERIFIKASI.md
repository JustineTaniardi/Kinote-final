# 📧 PANDUAN PERBAIKAN EMAIL VERIFIKASI - STEP BY STEP

## 🎯 TL;DR (Terlalu Panjang; Tidak Dibaca)

**Masalah:** Email verifikasi tidak terkirim  
**Penyebab:** Nama environment variables salah  
**Solusi:** Ubah `SMTP_*` menjadi `EMAIL_*`  
**Status:** ✅ SUDAH DIPERBAIKI

---

## 🔧 STEP-BY-STEP TUTORIAL

### STEP 1: Update Email Credentials di `.env`

**Buka file `.env`** di root project:

Cari bagian email configuration dan update:

```dotenv
# BEFORE (❌ Salah)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Kinote <noreply@kinote.app>"

# AFTER (✅ Benar)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Kinote <noreply@kinote.app>"
EMAIL_REPLY_TO="support@kinote.app"
```

**PENTING:** Ubah nilai yang ada dengan:
- `EMAIL_USER` → masukkan email Gmail Anda (misal: yourname@gmail.com)
- `EMAIL_PASSWORD` → masukkan App Password (16 karakter dari Google)

---

### STEP 2: Dapatkan App Password dari Google (Jika Belum Ada)

Jika belum pernah buat App Password Google:

**2.1 Buka https://myaccount.google.com/security**
- Login dengan akun Gmail Anda
- Cari bagian "2-Step Verification"
- Jika belum enabled: Click "Enable 2-Step Verification"
  - Pilih metode verifikasi (biasanya via SMS)
  - Ikuti instruksi Google

**2.2 Buka https://myaccount.google.com/apppasswords**
- Pastikan sudah login
- Di dropdown "Select the app", pilih: **Mail**
- Di dropdown "Select the device", pilih: **Windows Computer** (atau device Anda)
- Click "Generate"
- Google akan menampilkan 16-character password
- **Copy password ini** (tanpa spasi)

Contoh: `abcd efgh ijkl mnop` → copy sebagai `abcdefghijklmnop`

**2.3 Update di `.env`**
```dotenv
EMAIL_USER="yourname@gmail.com"
EMAIL_PASSWORD="abcdefghijklmnop"
```

---

### STEP 3: Restart Development Server

Perubahan di `.env` membutuhkan restart server:

```bash
# 1. Stop current server (Ctrl+C di terminal)
# 2. Start ulang
npm run dev
```

Expected output:
```
> npm run dev

> kinote-web@0.1.0 dev
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3001

✓ Ready in 2.5s
```

---

### STEP 4: Test Email Configuration (OPTIONAL)

Untuk memastikan email config benar-benar jalan:

```bash
node test-email-config.mjs
```

**Expected output:**
```
🧪 Testing Email Configuration...

📋 Checking Environment Variables:
  ✅ EMAIL_USER = yourname@gmail.com
  ✅ EMAIL_PASSWORD = abcd****
  ✅ EMAIL_HOST = smtp.gmail.com
  ✅ EMAIL_PORT = 587

🔌 Testing SMTP Connection...
✅ SMTP connection verified successfully!
```

**Jika error:** Baca bagian "🐛 Troubleshooting" di bawah.

---

### STEP 5: Test Registration & Email Verification

Sekarang buka aplikasi dan test:

**5.1 Buka http://localhost:3001/register**

**5.2 Isi Form Registration:**
```
Name: Test User
Email: your-email@gmail.com (gunakan email pribadi Anda)
Password: StrongPassword123!
```

**5.3 Klik "Register"**

**5.4 Tunggu 2-3 detik dan CEK EMAIL ANDA**

Di inbox seharusnya ada email:
```
Subject: Verify Your Email - Kinote
Body: Contains 6-digit code (misal: 123456)
```

**Jika tidak dapat email:** Cek folder Spam/Junk

**5.5 Copy 6-digit code dari email**

**5.6 Kembali ke aplikasi dan paste code di field verification**

**5.7 Klik "Verify Email"**

Expected: ✅ Email verified! Redirect ke login page

**5.8 Login dengan email + password yang tadi**

Expected: ✅ Login berhasil! Redirect ke dashboard

**🎉 SUCCESS!**

---

## 🌐 DEPLOY KE RAILWAY

Setelah berhasil testing lokal, deploy ke Railway:

### STEP 1: Set Environment Variables di Railway Dashboard

1. Buka **Railway Project Dashboard**
2. Klik **Variables** tab
3. Add/Update variables berikut:

| Variable Name | Value |
|---|---|
| EMAIL_HOST | smtp.gmail.com |
| EMAIL_PORT | 587 |
| EMAIL_USER | your-email@gmail.com |
| EMAIL_PASSWORD | 16-character-app-password |
| EMAIL_FROM | Kinote <noreply@kinote.app> |

**PENTING:**
- Variable names harus TEPAT (case-sensitive di Railway)
- Jangan ada typo!
- EMAIL_PASSWORD adalah app password dari Google (bukan password akun regular)

### STEP 2: Push Code ke GitHub

```bash
git add .
git commit -m "fix: email verification - update environment variables"
git push origin main
```

### STEP 3: Tunggu Railway Deploy

Railway akan automatically:
1. Pull code terbaru dari GitHub
2. Build aplikasi
3. Apply environment variables
4. Restart service

Selesai! 🎉

---

### STEP 4: Test di Railway

1. Buka aplikasi Railway URL (misal: https://your-app.up.railway.app)
2. Lakukan registrasi dengan email Anda
3. Cek inbox - seharusnya dapat email verifikasi
4. Verifikasi → Login → Success! ✅

---

## 🐛 TROUBLESHOOTING

### ❌ Email Tidak Terkirim

**Solusi 1: Verifikasi Environment Variables**

Pastikan di `.env` sudah ada:
```bash
cat .env | grep EMAIL_
```

Output harus:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Solusi 2: Restart Dev Server**
```bash
# Stop: Ctrl+C
npm run dev
```

**Solusi 3: Test Email Config**
```bash
node test-email-config.mjs
```

Jika error, ikuti instruksi di output.

**Solusi 4: Cek Console Logs**

Saat register, di console seharusnya muncul:
```
📧 Sending email to: user@example.com
   Subject: Verify Your Email - Kinote
✅ Email sent successfully!
```

Jika tidak ada, berarti mailer tidak dipanggil atau error.

**Solusi 5: Cek Spam Folder**
```
Email mungkin masuk ke folder Spam
→ Buka folder Spam
→ Cari email dari "noreply@kinote.app"
→ Mark sebagai "Not Spam"
```

**Solusi 6: Generate App Password Baru**

Jika app password tidak bekerja:
1. Buka https://myaccount.google.com/apppasswords
2. Delete app password yang lama
3. Generate yang baru untuk "Mail"
4. Copy dan update di `.env`
5. Restart dev server

---

### ❌ Error: "EMAIL_USER and EMAIL_PASSWORD must be configured"

**Penyebab:** Variables tidak ditemukan atau kosong

**Solusi:**
```bash
# Buka .env dan pastikan ada:
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="app-password-16-char"

# Jangan ada:
SMTP_USER="..."
SMTP_PASS="..."
```

Setelah diubah, restart server:
```bash
npm run dev
```

---

### ❌ Error: "Invalid login" atau "Unauthorized"

**Penyebab:** Email atau app password salah

**Solusi:**
1. Pastikan menggunakan **App Password** (bukan password akun Google regular)
2. App password harus dari https://myaccount.google.com/apppasswords
3. Copy tanpa spasi
4. Pastikan 2FA sudah enabled
5. Update `.env` dan restart server

---

### ❌ "Verification code has expired"

**Penyebab:** User tidak verifikasi dalam 10 menit

**Solusi:** User harus registrasi lagi dan verifikasi lebih cepat

---

### ❌ "Invalid verification code"

**Penyebab:** Kode salah atau belum match

**Solusi:**
- Copy kode dari email dengan benar (6 digit)
- Pastikan belum expired (10 menit)
- Tidak ada typo saat input
- Refresh page jika perlu

---

## 📚 DOKUMENTASI LENGKAP

- 📖 `EMAIL_VERIFICATION_FIX.md` - Penjelasan teknis detail
- 📖 `DEPLOYMENT_NOTES.md` - Panduan deployment lengkap
- 📖 `EMAIL_VERIFICATION_QUICK_FIX.md` - Ringkasan cepat
- 📖 `.env.example` - Template configuration
- 📖 `test-email-config.mjs` - Test script

---

## ✅ CHECKLIST

- [ ] Update `.env` dengan `EMAIL_*` variables (bukan SMTP_*)
- [ ] Fill `EMAIL_USER` dengan email Gmail Anda
- [ ] Fill `EMAIL_PASSWORD` dengan 16-char app password dari Google
- [ ] Restart dev server: `npm run dev`
- [ ] Optional: Test dengan `node test-email-config.mjs`
- [ ] Register → Check email → Verify → Login
- [ ] Push ke GitHub
- [ ] Set environment variables di Railway dashboard
- [ ] Verifikasi di Railway production

---

## 🎯 SUMMARY

| Langkah | Status |
|---|---|
| Update `.env` | ✅ DONE |
| Setup Gmail App Password | ⏳ YOU DO THIS |
| Restart Dev Server | ⏳ YOU DO THIS |
| Test Registration | ⏳ YOU DO THIS |
| Deploy ke Railway | ⏳ YOU DO THIS |

---

**Pertanyaan?** Baca dokumentasi lengkap di file-file di atas atau hubungi developer support.

**Last Updated:** December 2, 2025  
**Status:** ✅ READY TO USE
