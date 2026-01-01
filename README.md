MERN Stack Movie Application: Role-Based Access Control

A full-stack MERN Movie Application with JWT authentication, role-based access control, admin management, and IMDb Top 250 movie data integration, built with scalability and performance in mind.

1) Tech Stack

Frontend
React.js (Vite)
Material-UI (Responsive UI)
React Router DOM
Axios

Backend
Node.js
Express.js
MongoDB Atlas
Redis + Bull Queue
JWT Authentication

Deployment
Frontend: Vercel
Backend: Railway
Database: MongoDB Atlas

2) Features
User

View IMDb Top 250 movies
Search movies by name or description
Sort by rating, release date, duration, or name
Pagination support
Secure JWT login

Admin

Add, edit, and delete movies
Protected admin-only routes
Role-based access control

3) Authentication & Security

JWT-based authentication
Middleware-protected API routes
Admin-only access for movie management


4) API Endpoints (Summary)

GET /api/movies – Get all movies
GET /api/movies/search – Search movies
GET /api/movies/sorted – Sort movies
POST /api/movies – Add movie (admin)
PUT /api/movies/:id – Edit movie (admin)
DELETE /api/movies/:id – Delete movie (admin)


5) Live URLs

Frontend (Vercel):
https://movie-application-three-tawny.vercel.app

Backend (Railway):
https://movieapplication-production-678a.up.railway.app

API Base URL:
https://movieapplication-production-678a.up.railway.app/api


6) Setup Instructions (Local)
Prerequisites

Node.js 
MongoDB Atlas account
Redis (local or Railway)

Git

1️⃣ Clone Repository
git clone https://github.com/rashmi-87/movie_application.git
cd movie_application

2️⃣ Backend Setup
cd backend
npm install


Create .env file:

PORT=5000
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

Start backend:

npm start

3️⃣ Frontend Setup
cd frontend
npm install


Create .env file:

VITE_API_URL=http://localhost:5000/api

Start frontend:

npm run dev

4️⃣ Access App

Frontend: http://localhost:5173

Backend API: http://localhost:5000/api


7) Screenshots

Login

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/40980872-cbbc-4997-9c78-d6fc03d79f23" />

Register

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/75f0df8d-d65f-4147-9686-e8fbf6b6636b" />

Home page
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/fdd50a23-b224-4c9c-9a9c-bcfc3ea190ba" />

Admin home page

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/3df07584-23e4-4832-8404-a7ce8ea1e74c" />

Add movie page
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/ef11b202-a5b1-4496-a228-4b5d9801ffca" />




