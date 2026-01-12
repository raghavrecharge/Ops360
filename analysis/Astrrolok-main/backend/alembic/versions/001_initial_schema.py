"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2025-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('role', sa.Enum('USER', 'ASTROLOGER', 'ADMIN', name='userrole'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    
    # Profiles table
    op.create_table(
        'profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('birth_date', sa.DateTime(), nullable=False),
        sa.Column('birth_time', sa.String(50), nullable=False),
        sa.Column('birth_place', sa.String(255), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('timezone', sa.String(50), nullable=False),
        sa.Column('ayanamsa', sa.String(50), nullable=True),
        sa.Column('chart_style', sa.Enum('NORTH_INDIAN', 'SOUTH_INDIAN', 'EAST_INDIAN', name='chartstyle'), nullable=True),
        sa.Column('language_preference', sa.String(10), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_profiles_user_id', 'profiles', ['user_id'])
    
    # Natal charts table
    op.create_table(
        'natal_charts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('chart_hash', sa.String(64), nullable=True),
        sa.Column('julian_day', sa.Float(), nullable=False),
        sa.Column('sidereal_time', sa.Float(), nullable=True),
        sa.Column('ayanamsa_value', sa.Float(), nullable=True),
        sa.Column('ascendant', sa.Float(), nullable=True),
        sa.Column('mc', sa.Float(), nullable=True),
        sa.Column('house_cusps', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_natal_charts_hash', 'natal_charts', ['chart_hash'], unique=True)
    
    # Planetary positions table
    op.create_table(
        'planetary_positions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('natal_chart_id', sa.Integer(), nullable=False),
        sa.Column('planet', sa.String(50), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('distance', sa.Float(), nullable=True),
        sa.Column('speed', sa.Float(), nullable=True),
        sa.Column('is_retrograde', sa.Integer(), nullable=True),
        sa.Column('nakshatra', sa.String(50), nullable=True),
        sa.Column('nakshatra_pada', sa.Integer(), nullable=True),
        sa.Column('rasi', sa.Integer(), nullable=True),
        sa.Column('degree_in_rasi', sa.Float(), nullable=True),
        sa.Column('is_combust', sa.Integer(), nullable=True),
        sa.Column('dignity', sa.String(50), nullable=True),
        sa.ForeignKeyConstraint(['natal_chart_id'], ['natal_charts.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Divisional charts table
    op.create_table(
        'divisional_charts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('natal_chart_id', sa.Integer(), nullable=False),
        sa.Column('division', sa.Integer(), nullable=False),
        sa.Column('division_name', sa.String(50), nullable=True),
        sa.Column('planetary_positions', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['natal_chart_id'], ['natal_charts.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Dashas table
    op.create_table(
        'dashas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('natal_chart_id', sa.Integer(), nullable=False),
        sa.Column('system', sa.Enum('VIMSHOTTARI', 'YOGINI', 'ASHTOTTARI', 'KALA_CHAKRA', 'CHARA', name='dashasystem'), nullable=False),
        sa.Column('level', sa.Enum('MAHA', 'ANTAR', 'PRATYANTAR', 'SOOKSHMA', 'PRANA', name='dashalevel'), nullable=False),
        sa.Column('lord', sa.String(50), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['natal_chart_id'], ['natal_charts.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['dashas.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_dashas_chart_system', 'dashas', ['natal_chart_id', 'system'])
    
    # Yogas table
    op.create_table(
        'yogas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('natal_chart_id', sa.Integer(), nullable=False),
        sa.Column('yoga_name', sa.String(255), nullable=False),
        sa.Column('yoga_type', sa.String(100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('strength', sa.Integer(), nullable=True),
        sa.Column('forming_planets', sa.JSON(), nullable=True),
        sa.Column('rule_reference', sa.String(255), nullable=True),
        sa.ForeignKeyConstraint(['natal_chart_id'], ['natal_charts.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Ashtakavarga tables
    op.create_table(
        'ashtakavarga_tables',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('natal_chart_id', sa.Integer(), nullable=False),
        sa.Column('table_type', sa.String(50), nullable=True),
        sa.Column('planet', sa.String(50), nullable=True),
        sa.Column('values', sa.JSON(), nullable=True),
        sa.Column('reductions', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['natal_chart_id'], ['natal_charts.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Strengths table
    op.create_table(
        'strengths',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('natal_chart_id', sa.Integer(), nullable=False),
        sa.Column('strength_type', sa.String(50), nullable=True),
        sa.Column('planet', sa.String(50), nullable=True),
        sa.Column('house', sa.Integer(), nullable=True),
        sa.Column('value', sa.Float(), nullable=True),
        sa.Column('components', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['natal_chart_id'], ['natal_charts.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Transits table
    op.create_table(
        'transits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('transit_date', sa.DateTime(), nullable=False),
        sa.Column('planet', sa.String(50), nullable=True),
        sa.Column('transit_type', sa.String(100), nullable=True),
        sa.Column('from_rasi', sa.Integer(), nullable=True),
        sa.Column('to_rasi', sa.Integer(), nullable=True),
        sa.Column('aspect_info', sa.JSON(), nullable=True),
        sa.Column('significance', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Varshaphala records table
    op.create_table(
        'varshaphala_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('varsha_pravesh_date', sa.DateTime(), nullable=False),
        sa.Column('julian_day', sa.Float(), nullable=True),
        sa.Column('ascendant', sa.Float(), nullable=True),
        sa.Column('planetary_positions', sa.JSON(), nullable=True),
        sa.Column('tajika_yogas', sa.JSON(), nullable=True),
        sa.Column('sahams', sa.JSON(), nullable=True),
        sa.Column('annual_dasha', sa.JSON(), nullable=True),
        sa.Column('predictions', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Compatibility reports table
    op.create_table(
        'compatibility_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile1_id', sa.Integer(), nullable=False),
        sa.Column('profile2_id', sa.Integer(), nullable=False),
        sa.Column('total_score', sa.Float(), nullable=True),
        sa.Column('ashtakoot_scores', sa.JSON(), nullable=True),
        sa.Column('manglik_analysis', sa.JSON(), nullable=True),
        sa.Column('dasha_sandhi', sa.Text(), nullable=True),
        sa.Column('recommendations', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['profile1_id'], ['profiles.id']),
        sa.ForeignKeyConstraint(['profile2_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Remedies table
    op.create_table(
        'remedies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('remedy_type', sa.String(100), nullable=True),
        sa.Column('planet', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration', sa.String(100), nullable=True),
        sa.Column('implementation_steps', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Align27 day scores table
    op.create_table(
        'day_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('traffic_light', sa.String(10), nullable=True),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('calculation_basis', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_day_scores_profile_date', 'day_scores', ['profile_id', 'date'])
    
    # Moments table
    op.create_table(
        'moments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('day_score_id', sa.Integer(), nullable=False),
        sa.Column('moment_type', sa.String(50), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('planetary_basis', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['day_score_id'], ['day_scores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Ritual recommendations table
    op.create_table(
        'ritual_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('day_score_id', sa.Integer(), nullable=False),
        sa.Column('ritual_name', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('recommended_time', sa.DateTime(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('materials_needed', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['day_score_id'], ['day_scores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # KB sources table
    op.create_table(
        'kb_sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('upload_date', sa.DateTime(), nullable=True),
        sa.Column('ingestion_status', sa.String(50), nullable=True),
        sa.Column('chunk_count', sa.Integer(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # KB chunks table
    op.create_table(
        'kb_chunks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('source_id', sa.Integer(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=True),
        sa.Column('section', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['source_id'], ['kb_sources.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # KB embeddings table
    op.create_table(
        'kb_embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chunk_id', sa.Integer(), nullable=False),
        sa.Column('embedding_vector', sa.LargeBinary(), nullable=True),
        sa.Column('model_name', sa.String(100), nullable=True),
        sa.ForeignKeyConstraint(['chunk_id'], ['kb_chunks.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Chat sessions table
    op.create_table(
        'chat_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Chat messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(50), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('retrieved_chunks', sa.JSON(), nullable=True),
        sa.Column('citations', sa.JSON(), nullable=True),
        sa.Column('astro_context', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # ML training examples table
    op.create_table(
        'ml_training_examples',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=True),
        sa.Column('event_date', sa.DateTime(), nullable=True),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('label', sa.Float(), nullable=True),
        sa.Column('example_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # ML models table
    op.create_table(
        'ml_models',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('model_name', sa.String(255), nullable=False),
        sa.Column('model_type', sa.String(100), nullable=True),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('model_binary', sa.LargeBinary(), nullable=True),
        sa.Column('feature_names', sa.JSON(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('trained_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Audit log table
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_audit_log_created', 'audit_log', ['created_at'])

def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('ml_models')
    op.drop_table('ml_training_examples')
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')
    op.drop_table('kb_embeddings')
    op.drop_table('kb_chunks')
    op.drop_table('kb_sources')
    op.drop_table('ritual_recommendations')
    op.drop_table('moments')
    op.drop_table('day_scores')
    op.drop_table('remedies')
    op.drop_table('compatibility_reports')
    op.drop_table('varshaphala_records')
    op.drop_table('transits')
    op.drop_table('strengths')
    op.drop_table('ashtakavarga_tables')
    op.drop_table('yogas')
    op.drop_table('dashas')
    op.drop_table('divisional_charts')
    op.drop_table('planetary_positions')
    op.drop_table('natal_charts')
    op.drop_table('profiles')
    op.drop_table('users')
