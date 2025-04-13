from datetime import datetime, timedelta
from pms.models.drive import Drive, DriveUpdate
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config


class DriveMgr:
    def __init__(self):
        self.db = None
        self.drive_collection = None
    
    async def initialize(self):
        self.db = DatabaseConnection()
        self.drive_collection = await self.db.get_collection("drives")
        
    async def get_drives(self):
        try:
            await self.db.connect()
            drives = await self.drive_collection.find().to_list(length=100)
            if len(drives) == 0:
                print("No drives added")
            for drive in drives:
                drive["_id"] = str(drive["_id"])
            return drives
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_drive(self, drive_id: str):
        try:
            await self.db.connect()
            drive = await self.drive_collection.find_one({"_id": ObjectId(drive_id)})
            if drive:
                drive["_id"] = str(drive["_id"])
                
                # Ensure levels is an empty list if not present
                if "levels" not in drive or drive["levels"] is None:
                    drive["levels"] = []
                
                return drive
            else:
                raise Exception("Drive not found")
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def add_drive(self, drive: Drive):
        try:
            await self.db.connect()
            drive_data = drive.model_dump()
            
            # Ensure levels is an empty list if not provided


            response = await self.drive_collection.insert_one(drive_data)
            
            # Get the inserted document with its ID
            inserted_drive = await self.drive_collection.find_one({"_id": response.inserted_id})
            inserted_drive["_id"] = str(inserted_drive["_id"])  # Convert ObjectId to string
            
            return {
                "status": "success",
                "message": "Drive added successfully",
                "data": inserted_drive
            }
            
        except Exception as e:
            raise Exception(f"Error adding drive: {str(e)}")
    
    async def update_drive(self, drive_id: str, drive: DriveUpdate):
        try:
            await self.db.connect()
            drive_data = drive.model_dump(exclude_none=True)
            
            # Ensure stages is a list of strings
            if "stages" in drive_data:
                drive_data["stages"] = [str(stage) for stage in drive_data["stages"]]

            response = await self.drive_collection.find_one_and_update(
                {"_id": ObjectId(drive_id)},
                {"$set": drive_data},
                return_document=ReturnDocument.AFTER,
                projection=None
            )
            if not response:
                raise Exception("Drive not found")
            
            response["_id"] = str(response["_id"])  # Convert ObjectId to string
            
            return {
                "status": "success",
                "message": "Drive updated successfully",
                "data": response
            }
        except Exception as e:
            raise Exception(f"Error updating drive: {str(e)}")
    
    async def delete_drive(self, drive_id: str):
        try:
            await self.db.connect()
            response = await self.drive_collection.delete_one({"_id": ObjectId(drive_id)})
            if response.deleted_count == 0:
                raise Exception("Drive not found")
            return {
                "status": "success",
                "message": "Drive deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting drive: {str(e)}")
    
    async def apply_to_drive(self, drive_id: str, student_id: str):
        try:
            await self.db.connect()
            response = await self.drive_collection.find_one_and_update(
                {"_id": ObjectId(drive_id)},
                {"$addToSet": {"applied_students": student_id}},  # Use addToSet to avoid duplicates
                return_document=ReturnDocument.AFTER
            )
            if not response:
                raise Exception("Drive not found")
            
            response["_id"] = str(response["_id"])
            return {
                "status": "success",
                "message": "Successfully applied to drive",
                "data": response
            }
        except Exception as e:
            raise Exception(f"Error applying to drive: {str(e)}")

drive_mgr = DriveMgr()
