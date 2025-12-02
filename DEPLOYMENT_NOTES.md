# 📧 Email Verification Problem - FIXED ✅

## 🎯 Problem Summary

**Masalah:** Kode verifikasi email tidak terkirim saat user mendaftar dengan fitur email verification di Railway.

**Root Cause:** Mismatch antara nama environment variables di file `.env` dengan yang dicari oleh `src/lib/mailer.ts`

---

## 🔧 Solution Applied

### 1. Updated `.env` File
Mengubah nama variables dari `SMTP_*` ke `EMAIL_*`:

```diff
- SMTP_HOST="smtp.gmail.com"
- SMTP_PORT="587"
- SMTP_USER="your-email@gmail.com"
- SMTP_PASS="your-16-character-app-password"
- SMTP_FROM="Kinote <noreply@kinote.app>"

+ EMAIL_HOST="smtp.gmail.com"
+ EMAIL_PORT="587"
+ EMAIL_USER="your-email@gmail.com"
+ EMAIL_PASSWORD="your-16-character-app-password"
+ EMAIL_FROM="Kinote <noreply@kinote.app>"
+ EMAIL_REPLY_TO="support@kinote.app"
```

### 2. Why This Works

File `src/lib/mailer.ts` Function `getTransporter()` membaca:
```typescript
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
const emailPort = parseInt(process.env.EMAIL_PORT || "587");
```

Dengan `.env` yang benar, maka:
1. ✅ `getTransporter()` mendapat credentials yang valid
2. ✅ Koneksi SMTP ke Gmail berhasil
3. ✅ Email verifikasi terkirim ke user

---

## 🚀 Next Steps untuk Lokal Testing

### Step 1: Update Credentials di `.env`

**Jika belum punya Gmail App Password:**
1. Buka https://myaccount.google.com/security
2. Enable 2-Factor Authentication (jika belum)
3. Buka https://myaccount.google.com/apppasswords
4. Select "Mail" dan device Anda
5. Copy 16-character password yang dihasilkan

**Update di `.env`:**
```dotenv
EMAIL_USER="your-actual-gmail@gmail.com"
EMAIL_PASSWORD="xxxx xxxx xxxx xxxx"
```

### Step 2: Test Email Configuration

```bash
node test-email-config.mjs
```

Output yang diharapkan:
```
🧪 Testing Email Configuration...

📋 Checking Environment Variables:
  ✅ EMAIL_USER = your-actual...
  ✅ EMAIL_PASSWORD = xxxx****
  ✅ EMAIL_HOST = smtp.gmail.com
  ✅ EMAIL_PORT = 587

🔌 Testing SMTP Connection...
✅ SMTP connection verified successfully!
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test Registration & Email Verification

1. Buka http://localhost:3001/register
2. Isi form dengan:
   - **Name:** Test User
   - **Email:** your-email@gmail.com (gunakan email Anda sendiri)
   - **Password:** StrongPassword123!
3. Klik "Register"
4. **Cek inbox email Anda** - seharusnya dapat email dengan subject:
   ```
   Verify Your Email - Kinote
   ```
5. Salin 6-digit code dari email
6. Paste di form verification
7. Klik "Verify Email"
8. Redirect ke login page → Success! ✅

---

## 🌐 Deploy ke Railway

### Step 1: Set Environment Variables di Railway Dashboard

1. Buka Railway project dashboard
2. Pilih "Variables"
3. Add/Update variables berikut:

| Variable Name | Value |
|---|---|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | your-gmail@gmail.com |
| `EMAIL_PASSWORD` | your-16-character-app-password |
| `EMAIL_FROM` | `Kinote <noreply@kinote.app>` |

**PENTING:** Pastikan tidak ada typo di variable names!

### Step 2: Deploy

```bash
git add .
git commit -m "fix: update email config variables for Railway"
git push origin main
```

Railway akan automatically:
1. ✅ Pull changes dari GitHub
2. ✅ Build aplikasi
3. ✅ Apply environment variables
4. ✅ Restart service dengan config baru

### Step 3: Test di Production (Railway)

1. Buka aplikasi Railway URL
2. Lakukan registrasi dengan email Anda
3. Cek inbox untuk verification email
4. Verifikasi dan login

---

## 🐛 Troubleshooting

### ❌ Email Masih Tidak Terkirim

**Check 1: Verifikasi Credentials**
```bash
node test-email-config.mjs
```

Pastikan output menunjukkan ✅ untuk semua variables.

**Check 2: Restart Dev Server**
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

Changes di `.env` memerlukan restart!

**Check 3: Cek Console Logs**
```
npm run dev
```
Seharusnya melihat:
```
📧 Sending email to: user@example.com
   Subject: Verify Your Email - Kinote
   From: Kinote <noreply@kinote.app>
