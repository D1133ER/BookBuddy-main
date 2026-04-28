# BookBuddy Production Architecture & Feature Roadmap

This document describes the production-grade architecture, security standards, data strategy, real-world feature implementation plan, observability, and deployment pipeline needed to move BookBuddy from prototype to resilient, horizontally scalable application.

---

## 1. Production Architecture Blueprint

### Backend Structure (Express + Socket.io + Clean Architecture)

A production-ready BookBuddy backend should enforce strict separation of concerns, predictable error handling, and stateless design to enable horizontal scaling.

Recommended layout:

```
backend/
├── src/
│   ├── app.ts                 # Express app config (middleware, routes, error handler)
│   ├── server.ts              # Bootstrap HTTP + Socket.io + graceful shutdown
│   ├── api/
│   │   ├── routes/            # Versioned routes (v1/auth, v1/books, v1/progress)
│   │   ├── controllers/       # Request/response mapping only
│   │   ├── dtos/              # Zod schemas for validation & response typing
│   │   └── middlewares/       # auth, validate, rateLimit, cors, csrf, logger
│   ├── domain/
│   │   ├── entities/          # Business models (User, Book, Progress, Room)
│   │   ├── errors/            # AppError classes (NotFoundError, AuthError, etc.)
│   │   └── events/            # Domain event definitions
│   ├── services/              # Business logic decoupled from HTTP/WebSocket
│   ├── repositories/          # Data access layer (Prisma implementations)
│   ├── sockets/
│   │   ├── namespaces/        # /co-reading, /chat
│   │   ├── handlers/          # Event listeners with acks & validation
│   │   └── adapters/          # Redis adapter setup for scaling
│   ├── utils/
│   │   ├── logger.ts          # Pino structured logger with correlation IDs
│   │   ├── crypto.ts          # Hashing, tokens, encryption helpers
│   │   └── env.ts             # Zod-validated env vars
│   └── types/                 # Global type extensions (Express.Request, Socket.Data)
├── prisma/
│   ├── schema.prisma          # DB models, indexes, relations
│   ├── migrations/            # Versioned schema changes
│   └── seed.ts                # Deterministic dev/test data
├── docker/
│   ├── Dockerfile             # Multi-stage production build
│   └── docker-compose.yml     # Local dev: Postgres, Redis, pgAdmin, Mailpit
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

#### Architectural Decisions

- Stateless backend: store session/state in Redis or database.
- Service-repository pattern: controllers never access Prisma directly.
- Socket.io scaling: Redis adapter for multi-instance deployments.
- API versioning from day one: `/api/v1/...`.

#### Local Docker Compose Example

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: bookbuddy
      POSTGRES_PASSWORD: ${DB_PASSWORD:-dev_secure_pw_123}
      POSTGRES_DB: bookbuddy_db
    ports: ['5432:5432']
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U bookbuddy']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:-dev_redis_pw}
    ports: ['6379:6379']
    volumes:
      - redis_data:/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@bookbuddy.local
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin123}
    ports: ['5050:80']
    depends_on: [postgres]

  mailpit:
    image: axllent/mailpit
    ports: ['8025:8025', '1025:1025']

volumes:
  pg_data:
  redis_data:
```

---

## 2. Frontend Structure (Vite + React + Feature-Sliced Design)

A scalable frontend should organize code by feature and keep shared UI and data logic centralized.

Recommended layout:

```
frontend/
├── src/
│   ├── app/                   # Providers, router, global layout, error boundary
│   ├── pages/                 # Route-level components (lazy-loaded)
│   ├── features/              # Feature modules (auth, tracker, co-reading, settings)
│   │   └── <feature>/
│   │       ├── api/           # React Query hooks & Axios instances
│   │       ├── components/    # Feature-specific UI
│   │       ├── lib/           # Utils, constants, types
│   │       ├── model/         # Zustand stores, selectors
│   │       └── ui/            # Presentational components
│   ├── shared/
│   │   ├── api/               # Base axios instance, interceptors, MSW mocks
│   │   ├── components/        # Reusable UI (Button, Modal, Toast, Skeleton)
│   │   ├── hooks/             # useMediaQuery, useDebounce, useOnlineStatus
│   │   ├── lib/               # Zod schemas, formatters, constants
│   │   └── ui/                # Design system tokens, themes, CSS vars
│   ├── workers/               # Service worker (offline cache, background sync)
│   └── main.tsx
├── public/
├── vite.config.ts
├── playwright.config.ts
└── package.json
```

