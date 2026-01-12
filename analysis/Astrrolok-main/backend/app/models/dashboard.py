"""
Dashboard Models
Widget registry and user layout persistence
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.database import Base


class DashboardWidget(Base):
    """Widget registry - defines available widgets"""
    __tablename__ = "dashboard_widgets"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    widget_id = Column(String(50), unique=True, nullable=False, index=True)
    widget_type = Column(String(20), nullable=False)  # chart, table, summary, ai
    title = Column(String(100), nullable=False)
    description = Column(Text)
    default_width = Column(Integer, default=4)
    default_height = Column(Integer, default=4)
    min_width = Column(Integer, default=2)
    min_height = Column(Integer, default=2)
    max_width = Column(Integer, default=12)
    max_height = Column(Integer, default=12)
    data_source = Column(String(200))  # API endpoint
    configurable_options = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)


class UserDashboardLayout(Base):
    """User-specific dashboard layouts"""
    __tablename__ = "user_dashboard_layouts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    layout_name = Column(String(100), nullable=False)
    layout_json = Column(JSON, nullable=False)  # Grid layout configuration
    widget_configs = Column(JSON, default=dict)  # Per-widget settings
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", backref="dashboard_layouts")
    profile = relationship("Profile", backref="dashboard_layouts")


class DashboardInsightCache(Base):
    """Cache for AI-generated dashboard insights"""
    __tablename__ = "dashboard_insight_cache"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    insight_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    insight_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    profile = relationship("Profile", backref="insight_cache")
