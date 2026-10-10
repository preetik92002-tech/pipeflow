import { redirect } from 'next/navigation'

/**
 * /admin → redirect to /admin/dashboard
 * This prevents the 404 when navigating to /admin directly.
 */
export default function AdminIndexPage() {
  redirect('/admin/dashboard')
}