#### State Management Strategy

- Server state: `@tanstack/react-query` for caching, retries, background refresh, optimistic updates.
- Client/UI state: `zustand` for theme, drawer state, room presence, offline queue.
- Form state: `react-hook-form` + Zod resolver.
- Offline persistence: `idb` + `react-query-persist-client`.

---

## 3. Database & Data Strategy

### Prisma Schema Example

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  displayName   String?
  avatarUrl     String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  progress      ReadingProgress[]
  roomsOwned    CoReadingRoom[] @relation("RoomOwner")
  roomsJoined   CoReadingRoom[] @relation("RoomMembers")
  refreshTokens RefreshToken[]

  @@index([email])
}

model Book {
  id          String   @id @default(uuid())
  title       String
  author      String
  isbn        String?  @unique
  coverUrl    String?
  totalPages  Int
  metadata    Json?    // publisher, genre, language, description
  createdAt   DateTime @default(now())
  progress    ReadingProgress[]
}

model ReadingProgress {
  id          String   @id @default(uuid())
  userId      String
  bookId      String
  currentPage Int      @default(0)
  totalPages  Int
  lastReadAt  DateTime @default(now())
  isFinished  Boolean  @default(false)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book        Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
  @@index([userId, lastReadAt])
}

model CoReadingRoom {
  id          String   @id @default(uuid())
  name        String
  ownerId     String
  bookId      String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  owner       User     @relation("RoomOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members     User[]   @relation("RoomMembers")
  book        Book     @relation(fields: [bookId], references: [id])
  messages    RoomMessage[]

  @@index([isActive, createdAt])
}

model RoomMessage {
  id        String   @id @default(uuid())
  roomId    String
  userId    String
  content   String
  createdAt DateTime @default(now())
  room      CoReadingRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  revoked   Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
}

enum Role {
  USER
  ADMIN
}
```

### Data Strategy & Performance

- Connection pooling: use PgBouncer in production, Prisma connection_limit=10 per instance.
- Indexing: add composite indexes for frequent access patterns.
- Soft deletes: add `deletedAt DateTime?` when audit or recovery is needed.
- Migrations: use `npx prisma migrate dev` locally and `prisma migrate deploy` in CI/staging/prod.
- Backups: automated daily logical backups plus WAL for point-in-time recovery.

---

## 4. Security, Compliance & Data Integrity

### A. Environment Validation (Fail-Fast)

Use Zod to validate runtime environment variables at startup.

```ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url(),
  CORS_ORIGINS: z.string().transform((s) => s.split(',')),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export const env = envSchema.parse(process.env);
```

### B. Authentication Flow (JWT + httpOnly Cookies + Refresh Rotation)

Use httpOnly cookies for access tokens and refresh token rotation for security.

```ts
export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60, // 15 mins
};
```

Refresh rotation should revoke all tokens on detected reuse.

```ts
export const rotateRefreshToken = async (userId: string, oldToken: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
    throw new AuthError('Session compromised. Please log in again.');
  }
  const newToken = crypto.randomBytes(40).toString('hex');
  await prisma.refreshToken.create({
    data: { token: newToken, userId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  return newToken;
};
```

### C. CSRF & CORS Hardening

Double-submit cookie CSRF protection with strict CORS configuration.

```ts
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfCookie = req.cookies['csrf-token'];
    const csrfHeader = req.headers['x-csrf-token'];
    if (!csrfCookie || csrfCookie !== csrfHeader) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
});

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  }),
);
```

### D. Security Headers & Rate Limiting

Use Helmet plus a Redis-backed rate limiter for distributed environments.

```ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", env.FRONTEND_URL, 'wss:', 'ws:'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }),
);

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
  keyGenerator: (req) => req.ip ?? 'unknown',
});
app.use('/api/', limiter);
```

---

## 5. Real-World Feature Implementations

### Feature 1: Offline-First Reading Tracker

Sync strategy:

- Optimistic UI
- IndexedDB queue
- Background sync
- Conflict resolution using last-write-wins with server timestamp as source of truth

Example sync engine:

```ts
import { openDB } from 'idb';

