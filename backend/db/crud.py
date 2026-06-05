import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session as DBSession

from .models import Message, Session, engine

logger = logging.getLogger(__name__)


def get_db() -> DBSession:
    return DBSession(engine)


def create_session(session_id: str) -> bool:
    try:
        with get_db() as db:
            existing = db.query(Session).filter(Session.session_id == session_id).first()
            if existing:
                return True
            session = Session(session_id=session_id, created_at=datetime.now(timezone.utc))
            db.add(session)
            db.commit()
            return True
    except Exception as e:
        logger.exception("Failed to create session")
        return False


def append_message(session_id: str, role: str, content: str) -> bool:
    try:
        with get_db() as db:
            msg = Message(session_id=session_id, role=role, content=content)
            db.add(msg)
            db.commit()
            return True
    except Exception as e:
        logger.exception("Failed to append message")
        return False


def get_history(session_id: str) -> list[dict] | None:
    try:
        with get_db() as db:
            session = db.query(Session).filter(Session.session_id == session_id).first()
            if not session:
                return None
            messages = (
                db.query(Message)
                .filter(Message.session_id == session_id)
                .order_by(Message.created_at)
                .all()
            )
            return [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat(),
                }
                for m in messages
            ]
    except Exception as e:
        logger.exception("Failed to get history")
        return None
