"""
Mala Public Funds Tracker - Data Collection CLI
Usage:
    python3 collect.py --source etender --year 2024-25
    python3 collect.py --source all --location mala
"""

import argparse
import json
import os
import sys
from datetime import datetime

from collectors.etender.collector import ETenderCollector
from collectors.sulekha.collector import SulekhaCollector
from collectors.sakarma.collector import SakarmaCollector
from collectors.sankhya.collector import SaankhyaCollector
from collectors.keri_pask.collector import KeriPaskCollector
from entity_resolution import EntityResolver

def main():
    parser = argparse.ArgumentParser(description="Collect and reconcile Mala LAC/GP public funds data.")
    parser.add_argument("--source", default="all", choices=["all", "etender", "sulekha", "sakarma", "sankhya", "keri", "pask"], help="Data source to collect")
    parser.add_argument("--location", default="mala", help="Location filter keyword (e.g. mala, kuzhur, poyya)")
    parser.add_argument("--year", default=None, help="Financial year filter (e.g. 2023-24, 2024-25)")
    parser.add_argument("--output", default="data/resolved_projects.json", help="Output file path")

    args = parser.parse_args()

    os.makedirs("data", exist_ok=True)
    start_time = datetime.utcnow()
    print(f"[{start_time.strftime('%Y-%m-%d %H:%M:%S')}] Starting data collection for source='{args.source}', location='{args.location}'...")

    etender_col = ETenderCollector()
    sulekha_col = SulekhaCollector()
    sakarma_col = SakarmaCollector()
    saankhya_col = SaankhyaCollector()
    keri_pask_col = KeriPaskCollector()

    et_records = etender_col.collect(args.location) if args.source in ["all", "etender"] else []
    sul_records = sulekha_col.collect(args.location) if args.source in ["all", "sulekha"] else []
    sak_records = sakarma_col.collect() if args.source in ["all", "sakarma"] else []
    sk_records = saankhya_col.collect() if args.source in ["all", "sankhya"] else []
    keri_records = keri_pask_col.collect_keri() if args.source in ["all", "keri"] else []
    pask_records = keri_pask_col.collect_pask() if args.source in ["all", "pask"] else []

    print(f"Collected raw records:")
    print(f"  - Kerala e-Tender: {len(et_records)}")
    print(f"  - Kerala Sulekha:  {len(sul_records)}")
    print(f"  - Kerala Sakarma:  {len(sak_records)}")
    print(f"  - Kerala Saankhya: {len(sk_records)}")
    print(f"  - KERI Tests:      {len(keri_records)}")
    print(f"  - PASK Water:      {len(pask_records)}")

    # Resolve entities across sources
    resolver = EntityResolver()
    canonical_projects = resolver.resolve(
        etender_records=et_records,
        sulekha_records=sul_records,
        sakarma_records=sak_records,
        saankhya_records=sk_records,
        keri_records=keri_records,
        pask_records=pask_records
    )

    if args.year:
        canonical_projects = [p for p in canonical_projects if p["financial_year"] == args.year]

    # Save output
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(canonical_projects, f, indent=2)

    finish_time = datetime.utcnow()
    duration = (finish_time - start_time).total_seconds()
    print(f"\n[SUCCESS] Successfully reconciled {len(canonical_projects)} canonical projects into {args.output} in {duration:.2f}s.")
    
    # Print sample canonical project record matching prompt spec (Section 30)
    if canonical_projects:
        print("\n--- Sample Canonical Project Record (First Goal) ---")
        sample = canonical_projects[1] if len(canonical_projects) > 1 else canonical_projects[0]
        sample_output = {
            "project": sample["canonical_name"],
            "location": {
                "district": sample["district"],
                "lac": sample["assembly_constituency"],
                "block": sample["block_panchayat"],
                "panchayat": sample["grama_panchayat"]
            },
            "financial_year": sample["financial_year"],
            "scheme": sample["scheme_original"],
            "sanction": sample.get("sanction"),
            "tender": sample.get("tender"),
            "sources": sample["sources"]
        }
        print(json.dumps(sample_output, indent=2))

if __name__ == "__main__":
    main()
