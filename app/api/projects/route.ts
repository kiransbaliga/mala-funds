import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || undefined;
    const year = searchParams.get('year') || undefined;
    const scheme = searchParams.get('scheme') || undefined;
    const panchayat = searchParams.get('panchayat') || undefined;
    const ward = searchParams.get('ward') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const confidence = searchParams.get('confidence') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await getAllProjects({
      q,
      year,
      scheme,
      panchayat,
      ward,
      category,
      status,
      confidence,
      sortBy,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: result.projects,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.projects.length < result.total
      }
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
