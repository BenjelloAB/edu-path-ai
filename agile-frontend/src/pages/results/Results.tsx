"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";
import { PlayCircle, Trophy, Medal } from "lucide-react"
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

// Simulation des données du backend
const COLORS = ["#22c55e", "#eab308", "#ef4444"]
const ICONS = [<Trophy className="text-yellow-500 size-6" />,  <Medal className="text-slate-400 size-6" />, <Medal className="text-orange-400 size-6" />]
const TOP_RECOMMENDATIONS = [
  {
    id: 1,
    title: "Master Intelligence Artificielle et Big Data",
    description: "Votre excellent niveau en [Pôle Dominant] fait de vous un candidat idéal pour ce parcours.",
    score: 95,
    color: "#22c55e", // Vert
    rank: "1",
    icon: <Trophy className="text-yellow-500 size-6" />
  },
  {
    id: 2,
    title: "Master Sécurité",
    description: "Une très bonne compatibilité avec vos résultats en réseaux et systèmes.",
    score: 75,
    color: "#eab308", // Jaune
    rank: "2",
    icon: <Medal className="text-slate-400 size-6" />
  },
  {
    id: 3,
    title: "Master MIAGE",
    description: "Un profil équilibré adapté à la gestion des systèmes d'information.",
    score: 48,
    color: "#ef4444", // Rouge
    rank: "3",
    icon: <Medal className="text-orange-400 size-6" />
  }
];

export default function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        // const path = "http://localhost:5000/api/predict/latest-results" //dev
        const path = "/api/predict/latest-results" //prod
        const res = await axios.get(path, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

// added to change later:
if (loading){

  return (
      <div className="flex h-screen w-full items-center justify-center gap-2 font-bold">
        <Loader2 className="animate-spin size-6 text-purple-700" />
        Analyse des résultats en cours...
      </div>
    );

} 
  if (!data) return <div className="flex h-screen items-center justify-center font-bold p-8">Aucun résultat trouvé. Veuillez lancer une simulation.</div>;

  // Map backend color logic
  const getColor = (rank: number) => {
    if (rank === 1) return "#22c55e"; // Emerald
    if (rank === 2) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

 // Composant pour le mini-graphique circulaire
  const CompatibilityChart = ({ score, color }: { score: number, color: string }) => {
    const data = [{ value: score, fill: color }];
    return (
      <div className="relative size-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={90 + (360 * score) / 100}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black">{score}%</span>
          <span className="text-[10px] text-muted-foreground uppercase">Compatibilité</span>
        </div>
      </div>
    );
  };

  // with gray bg:
//   const CompatibilityChart = ({ score, color }: { score: number; color: string }) => {
//   const data = [{ value: score }];

//   return (
//     <div className="relative size-32">
//       <ResponsiveContainer width="100%" height="100%">
//         <RadialBarChart
//           innerRadius="80%"
//           outerRadius="100%"
//           barSize={10}
//           data={data}
//           startAngle={90}
//           endAngle={-270}
//         >
//           {/* Échelle invisible mais cruciale pour le calcul des angles */}
//           <PolarAngleAxis
//             type="number"
//             domain={[0, 100]}
//             angleAxisId={0}
//             tick={false}
//           />
//           <RadialBar
//             dataKey="value"
//             cornerRadius={10}
//             fill={color}
//             // Background dessine l'anneau gris sur toute la circonférence (0 à 100)
//             background={{ fill: "#e2e8f0" }} 
//           />
//         </RadialBarChart>
//       </ResponsiveContainer>
      
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <span className="text-2xl font-black text-slate-900">{score}%</span>
//         <span className="text-[10px] font-bold text-muted-foreground uppercase">
//           Compatibilité
//         </span>
//       </div>
//     </div>
//   );
// };

  const recommendations = data.recommendations;

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
                    Résultats
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

        {/*NEW :*/}



      <div className="flex flex-1 flex-col gap-4 px-8 pb-8 pt-2">
          {/* Header de la section */}
          <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight">Vos Résultats d’Orientation IA</h1>

            <p className="text-sm text-muted-foreground">
              Analyse détaillée de votre profil académique
            </p>
          </div>
                <Separator />

          {/* Section Recommandation N°1 (Le grand bandeau) */}
          <div className="border-4 border-purple-700 rounded-xl p-8 bg-slate-50/50 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm">

                  {/*{TOP_RECOMMENDATIONS[0].icon}*/}
                {/* Intégration de l'Avatar avec ton PNG */}
                <Avatar className="h-10 w-10 rounded-none bg-transparent">
                  <AvatarImage 
                    src="/icons8-trophy-48.png" 
                    alt="Trophy Icon" 
                    className="object-contain" 
                  />
                  <AvatarFallback className="bg-transparent">#1</AvatarFallback>
                </Avatar>


                  RECOMMANDATION N°{recommendations[0].rank}
                </div>

                <h2 className="text-3xl font-bold text-slate-900">{recommendations[0].title}</h2>
                <p className="text-slate-600 max-w-xl leading-relaxed">
                  {recommendations[0].description}
                </p>
              </div>
              <CompatibilityChart score={recommendations[0].score} color={COLORS[0]} />
            </div>
          </div>

          {/* Section N°2 et N°3 (Côte à côte) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.slice(1).map((rec, index) => 
              {
                const colorIndex = index + 1;
                const iconIndex = index + 1;
              return (<div key={rec.rank} className="border-4 border-purple-700 rounded-xl p-6 pt-4 bg-slate-50/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {ICONS[iconIndex]}
                      <h3 className="text-xl font-bold">{rec.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{rec.description}"
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CompatibilityChart score={rec.score} color={COLORS[colorIndex]} />
                  </div>
                </div>
              </div>)
            }
              )}
          </div>

          {/* Bouton de retour en bas */}
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/saisir-notes')} 
              className="bg-[#18181B] text-white hover:bg-black gap-2 px-6 py-6 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlayCircle className="size-5" />
              <span className="font-bold">Lancer une nouvelle prédiction</span>
            </Button>
          </div>
        </div>
        {/*NEW-end :*/}



      </SidebarInset>
    </SidebarProvider>
  )
}

