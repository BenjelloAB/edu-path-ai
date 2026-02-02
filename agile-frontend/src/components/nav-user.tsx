import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Settings2,
  User,
  GraduationCap,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"




export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
  }
}) {
  const { isMobile } = useSidebar()
const navigate = useNavigate()

  const handleLogout = () => {
    // 1. Clear the local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user_filiere")
    
    // 2. Redirect to login page
    navigate("/login")
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              
{/*              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>*/}
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                <User className="size-5" />
              </div>


              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name || "Étudiant"}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
{/*                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>*/}

              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                  <GraduationCap className="size-5 text-muted-foreground" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/*<DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>*/}
            <DropdownMenuGroup>
              {/* OPTION PARAMÈTRES AVEC L'ICÔNE QUE TU AS DEMANDÉ */}
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/mon-profil')}>
                <Settings2 className="mr-2 size-4" />
                Paramètres
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" 
              onClick={handleLogout}>
              <LogOut className="mr-2 size-4"/>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
