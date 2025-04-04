
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import OffboardingTranslations from './pages/OffboardingTranslations'
import ShiftAllowanceTranslations from './pages/ShiftAllowanceTranslations'
import ModuleManagement from './pages/ModuleManagement'
import SectionManagement from './pages/SectionManagement'
import TranslationManagement from './pages/TranslationManagement'
import LanguageManagement from './pages/LanguageManagement'
import BackendCode from './pages/BackendCode'
import SidebarLayout from './components/SidebarLayout'
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SidebarLayout><Index /></SidebarLayout>} />
        <Route path="/offboarding" element={<SidebarLayout><OffboardingTranslations /></SidebarLayout>} />
        <Route path="/shift-allowance" element={<SidebarLayout><ShiftAllowanceTranslations /></SidebarLayout>} />
        <Route path="/module-management" element={<SidebarLayout><ModuleManagement /></SidebarLayout>} />
        <Route path="/section-management" element={<SidebarLayout><SectionManagement /></SidebarLayout>} />
        <Route path="/translation-management" element={<SidebarLayout><TranslationManagement /></SidebarLayout>} />
        <Route path="/language-management" element={<SidebarLayout><LanguageManagement /></SidebarLayout>} />
        <Route path="/backend-code" element={<SidebarLayout><BackendCode /></SidebarLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
