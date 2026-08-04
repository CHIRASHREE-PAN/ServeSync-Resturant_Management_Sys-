"""Normalize waiter call status values.

Revision ID: 20260804_waiter_calls_status
Revises: 20260804_waiter_notifications
Create Date: 2026-08-04 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260804_waiter_calls_status"
down_revision = "20260804_waiter_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "waiter_calls" not in inspector.get_table_names():
        return

    op.execute("UPDATE waiter_calls SET status = UPPER(status)")
    op.alter_column(
        "waiter_calls",
        "status",
        existing_type=sa.String(length=50),
        server_default="OPEN",
        existing_nullable=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "waiter_calls" not in inspector.get_table_names():
        return

    op.execute("UPDATE waiter_calls SET status = LOWER(status)")
    op.alter_column(
        "waiter_calls",
        "status",
        existing_type=sa.String(length=50),
        server_default="open",
        existing_nullable=False,
    )
