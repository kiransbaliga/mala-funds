import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    console.error('Error fetching project detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
