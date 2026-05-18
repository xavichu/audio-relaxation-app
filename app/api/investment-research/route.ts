import { NextResponse } from 'next/server'
import { fetchAllAnalyses } from '@/lib/market-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const analyses = await fetchAllAnalyses(true)
    return NextResponse.json({ data: analyses, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Investment research error:', err)
    return NextResponse.json({ error: 'Failed to run analysis' }, { status: 500 })
  }
}
