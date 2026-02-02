import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import {SignupForm} from "@/components/signup-form"
import {OnboardingForm} from "@/components/onboarding-form"
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
// import {AppSidebar} from "@/components/app-sidebar"
import DashboardPage from "./pages/dashboard/Dashboard";
import SaisirNotes from "./pages/grades/SaisirNotes";
import History from "./pages/history/History";
import  MonProfile from "./pages/settings/MonProfile";
import Results from "./pages/results/Results"

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"


function App() {
  return (

      <>
      <Routes>

          {/* Redirige la racine vers le login par défaut */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Route pour la connexion */}
          <Route path="/login" element={
<div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-sm">
            <LoginForm />
            </div>
            </div>

          } />
          
          {/* Route pour l'inscription (placeholder en attendant le composant) */}
          <Route path="/register" element={
<div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-sm">

            <SignupForm/>
            </div>
            </div>

          } />
          
          {/* Route pour l'onboarding (après succès login) */}
          <Route path="/onboarding" element={
            <div className="flex min-h-svh items-center justify-center">
      <div className="w-full max-w-sm">
            <OnboardingForm/>
            </div>
            </div>

          } />

          {/* Route Dashboard (Le futur coeur de l'app) */}
          <Route path="/dashboard" element={<DashboardPage/>} />
          <Route path="/saisir-notes" element={<SaisirNotes/>} />
          <Route path="/mon-profil" element={<MonProfile/>} />
          <Route path="/historique" element={<History/>} />
          <Route path="/resultats" element={<Results/>} />





        </Routes>
        <Toaster />
        </>
    
   
  )
}






export default App
