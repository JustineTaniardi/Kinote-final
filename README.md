# Kinote - Full Stack Application

A comprehensive task and streak tracking application with AI-powered analysis built with Next.js and Prisma.

## Features

- 📝 Task Management
- 🔥 Streak Tracking
- 🤖 AI-Powered Analysis
- 📧 Email Notifications
- 🔐 JWT Authentication
- 📅 Calendar Integration

## Tech Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT
- **Email**: Nodemailer
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL Server
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Kinote
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy `.env.example` to `.env` and update the values:

   ```bash
   cp .env.example .env
   ```

   **Required environment variables:**

   - `DATABASE_URL`: MySQL connection string
   - `NODE_ENV`: Environment (development/production/staging)
   - `JWT_SECRET`: Secret key for JWT token signing
   - `OPENAI_API_KEY`: Your OpenAI API key for AI features
   - `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com)
   - `SMTP_PORT`: SMTP server port (e.g., 587)
   - `SMTP_USER`: Email address for sending emails
   - `SMTP_PASS`: Email password or app-specific password
   - `SMTP_FROM`: Sender email format (e.g., "Kinote <noreply@kinote.app>")
   - `APP_URL`: Base URL of your application (e.g., http://localhost:3000)

4. **Database Setup**

   ```bash
   npm run db:migrate:dev
   ```

   This will:

   - Apply all pending migrations
   - Generate/update Prisma Client
   - Create/sync your database schema

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Email Configuration

### Using Gmail

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:

   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to "App passwords"
   - Select Mail and Windows Computer (or your device)
   - Copy the generated 16-character password

3. Update `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=Kinote <noreply@kinote.app>
   ```

### Using Other Email Services

For other SMTP providers, update the `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` accordingly.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify?token=<token>` - Verify email address
- `GET /api/auth/me` - Get current user info

### Email Features

The application automatically sends emails for:

- **User Registration**: Verification email sent upon signup
- **Password Reset**: Reset link sent when user requests password reset

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── login/         # Login page
│   ├── register/      # Registration page
│   ├── streak/        # Streak tracking page
│   ├── todo/          # Todo management page
│   └── docs/          # API documentation
├── lib/
│   ├── prisma.ts      # Prisma client
│   ├── mailer.ts      # Email sending utility
│   └── emailTemplates.ts # Email HTML templates
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate:dev` - Run migrations in development mode
- `npm run db:migrate:deploy` - Deploy migrations to production
- `npm run db:migrate:reset` - Reset database (⚠️ deletes all data)
- `npm run db:migrate:status` - Check migration status
- `npm run db:generate` - Generate/update Prisma Client
- `npm run db:studio` - Open Prisma Studio (visual database browser)

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

### Key Models

- **User**: User accounts and authentication
- **Task**: Task management
- **Streak**: Streak tracking
- **Category**: Task categories
- **Day**: Day of week tracking
- **AiAnalysis**: AI analysis results
- **AiVerification**: AI verification of streak activities

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository.
