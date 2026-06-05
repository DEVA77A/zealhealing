# ZEAL HEALING - Comprehensive Project Documentation

---

## 1. Introduction: What is ZEAL HEALING and What is it Used For?

**ZEAL HEALING** is a specialized, premium web-based platform designed specifically for booking and managing professional Tarot Card Reading sessions and related spiritual or healing consultations. 

**What is it used for?**
*   **For Clients (Users):** It serves as a secure, user-friendly portal where individuals seeking guidance can explore different tarot reading packages (e.g., 30-minute audio calls, 60-minute video sessions), view pricing dynamically adjusted to their geographical location, book an appointment, and make a secure online payment. After booking, they receive a professional, automated PDF invoice for their records.
*   **For the Healer/Admin (Business Owner):** It acts as a centralized business management dashboard. The owner can securely log in, track upcoming appointments, verify payment statuses, and manage their schedule without needing to rely on third-party, manual scheduling apps. It automates the entire funnel from package browsing to payment collection and invoicing.

In essence, ZEAL HEALING transforms a service-based consulting business into a fully automated digital storefront.

---

## 2. Technology Stack

This project is built using a modern **MERN (MongoDB, Express, React, Node.js)** stack, heavily augmented with specialized libraries for a premium experience.

### Frontend (Client-Side)
*   **React.js (v19):** Core framework for building the user interface.
*   **Vite:** Extremely fast build tool and development server.
*   **Tailwind CSS:** Utility-first CSS framework used for all responsive styling and layout.
*   **Framer Motion:** Animation library used for premium micro-animations and page transitions.
*   **React Router:** Handles seamless client-side routing.
*   **Axios:** Promise-based HTTP client used to communicate with the backend APIs.
*   **React Toastify:** Used for elegant, non-intrusive popup notifications.

### Backend (Server-Side)
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Fast, unopinionated web framework for Node.js to handle API routing.
*   **MongoDB & Mongoose:** NoSQL database used for flexible data modeling (Users, Bookings, Pricing). Mongoose acts as the Object Data Modeling (ODM) library.
*   **JWT (JSON Web Tokens):** Used for stateless, secure user authentication and session management.
*   **bcryptjs:** Cryptographic library used to securely hash and salt user passwords.
*   **Razorpay SDK:** Official Node.js SDK for secure payment processing.
*   **PDFKit:** Server-side library used to dynamically draw and generate PDF invoices.

---

## 3. Elaborate System Workflow: How the Project Works

The workflow of ZEAL HEALING is designed to provide a frictionless journey for the user while ensuring robust data validation and secure transaction processing in the background. Here is the step-by-step flow of how the platform operates:

### Phase 1: Discovery & Dynamic Pricing
1. **User Landing:** A user visits the website. The frontend (built with React and Vite) serves a highly responsive, aesthetically pleasing interface powered by Tailwind CSS and Framer Motion for smooth animations.
2. **Geo-Location & Pricing Engine:** As the user navigates to the "Sessions" or "Packages" page, the platform's `PricingContext` kicks in. 
    *   The system detects the user's country (often via an IP-based API or user selection).
    *   It fetches real-time exchange rates (via the backend `pricingRoutes`).
    *   Base prices, stored in INR (Indian Rupees), are dynamically converted into the user's local currency (e.g., USD, EUR, GBP) in real-time.

### Phase 2: Booking Selection & Data Collection
3. **Package Selection:** The user selects a specific tarot package, defining the `appointmentType` (e.g., General Reading, Love Reading), `callType` (Audio/Video), and `duration`.
4. **Checkout Form:** The user is redirected to the Checkout page. Here, they provide their contact details (Name, Email, Phone, Country). 
    *   *Smart Feature:* If the user is already authenticated (logged in), the platform pre-fills their details by reading their session token stored in local storage.
5. **Tax Calculation:** A live summary calculates the final cost, automatically appending a mandatory 5% GST (Goods and Services Tax) to the dynamically converted base price.

### Phase 3: Secure Payment Processing
6. **Payment Gateway Initiation:** The user proceeds to payment. The platform primarily utilizes the **Razorpay** payment gateway.
    *   The frontend sends a request to the backend `paymentController`.
    *   The backend securely communicates with Razorpay's API using secret keys to generate a unique `OrderID`.
