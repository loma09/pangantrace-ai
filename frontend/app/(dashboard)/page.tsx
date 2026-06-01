import { redirect } from 'next/navigation'

// The (dashboard) route group maps to `/` which conflicts with the landing page.
// Redirect to the first real dashboard page so the landing page owns `/`.
export default function DashboardRootRedirect() {
  redirect('/fraud')
}
