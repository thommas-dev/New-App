from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import hashlib
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()
SECRET_KEY = "simplepm_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Create the main app without a prefix
app = FastAPI(title="SimplePM Board API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "Admin"
    SUPERVISOR = "Maintenance Supervisor"

class WorkOrderType(str, Enum):
    PM = "PM"
    REPAIR = "Repair"

class WorkOrderStatus(str, Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    ON_HOLD = "On Hold"

class Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    role: UserRole
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    trial_start: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_trial_active: bool = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Department(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class DepartmentCreate(BaseModel):
    name: str

class Machine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department_id: str
    department_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class MachineCreate(BaseModel):
    name: str
    department_id: str

class WorkOrderChecklistItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    completed: bool = False
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None

class WorkOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wo_id: str  # Auto-generated WO-2025-0001 format
    title: str
    type: WorkOrderType
    priority: Priority
    status: WorkOrderStatus = WorkOrderStatus.SCHEDULED
    assignee: Optional[str] = None
    assignee_name: Optional[str] = None
    requested_by: str
    requested_by_name: str
    site: Optional[str] = "Main Site"
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    machine_id: Optional[str] = None
    machine_name: Optional[str] = None
    location: Optional[str] = None
    due_date: Optional[datetime] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    estimated_duration: Optional[int] = None  # minutes
    description: Optional[str] = None
    checklist: List[WorkOrderChecklistItem] = []
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class WorkOrderCreate(BaseModel):
    title: str
    type: WorkOrderType
    priority: Priority = Priority.MEDIUM
    assignee: Optional[str] = None
    site: Optional[str] = "Main Site"
    department_id: Optional[str] = None
    machine_id: Optional[str] = None
    location: Optional[str] = None
    due_date: Optional[datetime] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    description: Optional[str] = None
    checklist_items: List[str] = []
    tags: List[str] = []

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[WorkOrderStatus] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return User(**user)

async def generate_wo_id():
    """Generate next WO ID in format WO-2025-0001"""
    current_year = datetime.now(timezone.utc).year
    prefix = f"WO-{current_year}-"
    
    # Find the latest WO ID for this year
    latest_wo = await db.work_orders.find_one(
        {"wo_id": {"$regex": f"^{prefix}"}},
        sort=[("wo_id", -1)]
    )
    
    if latest_wo:
        last_number = int(latest_wo["wo_id"].split("-")[2])
        next_number = last_number + 1
    else:
        next_number = 1
    
    return f"{prefix}{next_number:04d}"

def prepare_for_mongo(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, list):
                result[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
            elif isinstance(value, dict):
                result[key] = prepare_for_mongo(value)
            else:
                result[key] = value
        return result
    return data

def parse_from_mongo(item: Dict[str, Any]) -> Dict[str, Any]:
    """Parse datetime strings back from MongoDB"""
    datetime_fields = ['created_at', 'updated_at', 'due_date', 'scheduled_start', 'scheduled_end', 'completed_at', 'trial_start']
    
    for field in datetime_fields:
        if field in item and isinstance(item[field], str):
            try:
                item[field] = datetime.fromisoformat(item[field].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass
    
    # Handle nested datetime in checklist
    if 'checklist' in item and isinstance(item['checklist'], list):
        for checklist_item in item['checklist']:
            if isinstance(checklist_item, dict) and 'completed_at' in checklist_item and isinstance(checklist_item['completed_at'], str):
                try:
                    checklist_item['completed_at'] = datetime.fromisoformat(checklist_item['completed_at'].replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    pass
    
    return item

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        role=user_data.role
    )
    
    user_dict = prepare_for_mongo(user.dict())
    user_dict["hashed_password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    user_obj = User(**parse_from_mongo(user))
    access_token = create_access_token(data={"sub": user_obj.username})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Department routes
@api_router.post("/departments", response_model=Department)
async def create_department(dept_data: DepartmentCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create departments")
    
    # Check if department exists
    existing = await db.departments.find_one({"name": dept_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    department = Department(
        name=dept_data.name,
        created_by=current_user.id
    )
    
    dept_dict = prepare_for_mongo(department.dict())
    await db.departments.insert_one(dept_dict)
    
    return department

@api_router.get("/departments", response_model=List[Department])
async def get_departments(current_user: User = Depends(get_current_user)):
    departments = await db.departments.find().to_list(length=None)
    return [Department(**parse_from_mongo(dept)) for dept in departments]

@api_router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can delete departments")
    
    # Check if department has machines
    machines = await db.machines.find({"department_id": dept_id}).to_list(length=1)
    if machines:
        raise HTTPException(status_code=400, detail="Cannot delete department with machines")
    
    result = await db.departments.delete_one({"id": dept_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    
    return {"message": "Department deleted successfully"}

# Machine routes
@api_router.post("/machines", response_model=Machine)
async def create_machine(machine_data: MachineCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create machines")
    
    # Get department info
    department = await db.departments.find_one({"id": machine_data.department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    machine = Machine(
        name=machine_data.name,
        department_id=machine_data.department_id,
        department_name=department["name"],
        created_by=current_user.id
    )
    
    machine_dict = prepare_for_mongo(machine.dict())
    await db.machines.insert_one(machine_dict)
    
    return machine

@api_router.get("/machines", response_model=List[Machine])
async def get_machines(department_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if department_id:
        query["department_id"] = department_id
    
    machines = await db.machines.find(query).to_list(length=None)
    return [Machine(**parse_from_mongo(machine)) for machine in machines]

@api_router.delete("/machines/{machine_id}")
async def delete_machine(machine_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can delete machines")
    
    result = await db.machines.delete_one({"id": machine_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    return {"message": "Machine deleted successfully"}

# Work Order routes
@api_router.post("/work-orders", response_model=WorkOrder)
async def create_work_order(wo_data: WorkOrderCreate, current_user: User = Depends(get_current_user)):
    wo_id = await generate_wo_id()
    
    # Get department and machine names if provided
    department_name = None
    machine_name = None
    assignee_name = None
    
    if wo_data.department_id:
        dept = await db.departments.find_one({"id": wo_data.department_id})
        department_name = dept["name"] if dept else None
    
    if wo_data.machine_id:
        machine = await db.machines.find_one({"id": wo_data.machine_id})
        machine_name = machine["name"] if machine else None
    
    if wo_data.assignee:
        assignee = await db.users.find_one({"id": wo_data.assignee})
        assignee_name = assignee["username"] if assignee else None
    
    # Create checklist items
    checklist = []
    for item_text in wo_data.checklist_items:
        checklist.append(WorkOrderChecklistItem(text=item_text))
    
    work_order = WorkOrder(
        wo_id=wo_id,
        title=wo_data.title,
        type=wo_data.type,
        priority=wo_data.priority,
        assignee=wo_data.assignee,
        assignee_name=assignee_name,
        requested_by=current_user.id,
        requested_by_name=current_user.username,
        site=wo_data.site,
        department_id=wo_data.department_id,
        department_name=department_name,
        machine_id=wo_data.machine_id,
        machine_name=machine_name,
        location=wo_data.location,
        due_date=wo_data.due_date,
        scheduled_start=wo_data.scheduled_start,
        scheduled_end=wo_data.scheduled_end,
        estimated_duration=wo_data.estimated_duration,
        description=wo_data.description,
        checklist=checklist,
        tags=wo_data.tags
    )
    
    wo_dict = prepare_for_mongo(work_order.dict())
    await db.work_orders.insert_one(wo_dict)
    
    return work_order

@api_router.get("/work-orders", response_model=List[WorkOrder])
async def get_work_orders(current_user: User = Depends(get_current_user)):
    work_orders = await db.work_orders.find().sort("created_at", -1).to_list(length=None)
    return [WorkOrder(**parse_from_mongo(wo)) for wo in work_orders]

@api_router.get("/work-orders/{wo_id}", response_model=WorkOrder)
async def get_work_order(wo_id: str, current_user: User = Depends(get_current_user)):
    work_order = await db.work_orders.find_one({"id": wo_id})
    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return WorkOrder(**parse_from_mongo(work_order))

@api_router.put("/work-orders/{wo_id}", response_model=WorkOrder)
async def update_work_order(wo_id: str, wo_update: WorkOrderUpdate, current_user: User = Depends(get_current_user)):
    work_order = await db.work_orders.find_one({"id": wo_id})
    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    update_data = {k: v for k, v in wo_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Handle assignee name update
    if "assignee" in update_data and update_data["assignee"]:
        assignee = await db.users.find_one({"id": update_data["assignee"]})
        update_data["assignee_name"] = assignee["username"] if assignee else None
    
    # Handle status change to completed
    if "status" in update_data and update_data["status"] == WorkOrderStatus.COMPLETED:
        update_data["completed_at"] = datetime.now(timezone.utc)
    
    prepared_update = prepare_for_mongo(update_data)
    await db.work_orders.update_one({"id": wo_id}, {"$set": prepared_update})
    
    updated_wo = await db.work_orders.find_one({"id": wo_id})
    return WorkOrder(**parse_from_mongo(updated_wo))

@api_router.delete("/work-orders/{wo_id}")
async def delete_work_order(wo_id: str, current_user: User = Depends(get_current_user)):
    result = await db.work_orders.delete_one({"id": wo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return {"message": "Work order deleted successfully"}

# Users route for assignee dropdown
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    users = await db.users.find().to_list(length=None)
    return [User(**parse_from_mongo(user)) for user in users]

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "ok", "message": "SimplePM Board API is running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
