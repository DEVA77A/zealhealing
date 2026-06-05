# ZEAL HEALING - Tarot Appointment Booking Platform

## Overview
A production-ready full-stack web application built for the ZEAL HEALING Tarot Appointment Booking Platform. It features a premium, responsive UI for booking tarot sessions, managing appointments, secure authentication, processing payments (Razorpay, Google Pay QR, Manual), and generating automated PDF invoices.

## Technology Stack
*   **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Axios, React Router, React Toastify, React Icons
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB Atlas & Mongoose ODM
*   **Authentication:** JWT, bcryptjs
*   **Payment Gateway:** Razorpay SDK
*   **PDF Generation:** PDFKit

## Environment Variables (.env)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zealhealing?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## Running Locally

1. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

2. **Start Development Servers**
   ```bash
   # Start Backend (from backend directory)
   node server.js

   # Start Frontend (from frontend directory)
   npm run dev
   ```

## Deployment Guide

### Deploying Frontend to Vercel
1. Push the repository to GitHub.
2. Log in to Vercel and import the repository.
3. Select the `frontend` folder as the Root Directory.
4. Vercel will automatically detect Vite and configure the build settings (`npm run build`, `dist`).
5. Deploy.

### Deploying Backend to Render
1. Log in to Render and create a new "Web Service".
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `node server.js`.
6. Add the Environment Variables under the "Environment" tab (matching the `.env` example above).
7. Deploy.
8. **Note:** Once the backend is deployed, you must update all frontend API calls (e.g., `http://localhost:5000/api/...`) to use the new Render URL. This can be configured globally using an Axios instance or an environment variable `VITE_API_URL` in the frontend.
