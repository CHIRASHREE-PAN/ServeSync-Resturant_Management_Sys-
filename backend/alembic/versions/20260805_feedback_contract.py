"""Add feedback submission timestamp and one-feedback-per-session constraint.

Revision ID: 20260805_feedback_contract
Revises: 20260804_bill_created_at
Create Date: 2026-08-05 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260805_feedback_contract"
down_revision = "20260804_bill_created_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "feedback" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("feedback")}
    if "created_at" not in columns:
        op.add_column(
            "feedback",
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        )

    unique_constraints = {constraint["name"] for constraint in inspector.get_unique_constraints("feedback")}
    indexes = {index["name"] for index in inspector.get_indexes("feedback")}
    if "uq_feedback_session_id" not in unique_constraints and "uq_feedback_session_id" not in indexes:
        op.create_unique_constraint("uq_feedback_session_id", "feedback", ["session_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "feedback" not in inspector.get_table_names():
        return

    unique_constraints = {constraint["name"] for constraint in inspector.get_unique_constraints("feedback")}
    if "uq_feedback_session_id" in unique_constraints:
        op.drop_constraint("uq_feedback_session_id", "feedback", type_="unique")
    columns = {column["name"] for column in inspector.get_columns("feedback")}
    if "created_at" in columns:
<<<<<<< HEAD:backend/alembic/versions/20260805_feedback_contract.py
        op.drop_column("feedback", "created_at")
=======
        op.drop_column("feedback", "created_at")
>>>>>>> 463124af02341a26f11446ceb35802d78cace07e:alembic/versions/20260805_feedback_contract.py
