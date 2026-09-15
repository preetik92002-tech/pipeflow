import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/lib/config/site'

/**
 * GET /api/service-areas/check?zip=80202
 *
 * Checks whether a given ZIP code falls within PipeFlow's configured service areas.
 * Uses siteConfig.defaultServiceAreas as the source of truth.
 * Response shape: { covered: boolean, zip: string, city: string | null }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')?.trim()

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: 'A valid 5-digit ZIP code is required.' },
      { status: 400 }
    )
  }

  // Build a flat ZIP → city name map from siteConfig service areas
  for (const area of siteConfig.defaultServiceAreas) {
    const zips: string[] = area.zipCodes ?? []
    if (zips.includes(zip)) {
      return NextResponse.json({ covered: true, zip, city: area.name })
    }
  }

  return NextResponse.json({ covered: false, zip, city: null })
}
