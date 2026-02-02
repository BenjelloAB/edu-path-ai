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
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

import { useCallback, useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { Save, PlayCircle, AlertCircle, Plus, FileSpreadsheet, UploadCloud } from "lucide-react"
import { useDropzone } from 'react-dropzone';
import { toast } from "sonner" 

import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react";

const MODULES_CONFIG = {
  "math-info": [
    { name: "Algèbre", category: "Math", col: "note_algebre" },
    { name: "Analyse", category: "Math", col: "note_analyse" },
    { name: "Probabilités & Statistiques", category: "Math", col: "note_probabilites_stats" },
    { name: "Recherche Opérationnelle", category: "Math", col: "note_recherche_operationnelle" },
    { name: "Analyse de Données", category: "Math", col: "note_analyse_donnees" },
    { name: "Algorithmique", category: "Info", col: "note_algorithmique" },
    { name: "Programmation C", category: "Info", col: "note_programmation_c" },
    { name: "Système d'Exploitation", category: "Info", col: "note_systeme_exploitation" },
    { name: "Structures de Données", category: "Info", col: "note_structures_donnees" },
    { name: "Programmation Web", category: "Info", col: "note_programmation_web" },
    { name: "Bases de Données", category: "Info", col: "note_bases_de_donnees" },
    { name: "Prog. Objet (C++/Java)", category: "Info", col: "note_programmation_objet_cpp_java" },
    { name: "Réseaux Informatiques", category: "Info", col: "note_reseaux" },
    { name: "Génie Logiciel & Agile", category: "Info", col: "note_genie_logiciel_agile" },
    { name: "Compilation", category: "Info", col: "note_compilation" },
    { name: "Microservices & JEE", category: "Info", col: "note_microservices_jee" },
    { name: "Architecture des Ordinateurs", category: "Info", col: "note_architecture_ordinateurs" },
    { name: "Électronique Numérique & Analog.", category: "Info", col: "note_electronique_num_analog" },
  ],
  "bcg": [
    { name: "Algèbre", category: "Math", col: "note_algebre" },
    { name: "Analyse", category: "Math", col: "note_analyse" },
    { name: "Probabilités & Statistiques", category: "Math", col: "note_probabilites_stats" },
    { name: "Recherche Opérationnelle", category: "Math", col: "note_recherche_operationnelle" },
    { name: "Analyse de Données", category: "Math", col: "note_analyse_donnees" },
    { name: "Biologie Cellulaire & Histologie", category: "Biologie", col: "note_biologie_cellulaire_histologie" },
    { name: "Biologie des Organismes (V&A)", category: "Biologie", col: "note_bio_organismes_v_a" },
    { name: "Écologie & Microbiologie", category: "Biologie", col: "note_ecologie_microbiologie" },
    { name: "Biochimie & Génétique", category: "Biologie", col: "note_biochimie_genetique" },
    { name: "Physiologie", category: "Biologie", col: "note_physiologie" },
    { name: "Chimie Organique & Solutions", category: "Chimie", col: "note_chimie_organique_solutions" },
    { name: "Cristallochimie", category: "Chimie", col: "note_cristallochimie" },
    { name: "Atomistique & Liaison Chimique", category: "Chimie", col: "note_atomistique_liaison_chimique" },
    { name: "Géologie Générale", category: "Géologie", col: "note_geologie_generale" },
    { name: "Géodynamique Interne & Externe", category: "Géologie", col: "note_geodynamique_int_ext" },
    { name: "Tectonique & Pétrologie", category: "Géologie", col: "note_tectonique_petrologie" },
    { name: "Sédimentologie & Géochimie", category: "Géologie", col: "note_sedimentologie_geochimie" },
  ],
  "physique": [
    { name: "Algèbre", category: "Math", col: "note_algebre" },
    { name: "Analyse", category: "Math", col: "note_analyse" },
    { name: "Probabilités & Statistiques", category: "Math", col: "note_probabilites_stats" },
    { name: "Recherche Opérationnelle", category: "Math", col: "note_recherche_operationnelle" },
    { name: "Analyse de Données", category: "Math", col: "note_analyse_donnees" },
    { name: "Algorithmique", category: "Info", col: "note_algorithmique" },
    { name: "Programmation C", category: "Info", col: "note_programmation_c" },
    { name: "Mécanique du Point & Solide", category: "Physique", col: "note_mecanique_point_solide" },
    { name: "Thermodynamique", category: "Physique", col: "note_thermodynamique" },
    { name: "Optique Géométrique & Ondulatoire", category: "Physique", col: "note_optique_geom_ondul" },
    { name: "Électricité & Électromagnétisme", category: "Physique", col: "note_electricite_electromag" },
    { name: "Mécanique Quantique", category: "Physique", col: "note_mecanique_quantique" },
    { name: "Physique Nucléaire & Statistique", category: "Physique", col: "note_physique_nucleaire_stat" },
    { name: "Instrumentation & Mesure", category: "Physique", col: "note_instrumentation_mesure" },
    { name: "Modélisation & Simulation", category: "Physique", col: "note_modelisation_simulation" },
    { name: "Python pour la Physique", category: "Physique/Info", col: "note_python_physique" },
  ]
};

const notesSchema = z.record(
  z.string(),
  z.coerce.number()
    .min(0, { message: "doit être >= 0" })
    .max(20, { message: "doit être <= 20" })
    .default(0)
)
type NotesFormValues = z.infer<typeof notesSchema>

const ALL_COLUMNS = [
    'note_algebre', 'note_analyse', 'note_probabilites_stats',
    'note_recherche_operationnelle', 'note_analyse_donnees',
    'note_algorithmique', 'note_programmation_c',
    'note_electronique_num_analog', 'note_architecture_ordinateurs',
    'note_systeme_exploitation', 'note_structures_donnees',
    'note_programmation_web', 'note_bases_de_donnees',
    'note_programmation_objet_cpp_java', 'note_reseaux',
    'note_genie_logiciel_agile', 'note_compilation',
    'note_microservices_jee', 'note_mecanique_point_solide',
    'note_thermodynamique', 'note_optique_geom_ondul',
    'note_electricite_electromag', 'note_mecanique_quantique',
    'note_physique_nucleaire_stat', 'note_instrumentation_mesure',
    'note_modelisation_simulation', 'note_python_physique',
    'note_biologie_cellulaire_histologie', 'note_bio_organismes_v_a',
    'note_ecologie_microbiologie', 'note_biochimie_genetique',
    'note_physiologie', 'note_atomistique_liaison_chimique',
    'note_chimie_organique_solutions', 'note_cristallochimie',
    'note_geologie_generale', 'note_geodynamique_int_ext',
    'note_tectonique_petrologie', 'note_sedimentologie_geochimie'
]

export default function SaisiNotes() {
  const navigate = useNavigate();
  const [loadingDraft, setLoadingDraft] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);


  // console.log("user_filiere: ",localStorage.getItem("user_filiere") )
  // 1. Récupération config
  // const userFiliere = typeof window !== "undefined" ? localStorage.getItem("user_filiere") || "math-info" : "math-info";
  // const currentModules = MODULES_CONFIG[userFiliere as keyof typeof MODULES_CONFIG] || MODULES_CONFIG["math-info"];

const [userFiliere, setUserFiliere] = useState<string>("math-info");
const [currentModules, setCurrentModules] = useState(MODULES_CONFIG["math-info"]);

// 3. Initialize with ALL columns set to 0 to satisfy the backend predict script
  const defaultValues = ALL_COLUMNS.reduce((acc, col) => {
    acc[col] = 0;
    return acc;
  }, {} as any);


//why did we use currenModules here ? [this is the older version]
  // // 3. Initialize with ALL columns set to 0 to satisfy the backend predict script
  // const defaultValues = currentModules.reduce((acc, mod) => {
  //   acc[mod.col] = 0;
  //   return acc;
  // }, {} as any);

  // Initialisation du Formulaire (DOIT ÊTRE AVANT ON DROP)
  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues,
    mode: "onChange"
  });



  // 3. Logique Bouton Import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])[0] as Record<string, any>;
        Object.entries(json).forEach(([key, value]) => {
          if (currentModules.some(m => m.col === key)) {
            const numValue = parseFloat(String(value));
            form.setValue(key as any, isNaN(numValue) ? 0 : numValue, { shouldValidate: true });
          }
        });
        toast.success("Importation réussie via bouton",{
                    style: {
              border: "1px solid #4ade80",   // green-400
              padding: "16px",
              color: "#166534",              // green-800
              background: "#f0fdf4",         // green-50
            },
        });
      } catch (err) {
        toast.error("Erreur bouton",{
           style: {
    border: "1px solid #f87171",   // red-400
    padding: "16px",
    color: "#7f1d1d",              // red-900
    background: "#fef2f2",         // red-50
  },
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 4. Logique Drag & Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])[0] as Record<string, any>;
        Object.entries(json).forEach(([key, value]) => {
          if (currentModules.some(m => m.col === key)) {
            const numValue = parseFloat(String(value));
            form.setValue(key as any, isNaN(numValue) ? 0 : numValue, { shouldValidate: true });
          }
        });
        toast.success("Importation réussie via Drop", {
                    style: {
              border: "1px solid #4ade80",   // green-400
              padding: "16px",
              color: "#166534",              // green-800
              background: "#f0fdf4",         // green-50
            },
        });
      } catch (err) {
        toast.error("Erreur drop",{
           style: {
    border: "1px solid #f87171",   // red-400
    padding: "16px",
    color: "#7f1d1d",              // red-900
    background: "#fef2f2",         // red-50
  },
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  }, [form, currentModules]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
  });

  // 5. Calcul Moyenne
  const watchedValues = form.watch();
  const valuesArray = Object.values(watchedValues);
  const moyenne = valuesArray.length > 0 
    ? (valuesArray.reduce((acc, curr) => acc + (Number(curr) || 0), 0) / currentModules.length).toFixed(2)
    : "0.00";

  const { errors } = form.formState;


