'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/agent/properties')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
