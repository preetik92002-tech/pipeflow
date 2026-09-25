import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('services').select('id,title,slug,category,short_description').eq('active', true).order('display_order')
    if (error) throw error
    return NextResponse.json({ services: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load services.' }, { status: 503 })
  }
}