const dbPromise = openDB('bookbuddy-offline', 1, {
  upgrade(db) {
    db.createObjectStore('progress', { keyPath: 'bookId' });
    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
  },
});

export const queueProgressUpdate = async (bookId: string, page: number) => {
  const db = await dbPromise;
  await db.put('progress', { bookId, currentPage: page, updatedAt: Date.now() });
  await db.add('syncQueue', {
    type: 'PROGRESS_UPDATE',
    payload: { bookId, page },
    timestamp: Date.now(),
  });

  if ('serviceWorker' in navigator && 'sync' in (navigator as any).serviceWorker) {
    const reg = await navigator.serviceWorker.ready;
    await (reg as any).sync.register('sync-progress');
  }
};
```

Conflict resolution rule:

- Server `lastReadAt` wins.
- If client timestamp is later, merge carefully.
- Otherwise overwrite client state with server state.

### Feature 2: Live Co-Reading Rooms (Scaled)

Socket.io handlers should use Redis for pub/sub and horizontal scaling.

```ts
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from '../../utils/redis';

const pageSyncSchema = z.object({
  roomId: z.string().uuid(),
  page: z.number().int().min(1),
  timestamp: z.number(),
});

export const setupCoReading = (io: Server) => {
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket: Socket) => {
    socket.on('join-room', async (roomId: string, ack: (status: string) => void) => {
      const room = await prisma.coReadingRoom.findUnique({ where: { id: roomId, isActive: true } });
      if (!room) return ack('ROOM_NOT_FOUND');

      socket.join(roomId);
      socket.data.roomId = roomId;
      io.to(roomId).emit('user-joined', { socketId: socket.id, userId: socket.data.userId });
      ack('JOINED');
    });

    socket.on('page-sync', (raw, ack) => {
      const parsed = pageSyncSchema.safeParse(raw);
      if (!parsed.success) return ack('INVALID_PAYLOAD');

      const { roomId, page, timestamp } = parsed.data;
      io.to(roomId).emit('page-updated', { page, timestamp, userId: socket.data.userId });
      ack('SYNCED');
    });

    socket.on('disconnect', () => {
      io.to(socket.data.roomId).emit('user-left', { socketId: socket.id });
    });
  });
};
```

Scaling notes:

- Use Redis adapter for multi-node Socket.io.
- Acknowledge all events to prevent silent failures.
- Debounce client page emissions (300ms).
- Store room state in Redis, not in memory.

### Feature 3: Burnout Prevention & Accessibility (WCAG 2.1 AA)

Design tokens should support dyslexia, high contrast, and reduced motion.

```css
:root {
  --font-base: 'Inter', system-ui, sans-serif;
  --line-height: 1.6;
  --letter-spacing: 0.01em;
  --max-reading-width: 65ch;
  --transition-speed: 0.2s;
}

:root[data-dyslexia='true'] {
  --font-base: 'OpenDyslexic', 'Comic Sans MS', sans-serif;
  --letter-spacing: 0.03em;
  --word-spacing: 0.1em;
}

:root[data-contrast='high'] {
  --bg-primary: #000;
  --text-primary: #fff;
  --bg-surface: #111;
  --border-color: #444;
}

:root[data-reduced-motion='true'] {
  --transition-speed: 0s;
  animation: none !important;
  transition: none !important;
}

