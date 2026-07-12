import { Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<PlaceholderPage type="explore" />} path="explore" />
        <Route element={<PlaceholderPage type="howItWorks" />} path="how-it-works" />
        <Route element={<PlaceholderPage type="stories" />} path="stories" />
        <Route element={<AuthPage mode="login" />} path="login" />
        <Route element={<AuthPage mode="register" />} path="register" />
        <Route element={<PlaceholderPage type="dashboard" />} path="dashboard" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default App
