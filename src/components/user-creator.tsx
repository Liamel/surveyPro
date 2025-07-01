'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export default function UserCreator() {
  const { user, isLoaded } = useUser()
  const [isCreating, setIsCreating] = useState(false)
  const [isCreated, setIsCreated] = useState(false)

  useEffect(() => {
    if (isLoaded && user && !isCreated && !isCreating) {
      setIsCreating(true)
      
      fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.ok) {
            console.log('User created successfully in database')
            setIsCreated(true)
          } else {
            console.error('Failed to create user:', response.status, response.statusText)
          }
        })
        .catch(error => {
          console.error('Error creating user:', error)
        })
        .finally(() => {
          setIsCreating(false)
        })
    }
  }, [isLoaded, user, isCreated, isCreating])

  // This component doesn't render anything visible
  return null
} 