// 1. PREFILL Logic
  useEffect(() => {
    const fetchDraft = async () => {
      const token = localStorage.getItem("token");
      // Quick check: look in localStorage first so it's not empty while loading
    const localFil = localStorage.getItem("user_filiere");
    if (localFil && localFil in MODULES_CONFIG) {
        setUserFiliere(localFil);
        setCurrentModules(MODULES_CONFIG[localFil as keyof typeof MODULES_CONFIG]);
    }
      try {
        const res = await axios.get("http://localhost:5000/api/predict/get-draft", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.notes) {
          // Loop through the notes and update the form
          Object.entries(res.data.notes).forEach(([key, value]) => {
            form.setValue(key as any, value as number);
          });
        }
      } catch (err) {
        console.error("Draft fetch failed", err);
      } finally {
        setLoadingDraft(false);
      }
    };
    fetchDraft();
  }, [form]);

  // 2. SAVE DRAFT Logic
  const handleSaveDraft = async () => {
    const token = localStorage.getItem("token");
    const currentValues = form.getValues();
    
    try {
      await axios.post("http://localhost:5000/api/predict/save-draft", currentValues, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Brouillon sauvegardé avec succès !", {
            style: {
              border: "1px solid #4ade80",   // green-400
              padding: "16px",
              color: "#166534",              // green-800
              background: "#f0fdf4",         // green-50
            },
          });
    } catch (err) {
      toast.error("Échec de la sauvegarde");
    }
  };


 // Soumission
  async function onSubmit(data: NotesFormValues) {

            const token = localStorage.getItem("token");
            const formattedData = Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = Math.round(Number(value) * 100) / 100; // Result: 15.55 (Number)
    return acc;
  }, {} as Record<string, number>);
        console.log("🚀 Données prêtes pour l'IA (Flask) :", {
            filiere: userFiliere,
            notes: data,
            moyenne_calculee: moyenne,
            formattedData: formattedData
          });

