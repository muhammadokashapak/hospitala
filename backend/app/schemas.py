from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime, date
from .models import RoleEnum, GenderEnum, AppointmentStatusEnum

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: RoleEnum

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Doctor Shift Schemas ---
from datetime import time

class DoctorShiftBase(BaseModel):
    shift_day: str
    start_time: time
    end_time: time
    room_number: Optional[str] = None

class DoctorShiftCreate(DoctorShiftBase):
    doctor_id: int

class DoctorShiftResponse(DoctorShiftBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Doctor Schemas ---
class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    is_available: bool = True

class DoctorCreate(DoctorBase):
    user_id: int
    department_id: int

class DoctorResponse(DoctorBase):
    id: int
    user: UserResponse
    department: Optional[DepartmentResponse] = None
    shifts: List[DoctorShiftResponse] = []
    
    class Config:
        from_attributes = True

# --- Patient Schemas ---
class PatientBase(BaseModel):
    phone: str
    cnic: Optional[str] = None
    full_name: str
    age: int
    gender: GenderEnum
    emergency_contact: str

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    prescription: Optional[str] = None

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int

class AppointmentUpdateStatus(BaseModel):
    status: AppointmentStatusEnum
    prescription: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    appointment_date: date
    token_number: int
    status: AppointmentStatusEnum
    
    class Config:
        from_attributes = True
