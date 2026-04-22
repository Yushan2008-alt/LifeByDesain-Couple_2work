import { redirect } from 'next/navigation'

// Root redirects to onboarding.
// Once both partners join, onboarding redirects to /dashboard.
export default function Home() {
  redirect('/onboarding')
}
