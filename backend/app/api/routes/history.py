"""
Analysis History Routes.
Provides listing with pagination, search, label filtering, sorting, retrieval by ID, and deletion.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import repository
from app.schemas.history import HistoryListResponse, HistoryDetailResponse, HistoryItem, DeleteResponse

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=HistoryListResponse)
def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search keyword in message"),
    label: Optional[str] = Query(None, description="Filter by SPAM or HAM"),
    sort: str = Query("newest", pattern="^(newest|oldest)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    records, total = repository.get_history_paginated(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        label_filter=label,
        sort_order=sort
    )

    items = []
    for r in records:
        preview = r.message_text[:85] + ("..." if len(r.message_text) > 85 else "")
        indicators_list = [i.strip() for i in r.indicators.split(",") if i.strip()] if r.indicators else []
        items.append(
            HistoryItem(
                id=r.id,
                message_preview=preview,
                predicted_label=r.predicted_label,
                confidence=r.confidence,
                spam_probability=r.spam_probability,
                ham_probability=r.ham_probability,
                character_count=r.character_count,
                indicators=indicators_list,
                created_at=r.created_at
            )
        )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return {
        "items": items,
        "total_count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/{record_id}", response_model=HistoryDetailResponse)
def get_history_detail(record_id: int, db: Session = Depends(get_db)):
    record = repository.get_record_by_id(db=db, record_id=record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID {record_id} not found."
        )

    indicators_list = [i.strip() for i in record.indicators.split(",") if i.strip()] if record.indicators else []
    return HistoryDetailResponse(
        id=record.id,
        message_text=record.message_text,
        predicted_label=record.predicted_label,
        confidence=record.confidence,
        spam_probability=record.spam_probability,
        ham_probability=record.ham_probability,
        character_count=record.character_count,
        indicators=indicators_list,
        created_at=record.created_at
    )


@router.delete("/{record_id}", response_model=DeleteResponse)
def delete_history_record(record_id: int, db: Session = Depends(get_db)):
    success = repository.delete_record_by_id(db=db, record_id=record_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID {record_id} not found."
        )
    return {
        "success": True,
        "message": f"Record {record_id} deleted successfully.",
        "deleted_id": record_id
    }


@router.delete("", response_model=DeleteResponse)
def clear_all_history(
    confirm: bool = Query(False, description="Explicit confirmation flag required"),
    db: Session = Depends(get_db)
):
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation parameter 'confirm=true' is required to clear all history."
        )
    count = repository.clear_history(db=db)
    return {
        "success": True,
        "message": f"Successfully cleared all {count} history records.",
        "deleted_count": count
    }
