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
// import { Layers, FileText, GraduationCap, LayoutDashboard, Pi, Binary, Bot, Cpu, Network } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { useEffect, useState } from "react"
import axios from "axios"
// Icons mapping
import { 
  Layers, FileText, GraduationCap, LayoutDashboard, 
  Pi, Binary, Bot, Cpu, Network, Dna, Beaker, Mountain, Terminal 
} from "lucide-react"

import { Loader2 } from "lucide-react";


// --- Helper: Dynamic Icon Logic ---
const getCategoryIcon = (category: string | null | undefined) => {
  // Use a fallback empty string and handle null cases safely
  const cat = (category || "general").toLowerCase();

  if (cat === "math") return <Pi className="size-6 text-blue-600" />;
  if (cat === "info") return <Binary className="size-6 text-green-600" />;
  if (cat === "ai" || cat.includes("ml")) return <Bot className="size-6 text-purple-600" />;
  if (cat === "physique") return <Cpu className="size-6 text-orange-600" />;
  if (cat === "biologie") return <Dna className="size-6 text-emerald-600" />;
  if (cat === "chimie") return <Beaker className="size-6 text-pink-600" />;
  if (cat === "géologie") return <Mountain className="size-6 text-amber-700" />;
  
  // Default icon for "General" or null categories
  return <Terminal className="size-6 text-slate-500" />;
};


// // Données pour l'histogramme[new]
// const chartData = [
//   { module: "Stat", note: 16 },
//   { module: "Proba", note: 17 },
//   { module: "UML", note: 5 },
//   { module: "Lang C", note: 7.5 },
//   { module: "Analyse", note: 6.8 },
//   { module: "Algebre", note: 10 },
//   { module: "Sys Exp", note: 18.5 },
//   { module: "Reseau", note: 5 },
//   { module: "Linux", note: 6.5 },
//   { module: "ML", note: 17.5 },
//   { module: "NLP", note: 17 },
//   { module: "Merise", note: 12 },
// ]

export default function DashboardPage() {
const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        // const path = "http://localhost:5000/api/student/dashboard-summary" //dev
        const path = "/api/student/dashboard-summary" //prod

        const res = await axios.get(path, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(res.data);
        setData(res.data);

      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


if (loading) {
  return (
<div className="flex h-screen w-full items-center justify-center gap-2 font-bold">
        <Loader2 className="animate-spin size-6 text-purple-700" />
        Chargement du tableau de bord...
      </div>)

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
                    Table au de Bord
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


     {/*   <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />

        </div>*/}

        {/*NEW :*/}
        <div className="flex flex-1 flex-col gap-8 p-8 pt-4">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Bonjour {data?.student_name || "Étudiant"}, prêt pour votre orientation ?</h1>
      </div>
      
      <Separator />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-3">
          <div className="rounded-md border bg-white px-4 py-2 text-sm text-muted-foreground">
            Filiere : {data?.filiere || "Non définie"}
          </div>
          <Button className="bg-[#18181B] text-white hover:bg-black">
            Lancer une nouvelle simulation
          </Button>
        </div>
      </div>

      {/* LES 4 CARTES MÉTRIQUES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Moyenne Generale" 
          value={`${data?.moyenne || "0.00"}/20`} 
          description="Moyenne calculée sur l'ensemble des modules" 
          icon={<Layers className="size-4 text-muted-foreground" />} 
        />
        <MetricCard 
          title="Modules Saisis" 
          value={`${data?.modules_count || 0}/${data?.total_modules || 18}`}
          description="Nombre de matières remplies pour l'analyse IA." 
          icon={<FileText className="size-4 text-muted-foreground" />} 
        />
        <MetricCard 
          title="Pôle Dominant" 
          value={data?.pole_dominant || "N/A"}
          description="Le domaine avec les meilleurs résultats." 
          icon={<GraduationCap className="size-4 text-muted-foreground" />} 
        />
        <MetricCard 
          title="Master Prédit" 
          value={data?.master_predit || "N/A"}
          description="La recommandation n°1 actuelle de notre algorithme" 
          icon={<LayoutDashboard className="size-4 text-muted-foreground" />} 
        />
      </div>

      {/* SECTION GRAPHIQUE + PERFORMANCE */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Histogramme Répartition */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Répartition de votre Performance par module</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chartData || []}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis 
                    dataKey="module" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0}        // Show every label
                    angle={-60}        // Rotate 90 degrees
                    textAnchor="end"   // Align text correctly
                    height={80}        // Extra space for the labels
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 20]}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Bar dataKey="note" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Liste Performance */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Performance</CardTitle>
            <CardDescription>Les matières où vous avez le plus de potentiel</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">

           {/* <PerformanceItem icon={<Pi className="size-8" />} title="Probabilité" desc="Maîtrise avancée des concepts statistiques." note="18,00/20" />
            <PerformanceItem icon={<Binary className="size-8" />} title="Lang C" desc="Excellente logique de programmation structurée." note="17,60/20" />
            <PerformanceItem icon={<Bot className="size-8" />} title="Machine Learning" desc="Très bonne compréhension des modèles prédictifs." note="16,00/20" />
            <PerformanceItem icon={<Cpu className="size-8" />} title="Systeme d'exploitation" desc="Compréhension approfondie de la gestion mémoire." note="15,95/20" />
            <PerformanceItem icon={<Network className="size-8" />} title="UML/Merise" desc="Capacité d'analyse et de modélisation de systèmes." note="15,50/20" />*/}
          {data?.top_modules?.map((mod: any, index: number) => (
                  <PerformanceItem 
                    key={index}
                    icon={getCategoryIcon(mod.categorie)} 
                    title={mod.module} 
                    desc={`Catégorie: ${mod.categorie}`} 
                    note={`${mod.note.toFixed(2)}/20`} 
                  />
                ))}

          </CardContent>
        </Card>

      </div>
    </div>
        {/*NEW-end :*/}



      </SidebarInset>
    </SidebarProvider>
  )
}

// Composant réutilisable pour les petites cartes
function MetricCard({ title, value, description, icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

// Composant réutilisable pour la liste de performance
function PerformanceItem({ icon, title, desc, note }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted/50">
          {icon}
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-bold leading-none">{title}</p>
          <p className="text-xs text-muted-foreground leading-snug max-w-[200px]">{desc}</p>
        </div>
      </div>
      <div className="font-bold text-sm">{note}</div>
    </div>
  )
}