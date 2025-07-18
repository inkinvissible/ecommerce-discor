'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación del lado del cliente como respaldo
    const token = localStorage.getItem('token') ||
        document.cookie.includes('token=')

    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirigiendo...</p>
        </div>
      </div>
  )
}