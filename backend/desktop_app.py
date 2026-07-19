import sys
import threading
import time
import uvicorn
import webview
from app.main import app

def start_server():
    # Start the FastAPI server on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

if __name__ == '__main__':
    # Start the backend server in a background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Give the server a moment to start
    time.sleep(2)

    # Open the Desktop Window pointing to the local server
    webview.create_window('Digital Hospital Management ERP', 'http://127.0.0.1:8000')
    webview.start()
