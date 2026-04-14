# BookBuddy - Book Exchange Platform

A modern, production-grade book exchange platform built with React, TypeScript, and Vite. Share, borrow, and discover books within your community.

## 🚀 Features

- **User Authentication** - Secure login and registration with protected routes
- **Book Catalog** - Browse and search books with real-time metadata from Google Books API
- **Book Management** - Add, manage, and track your personal book collection
- **Transaction System** - Request, approve, and manage book borrowing/lending
- **Messaging** - Communicate with other users in real-time
- **Dashboard** - Analytics and insights on your book exchange activity
- **Responsive Design** - Fully responsive UI that works on all devices
- **Type Safety** - Full TypeScript support with strict mode enabled

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.2
- **Routing**: React Router v6
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Custom API client with error handling
- **Database**: PostgreSQL (via Docker/Podman)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Podman or Docker (for database)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/BookBuddy.git
cd BookBuddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and update as needed:

```bash
cp .env.example .env
```

### 4. Start Database (Optional)

If you want to use a real PostgreSQL database:

```bash
npm run db:start
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:all` | Start dev server + database |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run db:start` | Start database container |
| `npm run db:stop` | Stop database container |

## 🏗️ Project Structure

```
BookBuddy-main/
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── books/        # Book-related components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── layout/       # Layout components (Navbar, Footer, etc.)
│   │   ├── messaging/    # Messaging components
│   │   ├── transactions/ # Transaction components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configurations
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   └── types/            # TypeScript type definitions
├── db/
│   └── init.sql          # Database schema
├── public/               # Static assets
└── package.json
```

## 🔐 Authentication

The application uses a context-based authentication system with:
- Protected routes for authenticated pages
- Session persistence via localStorage
- Token-based authentication ready for backend integration

## 🎨 UI Components

Built with Radix UI primitives and styled with Tailwind CSS:
- Accessible by default
- Fully customizable
- Dark mode support ready
- Responsive design

## 📝 Form Validation

All forms use Zod for schema validation:
- Type-safe validation
- Comprehensive error messages
- Client-side validation before submission

## 🔒 Security Best Practices

- Strict TypeScript enabled
- Input validation on all forms
- Protected routes for authenticated content
- Environment variable configuration
- Error boundaries for graceful error handling
- XSS protection through React's built-in safeguards

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Deployment Options

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Docker**: Use the provided Docker configuration
- **Static Hosting**: Upload `dist/` folder to any static host

## 🧪 Testing

Testing framework setup (coming soon):
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## 📚 API Integration

The application is ready to integrate with a backend API:
- HTTP client with error handling (`src/lib/api-client.ts`)
- Service layer abstraction (`src/services/`)
- Environment-based API configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [shadcn/ui](https://ui.shadcn.com/) for beautiful component designs
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.
