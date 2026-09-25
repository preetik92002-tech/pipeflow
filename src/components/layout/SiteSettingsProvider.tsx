'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config/site'

type CompanyContact = typeof siteConfig.company
type PublicSiteSettings = { company: CompanyContact; announcementMessages: string[]; emergencyAvailable: boolean; analytics: { gaMeasurementId?: string | null; metaPixelId?: string | null; enabled: boolean } }
const defaultSettings: PublicSiteSettings = { company: siteConfig.company, announcementMessages: siteConfig.announcement.messages, emergencyAvailable: true, analytics: { enabled: true } }
const SettingsContext = createContext<PublicSiteSettings>(defaultSettings)

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultSettings)
  useEffect(() => {
    let active = true
    fetch('/api/public/site-settings').then(async (response) => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load public settings.')
      if (!active) return
      const company = result.company_info ?? {}
      const banner = result.emergency_banner ?? {}
      const hours = result.operating_hours ?? {}
      const analytics = result.analytics ?? {}
      setSettings({
        company: { ...siteConfig.company, ...company },
        announcementMessages: banner.enabled && Array.isArray(banner.messages) && banner.messages.length ? banner.messages : [],
        emergencyAvailable: hours.emergency_available !== false,
        analytics: { gaMeasurementId: analytics.ga_measurement_id, metaPixelId: analytics.meta_pixel_id, enabled: analytics.tracking_enabled !== false },
      })
    }).catch(() => undefined)
    return () => { active = false }
  }, [])
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function useSiteSettings() { return useContext(SettingsContext) }
