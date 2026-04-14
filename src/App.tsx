import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ui/error-boundary";
import Home from "./components/home";

// Keep the public homepage on the critical path and defer secondary routes.
const LazyToaster = lazy(() => import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Catalog = lazy(() => import("./pages/Catalog"));
const MyBooks = lazy(() => import("./pages/MyBooks"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Messages = lazy(() => import("./pages/Messages"));

function App() {
  const location = useLocation();
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense
          fallback={
            <main role="main" aria-busy="true" className="flex h-screen w-full items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="font-medium text-gray-600">Loading page...</p>
              </div>
            </main>
          }
        >
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/catalog" element={<Catalog />} />

            {/* Protected Routes */}
            <Route
              path="/my-books"
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <LazyToaster />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
