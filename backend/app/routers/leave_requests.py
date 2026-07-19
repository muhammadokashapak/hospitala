from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from .. import database, dependencies, models
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/leave_requests",
    tags=["Leave Requests"]
)

class LeaveRequestCreate(BaseModel):
    leave_date: date
    reason: str

class LeaveRequestUpdate(BaseModel):
    status: models.LeaveStatusEnum
    tmo_comment: Optional[str] = None

@router.post("/")
def create_leave_request(
    data: LeaveRequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if current_user.role != models.RoleEnum.House_Officer:
        raise HTTPException(status_code=403, detail="Only House Officers can apply for leaves.")
        
    req = models.LeaveRequest(
        hospital_id=current_user.hospital_id,
        house_officer_id=current_user.ho_profile.id,
        leave_date=data.leave_date,
        reason=data.reason,
        status=models.LeaveStatusEnum.Pending
    )
    db.add(req)
    db.commit()
    return {"message": "Leave request submitted successfully."}

@router.get("/my_requests")
def get_my_requests(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if current_user.role != models.RoleEnum.House_Officer:
        raise HTTPException(status_code=403, detail="Only House Officers can access this endpoint.")
        
    requests = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.house_officer_id == current_user.ho_profile.id
    ).all()
    
    return [
        {
            "id": r.id,
            "date_requested": r.date_requested,
            "leave_date": r.leave_date,
            "reason": r.reason,
            "status": r.status,
            "tmo_comment": r.tmo_comment
        } for r in requests
    ]

@router.get("/inbox")
def get_leave_inbox(
    db: Session = Depends(database.get_db),
    current_tmo: models.User = Depends(dependencies.get_current_tmo)
):
    # Get all requests from HOs who are in the TMO's rotation group
    tmo_group_id = current_tmo.tmo_profile.rotation_group_id
    if not tmo_group_id:
        return []
        
    requests = db.query(models.LeaveRequest).join(models.HouseOfficer).filter(
        models.HouseOfficer.rotation_group_id == tmo_group_id,
        models.LeaveRequest.hospital_id == current_tmo.hospital_id
    ).all()
    
    return [
        {
            "id": r.id,
            "ho_name": r.house_officer.user.full_name,
            "date_requested": r.date_requested,
            "leave_date": r.leave_date,
            "reason": r.reason,
            "status": r.status,
            "tmo_comment": r.tmo_comment
        } for r in requests
    ]

@router.put("/{request_id}")
def update_leave_status(
    request_id: int,
    data: LeaveRequestUpdate,
    db: Session = Depends(database.get_db),
    current_tmo: models.User = Depends(dependencies.get_current_tmo)
):
    tmo_group_id = current_tmo.tmo_profile.rotation_group_id
    
    req = db.query(models.LeaveRequest).join(models.HouseOfficer).filter(
        models.LeaveRequest.id == request_id,
        models.HouseOfficer.rotation_group_id == tmo_group_id,
        models.LeaveRequest.hospital_id == current_tmo.hospital_id
    ).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found or not in your batch.")
        
    req.status = data.status
    if data.tmo_comment:
        req.tmo_comment = data.tmo_comment
        
    db.commit()
    return {"message": "Leave request updated successfully."}
