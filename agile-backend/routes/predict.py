from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Student, Simulation, ModuleGrade, MasterRecommendation
import joblib
import numpy as np

predict_bp = Blueprint('predict', __name__)
model = joblib.load("models_ai/model_orientation.pkl")
le = joblib.load("models_ai/label_encoder.pkl")

# Garde cette liste EXACTEMENT comme dans ton Jupyter
COLUMNS = [
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
# Mapping of all 39 columns to their clean names and categories
MODULE_MAP = {
    "note_algebre": {"name": "Algèbre", "category": "Math"},
    "note_analyse": {"name": "Analyse", "category": "Math"},
    "note_probabilites_stats": {"name": "Probabilités & Statistiques", "category": "Math"},
    "note_recherche_operationnelle": {"name": "Recherche Opérationnelle", "category": "Math"},
    "note_analyse_donnees": {"name": "Analyse de Données", "category": "Math"},
    "note_algorithmique": {"name": "Algorithmique", "category": "Info"},
    "note_programmation_c": {"name": "Programmation C", "category": "Info"},
    "note_systeme_exploitation": {"name": "Système d'Exploitation", "category": "Info"},
    "note_structures_donnees": {"name": "Structures de Données", "category": "Info"},
    "note_programmation_web": {"name": "Programmation Web", "category": "Info"},
    "note_bases_de_donnees": {"name": "Bases de Données", "category": "Info"},
    "note_programmation_objet_cpp_java": {"name": "Prog. Objet (C++/Java)", "category": "Info"},
    "note_reseaux": {"name": "Réseaux Informatiques", "category": "Info"},
    "note_genie_logiciel_agile": {"name": "Génie Logiciel & Agile", "category": "Info"},
    "note_compilation": {"name": "Compilation", "category": "Info"},
    "note_microservices_jee": {"name": "Microservices & JEE", "category": "Info"},
    "note_architecture_ordinateurs": {"name": "Architecture des Ordinateurs", "category": "Info"},
    "note_electronique_num_analog": {"name": "Électronique Numérique & Analog.", "category": "Info"},
    "note_biologie_cellulaire_histologie": {"name": "Biologie Cellulaire & Histologie", "category": "Biologie"},
    "note_bio_organismes_v_a": {"name": "Biologie des Organismes (V&A)", "category": "Biologie"},
    "note_ecologie_microbiologie": {"name": "Écologie & Microbiologie", "category": "Biologie"},
    "note_biochimie_genetique": {"name": "Biochimie & Génétique", "category": "Biologie"},
    "note_physiologie": {"name": "Physiologie", "category": "Biologie"},
    "note_chimie_organique_solutions": {"name": "Chimie Organique & Solutions", "category": "Chimie"},
    "note_cristallochimie": {"name": "Cristallochimie", "category": "Chimie"},
    "note_atomistique_liaison_chimique": {"name": "Atomistique & Liaison Chimique", "category": "Chimie"},
    "note_geologie_generale": {"name": "Géologie Générale", "category": "Géologie"},
    "note_geodynamique_int_ext": {"name": "Géodynamique Interne & Externe", "category": "Géologie"},
    "note_tectonique_petrologie": {"name": "Tectonique & Pétrologie", "category": "Géologie"},
    "note_sedimentologie_geochimie": {"name": "Sédimentologie & Géochimie", "category": "Géologie"},
    "note_mecanique_point_solide": {"name": "Mécanique du Point & Solide", "category": "Physique"},
    "note_thermodynamique": {"name": "Thermodynamique", "category": "Physique"},
    "note_optique_geom_ondul": {"name": "Optique Géométrique & Ondulatoire", "category": "Physique"},
    "note_electricite_electromag": {"name": "Électricité & Électromagnétisme", "category": "Physique"},
    "note_mecanique_quantique": {"name": "Mécanique Quantique", "category": "Physique"},
    "note_physique_nucleaire_stat": {"name": "Physique Nucléaire & Statistique", "category": "Physique"},
    "note_instrumentation_mesure": {"name": "Instrumentation & Mesure", "category": "Physique"},
    "note_modelisation_simulation": {"name": "Modélisation & Simulation", "category": "Physique"},
    "note_python_physique": {"name": "Python pour la Physique", "category": "Physique/Info"},
}

# history page helper : 


@predict_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    student_id = get_jwt_identity()
    
    # We fetch the student to get their current filiere
    student = Student.query.get(student_id)
    
    # Get simulations
    sims = Simulation.query.filter_by(student_id=student_id, status='complete')\
        .order_by(Simulation.date_creation.desc()).all()
    
    history_list = []
    for s in sims:
        top_rec = MasterRecommendation.query.filter_by(simulation_id=s.id, rang=1).first()
        
        history_list.append({
            "id": s.id,
            "date": s.date_creation.strftime("%d/%m/%Y"),
            "filiere": student.filiere_actuelle if student else "Inconnue", # <--- HERE IT IS
            "moyenne": f"{s.moyenne_calculee:.2f}",
            "recommandation": top_rec.nom_master if top_rec else "N/A",
            "score": f"{int(top_rec.pourcentage_score)}%" if top_rec else "0%"
        })

    return jsonify(history_list), 200

# results page helpers 
@predict_bp.route('/latest-results', methods=['GET'])
@jwt_required()
def get_latest_results():
    student_id = get_jwt_identity()
    
    # Get the most recent completed simulation
    last_sim = Simulation.query.filter_by(student_id=student_id, status='complete')\
        .order_by(Simulation.date_creation.desc()).first()
    
    if not last_sim:
        return jsonify({"msg": "Aucune simulation trouvée"}), 404

    # Get the recommendations for this simulation
    recs = MasterRecommendation.query.filter_by(simulation_id=last_sim.id)\
        .order_by(MasterRecommendation.rang.asc()).all()
    
    results = []
    for r in recs:
        results.append({
            "title": r.nom_master,
            "description": r.description,
            "score": r.pourcentage_score,
            "rank": r.rang
        })

    return jsonify({
        "moyenne": last_sim.moyenne_calculee,
        "date": last_sim.date_creation.strftime("%d/%m/%Y"),
        "recommendations": results
    }), 200


# -- draft logic --
@predict_bp.route('/save-draft', methods=['POST'])
@jwt_required()
def save_draft():
    student_id = get_jwt_identity()
    data = request.get_json()  # The {note_algebre: 15...} object
    
    # Find existing draft or create new
    sim = Simulation.query.filter_by(student_id=student_id, status='draft').first()
    if not sim:
        sim = Simulation(student_id=student_id, status='draft')
        db.session.add(sim)
        db.session.flush()

    # Clear old draft grades and add new ones
    ModuleGrade.query.filter_by(simulation_id=sim.id).delete()
    
    for col, note in data.items():
        if note and note != 0:
            db.session.add(ModuleGrade(
                nom_module=col, # Using the column name as ID
                note=float(note),
                simulation_id=sim.id
            ))
    
    db.session.commit()
    return jsonify({"msg": "Brouillon enregistré"}), 200

@predict_bp.route('/get-draft', methods=['GET'])
@jwt_required()
def get_draft():
    student_id = get_jwt_identity()
    sim = Simulation.query.filter_by(student_id=student_id, status='draft').first()
    if not sim:
        return jsonify({"notes": {}}), 200
    
    grades = ModuleGrade.query.filter_by(simulation_id=sim.id).all()
    notes_dict = {g.nom_module: g.note for g in grades}
    return jsonify({"notes": notes_dict}), 200


# --- 1. THE CHECK (Guard) ---
@predict_bp.route('/user-status', methods=['GET'])
@jwt_required()
def check_status():
    student_id = get_jwt_identity()
    # Check if a completed simulation exists
    exists = Simulation.query.filter_by(student_id=student_id, status='complete').first()
    return jsonify({"hasCompletedSimulation": exists is not None}), 200

@predict_bp.route('/predict', methods=['POST']) # Saisir Notes Form
@jwt_required()
def predict():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    data = request.get_json() # On attend un dictionnaire { "note_algebre": 15, ... }


    # 1. Préparation du vecteur 
    # On parcourt COLUMNS pour garantir que chaque note est à la bonne place
    try:
        features = [float(data.get(col, 0.0)) for col in COLUMNS]
    except ValueError:
        return jsonify({"msg": "Format de note invalide"}), 400

    # 2. Prédiction des probabilités
    # On passe [features] car le modèle attend un tableau 2D (batch)
    probs = model.predict_proba([features])[0]

    # 3. Top 3 Indices
    top_3_idx = np.argsort(probs)[-3:][::-1]

    # 4. Calculate Moyenne (Avoid division by zero)
    valid_notes = [f for f in features if f > 0]
    moyenne = sum(valid_notes) / len(valid_notes) if valid_notes else 0.0



    #5.  Create Simulation Record
    # Look for an existing draft to update it, or create a new simulation
    sim = Simulation.query.filter_by(student_id=student_id, status='draft').first()
    if sim:
        sim.status = 'complete'
        sim.moyenne_calculee = moyenne
        # Clear previous draft grades to avoid duplicates
        ModuleGrade.query.filter_by(simulation_id=sim.id).delete()
    else:
        sim = Simulation(student_id=student_id, status='complete', moyenne_calculee=moyenne)
        db.session.add(sim)

    db.session.flush() #get simulation ID

    # 4. Save Grades (History)
    # We save only the notes relevant to the current user's inputs
    for col in COLUMNS:
        val = data.get(col)
        if val and float(val) > 0:
            # Get clean name and category from our map, fallback to column name if missing
            info = MODULE_MAP.get(col, {"name": col, "category": "Général"})
            db.session.add(ModuleGrade(
                nom_module=info["name"],
                note=float(val),
                categorie=info["category"],
                simulation_id=sim.id
            ))



    #7. Save Recommendations (Clear old ones if updating draft)
    # MasterRecommendation.query.filter_by(simulation_id=sim.id).delete()
    results = []
    for rank, idx in enumerate(top_3_idx, 1):
        master_name = le.inverse_transform([idx])[0]
        score = float(probs[idx] * 100)
        
        db.session.add(MasterRecommendation(
            simulation_id=sim.id, 
            rang=rank,
            nom_master=master_name,
            pourcentage_score=score,
            description=f"Analyse basée sur votre profil {student.filiere_actuelle if student else ''}"
        ))
        results.append({"master": master_name, "percentage": round(score, 2)})

    # final database commit
    db.session.commit()
    return jsonify({
        "msg": "Succès", 
        "moyenne": round(moyenne, 2),
        "top_3": results
    }), 200