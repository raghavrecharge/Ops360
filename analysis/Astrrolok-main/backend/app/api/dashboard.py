"""
Dashboard API Endpoints
Widget registry, layout management, and AI insights
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.dashboard import DashboardWidget, UserDashboardLayout, DashboardInsightCache
from app.modules.kb.rag_service import RAGService


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


# ==================== Pydantic Models ====================

class WidgetResponse(BaseModel):
    widget_id: str
    widget_type: str
    title: str
    description: Optional[str]
    default_width: int
    default_height: int
    min_width: int
    min_height: int
    max_width: int
    max_height: int
    data_source: Optional[str]
    configurable_options: Dict[str, Any]


class LayoutItemSchema(BaseModel):
    i: str  # widget_id
    x: int
    y: int
    w: int
    h: int
    minW: Optional[int] = None
    minH: Optional[int] = None
    maxW: Optional[int] = None
    maxH: Optional[int] = None


class LayoutCreateRequest(BaseModel):
    layout_name: str
    profile_id: Optional[int] = None
    layout_json: List[LayoutItemSchema]
    widget_configs: Optional[Dict[str, Any]] = None
    is_default: bool = False


class LayoutUpdateRequest(BaseModel):
    layout_name: Optional[str] = None
    layout_json: Optional[List[LayoutItemSchema]] = None
    widget_configs: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None


class LayoutResponse(BaseModel):
    id: int
    user_id: int
    profile_id: Optional[int]
    layout_name: str
    layout_json: List[Dict[str, Any]]
    widget_configs: Dict[str, Any]
    is_default: bool
    created_at: Optional[str]
    updated_at: Optional[str]


class InsightResponse(BaseModel):
    insight: str
    generated_at: str
    profile_id: int


# ==================== Widget Registry ====================

# Default widgets configuration
DEFAULT_WIDGETS = [
    {
        "widget_id": "chart_d1",
        "widget_type": "chart",
        "title": "D1 Rasi Chart",
        "description": "Main birth chart (Lagna)",
        "default_width": 4,
        "default_height": 4,
        "min_width": 3,
        "min_height": 3,
        "max_width": 6,
        "max_height": 6,
        "data_source": "/api/charts/{profile_id}/bundle",
        "configurable_options": {
            "show_degrees": True,
            "show_nakshatra": True,
            "highlight_benefics": False,
            "compact_mode": False,
            "chart_division": "D1"
        },
        "sort_order": 1
    },
    {
        "widget_id": "chart_d9",
        "widget_type": "chart",
        "title": "D9 Navamsa",
        "description": "Navamsa divisional chart",
        "default_width": 3,
        "default_height": 3,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 5,
        "data_source": "/api/charts/{profile_id}/bundle",
        "configurable_options": {
            "show_degrees": False,
            "show_nakshatra": False,
            "highlight_benefics": False,
            "compact_mode": True,
            "chart_division": "D9"
        },
        "sort_order": 2
    },
    {
        "widget_id": "chart_d10",
        "widget_type": "chart",
        "title": "D10 Dasamsa",
        "description": "Career divisional chart",
        "default_width": 3,
        "default_height": 3,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 5,
        "data_source": "/api/charts/{profile_id}/bundle",
        "configurable_options": {
            "show_degrees": False,
            "show_nakshatra": False,
            "highlight_benefics": False,
            "compact_mode": True,
            "chart_division": "D10"
        },
        "sort_order": 3
    },
    {
        "widget_id": "chart_moon",
        "widget_type": "chart",
        "title": "Moon Chart",
        "description": "Chart from Moon as Lagna",
        "default_width": 3,
        "default_height": 3,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 5,
        "data_source": "/api/charts/{profile_id}/bundle",
        "configurable_options": {
            "show_degrees": False,
            "show_nakshatra": True,
            "highlight_benefics": False,
            "compact_mode": True,
            "chart_division": "MOON"
        },
        "sort_order": 4
    },
    {
        "widget_id": "chart_transit",
        "widget_type": "chart",
        "title": "Transit Chart",
        "description": "Current planetary transits",
        "default_width": 3,
        "default_height": 3,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 5,
        "data_source": "/api/transits/today/{profile_id}",
        "configurable_options": {
            "show_degrees": True,
            "show_nakshatra": False,
            "highlight_benefics": False,
            "compact_mode": True,
            "chart_division": "TRANSIT"
        },
        "sort_order": 5
    },
    {
        "widget_id": "dasha_running",
        "widget_type": "table",
        "title": "Running Dasha",
        "description": "Current Vimshottari Dasha periods",
        "default_width": 4,
        "default_height": 2,
        "min_width": 3,
        "min_height": 2,
        "max_width": 6,
        "max_height": 4,
        "data_source": "/api/dashas/{profile_id}",
        "configurable_options": {
            "show_dates": True,
            "expandable": True,
            "dasha_system": "vimshottari"
        },
        "sort_order": 6
    },
    {
        "widget_id": "transit_summary",
        "widget_type": "summary",
        "title": "Today's Transits",
        "description": "Key transit movements and Sade Sati status",
        "default_width": 3,
        "default_height": 2,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 4,
        "data_source": "/api/transits/today/{profile_id}",
        "configurable_options": {
            "show_sade_sati": True,
            "show_retrogrades": True
        },
        "sort_order": 7
    },
    {
        "widget_id": "align27_today",
        "widget_type": "summary",
        "title": "Align27 Today",
        "description": "Daily cosmic score and moments",
        "default_width": 3,
        "default_height": 3,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 5,
        "data_source": "/api/align27/today?profile_id={profile_id}",
        "configurable_options": {
            "show_timeline": True,
            "show_moments": True,
            "compact_mode": False
        },
        "sort_order": 8
    },
    {
        "widget_id": "yogas_summary",
        "widget_type": "summary",
        "title": "Key Yogas",
        "description": "Top yogas in the chart",
        "default_width": 3,
        "default_height": 2,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 4,
        "data_source": "/api/yogas/{profile_id}",
        "configurable_options": {
            "max_yogas": 5,
            "show_strength": True,
            "clickable": True
        },
        "sort_order": 9
    },
    {
        "widget_id": "strength_summary",
        "widget_type": "summary",
        "title": "Planetary Strength",
        "description": "Shadbala strength highlights",
        "default_width": 3,
        "default_height": 2,
        "min_width": 2,
        "min_height": 2,
        "max_width": 5,
        "max_height": 4,
        "data_source": "/api/strength/{profile_id}/summary",
        "configurable_options": {
            "show_weak_planets": True,
            "show_strong_planets": True
        },
        "sort_order": 10
    },
    {
        "widget_id": "ai_insight",
        "widget_type": "ai",
        "title": "Today's Insight",
        "description": "AI-generated daily insight",
        "default_width": 4,
        "default_height": 2,
        "min_width": 3,
        "min_height": 2,
        "max_width": 6,
        "max_height": 3,
        "data_source": "/api/dashboard/insight?profile_id={profile_id}",
        "configurable_options": {
            "auto_refresh": False
        },
        "sort_order": 11
    }
]


# Default Parashara-style layout
DEFAULT_LAYOUT = [
    # Left: Large D1 Chart
    {"i": "chart_d1", "x": 0, "y": 0, "w": 4, "h": 4, "minW": 3, "minH": 3},
    
    # Right: Stacked charts
    {"i": "chart_d9", "x": 4, "y": 0, "w": 3, "h": 2, "minW": 2, "minH": 2},
    {"i": "chart_d10", "x": 7, "y": 0, "w": 3, "h": 2, "minW": 2, "minH": 2},
    {"i": "chart_moon", "x": 4, "y": 2, "w": 3, "h": 2, "minW": 2, "minH": 2},
    {"i": "chart_transit", "x": 7, "y": 2, "w": 3, "h": 2, "minW": 2, "minH": 2},
    
    # Bottom row
    {"i": "dasha_running", "x": 0, "y": 4, "w": 4, "h": 2, "minW": 3, "minH": 2},
    {"i": "align27_today", "x": 4, "y": 4, "w": 3, "h": 2, "minW": 2, "minH": 2},
    {"i": "transit_summary", "x": 7, "y": 4, "w": 3, "h": 2, "minW": 2, "minH": 2},
    
    # Third row
    {"i": "yogas_summary", "x": 0, "y": 6, "w": 3, "h": 2, "minW": 2, "minH": 2},
    {"i": "strength_summary", "x": 3, "y": 6, "w": 3, "h": 2, "minW": 2, "minH": 2},
    {"i": "ai_insight", "x": 6, "y": 6, "w": 4, "h": 2, "minW": 3, "minH": 2},
]


def seed_widgets(db: Session):
    """Seed default widgets if not exist"""
    existing = db.query(DashboardWidget).first()
    if existing:
        return
    
    for widget_data in DEFAULT_WIDGETS:
        widget = DashboardWidget(**widget_data, is_active=True)
        db.add(widget)
    db.commit()


# ==================== Widget Endpoints ====================

@router.get("/widgets", response_model=List[WidgetResponse])
async def get_widgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available widgets"""
    # Seed widgets if needed
    seed_widgets(db)
    
    widgets = db.query(DashboardWidget).filter(
        DashboardWidget.is_active == True
    ).order_by(DashboardWidget.sort_order).all()
    
    return [
        WidgetResponse(
            widget_id=w.widget_id,
            widget_type=w.widget_type,
            title=w.title,
            description=w.description,
            default_width=w.default_width,
            default_height=w.default_height,
            min_width=w.min_width,
            min_height=w.min_height,
            max_width=w.max_width,
            max_height=w.max_height,
            data_source=w.data_source,
            configurable_options=w.configurable_options or {}
        )
        for w in widgets
    ]


