# 🚀 EMAIL VERIFICATION FIX - QUICK REFERENCE CHEATSHEET

## ✅ THE FIX IN 30 SECONDS

### Problem
```
Email tidak terkirim → Variable names salah (SMTP_* vs EMAIL_*)
```

### Solution
```
Update .env:
- SMTP_HOST → EMAIL_HOST ✅
- SMTP_PORT → EMAIL_PORT ✅
- SMTP_USER → EMAIL_USER ✅
- SMTP_PASS → EMAIL_PASSWORD ✅
```

### Result
```
Email terkirim! 🎉
```

---

## 🎯 3-STEP QUICK START

### 1️⃣ Edit `.env`
```dotenv
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="app-password-16-char"
EMAIL_FROM="Kinote <noreply@kinote.app>"
```

### 2️⃣ Restart Server
```bash
npm run dev
```

### 3️⃣ Test
```bash
# 1. Register at http://localhost:3001/register
# 2. Check email inbox
# 3. Enter verification code
# 4. Login → Success! ✅
```

---

## 📧 GET GMAIL APP PASSWORD

1. https://myaccount.google.com/security → Enable 2FA
2. https://myaccount.google.com/apppasswords
3. Mail + Your Device
4. Copy 16-char password → paste to `.env`

---

## 🧪 TEST EMAIL CONFIG

```bash
node test-email-config.mjs
```

**Success output:**
```
✅ SMTP connection verified successfully!
```

---

## 🌐 DEPLOY TO RAILWAY

1. Railway Dashboard → Variables
2. Add variables (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, etc.)
3. `git push origin main`
4. Done! 🎉

---

## 🐛 QUICK TROUBLESHOOTING

| Problem | Solution |
|---|---|
| Email not sent | Restart server: `npm run dev` |
| SMTP error | Check `.env` variables are correct |
| Invalid login | Use Gmail App Password, not regular password |
| Code expired | Verify within 10 minutes |
| Email in Spam | Mark as "Not Spam" |

---

## 📝 KEY FILES

| File | Purpose |
|---|---|
| `.env` | Configuration (YOU UPDATE THIS) |
| `src/lib/mailer.ts` | Email sender |
| `src/app/api/auth/register/route.ts` | Registration endpoint |
| `PANDUAN_EMAIL_VERIFIKASI.md` | Full guide (Indonesian) |
| `test-email-config.mjs` | Test script |

---

## ✅ VERIFICATION CHECKLIST

- [ ] `.env` updated with EMAIL_* variables
- [ ] EMAIL_USER filled with your Gmail
- [ ] EMAIL_PASSWORD filled with app password
- [ ] Server restarted
- [ ] Test registration works
- [ ] Email received
- [ ] Verification successful
- [ ] Login works
- [ ] Railway variables set
- [ ] Production tested

---

## 🎓 EMAIL FLOW (SIMPLIFIED)

```
Register → Email Sent → User Verifies → Creates Account → Login ✅
```

**Key Point:** Without the fix, "Email Sent" fails.

---

## 📞 NEED HELP?

- 📖 Full guide: `PANDUAN_EMAIL_VERIFIKASI.md`
- 📖 Technical: `EMAIL_VERIFICATION_FIX.md`
- 📖 Summary: `EMAIL_VERIFICATION_QUICK_FIX.md`
- 🧪 Test: `node test-email-config.mjs`
- 💬 Logs: Watch console when `npm run dev`

---

**Last Updated:** December 2, 2025  
**Status:** ✅ Ready to Use
