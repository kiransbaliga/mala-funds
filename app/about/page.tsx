import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Layers, FileText, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          Evidence-First Public Data Standard
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Methodology & Geographic Hierarchy
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          How Mala Public Funds Tracker harvests, normalizes, and reconciles government development records.
        </p>
      </div>

      {/* 1. Core Principles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-700" />
          1. Core Product Principle: Evidence-First
        </h2>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>Never present an inferred value as an official fact.</strong>
          </p>
          <p>
            Every monetary figure, status, and contractor assignment on this site is directly linked to an official government portal (Kerala e-Tender, Sulekha Plan Monitoring, Saankhya Accounting, Sakarma Council Decisions, or KERI Quality Testing).
          </p>
          <p>
            When a government portal has not published a figure (such as actual payment vouchers for ongoing works), we explicitly display <strong>&quot;Unknown / Not found in public records&quot;</strong> rather than fabricating or estimating.
          </p>
        </div>
      </section>

      {/* 2. Geographic Hierarchy */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-700" />
          2. Geographic Hierarchy & Distinctions
        </h2>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            In Kerala local governance, administrative entities overlap but have distinct boundaries. We never equate Mala Grama Panchayat with Kodungallur LAC or Mala Block Panchayat.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
            <div>Kerala State</div>
            <div className="pl-4">└── Thrissur District</div>
            <div className="pl-8">├── Kodungallur Legislative Assembly Constituency (LAC 073)</div>
            <div className="pl-8">└── Mala Block Panchayat</div>
            <div className="pl-12">├── Mala Grama Panchayat (Wards 1–20)</div>
            <div className="pl-12">├── Kuzhur Grama Panchayat (Wards 1–14)</div>
            <div className="pl-12">├── Poyya Grama Panchayat (Wards 1–14)</div>
            <div className="pl-12">├── Annamanada Grama Panchayat</div>
            <div className="pl-12">├── Puthenchira Grama Panchayat</div>
            <div className="pl-12">├── Aloor Grama Panchayat</div>
            <div className="pl-12">└── Vellangallur Grama Panchayat</div>
          </div>

          <p className="text-xs text-slate-500">
            Note: While Mala Block Panchayat comprises the above Grama Panchayats, Assembly Constituency boundaries (Kodungallur LAC vs Chalakkudy LAC vs Irinjalakuda LAC) are distinct. Our data model preserves exact LGD mappings for both Block and LAC.
          </p>
        </div>
      </section>

      {/* 3. Terminology */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-700" />
          3. Important Scheme Terminology
        </h2>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-700 leading-relaxed">
          <div>
            <h4 className="font-bold text-slate-900">LAC-ADS (Legislative Assembly Constituency Asset Development Scheme)</h4>
            <p className="text-xs text-slate-600 mt-1">
              Provides dedicated annual capital funding for MLA-initiated durable community infrastructure (schools, healthcare facilities, major roads, bridges).
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900">MLA SDF (MLA Special Development Fund)</h4>
            <p className="text-xs text-slate-600 mt-1">
              General constituency development fund for community works, street lighting, water supply kiosks, and minor local renovations.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900">Raw vs Normalized Scheme Preservation</h4>
            <p className="text-xs text-slate-600 mt-1">
              Government systems frequently combine terms (e.g. <em>&quot;LAC-ADS / MLA SDF 2023-24&quot;</em>). We always preserve the verbatim scheme text in <code>scheme_original</code> while tagging a clean <code>scheme_normalized</code> classification for filtering.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Fund Utilization Distinction */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          4. Why Tender Value $\neq$ Expenditure
        </h2>
        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3 text-xs text-amber-950 leading-relaxed">
          <p className="font-semibold text-sm text-amber-900">
            Critical Civic Finance Rule:
          </p>
          <p>
            It is a fundamental error in civic tracking to calculate <em>&quot;fund utilization = sum of tender values&quot;</em>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-800">
            <li><strong>Sanctioned Amount (AS):</strong> The maximum expenditure ceiling approved by government.</li>
            <li><strong>Estimated Value:</strong> Engineering estimate based on CPWD/PWD schedule of rates.</li>
            <li><strong>Tender / Contract Value:</strong> The competitive bid amount awarded to the contractor.</li>
            <li><strong>Actual Expenditure / Paid Amount:</strong> The cumulative payment disbursed by the Treasury through Saankhya vouchers upon physical site measurement.</li>
          </ul>
        </div>
      </section>

      {/* Explore Link */}
      <div className="pt-4 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-colors"
        >
          Explore All Reconciled Projects <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
