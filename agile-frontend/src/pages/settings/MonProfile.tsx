"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"


import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"


//new imports 
import { Save, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useEffect, useState } from "react"
import { toast } from "sonner" // or your preferred toast library
import { Loader2 } from "lucide-react"

// 1. Définition du schéma de validation avec Zod
const profileSchema = z.object({
  fullname: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  email: z.string().email("Adresse email invalide"),
  filiere: z.string().min(1, "Veuillez sélectionner une filière"),
  etablissement: z.string().min(1, "Veuillez sélectionner un établissement"),
  annee: z.string().min(1, "Veuillez sélectionner votre année"),
  newPassword: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>

export default function MonProfile() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
// 2. Initialisation du formulaire
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
defaultValues: {
      fullname: "",
      email: "",
      filiere: "",
      etablissement: "",
      annee: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
console.log(localStorage.getItem('token'))

// 1. Fetch current data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        // const path ="http://localhost:5000/api/student/me" //dev
        const path = "/api/student/me" //prod
        const res = await axios.get(path, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        console.log(res.data)

        // Reset form with values from backend
        form.reset({
          fullname: res.data.nom,
          email: res.data.email,
          filiere: res.data.filiere_actuelle,
          etablissement: res.data.etablissement || "",
          annee: res.data.annee_actuelle || "",
          newPassword: "",
          confirmPassword: "",
        })
      } catch (err) {
        toast.error("Erreur lors du chargement du profil",{
           style: {
    border: "1px solid #f87171",   // red-400
    padding: "16px",
    color: "#7f1d1d",              // red-900
    background: "#fef2f2",         // red-50
  },
        })
        console.log(err)
      } finally {
        setIsPageLoading(false)
      }
    }
    fetchProfile()
  }, [form])

// 2. Submit changes
  async function onSubmit(values: ProfileFormValues) {
setIsSubmitting(true);
document.body.style.cursor = 'wait';
    console.log(values)
    try {
      const token = localStorage.getItem("token")
      // Normalize the filiere for MODULES_CONFIG (e.g., "Math-Info" -> "math-info")
      const normalizedFiliere = values.filiere.toLowerCase();
      // const path = 'http://localhost:5000/api/student/edit-profile' //dev
      const path ='/api/student/edit-profile' //prod
      const response = await axios.put(
        path, 
        {
          nom: values.fullname,
          email: values.email,
          filiere: values.filiere,
          etablissement: values.etablissement,
          annee: values.annee,
          password: values.newPassword // Only if you handle password in backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // --- THE FIX STARTS HERE ---
    // 1. Update localStorage so SaisiNotes and Sidebar get new data
      
    localStorage.setItem("user_filiere", normalizedFiliere);
    localStorage.setItem("user_name", values.fullname);

    // 2. Trigger a storage event to alert other components
    window.dispatchEvent(new Event("storage"));
    // --- THE FIX ENDS HERE ---
      toast.success(response.data.msg,{
                  style: {
              border: "1px solid #4ade80",   // green-400
              padding: "16px",
              color: "#166534",              // green-800
              background: "#f0fdf4",         // green-50
            },
      })
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Erreur de mise à jour", {
         style: {
    border: "1px solid #f87171",   // red-400
    padding: "16px",
    color: "#7f1d1d",              // red-900
    background: "#fef2f2",         // red-50
  },
      })
    }finally {
      setIsSubmitting(false); // 2. Stop loading (enables cursor/button)
      document.body.style.cursor = 'default';
    }

  }

  if (isPageLoading) {
    return (
<div className="flex h-screen w-full items-center justify-center gap-2 font-bold">
        <Loader2 className="animate-spin size-6 text-purple-700" />
        Chargement de votre profil...
      </div>
    )
  }


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                  Mon Profil
                    </BreadcrumbLink>
                </BreadcrumbItem>
{/*                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Aperçu</BreadcrumbPage>
                </BreadcrumbItem>*/}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {/* YOUR DASHBOARD CONTENT GOES HERE */}


        {/*NEW :*/}
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-1 flex-col gap-4 px-8 pb-8 pt-2 max-w-4xl">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">Paramètres du Profil</h1>
            <p className="text-sm text-muted-foreground">
              Gérez vos informations personnelles, vos préférences académiques et la sécurité de votre compte.
            </p>
          </div>
          <Separator />

          {/* Section Informations Personnelles */}
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel className="font-bold">Nom Complet</FormLabel>
                  <FormControl>
                    <Input {...field} className="max-w-md" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel className="font-bold">Adresse Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className="max-w-md" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section Parcours de Formation */}
          <div className="space-y-6 mt-4">
            <h2 className="text-2xl font-bold">Parcours de Formation</h2>
            <div className="grid gap-6">
              
              <FormField
                control={form.control}
                name="filiere"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="font-bold">Filière</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Sélectionnez votre filière" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Math-Info">Licence Math-Info L3</SelectItem>
                        <SelectItem value="BCG">Licence BCG</SelectItem>
                        <SelectItem value="Physique">Licence Physique</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Répétez pour Etablissement et Année... */}
              <FormField
                control={form.control}
                name="etablissement"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="font-bold">Établissement / École</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Sélectionnez votre établissement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
<SelectItem value="FST">FST (Faculté des Sciences et Techniques)</SelectItem>
  <SelectItem value="FS">FS (Faculté des Sciences)</SelectItem>
  <SelectItem value="EST">EST (École Supérieure de Technologie)</SelectItem>

                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annee"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="font-bold">Année Actuelle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Année d'étude" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
<SelectItem value="L1">L1 (1ère année)</SelectItem>
  <SelectItem value="L2">L2 (2ème année)</SelectItem>
  <SelectItem value="L3">L3 (3ème année / Diplôme)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section Sécurité */}
          <div className="space-y-6 mt-4">
            <h2 className="text-2xl font-bold">Changer Mot de Passe</h2>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="font-bold">Nouveau Mot de Passe</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" className="max-w-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="font-bold">Confirmer Mot de Passe</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" className="max-w-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-6">
            <Button type="submit" className="bg-[#18181B] text-white hover:bg-black px-4 py-2 text-sm cursor-pointer">
              {/*Sauvegarder les Changements*/}
            {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Sauvegarder les Changements"
        )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
        {/*NEW-end :*/}



      </SidebarInset>
    </SidebarProvider>
  )
}

