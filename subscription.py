"""
HIMSTREAMX VIP Subscription & Theatrical Cinema Hall Gateway
Developed by Himanshu Prajapati (2026)
Payment UPI: 7084468661@pytes | Contact: +91 7084468661 | QR: /qr.png
Includes big theatrical movies running in cinema halls with subscription passes.
"""
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user

router = APIRouter(prefix="/api/subscription", tags=["VIP Subscription & Theatrical Box Office"])

class PaymentSubmitRequest(BaseModel):
    plan_name: str = Field(..., example="VIP 4K Cinema Pass (Monthly)")
    amount: float = Field(..., example=199.0)
    upi_transaction_id: str = Field(..., min_length=4, example="UTR1234567890")
    user_mobile: Optional[str] = Field(None, example="+91 7084468661")

SUBSCRIPTION_PLANS = [
    {
        "id": "plan-monthly",
        "name": "VIP 4K Cinema Pass (Monthly)",
        "price": 199,
        "duration": "1 Month",
        "badge": "Popular",
        "features": [
            "Access to all Theatrical Cinema Hall Blockbusters in 4K HDR",
            "Unlimited Regional Music Streaming with Studio Master 320kbps Audio",
            "Continuous Background Audio & Official YouTube Video Streaming",
            "Personalized Watchlist & Unlimited Custom Playlists",
            "VIP Member Badge on Profile"
        ]
    },
    {
        "id": "plan-quarterly",
        "name": "Director's Choice Premium (Quarterly)",
        "price": 499,
        "duration": "3 Months",
        "badge": "Best Value",
        "features": [
            "All Monthly features for 90 days",
            "Early Access to new Bhojpuri, Punjabi & Bollywood releases",
            "High-Speed Priority Stream CDN with zero buffering",
            "Exclusive Director's Curated Playlists"
        ]
    },
    {
        "id": "plan-annual",
        "name": "HIMSTREAMX Ultra VIP (Annual)",
        "price": 999,
        "duration": "12 Months",
        "badge": "Recommended",
        "features": [
            "Full 1-Year Unrestricted Access to all 4K Blockbusters",
            "All upcoming 2026-2027 Cinema Hall Premieres included",
            "VIP Customer Support directly from Platform Director",
            "Permanent Ultra VIP Gold Badge"
        ]
    },
    {
        "id": "plan-lifetime",
        "name": "Lifetime VIP Creator Patron",
        "price": 1499,
        "duration": "Lifetime Pass",
        "badge": "VIP Patron",
        "features": [
            "One-time payment for perpetual access to everything",
            "Direct WhatsApp / Call Line with Founder Himanshu Prajapati",
            "Listed on Platform Hall of Fame / Supporters Board",
            "All future platform upgrades & 8K Cinema expansions"
        ]
    }
]

