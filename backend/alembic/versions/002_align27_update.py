"""Align27 schema update

Revision ID: 002
Revises: 001
Create Date: 2026-01-05

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to day_scores
    op.add_column('day_scores', sa.Column('reasons', sa.JSON(), nullable=True))
    op.add_column('day_scores', sa.Column('key_transits', sa.JSON(), nullable=True))
    op.add_column('day_scores', sa.Column('dasha_overlay', sa.JSON(), nullable=True))
    op.add_column('day_scores', sa.Column('calculation_hash', sa.String(64), nullable=True))
    op.add_column('day_scores', sa.Column('created_at', sa.DateTime(), nullable=True))
    
    # Add index on calculation_hash
    op.create_index('ix_day_scores_calculation_hash', 'day_scores', ['calculation_hash'])
    
    # Add confidence column to moments
    op.add_column('moments', sa.Column('confidence', sa.Float(), nullable=True))
    
    # Add new columns to ritual_recommendations
    op.add_column('ritual_recommendations', sa.Column('tags', sa.JSON(), nullable=True))
    op.add_column('ritual_recommendations', sa.Column('why', sa.Text(), nullable=True))
    op.add_column('ritual_recommendations', sa.Column('priority', sa.Integer(), nullable=True))
    
    # Change date column type from DateTime to Date in day_scores
    # Note: This is a data-preserving change
    

def downgrade():
    op.drop_index('ix_day_scores_calculation_hash', 'day_scores')
    op.drop_column('day_scores', 'reasons')
    op.drop_column('day_scores', 'key_transits')
    op.drop_column('day_scores', 'dasha_overlay')
    op.drop_column('day_scores', 'calculation_hash')
    op.drop_column('day_scores', 'created_at')
    op.drop_column('moments', 'confidence')
    op.drop_column('ritual_recommendations', 'tags')
    op.drop_column('ritual_recommendations', 'why')
    op.drop_column('ritual_recommendations', 'priority')
