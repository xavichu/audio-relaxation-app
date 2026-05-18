import { NextRequest } from 'next/server'
import { fetchAllAnalyses, tickAnalysis } from '@/lib/market-data'
import type { GrowthAnalysis } from '@/lib/investment-algorithm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const enc = new TextEncoder()
const sse = (data: unknown) => enc.encode(`data: ${JSON.stringify(data)}\n\n`)

export async function GET(req: NextRequest) {
  let analyses: GrowthAnalysis[] = []
  let initialised = false

  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (payload: unknown) => {
        try { ctrl.enqueue(sse(payload)) } catch { /* client gone */ }
      }

      // Initial full snapshot (try real data, fall back to simulation)
      try {
        analyses = await fetchAllAnalyses(true)
      } catch {
        analyses = await fetchAllAnalyses(false)
      }
      send({ type: 'snapshot', data: analyses, ts: Date.now() })
      initialised = true

      // Tick every 4 seconds with lightweight price updates
      const interval = setInterval(() => {
        if (!initialised) return
        // Re-rank after ticks
        analyses = analyses.map(a => tickAnalysis(a))
        const sorted = [...analyses].sort((a, b) => b.scores.composite - a.scores.composite)
        sorted.forEach((a, i) => { a.rank = i + 1 })
        analyses = sorted
        send({ type: 'tick', data: analyses, ts: Date.now() })
      }, 4000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        try { ctrl.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection:      'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
