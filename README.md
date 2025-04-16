# AI-powered talent-matching MVP

An AI-powered job and talent matching web application that helps employers find suitable candidates and provides job seekers with intelligent job suggestions based on their skills and experiences.

## Project Overview

- AI-based recommendation for both employers and candidates
- Four chatbot agents with different roles: CareerBot, SkillBot, MatchBot, JobWriterBot
- Resume and job analysis using LLM (OpenAI Chat API)
- Fully functional web system with front-end, back-end, and MySQL database

## Tech Stack

| Layer | Technology |Reason for choice|
|-------|------------|
| Frontend | React, Material UI, React Router | Quickly build responsive pages and components  |
| Backend | Node.js (Express), mysql2 | Simple routing structure for easy interface extensions |
| Database | MySQL | Easy to initialize to build tables and adapt sample data  |
| AI Service | OpenAI Chat API | Provides semantic understanding, text generation, and matching recommendation capabilities|

## AI Capabilities

| Bot | Function |
|-------|------------|
| CareerBot | Recommending jobs from resume |
| SkillBot | Skill enhancement advice |
| MatchBot | Recruiter looking for candidates |
| JobWriterBot | Help with recruiter write job descriptions job |

## Project Structure

AI-powered-talent-matching-MVP/
│
├── .cursor/                           # `Hackathon required helper folder`
│   └── README.md                      # `Hackathon required document`
│
├── backend/                           # `Backend codebase (Node.js + Express)`
│   ├── db/                            # Database connection and initialization
│   │   ├── `connect.js`               # ⚠️ Set `your local MySQL credentials` when deployment
│   │   └── initDatabase.js            # Auto-create tables & insert demo data
│   │
│   ├── routes/                        # API route definitions
│   │   ├── auth.js                    # Auth routes (login/register)
│   │   ├── jobRoutes.js               # Job-related endpoints
│   │   ├── messageRoutes.js           # Robot chat APIs
│   │   ├── openai-chat.js             # OpenAI API integration
│   │   ├── resumeRoutes.js            # Candidate resume-related endpoints
│   │   └── tools.js                   # Utility functions
│   │
│   ├── index.js                       # Entry point of backend
│   ├── package.json                   # Backend dependencies
│   ├── package-lock.json              # Dependency lock file
│   └── `.env`                         # ⚠️ Store `OPENAI_API_KEY`, must create manually when deployment
│
├── frontend/                          # `Frontend codebase (React)`
│   ├── public/                        # Static assets
│   │   ├── images/                    # Robot avatar picture
│   │   │   ├── careerbot.png
│   │   │   ├── jobwriter.png
│   │   │   ├── matchbot.png
│   │   │   └── skillbot.png         
│   │
│   ├── src/                           # Main application code
│   │   ├── components/                # Reusable UI components
│   │   ├── screens/                   # Page-level components
│   │   ├── App.js                     # Root React component
│   │   ├── AppRouter.jsx              # Route definitions
│   │   ├── index.js                 # React mount point
│   │   └── logo.png                   # Homepage Picture
│   │
│   ├── package.json                   # Frontend dependencies
│   └──  yarn.lock / package-lock.json # Dependency lock files
│
└── .gitignore                       # Git ignore rules

`Special Notes`
    1. Create an `backend/.env` and write the openai API Key to ensure API connectivity.
       Content Example:
                OPENAI_API_KEY=sk-xxxxxxxxxxxx
    2. Modify `backend/db/connect.js` to your MySQL host, username, password and database.
        Content Example:
            const pool = mysql.createPool({
                host: 'localhost',
                user: 'root',
                password: 'Your password',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
                });
        Make sure the MySQL service is started, the first run will automatically write the data table and example data.

## Install Dependencies
    # Frontend
        cd frontend
        npm install

    # Backend
        cd ../backend
        npm install

## Start Backend

    cd backend
        method1: node index.js
        method2: npm start
        method3: npm run dev

## Start Frontend

    cd frontend
        npm start

    Visit your browser at http://localhost:3000 to see the project in action.