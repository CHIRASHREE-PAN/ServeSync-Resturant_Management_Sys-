"""Add invoice creation timestamp to bills.

Revision ID: 20260804_bill_created_at
Revises: 20260804_waiter_calls_status
Create Date: 2026-08-04 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260804_bill_created_at"
down_revision = "20260804_waiter_calls_status"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "bills" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("bills")}
    if "created_at" not in columns:
        op.add_column(
            "bills",
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "bills" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("bills")}
        if "created_at" in columns:
            op.drop_column("bills", "created_at")
