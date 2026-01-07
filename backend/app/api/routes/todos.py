"""
Todo endpoints for CRUD operations and automation
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.database import get_db
from app.models.models import Todo, ChecklistItem
from app.models.user import User
from app.schemas import (
    TodoCreate, TodoUpdate, TodoResponse, TodoStatsResponse
)
from app.api.routes.auth import get_current_user

router = APIRouter(
    prefix="/todos",
    tags=["todos"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/", response_model=List[TodoResponse])
async def get_todos(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all todos for current user with optional filtering"""
    query = db.query(Todo).filter(
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    )
    
    if status_filter:
        query = query.filter(Todo.status == status_filter)
    
    return query.offset(skip).limit(limit).all()


@router.get("/today", response_model=List[TodoResponse])
async def get_today_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get todos for today"""
    today = date.today()
    return db.query(Todo).filter(
        Todo.user_id == current_user.id,
        Todo.date == today,
        Todo.deleted_at.is_(None)
    ).all()


@router.get("/stats", response_model=TodoStatsResponse)
async def get_todo_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get todo statistics"""
    total = db.query(func.count(Todo.id)).filter(
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    ).scalar()
    
    completed = db.query(func.count(Todo.id)).filter(
        Todo.user_id == current_user.id,
        Todo.status == "completed",
        Todo.deleted_at.is_(None)
    ).scalar()
    
    overdue = db.query(func.count(Todo.id)).filter(
        Todo.user_id == current_user.id,
        Todo.status == "pending",
        Todo.date < date.today(),
        Todo.deleted_at.is_(None)
    ).scalar()
    
    return {
        "total": total or 0,
        "completed": completed or 0,
        "pending": (total or 0) - (completed or 0),
        "overdue": overdue or 0,
        "completion_rate": (completed or 0) / (total or 1) * 100
    }


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific todo with checklist items"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할 일을 찾을 수 없습니다"
        )
    
    return todo


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new todo"""
    db_todo = Todo(
        user_id=current_user.id,
        title=todo.title,
        date=todo.date,
        start_time=todo.start_time,
        status=todo.status or "pending",
        priority=todo.priority or "medium",
        tags=todo.tags or [],
        repeat=todo.repeat
    )
    
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    
    return db_todo


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo_update: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update todo"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할 일을 찾을 수 없습니다"
        )
    
    update_data = todo_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)
    
    todo.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(todo)
    
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete todo"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할 일을 찾을 수 없습니다"
        )
    
    todo.deleted_at = datetime.utcnow()
    db.commit()


@router.patch("/{todo_id}/status", response_model=TodoResponse)
async def update_todo_status(
    todo_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update todo status (pending, completed, overdue)"""
    if status not in ["pending", "completed", "overdue"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않은 상태입니다"
        )
    
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할 일을 찾을 수 없습니다"
        )
    
    todo.status = status
    todo.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(todo)
    
    return todo


@router.post("/{todo_id}/checklist", status_code=status.HTTP_201_CREATED)
async def add_checklist_item(
    todo_id: str,
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add checklist item to todo"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id,
        Todo.deleted_at.is_(None)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할 일을 찾을 수 없습니다"
        )
    
    item = ChecklistItem(
        todo_id=todo_id,
        title=title,
        completed=False
    )
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return {"id": item.id, "title": item.title, "completed": item.completed}
