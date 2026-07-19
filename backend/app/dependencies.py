from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import database, models, schemas, auth

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.Admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_active_receptionist(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.RoleEnum.Receptionist, models.RoleEnum.Admin]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_active_doctor(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.Doctor:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_tmo(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.TMO:
        raise HTTPException(status_code=403, detail="Not enough permissions. Must be a TMO.")
    return current_user
