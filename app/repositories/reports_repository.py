from datetime import date, datetime, time, timedelta
from decimal import Decimal

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import Bill, Category, CustomerSession, Feedback, MenuItem, Order, OrderItem


class ReportsRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def bounds(start: date, end: date) -> tuple[datetime, datetime]:
        return datetime.combine(start, time.min), datetime.combine(end + timedelta(days=1), time.min)

    def order_summary(self, start: date, end: date) -> dict:
        start_at, end_at = self.bounds(start, end)
        row = self.db.execute(
            select(
                func.count(Order.id),
                func.coalesce(func.sum(case((Order.status == "SERVED", 1), else_=0)), 0),
            ).where(Order.created_at >= start_at, Order.created_at < end_at)
        ).one()
        return {"orders": int(row[0] or 0), "completed_orders": int(row[1] or 0)}

    def bill_summary(self, start: date, end: date) -> dict:
        start_at, end_at = self.bounds(start, end)
        row = self.db.execute(
            select(
                func.count(Bill.id),
                func.coalesce(func.sum(case((Bill.is_paid.is_(True), 1), else_=0)), 0),
                func.coalesce(func.sum(case((Bill.is_paid.is_(True), Bill.total), else_=Decimal("0"))), Decimal("0")),
            ).where(Bill.created_at >= start_at, Bill.created_at < end_at)
        ).one()
        return {"bills_generated": int(row[0] or 0), "bills_paid": int(row[1] or 0), "revenue": row[2] or Decimal("0")}

    def session_summary(self, start: date, end: date) -> dict:
        start_at, end_at = self.bounds(start, end)
        row = self.db.execute(
            select(
                func.coalesce(func.sum(case((CustomerSession.status == "ACTIVE", 1), else_=0)), 0),
                func.coalesce(func.sum(case((CustomerSession.status == "COMPLETED", 1), else_=0)), 0),
                func.count(CustomerSession.id),
            ).where(CustomerSession.started_at >= start_at, CustomerSession.started_at < end_at)
        ).one()
        return {"active_sessions": int(row[0] or 0), "completed_sessions": int(row[1] or 0), "customer_sessions": int(row[2] or 0)}

    def feedback_summary(self, start: date, end: date) -> dict:
        start_at, end_at = self.bounds(start, end)
        row = self.db.execute(
            select(func.count(Feedback.id), func.avg(Feedback.rating)).where(
                Feedback.created_at >= start_at, Feedback.created_at < end_at
            )
        ).one()
        return {"feedback_count": int(row[0] or 0), "average_rating": row[1]}

    def top_items(self, start: date, end: date, limit: int = 1) -> list[tuple[str, int]]:
        start_at, end_at = self.bounds(start, end)
        rows = self.db.execute(
            select(MenuItem.name, func.sum(OrderItem.quantity).label("quantity"))
            .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.created_at >= start_at, Order.created_at < end_at)
            .group_by(MenuItem.id, MenuItem.name)
            .order_by(func.sum(OrderItem.quantity).desc(), MenuItem.name.asc())
            .limit(limit)
        ).all()
        return [(row[0], int(row[1])) for row in rows]

    def top_categories(self, start: date, end: date, limit: int = 1) -> list[tuple[str, int]]:
        start_at, end_at = self.bounds(start, end)
        rows = self.db.execute(
            select(Category.name, func.sum(OrderItem.quantity).label("quantity"))
            .join(MenuItem, MenuItem.category_id == Category.id)
            .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.created_at >= start_at, Order.created_at < end_at)
            .group_by(Category.id, Category.name)
            .order_by(func.sum(OrderItem.quantity).desc(), Category.name.asc())
            .limit(limit)
        ).all()
        return [(row[0], int(row[1])) for row in rows]

    def monthly_sales(self, year: int) -> dict[int, tuple[Decimal, int]]:
        start, end = date(year, 1, 1), date(year + 1, 1, 1)
        start_at, end_at = datetime.combine(start, time.min), datetime.combine(end, time.min)
        rows = self.db.execute(
            select(
                func.month(Bill.created_at),
                func.coalesce(func.sum(Bill.total), Decimal("0")),
                func.count(Bill.id),
            )
            .where(Bill.is_paid.is_(True), Bill.created_at >= start_at, Bill.created_at < end_at)
            .group_by(func.month(Bill.created_at))
            .order_by(func.month(Bill.created_at))
        ).all()
        return {int(row[0]): (row[1] or Decimal("0"), int(row[2] or 0)) for row in rows}

    def order_status_counts(self, year: int) -> dict[str, int]:
        start, end = date(year, 1, 1), date(year + 1, 1, 1)
        rows = self.db.execute(
            select(Order.status, func.count(Order.id))
            .where(Order.created_at >= datetime.combine(start, time.min), Order.created_at < datetime.combine(end, time.min))
            .group_by(Order.status)
        ).all()
        return {str(row[0]): int(row[1]) for row in rows}

    def rating_counts(self, year: int) -> dict[int, int]:
        start, end = date(year, 1, 1), date(year + 1, 1, 1)
        rows = self.db.execute(
            select(Feedback.rating, func.count(Feedback.id))
            .where(Feedback.created_at >= datetime.combine(start, time.min), Feedback.created_at < datetime.combine(end, time.min))
            .group_by(Feedback.rating)
        ).all()
        return {int(row[0]): int(row[1]) for row in rows}
