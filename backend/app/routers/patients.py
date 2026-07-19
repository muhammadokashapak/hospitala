from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, dependencies

router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
    dependencies=[Depends(dependencies.get_current_active_receptionist)]
)

@router.get("/search", response_model=schemas.PatientResponse)
def search_patient(phone: str, db: Session = Depends(database.get_db)):
    patient = db.query(models.Patient).filter(models.Patient.phone == phone).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/", response_model=schemas.PatientResponse)
def register_patient(patient: schemas.PatientCreate, db: Session = Depends(database.get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.phone == patient.phone).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    if patient.cnic:
        db_cnic = db.query(models.Patient).filter(models.Patient.cnic == patient.cnic).first()
        if db_cnic:
            raise HTTPException(status_code=400, detail="CNIC already registered")
            
    new_patient = models.Patient(
        phone=patient.phone,
        cnic=patient.cnic,
        full_name=patient.full_name,
        age=patient.age,
        gender=patient.gender,
        emergency_contact=patient.emergency_contact
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient
