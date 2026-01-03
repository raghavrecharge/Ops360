from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.repositories.project_repo import ProjectRepository
from app.core.security import get_current_user
from app.core.permissions import Permission

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(Permission.require_roles(["admin", "client_servicing"]))
):
    """Create a new project"""
    repo = ProjectRepository()
    data = project_data.model_dump()
    data["status"] = "active"
    project = await repo.create(data)
    return ProjectResponse(**project)

@router.get("", response_model=List[ProjectResponse])
async def get_projects(db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get all projects"""
    repo = ProjectRepository()
    projects = await repo.get_all()
    return [ProjectResponse(**p) for p in projects]

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get project by ID"""
    repo = ProjectRepository()
    project = await repo.get_by_id(project_id)
    
    if not project:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(**project)
