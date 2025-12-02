# ✅ Email Verification Fix untuk Railway

## 🔍 Masalah yang Ditemukan

Kode verifikasi email **tidak terkirim** karena mismatch antara nama environment variables:

### ❌ Nama yang Dicari oleh Mailer
File `src/lib/mailer.ts` mencari:
```
- EMAIL_USER
- EMAIL_PASSWORD
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_FROM
```

### ❌ Nama di .env (Sebelumnya)
```
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
```

**Hasilnya:** `getTransporter()` tidak menemukan kredensial dan gagal mengirim email.

---

## ✅ Solusi - Update .env

Perbarui file `.env` dengan nama variables yang benar:

```dotenv
# Email Configuration (untuk mengirim email verifikasi)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"                    # ← Ganti dengan email Gmail Anda
EMAIL_PASSWORD="your-16-character-app-password"     # ← Ganti dengan App Password
EMAIL_FROM="Kinote <noreply@kinote.app>"
EMAIL_REPLY_TO="support@kinote.app"
```

---

## 📧 Setup Gmail untuk Mengirim Email

### Langkah 1: Enable 2-Factor Authentication (2FA)
1. Buka https://myaccount.google.com/security
2. Login dengan akun Gmail Anda
3. Cari "2-Step Verification"
4. Klik "Enable 2-Step Verification"
5. Ikuti instruksi untuk verifikasi nomor telepon

### Langkah 2: Generate App Password
1. Buka https://myaccount.google.com/apppasswords
2. Pastikan sudah login
3. Pilih "Mail" sebagai aplikasi
4. Pilih "Windows Computer" (atau perangkat Anda)
5. Google akan generate 16-character password
6. Copy password tersebut

### Langkah 3: Update .env
```env
EMAIL_USER="your-email@gmail.com"           # Email Gmail Anda
EMAIL_PASSWORD="XXXX XXXX XXXX XXXX"        # App Password yang baru (16 karakter, tanpa spasi)
```

---

## 🔧 Cara Kerja Email Verification

### 1. User Melakukan Registrasi
```
User → Register Form → POST /api/auth/register
```

### 2. Backend:
a. Validasi input (name, email, password)
b. Hash password dengan bcrypt
c. Generate 6-digit verification code
d. Store credentials di pending registrations (10 menit)
e. **Kirim email dengan kode verifikasi**
f. Return response ke frontend

### 3. User Verifikasi Email
```
User → Input 6-digit code → POST /api/auth/verify-email
```

### 4. Backend:
a. Verifikasi kode dari memory store
b. Jika valid → create user di database
c. Generate JWT token
d. User bisa login

---

## 🚀 Testing Email Verification

### Test Lokal (Development)
```bash
npm run dev
```

### Step 1: Register
1. Buka http://localhost:3001/register
2. Isi form:
   - Name: Test User
   - Email: test123@gmail.com (atau email pribadi Anda)
   - Password: StrongPassword123!
3. Klik "Register"
4. **Cek inbox email Anda** - seharusnya dapat email dengan kode verifikasi 6 digit

### Step 2: Verifikasi Email
1. Buka email dari Kinote
2. Copy kode 6-digit
3. Kembali ke aplikasi, paste kode di field verification
4. Klik "Verify Email"
5. Jika berhasil → redirect ke login page

### Step 3: Login
1. Masukkan email dan password yang didaftar
2. Login berhasil → redirect ke dashboard

---

## 🐛 Troubleshooting

### ❌ Email Tidak Terkirim

**Check 1: Verifikasi Environment Variables**
```bash
# Pastikan di .env Anda punya:
EMAIL_USER="xxx@gmail.com"
EMAIL_PASSWORD="xxxx xxxx xxxx xxxx"   # 16 karakter dari Google
```

**Check 2: Restart Dev Server**
Perubahan di `.env` memerlukan restart:
```bash
# Stop current process (Ctrl+C)
# Jalankan lagi
npm run dev
```

**Check 3: Cek Google App Password**
- Buka https://myaccount.google.com/apppasswords
- Pastikan app password sudah dibuat untuk "Mail"
- Password harus 16 karakter (tanpa spasi saat copy)

**Check 4: Cek Console Logs**
```
npm run dev
# Lihat console untuk log email:
# 📧 Sending email to: xxx@gmail.com
# Subject: Verify Your Email - Kinote
```

**Check 5: Cek Spam Folder**
- Email mungkin masuk ke folder Spam/Junk
- Mark sebagai "Not Spam"

### ❌ Kode Verifikasi Invalid
- Kode berlaku 10 menit
- Harus 6 digit
- Case-sensitive di frontend (tapi numeric-only input)

### ❌ "No pending registration found"
- Pastikan session/cookie tidak expired
- Lakukan registrasi lagi (generate new code)

---

## 📝 Files yang Terpengaruh

1. **`src/lib/mailer.ts`** - Email sender service
   - Baca environment variables EMAIL_*
   - Kirim email via Gmail SMTP

2. **`src/app/api/auth/register/route.ts`** - Register endpoint
   - Generate verification code
   - Call `sendEmail()` dari mailer

3. **`src/app/api/auth/verify-email/route.ts`** - Verify email endpoint
   - Validate verification code
   - Create user di database jika valid

4. **`.env`** - Configuration (SUDAH DIUPDATE)
   - Berisi EMAIL_* credentials

5. **`src/lib/emailTemplates.ts`** - Email template
   - HTML template untuk verification email

---

## 🔐 Security Notes

- ❌ **Jangan** commit `.env` ke Git (sudah di `.gitignore`)
- ❌ **Jangan** share credentials dengan siapa pun
- ✅ Verification code hanya berlaku 10 menit
- ✅ Credentials di Railway harus di-set via Environment Variables panel

---

## 🚀 Deploy ke Railway

1. Setup environment variables di Railway dashboard:
   - EMAIL_HOST = smtp.gmail.com
   - EMAIL_PORT = 587
   - EMAIL_USER = your-email@gmail.com
   - EMAIL_PASSWORD = your-16-character-app-password
   - EMAIL_FROM = Kinote <noreply@kinote.app>

2. Deploy aplikasi (push ke GitHub)

3. Railway akan automatically restart dengan variables baru

---

## ✅ Checklist

- [ ] Update `.env` dengan EMAIL_* variables
- [ ] Generate App Password dari Google (https://myaccount.google.com/apppasswords)
- [ ] Copy App Password ke EMAIL_PASSWORD di `.env`
- [ ] Restart dev server (`npm run dev`)
- [ ] Test register → check email → verify → login
- [ ] Set environment variables di Railway dashboard
- [ ] Deploy ke Railway

---

**Last Updated:** December 2, 2025
**Status:** ✅ Fixed
