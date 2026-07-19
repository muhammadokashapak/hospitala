from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from .. import database, dependencies, models
from ..scheduler_logic import generate_fair_shifts, generate_rotations

router = APIRouter(
    prefix="/scheduler",
    tags=["HO Scheduler"]
)

@router.post("/generate_shifts")
def generate_schedule(
    rotation_group_id: int,
    start_date: date, 
    days: int = 30,
    db: Session = Depends(database.get_db),
    current_tmo: models.User = Depends(dependencies.get_current_tmo)
):
    """
    Generates a fair, points-based shift schedule for House Officers.
    Only authorized for TMOs in charge of the batch.
    """
    if not current_tmo.tmo_profile or current_tmo.tmo_profile.rotation_group_id != rotation_group_id:
        raise HTTPException(status_code=403, detail="You are not authorized to schedule shifts for this rotation group.")
        
    try:
        result = generate_fair_shifts(db, hospital_id=current_tmo.hospital_id, rotation_group_id=rotation_group_id, start_date=start_date, days=days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate_rotations")
def generate_block_rotations(
    rotation_group_id: int,
    start_date: date,
    db: Session = Depends(database.get_db),
    current_tmo: models.User = Depends(dependencies.get_current_tmo)
):
    """
    Generates a 3-month block rotation sequence mapping HOs to departments within their assigned track.
    Only authorized for TMOs in charge of the batch.
    """
    if not current_tmo.tmo_profile or current_tmo.tmo_profile.rotation_group_id != rotation_group_id:
        raise HTTPException(status_code=403, detail="You are not authorized to generate rotations for this rotation group.")
        
    try:
        result = generate_rotations(db, hospital_id=current_tmo.hospital_id, rotation_group_id=rotation_group_id, start_date=start_date)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shifts")
def get_shifts(
    start_date: date,
    end_date: date,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user) # Anyone authenticated can view
):
    """
    Fetches the generated shifts for visualization in the planner grid.
    Admins can use this to monitor all tracks.
    """
    # Restrict data to the user's hospital tenant
    shifts = db.query(models.DutyShift).join(models.HouseOfficer).join(models.User).filter(
        models.DutyShift.hospital_id == current_user.hospital_id,
        models.DutyShift.shift_date >= start_date,
        models.DutyShift.shift_date <= end_date
    ).all()
    
    # Format for frontend grid
    result = []
    for shift in shifts:
        result.append({
            "id": shift.id,
            "house_officer_id": shift.house_officer_id,
            "ho_name": shift.house_officer.user.full_name,
            "gender": shift.house_officer.user.gender,
            "date": shift.shift_date,
            "type": shift.shift_type,
            "points": shift.points_assigned
        })
    return result
