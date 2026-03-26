#  LastMinutePreparation CBSE (LMP)

**An AI-powered exam preparation platform for CBSE students**
Built to help students prepare effectively in the *last moments before exams* using smart summaries, PYQs, and AI-generated answers.

 Live: https://lastminutepreparation.in

---

##  Overview

LastMinutePreparation (LMP) is a full-stack scalable web application designed to provide:

*  Previous Year Questions (PYQs)
*  AI-generated topper-style answers
*  Quick revision notes (1–5 marks)
*  Smart exam-focused preparation

The platform is optimized for **speed, scalability, and real-world usage**, and has already served **1800+ users organically**.

---

##  Traction (Real Users)

*  **1800+ Users**
*  **15+ Paid Users**
*  **₹7,500+ Revenue (Razorpay)**
*  Acquired users **only via Instagram Reels (organic growth)**

---

##  Core Features

###  Exam-Focused Learning

* **Extreme High Probability Questions**

  * Chapter-wise curated questions
  * Board-exam formatted answers

* **PYQs (2014 – 2025)**

  * Last 10 years questions
  * Pattern-based preparation

* **Chapter Wise Study Guide**

  * Simplified, structured learning
  * Focused on scoring topics

---

###  AI-Powered Features (Powered by OpenAI)

* **AI Topic Summarizer**

  * Converts any topic into concise, easy-to-understand summaries

* **Ask Any Question**

  * Get **topper-style, exam-ready answers** instantly

* **Chat with PDF**

  * Upload notes and interact like a teacher

* **Diagram & Image Analysis**

  * AI explains diagrams in structured exam format

---

###  Smart Practice System

* **Quiz, Fill-ups & True/False**

  * Auto-generated questions for practice

* **Last Night Before Exam Mode**

  * High-impact revision for maximum marks

---

###  Monetization Features

* **PRO Features Unlock**

  * Premium features behind paywall using Razorpay

---
## Authentication & Authorization

*  **JWT-based Authentication**

  * Access Token for short-lived secure API access
  * Refresh Token for session persistence

*  **Token Refresh Mechanism**

  * Automatic renewal of expired access tokens
  * Improves user experience without frequent logins

* **Secure Session Management**

  * Tokens stored securely (HTTP-only cookies / secure storage)
  * Protection against unauthorized access

*  **Google OAuth Login**

  * One-click login/signup using Google
  * Simplified onboarding for students

*  **Protected Routes**

  * Role-based access for premium (PRO) features
  * Middleware-based authentication in backend

---

##  AI & Backend Architecture

* Powered by **OpenAI GPT-5.1 Pro**
* Secure API handling using backend (Node.js + Express)
* Asynchronous job processing using **Inngest (queue system)**
* Frontend uses **polling mechanism** to fetch responses
* Integrated **Upstash (Redis) caching** to store frequently requested AI responses and reduce latency
*  **JWT + OAuth-based authentication system for secure access**
* Designed for **scalability, low response time, and real-time performance**

---

## System Architecture (Workflow)

1. User logs in (JWT / Google OAuth)
2. User selects feature (e.g., summarizer / question)
3. Request sent to backend (Express API) with access token
4. Backend validates token & checks **Upstash cache**
5. If cached → response returned instantly 
6. If not cached:

   * Job pushed to **Inngest queue**
   * OpenAI (GPT-5.1 Pro) processes request
7. Result stored in **Upstash cache**
8. Frontend polls for response
9. Final answer displayed in exam-ready format

---

## Security

* OpenAI API keys stored securely on backend
* JWT authentication with access & refresh tokens
* Secure OAuth login (Google)
* No exposure of sensitive keys to frontend
* Protected premium routes and APIs
* Validation & authorization middleware in backend

---

##  Challenges Solved

* Handling async AI responses efficiently
* Queue-based architecture using Inngest
* Implemented caching layer using Upstash for performance boost
* Designed secure authentication (JWT + OAuth)
* Optimized polling without performance issues
* Smooth Razorpay payment integration
* Scaling backend for real users

---

##  Performance Optimization

*  Reduced API latency using **Upstash Redis caching**
*  Avoided repeated OpenAI calls for same queries
*  Improved response time for frequently accessed content
*  Optimized cost by minimizing redundant AI requests

---

##  Security

* OpenAI API keys stored securely on backend
* No exposure of sensitive keys to frontend
* Controlled access to premium features

---

##  Tech Stack

###  Frontend

* React.js 
* Tailwind CSS
* Deployed on **Vercel**

###  Backend

* Node.js + Express.js
* Deployed on **AWS Lightsail**

###  Infrastructure & Tools

* **Inngest** → Queue system for async processing
* **Upstash (Redis)** → Caching layer
* **Polling** → Response fetching
* **Razorpay** → Payments
* **GoDaddy** → Domain management

---

##  Deployment

| Component | Platform      |
| --------- | ------------- |
| Frontend  | Vercel        |
| Backend   | AWS Lightsail |
| Cache     | Upstash       |
| Queue     | Inngest       |
| Domain    | GoDaddy       |

---

##  Timeline

*  Developed & Launched: **January 2026**
*  Growth achieved via **organic Instagram Reels**

---

##  Challenges Solved

* Handling async AI responses efficiently
* Queue-based architecture using Inngest
* Implemented caching layer using Upstash for performance boost
* Optimized polling without performance issues
* Smooth Razorpay payment integration
* Scaling backend for real users

---

##  Future Improvements

* Replace polling with WebSockets
* Student analytics dashboard
* Mobile app version
* Personalized AI learning paths

---

##  Author

**Ankit Singh Chouhan**
Full Stack Developer | AI & Backend Enthusiast

---

##  Why This Project Matters

This is not just a project — it is a **real-world product** with:

* Real users (1800+)
* Revenue generation
* Scalable backend architecture
* Production deployment

---

## Support

If you like this project, consider giving it a ⭐ on GitHub!
It helps and motivates further development 

---

