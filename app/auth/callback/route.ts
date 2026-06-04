import { createClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? ''
  // Allow only internal paths; reject anything that could become a different host
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/app'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
