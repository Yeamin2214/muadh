# Mu'adh (معاذ)

### AI Follow-up Companion for New Muslims

**Team Sabeel | AI Challenge Serving Islamic Content 2026 | Track 3**

[Live Demo](https://muadh-five.vercel.app/) · [GitHub Repository](https://github.com/Yeamin2214/muadh) · [Video Demo](https://drive.google.com/drive/u/0/folders/1Gle0cJoG2Af2Fz5X32Dh8ZFjZ4-S6ncj)

---

## About Mu'adh

**Mu'adh (معاذ)** is an AI-powered follow-up companion designed to support people who are new to Islam throughout their early journey of learning and practicing Islam.

The platform combines **AI assistance, structured Islamic learning, trusted source-based content, and human mentorship**.

Instead of treating AI as a replacement for a human mentor, Mu'adh keeps a **human mentor in the loop** for personal questions, follow-up, and situations where human guidance is more appropriate.

### Core Idea

> **AI for immediate guidance. Human mentors for personal support.**

Mu'adh is designed to make the early learning journey more accessible, structured, and supportive while keeping Islamic content connected to approved sources.

---

## Key Features

### Structured Islamic Learning

New Muslims can follow a guided learning path through structured lessons designed for people who are beginning their Islamic journey.

The project includes:

- Lesson maps
- Lesson cards
- Processed lesson content
- Islamic terminology and glossary
- Learning progress

### AI-Assisted Islamic Q&A

Users can ask questions and receive answers based on approved Islamic sources.

The content pipeline supports:

- Qur'an translations
- Hadith
- Source-based retrieval
- Semantic embeddings
- Evaluation through synthetic test cases

The goal is to keep AI-generated responses grounded in approved content rather than relying only on general model knowledge.

### Human Mentor Support

Mu'adh includes a dedicated mentor workflow.

Users can communicate with mentors when they have personal questions or need additional guidance.

Mentors have their own dashboard to manage user interactions and provide follow-up support.

### Prayer Support

The platform includes prayer-related functionality such as:

- Prayer times
- Prayer countdowns
- Prayer reminders
- Prayer planning support

Prayer calculations are handled using the `adhan` library.

### Qibla Support

Users can access Qibla-related functionality to help determine the direction of the Kaaba.

### Multilingual Support

The platform is designed with multilingual users in mind, including support for English and Bengali content alongside Arabic Islamic source material.

---

# User Roles

Mu'adh currently provides three separate interfaces.

## 1. User

The user dashboard is designed for new Muslims.

Users can access:

- Structured lessons
- Islamic Q&A
- Mentor communication
- Learning progress
- Prayer-related tools
- Qibla support
- Feedback and rating functionality

**User Portal:**  
https://muadh-five.vercel.app/user/login

---

## 2. Mentor

The mentor dashboard is designed for human mentors who support users throughout their learning journey.

Mentors can:

- View assigned users
- Review user questions
- Respond to users
- Follow up with users
- Manage mentor-related activities

**Mentor Portal:**  
https://muadh-five.vercel.app/mentor

---

## 3. Admin

The admin dashboard provides platform-level management.

Administrators can manage and monitor:

- Users
- Mentors
- Lessons
- Content
- Platform activities
- Mentor-related workflows

**Admin Portal:**  
https://muadh-five.vercel.app/admin

---

# Live Application

| Role | Link |
|---|---|
| **Main Website** | [https://muadh-five.vercel.app/](https://muadh-five.vercel.app/) |
| **User** | [https://muadh-five.vercel.app/user/login](https://muadh-five.vercel.app/user/login) |
| **Mentor** | [https://muadh-five.vercel.app/mentor](https://muadh-five.vercel.app/mentor) |
| **Admin** | [https://muadh-five.vercel.app/admin](https://muadh-five.vercel.app/admin) |
| **GitHub Repository** | [https://github.com/Yeamin2214/muadh](https://github.com/Yeamin2214/muadh) |
| **Video Demo** | [Google Drive](https://drive.google.com/drive/u/0/folders/1Gle0cJoG2Af2Fz5X32Dh8ZFjZ4-S6ncj) |

---

# System Overview

At a high level, the platform follows this workflow:

```text
                    ┌─────────────────────┐
                    │      New Muslim     │
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Mu'adh        │
                    │   User Dashboard    │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │   AI Assistance  │        │  Human Mentor    │
       │                  │        │                  │
       │ Approved Sources │        │ Personal Support │
       │ Retrieval / Q&A  │        │ Follow-up        │
       └────────┬─────────┘        └────────┬─────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌─────────────────────┐
                    │     User Support    │
                    │  Learning & Growth  │
                    └─────────────────────┘
```

---

# Technology Stack

The application is built using:

### Frontend & Application

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Lucide React**

### Backend & Database

- **Supabase**
- `@supabase/supabase-js`
- `@supabase/ssr`

### Islamic / Prayer Utilities

- **Adhan** for prayer-time calculations
- **tz-lookup** for timezone-related functionality

### AI & Content Pipeline

- Approved Qur'an and Hadith sources
- Source ingestion scripts
- Semantic embeddings
- Retrieval-based content workflow
- Synthetic evaluation cases

---

# Project Structure

```text
muadh/
│
├── app/
│   ├── user/
│   ├── mentor/
│   ├── admin/
│   └── ...
│
├── components/
│   └── Reusable UI components
│
├── content/
│   ├── glossary
│   └── processed lesson data
│
├── db/
│   └── Database schema and SQL
│
├── docs/
│   ├── Architecture
│   ├── Lesson map
│   └── Lesson cards
│
├── eval/
│   └── Synthetic evaluation cases
│
├── lib/
│   └── Application utilities and services
│
├── public/
│   └── Static assets
│
├── scripts/
│   ├── ingest/
│   └── Evaluation / utility scripts
│
├── types/
│   └── TypeScript types
│
├── .env.example
├── middleware.ts
├── next.config.mjs
├── package.json
├── RESOURCES.md
├── STARTING_VERSION.md
└── README.md
```

---

# Getting Started

## Prerequisites

Before running Mu'adh locally, make sure you have:

- Node.js
- npm
- Python 3.10+
- A Supabase project
- Required API keys and environment variables

---

## 1. Clone the Repository

```bash
git clone https://github.com/Yeamin2214/muadh.git
cd muadh
```

---

## 2. Install Node Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then add the required configuration values and API keys.

**Never commit your `.env` file or expose private API keys.**

---

## 4. Set Up Supabase

Create or use a Supabase project.

Then open the **Supabase SQL Editor** and run the required database schema from:

```text
db/01_content_schema.sql
```

---

# Content Ingestion

Mu'adh includes a Python-based ingestion pipeline for loading approved Islamic sources into the database.

Install the ingestion dependencies:

```bash
pip install -r scripts/ingest/requirements.txt
```

### Load Quran Translation Information

```bash
python scripts/ingest/ingest.py translations en
python scripts/ingest/ingest.py translations bn
```

Use the returned translation keys to configure the appropriate values in `.env`.

### Load Quran Content

```bash
python scripts/ingest/ingest.py quran
```

### Load Hadith Content

```bash
python scripts/ingest/ingest.py hadith
```

### Generate Embeddings

```bash
python scripts/ingest/ingest.py embed
```

---

# Run the Application

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Production Build

```bash
npm run build
```

Creates a production build.

### Production Server

```bash
npm run start
```

Starts the production server.

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript type checking.

### Evaluation

```bash
npm run evaluate
```

Runs the project's evaluation workflow.

### Model Check

```bash
npm run check-models
```

Checks the configured AI model setup.

---

# Evaluation

The `eval/` directory contains **100 synthetic test cases** for evaluating the system.

These cases are designed to test the system across different user questions and scenarios.

Run the evaluation workflow with:

```bash
npm run evaluate
```

---

# Approved Sources & Resources

Because Mu'adh provides Islamic information, source selection is an important part of the project.

The repository maintains a dedicated:

```text
RESOURCES.md
```

This file documents the sources, tools, and licenses used by the project.

The content pipeline is designed around approved Qur'an translations, Hadith sources, and processed content rather than allowing the application to depend entirely on unrestricted model knowledge.

---

# Security & Environment Variables

Sensitive configuration should be stored in `.env`.

Do not commit:

```text
.env
```

to the repository.

Use:

```text
.env.example
```

as the template for required environment variables.

---

# Project Demo

A video demonstration of the current version of Mu'adh is available here:

**[Watch the Video Demo](https://drive.google.com/drive/u/0/folders/1Gle0cJoG2Af2Fz5X32Dh8ZFjZ4-S6ncj)**

The demo includes the main user, mentor, and admin workflows of the platform.

---

# Current Version

This repository represents the **first deployed version of Mu'adh** for the **AI Challenge Serving Islamic Content 2026, Track 3**.

The application is currently deployed at:

**https://muadh-five.vercel.app/**

---

# Team

### Team Sabeel

**AI Challenge Serving Islamic Content 2026**  
**Track 3**

---

# Project Links

- **Live Application:** [https://muadh-five.vercel.app/](https://muadh-five.vercel.app/)
- **GitHub Repository:** [https://github.com/Yeamin2214/muadh](https://github.com/Yeamin2214/muadh)
- **Video Demo:** [Google Drive](https://drive.google.com/drive/u/0/folders/1Gle0cJoG2Af2Fz5X32Dh8ZFjZ4-S6ncj)
- **User Portal:** [https://muadh-five.vercel.app/user/login](https://muadh-five.vercel.app/user/login)
- **Mentor Portal:** [https://muadh-five.vercel.app/mentor](https://muadh-five.vercel.app/mentor)
- **Admin Portal:** [https://muadh-five.vercel.app/admin](https://muadh-five.vercel.app/admin)

---

# License & Sources

Please refer to [`RESOURCES.md`](RESOURCES.md) for the project's sources, tools, licenses, and related references.