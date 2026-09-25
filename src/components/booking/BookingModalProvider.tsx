'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import dynamic from 'next/dynamic'

type Category = 'plumbing' | 'hvac'
interface ServiceOption { id: string; name: string; category: Category; description: string }

interface BookingModalContextValue {
  openModal: (initialCategory?: Category) => void
  closeModal: () => void
  isOpen: boolean
}

const BookingModalContext = createContext<BookingModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
  isOpen: false,
})

// Lazy-load the heavy modal only when first opened
const PipeFlowBookingModal = dynamic(
  () => import('./PipeFlowBookingModal').then((m) => m.PipeFlowBookingModal),
  { ssr: false }
)

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialCategory, setInitialCategory] = useState<Category | undefined>(undefined)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [servicesError, setServicesError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetch('/api/public/services', { cache: 'no-store' }).then(async (response) => {
      const result: { services?: Array<{ id: string; title: string; slug: string; category: Category; short_description: string }>; error?: string } = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load the service list.')
      if (active) setServices((result.services ?? []).map((service) => ({ id: service.slug, name: service.title, category: service.category, description: service.short_description })))
    }).catch((error: unknown) => { if (active) setServicesError(error instanceof Error ? error.message : 'Unable to load the service list.') })
    return () => { active = false }
  }, [])

  const openModal = useCallback((cat?: Category) => {
    setInitialCategory(cat)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Handle URL deep-link: ?book=1
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('book') === '1') {
      openModal()
    }
  }, [openModal])

  return (
    <BookingModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      {isOpen && (
        <PipeFlowBookingModal
          isOpen={isOpen}
          onClose={closeModal}
          initialCategory={initialCategory}
          services={services}
          servicesError={servicesError}
        />
      )}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  return useContext(BookingModalContext)
}
