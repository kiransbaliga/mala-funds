import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

// Global caching for Vercel serverless environments
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClientPromise(): Promise<MongoClient> | null {
  if (!MONGODB_URI) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        tls: true,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        tls: true,
      });
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  try {
    const promise = getMongoClientPromise();
    if (!promise) return null;
    const client = await promise;
    return client.db('mala_funds');
  } catch (error) {
    console.warn('[MongoDB Warning] Could not connect to MongoDB Atlas:', error);
    return null;
  }
}

// Fallback JSON loader for zero-downtime resilience
function getFallbackProjects(): any[] {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'resolved_projects.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading fallback JSON:', e);
  }
  return [];
}

export interface ProjectListItem {
  id: string;
  canonical_name: string;
  description: string | null;
  financial_year: string;
  district: string;
  assembly_constituency: string;
  local_body: string;
  block_panchayat: string | null;
  grama_panchayat: string | null;
  ward: string | null;
  village: string | null;
  location_text: string | null;
  scheme_normalized: string;
  scheme_original: string;
  mla_name: string | null;
  category: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  discrepancy_summary: string | null;
  sanctioned_amount: number | null;
  tender_value: number | null;
  estimated_value: number | null;
  paid_amount: number | null;
  source_count: number;
  sources_summary: string;
}

export interface ProjectDetail extends ProjectListItem {
  sources: Array<{
    id: string;
    source_system: string;
    source_record_id: string;
    source_url: string;
    source_title: string;
    retrieved_at: string;
    confidence: string;
    is_directly_reported: boolean;
    raw_payload_path: string | null;
  }>;
  sanctions: Array<{
    id: string;
    as_number: string | null;
    as_date: string | null;
    ts_number: string | null;
    ts_date: string | null;
    sanctioned_amount: number | null;
    funding_head: string | null;
  }>;
  plans: Array<{
    id: string;
    planned_amount: number | null;
    approved_amount: number | null;
    revised_amount: number | null;
    plan_year: string | null;
    sector: string | null;
    status: string | null;
  }>;
  tenders: Array<{
    id: string;
    tender_id: string | null;
    tender_reference: string | null;
    estimated_value: number | null;
    tender_value: number | null;
    published_date: string | null;
    bid_opening_date: string | null;
    award_date: string | null;
    contractor: string | null;
    nit_url: string | null;
    boq_url: string | null;
    status: string | null;
  }>;
  executions: Array<{
    id: string;
    work_order_number: string | null;
    work_order_date: string | null;
    start_date: string | null;
    scheduled_completion_date: string | null;
    actual_completion_date: string | null;
    progress_percent: number;
    status: string | null;
  }>;
  payments: Array<{
    id: string;
    bill_reference: string | null;
    voucher_number: string | null;
    transaction_date: string | null;
    amount: number;
    cumulative_amount: number | null;
    payment_status: string | null;
    treasury_reference: string | null;
  }>;
  engineering_records: Array<{
    id: string;
    report_id: string | null;
    test_date: string | null;
    test_type: string | null;
    agreement_reference: string | null;
    description: string | null;
    result: string | null;
  }>;
  governance_records: Array<{
    id: string;
    local_body: string | null;
    meeting_id: string | null;
    meeting_date: string | null;
    resolution: string | null;
    decision: string | null;
  }>;
  audit_records: Array<{
    id: string;
    audit_year: string | null;
    observation: string | null;
    financial_amount: number | null;
    response: string | null;
  }>;
}

