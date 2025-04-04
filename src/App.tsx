
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import OffboardingTranslations from './pages/OffboardingTranslations'
import ShiftAllowanceTranslations from './pages/ShiftAllowanceTranslations'
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/offboarding" element={<OffboardingTranslations />} />
        <Route path="/shift-allowance" element={<ShiftAllowanceTranslations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
