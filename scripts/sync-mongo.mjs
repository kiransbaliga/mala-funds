import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Parse .env if present
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function sync() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in environment or .env file.');
    process.exit(1);
  }
  const jsonPath = path.join(process.cwd(), 'data', 'resolved_projects.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Missing ${jsonPath}`);
    process.exit(1);
  }

  const projects = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Connecting to MongoDB Atlas...`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log(`✓ Connected to MongoDB Atlas.`);

    const db = client.db('mala_funds');
    const projectsCol = db.collection('projects');
    const sourcesCol = db.collection('project_sources');
    const logsCol = db.collection('ingestion_logs');

    await projectsCol.deleteMany({});
    await sourcesCol.deleteMany({});

    const docs = [];
    const sourceDocs = [];

    for (const proj of projects) {
      const sanctionAmt = proj.sanction?.sanctioned_amount ?? null;
      const tenderVal = proj.tender?.tender_value ?? null;
      const estVal = proj.tender?.estimated_value ?? null;
      const paidAmt = proj.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) ?? null;

      const sourcesList = proj.sources || [];
      const sourcesSummary = Array.from(new Set(sourcesList.map(s => s.source_system))).join(',');

      const sanctionsArr = proj.sanction ? [{
        id: `${proj.id}_sanc_1`,
        as_number: proj.sanction.as_number,
        as_date: proj.sanction.as_date,
        ts_number: proj.sanction.ts_number,
        ts_date: proj.sanction.ts_date,
        sanctioned_amount: proj.sanction.sanctioned_amount,
        funding_head: proj.sanction.funding_head,
        created_at: new Date()
      }] : [];

      const plansArr = proj.plan ? [{
        id: `${proj.id}_plan_1`,
        planned_amount: proj.plan.planned_amount,
        approved_amount: proj.plan.approved_amount,
        revised_amount: proj.plan.revised_amount,
        plan_year: proj.plan.plan_year,
        sector: proj.plan.sector,
        status: proj.plan.status,
        created_at: new Date()
      }] : [];

      const tendersArr = proj.tender ? [{
        id: `${proj.id}_tnd_1`,
        tender_id: proj.tender.tender_id,
        tender_reference: proj.tender.tender_reference,
        estimated_value: proj.tender.estimated_value,
        tender_value: proj.tender.tender_value,
        published_date: proj.tender.published_date,
        bid_opening_date: proj.tender.bid_opening_date,
        award_date: proj.tender.award_date,
        contractor: proj.tender.contractor,
        nit_url: proj.tender.nit_url,
        boq_url: proj.tender.boq_url,
        status: proj.tender.status,
        created_at: new Date()
      }] : [];

      const executionsArr = [{
        id: `${proj.id}_exec_1`,
        work_order_number: null,
        work_order_date: null,
        start_date: null,
        scheduled_completion_date: null,
        actual_completion_date: null,
        progress_percent: proj.status === 'Completed' ? 100 : (proj.status === 'In Progress' ? 65 : 0),
        status: proj.status,
        created_at: new Date()
      }];

      const paymentsArr = (proj.payments || []).map((pay, pIdx) => ({
        id: `${proj.id}_pay_${pIdx + 1}`,
        bill_reference: pay.bill_reference,
        voucher_number: pay.voucher_number,
        transaction_date: pay.transaction_date,
        amount: pay.amount || 0,
        cumulative_amount: pay.cumulative_amount,
        payment_status: pay.payment_status,
        treasury_reference: pay.treasury_reference,
        created_at: new Date()
      }));

      const engArr = (proj.engineering || []).map((eng, eIdx) => ({
        id: `${proj.id}_eng_${eIdx + 1}`,
        report_id: eng.report_id,
        test_date: eng.test_date,
        test_type: eng.test_type,
        agreement_reference: eng.agreement_reference,
        description: eng.description,
        result: eng.result,
        created_at: new Date()
      }));

      const govArr = (proj.governance || []).map((gov, gIdx) => ({
        id: `${proj.id}_gov_${gIdx + 1}`,
        local_body: gov.local_body,
        meeting_id: gov.meeting_id,
        meeting_date: gov.meeting_date,
        resolution: gov.resolution,
        decision: gov.decision,
        created_at: new Date()
      }));

      docs.push({
        _id: proj.id,
        id: proj.id,
        canonical_name: proj.canonical_name,
        description: proj.description,
        financial_year: proj.financial_year,
        district: proj.district,
        assembly_constituency: proj.assembly_constituency,
        local_body: proj.local_body,
        block_panchayat: proj.block_panchayat,
        grama_panchayat: proj.grama_panchayat,
        ward: proj.ward,
        village: proj.village,
        location_text: proj.location_text,
        scheme_normalized: proj.scheme_normalized,
        scheme_original: proj.scheme_original,
        mla_name: proj.mla_name,
        category: proj.category,
        confidence_level: proj.confidence_level,
        status: proj.status,
        discrepancy_summary: proj.discrepancy_summary,
        sanctioned_amount: sanctionAmt,
        tender_value: tenderVal,
        estimated_value: estVal,
        paid_amount: paidAmt,
        source_count: sourcesList.length,
        sources_summary: sourcesSummary,
        sources: sourcesList,
        sanctions: sanctionsArr,
        plans: plansArr,
        tenders: tendersArr,
        executions: executionsArr,
        payments: paymentsArr,
        engineering_records: engArr,
        governance_records: govArr,
        audit_records: [],
        created_at: new Date(),
        updated_at: new Date()
      });

      sourcesList.forEach((src, sIdx) => {
        sourceDocs.push({
          _id: `${proj.id}_src_${sIdx + 1}`,
          id: `${proj.id}_src_${sIdx + 1}`,
          project_id: proj.id,
          source_system: src.source_system,
          source_record_id: src.source_record_id,
          source_url: src.source_url,
          source_title: src.source_title,
          confidence: src.confidence || 'HIGH',
          is_directly_reported: src.is_directly_reported ?? true,
          raw_payload_path: src.raw_payload_path,
          retrieved_at: src.retrieved_at || new Date().toISOString()
        });
      });
    }

    if (docs.length > 0) {
      await projectsCol.insertMany(docs);
    }
    if (sourceDocs.length > 0) {
      await sourcesCol.insertMany(sourceDocs);
    }

    await logsCol.insertOne({
      source_system: 'ALL_SYSTEMS',
      started_at: new Date(),
      finished_at: new Date(),
      records_found: docs.length,
      records_new: docs.length,
      records_updated: 0,
      records_failed: 0,
      status: 'COMPLETED',
      message: `Node.js sync completed ${docs.length} projects into MongoDB Atlas`
    });

    console.log(`[SUCCESS] Populated ${docs.length} canonical projects into MongoDB Atlas.`);
  } finally {
    await client.close();
  }
}

sync().catch(console.error);
