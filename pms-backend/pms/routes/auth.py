from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.auth import UserLogin
from pms.services.user_services import user_mgr
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId


router = APIRouter()

@router.post("/login")
async def login(form_data: UserLogin):
    try:
        response = await user_mgr.login_user(form_data)
        print(form_data)
        return response
    except Exception as e:
        raise Exception(f"Failed login: {str(e)}")
