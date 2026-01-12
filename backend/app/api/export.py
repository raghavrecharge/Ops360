from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.api.dashas import get_or_compute_dashas, get_current_dasha
from app.api.transits import get_today_transits

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/pdf/{profile_id}")
async def export_pdf(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export chart, dasha, and transit summary as PDF"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Generate PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4c1d95'),
        spaceAfter=30,
    )
    
    elements.append(Paragraph(f"Astrological Chart Report", title_style))
    elements.append(Paragraph(f"<b>Name:</b> {profile.name}", styles['Normal']))
    elements.append(Paragraph(f"<b>Birth Date:</b> {profile.birth_date.strftime('%B %d, %Y')}", styles['Normal']))
    elements.append(Paragraph(f"<b>Birth Time:</b> {profile.birth_time}", styles['Normal']))
    elements.append(Paragraph(f"<b>Birth Place:</b> {profile.birth_place}", styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Get chart data
    natal_chart = get_or_compute_chart(profile, db)
    
    from app.models.chart import PlanetaryPosition
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    # Planetary Positions Table
    elements.append(Paragraph("<b>Planetary Positions (D1 - Rashi Chart)</b>", styles['Heading2']))
    elements.append(Spacer(1, 0.1*inch))
    
    planet_data = [["Planet", "Sign", "Degree", "Nakshatra", "Pada", "Status"]]
    
    sign_names = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    for pos in positions:
        status = []
        if pos.is_retrograde:
            status.append("R")
        if pos.is_combust:
            status.append("C")
        if pos.dignity in ["Exalted", "Own"]:
            status.append(pos.dignity[0])
        
        planet_data.append([
            pos.planet,
            sign_names[pos.rasi - 1],
            f"{pos.degree_in_rasi:.2f}°",
            pos.nakshatra,
            str(pos.nakshatra_pada),
            ", ".join(status) if status else "-"
        ])
    
    planet_table = Table(planet_data)
    planet_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4c1d95')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(planet_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Current Vimshottari Dasha
    elements.append(Paragraph("<b>Current Vimshottari Dasha</b>", styles['Heading2']))
    elements.append(Spacer(1, 0.1*inch))
    
    dashas = get_or_compute_dashas(natal_chart, profile, "VIMSHOTTARI", db)
    maha_dashas = [d for d in dashas if d["level"] == "MAHA"]
    current_md = get_current_dasha(maha_dashas)
    
    if current_md:
        elements.append(Paragraph(f"<b>Maha Dasha:</b> {current_md['lord']}", styles['Normal']))
        elements.append(Paragraph(
            f"Period: {datetime.fromisoformat(current_md['start_date']).strftime('%b %d, %Y')} - "
            f"{datetime.fromisoformat(current_md['end_date']).strftime('%b %d, %Y')}",
            styles['Normal']
        ))
        
        # Get Antar Dasha
        antar_dashas = [d for d in dashas if d.get("parent_id") == current_md["id"]]
        current_ad = get_current_dasha(antar_dashas)
        
        if current_ad:
            elements.append(Paragraph(f"<b>Antar Dasha:</b> {current_ad['lord']}", styles['Normal']))
            elements.append(Paragraph(
                f"Period: {datetime.fromisoformat(current_ad['start_date']).strftime('%b %d, %Y')} - "
                f"{datetime.fromisoformat(current_ad['end_date']).strftime('%b %d, %Y')}",
                styles['Normal']
            ))
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Next Dasha Transitions
    elements.append(Paragraph("<b>Upcoming Dasha Transitions</b>", styles['Heading2']))
    elements.append(Spacer(1, 0.1*inch))
    
    now = datetime.now()
    upcoming = [d for d in maha_dashas if datetime.fromisoformat(d["start_date"]) > now][:2]
    
    for dasha in upcoming:
        elements.append(Paragraph(
            f"{dasha['lord']} Maha Dasha starts: {datetime.fromisoformat(dasha['start_date']).strftime('%b %d, %Y')}",
            styles['Normal']
        ))
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Current Transits Summary
    elements.append(Paragraph("<b>Current Transits Summary</b>", styles['Heading2']))
    elements.append(Spacer(1, 0.1*inch))
    
    # Get natal Moon
    from app.modules.ephemeris.calculator import ephemeris
    jd = ephemeris.get_julian_day(now)
    transiting_planets = ephemeris.get_all_planets(jd)
    
    elements.append(Paragraph(f"<b>Date:</b> {now.strftime('%B %d, %Y')}", styles['Normal']))
    
    # Add Sade Sati check
    natal_moon = [p for p in positions if p.planet == "MOON"][0]
    saturn_rasi = ephemeris.get_rasi(transiting_planets["SATURN"]["longitude"])
    
    from app.api.transits import check_sade_sati, check_dhaiya_kantaka
    sade_sati = check_sade_sati(saturn_rasi, natal_moon.rasi)
    dhaiya = check_dhaiya_kantaka(saturn_rasi, natal_moon.rasi)
    
    if sade_sati["is_active"]:
        elements.append(Paragraph(f"<b>Sade Sati:</b> {sade_sati['description']}", styles['Normal']))
    
    if dhaiya["is_active"]:
        elements.append(Paragraph(f"<b>{dhaiya['type'].title()}:</b> {dhaiya['description']}", styles['Normal']))
    
    if not sade_sati["is_active"] and not dhaiya["is_active"]:
        elements.append(Paragraph("No major Saturn transits active.", styles['Normal']))
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Footer
    elements.append(Paragraph(
        "<i>Generated by AstroOS - Complete Vedic Astrology Platform</i>",
        styles['Normal']
    ))
    elements.append(Paragraph(
        f"<i>Report generated on: {now.strftime('%B %d, %Y at %I:%M %p')}</i>",
        styles['Normal']
    ))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=astro_report_{profile.name.replace(' ', '_')}.pdf"
        }
    )
