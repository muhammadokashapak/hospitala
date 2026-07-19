from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, dependencies, models
from pydantic import BaseModel

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

class ProfileUpdate(BaseModel):
    full_name: str
    password: str = None # Optional password update

@router.get("/")
def get_profile(current_user: models.User = Depends(dependencies.get_current_user)):
    res = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "gender": current_user.gender
    }
    if current_user.role == models.RoleEnum.TMO and current_user.tmo_profile:
        res["rotation_group_id"] = current_user.tmo_profile.rotation_group_id
        res["rotation_group_name"] = current_user.tmo_profile.rotation_group.name if current_user.tmo_profile.rotation_group else "Unassigned"
    elif current_user.role == models.RoleEnum.House_Officer and current_user.ho_profile:
        res["rotation_group_id"] = current_user.ho_profile.rotation_group_id
        res["rotation_group_name"] = current_user.ho_profile.rotation_group.name if current_user.ho_profile.rotation_group else "Unassigned"
    return res

@router.put("/")
def update_profile(
    data: ProfileUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    current_user.full_name = data.full_name
    if data.password:
        from ..auth import get_password_hash
        current_user.password_hash = get_password_hash(data.password)
        
    db.commit()
    return {"message": "Profile updated successfully"}
