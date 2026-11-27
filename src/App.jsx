import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ROLE } from './lib/constants'
import PublicLayout from './components/layout/PublicLayout'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ChangePassword from './pages/auth/ChangePassword'
const DevAccounts = import.meta.env.DEV
  ? lazy(() => import('./pages/auth/DevAccounts'))
  : null
import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'

import StudentDashboard from './pages/student/StudentDashboard'
import Catalog from './pages/student/Catalog'
import BookDetail from './pages/student/BookDetail'
import MyLoans from './pages/student/MyLoans'
import MyFines from './pages/student/MyFines'

import LibrarianDashboard from './pages/librarian/LibrarianDashboard'
import ManageBooks from './pages/librarian/ManageBooks'
import ManageLoans from './pages/librarian/ManageLoans'
import ManageRequests from './pages/librarian/ManageRequests'
import ManageStudents from './pages/librarian/ManageStudents'
import ManageFines from './pages/librarian/ManageFines'

import SuperDashboard from './pages/super/SuperDashboard'
import ManageLibrarians from './pages/super/ManageLibrarians'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function StudentOrStaff({ studentPage: StudentPage, staffPage: StaffPage }) {
  const { user } = useAuth()
  if (user?.role === ROLE.STUDENT) return StudentPage
  return StaffPage
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {DevAccounts && (
            <Route
              path="/dev/accounts"
              element={<Suspense fallback={<p className="container-page py-10">Loading test accounts…</p>}><DevAccounts /></Suspense>}
            />
          )}
        </Route>

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={[ROLE.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute roles={[ROLE.STUDENT]}>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/:id"
            element={
              <ProtectedRoute roles={[ROLE.STUDENT]}>
                <BookDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/loans"
            element={
              <StudentOrStaff studentPage={<MyLoans />} staffPage={<ManageLoans />} />
            }
          />
          <Route
            path="/fines"
            element={
              <StudentOrStaff studentPage={<MyFines />} staffPage={<ManageFines />} />
            }
          />

          <Route
            path="/librarian"
            element={
              <ProtectedRoute roles={[ROLE.LIBRARIAN]}>
                <LibrarianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute roles={[ROLE.LIBRARIAN, ROLE.SUPER]}>
                <ManageRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute roles={[ROLE.LIBRARIAN, ROLE.SUPER]}>
                <ManageBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute roles={[ROLE.LIBRARIAN, ROLE.SUPER]}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super"
            element={
              <ProtectedRoute roles={[ROLE.SUPER]}>
                <SuperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super/librarians"
            element={
              <ProtectedRoute roles={[ROLE.SUPER]}>
                <ManageLibrarians />
              </ProtectedRoute>
            }
          />

          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<RoleRedirect />} />
        </Route>

        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === ROLE.STUDENT) return <Navigate to="/student" replace />
  if (user.role === ROLE.LIBRARIAN) return <Navigate to="/librarian" replace />
  return <Navigate to="/super" replace />
}
