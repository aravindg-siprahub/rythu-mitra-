import os
from supabase import create_client  # type: ignore

def get_supabase():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

# Worker-facing listings: never expose farmer phone until hire (UI also gates; API must not leak).
_HIRED_APPLICATION_STATUSES = frozenset({"hired", "selected", "accepted"})


def _strip_farmer_phone_from_post_dict(p: dict) -> dict:
    if not p:
        return p
    out = dict(p)
    out.pop("farmer_phone", None)
    return out


def get_job_feed(service_type="all", district=None, search_query=None, limit=30, offset=0):
    """Get all open job posts, newest first. Filter by district if provided."""
    supabase = get_supabase()
    query = supabase.table("job_posts").select(
        "*, job_applications(count)"
    ).eq("status", "open")
    if service_type and service_type != "all":
        query = query.eq("service_type", service_type)
    if district and district != "all":
        query = query.ilike("farmer_district", f"%{district}%")
    if search_query:
        query = query.ilike("title", f"%{search_query}%")
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    posts = result.data or []
    out = []
    for p in posts:
        apps = p.get("job_applications", [])
        p["job_applications_count"] = apps[0].get("count", 0) if apps else 0
        out.append(_strip_farmer_phone_from_post_dict(p))
    return out

def create_job_post(data: dict) -> dict:
    """Farmer creates a job post."""
    required = ["farmer_id", "farmer_name", "farmer_phone",
                "farmer_district", "title", "service_type",
                "scheduled_date", "duration"]
    for f in required:
        if not data.get(f):
            raise ValueError(f"{f} is required")
    supabase = get_supabase()
    payload = {k: data[k] for k in [
        "farmer_id", "farmer_name", "farmer_phone", "farmer_district",
        "title", "description", "service_type", "scheduled_date",
        "duration", "daily_rate", "urgency",
        "workers_needed", "tractors_needed", "transport_needed", "sprayers_needed",
        "work_type", "crop", "units",
    ] if data.get(k) is not None}
    payload.setdefault("urgency", "normal")
    payload.setdefault("status", "open")
    
    # Fix 1b — Map duration to match Supabase constraints
    DURATION_MAP = {
        'many_days': 'many_days',
        'full_day':  'full_day',
        'half_day':  'half_day',
        'Many Days': 'many_days',
        'Full Day':  'full_day',
        'Half Day':  'half_day',
    }
    raw_duration = payload.get("duration", "full_day")
    payload["duration"] = DURATION_MAP.get(raw_duration, 'full_day')

    result = supabase.table("job_posts").insert(payload).execute()
    return result.data[0]

def apply_to_job(job_post_id: str, supplier_profile_id: str, cover_note: str = "") -> dict:
    """Supplier applies to a job."""
    supabase = get_supabase()
    supplier = supabase.table("supplier_profiles").select("*").eq("id", supplier_profile_id).single().execute()
    if not supplier.data:
        raise ValueError("Supplier profile not found")
    s = supplier.data
    result = supabase.table("job_applications").insert({
        "job_post_id": job_post_id,
        "supplier_id": supplier_profile_id,
        "supplier_name": s["full_name"],
        "supplier_phone": s["phone"],
        "supplier_service_type": s["service_type"],
        "supplier_rating": s.get("rating", 0),
        "supplier_district": s.get("district", ""),
        "cover_note": cover_note,
        "status": "applied",
    }).execute()
    # Note: increment_applicants RPC should exist in DB
    supabase.rpc("increment_applicants", {"post_id": job_post_id}).execute()
    return result.data[0]

def get_job_applicants(job_post_id: str, farmer_id: str) -> list:
    """Farmer views all applicants. Ordered by rating."""
    supabase = get_supabase()
    post = supabase.table("job_posts").select("farmer_id").eq("id", job_post_id).single().execute()
    if post.data["farmer_id"] != farmer_id:
        raise PermissionError("Not your job post")
    # Mark all as viewed
    supabase.table("job_applications").update({"farmer_viewed": True}).eq("job_post_id", job_post_id).execute()
    result = supabase.table("job_applications").select("*").eq("job_post_id", job_post_id).order("supplier_rating", desc=True).execute()
    return result.data or []

def get_farmer_posts(farmer_id: str) -> list:
    supabase = get_supabase()
    result = supabase.table("job_posts").select("*, job_applications(count)").eq("farmer_id", farmer_id).order("created_at", desc=True).execute()
    posts = result.data or []
    for p in posts:
        apps = p.get("job_applications", [])
        p["job_applications_count"] = apps[0].get("count", 0) if apps else 0
    return posts

