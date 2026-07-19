from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, admin, patients, appointments, attendance, doctor, scheduler, swaps, profile, leave_requests, tasks
import os
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from sqlalchemy.orm import Session
import sys
from .database import SessionLocal
from . import models

# Create all tables in the database
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Management System API", description="Offline-First Local Intranet System")

# Configure CORS for local network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a closed local network, we can allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def auto_checkout_doctors():
    db: Session = SessionLocal()
    try:
        # Find all attendances for today where check_out is None
        today = datetime.utcnow().date()
        open_attendances = db.query(models.Attendance).filter(
            models.Attendance.login_date == today,
            models.Attendance.check_out == None
        ).all()
        
        for att in open_attendances:
            att.check_out = datetime.utcnow()
            
        db.commit()
    finally:
        db.close()

bg_scheduler = BackgroundScheduler()
# Run everyday at 23:59 (11:59 PM)
bg_scheduler.add_job(auto_checkout_doctors, 'cron', hour=23, minute=59)

@app.on_event("startup")
def start_scheduler():
    bg_scheduler.start()

@app.on_event("shutdown")
def stop_scheduler():
    bg_scheduler.shutdown()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Hospital Management System API"}

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(attendance.router)
app.include_router(doctor.router)
app.include_router(scheduler.router)
app.include_router(profile.router)
app.include_router(leave_requests.router)
app.include_router(tasks.router)
app.include_router(swaps.router)

# --- Serve React Frontend ---
# Handle PyInstaller _MEIPASS bundling path
if getattr(sys, 'frozen', False):
    base_dir = sys._MEIPASS
    frontend_dist_path = os.path.join(base_dir, "frontend_dist")
else:
    # Assuming frontend is built to `frontend/dist` and we run `desktop_app.py` from project root
    frontend_dist_path = os.path.join(os.path.dirname(__file__), "../../frontend/dist")

if os.path.exists(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Serve index.html for all other routes to let React Router handle them
        index_file = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_file):
            with open(index_file, "r") as f:
                return HTMLResponse(content=f.read())
        return {"error": "Frontend build not found."}
else:
    @app.get("/")
    def root_fallback():
        return {"message": "DHM ERP API is running. Frontend build not found."}
