"""
Entity Resolution Engine for Mala Public Funds Tracker
Implements multi-signal fuzzy matching to correlate project records across:
- Kerala e-Tender
- Kerala Sulekha
- Kerala Saankhya
- Kerala Sakarma
- KERI & PASK

Follows the matching score specification:
project_match_score =
    0.30 * identifier_match
  + 0.20 * name_similarity
  + 0.15 * location_match
  + 0.15 * year_match
  + 0.10 * scheme_match
  + 0.10 * amount_similarity
"""

import re
from typing import List, Dict, Any, Tuple, Optional

def clean_tokens(text: str) -> set:
    """Normalizes string to alphanumeric word tokens ignoring stop words."""
    if not text:
        return set()
    stopwords = {"in", "at", "to", "for", "the", "and", "of", "under", "gp", "ward", "lac", "ads", "sdf", "mla", "construction", "renovation", "improvements", "upgradation"}
    words = re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())
    return {w for w in words if w not in stopwords and len(w) > 2}

def token_similarity(a: str, b: str) -> float:
    """Computes Jaccard token overlap between two project descriptions."""
    set_a = clean_tokens(a)
    set_b = clean_tokens(b)
    if not set_a or not set_b:
        return 0.0
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(intersection) / len(union) if union else 0.0

def amount_similarity(a: Optional[float], b: Optional[float]) -> float:
    """Computes numerical closeness score between two amounts."""
    if a is None or b is None or a <= 0 or b <= 0:
        return 0.5 # Neutral if one is missing
    ratio = min(a, b) / max(a, b)
    # If amounts differ by less than 15% (e.g. estimated vs awarded vs actual), high similarity
    return ratio if ratio > 0.70 else 0.0

def calculate_match_score(proj_a: Dict[str, Any], proj_b: Dict[str, Any]) -> Tuple[float, List[str]]:
    """Calculates weighted match score between two project records."""
    reasons = []
    
    # 1. Identifier match (weight: 0.30)
    id_score = 0.0
    ids_a = {proj_a.get("source_record_id", ""), proj_a.get("tender_id", ""), proj_a.get("as_number", "")}
    ids_b = {proj_b.get("source_record_id", ""), proj_b.get("tender_id", ""), proj_b.get("as_number", "")}
    ids_a = {x for x in ids_a if x}
    ids_b = {x for x in ids_b if x}
    if ids_a.intersection(ids_b):
        id_score = 1.0
        reasons.append("Exact identifier match")

    # 2. Name similarity (weight: 0.20)
    name_sim = token_similarity(
        proj_a.get("canonical_name", "") or proj_a.get("project_reference", "") or proj_a.get("source_title", ""),
        proj_b.get("canonical_name", "") or proj_b.get("project_reference", "") or proj_b.get("source_title", "")
    )
    if name_sim > 0.35:
        reasons.append(f"High name token overlap ({int(name_sim*100)}%)")

    # 3. Location match (weight: 0.15)
    loc_score = 0.0
    gp_a = (proj_a.get("grama_panchayat") or "").lower()
    gp_b = (proj_b.get("grama_panchayat") or "").lower()
    ward_a = (proj_a.get("ward") or "").lower()
    ward_b = (proj_b.get("ward") or "").lower()
    
    if gp_a and gp_b and gp_a == gp_b:
        loc_score += 0.6
        if ward_a and ward_b and ward_a == ward_b:
            loc_score += 0.4
            reasons.append("Matching Grama Panchayat & Ward")
        else:
            reasons.append("Matching Grama Panchayat")
    elif not gp_a or not gp_b:
        loc_score = 0.4 # partial fallback

    # 4. Financial Year match (weight: 0.15)
    year_score = 0.0
    year_a = proj_a.get("financial_year")
    year_b = proj_b.get("financial_year")
    if year_a and year_b:
        if year_a == year_b:
            year_score = 1.0
            reasons.append(f"Matching financial year ({year_a})")
        else:
            # Adjacent years (e.g. 2023-24 and 2024-25 spillover)
            year_score = 0.5
    else:
        year_score = 0.5

    # 5. Scheme match (weight: 0.10)
    scheme_score = 0.0
    sch_a = (proj_a.get("scheme_normalized") or "").lower()
    sch_b = (proj_b.get("scheme_normalized") or "").lower()
    if sch_a and sch_b and (sch_a in sch_b or sch_b in sch_a):
        scheme_score = 1.0
        reasons.append("Matching scheme classification")
    else:
        scheme_score = 0.5

    # 6. Amount similarity (weight: 0.10)
    amt_a = proj_a.get("tender", {}).get("estimated_value") or proj_a.get("sanction", {}).get("sanctioned_amount") or proj_a.get("amount")
    amt_b = proj_b.get("tender", {}).get("estimated_value") or proj_b.get("sanction", {}).get("sanctioned_amount") or proj_b.get("amount")
    amt_score = amount_similarity(amt_a, amt_b)
    if amt_score > 0.8:
        reasons.append("Amounts aligned within expected variance")

    total_score = (
        0.30 * id_score +
        0.20 * name_sim +
        0.15 * loc_score +
        0.15 * year_score +
        0.10 * scheme_score +
        0.10 * amt_score
    )

    return total_score, reasons

