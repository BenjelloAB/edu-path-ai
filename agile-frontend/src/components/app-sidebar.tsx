"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileEdit,
  History,
  User,
  LogOut,
  GraduationCap,
  BarChart3,
  Trophy,
  Settings2
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

// // 1. Your Real Application Data
// const data = {
//   // We'll pass this to NavUser to show your name/major
//   user: {
//     name: localStorage.getItem("user_name") || "Étudiant",
//     email: localStorage.getItem("user_filiere") || "Licence non définie",
//     avatar: "", // Can be empty or a default user icon
//   },
//   // Simplified Navigation: No sub-items (lists)
//   navMain: [
//     {
//       title: "Tableau de Bord",
//       url: "/dashboard",
//       icon: LayoutDashboard,
//       isActive: true,
//     },
//     {
//       title: "Saisir mes Notes",
//       url: "/saisir-notes",
//       icon: FileEdit,
//     },
//     {
//       title: "Historique",
//       url: "/historique",
//       icon: History,
//     },
//     {
//       title: "Mon Profil",
//       url: "/mon-profil",
//       icon: Settings2,
//     },
//     {
//       title: "Résultas",
//       url: "/resultats",
//       icon: Trophy,
//     }
//   ],
// }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
// 1. Create a state for the user data
  const [userData, setUserData] = useState({
    name: "Étudiant",
    email: "Licence non définie",
    avatar: "",
  })

  // 2. Create a function to sync data from localStorage
  const syncUser = () => {
    // Note: We check if window is defined to avoid errors in Next.js SSR
    if (typeof window !== "undefined") {
      setUserData({
        name: localStorage.getItem("user_name") || "Étudiant",
        email: localStorage.getItem("user_filiere") || "Licence non définie",
        avatar: "",
      })
    }
  }

  // 3. Listen for changes
  useEffect(() => {
    syncUser() // Run once on mount

    // This listens for the window.dispatchEvent(new Event("storage")) 
    // that you added to your Profile update function
    window.addEventListener("storage", syncUser)
    
    return () => window.removeEventListener("storage", syncUser)
  }, [])

  // 4. Move your navigation data inside or keep it outside if it's static
  const navMain = [
    { title: "Tableau de Bord", url: "/dashboard", icon: LayoutDashboard, isActive: true },
    { title: "Saisir mes Notes", url: "/saisir-notes", icon: FileEdit },
    { title: "Historique", url: "/historique", icon: History },
    { title: "Mon Profil", url: "/mon-profil", icon: Settings2 },
    { title: "Résultats", url: "/resultats", icon: Trophy }
  ]
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Replace TeamSwitcher with a simple Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-white">
            <GraduationCap size={20} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm tracking-tight">ORIENTATION IA</span>
            <span className="text-[10px] text-muted-foreground uppercase">Smart Academic</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* We keep NavMain but it will render single buttons now */}
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}