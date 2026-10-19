"""
Database Repository for Analysis History and Prediction Records.
Handles CRUD operations, pagination, search, filtering, and statistical aggregations.
"""

from typing import List, Tuple, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from app.database.models import PredictionRecord


def save_prediction(
    db: Session,
    message_text: str,
    predicted_label: str,
    confidence: float,
    spam_probability: float,
    ham_probability: float,
    indicators: List[str]
) -> PredictionRecord:
    record = PredictionRecord(
        message_text=message_text,
        predicted_label=predicted_label,
        confidence=confidence,
        spam_probability=spam_probability,
        ham_probability=ham_probability,
        indicators=",".join(indicators) if indicators else "",
        character_count=len(message_text),
        created_at=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_history_paginated(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    label_filter: Optional[str] = None,
    sort_order: str = "newest"
) -> Tuple[List[PredictionRecord], int]:
    query = db.query(PredictionRecord)

    if label_filter and label_filter.upper() in ["SPAM", "HAM"]:
        query = query.filter(PredictionRecord.predicted_label == label_filter.upper())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(PredictionRecord.message_text.ilike(term))

    if sort_order == "oldest":
        query = query.order_by(asc(PredictionRecord.created_at))
    else:
        query = query.order_by(desc(PredictionRecord.created_at))

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    return items, total


def get_record_by_id(db: Session, record_id: int) -> Optional[PredictionRecord]:
    return db.query(PredictionRecord).filter(PredictionRecord.id == record_id).first()


def delete_record_by_id(db: Session, record_id: int) -> bool:
    record = db.query(PredictionRecord).filter(PredictionRecord.id == record_id).first()
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True


def clear_history(db: Session) -> int:
    deleted_count = db.query(PredictionRecord).delete()
    db.commit()
    return deleted_count


def get_aggregate_statistics(db: Session):
    total = db.query(PredictionRecord).count()
    spam_count = db.query(PredictionRecord).filter(PredictionRecord.predicted_label == "SPAM").count()
    ham_count = db.query(PredictionRecord).filter(PredictionRecord.predicted_label == "HAM").count()
    
    avg_conf_row = db.query(func.avg(PredictionRecord.confidence)).scalar()
    avg_conf = float(avg_conf_row) if avg_conf_row is not None else 0.0

    latest_record = db.query(PredictionRecord).order_by(desc(PredictionRecord.created_at)).first()
    latest_time = latest_record.created_at.isoformat() + "Z" if latest_record else None

    # Calculate last 7 days activity
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=6)
    
    records_recent = db.query(
        func.date(PredictionRecord.created_at).label("record_date"),
        PredictionRecord.predicted_label,
        func.count(PredictionRecord.id).label("count")
    ).filter(PredictionRecord.created_at >= seven_days_ago)\
     .group_by(func.date(PredictionRecord.created_at), PredictionRecord.predicted_label)\
     .all()

    # Aggregate by date
    daily_map = {}
    for i in range(7):
        d_str = (seven_days_ago + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_map[d_str] = {"date": d_str, "total": 0, "spam": 0, "ham": 0}

    for row in records_recent:
        d_str = str(row[0])
        if d_str in daily_map:
            cnt = int(row[2])
            lbl = str(row[1]).upper()
            daily_map[d_str]["total"] += cnt
            if lbl == "SPAM":
                daily_map[d_str]["spam"] += cnt
            elif lbl == "HAM":
                daily_map[d_str]["ham"] += cnt

    daily_list = sorted(list(daily_map.values()), key=lambda x: x["date"])

    return {
        "total_analyzed": total,
        "spam_count": spam_count,
        "ham_count": ham_count,
        "spam_ratio": round(spam_count / total, 4) if total > 0 else 0.0,
        "ham_ratio": round(ham_count / total, 4) if total > 0 else 0.0,
        "avg_confidence": round(avg_conf, 4),
        "recent_activity": daily_list,
        "latest_prediction_time": latest_time
    }
