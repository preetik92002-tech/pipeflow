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
        />
      )}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  return useContext(BookingModalContext)
}
