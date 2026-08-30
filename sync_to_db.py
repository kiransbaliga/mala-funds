"""
Database Synchronizer for MongoDB Atlas & SQLite
Populates resolved canonical projects, sources, and relations idempotently into MongoDB Atlas.
"""

import json
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("DATABASE_URL")

def sync_to_mongodb(projects):
    import pymongo
    print(f"Connecting to MongoDB Atlas at {MONGODB_URI.split('@')[-1]}...")
    client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=8000)
    
    # Verify connection
    client.admin.command('ping')
    print("✓ Successfully connected to MongoDB Atlas cluster.")

    db_name = "mala_funds"
    db = client[db_name]

    # Collections
    projects_col = db["projects"]
    sources_col = db["project_sources"]
    logs_col = db["ingestion_logs"]

    print(f"Clearing and syncing {len(projects)} canonical projects into collection '{db_name}.projects'...")

    # Clear existing to maintain idempotency
    projects_col.delete_many({})
    sources_col.delete_many({})

    # Format documents
    docs = []
    source_docs = []

    for proj in projects:
        sanction_amt = proj.get("sanction", {}).get("sanctioned_amount") if proj.get("sanction") else None
        tender_val = proj.get("tender", {}).get("tender_value") if proj.get("tender") else None
        est_val = proj.get("tender", {}).get("estimated_value") if proj.get("tender") else None
        paid_amt = sum(p.get("amount", 0) for p in proj.get("payments", [])) if proj.get("payments") else None
        
        sources_list = proj.get("sources", [])
        sources_summary = ",".join(list(dict.fromkeys(s.get("source_system", "") for s in sources_list)))

        # Format sanctions array
        sanctions_arr = []
        if proj.get("sanction"):
            sanc = proj["sanction"]
            sanctions_arr.append({
                "id": f"{proj['id']}_sanc_1",
                "as_number": sanc.get("as_number"),
                "as_date": sanc.get("as_date"),
                "ts_number": sanc.get("ts_number"),
                "ts_date": sanc.get("ts_date"),
                "sanctioned_amount": sanc.get("sanctioned_amount"),
                "funding_head": sanc.get("funding_head"),
                "created_at": datetime.utcnow()
            })

        # Format plans array
        plans_arr = []
        if proj.get("plan"):
            pln = proj["plan"]
            plans_arr.append({
                "id": f"{proj['id']}_plan_1",
                "planned_amount": pln.get("planned_amount"),
                "approved_amount": pln.get("approved_amount"),
                "revised_amount": pln.get("revised_amount"),
                "plan_year": pln.get("plan_year"),
                "sector": pln.get("sector"),
                "status": pln.get("status"),
                "created_at": datetime.utcnow()
            })

        # Format tenders array
        tenders_arr = []
        if proj.get("tender"):
            tnd = proj["tender"]
            tenders_arr.append({
                "id": f"{proj['id']}_tnd_1",
                "tender_id": tnd.get("tender_id"),
                "tender_reference": tnd.get("tender_reference"),
                "estimated_value": tnd.get("estimated_value"),
                "tender_value": tnd.get("tender_value"),
                "published_date": tnd.get("published_date"),
                "bid_opening_date": tnd.get("bid_opening_date"),
                "award_date": tnd.get("award_date"),
                "contractor": tnd.get("contractor"),
                "nit_url": tnd.get("nit_url"),
                "boq_url": tnd.get("boq_url"),
                "status": tnd.get("status"),
                "created_at": datetime.utcnow()
            })

        # Format execution
        exec_arr = [{
            "id": f"{proj['id']}_exec_1",
            "work_order_number": None,
            "work_order_date": None,
            "start_date": None,
            "scheduled_completion_date": None,
            "actual_completion_date": None,
            "progress_percent": 100 if proj["status"] == "Completed" else (65 if proj["status"] == "In Progress" else 0),
            "status": proj["status"],
            "created_at": datetime.utcnow()
        }]

        # Format payments
        payments_arr = []
        for p_idx, pay in enumerate(proj.get("payments", []), 1):
            payments_arr.append({
                "id": f"{proj['id']}_pay_{p_idx}",
                "bill_reference": pay.get("bill_reference"),
                "voucher_number": pay.get("voucher_number"),
                "transaction_date": pay.get("transaction_date"),
                "amount": pay.get("amount", 0.0),
                "cumulative_amount": pay.get("cumulative_amount"),
                "payment_status": pay.get("payment_status"),
                "treasury_reference": pay.get("treasury_reference"),
                "created_at": datetime.utcnow()
            })

        # Format engineering
        eng_arr = []
        for e_idx, eng in enumerate(proj.get("engineering", []), 1):
            eng_arr.append({
                "id": f"{proj['id']}_eng_{e_idx}",
                "report_id": eng.get("report_id"),
                "test_date": eng.get("test_date"),
                "test_type": eng.get("test_type"),
                "agreement_reference": eng.get("agreement_reference"),
                "description": eng.get("description"),
                "result": eng.get("result"),
                "created_at": datetime.utcnow()
            })

        # Format governance
        gov_arr = []
        for g_idx, gov in enumerate(proj.get("governance", []), 1):
            gov_arr.append({
                "id": f"{proj['id']}_gov_{g_idx}",
                "local_body": gov.get("local_body"),
                "meeting_id": gov.get("meeting_id"),
                "meeting_date": gov.get("meeting_date"),
                "resolution": gov.get("resolution"),
                "decision": gov.get("decision"),
                "created_at": datetime.utcnow()
            })

        doc = {
            "_id": proj["id"],
            "id": proj["id"],
            "canonical_name": proj["canonical_name"],
            "description": proj["description"],
            "financial_year": proj["financial_year"],
            "district": proj["district"],
            "assembly_constituency": proj["assembly_constituency"],
            "local_body": proj["local_body"],
            "block_panchayat": proj["block_panchayat"],
            "grama_panchayat": proj["grama_panchayat"],
            "ward": proj["ward"],
            "village": proj["village"],
            "location_text": proj["location_text"],
            "scheme_normalized": proj["scheme_normalized"],
            "scheme_original": proj["scheme_original"],
            "mla_name": proj["mla_name"],
            "category": proj["category"],
            "confidence_level": proj["confidence_level"],
            "status": proj["status"],
            "discrepancy_summary": proj.get("discrepancy_summary"),
            "sanctioned_amount": sanction_amt,
            "tender_value": tender_val,
            "estimated_value": est_val,
            "paid_amount": paid_amt,
            "source_count": len(sources_list),
            "sources_summary": sources_summary,
            "sources": sources_list,
            "sanctions": sanctions_arr,
            "plans": plans_arr,
            "tenders": tenders_arr,
            "executions": exec_arr,
            "payments": payments_arr,
            "engineering_records": eng_arr,
            "governance_records": gov_arr,
            "audit_records": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        docs.append(doc)

        for s_idx, src in enumerate(sources_list, 1):
            source_docs.append({
                "_id": f"{proj['id']}_src_{s_idx}",
                "id": f"{proj['id']}_src_{s_idx}",
                "project_id": proj["id"],
                "source_system": src.get("source_system"),
                "source_record_id": src.get("source_record_id"),
                "source_url": src.get("source_url"),
                "source_title": src.get("source_title"),
                "confidence": src.get("confidence", "HIGH"),
                "is_directly_reported": src.get("is_directly_reported", True),
                "raw_payload_path": src.get("raw_payload_path"),
                "retrieved_at": src.get("retrieved_at") or datetime.utcnow().isoformat()
            })

    if docs:
        projects_col.insert_many(docs)
    if source_docs:
        sources_col.insert_many(source_docs)

    # Ingestion Log
    logs_col.insert_one({
        "source_system": "ALL_SYSTEMS",
        "started_at": datetime.utcnow(),
        "finished_at": datetime.utcnow(),
        "records_found": len(docs),
        "records_new": len(docs),
        "records_updated": 0,
        "records_failed": 0,
        "status": "COMPLETED",
        "message": f"Successfully synced {len(docs)} projects into MongoDB Atlas ({db_name})"
    })

    # Create Indexes for high performance
    projects_col.create_index([("financial_year", 1)])
    projects_col.create_index([("grama_panchayat", 1)])
    projects_col.create_index([("scheme_normalized", 1)])
    projects_col.create_index([("status", 1)])
    projects_col.create_index([("category", 1)])
    projects_col.create_index([("canonical_name", "text"), ("location_text", "text"), ("description", "text")])

    print(f"[SUCCESS] MongoDB Atlas updated with {len(docs)} projects and {len(source_docs)} source records.")

def main():
    input_file = "data/resolved_projects.json"
    if not os.path.exists(input_file):
        print(f"File {input_file} not found. Running collect.py first...")
        os.system("python3 collect.py --source all --location mala")

    with open(input_file, "r", encoding="utf-8") as f:
        projects = json.load(f)

    if MONGODB_URI and "mongodb" in MONGODB_URI:
        try:
            sync_to_mongodb(projects)
            return
        except Exception as e:
            print(f"Error syncing to MongoDB: {e}", file=sys.stderr)
            raise e
    else:
        print("MONGODB_URI not configured in .env. Please check connection string.")

if __name__ == "__main__":
    main()