# ==================== Layout Endpoints ====================

@router.get("/layouts", response_model=List[LayoutResponse])
async def get_layouts(
    profile_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's dashboard layouts"""
    query = db.query(UserDashboardLayout).filter(
        UserDashboardLayout.user_id == current_user.id
    )
    
    if profile_id:
        query = query.filter(
            (UserDashboardLayout.profile_id == profile_id) |
            (UserDashboardLayout.profile_id == None)
        )
    
    layouts = query.order_by(UserDashboardLayout.is_default.desc()).all()
    
    return [
        LayoutResponse(
            id=l.id,
            user_id=l.user_id,
            profile_id=l.profile_id,
            layout_name=l.layout_name,
            layout_json=l.layout_json or [],
            widget_configs=l.widget_configs or {},
            is_default=l.is_default,
            created_at=l.created_at.isoformat() if l.created_at else None,
            updated_at=l.updated_at.isoformat() if l.updated_at else None
        )
        for l in layouts
    ]


@router.get("/layouts/default")
async def get_default_layout(
    profile_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get default layout for user (or system default)"""
    # Try user's default layout
    layout = db.query(UserDashboardLayout).filter(
        UserDashboardLayout.user_id == current_user.id,
        UserDashboardLayout.is_default == True
    ).first()
    
    if layout:
        return LayoutResponse(
            id=layout.id,
            user_id=layout.user_id,
            profile_id=layout.profile_id,
            layout_name=layout.layout_name,
            layout_json=layout.layout_json or [],
            widget_configs=layout.widget_configs or {},
            is_default=layout.is_default,
            created_at=layout.created_at.isoformat() if layout.created_at else None,
            updated_at=layout.updated_at.isoformat() if layout.updated_at else None
        )
    
    # Return system default
    return {
        "id": 0,
        "user_id": current_user.id,
        "profile_id": profile_id,
        "layout_name": "Default",
        "layout_json": DEFAULT_LAYOUT,
        "widget_configs": {},
        "is_default": True,
        "created_at": None,
        "updated_at": None
    }


@router.post("/layouts", response_model=LayoutResponse)
async def create_layout(
    request: LayoutCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new dashboard layout"""
    # If setting as default, unset other defaults
    if request.is_default:
        db.query(UserDashboardLayout).filter(
            UserDashboardLayout.user_id == current_user.id,
            UserDashboardLayout.is_default == True
        ).update({"is_default": False})
    
    layout = UserDashboardLayout(
        user_id=current_user.id,
        profile_id=request.profile_id,
        layout_name=request.layout_name,
        layout_json=[item.dict() for item in request.layout_json],
        widget_configs=request.widget_configs or {},
        is_default=request.is_default
    )
    
    db.add(layout)
    db.commit()
    db.refresh(layout)
    
    return LayoutResponse(
        id=layout.id,
        user_id=layout.user_id,
        profile_id=layout.profile_id,
        layout_name=layout.layout_name,
        layout_json=layout.layout_json or [],
        widget_configs=layout.widget_configs or {},
        is_default=layout.is_default,
        created_at=layout.created_at.isoformat() if layout.created_at else None,
        updated_at=layout.updated_at.isoformat() if layout.updated_at else None
    )


@router.put("/layouts/{layout_id}", response_model=LayoutResponse)
async def update_layout(
    layout_id: int,
    request: LayoutUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a dashboard layout"""
    layout = db.query(UserDashboardLayout).filter(
        UserDashboardLayout.id == layout_id,
        UserDashboardLayout.user_id == current_user.id
    ).first()
    
    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")
    
    if request.layout_name is not None:
        layout.layout_name = request.layout_name
    
    if request.layout_json is not None:
        layout.layout_json = [item.dict() for item in request.layout_json]
    
    if request.widget_configs is not None:
        layout.widget_configs = request.widget_configs
    
    if request.is_default is not None:
        if request.is_default:
            # Unset other defaults
            db.query(UserDashboardLayout).filter(
                UserDashboardLayout.user_id == current_user.id,
                UserDashboardLayout.id != layout_id,
                UserDashboardLayout.is_default == True
            ).update({"is_default": False})
        layout.is_default = request.is_default
    
    layout.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(layout)
    
    return LayoutResponse(
        id=layout.id,
        user_id=layout.user_id,
        profile_id=layout.profile_id,
        layout_name=layout.layout_name,
        layout_json=layout.layout_json or [],
        widget_configs=layout.widget_configs or {},
        is_default=layout.is_default,
        created_at=layout.created_at.isoformat() if layout.created_at else None,
        updated_at=layout.updated_at.isoformat() if layout.updated_at else None
    )


@router.delete("/layouts/{layout_id}")
async def delete_layout(
    layout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a dashboard layout"""
    layout = db.query(UserDashboardLayout).filter(
        UserDashboardLayout.id == layout_id,
        UserDashboardLayout.user_id == current_user.id
    ).first()
    
    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")
    
    db.delete(layout)
    db.commit()
    
    return {"message": "Layout deleted successfully"}


@router.post("/layouts/{layout_id}/set-default")
async def set_default_layout(
    layout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set a layout as default"""
    layout = db.query(UserDashboardLayout).filter(
        UserDashboardLayout.id == layout_id,
        UserDashboardLayout.user_id == current_user.id
    ).first()
    
    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")
    
    # Unset other defaults
    db.query(UserDashboardLayout).filter(
        UserDashboardLayout.user_id == current_user.id,
        UserDashboardLayout.is_default == True
    ).update({"is_default": False})
    
    layout.is_default = True
    db.commit()
    
    return {"message": "Layout set as default", "layout_id": layout_id}


# ==================== AI Insight Endpoint ====================

@router.get("/insight", response_model=InsightResponse)
async def get_dashboard_insight(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated daily insight for dashboard"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check cache
    cached = db.query(DashboardInsightCache).filter(
        DashboardInsightCache.profile_id == profile_id,
        DashboardInsightCache.insight_date == today
    ).first()
    
    if cached:
        return InsightResponse(
            insight=cached.insight_text,
            generated_at=cached.created_at.isoformat() if cached.created_at else today,
            profile_id=profile_id
        )
    
    # Generate new insight using RAG
    try:
        rag_service = RAGService(db)
        
        prompt = f"""Based on today's astrological conditions, provide a concise 2-3 line insight 
for someone interested in Vedic astrology guidance. Focus on practical wisdom for the day.
Keep it positive but realistic. Do not use any markdown formatting."""
        
        result = await rag_service.answer_question(
            question=prompt,
            profile_id=profile_id
        )
        
        insight_text = result.get("answer", "Today presents opportunities for growth and reflection. Stay mindful of your actions and trust your intuition.")
        
        # Trim to 2-3 sentences if too long
        sentences = insight_text.split('.')
        if len(sentences) > 4:
            insight_text = '.'.join(sentences[:3]) + '.'
        
    except Exception as e:
        # Fallback insight
        insight_text = "Today presents opportunities for growth and reflection. Stay mindful of your actions and trust the cosmic flow."
    
    # Cache the insight
    cache_entry = DashboardInsightCache(
        profile_id=profile_id,
        insight_date=today,
        insight_text=insight_text
    )
    db.add(cache_entry)
    db.commit()
    
    return InsightResponse(
        insight=insight_text,
        generated_at=datetime.now(timezone.utc).isoformat(),
        profile_id=profile_id
    )


@router.post("/insight/refresh", response_model=InsightResponse)
async def refresh_dashboard_insight(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Force refresh AI insight (clears cache)"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Delete cached insight
    db.query(DashboardInsightCache).filter(
        DashboardInsightCache.profile_id == profile_id,
        DashboardInsightCache.insight_date == today
    ).delete()
    db.commit()
    
    # Generate new
    return await get_dashboard_insight(profile_id, db, current_user)
