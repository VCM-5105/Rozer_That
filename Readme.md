# RozerThat

RozerThat is a full-stack web platform designed for defence aspirants preparing for competitive examinations such as NDA, CDS, AFCAT, CAPF, INET, Agniveer, TES, and other Indian Armed Forces recruitment exams.

The platform provides structured study resources, previous year question papers, mock tests, quizzes, current affairs, and personalized progress tracking. It is inspired by the learning experience of Take U Forward while being tailored specifically for defence examinations.

---

## Features

### Public Access

Users can browse the platform without creating an account.

- Defence examination notifications
- Study sheets
- Previous year question papers
- Daily current affairs
- Daily motivational quote
- Quiz catalog
- Search across resources

### Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Secure Password Hashing

### Student Dashboard

After login, students can

- Track completed topics
- Monitor subject-wise progress
- View mock test history
- View quiz history
- Maintain study streak
- Save personal notes
- Continue learning from the last visited topic

### Study Sheets

Military-themed structured learning paths.

Examples include

- Officer's Roadmap
- Mission NDA
- Operation CDS
- Falcon AFCAT
- Warrior Revision Sheet
- Final Assault Sheet

Each topic supports

- Completion tracking
- Personal notes
- Revision count
- Difficulty level

### Mock Tests

- Timed Tests
- Performance Tracking
- Result History
- Accuracy Analysis

### Quiz System

- Subject-wise quizzes
- Score calculation
- Accuracy tracking
- Attempt history

### Previous Year Papers

- Exam-wise categorization
- Year-wise organization
- Download support

### Defence Notifications

- Latest recruitment updates
- Eligibility
- Age Limit
- Important Dates
- Official Links

### Daily Current Affairs

Categories include

- Defence
- National
- International
- Economy
- Science
- Sports
- Awards

### Admin Panel

Administrators can manage

- Users
- Notifications
- Study Sheets
- Topics
- Current Affairs
- Previous Year Papers
- Quizzes
- Mock Tests
- Daily Quotes

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- React Hook Form

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- Nodemailer

### Database

- SQLite

---

## Folder Structure

```
RozerThat
│
├── client
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   ├── hooks
│   │   ├── context
│   │   ├── services
│   │   ├── utils
│   │   └── App.jsx
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   └── server.js
│
├── database
│
├── docs
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/RozerThat.git
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

JWT_SECRET=your_secret_key

EMAIL_USER=your_email

EMAIL_PASS=your_password
```

---

## Planned Features

- Student Dashboard
- Bookmark Resources
- Personal Notes
- Study Streak
- Global Search
- Daily Goals
- Progress Analytics
- Mock Test Analysis
- Responsive Design
- Dark and Light Theme
- Admin Dashboard
- Role-Based Authorization

---

## Project Goals

- Build a production-ready full-stack application.
- Demonstrate frontend and backend development skills.
- Implement authentication and authorization.
- Design reusable React components.
- Follow clean project architecture.
- Build scalable REST APIs.
- Maintain a structured SQLite database.
- Create a responsive and accessible user experience.

---

## Learning Objectives

This project is built to strengthen practical knowledge in

- React
- Node.js
- Express.js
- SQLite
- REST API Development
- Authentication
- Authorization
- Database Design
- State Management
- Responsive UI Development
- Backend Architecture
- Full-Stack Application Development

---

## License

This project is developed for educational purposes and portfolio demonstration.