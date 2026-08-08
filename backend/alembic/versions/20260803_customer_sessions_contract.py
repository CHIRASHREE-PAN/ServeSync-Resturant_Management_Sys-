"""Customer session contract migration

Revision ID: 20260803_customer_session_contract
Revises: None
Create Date: 2026-08-03 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260803_customer_session_contract"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [col["name"] for col in inspector.get_columns("customer_sessions")]

    if "session_id" not in columns:
        op.add_column("customer_sessions", sa.Column("session_id", sa.String(length=64), nullable=True))
        op.execute(sa.text("UPDATE customer_sessions SET session_id = UUID() WHERE session_id IS NULL"))
        op.alter_column("customer_sessions", "session_id", nullable=False)
        op.create_unique_constraint("uq_customer_sessions_session_id", "customer_sessions", ["session_id"])

    if "started_at" not in columns:
        op.add_column("customer_sessions", sa.Column("started_at", sa.DateTime(), nullable=True))
        op.execute(sa.text("UPDATE customer_sessions SET started_at = created_at WHERE started_at IS NULL"))
        op.alter_column("customer_sessions", "started_at", nullable=False)

    if "ended_at" not in columns:
        op.add_column("customer_sessions", sa.Column("ended_at", sa.DateTime(), nullable=True))

    if "number_of_people" not in columns and "people" in columns:
        op.add_column("customer_sessions", sa.Column("number_of_people", sa.Integer(), nullable=True))
        op.execute(sa.text("UPDATE customer_sessions SET number_of_people = people WHERE number_of_people IS NULL"))
        op.alter_column("customer_sessions", "number_of_people", nullable=False)
        op.drop_column("customer_sessions", "people")

    op.execute(sa.text("UPDATE customer_sessions SET status = UPPER(status) WHERE status IS NOT NULL"))
    op.alter_column("customer_sessions", "status", existing_type=sa.String(length=50), type_=sa.String(length=20), existing_nullable=False)
    op.alter_column("customer_sessions", "email", existing_type=sa.String(length=120), existing_nullable=True, nullable=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [col["name"] for col in inspector.get_columns("customer_sessions")]

    if "number_of_people" in columns and "people" not in columns:
        op.add_column("customer_sessions", sa.Column("people", sa.Integer(), nullable=True))
        op.execute(sa.text("UPDATE customer_sessions SET people = number_of_people WHERE people IS NULL"))
        op.alter_column("customer_sessions", "people", nullable=False)
        op.drop_column("customer_sessions", "number_of_people")

    op.drop_constraint("uq_customer_sessions_session_id", "customer_sessions", type_="unique")
    op.drop_column("customer_sessions", "ended_at")
    op.drop_column("customer_sessions", "started_at")
    op.drop_column("customer_sessions", "session_id")