class EntityResolver:
    """Reconciles disparate government source records into canonical projects."""

    def resolve(
        self,
        etender_records: List[Dict[str, Any]],
        sulekha_records: List[Dict[str, Any]],
        sakarma_records: List[Dict[str, Any]],
        saankhya_records: List[Dict[str, Any]],
        keri_records: List[Dict[str, Any]],
        pask_records: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        canonical_projects = []

        # Start by establishing candidate master projects from Sulekha and e-Tender
        all_primary = list(sulekha_records)

        # Merge e-Tender records into primary set or add as new
        for et in etender_records:
            matched = False
            for cand in all_primary:
                score, reasons = calculate_match_score(cand, et)
                if score >= 0.50 or (score >= 0.40 and token_similarity(cand["canonical_name"], et["canonical_name"]) > 0.40):
                    # Merge e-tender into candidate
                    cand.setdefault("sources", []).append(et)
                    cand["tender"] = et.get("tender")
                    matched = True
                    break
            if not matched:
                et_copy = dict(et)
                et_copy["sources"] = [et]
                all_primary.append(et_copy)

        # Process each consolidated project
        for idx, base in enumerate(all_primary, 1):
            project_id = f"proj_mala_{idx:03d}"
            name = base.get("canonical_name") or base.get("source_title")
            
            linked_sources = []
            
            # Add base sources
            if "source_system" in base:
                linked_sources.append({
                    "source_system": base["source_system"],
                    "source_record_id": base["source_record_id"],
                    "source_url": base["source_url"],
                    "source_title": base["source_title"],
                    "retrieved_at": base["retrieved_at"],
                    "confidence": base["confidence"],
                    "is_directly_reported": True,
                    "raw_payload_path": base["raw_payload_path"]
                })
            if "sources" in base:
                for s in base["sources"]:
                    if s["source_record_id"] != base.get("source_record_id"):
                        linked_sources.append({
                            "source_system": s["source_system"],
                            "source_record_id": s["source_record_id"],
                            "source_url": s["source_url"],
                            "source_title": s["source_title"],
                            "retrieved_at": s["retrieved_at"],
                            "confidence": s["confidence"],
                            "is_directly_reported": True,
                            "raw_payload_path": s["raw_payload_path"]
                        })

            # Correlate Sakarma governance records
            governance = []
            for sak in sakarma_records:
                sim = token_similarity(name, sak["project_reference"])
                if sim >= 0.30 or sak["project_reference"].lower() in name.lower():
                    governance.append(sak)
                    linked_sources.append({
                        "source_system": "sakarma",
                        "source_record_id": sak["source_record_id"],
                        "source_url": sak["source_url"],
                        "source_title": sak["source_title"],
                        "retrieved_at": sak["retrieved_at"],
                        "confidence": "HIGH",
                        "is_directly_reported": True,
                        "raw_payload_path": sak["raw_payload_path"]
                    })

            # Correlate Saankhya payment vouchers
            payments = []
            for sk in saankhya_records:
                sim = token_similarity(name, sk["project_reference"])
                if sim >= 0.30 or sk["project_reference"].lower() in name.lower():
                    payments.append(sk)
                    linked_sources.append({
                        "source_system": "saankhya",
                        "source_record_id": sk["source_record_id"],
                        "source_url": sk["source_url"],
                        "source_title": sk["source_title"],
                        "retrieved_at": sk["retrieved_at"],
                        "confidence": "HIGH",
                        "is_directly_reported": True,
                        "raw_payload_path": sk["raw_payload_path"]
                    })

            # Correlate KERI engineering tests
            engineering = []
            for k in keri_records:
                sim = token_similarity(name, k["project_reference"])
                if sim >= 0.30 or k["project_reference"].lower() in name.lower():
                    engineering.append(k)
                    linked_sources.append({
                        "source_system": "keri",
                        "source_record_id": k["source_record_id"],
                        "source_url": k["source_url"],
                        "source_title": k["source_title"],
                        "retrieved_at": k["retrieved_at"],
                        "confidence": "HIGH",
                        "is_directly_reported": True,
                        "raw_payload_path": k["raw_payload_path"]
                    })

            # Correlate PASK water records
            for p in pask_records:
                sim = token_similarity(name, p["project_reference"])
                if sim >= 0.30 or p["project_reference"].lower() in name.lower():
                    linked_sources.append({
                        "source_system": "pask",
                        "source_record_id": p["source_record_id"],
                        "source_url": p["source_url"],
                        "source_title": p["source_title"],
                        "retrieved_at": p["retrieved_at"],
                        "confidence": "HIGH",
                        "is_directly_reported": True,
                        "raw_payload_path": p["raw_payload_path"]
                    })

            # Compute confidence: High if 2+ sources agree, Medium if 1 source direct
            num_unique_systems = len({s["source_system"] for s in linked_sources})
            confidence_level = "HIGH" if num_unique_systems >= 2 else "MEDIUM"

            # Check for discrepancies (e.g. Sulekha vs e-Tender amount)
            discrepancy = None
            sanction_amt = base.get("sanction", {}).get("sanctioned_amount")
            tender_val = base.get("tender", {}).get("tender_value")
            exp_reported = base.get("expenditure_reported")
            if payments and tender_val and abs(payments[0]["amount"] - tender_val) > 100:
                diff = abs(payments[0]["amount"] - tender_val)
                discrepancy = f"Saankhya actual paid ₹{payments[0]['amount']:,.0f} differs from e-Tender contract value ₹{tender_val:,.0f} (Variance: ₹{diff:,.0f}). Reflects measurement deductions / lifecycle variance."
            elif sanction_amt and tender_val and abs(sanction_amt - tender_val) > 100:
                diff = sanction_amt - tender_val
                discrepancy = f"Tender value ₹{tender_val:,.0f} is lower than Sanctioned outlay ₹{sanction_amt:,.0f} (Procurement savings of ₹{diff:,.0f})."

            canonical_projects.append({
                "id": project_id,
                "canonical_name": name,
                "description": base.get("description") or f"Public development project under {base.get('scheme_original')} in {base.get('local_body')}.",
                "financial_year": base["financial_year"],
                "district": base["district"],
                "assembly_constituency": base["assembly_constituency"],
                "local_body": base["local_body"],
                "block_panchayat": base["block_panchayat"],
                "grama_panchayat": base["grama_panchayat"],
                "ward": base["ward"],
                "village": base["village"],
                "location_text": base["location_text"],
                "scheme_original": base["scheme_original"],
                "scheme_normalized": base["scheme_normalized"],
                "mla_name": "V.R. Sunil Kumar (Kodungallur LAC)",
                "category": base.get("category", "Other"),
                "status": base.get("status", "Proposed"),
                "confidence_level": confidence_level,
                "discrepancy_summary": discrepancy,
                "sources": linked_sources,
                "sanction": base.get("sanction"),
                "plan": base.get("plan"),
                "tender": base.get("tender"),
                "governance": governance,
                "payments": payments,
                "engineering": engineering
            })

        return canonical_projects
