from flask import Flask

from flask_cors import CORS


from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from models import db, configure_sqlite
from datetime import timedelta

load_dotenv()

def create_app():
    app = Flask(__name__)

    #  Ensures the 'instance' folder exists for the .db file
    os.makedirs(app.instance_path, exist_ok=True)

    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'database.db')

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})


    db.init_app(app)

    configure_sqlite(app)

    JWTManager(app)
    
    with app.app_context():
        db.create_all()

    from routes.auth import auth_bp
    from routes.predict import predict_bp
    from routes.student import student_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')


    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5000, debug=True)