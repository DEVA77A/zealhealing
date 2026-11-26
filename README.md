# ZEAL HEALING - Tarot Appointment Booking Platform

## Overview
A full-stack application for booking tarot sessions, managing appointments, and paying online with Razorpay. Captured payments generate PDF invoices automatically.

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

## Online payments and confirmations

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the backend environment. Use Razorpay test keys locally. Enable automatic payment capture in Razorpay and subscribe to `payment.captured` at the public backend URL `/api/payment/webhook`. Set `RAZORPAY_WEBHOOK_SECRET` to the signing secret configured for that endpoint. Localhost can verify the checkout callback directly.

For confirmation emails with the PDF attached, set `EMAIL_USER` and `EMAIL_PASS` for the mail provider, and set `EMAIL_SERVICE` if it differs from the default Gmail service.

For mobile confirmations, set `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID`, and `WHATSAPP_PAYMENT_TEMPLATE`. The approved utility template must use a document header and a static body such as “Your Zeal Healing payment is confirmed. We will confirm your appointment slot within 2–3 days. Your invoice is attached.” Set `WHATSAPP_PAYMENT_LANGUAGE` to the approved template language code if it differs from `en`. The invoice goes to the WhatsApp number entered during checkout.

Booking Management shows the Razorpay order and payment IDs, capture time, invoice, and confirmation dispatch status. Captured payments waiting for a session time remain in the booking queue.

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
