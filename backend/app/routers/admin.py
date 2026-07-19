from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth, dependencies

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(dependencies.get_current_active_admin)]
)

@router.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/", response_model=List[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/departments/", response_model=schemas.DepartmentResponse)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(database.get_db)):
    db_dept = db.query(models.Department).filter(models.Department.name == department.name).first()
    if db_dept:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_dept = models.Department(name=department.name)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.get("/departments/", response_model=List[schemas.DepartmentResponse])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    departments = db.query(models.Department).offset(skip).limit(limit).all()
    return departments

@router.post("/doctors/", response_model=schemas.DoctorResponse)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(database.get_db)):
    # Verify user is a doctor
    user = db.query(models.User).filter(models.User.id == doctor.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != models.RoleEnum.Doctor:
        raise HTTPException(status_code=400, detail="User is not assigned the Doctor role")
        
    db_doctor = db.query(models.Doctor).filter(models.Doctor.user_id == doctor.user_id).first()
    if db_doctor:
        raise HTTPException(status_code=400, detail="Doctor profile already exists for this user")
        
    new_doctor = models.Doctor(
        user_id=doctor.user_id,
        department_id=doctor.department_id,
        specialization=doctor.specialization,
        is_available=doctor.is_available
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor

@router.post("/doctor_shifts/", response_model=schemas.DoctorShiftResponse)
def create_doctor_shift(shift: schemas.DoctorShiftCreate, db: Session = Depends(database.get_db)):
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == shift.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    new_shift = models.DoctorShift(
        doctor_id=shift.doctor_id,
        shift_day=shift.shift_day,
        start_time=shift.start_time,
        end_time=shift.end_time,
        room_number=shift.room_number
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift
