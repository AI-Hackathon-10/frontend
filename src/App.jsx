import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import HomePage from './pages/HomePage.jsx'
import ImageIdentifyPage from './pages/ImageIdentifyPage.jsx'
import SearchResultsPage from './pages/SearchResultsPage.jsx'
import ShapeSearchPage from './pages/ShapeSearchPage.jsx'
import SymptomPage from './pages/SymptomPage.jsx'
import DrugDetailPage from './pages/DrugDetailPage.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/identify/image" element={<ImageIdentifyPage />} />
        <Route path="/identify/shape" element={<ShapeSearchPage />} />
        <Route path="/search/results" element={<SearchResultsPage />} />
        <Route path="/drugs/:drugId" element={<DrugDetailPage />} />
        <Route path="/symptoms" element={<SymptomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
