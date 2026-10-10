'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_NAVIGATION, type Navigation } from '@/lib/cms-pages/navigation-schema'

const NavigationContext = createContext<Navigation>(DEFAULT_NAVIGATION)

export function NavigationProvider({ navigation, children }: { navigation: Navigation; children: React.ReactNode }) {
  return <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
}

export const useNavigation = () => useContext(NavigationContext)