.reading-container {
  font-family: var(--font-base);
  line-height: var(--line-height);
  max-width: var(--max-reading-width);
  margin: 0 auto;
  transition: all var(--transition-speed) ease;
}
```

Accessibility checklist:

- Semantic HTML (`<article>`, `<nav>`, `<main>`)
- Keyboard navigation and focus management
- Screen reader announcements for live updates
- Color contrast ≥ 4.5:1
- Respect `prefers-reduced-motion` and `prefers-color-scheme`

---

## 6. Testing, Quality Assurance & CI/CD

### Testing Pyramid

- Unit: `vitest` for services, utils, Zod schemas, hooks.
- Integration: `supertest` + Testcontainers for API routes, DB transactions, auth.
- E2E: `playwright` for critical user journeys.
- Accessibility: `axe-core` for WCAG 2.1 AA compliance.
- Load: `k6` for API throughput and Socket.io concurrency.

### CI/CD Pipeline Example

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  build-and-scan:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t bookbuddy-api ./backend
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'bookbuddy-api'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-and-scan
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploy to staging (Railway/Render/AWS ECS)"
      # Add your deployment CLI/script here
```

Quality gates:

- Block PRs if lint/typecheck/test fails.
- Coverage: lines ≥ 80%, branches ≥ 75%.
- Trivy blocks critical/high CVEs.
- Run Playwright E2E on staging after deploy.

---

## 7. Deployment, Monitoring & DevOps

### Production Deployment Strategy

| Component   | Recommended Host            | Why                              |
| ----------- | --------------------------- | -------------------------------- |
| Backend API | Railway / Render / AWS ECS  | Stateless scaling, health checks |
| Database    | Neon / Supabase / AWS RDS   | Managed backups, PITR, HA        |
| Redis       | Upstash / Redis Cloud       | Managed low-latency persistence  |
| Frontend    | Vercel / Cloudflare Pages   | Edge caching, preview deploys    |
| CDN         | Cloudflare / AWS CloudFront | Global delivery, DDoS protection |

### Observability Stack

- Logs: `pino` structured logs.
- Errors: `Sentry` with source maps and release tracking.
- Metrics: OpenTelemetry → Prometheus → Grafana.
- Uptime: Better Uptime / UptimeRobot.
- Health: `/health` for DB/Redis ping, `/ready` for readiness state.

Example logger setup:

```ts
import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: { level: (label) => ({ level: label }) },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { service: 'bookbuddy-api', env: env.NODE_ENV },
  transport: env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
});

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
});
```

---

## 8. Phased Implementation Roadmap

| Phase | Focus            | Outcome                                                                                | Timeline |
| ----- | ---------------- | -------------------------------------------------------------------------------------- | -------- |
| 1     | Foundation       | Docker dev env, Prisma schema, env validation, Express bootstrap, Pino logger, CI base | Week 1   |
| 2     | Auth & Security  | JWT access/refresh flow, httpOnly cookies, CSRF, rate limiting, Zod DTOs, Supertest    | Week 2   |
| 3     | Core Tracking    | Progress CRUD, React Query hooks, IDB offline queue, optimistic UI, conflict resolver  | Week 3   |
| 4     | Co-Reading & WS  | Socket.io setup, Redis adapter, room lifecycle, page sync, acks, Playwright E2E        | Week 4   |
| 5     | A11y & Polish    | WCAG audit, theme engine, reduced motion, keyboard nav, Sentry integration             | Week 5   |
| 6     | Production Ready | Docker multi-stage, Trivy scan, staging deploy, load test, runbooks, backup strategy   | Week 6   |

### Risk Mitigation

- DB migration failures → `prisma migrate resolve` + rollback scripts.
- WS memory leaks → Redis adapter + periodic connection audits.
- Offline sync conflicts → deterministic LWW + manual override UI.
- Secret leaks → `.gitignore`, pre-commit hooks, cloud secret manager.

---

## 9. Immediate Next Steps

1. Initialize backend, Docker, Prisma, and env validation.
2. Choose deployment target based on your environment.
3. Select the first full production feature to generate code for.

### Recommended next feature

- `🔐 Auth Flow` for secure application foundation.
- `📖 Offline Tracker` for core user experience.
- `🤝 Co-Reading Rooms` for real-time differentiation.
- `📊 CI/CD & Docker Pipeline` for safe production release.
