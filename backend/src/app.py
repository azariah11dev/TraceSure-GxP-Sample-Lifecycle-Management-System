from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from endpoints.post_endpoints.user_auth import user_auth_router
from endpoints.post_endpoints.test_management import sample_test_router
from endpoints.post_endpoints.deviation_form import sample_deviation_router

from endpoints.put_endpoints.update_sample_test import update_sample_test_router
from endpoints.put_endpoints.role_assignment import role_assign_router
from endpoints.put_endpoints.update_deviation_form import update_deviation_form_router
from endpoints.put_endpoints.review_tests import review_test_router

from endpoints.get_endpoints.add_tests import add_test_router
from endpoints.get_endpoints.display_tests import display_tests_router
from endpoints.get_endpoints.deviation_form_router import deviation_form_router

from models.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(title="TraceSure", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500",
                   "http://127.0.0.1:5500",
                   "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "Welcome to TraceSure API!",
            "description": "This is the backend server for TraceSure, a tool for tracking and analyzing software execution traces.",
            "health_check": "/health - Check the health status of the API.",
            "login page": "/auth/login - Login endpoint for user authentication.",
            "registration page": "/auth/register - Registration endpoint for new users.",
            "assign role page": "/auth/assign_role - Endpoint for assigning roles to users (Admin only)."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(user_auth_router)
app.include_router(sample_test_router)
app.include_router(sample_deviation_router)

app.include_router(update_sample_test_router)
app.include_router(role_assign_router)
app.include_router(update_deviation_form_router)
app.include_router(review_test_router)

app.include_router(add_test_router)
app.include_router(display_tests_router)
app.include_router(deviation_form_router)