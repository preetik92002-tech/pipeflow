import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/service-areas/check?zip=80202
 *
 * Checks whether a given ZIP code falls within PipeFlow's configured service areas.
 * Checks the canonical service_areas and service_area_zips records.
 * Response shape: { covered: boolean, zip: string, city: string | null }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')?.trim()
  const cityInput = searchParams.get('city')?.trim()

  if (zip && !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: 'A valid 5-digit ZIP code is required.' },
      { status: 400 }
    )
  }
  if (!zip && (!cityInput || !/^[\p{L}\p{M} .'-]{1,120}$/u.test(cityInput))) return NextResponse.json({ error: 'Enter a valid city name or 5-digit ZIP code.' }, { status: 400 })

  try {
    const supabase = await createClient()
    let areaQuery = supabase.from('service_areas').select('id,name').eq('active', true)
    if (cityInput) areaQuery = areaQuery.ilike('name', cityInput)
    const { data: areas, error: areaError } = await areaQuery
    if (areaError) throw areaError
    if (cityInput) return NextResponse.json({ covered: Boolean(areas?.length), zip: null, city: areas?.[0]?.name ?? null })
    const ids = (areas ?? []).map((area) => area.id)
    if (!ids.length) return NextResponse.json({ covered: false, zip, city: null })
    const { data: matches, error: zipError } = await supabase.from('service_area_zips').select('service_area_id').eq('zip_code', zip).in('service_area_id', ids).limit(1)
    if (zipError) throw zipError
    const city = matches?.[0] ? areas?.find((area) => area.id === matches[0].service_area_id)?.name || null : null
    return NextResponse.json({ covered: Boolean(city), zip, city })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Service availability is temporarily unavailable.'
    return NextResponse.json({ error: `Unable to check service coverage: ${message}` }, { status: 503 })
  }
}
