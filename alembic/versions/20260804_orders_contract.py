"""Order contract migration

Revision ID: 20260804_orders_contract
Revises: 20260803_customer_session_contract
Create Date: 2026-08-04 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260804_orders_contract"
down_revision = "20260803_customer_session_contract"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("orders")}

    if "sgst" not in columns:
        op.add_column("orders", sa.Column("sgst", sa.Numeric(10, 2), nullable=False, server_default="0"))
    if "cgst" not in columns:
        op.add_column("orders", sa.Column("cgst", sa.Numeric(10, 2), nullable=False, server_default="0"))
    if "estimated_cooking_time" not in columns:
        op.add_column(
            "orders",
            sa.Column("estimated_cooking_time", sa.Integer(), nullable=False, server_default="0"),
        )

    op.execute(sa.text("UPDATE orders SET status = 'ORDER_RECEIVED' WHERE status IS NULL OR LOWER(status) = 'pending'"))
    op.alter_column(
        "orders",
        "status",
        existing_type=sa.String(length=50),
        server_default="ORDER_RECEIVED",
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "orders",
        "status",
        existing_type=sa.String(length=50),
        server_default="pending",
        existing_nullable=False,
    )
    op.drop_column("orders", "estimated_cooking_time")
    op.drop_column("orders", "cgst")
    op.drop_column("orders", "sgst")
