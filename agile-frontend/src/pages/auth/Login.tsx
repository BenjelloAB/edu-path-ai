"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 1. Define Validation Schema
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
})

export default function LoginPage() {
  const navigate = useNavigate()

  // 2. Initialize Form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // 3. Handle Submit
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      // API call to  Flask server
      // const response = await axios.post("http://<ip>:5000/login", values)

      if (response.data.success) {
        // A. Save to LocalStorage
        localStorage.setItem("user_name", response.data.user.name)
        localStorage.setItem("is_logged_in", "true")

        // B. Navigate to Onboarding
        navigate("/onboarding")
      }
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-bold text-center text-[#4F46E5] mb-2">Connexion</h1>
        <p className="text-center text-slate-500 mb-6">Entrez votre email pour vous connecter.</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nom@exemple.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA]">
              Se connecter
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-center text-sm">
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" className="text-[#4F46E5] hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}