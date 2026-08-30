"""
Local Government Directory (LGD) & Geographic Hierarchy Normalizer
Distinguishes:
- District: Thrissur
- Assembly Constituency: Kodungallur (LAC 073)
- Mala Block Panchayat (Block ID: 2217)
- Grama Panchayats in Mala Block:
    - Mala Grama Panchayat (LGD: 221764)
    - Kuzhur Grama Panchayat (LGD: 221765)
    - Poyya Grama Panchayat (LGD: 221766)
    - Annamanada Grama Panchayat (LGD: 221767)
    - Puthenchira Grama Panchayat (LGD: 221768)
    - Aloor Grama Panchayat (LGD: 221769)
    - Vellangallur Grama Panchayat (LGD: 221770)
- Individual Wards / Localities in Mala GP (e.g. Ward 1: Vattakkotta, Ward 5: Ramavilasam, Ward 8: Mala Town, Ward 10: Eravathur, Ward 12: Kuruvilassery, Ward 15: Vadama, etc.)
"""

import re
from typing import Dict, Any, Optional

PANCHAYAT_LGD_MAP = {
    "Mala": {"lgd": "221764", "block": "Mala", "lac": "Kodungallur", "district": "Thrissur"},
    "Kuzhur": {"lgd": "221765", "block": "Mala", "lac": "Kodungallur", "district": "Thrissur"},
    "Poyya": {"lgd": "221766", "block": "Mala", "lac": "Kodungallur", "district": "Thrissur"},
    "Annamanada": {"lgd": "221767", "block": "Mala", "lac": "Chalakkudy", "district": "Thrissur"}, # Note: parts fall in Chalakkudy LAC
    "Puthenchira": {"lgd": "221768", "block": "Mala", "lac": "Kodungallur", "district": "Thrissur"},
    "Aloor": {"lgd": "221769", "block": "Mala", "lac": "Irinjalakuda", "district": "Thrissur"},
    "Vellangallur": {"lgd": "221770", "block": "Vellangallur", "lac": "Kodungallur", "district": "Thrissur"},
}

LOCALITY_WARD_MAP = {
    "vattakkotta": {"gp": "Mala", "ward": "Ward 1", "locality": "Vattakkotta"},
    "ramavilasam": {"gp": "Mala", "ward": "Ward 5", "locality": "Ramavilasam"},
    "kuruvilassery": {"gp": "Mala", "ward": "Ward 12", "locality": "Kuruvilassery"},
    "eravathur": {"gp": "Kuzhur", "ward": "Ward 4", "locality": "Eravathur"},
    "vadama": {"gp": "Mala", "ward": "Ward 15", "locality": "Vadama"},
    "poyya kadavu": {"gp": "Poyya", "ward": "Ward 8", "locality": "Poyya Kadavu"},
    "moonnumuri": {"gp": "Kuzhur", "ward": "Ward 7", "locality": "Moonnumuri"},
    "kollamparambu": {"gp": "Mala", "ward": "Ward 3", "locality": "Kollamparambu"},
    "mala hospital": {"gp": "Mala", "ward": "Ward 8", "locality": "Mala Town"},
    "poyya hospital": {"gp": "Poyya", "ward": "Ward 2", "locality": "Poyya Town"},
    "madathumpady": {"gp": "Poyya", "ward": "Ward 6", "locality": "Madathumpady"},
    "kundoor": {"gp": "Annamanada", "ward": "Ward 5", "locality": "Kundoor"},
    "kombathukadavu": {"gp": "Puthenchira", "ward": "Ward 9", "locality": "Kombathukadavu"},
}

def normalize_geography(text: str, default_lac: str = "Kodungallur") -> Dict[str, Optional[str]]:
    """
    Extracts and normalizes administrative geographic hierarchy from text.
    Never equates Mala GP, Mala Block, and Kodungallur LAC.
    """
    clean = text.lower()
    
    district = "Thrissur"
    lac = default_lac
    block = "Mala"
    gp = None
    ward = None
    village = None
    locality = None

    # Check Grama Panchayat
    for gp_name, meta in PANCHAYAT_LGD_MAP.items():
        if re.search(rf"\b{gp_name.lower()}\s*(?:gp|grama\s*panchayat|panchayath)?\b", clean):
            gp = f"{gp_name} GP"
            block = f"{meta['block']} Block Panchayat"
            lac = f"{meta['lac']} LAC"
            break

    # If GP not explicitly mentioned, check locality keywords
    if not gp:
        for loc_key, meta in LOCALITY_WARD_MAP.items():
            if loc_key in clean:
                gp = f"{meta['gp']} GP"
                locality = meta["locality"]
                ward = meta["ward"]
                block_meta = PANCHAYAT_LGD_MAP[meta["gp"]]
                block = f"{block_meta['block']} Block Panchayat"
                lac = f"{block_meta['lac']} LAC"
                break

    # Ward extraction: e.g. "Ward 10", "Ward-4", "Ward No 12"
    ward_match = re.search(r"\bward\s*(?:no\.?|number|-)?\s*(\d{1,2})\b", clean)
    if ward_match:
        ward = f"Ward {ward_match.group(1)}"

    # Default fallback if only Mala Block / Mala LAC is mentioned
    if not gp and "mala" in clean:
        if "block" in clean:
            block = "Mala Block Panchayat"
        else:
            gp = "Mala GP"
            block = "Mala Block Panchayat"

    # Village / locality fallback
    if not locality:
        for loc_key, meta in LOCALITY_WARD_MAP.items():
            if loc_key in clean:
                locality = meta["locality"]
                break

    return {
        "district": district,
        "assembly_constituency": lac if "LAC" in lac else f"{lac} LAC",
        "block_panchayat": block,
        "grama_panchayat": gp,
        "ward": ward,
        "village": village or gp.replace(" GP", "") if gp else None,
        "location_text": locality or (f"{gp}, {ward}" if gp and ward else gp or block)
    }

def normalize_scheme(raw_scheme: str) -> Dict[str, str]:
    """
    Preserves original scheme name while providing standard normalized classification.
    """
    raw_clean = raw_scheme.strip()
    norm = "Other Public Fund"
    
    upper = raw_clean.upper()
    if "LAC-ADS" in upper or "LAC ADS" in upper or "ASSET DEVELOPMENT" in upper:
        norm = "LAC-ADS"
    elif "MLA" in upper or "SDF" in upper or "SPECIAL DEVELOPMENT" in upper:
        norm = "MLA SDF"
    elif "PANCHAYAT" in upper or "PLAN FUND" in upper or "Vikasana" in upper:
        norm = "Grama Panchayat Development Fund"
    elif "MPLADS" in upper or "MP LADS" in upper:
        norm = "MPLADS"
    elif "KWA" in upper or "JAL JEEVAN" in upper or "JJM" in upper:
        norm = "JJM / KWA Water Fund"
        
    return {
        "scheme_original": raw_clean,
        "scheme_normalized": norm
    }
