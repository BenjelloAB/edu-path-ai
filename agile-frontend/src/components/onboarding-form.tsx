"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// LOGIC
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner" 

const onboardingSchema = z.object({
  filiere: z.string({ required_error: "Veuillez choisir une filière" }),
  etablissement: z.string({ required_error: "Veuillez choisir un établissement" }),
  annee: z.string({ required_error: "Veuillez choisir votre année" }),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export function OnboardingForm() {
  const navigate = useNavigate()

const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      filiere: "",
      etablissement: "",
      annee: ""
    }
  })
  const onSubmit = async (data: OnboardingValues) => {
    try {
      const BASE_URL = "http://localhost:5000";
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }
    console.log("Data: ",data)
    console.log("token: ", token)
    // 1. Send to Backend
    await axios.post(
      `${BASE_URL}/api/student/onboarding`, 
      {
        filiere: data.filiere,
        etablissement: data.etablissement,
        annee: data.annee
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    // 2. Trigger the custom success toast
    toast.success("Profil configuré avec succès ! Données envoyées à l'IA.", {
      style: {
        border: "1px solid #4ade80",   // green-400
        padding: "16px",
        color: "#166534",              // green-800
        background: "#f0fdf4",         // green-50
      },
    });

    // 3. Local storage & Navigation
    localStorage.setItem("user_filiere", data.filiere);
    
    // Give the user a moment to see the toast before moving
    setTimeout(() => {
        navigate("/dashboard");
    }, 1500);

    } catch (error: any) {
     // ERROR CASE: Get the message from Flask or use a fallback
    const errorMsg = error.response?.data?.msg || "Une erreur est survenue.";
    const status = error.response?.status;
    
if (status === 401) {
    // 1. TOKEN EXPIRED CASE
    toast.error("Votre session a expiré. Redirection vers la connexion...", {
      style: {
        border: "1px solid #f87171",
        padding: "16px",
        color: "#991b1b",
        background: "#fef2f2",
      },
    });

    // Clear local storage and navigate after 2 seconds
    localStorage.removeItem("token");
    setTimeout(() => {
      navigate("/login");
    }, 2000);

  }else {
    // 2. OTHER ERRORS (Server crash, validation, etc.)
    // No navigate() here, user stays on the page
    toast.error(errorMsg, {
      style: {
        border: "1px solid #f87171",
        padding: "16px",
        color: "#991b1b",
        background: "#fef2f2",
      },
    });
  }
    
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">Configurez votre profil</CardTitle>
        <CardDescription>
          Ces informations permettent d'ajuster l'IA à votre parcours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-6">
            
            {/* FILIERE */}
            <Field>
              <FieldLabel>Choisir votre filière</FieldLabel>
              <Controller
                control={control}
                name="filiere"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={cn(errors.filiere && "border-red-500 border-2")}>
                      <SelectValue placeholder="Sélectionnez une licence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Math-Info">Licence Mathématiques-Informatique</SelectItem>
                      <SelectItem value="Physique">Licence Physique</SelectItem>
                      <SelectItem value="BCG">Licence BCG (Biologie, Chimie, Géologie)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.filiere && <p className="text-sm text-red-500 font-bold mt-1">{errors.filiere.message}</p>}
            </Field>

            {/* ETABLISSEMENT */}
            <Field>
              <FieldLabel>Établissement / École</FieldLabel>
              <Controller
                control={control}
                name="etablissement"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={cn(errors.etablissement && "border-red-500 border-2")}>
                      <SelectValue placeholder="Sélectionnez votre école" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FST">FST (Faculté des Sciences et Techniques)</SelectItem>
                      <SelectItem value="FS">FS (Faculté des Sciences)</SelectItem>
                      <SelectItem value="EST">EST (École Supérieure de Technologie)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.etablissement && <p className="text-sm text-red-500 font-bold mt-1">{errors.etablissement.message}</p>}
            </Field>

            {/* ANNEE */}
            <Field>
              <FieldLabel>Année Actuelle</FieldLabel>
              <Controller
                control={control}
                name="annee"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={cn(errors.annee && "border-red-500 border-2")}>
                      <SelectValue placeholder="Sélectionnez votre année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L1">L1 (1ère année)</SelectItem>
                      <SelectItem value="L2">L2 (2ème année)</SelectItem>
                      <SelectItem value="L3">L3 (3ème année / Diplôme)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.annee && <p className="text-sm text-red-500 font-bold mt-1">{errors.annee.message}</p>}
            </Field>

            <Button type="submit" className="bg-[#4F46E5] hover:bg-[#4338CA] w-full mt-4">
              Enregistrer mon profil
            </Button>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}