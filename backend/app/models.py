from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, DateTime, Time, Enum, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, date
from .database import Base
import enum

class RoleEnum(str, enum.Enum):
    Admin = 'Admin'
    Receptionist = 'Receptionist'
    Doctor = 'Doctor'
    TMO = 'TMO'
    House_Officer = 'House Officer'
    Pharmacist = 'Pharmacist'
    Lab_Tech = 'Lab_Tech'
    Nurse = 'Nurse'
    Billing = 'Billing'

class GenderEnum(str, enum.Enum):
    Male = 'Male'
    Female = 'Female'
    Other = 'Other'

class AppointmentStatusEnum(str, enum.Enum):
    Waiting = 'Waiting'
    In_Consultation = 'In-Consultation'
    Completed = 'Completed'
    Cancelled = 'Cancelled'
    No_Show = 'No-Show'
    On_Hold = 'On-Hold'

class RotationStatusEnum(str, enum.Enum):
    Upcoming = 'Upcoming'
    Active = 'Active'
    Completed = 'Completed'

class ShiftTypeEnum(str, enum.Enum):
    Morning = 'Morning'
    Evening = 'Evening'
    Night = 'Night'
    Off = 'Off'

class SwapStatusEnum(str, enum.Enum):
    Pending_Acceptance = 'Pending_Acceptance'
    Pending_Admin = 'Pending_Admin'
    Approved = 'Approved'
    Rejected = 'Rejected'

class LeaveStatusEnum(str, enum.Enum):
    Pending = 'Pending'
    Approved = 'Approved'
    Rejected = 'Rejected'

class TaskStatusEnum(str, enum.Enum):
    Pending = 'Pending'
    In_Progress = 'In_Progress'
    Completed = 'Completed'

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_key = Column(String, unique=True, index=True, nullable=False)
    address = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)

    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    ho_profile = relationship("HouseOfficer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    tmo_profile = relationship("TMOProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class RotationGroup(Base):
    __tablename__ = "rotation_groups"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)

    departments = relationship("Department", secondary="rotation_group_departments", back_populates="rotation_groups")

