# BookBuddy - Modern Book Exchange Platform

A modern, production-grade web application built to facilitate a community-driven book exchange platform. BookBuddy allows users to manage their personal book collections, browse an extensive catalog of books, borrow/lend books with other users, and communicate via a real-time messaging system.

## 🚀 Features

- **User Authentication** - Secure login and registration with protected routes and context-based state management.
- **Advanced Book Catalog** - Browse, search, and filter books using advanced criteria (Genre, Availability, Condition). Optimized with **Virtual Scrolling** (`react-window`) to smoothly handle thousands of items.
- **Book Management** - Add, manage, and track your personal book collection and borrowed books via a dedicated dashboard.
- **Wishlist System** - Save books you're interested in reading to a personal Wishlist for easy tracking and requesting later.
- **Transaction System** - End-to-end workflow to request, approve, and manage book borrowing/lending transactions.
- **Real-Time Messaging** - Communicate with other users in real-time via a dedicated Socket.IO chat server. Includes online status tracking.
- **Dashboard & Analytics** - View analytics and insights on your book exchange activity.
- **Responsive & Accessible UI** - Fully responsive interface built with Tailwind CSS, Radix UI, and Framer Motion animations. Optimized for keyboard navigation and screen readers.

## 🛠️ Tech Stack & Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **Form Validation**: React Hook Form + Zod
- **Performance**: `react-window` for virtualized list rendering

### Backend & Data Layer

- **Mock Database**: The application currently uses an advanced in-memory mock database (`src/lib/mockDb.ts`) backed by `localStorage`. It simulates real API interactions (via latency injection and promises) and includes an event emitter (`bookbuddy:db-change`) to ensure the UI stays synchronized across components.
- **Real-Time Server**: A lightweight Node.js server (`server/index.js`) powered by `Socket.IO` handles real-time chat functionality and tracks user online status independently of the MockDB.
- **Database Provisioning**: Includes a `compose.yaml` to spin up a local PostgreSQL database for future backend integration.

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- _(Optional)_ Podman or Docker (for spinning up the local Postgres database)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/BookBuddy.git
cd BookBuddy
```

### 2. Install Dependencies

Install dependencies for both the frontend application and the real-time server:

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup

Copy the example environment file and update as needed:

```bash
cp .env.example .env
```

### 4. Start Development Servers

You will need to start both the Vite development server and the Socket.IO chat server.

**Terminal 1 (Real-Time Server):**

```bash
npm run server
```

**Terminal 2 (Frontend):**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 5. Start Database (Optional)

If you intend to transition away from the MockDB and use a real PostgreSQL database:

```bash
npm run db:start
```

## 📦 Available Scripts

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Start the Vite frontend development server |
| `npm run server`   | Start the Socket.IO real-time chat server  |
| `npm run build`    | Build the frontend for production          |
| `npm run preview`  | Preview the production build locally       |
| `npm run lint`     | Run ESLint                                 |
| `npm run test`     | Run the Vitest test suite                  |
| `npm run db:start` | Start the PostgreSQL database container    |
| `npm run db:stop`  | Stop the PostgreSQL database container     |

## 🏗️ Project Structure

```text
BookBuddy-main/
├── src/
│   ├── components/        # Reusable React components (Auth, Books, UI primitives)
│   ├── contexts/          # React Context providers (AuthContext, ChatContext)
│   ├── hooks/             # Custom React hooks (e.g., useCatalogData)
│   ├── lib/               # Utilities, MockDB implementation, validations, and analytics
│   ├── pages/             # Route components (lazy-loaded in App.tsx)
│   ├── services/          # API service abstractions (bookService, chatService)
│   ├── types/             # Shared TypeScript type definitions
│   └── test/              # Vitest unit and component tests
├── server/
│   ├── index.js           # Node.js + Socket.IO real-time server entry point
│   └── package.json       # Server-specific dependencies
├── db/
│   └── init.sql           # Initial database schema setup
├── public/                # Static assets
└── package.json           # Frontend dependencies and scripts
```

## 🔒 Security & Validation

- **Zod Schemas**: All forms (Login, Registration, Add Book, Profile Settings) are protected by strict Zod schemas to ensure type-safe validation before submission.
- **Protected Routes**: React Router handles authentication states, redirecting unauthenticated users away from protected views (`/my-books`, `/dashboard`, etc.).
- **Strict TypeScript**: Enforces robust type-checking across the entire application to prevent runtime exceptions.

## 🚀 Future Roadmap & Migration

The current architecture is intentionally decoupled. The `src/services/` layer abstracts all data fetching.

To migrate from the MockDB to a real backend (e.g., Express/PostgreSQL or Supabase):

1. Keep the UI components and custom hooks exactly as they are.
2. Update the implementation of the functions within `src/services/` (like `bookService.ts` and `transactionService.ts`) to make actual `fetch` or `axios` HTTP requests to your new backend API instead of calling `mockDb.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
