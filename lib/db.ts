import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://kiransbaliga_db_user:Zn1zz0G6eYk7dscC@cluster0.ha5ofnz.mongodb.net/mala_funds?retryWrites=true&w=majority&appName=Cluster0';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db('mala_funds');

  cachedClient = client;
  cachedDb = db;
  return db;
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

  if (filters?.year) {
    query.financial_year = filters.year;
  }

  if (filters?.scheme) {
    query.scheme_normalized = filters.scheme;
  }

  if (filters?.panchayat) {
    const pRegex = new RegExp(filters.panchayat, 'i');
    query.$or = [{ grama_panchayat: pRegex }, { local_body: pRegex }];
  }

  if (filters?.ward) {
    query.ward = new RegExp(filters.ward, 'i');
  }

  if (filters?.category) {
    query.category = filters.category;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.confidence) {
    query.confidence_level = filters.confidence.toUpperCase();
  }

  const total = await collection.countDocuments(query);

  let sort: any = { financial_year: -1, created_at: -1 };
  if (filters?.sortBy === 'amount-desc') {
    sort = { tender_value: -1, estimated_value: -1 };
  } else if (filters?.sortBy === 'amount-asc') {
    sort = { tender_value: 1, estimated_value: 1 };
  } else if (filters?.sortBy === 'name') {
    sort = { canonical_name: 1 };
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const docs = await collection.find(query).sort(sort).skip(offset).limit(limit).toArray();

  const projects = docs.map((doc: any) => ({
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
    sanctioned_amount: doc.sanctioned_amount ?? null,
    tender_value: doc.tender_value ?? null,
    estimated_value: doc.estimated_value ?? null,
    paid_amount: doc.paid_amount ?? null,
    source_count: doc.source_count || (doc.sources?.length ?? 1),
    sources_summary: doc.sources_summary || ''
  }));

  return { projects, total };
}

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  const db = await getMongoDb();
  const doc: any = await db.collection('projects').findOne({ $or: [{ id }, { _id: id as any }] });
  if (!doc) return null;

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
    sanctioned_amount: doc.sanctioned_amount ?? null,
    tender_value: doc.tender_value ?? null,
    estimated_value: doc.estimated_value ?? null,
    paid_amount: doc.paid_amount ?? null,
    source_count: doc.source_count || (doc.sources?.length ?? 1),
    sources_summary: doc.sources_summary || '',
    sources: (doc.sources || []).map((s: any, idx: number) => ({
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
    sanctions: doc.sanctions || [],
    plans: doc.plans || [],
    tenders: doc.tenders || [],
    executions: doc.executions || [],
    payments: doc.payments || [],
    engineering_records: doc.engineering_records || [],
    governance_records: doc.governance_records || [],
    audit_records: doc.audit_records || []
  };
}

export async function getStats() {
  const db = await getMongoDb();
  const collection = db.collection('projects');
  const allDocs = await collection.find({}).toArray();

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
    (d.sources || []).forEach((s: any) => allSystems.add(s.source_system));
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
  const db = await getMongoDb();
  const collection = db.collection('projects');
  const pipeline = [
    {
      $group: {
        _id: '$financial_year',
        projectCount: { $sum: 1 },
        sanctioned: { $sum: { $ifNull: ['$sanctioned_amount', 0] } },
        tendered: { $sum: { $ifNull: ['$tender_value', 0] } },
        spent: { $sum: { $ifNull: ['$paid_amount', 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const results = await collection.aggregate(pipeline).toArray();
  return results.map((r: any) => ({
    year: r._id,
    projectCount: r.projectCount,
    sanctioned: r.sanctioned,
    tendered: r.tendered,
    spent: r.spent
  }));
}

export interface PanchayatStat {
  name: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
  spent: number;
}

export async function getStatsByPanchayat(): Promise<PanchayatStat[]> {
  const db = await getMongoDb();
  const collection = db.collection('projects');
  const pipeline = [
    {
      $group: {
        _id: { $ifNull: ['$grama_panchayat', '$local_body'] },
        projectCount: { $sum: 1 },
        sanctioned: { $sum: { $ifNull: ['$sanctioned_amount', 0] } },
        tendered: { $sum: { $ifNull: ['$tender_value', 0] } },
        spent: { $sum: { $ifNull: ['$paid_amount', 0] } }
      }
    },
    { $sort: { projectCount: -1 } }
  ];

  const results = await collection.aggregate(pipeline).toArray();
  return results.map((r: any) => ({
    name: r._id || 'Other',
    projectCount: r.projectCount,
    sanctioned: r.sanctioned,
    tendered: r.tendered,
    spent: r.spent
  }));
}

export interface SchemeStat {
  scheme: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
  spent: number;
}

export async function getStatsByScheme(): Promise<SchemeStat[]> {
  const db = await getMongoDb();
  const collection = db.collection('projects');
  const pipeline = [
    {
      $group: {
        _id: '$scheme_normalized',
        projectCount: { $sum: 1 },
        sanctioned: { $sum: { $ifNull: ['$sanctioned_amount', 0] } },
        tendered: { $sum: { $ifNull: ['$tender_value', 0] } },
        spent: { $sum: { $ifNull: ['$paid_amount', 0] } }
      }
    },
    { $sort: { sanctioned: -1 } }
  ];

  const results = await collection.aggregate(pipeline).toArray();
  return results.map((r: any) => ({
    scheme: r._id,
    projectCount: r.projectCount,
    sanctioned: r.sanctioned,
    tendered: r.tendered,
    spent: r.spent
  }));
}

export interface CategoryStat {
  category: string;
  projectCount: number;
  sanctioned: number;
  tendered: number;
}

export async function getStatsByCategory(): Promise<CategoryStat[]> {
  const db = await getMongoDb();
  const collection = db.collection('projects');
  const pipeline = [
    {
      $group: {
        _id: '$category',
        projectCount: { $sum: 1 },
        sanctioned: { $sum: { $ifNull: ['$sanctioned_amount', 0] } },
        tendered: { $sum: { $ifNull: ['$tender_value', 0] } }
      }
    },
    { $sort: { projectCount: -1 } }
  ];

  const results = await collection.aggregate(pipeline).toArray();
  return results.map((r: any) => ({
    category: r._id,
    projectCount: r.projectCount,
    sanctioned: r.sanctioned,
    tendered: r.tendered
  }));
}

export async function getSourceOverlap() {
  const db = await getMongoDb();
  const collection = db.collection('projects');
  const allDocs = await collection.find({}).toArray();

  const systemCountMap: Record<string, number> = {};
  allDocs.forEach(d => {
    (d.sources || []).forEach((s: any) => {
      const sys = s.source_system;
      systemCountMap[sys] = (systemCountMap[sys] || 0) + 1;
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
    const count = allDocs.filter(d => {
      const systems = (d.sources || []).map((s: any) => s.source_system);
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
