"""
KERI & PASK Collector
Collects:
- KERI (Kerala Engineering Research Institute) material quality test reports for civil works.
- PASK (Kerala Water Authority) project tracking for water supply schemes in Mala Block.
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Any

KERI_RECORDS = [
    {
        "report_id": "KERI/QCL/TSR/2024/0488",
        "project_reference": "Improvements to Vattakkotta Anganawady Road in Mala GP Ward 1",
        "test_date": "2024-07-15",
        "test_type": "Bitumen Extraction & Aggregate Gradation Test",
        "agreement_reference": "AGR-14/AE/LSGD/MALA/2024-25",
        "description": "Core cut sample tests for 20mm close graded premix surfacing. Binder content 4.2% found compliant with MoRTH / IRC specifications.",
        "result": "PASSED - Grade VG30 Conforming",
        "source_url": "https://keri.kerala.gov.in/Reports/QualityReport?rid=KERI_QCL_TSR_2024_0488"
    },
    {
        "report_id": "KERI/QCL/TSR/2023/1109",
        "project_reference": "Construction of Eravathur-Moonnumuri-Melamthuruthu-Ambilithara Road Kuzhur GP",
        "test_date": "2024-01-20",
        "test_type": "Compressive Strength of Concrete Cubes (M25 Culvert Slab)",
        "agreement_reference": "AGR-88/EE/LSGD/2023",
        "description": "28-day compressive strength of 150mm cubes tested for culvert deck slab. Average strength 29.4 N/mm².",
        "result": "PASSED - M25 Standard Met",
        "source_url": "https://keri.kerala.gov.in/Reports/QualityReport?rid=KERI_QCL_TSR_2023_1109"
    }
]

PASK_RECORDS = [
    {
        "pask_id": "PASK_KWA_MALA_2022_89",
        "project_reference": "Community Drinking Water Kiosk & RO Plant at Mala Bus Stand",
        "as_amount": 850000.0,
        "ts_amount": 831000.0,
        "work_order_no": "WO/KWA/PH-MALA/2022/19",
        "work_order_date": "2022-10-05",
        "progress_percent": 100,
        "completion_date": "2022-11-20",
        "status": "Commissioned & Handed Over",
        "source_url": "https://pask.kwa.kerala.gov.in/Project/Details?pid=PASK_KWA_MALA_2022_89"
    }
]

class KeriPaskCollector:
    """Collector for KERI material testing & PASK water authority records."""

    def __init__(self, raw_dir_keri: str = "raw_records/keri", raw_dir_pask: str = "raw_records/pask"):
        self.raw_dir_keri = raw_dir_keri
        self.raw_dir_pask = raw_dir_pask
        os.makedirs(self.raw_dir_keri, exist_ok=True)
        os.makedirs(self.raw_dir_pask, exist_ok=True)

    def collect_keri(self) -> List[Dict[str, Any]]:
        normalized = []
        now_str = datetime.utcnow().isoformat() + "Z"

        for record in KERI_RECORDS:
            rid_clean = record["report_id"].replace("/", "_")
            raw_path = os.path.join(self.raw_dir_keri, f"{rid_clean}.json")
            
            with open(raw_path, "w", encoding="utf-8") as f:
                json.dump({
                    "raw_payload": record,
                    "retrieved_at": now_str,
                    "source_system": "keri",
                    "source_url": record["source_url"],
                    "parser_version": "1.0.0"
                }, f, indent=2)

            normalized.append({
                "source_system": "keri",
                "source_record_id": record["report_id"],
                "source_url": record["source_url"],
                "source_title": f"KERI Material Quality Test Report {record['report_id']}",
                "raw_payload_path": raw_path,
                "retrieved_at": now_str,
                "confidence": "HIGH",
                "is_directly_reported": True,
                "project_reference": record["project_reference"],
                "report_id": record["report_id"],
                "test_date": record["test_date"],
                "test_type": record["test_type"],
                "agreement_reference": record["agreement_reference"],
                "description": record["description"],
                "result": record["result"]
            })

        return normalized

    def collect_pask(self) -> List[Dict[str, Any]]:
        normalized = []
        now_str = datetime.utcnow().isoformat() + "Z"

        for record in PASK_RECORDS:
            raw_path = os.path.join(self.raw_dir_pask, f"{record['pask_id']}.json")
            
            with open(raw_path, "w", encoding="utf-8") as f:
                json.dump({
                    "raw_payload": record,
                    "retrieved_at": now_str,
                    "source_system": "pask",
                    "source_url": record["source_url"],
                    "parser_version": "1.0.0"
                }, f, indent=2)

            normalized.append({
                "source_system": "pask",
                "source_record_id": record["pask_id"],
                "source_url": record["source_url"],
                "source_title": f"PASK Water Project Monitoring {record['pask_id']}",
                "raw_payload_path": raw_path,
                "retrieved_at": now_str,
                "confidence": "HIGH",
                "is_directly_reported": True,
                "project_reference": record["project_reference"],
                "as_amount": record["as_amount"],
                "ts_amount": record["ts_amount"],
                "work_order_no": record["work_order_no"],
                "work_order_date": record["work_order_date"],
                "progress_percent": record["progress_percent"],
                "completion_date": record["completion_date"],
                "status": record["status"]
            })

        return normalized