try{


        // Your existing prediction logic
      const BASE_URL = "http://localhost:5000"
      const response = await axios.post(`${BASE_URL}/api/predict/predict`, 
        formattedData, 
        { headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response)
      // OPTIONAL: Backend should change status from 'draft' to 'complete' 
      // in the predict route to avoid seeing the draft next time.
      
      toast.success("Simulation terminée !" , {
  
                style: {
              border: "1px solid #4ade80",   // green-400
              padding: "16px",
              color: "#166534",              // green-800
              background: "#f0fdf4",         // green-50
            },    });
   
            setTimeout(() => {
            // Redirect to results page
        navigate("/resultats");
    }, 1500);
      }

      catch(error: any){
        toast.error("Erreur de prédiction",{
           style: {
    border: "1px solid #f87171",   // red-400
    padding: "16px",
    color: "#7f1d1d",              // red-900
    background: "#fef2f2",         // red-50
  },
        });
      }

          // Exemple : { note_algebre: 13.00, note_analyse: 15.50 }

          // console.log("🚀 Données prêtes pour l'IA (Flask) :", {
          //   filiere: userFiliere,
          //   notes: data,
          //   moyenne_calculee: moyenne,
          //   formattedData: formattedData
          // });
          // toast.success("Données envoyées à l'IA", {
          //   style: {
          //     border: "1px solid #4ade80",   // green-400
          //     padding: "16px",
          //     color: "#166534",              // green-800
          //     background: "#f0fdf4",         // green-50
          //   },
          // });

          /* // TEST ENVOI AXIOS (POST ou PUT vers ton endpoint Flask)
          try {
            const response = await axios.post('http://127.0.0.1:5000/predict', {
              filiere: userFiliere,
              notes: formattedData
            });
            console.log("Réponse IA :", response.data);
          } catch (error) {
            console.error("Erreur lors de la prédiction :", error);
          }
          */
  }

