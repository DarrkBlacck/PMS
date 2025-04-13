from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List




class Drive(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    desc: Optional[str] = None
    location: Optional[str] = None
    drive_date: Optional[datetime] = None
    applied_students: Optional[List[str]] = []
    stages: Optional[List[str]] = []
    selected_students: Optional[List[str]] = []
    send_to: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    additional_instructions: Optional[str] = None
    form_link: Optional[str] = None


class DriveUpdate(BaseModel):
        title: Optional[str] = None
        desc: Optional[str] = None
        location: Optional[str] = None
        drive_date: Optional[datetime] = None
        applied_students: Optional[List[str]] = None
        stages: Optional[List[str]] = None
        selected_students: Optional[List[str]] = None
        send_to: Optional[List[str]] = None
        application_deadline: Optional[datetime] = None
        additional_instructions: Optional[str] = None
        form_link: Optional[str] = None
