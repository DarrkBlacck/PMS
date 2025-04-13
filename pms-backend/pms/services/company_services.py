from datetime import datetime, timedelta
from mimetypes import init
from pms.models.company import Company, CompanyUpdate
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config


class CompanyMgr:
    def __init__(self) -> None:
        self.db = None
        self.companies_collection = None
    
    async def initialize(self) -> None:
        self.db = DatabaseConnection()
        self.companies_collection = await self.db.get_collection("companies")
    
    async def get_companies(self) -> List[Company]:
        try:
            await self.db.connect()
            companies = await self.companies_collection.find().to_list(length=100)
            if len(companies) == 0:
                print("No companies added")
            for company in companies:
                company["_id"] = str(company["_id"])
            return companies
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def get_company(self, company_id: str) -> Company:
        try:
            await self.db.connect()
            company = await self.companies_collection.find_one({"_id": ObjectId(company_id)})
            if company:
                company["_id"] = str(company["_id"])
                return company
            else:
                raise Exception("Company not found")
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def add_company(self, company: Company) -> Company:
        try:
            await self.db.connect()
            company_data = company.model_dump()
            response = await self.companies_collection.insert_one(company_data)
            
            # Get the inserted document with its ID
            inserted_company = await self.companies_collection.find_one({"_id": response.inserted_id})
            inserted_company["_id"] = str(inserted_company["_id"])  # Convert ObjectId to string
            
            return inserted_company
            
        except Exception as e:
            raise Exception(f"Error adding company: {str(e)}")
    
    async def update_company(self, company_id: str, company: CompanyUpdate) -> Company:
        try:
            await self.db.connect()
            company_data = company.model_dump(exclude_none=True)
            response = await self.companies_collection.find_one_and_update(
                {"_id": ObjectId(company_id)},
                {"$set": company_data},
                return_document=ReturnDocument.AFTER,
                projection=None
            )
            response["_id"] = str(response["_id"])  # Convert ObjectId to string
            return {
                "status": "success",
                "message": "Company updated successfully",
                "data": response
            }
        except Exception as e:
            raise Exception(f"Error updating company: {str(e)}")
        
    async def delete_company(self, company_id: str) -> Company:
        try:
            await self.db.connect()
            response = await self.companies_collection.delete_one({"_id": ObjectId(company_id)})
            if response.deleted_count == 0:
                raise Exception("Company not found")
            return {
                "status": "success",
                "message": "Company deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting Company: {str(e)}")
        
company_mgr = CompanyMgr()
