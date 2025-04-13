from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.company import Company, CompanyUpdate
from pms.services.company_services import company_mgr
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId

router = APIRouter()

@router.get("/get", response_model=List[Company])
async def get_companies():
   try:
         companies = await company_mgr.get_companies()
         return companies
   except Exception as e:
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail=f"Error fetching data: {str(e)}"
         )
   
@router.get("/get/{company_id}", response_model=Company)
async def get_company(company_id: str):
    try:
        company = await company_mgr.get_company(company_id)
        return company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
@router.post("/add")
async def add_company(company: Company):
    try:
        company = await company_mgr.add_company(company)
        return company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding company: {str(e)}"
        )

@router.patch("/update/{company_id}")
async def update_company(company_id: str, company: CompanyUpdate):
    try:
        company = await company_mgr.update_company(company_id, company)
        return company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating company: {str(e)}"
        )
@router.delete("/delete/{company_id}")
async def delete_company(company_id: str):
    try:
        company = await company_mgr.delete_company(company_id)
        return company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting company: {str(e)}"
        )

