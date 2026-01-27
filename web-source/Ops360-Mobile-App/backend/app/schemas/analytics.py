from pydantic import BaseModel

class DashboardStats(BaseModel):
    active_projects: int
    running_campaigns: int
    vehicles_on_ground: int
    todays_expense: float
    pending_expenses: int
    pending_payments: int

class AnalyticsMetrics(BaseModel):
    total_campaigns: int
    total_expenses: float
    avg_campaign_cost: float
    vehicle_utilization: float
    driver_performance_avg: float
