from flask import Blueprint, request, jsonify
from models import db, Student, Simulation, MasterRecommendation, ModuleGrade
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from sqlalchemy import func

student_bp = Blueprint('student', __name__)


# Assuming your blueprint is student_bp
@student_bp.route('/dashboard-summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    
    # Define total modules per filiere (matching your frontend MODULES_CONFIG)
    TOTAL_MODULES_MAP = {
        "math-info": 18,
        "bcg": 17,
        "physique": 16
    }
    filiere_key = student.filiere_actuelle.lower() if student else "math-info"
    total_possible = TOTAL_MODULES_MAP.get(filiere_key, 18)

    # 1. Get the most recent complete simulation
    last_sim = Simulation.query.filter_by(student_id=student_id, status='complete')\
        .order_by(Simulation.id.desc()).first()
    
    if not last_sim:
        return jsonify({
            "student_name": student.nom if student else "Étudiant",
            "filiere": student.filiere_actuelle if student else "Non définie",
            "moyenne": 0,
            "modules_count": 0,
            "pole_dominant": "N/A",
            "master_predit": "N/A",
            "chartData": [],
            "top_modules": []
        }), 200

    # 2. Get all grades for this simulation
    grades = ModuleGrade.query.filter_by(simulation_id=last_sim.id).all()
    
    # 3. Calculate Pôle Dominant (Category with highest average)
    # Result: {'Math': 15.5, 'Info': 14.0}
    cat_averages = db.session.query(
        ModuleGrade.categorie, 
        func.avg(ModuleGrade.note).label('average')
    ).filter(ModuleGrade.simulation_id == last_sim.id)\
     .group_by(ModuleGrade.categorie).all()
    
    pole_dominant = "N/A"
    if cat_averages:
        # Find category with max average
        pole_dominant = max(cat_averages, key=lambda x: x.average)[0]

    # 4. Get the Top Recommendation
    top_rec = MasterRecommendation.query.filter_by(simulation_id=last_sim.id)\
        .order_by(MasterRecommendation.rang.asc()).first()

    # 5. Format Chart Data (Module name and Note)
    chart_data = [{"module": g.nom_module, "note": g.note} for g in grades]

    # 6. Get Top 5 Modules for the "Points Forts" list
    top_5 = sorted(grades, key=lambda x: x.note, reverse=True)[:5]
    top_modules_list = [{
        "module": g.nom_module, 
        "note": g.note, 
        "categorie": g.categorie
    } for g in top_5]

    return jsonify({
        "student_name": student.nom,
        "filiere": student.filiere_actuelle,
        "moyenne": round(last_sim.moyenne_calculee, 2),
        "modules_count": len(grades),
        "total_modules": total_possible,
        "pole_dominant": pole_dominant,
        "master_predit": top_rec.nom_master if top_rec else "N/A",
        "chartData": chart_data,
        "top_modules": top_modules_list
    }), 200


# 1. PATH: Get Current Profile Data (for pre-filling forms)
@student_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"msg": "Étudiant non trouvé"}), 404
        
    return jsonify({
        "nom": student.nom,
        "email": student.email,
        "filiere_actuelle": student.filiere_actuelle,
        "etablissement": student.etablissement,      # Added
        "annee_actuelle": student.annee_actuelle      # Added
    }), 200


# 2. Onboarding (First time setup)
@student_bp.route('/onboarding', methods=['POST'])
@jwt_required()
def onboarding():
    try:
        student_id = get_jwt_identity()
        student = Student.query.get(student_id)
        data = request.get_json()
        
        if not student:
            return jsonify({"msg": "Étudiant non trouvé"}), 404
        
        # Validate that data exists
        if not data.get('filiere') or not data.get('annee'):
            return jsonify({"msg": "Données incomplètes. Veuillez remplir tous les champs."}), 400
        
        student.filiere_actuelle = data.get('filiere')
        student.etablissement = data.get('etablissement')
        student.annee_actuelle = data.get('annee')
        
        db.session.commit()
        return jsonify({"msg": "Profil configuré avec succès"}), 200

    except Exception as e:
        db.session.rollback() # Important: cancel changes if it fails
        print(f"Error: {str(e)}")
        return jsonify({"msg": "Erreur serveur lors de l'enregistrement du profil"}), 500

# # 2. PATH: Onboarding / Update Filiere (first time dept selection)
# @student_bp.route('/update-filiere', methods=['POST'])
# @jwt_required()
# def update_filiere():
#     student_id = get_jwt_identity()
#     student = Student.query.get(student_id)
#     data = request.get_json()
    
#     # This handles the 'Onboarding' form where they pick their department
#     student.filiere_actuelle = data.get('filiere')
#     db.session.commit()
    
#     return jsonify({"msg": "Filière mise à jour avec succès"}), 200

# 3. PATH: Edit Profile (Full Update)
@student_bp.route('/edit-profile', methods=['PUT'])
@jwt_required()
def edit_profile():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    data = request.get_json()

    new_email = data.get('email')
    if new_email and new_email != student.email:
        if Student.query.filter_by(email=new_email).first():
            return jsonify({"msg": "Cet email est déjà utilisé"}), 400
        student.email = new_email
    
    # Update name or filiere from the Edit Profile form
    if 'nom' in data:
        student.nom = data['nom']
    if data.get('password'): # If the user typed a new password
        student.password = generate_password_hash(data['password'])
    if 'filiere' in data:
        student.filiere_actuelle = data['filiere']
    if 'etablissement' in data:
        student.etablissement = data.get('etablissement', student.etablissement)
    if "annee" in data:
        student.annee_actuelle = data.get('annee', student.annee_actuelle)


        
    db.session.commit()
    return jsonify({"msg": "Profil mis à jour"}), 200