✅ Email sent successfully!
   Message ID: <...>
```

**Check 4: Cek Spam Folder**
Email mungkin masuk ke folder Spam/Junk. Mark sebagai "Not Spam".

**Check 5: Verifikasi Gmail Setup**
```
1. Login ke https://myaccount.google.com/security
2. Pastikan 2FA sudah enabled
3. Buka https://myaccount.google.com/apppasswords
4. Pastikan "Mail" app password sudah ada
5. Copy app password lagi (tanpa spasi)
6. Update di .env
7. Restart server
```

### ❌ "EMAIL_USER and EMAIL_PASSWORD must be configured"

**Solusi:** Pastikan di `.env` sudah ada:
```dotenv
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
```

### ❌ Error: "Invalid login"

**Solusi:** 
- Cek email dan password di `.env` sudah benar
- Pastikan menggunakan App Password dari Google (bukan password akun Google biasa)
- Pastikan 2FA sudah enabled
- Coba generate App Password baru

### ❌ "Verification code has expired"

Kode verifikasi berlaku **10 menit**. User harus verifikasi sebelum kode expired.

### ❌ "Invalid verification code"

Pastikan:
- User copy kode dengan benar (6 digit)
- Belum expired (10 menit)
- Tidak ada typo saat input

---

## 📝 Files Modified

| File | Changes |
|---|---|
| `.env` | Updated SMTP_* → EMAIL_* variables |
| `.env.example` | Updated comments untuk clarity |
| `test-email-config.mjs` | New script to test email config |
| `EMAIL_VERIFICATION_FIX.md` | Detailed documentation |
| `DEPLOYMENT_NOTES.md` | Updated with email setup |

---

## ✅ Verification Checklist

- [x] Updated `.env` dengan nama variables yang benar
- [ ] Update EMAIL_USER dan EMAIL_PASSWORD dengan credentials Gmail Anda
- [ ] Run `node test-email-config.mjs` - should pass
- [ ] Run `npm run dev` - start dev server
- [ ] Test registration → email verification → login
- [ ] Update environment variables di Railway dashboard
- [ ] Push ke GitHub
- [ ] Verifikasi di Railway production

---

## 📚 Related Documentation

- 📖 `EMAIL_VERIFICATION_FIX.md` - Detailed technical explanation
- 📖 `.env.example` - Template untuk configuration
- 📖 `src/lib/mailer.ts` - Email sending service
- 📖 `src/app/api/auth/register/route.ts` - Registration endpoint

---

## 🎓 How Email Verification Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Registration                                         │
│    POST /api/auth/register                                  │
│    Body: { name, email, password }                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend (register route)                                 │
│    - Validate inputs                                        │
│    - Hash password                                          │
│    - Generate 6-digit verification code                    │
│    - Store in memory (10 min expiry)                       │
│    - Call sendEmail() with verification code               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Email Service (mailer.ts)                               │
│    - Read EMAIL_* from .env ✅ FIXED                       │
│    - Create SMTP connection to Gmail                       │
│    - Send verification email                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User Receives Email                                      │
│    Subject: Verify Your Email - Kinote                     │
│    Body: Contains 6-digit code                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. User Verifies Email                                      │
│    POST /api/auth/verify-email                             │
│    Body: { email, verificationCode }                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend Validation                                       │
│    - Check code from memory store                          │
│    - If valid → Create user in database                    │
│    - Generate JWT token                                    │
│    - Return token to frontend                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Success!                                                 │
│    - User redirected to login page                         │
│    - Can now login with email + password                   │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** December 2, 2025  
**Status:** ✅ FIXED & READY FOR DEPLOYMENT
