from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {
        "from_attributes": True
    }
