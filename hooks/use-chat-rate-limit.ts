"use client"

import { useState, useEffect } from "react"

const DAILY_LIMIT = 20 // Fragen pro Person pro Tag
const STORAGE_KEY = "chat-usage"

type UsageData = {
  count: number
  date: string
}

export function useChatRateLimit() {
  const [remainingQuestions, setRemainingQuestions] = useState(DAILY_LIMIT)
  const [isLimitReached, setIsLimitReached] = useState(false)

  useEffect(() => {
    checkUsage()
  }, [])

  const checkUsage = () => {
    const today = new Date().toISOString().split("T")[0]
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      const data: UsageData = JSON.parse(stored)
      
      // Neuer Tag? Reset Counter
      if (data.date !== today) {
        const newData: UsageData = { count: 0, date: today }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
        setRemainingQuestions(DAILY_LIMIT)
        setIsLimitReached(false)
      } else {
        // Gleicher Tag - prüfe Limit
        const remaining = DAILY_LIMIT - data.count
        setRemainingQuestions(remaining)
        setIsLimitReached(remaining <= 0)
      }
    } else {
      // Erste Nutzung
      const newData: UsageData = { count: 0, date: today }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      setRemainingQuestions(DAILY_LIMIT)
      setIsLimitReached(false)
    }
  }

  const incrementUsage = () => {
    const today = new Date().toISOString().split("T")[0]
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      const data: UsageData = JSON.parse(stored)
      
      if (data.date === today) {
        data.count += 1
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        
        const remaining = DAILY_LIMIT - data.count
        setRemainingQuestions(remaining)
        setIsLimitReached(remaining <= 0)
      }
    }
  }

  const canSendMessage = () => {
    return !isLimitReached && remainingQuestions > 0
  }

  return {
    remainingQuestions,
    isLimitReached,
    canSendMessage,
    incrementUsage,
    dailyLimit: DAILY_LIMIT,
  }
}