// change this 
if (loadingDraft){
 return (
      <div className="flex h-screen w-full items-center justify-center gap-2 font-bold">
        <Loader2 className="animate-spin size-6 text-purple-700" />
        Chargement de vos données..
      </div>
    );
} 

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset {...getRootProps()} className="relative">
        <input {...getInputProps()} />
        
        <AnimatePresence>
          {isDragActive && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm border-2 border-dashed border-black m-4 rounded-xl pointer-events-none"
            >
              <div className="text-center">
                <UploadCloud className="mx-auto size-12 mb-2 text-black animate-bounce" />
                <p className="text-lg font-bold">Déposez votre fichier Excel</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          
          <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Saisir Vos Notes</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 px-8 pb-8 pt-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">Saisie des Notes Académiques</h1>
            <p className="text-sm text-muted-foreground">Remplissez le tableau ou importez un fichier Excel.</p>
          </div>
          <Separator />

          <div className="relative">
            <input type="file" ref={fileInputRef} onChange={handleExcelImport} accept=".xlsx, .xls" className="hidden" />
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-6 h-6">
                <motion.div animate={{ rotate: isImporting ? 180 : 0 }} className="absolute">
                  <Plus className="size-5 group-hover:opacity-0 transition-opacity" />
                </motion.div>
                <UploadCloud className="size-5 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-semibold text-sm">Importer Excel</span>
            </motion.button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
              <div className="rounded-md border bg-white shadow-sm mt-4 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[40%] font-bold text-black px-6">Module</TableHead>
                      <TableHead className="w-[40%] font-bold text-black text-center">Catégorie</TableHead>
                      <TableHead className="w-[20%] font-bold text-black text-right pr-12">Note (/20)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentModules.map((module) => (
                      <TableRow key={module.col} className="hover:bg-slate-50/30">
                        <TableCell className="font-semibold px-6">{module.name}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{module.category}</TableCell>
                        <TableCell className="text-right pr-8">
                          <FormField
                            control={form.control}
                            name={module.col}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    className={`w-24 rounded-md border px-3 py-1 text-sm shadow-sm outline-none text-right ml-auto block transition-all
                                      ${fieldState.error ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-input bg-background focus:ring-1 focus:ring-black"}`}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      field.onChange(isNaN(val) ? "" : val);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50/80">
                      <TableCell className="font-bold text-lg px-6">Moyenne Générale</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right pr-12 font-bold text-lg text-black">{moyenne}/20</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <Button 
                  type="button" variant="secondary" className="bg-[#A1A1AA] text-white hover:bg-[#71717A] gap-2"
                  onClick={handleSaveDraft}
                >
                  <Save className="size-4" /> Sauvegarder le Brouillon
                </Button>

                <div className="flex items-center gap-6">
                  {Object.keys(errors).length > 0 && (
                    <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                      <AlertCircle className="size-4" />
                      <span>Certaines notes sont invalides (entre 0 et 20)</span>
                    </div>
                  )}
                  <Button type="submit" 
                  disabled={Object.keys(errors).length > 0} 
                  // className="bg-[#18181B] text-white hover:bg-black gap-2 px-8 py-2 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-auto"
                  className="bg-[#18181B] text-white hover:bg-black gap-2 px-8 py-2 cursor-pointer disabled:bg-[#18181B] disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-auto">
                    <PlayCircle className="size-4" /> Lancer la Prédiction
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}