'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFB]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6D0F2B] border-t-transparent mx-auto" />
        <p className="mt-4 text-gray-500 font-medium">Loading April...</p>
      </div>
    </div>
  )
  
}
