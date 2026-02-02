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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react"; // Shadcn/Lucide spinner


// Liste des 18 modules pour Math-Info
// const modules = [
//   { name: "Algèbre", category: "Math" },
//   { name: "Analyse", category: "Math" },
//   { name: "Probabilités & Statistiques", category: "Math" },
//   { name: "Recherche Opérationnelle", category: "Math" },
//   { name: "Analyse de Données", category: "Math" },
//   { name: "Algorithmique", category: "Info" },
//   { name: "Programmation C", category: "Info" },
//   { name: "Système d'Exploitation", category: "Info" },
//   { name: "Structures de Données", category: "Info" },
//   { name: "Programmation Web", category: "Info" },
//   { name: "Bases de Données", category: "Info" },
//   { name: "Prog. Objet (C++/Java)", category: "Info" },
//   { name: "Réseaux Informatiques", category: "Info" },
//   { name: "Génie Logiciel & Agile", category: "Info" },
//   { name: "Compilation", category: "Info" },
//   { name: "Microservices & JEE", category: "Info" },
//   { name: "Architecture des Ordinateurs", category: "Info" },
//   { name: "Électronique Numérique & Analog.", category: "Info" },
// ]


// Données fictives pour correspondre à ton image
// const historyData = [
//   { date: "15/01/2026", filiere: "Math-Info", moyenne: "15.40", recommandation: "Master IA et Big Data", score: "94%" },
//   { date: "15/01/2026", filiere: "Math-Info", moyenne: "14.80", recommandation: "Master Securite", score: "82%" },
//   { date: "15/01/2026", filiere: "Math-Info", moyenne: "14.20", recommandation: "Master IOT", score: "75%" },
// ]

export default function History() {
const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/predict/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistoryData(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

// Show a loading spinner while fetching
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2 font-bold">
        <Loader2 className="animate-spin size-6 text-purple-700" />
        Chargement de l'historique...
      </div>
    );
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
                    Historique
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
      <div className="flex flex-1 flex-col gap-4 px-8 pb-8 pt-2">
          {/* Header de la section */}
          <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight">Historique des Simulations</h1>

            <p className="text-sm text-muted-foreground">
               Retrouvez ici toutes vos analyses précédentes et l'évolution de vos recommandations.
            </p>
          </div>
                <Separator />

{/* Tableau avec bordures et styles identiques à SaisirNotes */}
          <div className="rounded-md border bg-white shadow-sm mt-4 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-black px-6">Date</TableHead>
                  <TableHead className="font-bold text-black text-center">Filière</TableHead>
                  <TableHead className="font-bold text-black text-center">Moyenne</TableHead>
                  <TableHead className="font-bold text-black">Recommandation n°1</TableHead>
                  <TableHead className="font-bold text-black text-center">Score</TableHead>
                  <TableHead className="font-bold text-black text-right pr-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.length > 0 ? (historyData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-slate-50/30">
                    <TableCell className="px-6 py-4 font-medium">{row.date}</TableCell>
                    <TableCell className="text-center">{row.filiere}</TableCell>
                    <TableCell className="text-center font-bold">{row.moyenne}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{row.recommandation}</TableCell>
                    <TableCell className="text-center font-bold">{row.score}</TableCell>
                    <TableCell className="text-right pr-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => console.log("Voir sim ID:", row.id)}
                        className="inline-block"
                      >
                        <Button 
                          className="bg-black text-white hover:bg-zinc-800 rounded-md px-4 py-1 h-8 text-xs font-bold shadow-sm cursor-pointer"
                        >
                          Voir détails
                        </Button>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ))) : (<TableRow>
          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
            Aucune simulation trouvée.
          </TableCell>
        </TableRow>)

              }
              </TableBody>
            </Table>
          </div>
        </div>
        {/*NEW-end :*/}



      </SidebarInset>
    </SidebarProvider>
  )
}

