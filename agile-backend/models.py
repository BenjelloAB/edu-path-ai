from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# This function prevents the "Database is locked" error by telling 
# SQLite to wait longer before giving up on a write operation.
def configure_sqlite(app):
    if "sqlite" in app.config.get("SQLALCHEMY_DATABASE_URI", ""):
        with app.app_context():
            @event.listens_for(db.engine, "connect")
            def set_sqlite_pragma(dbapi_connection, connection_record):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA busy_timeout = 30000") # 30 seconds
                cursor.execute("PRAGMA journal_mode = WAL")  # Bonus: Better concurrency
                cursor.close()


class Student(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    #  storing the hash and not the plain text
    password_hash = db.Column(db.String(128))

    # Academic Fields
    filiere_actuelle = db.Column(db.String(100))
    etablissement = db.Column(db.String(100)) # FST, FS, EST
    annee_actuelle = db.Column(db.String(50))   # L1, L2, L3
    
    # Relationship: One Student -> Many Simulations
    simulations = db.relationship('Simulation', backref='student', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Simulation(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    moyenne_calculee = db.Column(db.Float)
    status = db.Column(db.String(20), default="brouillon") # "brouillon" or "complete"
    
    # Foreign Key linking to Student
    student_id = db.Column(db.String(36), db.ForeignKey('student.id'), nullable=False)
    
    # Relationships: One Simulation -> Many Grades and 3 Recommendations
    grades = db.relationship('ModuleGrade', backref='simulation', lazy=True)
    recommendations = db.relationship('MasterRecommendation', backref='simulation', lazy=True)

class ModuleGrade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom_module = db.Column(db.String(100))
    note = db.Column(db.Float)
    categorie = db.Column(db.String(50))
    
    simulation_id = db.Column(db.String(36), db.ForeignKey('simulation.id'), nullable=False)

class MasterRecommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rang = db.Column(db.Integer) # 1, 2, or 3
    nom_master = db.Column(db.String(150))
    pourcentage_score = db.Column(db.Float)
    description = db.Column(db.Text)
    
    simulation_id = db.Column(db.String(36), db.ForeignKey('simulation.id'), nullable=False)