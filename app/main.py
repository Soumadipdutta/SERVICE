from app.routers.ocr import router as ocr_router
from app.routers.voice import router as voice_router

import os
import json
from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="IEMHacks 4.0 Track 05 AI Microservice",
    version="1.0.0",
    description="AI Engine for Grievance Categorization/Prioritization and Scheme Matching"
)

app.include_router(ocr_router)
app.include_router(voice_router)
# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# --- Load Static JSON Datasets ---
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SCHEMES_FILE = os.path.join(DATA_DIR, "welfare_schemes_structured.json")
CATEGORIES_FILE = os.path.join(DATA_DIR, "grievance_categories.json")

def load_json_file(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

schemes_db = load_json_file(SCHEMES_FILE)
categories_db = load_json_file(CATEGORIES_FILE)
CATEGORY_LOOKUP = {c["category_id"]: c for c in categories_db}

# --- Pydantic Data Contracts ---
class ComplaintRequest(BaseModel):
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_urls: Optional[List[str]] = []

class ComplaintAnalysisResponse(BaseModel):
    category: str
    subcategory: str
    priority: str
    priority_score: int
    summary: str
    confidence: float
    reason: str
    suggested_department: str
    estimated_sla_hours: int

class SchemeRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "ALL"
    state: Optional[str] = "ALL_INDIA"
    district: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    student_status: Optional[bool] = False
    disability_status: Optional[bool] = False
    family_size: Optional[int] = 1

class MatchedScheme(BaseModel):
    scheme_id: str
    scheme_name: str
    eligibility_status: str
    match_score: int
    benefit: str
    matched_criteria: List[str]
    missing_information: List[str]
    required_documents: List[str]
    application_url: Optional[str] = None

class SchemeRecommendationResponse(BaseModel):
    recommendations: List[MatchedScheme]

# --- Endpoints ---
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AI Microservice Running",
        "schemes_loaded": len(schemes_db),
        "categories_loaded": len(categories_db)
    }

@app.post("/api/v1/complaints/analyze", response_model=ComplaintAnalysisResponse)
def analyze_complaint(data: ComplaintRequest):
    text_corpus = f"{data.title} {data.description}".lower()
    
    # 1. Deterministic Safety Keywords Rule Engine (Handbook Section 10)
    high_safety_keywords = ["fire", "open manhole", "exposed wire", "flooding", "gas leak", "building collapse", "accident"]
    is_immediate_hazard = any(kw in text_corpus for kw in high_safety_keywords)
    
    # 2. LLM Prompt Processing
    if client:
        try:
            prompt = f"""
            Analyze this civic grievance report:
            Title: {data.title}
            Description: {data.description}
            
            Strict Constraints:
            - Choose category ONLY from: [ROADS_INFRASTRUCTURE, WATER_SUPPLY, SANITATION_WASTE, ELECTRICITY, PUBLIC_SAFETY, STREETLIGHT, DRAINAGE, PUBLIC_HEALTH, ENVIRONMENT, PUBLIC_TRANSPORT, GOVERNMENT_SERVICES, OTHER]
            - priority MUST be "HIGH", "MEDIUM", or "LOW".
            - priority_score MUST be an integer between 0 and 100.
            
            Return JSON format ONLY:
            {{
                "category": "CATEGORY_ID",
                "subcategory": "SUBCATEGORY_NAME",
                "priority": "HIGH/MEDIUM/LOW",
                "priority_score": 85,
                "summary": "1-sentence summary",
                "confidence": 0.9,
                "reason": "Brief reason for priority and category"
            }}
            """
            llm_res = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            res_json = json.loads(llm_res.choices[0].message.content)
            
            cat_id = res_json.get("category", "OTHER")
            cat_info = CATEGORY_LOOKUP.get(cat_id, CATEGORY_LOOKUP.get("OTHER", {}))
            
            # Apply Safety Override if safety rules triggered
            priority = "HIGH" if is_immediate_hazard else res_json.get("priority", "MEDIUM")
            priority_score = max(85, res_json.get("priority_score", 80)) if is_immediate_hazard else res_json.get("priority_score", 50)
            
            return ComplaintAnalysisResponse(
                category=cat_id,
                subcategory=res_json.get("subcategory", "GENERAL"),
                priority=priority,
                priority_score=priority_score,
                summary=res_json.get("summary", data.title),
                confidence=float(res_json.get("confidence", 0.85)),
                reason="[SAFETY HAZARD OVERRIDE] " + res_json.get("reason", "") if is_immediate_hazard else res_json.get("reason", ""),
                suggested_department=cat_info.get("suggested_department", "MUNICIPALITY"),
                estimated_sla_hours=6 if is_immediate_hazard else cat_info.get("default_sla_hours", 48)
            )
        except Exception:
            pass  # Fallback to deterministic engine on API error
            
    # 3. Deterministic Fallback Engine (Golden Rule of Fallback)
    cat_id = "PUBLIC_SAFETY" if is_immediate_hazard else "ROADS_INFRASTRUCTURE"
    cat_info = CATEGORY_LOOKUP.get(cat_id, {})
    return ComplaintAnalysisResponse(
        category=cat_id,
        subcategory="HAZARD" if is_immediate_hazard else "GENERAL_REPAIR",
        priority="HIGH" if is_immediate_hazard else "MEDIUM",
        priority_score=90 if is_immediate_hazard else 50,
        summary=data.title,
        confidence=0.75,
        reason="Rule-based classification fallback applied.",
        suggested_department=cat_info.get("suggested_department", "MUNICIPALITY"),
        estimated_sla_hours=cat_info.get("default_sla_hours", 48)
    )