export async function getAllProjects(filters?: {
  q?: string;
  year?: string;
  scheme?: string;
  panchayat?: string;
  ward?: string;
  category?: string;
  status?: string;
  confidence?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<{ projects: ProjectListItem[]; total: number }> {
  const db = await getMongoDb();
  let docs: any[] = [];
  let total = 0;

  if (db) {
    try {
      const collection = db.collection('projects');
      const query: any = {};

      if (filters?.q) {
        const regex = new RegExp(filters.q, 'i');
        query.$or = [
          { canonical_name: regex },
          { location_text: regex },
          { grama_panchayat: regex },
          { description: regex },
          { category: regex },
          { scheme_original: regex }
        ];
      }

      if (filters?.year) query.financial_year = filters.year;
      if (filters?.scheme) query.scheme_normalized = filters.scheme;
      if (filters?.panchayat) {
        const pRegex = new RegExp(filters.panchayat, 'i');
        query.$or = [{ grama_panchayat: pRegex }, { local_body: pRegex }];
      }
      if (filters?.ward) query.ward = new RegExp(filters.ward, 'i');
      if (filters?.category) query.category = filters.category;
      if (filters?.status) query.status = filters.status;
      if (filters?.confidence) query.confidence_level = filters.confidence.toUpperCase();

      total = await collection.countDocuments(query);

      let sort: any = { financial_year: -1, created_at: -1 };
      if (filters?.sortBy === 'amount-desc') sort = { tender_value: -1, estimated_value: -1 };
      else if (filters?.sortBy === 'amount-asc') sort = { tender_value: 1, estimated_value: 1 };
      else if (filters?.sortBy === 'name') sort = { canonical_name: 1 };

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      docs = await collection.find(query).sort(sort).skip(offset).limit(limit).toArray();
    } catch (err) {
      console.warn('MongoDB query failed, using local fallback:', err);
      docs = [];
    }
  }

  // Fallback to local JSON if MongoDB is unavailable or empty
  if (!docs || docs.length === 0) {
    const rawFallback = getFallbackProjects();
    let filtered = rawFallback;

    if (filters?.q) {
      const term = filters.q.toLowerCase();
      filtered = filtered.filter(p =>
        (p.canonical_name || '').toLowerCase().includes(term) ||
        (p.location_text || '').toLowerCase().includes(term) ||
        (p.grama_panchayat || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      );
    }
    if (filters?.year) filtered = filtered.filter(p => p.financial_year === filters.year);
    if (filters?.scheme) filtered = filtered.filter(p => p.scheme_normalized === filters.scheme);
    if (filters?.panchayat) filtered = filtered.filter(p => (p.grama_panchayat || '').toLowerCase().includes(filters.panchayat!.toLowerCase()));
    if (filters?.ward) filtered = filtered.filter(p => (p.ward || '').toLowerCase().includes(filters.ward!.toLowerCase()));
    if (filters?.category) filtered = filtered.filter(p => p.category === filters.category);
    if (filters?.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters?.confidence) filtered = filtered.filter(p => (p.confidence_level || '').toUpperCase() === filters.confidence!.toUpperCase());

    total = filtered.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    docs = filtered.slice(offset, offset + limit);
  }

  const projects: ProjectListItem[] = docs.map((doc: any) => {
    const sanctionAmt = doc.sanctioned_amount ?? doc.sanction?.sanctioned_amount ?? null;
    const tenderVal = doc.tender_value ?? doc.tender?.tender_value ?? null;
    const estVal = doc.estimated_value ?? doc.tender?.estimated_value ?? null;
    const paidAmt = doc.paid_amount ?? (doc.payments?.reduce((acc: number, p: any) => acc + (p.amount || 0), 0) || null);
    const sourcesList = doc.sources || [];
    const sourcesSummary = doc.sources_summary || Array.from(new Set(sourcesList.map((s: any) => s.source_system))).join(',');

    return {
      id: doc.id || doc._id,
      canonical_name: doc.canonical_name,
      description: doc.description,
      financial_year: doc.financial_year,
      district: doc.district || 'Thrissur',
      assembly_constituency: doc.assembly_constituency || 'Kodungallur LAC',
      local_body: doc.local_body,
      block_panchayat: doc.block_panchayat,
      grama_panchayat: doc.grama_panchayat,
      ward: doc.ward,
      village: doc.village,
      location_text: doc.location_text,
      scheme_normalized: doc.scheme_normalized,
      scheme_original: doc.scheme_original,
      mla_name: doc.mla_name,
      category: doc.category || 'Other',
      confidence_level: doc.confidence_level || 'MEDIUM',
      status: doc.status || 'Proposed',
      discrepancy_summary: doc.discrepancy_summary,
      sanctioned_amount: sanctionAmt,
      tender_value: tenderVal,
      estimated_value: estVal,
      paid_amount: paidAmt,
      source_count: doc.source_count || (sourcesList.length || 1),
      sources_summary: sourcesSummary
    };
  });

  return { projects, total };
}

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  const db = await getMongoDb();
  let doc: any = null;

  if (db) {
    try {
      doc = await db.collection('projects').findOne({ $or: [{ id }, { _id: id as any }] });
    } catch (err) {
      console.warn('MongoDB findOne error:', err);
    }
  }

  if (!doc) {
    const raw = getFallbackProjects();
    doc = raw.find(p => p.id === id);
  }

  if (!doc) return null;

  const sanctionAmt = doc.sanctioned_amount ?? doc.sanction?.sanctioned_amount ?? null;
  const tenderVal = doc.tender_value ?? doc.tender?.tender_value ?? null;
  const estVal = doc.estimated_value ?? doc.tender?.estimated_value ?? null;
  const paidAmt = doc.paid_amount ?? (doc.payments?.reduce((acc: number, p: any) => acc + (p.amount || 0), 0) || null);
  const sourcesList = doc.sources || [];
  const sourcesSummary = doc.sources_summary || Array.from(new Set(sourcesList.map((s: any) => s.source_system))).join(',');

  const sanctions = doc.sanctions || (doc.sanction ? [{
    id: `${doc.id}_sanc_1`,
    as_number: doc.sanction.as_number,
    as_date: doc.sanction.as_date,
    ts_number: doc.sanction.ts_number,
    ts_date: doc.sanction.ts_date,
    sanctioned_amount: doc.sanction.sanctioned_amount,
    funding_head: doc.sanction.funding_head
  }] : []);

  const plans = doc.plans || (doc.plan ? [{
    id: `${doc.id}_plan_1`,
    planned_amount: doc.plan.planned_amount,
    approved_amount: doc.plan.approved_amount,
    revised_amount: doc.plan.revised_amount,
    plan_year: doc.plan.plan_year,
    sector: doc.plan.sector,
    status: doc.plan.status
  }] : []);

  const tenders = doc.tenders || (doc.tender ? [{
    id: `${doc.id}_tnd_1`,
    tender_id: doc.tender.tender_id,
    tender_reference: doc.tender.tender_reference,
    estimated_value: doc.tender.estimated_value,
    tender_value: doc.tender.tender_value,
    published_date: doc.tender.published_date,
    bid_opening_date: doc.tender.bid_opening_date,
    award_date: doc.tender.award_date,
    contractor: doc.tender.contractor,
    nit_url: doc.tender.nit_url,
    boq_url: doc.tender.boq_url,
    status: doc.tender.status
  }] : []);

  return {
    id: doc.id || doc._id,
    canonical_name: doc.canonical_name,
    description: doc.description,
    financial_year: doc.financial_year,
    district: doc.district || 'Thrissur',
    assembly_constituency: doc.assembly_constituency || 'Kodungallur LAC',
    local_body: doc.local_body,
    block_panchayat: doc.block_panchayat,
    grama_panchayat: doc.grama_panchayat,
    ward: doc.ward,
    village: doc.village,
    location_text: doc.location_text,
    scheme_normalized: doc.scheme_normalized,
    scheme_original: doc.scheme_original,
    mla_name: doc.mla_name,
    category: doc.category || 'Other',
    confidence_level: doc.confidence_level || 'MEDIUM',
    status: doc.status || 'Proposed',
    discrepancy_summary: doc.discrepancy_summary,
    sanctioned_amount: sanctionAmt,
    tender_value: tenderVal,
    estimated_value: estVal,
    paid_amount: paidAmt,
    source_count: doc.source_count || (sourcesList.length || 1),
    sources_summary: sourcesSummary,
    sources: sourcesList.map((s: any, idx: number) => ({
      id: s.id || `${doc.id}_src_${idx + 1}`,
      source_system: s.source_system,
      source_record_id: s.source_record_id,
      source_url: s.source_url,
      source_title: s.source_title,
      retrieved_at: s.retrieved_at || new Date().toISOString(),
      confidence: s.confidence || 'HIGH',
      is_directly_reported: s.is_directly_reported ?? true,
      raw_payload_path: s.raw_payload_path || null
    })),
    sanctions,
    plans,
    tenders,
    executions: doc.executions || [{ progress_percent: doc.status === 'Completed' ? 100 : 50, status: doc.status }],
    payments: doc.payments || [],
    engineering_records: doc.engineering_records || doc.engineering || [],
    governance_records: doc.governance_records || doc.governance || [],
    audit_records: doc.audit_records || []
  };
}

export async function getStats() {
  const { projects } = await getAllProjects({ limit: 500 });
  const allDocs = projects;

  const totalProjects = allDocs.length;
  const completedProjects = allDocs.filter(d => d.status === 'Completed').length;
  const inProgressProjects = allDocs.filter(d => ['In Progress', 'Awarded', 'Work Started'].includes(d.status)).length;
  const sanctionedProjects = allDocs.filter(d => ['Proposed', 'Administrative Sanction', 'Tendered'].includes(d.status)).length;

  const totalSanctioned = allDocs.reduce((acc, d) => acc + (d.sanctioned_amount || 0), 0);
  const totalTendered = allDocs.reduce((acc, d) => acc + (d.tender_value || 0), 0);
  const totalEstimated = allDocs.reduce((acc, d) => acc + (d.estimated_value || 0), 0);
  const totalPaid = allDocs.reduce((acc, d) => acc + (d.paid_amount || 0), 0);

  const allSystems = new Set<string>();
  allDocs.forEach(d => {
    (d.sources_summary || '').split(',').forEach((sys: string) => {
      if (sys.trim()) allSystems.add(sys.trim());
    });
  });

  return {
    totalProjects,
    completedProjects,
    inProgressProjects,
    sanctionedProjects,
    totalSanctioned,
    totalTendered,
    totalEstimated,
    totalPaid,
    totalSources: allSystems.size || 6,
    tenderSavings: totalEstimated > totalTendered ? totalEstimated - totalTendered : 0,
  };
}

export interface YearStat {
  year: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
  spent: number;
}

export async function getStatsByYear(): Promise<YearStat[]> {
  const { projects } = await getAllProjects({ limit: 500 });
  const map: Record<string, YearStat> = {};

  projects.forEach(p => {
    const yr = p.financial_year || 'Unknown';
    if (!map[yr]) {
      map[yr] = { year: yr, projectCount: 0, sanctioned: 0, tendered: 0, spent: 0 };
    }
    map[yr].projectCount += 1;
    map[yr].sanctioned += p.sanctioned_amount || 0;
    map[yr].tendered += p.tender_value || 0;
    map[yr].spent += p.paid_amount || 0;
  });

  return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
}

export interface PanchayatStat {
  name: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
  spent: number;
}

export async function getStatsByPanchayat(): Promise<PanchayatStat[]> {
  const { projects } = await getAllProjects({ limit: 500 });
  const map: Record<string, PanchayatStat> = {};

  projects.forEach(p => {
    const name = p.grama_panchayat || p.local_body || 'Other';
    if (!map[name]) {
      map[name] = { name, projectCount: 0, sanctioned: 0, tendered: 0, spent: 0 };
    }
    map[name].projectCount += 1;
    map[name].sanctioned += p.sanctioned_amount || 0;
    map[name].tendered += p.tender_value || 0;
    map[name].spent += p.paid_amount || 0;
  });

  return Object.values(map).sort((a, b) => b.projectCount - a.projectCount);
}

export interface SchemeStat {
  scheme: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
  spent: number;
}

export async function getStatsByScheme(): Promise<SchemeStat[]> {
  const { projects } = await getAllProjects({ limit: 500 });
  const map: Record<string, SchemeStat> = {};

  projects.forEach(p => {
    const scheme = p.scheme_normalized || 'Other';
    if (!map[scheme]) {
      map[scheme] = { scheme, projectCount: 0, sanctioned: 0, tendered: 0, spent: 0 };
    }
    map[scheme].projectCount += 1;
    map[scheme].sanctioned += p.sanctioned_amount || 0;
    map[scheme].tendered += p.tender_value || 0;
    map[scheme].spent += p.paid_amount || 0;
  });

  return Object.values(map).sort((a, b) => b.sanctioned - a.sanctioned);
}

export interface CategoryStat {
  category: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
}

export async function getStatsByCategory(): Promise<CategoryStat[]> {
  const { projects } = await getAllProjects({ limit: 500 });
  const map: Record<string, CategoryStat> = {};

  projects.forEach(p => {
    const cat = p.category || 'Other';
    if (!map[cat]) {
      map[cat] = { category: cat, projectCount: 0, sanctioned: 0, tendered: 0 };
    }
    map[cat].projectCount += 1;
    map[cat].sanctioned += p.sanctioned_amount || 0;
    map[cat].tendered += p.tender_value || 0;
  });

  return Object.values(map).sort((a, b) => b.projectCount - a.projectCount);
}

export async function getSourceOverlap() {
  const { projects } = await getAllProjects({ limit: 500 });
  const systemCountMap: Record<string, number> = {};

  projects.forEach(p => {
    (p.sources_summary || '').split(',').forEach((sys: string) => {
      const clean = sys.trim();
      if (clean) systemCountMap[clean] = (systemCountMap[clean] || 0) + 1;
    });
  });

  const systemCounts = Object.entries(systemCountMap).map(([source_system, count]) => ({
    source_system,
    count
  })).sort((a, b) => b.count - a.count);

  const pairs = [
    { a: 'sulekha', b: 'etender', label: 'Sulekha + e-Tender' },
    { a: 'sulekha', b: 'saankhya', label: 'Sulekha + Saankhya' },
    { a: 'etender', b: 'sakarma', label: 'e-Tender + Sakarma' },
    { a: 'sulekha', b: 'sakarma', label: 'Sulekha + Sakarma' },
    { a: 'etender', b: 'keri', label: 'e-Tender + KERI' },
    { a: 'sulekha', b: 'pask', label: 'Sulekha + PASK' },
  ];

  const crossMatches = pairs.map(pair => {
    const count = projects.filter(p => {
      const systems = (p.sources_summary || '').split(',').map((s: string) => s.trim());
      return systems.includes(pair.a) && systems.includes(pair.b);
    }).length;

    return {
      label: pair.label,
      systemA: pair.a,
      systemB: pair.b,
      count
    };
  });

  return {
    systemCounts,
    crossMatches
  };
}
