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
from endpoints.get_endpoints.user_roles import user_role_router

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
    return {
        "message": "Welcome to TraceSure API!",
        "description": "This is the backend server for TraceSure, a GxP-compliant mini-LIMS designed for managing laboratory samples, test workflows, deviations, and approvals.",
        "health_check": "/health - Check the health status of the API.",
        "Endpoints": {
            "GET": {
                "add_tests": {
                    "/add_test/review_tests": "Returns a grouped list of samples that are completed but NOT yet reviewed by a technician. Groups tests by sample_name, counts total tests, flags if any test is OOS, and returns the earliest created_date.",
                    "/add_test/technician_review_tests": "Returns all PASS tests for a specific sample_name that still need technician review. Includes test details such as result, spec limits, unit, and performer.",
                    "/add_test/{sample_name}": "Returns all test names associated with a given sample_name (case-insensitive, trimmed). Used to populate test dropdowns or sample detail views."
                },
                "deviation_form_router": {
                    "/deviation_form/all_pending": "Returns all deviation forms where form_status = 'submitted'. Used for manager/QA review queues. Includes deviation code, sample, test, date, and department.",
                    "/deviation_form/modification": "Returns all deviation forms that are either not approved (approval_status = false) OR still in draft. Used for correction/editing workflows before final submission.",
                    "/deviation_form/tests": "Returns combined test + deviation info for a specific sample_name and test_name. Includes old test result, spec limits, unit, status, performer, and deviation code if it exists.",
                    "/deviation_form/review": "Returns a fully approved deviation form for a given sample_name and test_name. Used for viewing finalized deviation records.",
                    "/deviation_form/": "Returns a deviation form for a given sample_name and test_name ONLY if it is in draft, submitted, or not yet approved. Used for editing or continuing an in-progress deviation."
                },
                "display_tests": {
                    "/display_tests/dashboard": "Returns QA approval, status, reviewed_status, and manager_approval for all tests. Used for dashboard card counts and chart data.",
                    "/display_tests/deviations": "Returns all OOS/OOT tests along with their deviation form status (if any). Used for deviation tracking dashboards.",
                    "/display_tests/management_approval": "Returns both sample-level and test-level data for all tests awaiting manager approval. Includes aggregated sample info and detailed test listings.",
                    "/display_tests/test_for_release": "Returns both sample-level and test-level data for tests that have manager approval but are still awaiting QA release. Used for QA release queues.",
                    "/display_tests/historical": "Returns historical sample-level and test-level data for all tests that have completed QA approval. Used for historical reporting and audit trails.",
                    "/display_tests/{sample_name}": "Returns all tests for a given sample_name, including result, spec limits, unit, status, and deviation flag.",
                    "/display_tests/": "Returns grouped sample-level data for all tests that have not yet received manager approval. Used for manager pending-review dashboards."
                },
                "user_roles": {
                    "/current_users/": "Returns all users in the system, including username, email, role, and active status. Only accessible to Admin users; all other roles receive a 403 Not Authorized error."
                }
            },
            "POST": {
                "deviation_form": {
                    "/deviation/modification": "Updates an existing deviation form using deviation_code as the lookup key. Only non-identity fields are updated; sample_name, test_name, and deviation_code are never modified.",
                    "/deviation/": "Creates a new deviation form if none exists for the given sample_name and test_name, otherwise updates the existing deviation with the provided fields."
                },
                "test_management": {
                    "/sample/create_sample": "Creates a new sample and inserts all requested tests. Each test receives its specification limits, unit, and default workflow fields. Returns the sample name, creator, and formatted creation date.",
                    "/sample/add_tests": "Adds new tests to an existing sample. Rejects the request if any of the provided tests already exist. Inserts only non-duplicate tests and returns the list of added tests."
                },
                "user_auth": {
                    "/auth/login": "Authenticates a user by verifying username and password. Returns a JWT access token, token type, username, and role upon successful login.",
                    "/auth/register": "Creates a new user account after ensuring the username and email are not already registered. Stores a hashed password and returns a success message with the created user object."
                }
            },
            "PUT": {
                "review_tests": {
                    "/review_test/technician_review_tests": "Marks a test as reviewed by a technician. Only applies to tests not yet reviewed and prevents the performer from reviewing their own test.",
                    "/review_test/management_approval": "Approves or rejects a test at the manager level. Prevents performers and reviewers from approving their own tests and updates the linked deviation form accordingly.",
                    "/review_test/qa_approval": "Approves or rejects a test at the QA release stage. Ensures technician review and manager approval are completed first and prevents QA from releasing their own test."
                },
                "role_assignment": {
                    "/role_assign/assign_role": "Assigns a new role to a user. Only Admins can perform this action. Validates the requested role, checks that the user exists, updates the role, and returns a confirmation message."
                },
                "update_deviation_form": {
                    "/update_deviation_form/validate": "Validates and approves a deviation form using its deviation_code. Updates approver name, role, approval status, and form status.",
                    "/update_deviation_form/final_test": "Creates a deviation audit record and updates the main sample test with a new result. Prevents duplicate deviation entries, evaluates the new result, and commits both deviation and updated test data."
                },
                "update_sample_test": {
                    "/update_test_result/log_results": "Logs or updates a test result for a given sample and test. Requires justification if modifying an already completed test, records correction history, re-evaluates status, updates performer and completion date, and returns updated test details including deviation flag."
                }
            }
        },
    }

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
app.include_router(user_role_router)