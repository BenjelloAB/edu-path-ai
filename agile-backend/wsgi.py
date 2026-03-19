from app import app #
from waitress import serve
import logging
import os

log_file = os.path.join(os.path.dirname(__file__), 'backend.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file), # This creates the file!
        logging.StreamHandler()        # This keeps the text on your screen
    ]
)

logger = logging.getLogger('waitress')


if __name__ == "__main__":
    print(f"Waitress is serving on port 5000.... Logging to {log_file}")
    serve(app, host='127.0.0.1', port=5000, threads=4)