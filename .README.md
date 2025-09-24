# EduSoma - Learning Management System

![EduSoma](https://img.shields.io/badge/EduSoma-LMS-blue?style=for-the-badge&logo=education)
![Angular](https://img.shields.io/badge/Angular-20.0-red?style=for-the-badge&logo=angular)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)

## 🎯 About EduSoma

EduSoma is a comprehensive Learning Management System (LMS) designed to democratize education and make quality learning accessible to everyone, everywhere. Built with modern web technologies, it provides a robust platform for educational institutions, instructors, and students to engage in interactive learning experiences.

### 🚀 Mission

We believe that education is the foundation of progress and opportunity. Our mission is to break down barriers to learning and create a world where anyone, anywhere can access high-quality education that transforms their lives through engaging, interactive learning experiences that adapt to each student's unique needs and learning style.

## ✨ Key Features

### 👥 User Management
- **Multi-role System**: Support for Admin, Instructor, and Student roles
- **Secure Authentication**: JWT-based authentication with email verification
- **Password Reset**: Secure password recovery system
- **User Profiles**: Comprehensive user profiles with progress tracking

### 📚 Course Management
- **Course Creation**: Instructors can create and manage courses
- **Module Organization**: Structured course content with modules and materials
- **Multiple Content Types**: Support for videos, PDFs, images, text, and links
- **Categories & Difficulty Levels**: Organized course categorization and difficulty progression
- **Course Reviews**: Student feedback and rating system

### 🎓 Learning Experience
- **Progress Tracking**: Detailed progress monitoring for students
- **Video Progress**: Track video watching progress with resume functionality
- **Interactive Quizzes**: Multiple question types (MCQ, True/False, Short Answer)
- **Certificates**: Automated certificate generation upon course completion
- **Discussion Forums**: Course-specific discussion boards with voting system

### 📊 Analytics & Reporting
- **User Activity Tracking**: Comprehensive activity monitoring
- **Progress Analytics**: Detailed progress reports and insights
- **Quiz Performance**: Track quiz attempts and scores
- **Engagement Metrics**: Monitor student engagement levels

### 💬 Communication
- **Discussion Forums**: Course-specific discussion boards
- **Messaging System**: Direct messaging between users
- **Notifications**: Real-time notifications for various events
- **Email Integration**: Automated email notifications and course updates

### 🏆 Certification
- **Automated Certificates**: Generate certificates upon course completion
- **Verification System**: Unique verification codes for certificate authenticity
- **Multiple Certificate Types**: Completion, Achievement, and Participation certificates
- **PDF Generation**: Professional certificate PDFs with verification codes

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 20.0
- **Styling**: TailwindCSS
- **State Management**: Angular Services with RxJS
- **Routing**: Angular Router with Guards
- **HTTP Client**: Angular HttpClient with Interceptors

### Backend
- **Framework**: NestJS 11.0
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **File Storage**: Cloudinary integration
- **Email Service**: Nodemailer with Handlebars templates
- **PDF Generation**: PDFKit for certificates
- **API Documentation**: Swagger/OpenAPI

### Database
- **Primary Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

## 📁 Project Structure

```
edusoma-lms/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── users/      # User management
│   │   │   ├── courses/    # Course management
│   │   │   ├── enrollment/ # Course enrollment
│   │   │   ├── progress/   # Progress tracking
│   │   │   ├── quiz/       # Quiz system
│   │   │   ├── certificates/ # Certificate management
│   │   │   ├── discussions/ # Discussion forums
│   │   │   ├── analytics/  # Analytics and reporting
│   │   │   └── mail/       # Email services
│   │   ├── shared/         # Shared services and utilities
│   │   └── prisma/         # Database schema and migrations
├── frontend/               # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Reusable components
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # Angular services
│   │   │   ├── core/       # Core functionality
│   │   │   └── shared/     # Shared utilities
│   │   └── assets/         # Static assets
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for file storage)
- SMTP server (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edusoma-lms
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend (.env)
   DATABASE_URL="postgresql://username:password@localhost:5432/edusoma_lms"
   JWT_SECRET="your-jwt-secret"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
   CLOUDINARY_API_KEY="your-cloudinary-key"
   CLOUDINARY_API_SECRET="your-cloudinary-secret"
   SMTP_HOST="your-smtp-host"
   SMTP_PORT=587
   SMTP_USER="your-smtp-user"
   SMTP_PASS="your-smtp-password"
   ```

5. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npm run seed  # Optional: seed with sample data
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

## 👥 User Roles

### Admin
- Manage users and courses
- Access to analytics and reporting
- System configuration and maintenance
- Certificate management

### Instructor
- Create and manage courses
- Upload course materials
- Monitor student progress
- Engage in discussion forums
- Generate and manage certificates

### Student
- Enroll in courses
- Access course content
- Take quizzes and assessments
- Participate in discussions
- Track learning progress
- Download certificates

## 📊 Key Metrics

- **50,000+** Students Enrolled
- **500+** Expert Instructors
- **1,000+** Courses Available
- **95%** Satisfaction Rate

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linting
```

**Frontend:**
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### Database Management
```bash
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev # Run database migrations
npx prisma generate  # Generate Prisma client
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to submit pull requests, report issues, or suggest new features.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with love for the education community
- Special thanks to all contributors and beta testers
- Inspired by the mission to make education accessible to all

## 📞 Support

For support, email support@edusoma.com or join our community discussions.

---

**EduSoma** - Transforming education through technology 🌟