@app.post("/api/v1/schemes/recommend", response_model=SchemeRecommendationResponse)
def recommend_schemes(profile: SchemeRequest):
    matched_results = []
    
    for s in schemes_db:
        elig = s.get("eligibility", {})
        reasons = []
        missing = []
        is_eligible = True
        
        # Rule 1: Age Check
        min_age = elig.get("min_age")
        if min_age is not None and profile.age is not None:
            if profile.age >= min_age:
                reasons.append(f"Age requirement satisfied (>= {min_age})")
            else:
                is_eligible = False
                
        # Rule 2: Income Check
        max_inc = elig.get("max_income")
        if max_inc is not None and max_inc > 10 and profile.annual_income is not None:
            if profile.annual_income <= max_inc:
                reasons.append(f"Income requirement satisfied (<= Rs. {max_inc:,.0f})")
            else:
                is_eligible = False
                
        # Rule 3: Student Status Check
        req_student = elig.get("student")
        if req_student:
            if profile.student_status:
                reasons.append("Student status requirement satisfied")
            else:
                is_eligible = False
                
        # Rule 4: State Matching
        scheme_state = s.get("state", "ALL_INDIA")
        if scheme_state not in ["ALL_INDIA", "UNKNOWN"] and profile.state:
            if scheme_state.upper() == profile.state.upper():
                reasons.append(f"State requirement matched ({scheme_state})")
            else:
                is_eligible = False

        if is_eligible and len(reasons) > 0:
            matched_results.append(MatchedScheme(
                scheme_id=s.get("scheme_id", "SCHEME_000"),
                scheme_name=s.get("name", "Welfare Scheme"),
                eligibility_status="ELIGIBLE",
                match_score=min(100, 70 + len(reasons) * 10),
                benefit=s.get("benefits", "Government welfare assistance.")[:200] + "...",
                matched_criteria=reasons,
                missing_information=missing,
                required_documents=s.get("documents", ["Aadhaar Card", "Income Certificate"])[:5],
                application_url=s.get("application_url")
            ))

    # Sort top recommendations by match score
    matched_results.sort(key=lambda x: x.match_score, reverse=True)
    return SchemeRecommendationResponse(recommendations=matched_results[:10])