# Big Theatrical Hall Movies running in Cinema Halls
THEATRICAL_CINEMA_MOVIES = [
    {
        "id": "th-kalki-2898",
        "title": "Kalki 2898 AD (4K Theatrical Hall Release)",
        "tagline": "The Future of Indian Cinema Has Arrived in 4K UHD",
        "cast": "Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone",
        "director": "Nag Ashwin",
        "theatricalStatus": "Running in IMAX & Cinema Halls",
        "rating": 9.2,
        "year": 2024,
        "duration": "3h 01m",
        "genres": ["Mythology", "Sci-Fi", "Action", "Hindi 4K"],
        "poster": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=640&q=80",
        "backdrop": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1280&q=80",
        "youtubeTrailerId": "kQDd1AhGIHk",
        "requiresVip": True
    },
    {
        "id": "th-jawan",
        "title": "Jawan (IMAX Cinema Hall Blockbuster)",
        "tagline": "Shah Rukh Khan's All-Time Highest Grossing Indian Action Spectacle",
        "cast": "Shah Rukh Khan, Nayanthara, Vijay Sethupathi, Deepika Padukone",
        "director": "Atlee",
        "theatricalStatus": "All-Time Cinema Hall Record",
        "rating": 8.9,
        "year": 2023,
        "duration": "2h 49m",
        "genres": ["Action", "Thriller", "Hindi 4K"],
        "poster": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=640&q=80",
        "backdrop": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80",
        "youtubeTrailerId": "MWOlnZSnXWE",
        "requiresVip": True
    },
    {
        "id": "th-animal",
        "title": "Animal (Uncut Cinema Hall Edition)",
        "tagline": "Raw, Unapologetic Power Packed Cinematic Phenomenon",
        "cast": "Ranbir Kapoor, Rashmika Mandanna, Anil Kapoor, Bobby Deol",
        "director": "Sandeep Reddy Vanga",
        "theatricalStatus": "Cinema Hall Phenomenon",
        "rating": 8.8,
        "year": 2023,
        "duration": "3h 24m",
        "genres": ["Action", "Crime", "Drama", "Hindi 4K"],
        "poster": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=640&q=80",
        "backdrop": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1280&q=80",
        "youtubeTrailerId": "Dydmpfo68DA",
        "requiresVip": True
    },
    {
        "id": "th-stree-2",
        "title": "Stree 2 (Superhit Theatrical Blockbuster)",
        "tagline": "India's Biggest Box Office Horror-Comedy Hall Sensation",
        "cast": "Rajkummar Rao, Shraddha Kapoor, Pankaj Tripathi, Abhishek Banerjee",
        "director": "Amar Kaushik",
        "theatricalStatus": "All-Time Superhit in Theaters",
        "rating": 8.7,
        "year": 2024,
        "duration": "2h 27m",
        "genres": ["Horror", "Comedy", "Hindi 4K"],
        "poster": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=640&q=80",
        "backdrop": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1280&q=80",
        "youtubeTrailerId": "gq_X8t7_sXE",
        "requiresVip": True
    },
    {
        "id": "th-pushpa-2",
        "title": "Pushpa 2: The Rule (Grand Cinema Premiere)",
        "tagline": "Wildfire Across All Indian Theaters",
        "cast": "Allu Arjun, Rashmika Mandanna, Fahadh Faasil",
        "director": "Sukumar",
        "theatricalStatus": "Massive Theatrical Anticipation",
        "rating": 9.4,
        "year": 2024,
        "duration": "3h 15m",
        "genres": ["Action", "Mass", "Regional", "Hindi 4K"],
        "poster": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=640&q=80",
        "backdrop": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1280&q=80",
        "youtubeTrailerId": "1kVK0MZlbI4",
        "requiresVip": True
    },
    {
        "id": "th-salaar",
        "title": "Salaar: Part 1 - Ceasefire (Cinematic IMAX Cut)",
        "tagline": "The City of Khansaar Awaits the Chosen Warrior",
        "cast": "Prabhas, Prithviraj Sukumaran, Shruti Haasan",
        "director": "Prashanth Neel",
        "theatricalStatus": "Cinema Hall Action Marvel",
        "rating": 8.6,
        "year": 2023,
        "duration": "2h 55m",
        "genres": ["Action", "Crime", "Thriller"],
        "poster": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=640&q=80",
        "backdrop": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1280&q=80",
        "youtubeTrailerId": "4GPvYMKrytI",
        "requiresVip": True
    }
]

@router.get("/plans")
def get_plans():
    return {
        "success": True,
        "paymentDetails": {
            "upiId": "7084468661@pytes",
            "mobile": "+91 7084468661",
            "name": "Himanshu Prajapati",
            "qrCodeUrl": "/qr.png",
            "bankVerified": "Verified Business UPI Gateway"
        },
        "plans": SUBSCRIPTION_PLANS
    }

@router.get("/theatrical-movies")
def get_theatrical_movies():
    return {
        "success": True,
        "count": len(THEATRICAL_CINEMA_MOVIES),
        "data": THEATRICAL_CINEMA_MOVIES
    }

@router.post("/submit-payment")
def submit_payment(req: PaymentSubmitRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        # Upgrade user plan to VIP
        cursor.execute("""
        UPDATE users
        SET plan = ?, role = CASE WHEN role = 'ADMIN' THEN 'ADMIN' ELSE 'VIP' END, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (f"VIP Member ({req.plan_name})", user_id))

    return {
        "success": True,
        "message": f"🎉 Payment reference {req.upi_transaction_id} submitted successfully! Your account has been upgraded to {req.plan_name}.",
        "plan": req.plan_name,
        "amount": req.amount,
        "upiId": "7084468661@pytes",
        "supportMobile": "+91 7084468661"
    }