7. **Client-Side Transaction:** Razorpay's secure payment modal opens on the user's screen. The user completes the payment using Credit/Debit Cards, UPI, or Net Banking.
8. **Payment Verification:** Once the transaction is complete, Razorpay sends a signature back to the backend. The backend uses the `crypto` library to mathematically verify the signature, ensuring the payment wasn't tampered with.

### Phase 4: Order Confirmation & Automated Invoicing
9. **Database Record Creation:** Upon successful payment verification, the backend `bookingController` creates a permanent record in the **MongoDB** database containing the user's details, the package selected, the converted amount paid, and the transaction ID.
10. **PDF Invoice Generation:** The backend immediately triggers the `invoiceController`.
    *   Using the `PDFKit` library, the server dynamically draws a professional PDF invoice. 
    *   This invoice includes the business logo, customer details, a breakdown of the base price, the calculated 5% GST, the final total, and the payment transaction ID.
11. **User Confirmation:** The frontend receives a success response, redirects the user to a "Success" page, and provides them with a link to download their generated PDF invoice.

### Phase 5: Administration & Management
12. **Admin Dashboard:** The business owner logs in using an Admin account (verified via a secure JWT token containing an admin flag).
13. **Data Retrieval:** The admin dashboard fetches all records from the database. The admin can see who booked, when they booked, what they paid, and what their contact details are, allowing the healer to prepare for the session.

---

## 4. In-Depth Technical Architecture & Flow

### Frontend Architecture (The Presentation Layer)
*   **Framework:** Built on **React.js (v19)** to create a Single Page Application (SPA). This ensures that navigating between pages (Home -> Packages -> Checkout) happens instantly without reloading the browser.
*   **Styling:** **Tailwind CSS** is used for utility-first styling, ensuring the website looks premium and is fully responsive on mobile phones, tablets, and desktops.
*   **State Management:** React Context API is used heavily. For instance, the `PricingContext` holds the global state for the user's currency and exchange rate, ensuring that the price shown on the package list matches the price shown at checkout.
*   **API Communication:** The frontend uses **Axios** to send HTTP requests to the backend server to fetch data, submit bookings, and process payments.

### Backend Architecture (The Logic & Data Layer)
*   **Server Environment:** **Node.js** running the **Express.js** framework. It acts as the bridge between the user's browser and the database.
*   **Database (MongoDB & Mongoose):** A NoSQL database is used. Mongoose models define strict schemas for data. For example, a `Booking` schema ensures that every booking has an `appointmentType`, `price`, and `customerEmail`.
*   **Security (JWT & bcrypt):** 
    *   User passwords are never stored in plain text. `bcryptjs` hashes them mathematically.
    *   When a user logs in, the backend gives them a **JSON Web Token (JWT)**. The frontend stores this token and sends it back with every subsequent request (like "view my bookings") to prove the user's identity securely.

### Data Flow Diagram (Abstract)
1.  `Browser (React)`  --> **GET Request** -->  `Backend (Express)` --> `Third-Party API` (Exchange Rates)
2.  `Browser (React)`  --> **POST Request (Checkout Data)** --> `Backend (Express)` --> `Razorpay API` (Create Order)
3.  `Razorpay (Client)` --> **Payment Success** --> `Browser (React)`
4.  `Browser (React)`  --> **POST Request (Verify Payment)** --> `Backend (Express)` --> Verifies Signature
5.  `Backend (Express)` --> **Database Write** --> `MongoDB` (Save Booking)
6.  `Backend (Express)` --> **PDFKit Engine** --> Generates PDF Invoice in Memory
7.  `Backend (Express)` --> **Response (Success + PDF Link)** --> `Browser (React)`

---

## 5. Why This Stack and Workflow Were Chosen
*   **Scalability:** By splitting the frontend (React) and backend (Node.js) into separate services, the platform can handle high traffic. If the frontend gets busy, it can be scaled independently of the database.
*   **User Trust:** The integration of Razorpay ensures that ZEAL HEALING does not handle raw credit card data, offloading security compliance to a trusted financial provider. The automated generation of a professional PDF invoice immediately after payment drastically increases customer trust and business professionalism.
*   **Global Reach:** The dynamic currency conversion allows the business to seamlessly serve international clients without the confusion of manual currency math, increasing global conversion rates.
