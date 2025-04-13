from datetime import datetime, timedelta
from pms.models.user import User, UserUpdate
from pms.models.auth import UserLogin
from pms.db.database import DatabaseConnection
from pms.core.config import config
from pms.services.auth_services import create_access_token
from pms.utils.utilities import util_mgr
from bson import ObjectId

class UserMgr:
    def __init__(self):
        self.db = None
        self.users_collection = None
    
    async def initialize(self):
        self.db = DatabaseConnection()
        self.users_collection = await self.db.get_collection("users")

    async def get_users(self):
        try:
            users = await self.users_collection.find().to_list(length=100)
            for user in users:
                user["_id"] = str(user["_id"])
            return users
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        

    async def add_user(self, user: User):
        try:
            user_data = user.model_dump()
            hashed_password = util_mgr.hash_password(user_data["password"])
            user_data["password"] = hashed_password
            response = await self.users_collection.insert_one(user_data)
            user_id = str(response.inserted_id)

            return {
                "status": "success",
                "message": f"User added with id: {user_id}",
                "id": user_id
            }
        except Exception as e:
            raise Exception(f"Error adding user: {str(e)}")
        

    async def login_user(self, user: UserLogin):
        try:
            user_data = await self.users_collection.find_one({"email": user.email})
            if user_data is None:
                raise Exception("User not found")
            if not util_mgr.verify_password(user.password, user_data["password"]):
                raise Exception("Incorrect password")
            if user_data["status"] == "inactive":
                raise Exception("User is inactive")
            access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={ 
                       "_id": str(user_data["_id"]),
                       "email": user_data["email"],
                       "role": user_data["role"],
                        "first_name": user_data["first_name"],
                        "last_name": user_data["last_name"]
                        }, expires_delta=access_token_expires
            )
            return {"access_token": access_token, "role": user_data["role"], "status": user_data["status"]}
        except Exception as e:
            raise Exception(f"Error logging in: {str(e)}")
        
    async def get_user(self, user_id: str):
        try:
            user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
                return user
            raise Exception("User not found")
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")

    async def update_user(self, user_id: str, user: UserUpdate):
        try:
            user_data = user.model_dump(exclude_none=True)
            if "password" in user_data:
                user_data["password"] = util_mgr.hash_password(user_data["password"])
            
            updated_user = await self.users_collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": user_data},
                return_document=True
            )
            
            if not updated_user:
                raise Exception("User not found")

            updated_user["_id"] = str(updated_user["_id"])
            return updated_user
        except Exception as e:
            raise Exception(f"Error updating user: {str(e)}")

    async def delete_user(self, user_id: str):
        try:
            result = await self.users_collection.delete_one({"_id": ObjectId(user_id)})
            if result.deleted_count > 0:
                return {"status": "success", "message": "User deleted successfully"}
            raise Exception("User not found")
        except Exception as e:
            raise Exception(f"Error deleting user: {str(e)}")

user_mgr = UserMgr()