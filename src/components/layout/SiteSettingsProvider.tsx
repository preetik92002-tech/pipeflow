'use client'

import { createContext, useContext } from 'react'
import { siteConfig } from '@/lib/config/site'
import type { PublicSiteSettingsBundle } from '@/lib/seo/metadata'

type PublicSiteSettings = PublicSiteSettingsBundle
const defaultSettings: PublicSiteSettings = { company: siteConfig.company, announcementMessages: siteConfig.announcement.messages, emergencyAvailable: true, analytics: { enabled: true } }
const SettingsContext = createContext<PublicSiteSettings>(defaultSettings)

/**
 * Settings are fetched once, server-side, in the root layout (which is
 * static/ISR-cached) and passed in as `initialSettings` — no client-side
 * fetch-on-mount. This removes the extra request and the fallback-value
 * flash that occurred while that request was in flight.
 */
export function SiteSettingsProvider({ children, initialSettings }: { children: React.ReactNode; initialSettings?: PublicSiteSettings }) {
  return <SettingsContext.Provider value={initialSettings ?? defaultSettings}>{children}</SettingsContext.Provider>
}

export function useSiteSettings() { return useContext(SettingsContext) }