class RotationGroupDepartment(Base):
    __tablename__ = "rotation_group_departments"
    rotation_group_id = Column(Integer, ForeignKey("rotation_groups.id", ondelete="CASCADE"), primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    
    doctors = relationship("Doctor", back_populates="department")
    rotation_groups = relationship("RotationGroup", secondary="rotation_group_departments", back_populates="departments")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"))
    specialization = Column(String)
    is_available = Column(Boolean, default=True)

    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    attendances = relationship("Attendance", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")

class HouseOfficer(Base):
    __tablename__ = "house_officers"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rotation_group_id = Column(Integer, ForeignKey("rotation_groups.id", ondelete="SET NULL"), nullable=True)
    batch_year = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    user = relationship("User", back_populates="ho_profile")
    rotation_group = relationship("RotationGroup")
    rotations = relationship("Rotation", back_populates="house_officer")
    duty_shifts = relationship("DutyShift", back_populates="house_officer")

class TMOProfile(Base):
    __tablename__ = "tmo_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rotation_group_id = Column(Integer, ForeignKey("rotation_groups.id", ondelete="SET NULL"), nullable=True)
    specialty_program = Column(String, nullable=False)
    supervisor_doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"))
    
    user = relationship("User", back_populates="tmo_profile")
    supervisor = relationship("Doctor")
    logbook_entries = relationship("TMOLogbook", back_populates="tmo")
    rotation_group = relationship("RotationGroup")

class TMOLogbook(Base):
    __tablename__ = "tmo_logbook"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    tmo_id = Column(Integer, ForeignKey("tmo_profiles.id", ondelete="CASCADE"), nullable=False)
    procedure_name = Column(String, nullable=False)
    date_performed = Column(Date, default=date.today)
    supervisor_approved = Column(Boolean, default=False)
    
    tmo = relationship("TMOProfile", back_populates="logbook_entries")

class Rotation(Base):
    __tablename__ = "rotations"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    house_officer_id = Column(Integer, ForeignKey("house_officers.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(RotationStatusEnum), default=RotationStatusEnum.Upcoming)

    house_officer = relationship("HouseOfficer", back_populates="rotations")
    department = relationship("Department")

class DutyShift(Base):
    __tablename__ = "duty_shifts"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    house_officer_id = Column(Integer, ForeignKey("house_officers.id", ondelete="CASCADE"), nullable=False)
    shift_date = Column(Date, nullable=False)
    shift_type = Column(Enum(ShiftTypeEnum), nullable=False)
    is_weekend = Column(Boolean, default=False)
    points_assigned = Column(Float, default=0.0)

    house_officer = relationship("HouseOfficer", back_populates="duty_shifts")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    cnic = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(Enum(GenderEnum))
    emergency_contact = Column(String)
    
    appointments = relationship("Appointment", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(Date, default=date.today)
    token_number = Column(Integer, nullable=False)
    status = Column(Enum(AppointmentStatusEnum), default=AppointmentStatusEnum.Waiting)
    prescription = Column(JSON, nullable=True) 
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    lab_orders = relationship("LabRecord", back_populates="appointment")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    login_date = Column(Date, default=date.today)
    check_in = Column(DateTime, default=datetime.utcnow)
    check_out = Column(DateTime, nullable=True)
    
    doctor = relationship("Doctor", back_populates="attendances")

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    threshold_limit = Column(Integer, default=10)
    expiry_date = Column(Date, nullable=True)

class LabRecord(Base):
    __tablename__ = "lab_records"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, Processing, Completed
    results_text = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    
    patient = relationship("Patient")
    appointment = relationship("Appointment", back_populates="lab_orders")

class WardBed(Base):
    __tablename__ = "ward_beds"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    ward_name = Column(String, nullable=False)
    bed_number = Column(String, nullable=False)
    is_occupied = Column(Boolean, default=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    
    patient = relationship("Patient")

class ShiftSwap(Base):
    __tablename__ = "shift_swaps"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    requester_ho_id = Column(Integer, ForeignKey("house_officers.id", ondelete="CASCADE"), nullable=False)
    acceptor_ho_id = Column(Integer, ForeignKey("house_officers.id", ondelete="CASCADE"), nullable=False)
    shift_to_give_id = Column(Integer, ForeignKey("duty_shifts.id", ondelete="CASCADE"), nullable=False)
    shift_to_take_id = Column(Integer, ForeignKey("duty_shifts.id", ondelete="CASCADE"), nullable=True)
    status = Column(Enum(SwapStatusEnum), default=SwapStatusEnum.Pending_Acceptance)
    
    requester = relationship("HouseOfficer", foreign_keys=[requester_ho_id])
    acceptor = relationship("HouseOfficer", foreign_keys=[acceptor_ho_id])
    shift_to_give = relationship("DutyShift", foreign_keys=[shift_to_give_id])
    shift_to_take = relationship("DutyShift", foreign_keys=[shift_to_take_id])

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    house_officer_id = Column(Integer, ForeignKey("house_officers.id", ondelete="CASCADE"), nullable=False)
    date_requested = Column(Date, default=date.today)
    leave_date = Column(Date, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(Enum(LeaveStatusEnum), default=LeaveStatusEnum.Pending)
    tmo_comment = Column(String, nullable=True)
    
    house_officer = relationship("HouseOfficer")

class HOTask(Base):
    __tablename__ = "ho_tasks"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    tmo_id = Column(Integer, ForeignKey("tmo_profiles.id", ondelete="CASCADE"), nullable=False)
    ho_id = Column(Integer, ForeignKey("house_officers.id", ondelete="CASCADE"), nullable=False)
    task_title = Column(String, nullable=False)
    task_description = Column(String, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.Pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    tmo = relationship("TMOProfile")
    house_officer = relationship("HouseOfficer")
