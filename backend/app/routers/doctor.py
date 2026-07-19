from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, dependencies

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor Console"],
    dependencies=[Depends(dependencies.get_current_active_doctor)]
)

@router.put("/appointments/{appointment_id}/status", response_model=schemas.AppointmentResponse)
def update_appointment_status(
    appointment_id: int, 
    update_data: schemas.AppointmentUpdateStatus, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_active_doctor)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Verify this appointment belongs to the logged in doctor
    doctor_profile = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    if not doctor_profile or appointment.doctor_id != doctor_profile.id:
        raise HTTPException(status_code=403, detail="You can only update your own appointments")
        
    appointment.status = update_data.status
    if update_data.prescription is not None:
        appointment.prescription = update_data.prescription
        
    db.commit()
    db.refresh(appointment)
    
    # Trigger WebSocket Broadcast here in Phase 5
    
    return appointment
