# 🤖 NexaOne AI

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://nexaone-ai.onrender.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**The Ultimate All-in-One AI Platform**
<br />
*Experience the future with AI tools, 3D interactions, and real-time communication.*

[**Explore the App »**](https://nexaone-ai.onrender.com/)

</div>

<img src="https://r2.erweima.ai/imgcompressed/compressed_9614f1771142273151478170669222e9.webp" width="100%" height="8px" alt="Gradient Line">

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [App Showcase](#-app-showcase)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

<img src="https://r2.erweima.ai/imgcompressed/compressed_9614f1771142273151478170669222e9.webp" width="100%" height="8px" alt="Gradient Line">

## 🚀 About The Project

**NexaOne AI** is a cutting-edge web application designed to integrate multiple powerful technologies into a single cohesive platform. Whether you need advanced AI generation tools, real-time video conferencing, or a dynamic 3D user interface, NexaOne delivers it all with high performance and style.

Built with the latest web standards (**Next.js 16**, **React 19**, **Tailwind v4**), it leverages the power of **Google Gemini** and **Groq** for AI logic, **LiveKit** for seamless streaming, and **Socket.IO** for instant messaging.

<img src="https://r2.erweima.ai/imgcompressed/compressed_9614f1771142273151478170669222e9.webp" width="100%" height="8px" alt="Gradient Line">

## ✨ Key Features

### 🧠 **AI Powerhouse**
- **Smart Assistant:** Powered by `@google/generative-ai` and `langchain`.
- **Content Generation:** AI Article Writer, Email Generator, and Caption Creator using **Groq SDK**.
- **Visuals:** Image generation capabilities.

### 🌐 **Real-Time Communication**
- **Video & Voice:** Crystal clear 1-on-1 and Group calls powered by **LiveKit** (`livekit-client`, `livekit-server-sdk`).
- **Instant Chat:** Real-time messaging system built on **Socket.IO** with Emoji support (`emoji-picker-react`).

### 🎨 **Immersive UI/UX**
- **3D Elements:** Interactive 3D models using **Spline** (`@splinetool/react-spline`).
- **Animations:** Butter-smooth transitions with **GSAP** and **Framer Motion**.
- **Modern Design:** Built with **Shadcn UI** (`@radix-ui`) and **Lucide React** icons.
- **Dynamic Dashboards:** Data visualization using **Recharts**.

### 🛠 **Robust Utilities**
- **Authentication:** Secure user management via **Clerk**.
- **Payments:** Integrated **Razorpay** gateway.
- **PDF Export:** Convert content to PDF with `html2pdf.js` and `react-to-print`.

<img src="https://r2.erweima.ai/imgcompressed/compressed_9614f1771142273151478170669222e9.webp" width="100%" height="8px" alt="Gradient Line">

## 📸 App Showcase

> *Screenshots of the application in action.*

| **Hero Section (3D Spline)** |  **Features** |
|:---:|:---:|
| ![Hero Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-19%20164009.png?raw=true) | ![Hero Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-19%20164009.png?raw=true) | 
| **About** | **Features** |
|:---:|:---:|
| ![About Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003619.png?raw=true) | ![Features Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003632.png?raw=true) |
| **Demo Dashboard** | **Testimonials** |
|:---:|:---:|
| ![Demo Dashboard Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003644.png?raw=true) | ![Testimonials Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003708.png?raw=true) |
| **Pricing** | **Contact Us** |
|:---:|:---:|
| ![Pricing Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003717.png?raw=true) | ![Contact Us Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003751.png?raw=true) |
| **User Dashboard** | **Assistant** |
|:---:|:---:|
| ![User Dashboard Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003905.png?raw=true) | ![Assistant Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20003959.png?raw=true) |
| **Image Gen** | **Article Writer** |
|:---:|:---:|
| ![Image Gen Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-19%20181111.png?raw=true) | ![Article Writer Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20004214.png?raw=true) |
| **Email Writer** | **Caption Gen** |
|:---:|:---:|
| ![Email Writer Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20004515.png?raw=true) | ![Caption Gen Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20004701.png?raw=true) |
| **Search Engine** | **Search Engine Image Tab** |
|:---:|:---:|
| ![Search Engine Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20004731.png?raw=true) | ![Search Engine Image Tab Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20004931.png?raw=true) |

| **Real-time Video Call** | **Chat Interface** |
|:---:|:---:|
| ![Video Call Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-19%20164351.png?raw=true) | ![Chat Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-19%20164409.png?raw=true) |
| **Group Meetiing** | **Meeting Interface** |
|:---:|:---:|
| ![Group Meetiing Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20005320.png?raw=true) | ![Meeting Interface Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20005419.png?raw=true) |
| **Call Log** | **Settings** |
|:---:|:---:|
| ![Call Log Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20005552.png?raw=true) | ![Settings Placeholder](https://github.com/Code2With-Pratik/NexaOne-AI/blob/main/public/NexaOneAI%20Images/Screenshot%202026-01-18%20005601.png?raw=true) |

<img src="https://r2.erweima.ai/imgcompressed/compressed_9614f1771142273151478170669222e9.webp" width="100%" height="8px" alt="Gradient Line">

## ⚡ Tech Stack

### **Frontend**
* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Styling:** Tailwind CSS v4, Tailwind Merge, CLSX
* **Components:** Radix UI (Shadcn), Lucide React
* **Animation:** GSAP, Framer Motion, Lottie
* **3D:** Spline

### **Backend & Database**
* **Server:** Node.js (Custom Server), Express
* **Database:** PostgreSQL (via Neon/Supabase)
* **ORM:** Prisma (`@prisma/client`)
* **Real-time:** Socket.IO, LiveKit

### **Services**
* **Auth:** Clerk
* **AI:** Google Gemini, Groq, Langchain
* **Payments:** Razorpay
* **Storage:** Supabase

<img src="https://r2.erweima.ai/imgcompressed/compressed_9614f1771142273151478170669222e9.webp" width="100%" height="8px" alt="Gradient Line">

## 🛠 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL Database URL

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/nexaone-ai.git](https://github.com/your-username/nexaone-ai.git)
   cd nexaone-ai