def get_supplier_applications(supplier_profile_id: str) -> list:
    supabase = get_supabase()
    result = supabase.table("job_applications").select(
        "*, job_posts(title, farmer_name, farmer_phone, farmer_district, scheduled_date, status, urgency)"
    ).eq("supplier_id", supplier_profile_id).order("applied_at", desc=True).execute()
    rows = result.data or []
    for row in rows:
        jp = row.get("job_posts")
        if not isinstance(jp, dict):
            continue
        st = (row.get("status") or "").lower()
        if st not in _HIRED_APPLICATION_STATUSES:
            row["job_posts"] = _strip_farmer_phone_from_post_dict(jp)
    return rows

def close_job_post(job_post_id: str, farmer_id: str) -> dict:
    supabase = get_supabase()
    result = supabase.table("job_posts").update({"status": "filled"}).eq("id", job_post_id).eq("farmer_id", farmer_id).execute()
    return result.data[0]


def update_job_post_status(job_post_id: str, farmer_id: str, status: str) -> dict:
    """Farmer opens or closes a job post. Use status: open | closed | filled (filled is legacy, same as closed for feed)."""
    allowed = {"open", "closed", "filled"}
    if status not in allowed:
        raise ValueError("Invalid status")
    supabase = get_supabase()
    post = supabase.table("job_posts").select("farmer_id").eq("id", job_post_id).single().execute()
    if not post.data or post.data["farmer_id"] != farmer_id:
        raise PermissionError("Not your job post")
    result = (
        supabase.table("job_posts")
        .update({"status": status})
        .eq("id", job_post_id)
        .eq("farmer_id", farmer_id)
        .execute()
    )
    rows = result.data or []
    if not rows:
        raise ValueError("Update failed")
    return rows[0]

def get_supplier_profile(user_id: str) -> dict | None:
    supabase = get_supabase()
    result = supabase.table("supplier_profiles").select("*").eq("user_id", user_id).execute()
    return result.data[0] if result.data else None

def register_supplier(data: dict) -> dict:
    supabase = get_supabase()
    required = ["user_id", "full_name", "phone", "service_type", "district"]
    for f in required:
        if not data.get(f):
            raise ValueError(f"{f} is required")
    result = supabase.table("supplier_profiles").insert({
        "user_id": data["user_id"],
        "full_name": data["full_name"],
        "phone": data["phone"],
        "whatsapp_number": data.get("whatsapp_number", data["phone"]),
        "service_type": data["service_type"],
        "skills": data.get("skills", []),
        "district": data["district"],
        "state": data.get("state", "Telangana"),
        "village": data.get("village", ""),
        "daily_rate": data.get("daily_rate"),
        "experience_years": data.get("experience_years", 0),
        "vehicle_type": data.get("vehicle_type", ""),
        "bio": data.get("bio", ""),
        "is_available": True,
        "is_verified": False,
    }).execute()
    return result.data[0]

def submit_rating(job_post_id: str, farmer_id: str, supplier_id: str, rating: int, review: str = "") -> dict:
    if not (1 <= rating <= 5):
        raise ValueError("Rating must be 1-5")
    supabase = get_supabase()
    result = supabase.table("job_ratings").insert({
        "booking_id": job_post_id,
        "farmer_id": farmer_id,
        "supplier_id": supplier_id,
        "rating": rating,
        "review": review,
    }).execute()
    # Recalculate average rating
    all_ratings = supabase.table("job_ratings").select("rating").eq("supplier_id", supplier_id).execute()
    avg = 0.0
    if all_ratings.data:
        avg = float(sum(r.get("rating", 0) for r in all_ratings.data)) / len(all_ratings.data)
    supabase.table("supplier_profiles").update({
        "rating": float(f"{avg:.2f}"),
        "total_jobs": len(all_ratings.data)
    }).eq("id", supplier_id).execute()
    return result.data[0]

def update_application_status(application_id: str, farmer_id: str, status: str) -> dict:
    """Farmer accepts or rejects an application."""
    if status not in ["hired", "rejected", "applied"]:
        raise ValueError("Invalid status")
    supabase = get_supabase()
    # Check ownership
    app = supabase.table("job_applications").select("*, job_posts!inner(farmer_id)").eq("id", application_id).single().execute()
    if not app.data or app.data["job_posts"]["farmer_id"] != farmer_id:
        raise PermissionError("Not your job post")
    
    result = supabase.table("job_applications").update({"status": status}).eq("id", application_id).execute()
    return result.data[0]
