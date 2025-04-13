from datetime import datetime, timedelta
from pms.models.job import Job, JobUpdate
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config


class JobMgr:
    def __init__(self):
        self.db = None
        self.job_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.job_collection = await self.db.get_collection("jobs")
    
    async def get_jobs(self):
        try:
            await self.db.connect()
            jobs = await self.job_collection.find().to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job(self, job_id: str):
        try:
            job = await self.job_collection.find_one({"_id": ObjectId(job_id)})
            if job is None:
                raise Exception(status_code=404, detail="Job not found")
            job["_id"] = str(job["_id"])
            return job
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job_by_drive(self, drive_id: str):
        try:
            jobs = await self.job_collection.find({"drive": drive_id}).to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job_by_company(self, company_id: str):
        try:
            jobs = await self.job_collection.find({"company": company_id}).to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job_by_drivecompany(self, drive_id: str, company_id: str):
        try:
            jobs = await self.job_collection.find({"drive": drive_id, "company": company_id}).to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def add_job(self, job: Job, drive_id: str, company_id:str):
        try:
            job_data = job.model_dump()
            job_data["drive"] = drive_id
            job_data["company"] = company_id
            response = await self.job_collection.insert_one(job_data)
            inserted_job = await self.job_collection.find_one({"_id": response.inserted_id})
            inserted_job["_id"] = str(inserted_job["_id"])
            return {
                "status": "success",
                "message": "Job added successfully",
                "data": inserted_job
            }
        except Exception as e:
            raise Exception(f"Error adding job: {str(e)}")
    
    async def update_job(self, job_id:str, job: JobUpdate):
        try:
            job_data = job.model_dump(exclude_none=True)
            response = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)},
                {"$set": job_data},
                return_document=ReturnDocument.AFTER,
                projection=None
            )
            if not response:
                raise Exception("Job not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error updating job: {str(e)}")
        
    async def delete_job(self, job_id: str):
        try:
            response = await self.job_collection.find_one_and_delete({"_id": ObjectId(job_id)})
            if not response:
                raise Exception("Job not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error deleting job: {str(e)}")
    
    async def delete_job_by_drive(self, drive_id: str):
        try:
            response = await self.job_collection.delete_many({"drive": drive_id})
            return {
                "status": "success",
                "message": "Jobs deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting jobs: {str(e)}")
    
    async def delete_job_by_company(self, company_id: str):
        try:
            response = await self.job_collection.delete_many({"company": company_id})
            return {
                "status": "success",
                "message": "Jobs deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting jobs: {str(e)}")
    
    async def delete_job_by_drivecompany(self, drive_id:str, company_id:str):
        try: 
            response = await self.job_collection.delete_many({"drive": drive_id, "company": company_id})
            return {
                "status": "success",
                "message": "Jobs deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting jobs: {str(e)}")
        
job_mgr = JobMgr()
