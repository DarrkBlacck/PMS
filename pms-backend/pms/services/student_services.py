from pms.db.database import DatabaseConnection
from pms.models.student import Student, StudentUpdate
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from pms.services.user_services import user_mgr
from pms.models.user import User, UserUpdate

class StudentMgr:
    def __init__(self):
        self.db = None
        self.students_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.students_collection = await self.db.get_collection("students")

    async def get_students(self):
        try:
            students = await self.students_collection.find().to_list(length=100)
            for student in students:
                student["_id"] = str(student["_id"])
            return students
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def add_student(self, student: Student):
        try:
            # First create the user
            user = User(
                first_name=student.first_name,
                middle_name=student.middle_name,
                last_name=student.last_name,
                email=student.email,
                ph_no=student.ph_no,
                role="student",
                gender=student.gender,
                status="Active"  # Set default status
            )
            
            # Add user first
            user_response = await user_mgr.add_user(user)
            user_id = user_response["id"]
            
            # Add user_id to student data
            student_data = student.model_dump()
            student_data["user_id"] = user_id
            student_data["created_at"] = datetime.now()
            student_data["updated_at"] = datetime.now()
            
            # Create student record
            response = await self.students_collection.insert_one(student_data)
            
            return {
                "status": "success",
                "message": f"Student added with id: {response.inserted_id}",
                "student_id": str(response.inserted_id),
                "user_id": user_id
            }
        except Exception as e:
            if 'user_id' in locals():
                await user_mgr.delete_user(user_id)
            raise Exception(f"Error adding student: {str(e)}")
    
    async def get_student(self, student_id: str):
        try:
            student = await self.students_collection.find_one({"_id": ObjectId(student_id)})
            if student:
                student["_id"] = str(student["_id"])
                return student
            raise Exception("Student not found")
        except Exception as e:
            raise Exception(f"Error fetching student: {str(e)}")
    
    async def get_student_by_user_id(self, user_id: str):
        try:
            student = await self.students_collection.find_one({"user_id": user_id})
            if student:
                student["_id"] = str(student["_id"])
                return student
            raise Exception("Student not found")
        except Exception as e:
            raise Exception(f"Error fetching student: {str(e)}")
    
    async def update_student(self, student_id: str, student: StudentUpdate):
        try:
            existing_student = await self.students_collection.find_one({"_id": ObjectId(student_id)})
            if not existing_student:
                raise Exception("Student not found")

            # Update user first
            user_data = UserUpdate(
                first_name=student.first_name,
                middle_name=student.middle_name,
                last_name=student.last_name,
                email=student.email,
                ph_no=student.ph_no,
                gender=student.gender
            )
            await user_mgr.update_user(existing_student["user_id"], user_data)

            # Update student
            updated_data = student.model_dump(exclude_none=True)
            updated_data["updated_at"] = datetime.now()
            
            updated_student = await self.students_collection.find_one_and_update(
                {"_id": ObjectId(student_id)},
                {"$set": updated_data},
                return_document=ReturnDocument.AFTER
            )
            
            if not updated_student:
                raise Exception("Failed to update student")
            
            updated_student["_id"] = str(updated_student["_id"])
            return updated_student
        except Exception as e:
            raise Exception(f"Error updating student: {str(e)}")
        
    async def delete_student(self, student_id: str):
        try:
            # Get student first
            student = await self.students_collection.find_one({"_id": ObjectId(student_id)})
            if not student:
                raise Exception("Student not found")

            # Delete student record first
            result = await self.students_collection.delete_one({"_id": ObjectId(student_id)})
            if result.deleted_count == 0:
                raise Exception("Failed to delete student")

            # Then delete user
            await user_mgr.delete_user(student["user_id"])
            
            return {"status": "success", "message": "Student and associated user deleted"}
        except Exception as e:
            raise Exception(f"Error deleting student: {str(e)}")

    async def update_by_user_id(self, user_id: str, data: dict):
        try:
            data["updated_at"] = datetime.now()
            student = await self.students_collection.find_one_and_update(
                {"user_id": user_id},
                {"$set": data},
                return_document=ReturnDocument.AFTER
            )
            if student:
                student["_id"] = str(student["_id"])
                return student
            return None
        except Exception as e:
            raise Exception(f"Error updating student: {str(e)}")

student_mgr = StudentMgr()
