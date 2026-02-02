import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<BrowserRouter>
<ScrollToTop />
    <App />  
</BrowserRouter>
  </StrictMode>,
)


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force le scroll en haut de la page (0,0)
    window.scrollTo(0, 0);
  }, [pathname]); // Se déclenche à chaque changement de route

  return null;
}