// Server component wrapper — required by Next.js output: 'export' for dynamic routes.
// Data fetching happens here; interactivity is in CreatorPage (client component).
// When backend is ready: replace getCreatorProfile/getCreatorPosts with real fetch() calls.
import CreatorPage from '@/components/creator/CreatorPage'
import { CREATOR_IDS } from '@/lib/api'

export function generateStaticParams() {
  // Must match CREATOR_IDS in lib/api.ts
  return CREATOR_IDS.map(id => ({ id }))
}

export default function CreatorRoute({ params }: { params: { id: string } }) {
  return <CreatorPage id={params.id} />
}
