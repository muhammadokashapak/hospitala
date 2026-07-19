from datetime import timedelta, date
from sqlalchemy.orm import Session
from . import models
import math

def generate_rotations(db: Session, hospital_id: int, rotation_group_id: int, start_date: date):
    """
    Generates track-isolated department rotations for HOs in a specific rotation group.
    Each department gets roughly an equal slice of the 3-month (90 days) block.
    """
    group = db.query(models.RotationGroup).filter(
        models.RotationGroup.id == rotation_group_id,
        models.RotationGroup.hospital_id == hospital_id
    ).first()
    
    if not group:
        return {"error": "Rotation group not found."}
        
    departments = group.departments
    if not departments:
        return {"error": f"No departments mapped to track '{group.name}'."}
        
    hos = db.query(models.HouseOfficer).filter(
        models.HouseOfficer.hospital_id == hospital_id,
        models.HouseOfficer.rotation_group_id == rotation_group_id
    ).all()
    
    if not hos:
        return {"error": f"No House Officers assigned to track '{group.name}'."}
        
    # 3 month block = 90 days. Divide by number of departments.
    days_per_dept = 90 // len(departments)
    
    rotations_to_create = []
    
    for i, ho in enumerate(hos):
        # Offset the starting department based on the HO's index to avoid everyone in the same dept
        current_start = start_date
        for j in range(len(departments)):
            dept_idx = (i + j) % len(departments)
            dept = departments[dept_idx]
            
            end_d = current_start + timedelta(days=days_per_dept - 1)
            
            rotations_to_create.append(models.Rotation(
                hospital_id=hospital_id,
                house_officer_id=ho.id,
                department_id=dept.id,
                start_date=current_start,
                end_date=end_d,
                status=models.RotationStatusEnum.Upcoming
            ))
            current_start = end_d + timedelta(days=1)
            
    db.add_all(rotations_to_create)
    db.commit()
    
    return {"message": f"Successfully generated {len(rotations_to_create)} block rotations for {len(hos)} HOs in {group.name}."}

def generate_fair_shifts(db: Session, hospital_id: int, rotation_group_id: int, start_date: date, days: int = 30):
    # Fetch all active House Officers for this hospital AND rotation group
    hos = db.query(models.HouseOfficer).join(models.User).filter(
        models.HouseOfficer.hospital_id == hospital_id,
        models.HouseOfficer.rotation_group_id == rotation_group_id
    ).all()
    
    if not hos:
        return {"message": "No house officers found"}

    males = [ho for ho in hos if ho.user.gender == models.GenderEnum.Male]
    females = [ho for ho in hos if ho.user.gender == models.GenderEnum.Female]
    
    # State tracking
    points = {ho.id: 0.0 for ho in hos}
    last_shift = {ho.id: None for ho in hos} # To track post-night off
    
    shifts_to_create = []

    # Iterate day by day
    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        is_sunday = current_date.weekday() == 6
        
        # Determine available Male HOs for Night/Sunday
        # Must not be on Post-Night off
        available_males = [m for m in males if last_shift[m.id] != models.ShiftTypeEnum.Night]
        
        # 1. Assign Night Shift (1 per day)
        available_males.sort(key=lambda m: points[m.id])
        if available_males:
            night_ho = available_males[0]
            shifts_to_create.append(models.DutyShift(
                hospital_id=hospital_id, house_officer_id=night_ho.id,
                shift_date=current_date, shift_type=models.ShiftTypeEnum.Night,
                is_weekend=is_sunday, points_assigned=2.0
            ))
            points[night_ho.id] += 2.0
            last_shift[night_ho.id] = models.ShiftTypeEnum.Night
            available_males.remove(night_ho) # Assigned, can't do day shift
            
        # 2. Assign Day Shifts (Morning, Evening)
        if is_sunday:
            # Sunday Morning and Evening (Males only based on strict constraints)
            available_males.sort(key=lambda m: points[m.id])
            if len(available_males) > 0:
                morning_ho = available_males[0]
                shifts_to_create.append(models.DutyShift(
                    hospital_id=hospital_id, house_officer_id=morning_ho.id,
                    shift_date=current_date, shift_type=models.ShiftTypeEnum.Morning,
                    is_weekend=True, points_assigned=2.0
                ))
                points[morning_ho.id] += 2.0
                last_shift[morning_ho.id] = models.ShiftTypeEnum.Morning
                available_males.remove(morning_ho)
                
            available_males.sort(key=lambda m: points[m.id])
            if len(available_males) > 0:
                evening_ho = available_males[0]
                shifts_to_create.append(models.DutyShift(
                    hospital_id=hospital_id, house_officer_id=evening_ho.id,
                    shift_date=current_date, shift_type=models.ShiftTypeEnum.Evening,
                    is_weekend=True, points_assigned=2.0
                ))
                points[evening_ho.id] += 2.0
                last_shift[evening_ho.id] = models.ShiftTypeEnum.Evening
                
        else:
            # Weekday: Combine available males and females
            available_all = available_males + females
            # Assign Morning (1.0)
            available_all.sort(key=lambda ho: points[ho.id])
            if available_all:
                morning_ho = available_all[0]
                shifts_to_create.append(models.DutyShift(
                    hospital_id=hospital_id, house_officer_id=morning_ho.id,
                    shift_date=current_date, shift_type=models.ShiftTypeEnum.Morning,
                    is_weekend=False, points_assigned=1.0
                ))
                points[morning_ho.id] += 1.0
                last_shift[morning_ho.id] = models.ShiftTypeEnum.Morning
                available_all.remove(morning_ho)
                
            # Assign Evening (1.2)
            available_all.sort(key=lambda ho: points[ho.id])
            if available_all:
                evening_ho = available_all[0]
                shifts_to_create.append(models.DutyShift(
                    hospital_id=hospital_id, house_officer_id=evening_ho.id,
                    shift_date=current_date, shift_type=models.ShiftTypeEnum.Evening,
                    is_weekend=False, points_assigned=1.2
                ))
                points[evening_ho.id] += 1.2
                last_shift[evening_ho.id] = models.ShiftTypeEnum.Evening

    db.add_all(shifts_to_create)
    db.commit()
    
    return {"message": "Schedule generated successfully", "points_summary": points}
