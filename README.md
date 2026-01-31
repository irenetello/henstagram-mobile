# 📸 Henstagram Mobile — Challenge-Driven Social App  
**React Native · Expo · TypeScript · Firebase**

Henstagram Mobile is a challenge-based social photo mobile app built with **React Native + Expo + Firebase**, engineered with production-style architecture, lifecycle-driven features, security-aligned data modeling, and automated tests.

The project evolved from a simple concept into a feature-complete mobile module including challenge lifecycle management, admin controls, scheduling, soft delete strategy, Firestore rules, composite indexes, and reusable UI architecture.

> Portfolio project focused on real engineering patterns — not tutorial scaffolding.

---

# ✨ Overview

Henstagram Mobile allows users to participate in time-based photo challenges, upload posts, and interact through likes and comments.

Challenges follow a derived lifecycle:

DRAFT → ACTIVE → ENDED

Lifecycle state is computed from timestamps and enforced both in UI logic and Firestore security rules.

---

# 🧩 Core Features

## Challenge Lifecycle System
- Draft / Active / Ended lifecycle derived from timestamps
- Admin activation with duration or no-limit mode
- Manual early end support
- Soft delete with audit metadata
- User visibility filtered by lifecycle state
- Admin visibility of all states
- Firestore index-aware queries

## Social Features
- Create posts with camera or gallery
- Feed + Profile grid + Challenge feeds
- Likes system (Firestore subcollections)
- Comments system (Firestore subcollections)
- Counters protected by security rules
- Reusable PostCard component
- Unified PostDetailModal across screens

## Admin Controls
- Admin role via Firestore collection
- Activate challenge instantly
- Schedule challenge window
- End challenge manually
- Soft delete challenge
- Admin-only lifecycle updates enforced by rules

---

# 🧱 Architecture Highlights

- Hook-based data layer (admin vs user queries separated)
- Derived lifecycle status instead of stored enum (prevents drift)
- Boolean soft delete (isDeleted) for deterministic queries
- Firestore-first data modeling
- Security rules aligned with query patterns
- Reusable UI primitives (cards, modals, grids)
- Backfill-safe schema evolution
- Index-aware query design
- Navigation via Expo Router + PagerView tabs

---

# 🛠 Tech Stack

## App
- React Native
- Expo
- Expo Router
- TypeScript

## Backend (BaaS)
- Firebase Firestore
- Firebase Storage
- Firebase Authentication

## State & Data
- Zustand (state slices)
- Custom React hooks

## UI & Media
- Expo Image
- React Native PagerView

## Tooling
- ESLint
- TypeScript strict mode
- Modular folder architecture

---

# 🧪 Testing & Quality

Testing is included and structured.

## Tools
- Vitest — unit tests
- Jest — UI/screen tests
- React Native Testing Library — component behavior

## Coverage Areas
- Mapping layer (Firestore → domain models)
- Zustand stores
- API layer functions
- Screen behavior (Feed/Profile)
- Hook behavior with mocked Firestore

Run tests:

npm test  
npm run test:ui

---

# 🗃 Data Model (Simplified)

## challenges/{id}

{
  title: string
  prompt: string

  createdAt: Timestamp
  createdByUid: string
  createdByName: string | null

  startAt: Timestamp | null
  endAt: Timestamp | null

  isDeleted: boolean
  deletedAt: Timestamp | null
  deletedByUid: string | null
}

## posts/{id}

{
  userId: string
  imageUrl: string
  caption: string

  challengeId?: string
  challengeTitle?: string

  likesCount: number
  commentsCount: number
}

---

# 🔐 Security Rules Strategy

- Access whitelist via allowedEmails/{email}
- Admin role via admins/{email}
- Challenge updates → admin only
- Soft delete only (no client hard delete)
- Post ownership enforced
- Like/comment ownership enforced
- Counters immutable from client
- Users read only active & non-deleted challenges
- Admin reads everything

Rules file:

firestore.rules

Deploy:

firebase deploy --only firestore:rules

---

# ⚡ Firestore Index Strategy

Composite indexes required for lifecycle queries.

User challenges query:

isDeleted == false  
startAt != null  
orderBy startAt desc

Admin challenges query:

isDeleted == false  
orderBy createdAt desc

Indexes file:

firestore.indexes.json

Deploy:

firebase deploy --only firestore:indexes

---

# 🚀 Running the Project Locally

## Prerequisites

- Node.js 18+
- npm or pnpm
- Expo CLI (optional)

npm install -g expo

---

## Install Dependencies

npm install

---

## Firebase Setup

Create a Firebase project and enable:

- Firestore
- Storage
- Authentication

Create a web app and copy config values.

Create a .env file:

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

---

## Required Firestore Collections

Create manually:

allowedEmails/{email}
enabled: true

admins/{email} (optional — enables admin UI)
enabled: true

---

## Start the App

npx expo start

Run on:

- iOS simulator
- Android emulator
- Expo Go on device

---

# 📐 Engineering Decisions

- Derived lifecycle status instead of stored enum
- Boolean soft delete for predictable queries
- Admin/user hook separation
- Rules + UI guards = defense in depth
- Reusable modal/card architecture
- Firestore index-aware query design
- Backfill-friendly schema evolution
- Testable mapping and API layers

---

# 🗺 Roadmap

Planned enhancements:

- Lifecycle badges in UI
- Disable participate on ended challenges
- Challenge labels on posts
- Challenge leaderboard
- New challenge notification banner
- Push notifications
- Challenge cover images
- Export gallery

---

# 👩‍💻 Author

Built and maintained by Irene — Frontend developer specialized in React & TypeScript across web and mobile.

This repository is part of my public portfolio and demonstrates production-style patterns in:

- Mobile architecture
- Firebase data modeling
- Security rules design
- Lifecycle feature systems
- Reusable component design
