from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List


class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_name: Optional[str]=""
    first_name: str
    middle_name: Optional[str]=""
    last_name: Optional[str]=""
    gender: Optional[Literal["Male", "Female", "Other"]]="Male"
    email: Optional[EmailStr]=""
    ph_no: Annotated[str, constr(min_length=10, max_length=10)]
    password: Optional[str]=""
    role: Literal["admin", "faculty", "student", "alumni"]
    status: Optional[Literal["Inactive", "Active"]] = "Inactive"

class UserUpdate(BaseModel):
    user_name: Optional[str]=None
    first_name: Optional[str]=None
    middle_name: Optional[str]=None
    last_name: Optional[str]=None
    gender: Optional[Literal["Male", "Female", "Other"]]=None
    email: Optional[EmailStr]=None
    ph_no: Optional[Annotated[str, constr(min_length=10, max_length=10)]]=None
    password: Optional[str]=None
    role: Optional[Literal["admin", "faculty", "student", "alumni"]]=None
    status: Optional[Literal["Inactive", "Active"]] =None   


    