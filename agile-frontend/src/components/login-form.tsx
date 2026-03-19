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


import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

import { AlertCircle } from "lucide-react"
import {useState} from "react"

// Schema
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"), // Kept for UI, but Flask logic is email-based
})

type LoginFormValues = z.infer<typeof loginSchema>


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  //adding logic for validation and sending to server
  const navigate = useNavigate()

  const [serverError, setServerError] = useState<string | null>(null) // State for the warning

// Initialisation du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log(data)

      // BASE_URL with the ip of current machine
      // const BASE_URL = "http://localhost:5000"  // dev
      
      // const path1 = "http://localhost:5000/api/auth/login" //dev
      const path1 = "/api/auth/login" //prod

      const response = await axios.post(path1, {
        email: data.email,
        password: data.password
      })

      if (response.data.access_token) {
        // 1. Store the JWT Token

        
      localStorage.setItem("token", response.data.access_token)
      localStorage.setItem("user_name", response.data.nom)
      localStorage.setItem("user_filiere", response.data.filiere)
      localStorage.setItem("user_email", response.data.email)
        
      // 2. Check user status to decide where to go
      // const path2 = "http://localhost:5000/api/auth/user-status" //dev
      const path2 = "/api/auth/user-status" //prod

      const statusRes = await axios.get(path2, {
          headers: { Authorization: `Bearer ${response.data.access_token}` }
        })

        if (statusRes.data.isProfileComplete) {
          navigate("/dashboard")
        } else {
          navigate("/onboarding")
        }
      }
    } catch (error: any) {
const status = error.response?.status;

      if (status === 404) {
        setServerError("Compte non trouvé. Veuillez vous inscrire.");
      } else if (status === 401) {
        setServerError("Mot de passe incorrect. Veuillez réessayer.");
      } else if (status === 400) {
        setServerError("Données invalides. L'email et le mot de passe sont requis.");
      } else {
        // This covers 500 errors or network issues (backend not running)
        setServerError("Erreur de connexion au serveur. Vérifiez votre réseau.");
      }
      
      console.error("Erreur API Details:", error.response?.data || error.message);
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Connexion à votre compte</CardTitle>
          <CardDescription>
          Entrez votre email ci-dessous pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>

          {/* handleSubmit of React-hook-form*/}
          <form onSubmit={handleSubmit(onSubmit)}>
          
            <FieldGroup>

            {/* YELLOWISH WARNING BOX */}
              {serverError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium animate-in fade-in zoom-in duration-200">
                  <AlertCircle className="h-4 w-4" />
                  {serverError}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  placeholder="m@exemple.com"
                  {...register("email")} //connect to zod
                  className={cn(errors.password && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {errors.email && (<p className="text-sm text-red-500 font-bold mt-1">{errors.email.message}</p>)}
                
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                     Mot de passe oublié ?
                  </Link>
                </div>
                <Input id="password" type="password" 
                  {...register("password")} // connect to zod
                  className={cn(errors.password && "border-red-500 focus-visible:ring-red-500")}
                 />
                  {errors.password && (<p className="text-sm text-red-500 font-bold mt-1">{errors.password.message}</p>) }
              </Field>

              
              <Field>
                <Button type="submit">Se connecter</Button>
                <Button variant="outline" type="button">
                  Se connecter avec Google
                </Button>
                <FieldDescription className="text-center">
                   Vous n&apos;avez pas de compte ?{" "}
                   <Link to="/register">S'&apos;incrire</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>


        </CardContent>
      </Card>
    </div>
  )
}

