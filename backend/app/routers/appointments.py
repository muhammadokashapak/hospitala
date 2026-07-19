from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import List
from .. import models, schemas, database, dependencies

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
    dependencies=[Depends(dependencies.get_current_active_receptionist)]
)

@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db)):
    # 1. Verify Patient
    patient = db.query(models.Patient).filter(models.Patient.id == appointment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # 2. Verify Doctor
    doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    # 3. Token Engine Logic
    # Get the count of appointments for THIS specific doctor TODAY
    today = date.today()
    current_count = db.query(func.count(models.Appointment.id)).filter(
        models.Appointment.doctor_id == appointment.doctor_id,
        models.Appointment.appointment_date == today
    ).scalar()
    
    next_token = current_count + 1
    
    new_appointment = models.Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=today,
        token_number=next_token,
        status=models.AppointmentStatusEnum.Waiting
    )
    
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    
    # Trigger WebSocket Broadcast here in Phase 5
    
    return new_appointment

@router.get("/queue/{doctor_id}", response_model=List[schemas.AppointmentResponse])
def get_doctor_queue(doctor_id: int, db: Session = Depends(database.get_db)):
    today = date.today()
    appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.appointment_date == today,
        models.Appointment.status.in_([
            models.AppointmentStatusEnum.Waiting, 
            models.AppointmentStatusEnum.On_Hold
        ])
    ).order_by(models.Appointment.token_number.asc()).all()
    
    return appointments
