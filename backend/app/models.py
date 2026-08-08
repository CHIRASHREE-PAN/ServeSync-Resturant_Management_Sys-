from datetime import datetime

<<<<<<< HEAD:backend/app/models.py
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)

=======
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Numeric, UniqueConstraint
>>>>>>> 463124af02341a26f11446ceb35802d78cace07e:app/models.py
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="staff")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    otps: Mapped[list["OTP"]] = relationship(back_populates="user")


class OTP(Base):
    __tablename__ = "otp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    otp: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="otps")


class Table(Base):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    table_number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="available")

    customer_sessions: Mapped[list["CustomerSession"]] = relationship(back_populates="table")


class CustomerSession(Base):
    __tablename__ = "customer_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    session_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    table_id: Mapped[int] = mapped_column(ForeignKey("tables.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    number_of_people: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=None)

    table: Mapped[Table] = relationship(back_populates="customer_sessions")
    orders: Mapped[list["Order"]] = relationship(back_populates="session")
    waiter_calls: Mapped[list["WaiterCall"]] = relationship(back_populates="session")
    bills: Mapped[list["Bill"]] = relationship(back_populates="session")
    feedback: Mapped[list["Feedback"]] = relationship(back_populates="session")

    @property
    def table_number(self) -> int:
        return self.table.table_number if self.table is not None else 0


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    menu_items: Mapped[list["MenuItem"]] = relationship(back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cook_time: Mapped[int | None] = mapped_column(Integer, nullable=True)
    availability: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    chef_special: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    best_seller: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    category: Mapped[Category] = relationship(back_populates="menu_items")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="menu_item")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    session_id: Mapped[int] = mapped_column(ForeignKey("customer_sessions.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ORDER_RECEIVED")
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    sgst: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    cgst: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    tax: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    estimated_cooking_time: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    session: Mapped[CustomerSession] = relationship(back_populates="orders")
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    waiter_notifications: Mapped[list["WaiterNotification"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    menu_item_id: Mapped[int] = mapped_column(ForeignKey("menu_items.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    instruction: Mapped[str | None] = mapped_column(Text, nullable=True)

    order: Mapped[Order] = relationship(back_populates="order_items")
    menu_item: Mapped[MenuItem] = relationship(back_populates="order_items")


class WaiterNotification(Base):
    __tablename__ = "waiter_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    order: Mapped[Order] = relationship(back_populates="waiter_notifications")


class WaiterCall(Base):
    __tablename__ = "waiter_calls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    session_id: Mapped[int] = mapped_column(ForeignKey("customer_sessions.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="OPEN")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    session: Mapped[CustomerSession] = relationship(back_populates="waiter_calls")


class Bill(Base):
    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    session_id: Mapped[int] = mapped_column(ForeignKey("customer_sessions.id"), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    tax: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    pdf_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    session: Mapped[CustomerSession] = relationship(back_populates="bills")


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (UniqueConstraint("session_id", name="uq_feedback_session_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, nullable=False)
    session_id: Mapped[int] = mapped_column(ForeignKey("customer_sessions.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
<<<<<<< HEAD:backend/app/models.py
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
=======
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
>>>>>>> 463124af02341a26f11446ceb35802d78cace07e:app/models.py

    session: Mapped[CustomerSession] = relationship(back_populates="feedback")