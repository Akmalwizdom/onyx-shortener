# Onyx URL Shortener

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Status](https://img.shields.io/badge/Status-Active-success)

> **"Minimalist Link Manager. High Performance."**

Onyx is a modern, high-performance URL shortener designed for speed, privacy, and simplicity. It provides a clean, distraction-free interface for managing your links efficiently.

## ⚡ Key Features

- **Modern Interface**: Clean, minimalist design with glassmorphism elements.
- **Instant Shortening**: Zero-friction input with auto-validation and protocol fixing.
- **Real-time Analytics**: Live tracking of "Links Created" and "Total Clicks" via backend API.
- **Smart Redirection**: Fast, root-level redirection (`domain.com/code`) powered by Edge-ready logic.
- **Private History**: Local-first history storage for user privacy.
- **Responsive**: Fully optimized for Desktop and Mobile experiences.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL (via Neon Serverless)
- **Fetching**: SWR (Stale-While-Revalidate)
- **Icons**: Material Symbols & Phosphor

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/username/onyx-shortener.git
    cd onyx-shortener
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env` file and add your database credentials:
    ```env
    DATABASE_URL=postgres://user:pass@host/db
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000)

## 📸 Overview

*Input Interface*
> Simple input field with real-time validation and dynamic loading states.

*Analytics Dashboard*
> Live data visualization and usage usage statistics.

---

*"Start Small. Link Big."*
