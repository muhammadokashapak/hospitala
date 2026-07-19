import os
import sys

# Add the project root to python path to import app correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import (
    Hospital, User, RoleEnum, GenderEnum, Department, Doctor, 
    HouseOfficer, TMOProfile, Inventory, WardBed, RotationGroup
)
from datetime import date, timedelta

def seed_db():
    print("Dropping and recreating all tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Hospital...")
        h1 = Hospital(name="City Central Hospital", license_key="CCH-2026-X89", address="Downtown")
        db.add(h1)
        db.commit()
        db.refresh(h1)

        print("Seeding Users and Roles...")
        from app.auth import get_password_hash
        
        # Passwords list
        # Admin: adminPass123
        # Receptionist: receptionPass123
        # Doctor: doctorPass123
        # Pharmacist: pharmacistPass123
        # Lab Tech: labPass123
        # Nurse: nursePass123
        # TMO: tmoPass123
        # Billing: billingPass123
        # HO Ali: aliPass123
        # HO Sara: saraPass123

        # 1. Admin
        admin = User(hospital_id=h1.id, email="admin@hospital.local", password_hash=get_password_hash("adminPass123"), full_name="Super Admin", role=RoleEnum.Admin, gender=GenderEnum.Male)
        
        # 2. Receptionist
        reception = User(hospital_id=h1.id, email="reception@hospital.local", password_hash=get_password_hash("receptionPass123"), full_name="Sarah Desk", role=RoleEnum.Receptionist, gender=GenderEnum.Female)
        
        # 3. Doctor (Consultant)
        doc_user = User(hospital_id=h1.id, email="doctor@hospital.local", password_hash=get_password_hash("doctorPass123"), full_name="Dr. Smith", role=RoleEnum.Doctor, gender=GenderEnum.Male)
        
        # 4. Pharmacist
        pharm = User(hospital_id=h1.id, email="pharmacist@hospital.local", password_hash=get_password_hash("pharmacistPass123"), full_name="John Pill", role=RoleEnum.Pharmacist, gender=GenderEnum.Male)
        
        # 5. Lab Tech
        lab = User(hospital_id=h1.id, email="lab@hospital.local", password_hash=get_password_hash("labPass123"), full_name="Techie Tom", role=RoleEnum.Lab_Tech, gender=GenderEnum.Male)
        
        # 6. Nurse
        nurse = User(hospital_id=h1.id, email="nurse@hospital.local", password_hash=get_password_hash("nursePass123"), full_name="Nurse Joy", role=RoleEnum.Nurse, gender=GenderEnum.Female)
        
        # 7. TMOs
        tmo_surg_user = User(hospital_id=h1.id, email="tmo_surgery@hospital.local", password_hash=get_password_hash("tmoSurg123"), full_name="Dr. Trainee (Surgery)", role=RoleEnum.TMO, gender=GenderEnum.Female)
        tmo_med_user = User(hospital_id=h1.id, email="tmo_medicine@hospital.local", password_hash=get_password_hash("tmoMed123"), full_name="Dr. Trainee (Medicine)", role=RoleEnum.TMO, gender=GenderEnum.Male)
        
        # 8. Billing
        billing = User(hospital_id=h1.id, email="billing@hospital.local", password_hash=get_password_hash("billingPass123"), full_name="Finance Fred", role=RoleEnum.Billing, gender=GenderEnum.Male)
        
        # 9. House Officers
        ho1_user = User(hospital_id=h1.id, email="ho_ali@hospital.local", password_hash=get_password_hash("aliPass123"), full_name="Dr. Ali (HO)", role=RoleEnum.House_Officer, gender=GenderEnum.Male)
        ho2_user = User(hospital_id=h1.id, email="ho_sara@hospital.local", password_hash=get_password_hash("saraPass123"), full_name="Dr. Sara (HO)", role=RoleEnum.House_Officer, gender=GenderEnum.Female)

        db.add_all([admin, reception, doc_user, pharm, lab, nurse, tmo_surg_user, tmo_med_user, billing, ho1_user, ho2_user])
        db.commit()

        print("Seeding Departments & Rotation Groups...")
        # Tracks
        rg_surgery = RotationGroup(hospital_id=h1.id, name="Surgery Track")
        rg_medicine = RotationGroup(hospital_id=h1.id, name="Medicine Track")
        db.add_all([rg_surgery, rg_medicine])
        db.commit()

        # Departments
        cardio = Department(hospital_id=h1.id, name="Cardiology")
        neuro = Department(hospital_id=h1.id, name="Neurology")
        gen_surg = Department(hospital_id=h1.id, name="General Surgery")
        ortho = Department(hospital_id=h1.id, name="Orthopedics")
        db.add_all([cardio, neuro, gen_surg, ortho])
        db.commit()

        # Map Departments to Tracks
        rg_surgery.departments.extend([gen_surg, ortho])
        rg_medicine.departments.extend([cardio, neuro])
        db.commit()

        # Profiles
        doc_profile = Doctor(hospital_id=h1.id, user_id=doc_user.id, department_id=cardio.id, specialization="Cardiologist")
        db.add(doc_profile)
        db.commit()

        tmo_surg_profile = TMOProfile(hospital_id=h1.id, user_id=tmo_surg_user.id, rotation_group_id=rg_surgery.id, specialty_program="FCPS Surgery", supervisor_doctor_id=doc_profile.id)
        tmo_med_profile = TMOProfile(hospital_id=h1.id, user_id=tmo_med_user.id, rotation_group_id=rg_medicine.id, specialty_program="FCPS Medicine", supervisor_doctor_id=doc_profile.id)
        
        start_d = date.today()
        end_d = start_d + timedelta(days=90)
        ho_prof1 = HouseOfficer(hospital_id=h1.id, user_id=ho1_user.id, rotation_group_id=rg_surgery.id, batch_year=2026, start_date=start_d, end_date=end_d)
        ho_prof2 = HouseOfficer(hospital_id=h1.id, user_id=ho2_user.id, rotation_group_id=rg_medicine.id, batch_year=2026, start_date=start_d, end_date=end_d)
        
        db.add_all([tmo_surg_profile, tmo_med_profile, ho_prof1, ho_prof2])
        
        print("Seeding Inventory & Wards...")
        inv1 = Inventory(hospital_id=h1.id, item_name="Paracetamol 500mg", quantity=500, threshold_limit=100)
        bed1 = WardBed(hospital_id=h1.id, ward_name="Cardiology ICU", bed_number="Bed-01", is_occupied=False)
        db.add_all([inv1, bed1])
        db.commit()

        print("Seed Complete! You can now log in with the generated emails.")

    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
