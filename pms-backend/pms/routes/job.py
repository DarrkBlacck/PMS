from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.job import Job, JobUpdate
from pymongo import ReturnDocument
from typing import List
from pms.services.job_services import job_mgr

router = APIRouter()

@router.get("/get", response_model=List[Job])
async def get_jobs():
    try:
        jobs = await job_mgr.get_jobs()
        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/{job_id}", response_model=Job)
async def get_job(job_id: str):
    try:
        job = await job_mgr.get_job(job_id)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/drive/{drive_id}", response_model=List[Job])
async def get_job_by_drive(drive_id: str):
    try:
        jobs = await job_mgr.get_job_by_drive(drive_id)
        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/company/{company_id}", response_model=List[Job])
async def get_job_by_company(company_id: str):
    try:
        jobs = await job_mgr.get_job_by_company(company_id)
        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/drivecompany/{drive_id}/{company_id}", response_model=List[Job])
async def get_job_by_drivecompany(drive_id: str, company_id: str):
    try:
        jobs = await job_mgr.get_job_by_drivecompany(drive_id, company_id)
        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
    
@router.post("/add/{drive_id}/{company_id}")
async def add_job(job: Job, drive_id: str, company_id: str):
    try:
        job = await job_mgr.add_job(job, drive_id, company_id)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding job: {str(e)}"
        )

@router.patch("/update/{job_id}")
async def update_job(job_id: str, job: JobUpdate):
    try:
        job = await job_mgr.update_job(job_id, job)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job: {str(e)}"
        )

@router.delete("/delete/{job_id}")
async def delete_job(job_id: str):
    try:
        job = await job_mgr.delete_job(job_id)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )  

@router.delete("/delete/drive/{drive_id}")
async def delete_job_by_drive(drive_id: str):
    try:
        job = await job_mgr.delete_job_by_drive(drive_id)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )

@router.delete("/delete/company/{company_id}")
async def delete_job_by_company(company_id: str):
    try:
        job = await job_mgr.delete_job_by_company(company_id)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )
    
@router.delete("/delete/drivecompany/{drive_id}/{company_id}")
async def delete_job_by_drivecompany(drive_id: str, company_id: str):
    try:
        job = await job_mgr.delete_job_by_drivecompany(drive_id, company_id)
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )
