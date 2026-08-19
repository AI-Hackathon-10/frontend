import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import { AuthProvider, useAuth } from './components/user/AuthProvider.jsx'
import HomePage from './pages/HomePage.jsx'
import ImageIdentifyPage from './pages/ImageIdentifyPage.jsx'
import SearchResultsPage from './pages/SearchResultsPage.jsx'
import ShapeSearchPage from './pages/ShapeSearchPage.jsx'
import SymptomPage from './pages/SymptomPage.jsx'
import DrugDetailPage from './pages/DrugDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyPage from './pages/MyPage.jsx'
import PasswordChangePage from './pages/PasswordChangePage.jsx'
import SignupPage from './pages/SignupPage.jsx'

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/identify/image" element={<ImageIdentifyPage />} />
          <Route path="/identify/shape" element={<ShapeSearchPage />} />
          <Route path="/search/results" element={<SearchResultsPage />} />
          <Route path="/drugs/:drugId" element={<DrugDetailPage />} />
          <Route path="/symptoms" element={<SymptomPage />} />
          <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />
          <Route path="/password" element={<RequireAuth><PasswordChangePage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </AuthProvider>
  )
}
