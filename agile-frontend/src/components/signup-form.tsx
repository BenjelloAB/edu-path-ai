"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// LOGIC IMPORTS
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router-dom"


import { AlertCircle } from "lucide-react"
import { useState } from "react"
import axios from "axios"

// 1. REGISTER SCHEMA WITH PASSWORD MATCH CHECK
const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"], // Sets the error specifically on the confirm field
})

type SignupFormValues = z.infer<typeof signupSchema>


export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {


const navigate = useNavigate()
const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

const onSubmit = async (data: SignupFormValues) => {
setServerError(null)
    try {
      const BASE_URL = "http://localhost:5000"
      
      console.log("data: ", data);
      // 1. Send name, email AND password
        await axios.post(`${BASE_URL}/api/auth/register`, {
            nom: data.name,
            email: data.email,
            password: data.password // Sending raw (HTTPS will encrypt this)
        })
  
      // 2. Silent Login
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: data.email,
            password: data.password
        })

      if (loginRes.data.access_token) {
        localStorage.setItem("token", loginRes.data.access_token)
        navigate("/onboarding")
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setServerError("Cet email est déjà utilisé. Veuillez vous connecter.")
      } else {
        setServerError("Une erreur serveur est survenue.")
      }
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Créer un compte</CardTitle>
        <CardDescription>
          Entrez vos informations pour creer votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-3">

            {/* YELLOWISH WARNING BOX */}
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium animate-in fade-in zoom-in duration-200">
                <AlertCircle className="h-4 w-4" />
                {serverError}
              </div>
            )}
            {/*FullName: */}
            <Field>
              <FieldLabel htmlFor="name">Nom Complet</FieldLabel>
              <Input id="name" 
              type="text" 
              placeholder="Nom et Prénom" 
              {...register("name")}
              className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.name && <p className="text-sm text-red-500 font-bold mt-1">{errors.name.message}</p>}
            </Field>

            {/* Email: */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                // type="email"
                placeholder="m@example.com"
                {...register("email")}
                className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
              />

{!errors.email && (
                <FieldDescription>
                  Nous utiliserons cette adresse pour vous contacter.
                </FieldDescription>
              )}
              {errors.email && <p className="text-sm text-red-500 font-bold mt-1">{errors.email.message}</p>}

            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input 
              id="password" 
              type="password" 
              {...register("password")}
              className={cn(errors.password && "border-red-500 focus-visible:ring-red-500")}
              />

{!errors.password && (
                <FieldDescription>Doit contenir au moins 8 caractères.</FieldDescription>
              )}
              {errors.password && <p className="text-sm text-red-500 font-bold mt-1">{errors.password.message}</p>}
            

            </Field>

            {/* Confirm Password*/}
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmer Mot de passe
              </FieldLabel>
              <Input 
              id="confirm-password" 
              type="password" 
              {...register("confirmPassword")}
                className={cn(errors.confirmPassword && "border-red-500 focus-visible:ring-red-500")} 
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 font-bold mt-1">{errors.confirmPassword.message}</p>
              )}
              {!errors.confirmPassword && <FieldDescription>Veuillez confirmer votre mot de passe.</FieldDescription>}
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit">Créer un compte</Button>
                <Button variant="outline" type="button">
                  Créer compte avec Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Déjà inscrit ?  <Link to="/login">Se connecter</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
