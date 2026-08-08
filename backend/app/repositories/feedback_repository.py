from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Bill, CustomerSession, Feedback


class FeedbackRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_session(self, session_id: int) -> CustomerSession | None:
        return self.db.get(CustomerSession, session_id)

    def get_bill_by_session_id(self, session_id: int) -> Bill | None:
        return self.db.execute(
            select(Bill).where(Bill.session_id == session_id).order_by(Bill.created_at.desc(), Bill.id.desc())
        ).scalars().first()

    def get_by_session_id(self, session_id: int) -> Feedback | None:
        return self.db.execute(
            select(Feedback).where(Feedback.session_id == session_id)
        ).scalar_one_or_none()

    def get_by_id(self, feedback_id: int) -> Feedback | None:
        return self.db.execute(
            select(Feedback)
            .options(joinedload(Feedback.session).joinedload(CustomerSession.table))
            .where(Feedback.id == feedback_id)
        ).scalar_one_or_none()

    def list_feedback(
        self, *, page: int, page_size: int, rating: int | None
    ) -> tuple[list[Feedback], int]:
        statement = select(Feedback).options(
            joinedload(Feedback.session).joinedload(CustomerSession.table)
        )
        count_statement = select(func.count(Feedback.id))
        if rating is not None:
            statement = statement.where(Feedback.rating == rating)
            count_statement = count_statement.where(Feedback.rating == rating)

        total_items = self.db.execute(count_statement).scalar_one()
        items = self.db.execute(
            statement.order_by(Feedback.created_at.desc(), Feedback.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).scalars().all()
        return items, total_items

    def create(self, *, session_id: int, rating: int, comment: str | None) -> Feedback:
        feedback = Feedback(session_id=session_id, rating=rating, comment=comment)
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback

    def delete(self, feedback: Feedback) -> None:
        self.db.delete(feedback)
        self.db.commit()