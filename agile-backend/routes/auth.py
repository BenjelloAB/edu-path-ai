from flask import Blueprint, request, jsonify
from models import db, Student, Simulation
from flask_jwt_extended import jwt_required,get_jwt_identity,create_access_token

auth_bp = Blueprint('auth', __name__)




@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # 1. Check if email is missing or already taken
    if not data.get('email'):
        return jsonify({"msg": "Email requis"}), 400

    if Student.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Cet email est déjà utilisé"}), 400

    # create new student
    new_student = Student(
        nom=data['nom'],
        email=data['email']
        )
    # Hash it before saving
    new_student.set_password(data['password'])

    db.session.add(new_student)
    db.session.commit()
    return jsonify({"msg": "Compte créé"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email_user = data.get('email')
    password_user = data.get('password')
    

    # 1Validation: If password is missing, don't even try to check it
    if not email_user or not password_user:
        return jsonify({"msg": "Email et mot de passe sont requis."}), 400

    # Search for student by unique email
    student = Student.query.filter_by(email=email_user).first()
    
    if not student:
        return jsonify({"msg": "Utilisateur non trouvé. Veuillez vous inscrire."}), 404
    

    # Check existence AND verify the hashed password
    if student and student.check_password(password_user):
        access_token = create_access_token(identity=str(student.id))
        return jsonify({
        "access_token": access_token, 
        "student_id": student.id,
        "nom": student.nom,
        "filiere": student.filiere_actuelle or "Licence non définie", 
        "email": student.email 

        }), 200

    return jsonify({"msg": "Email ou mot de passe incorrect"}), 401


@auth_bp.route('/user-status', methods=['GET'])
@jwt_required()
def get_user_status():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    
    if not student:
        return jsonify({"msg": "Étudiant non trouvé"}), 404

    # 1. Profile is complete if they have assigned a filiere
    is_profile_complete = student.filiere_actuelle is not None
    
    # 2. Check for any completed simulation
    has_simulation = Simulation.query.filter_by(
        student_id=student_id, 
        status='complete'
    ).first() is not None

    return jsonify({
        "isProfileComplete": is_profile_complete,
        "hasSimulation": has_simulation,
        "filiere": student.filiere_actuelle,
        "nom": student.nom
    }), 200


    


