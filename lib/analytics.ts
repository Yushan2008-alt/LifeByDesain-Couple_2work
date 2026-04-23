'use client'

import { useCallback } from 'react'

export type AnalyticsEventName =
  | 'onboarding_completed'
  | 'first_mood_logged'
  | 'first_weekly_completed'
  | 'trial_started'
  | 'subscribe_clicked'

export type AnalyticsPayload = {
  coupleId?: string
  weeklyCompletions?: number
  source?: string
  plan?: 'monthly' | 'yearly'
  value?: number
  [key: string]: string | number | boolean | undefined
}

type StoredEvent = {
  name: AnalyticsEventName
  payload: AnalyticsPayload
  timestamp: string
}

const STORAGE_KEY = 'lifebydesign-analytics-events'
// Keep localStorage light for demo usage while preserving enough history for funnel checks.
const MAX_STORED_EVENTS = 200
const MAX_EVENT_AGE_DAYS = 60

function isFreshEvent(timestamp: string) {
  const ageMs = Date.now() - new Date(timestamp).getTime()
  return ageMs <= MAX_EVENT_AGE_DAYS * 86_400_000
}

function readEvents(): StoredEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredEvent[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((event) => event?.timestamp && isFreshEvent(event.timestamp))
  } catch {
    return []
  }
}

function writeEvents(events: StoredEvent[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_STORED_EVENTS)))
}

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  const event: StoredEvent = {
    name,
    payload,
    timestamp: new Date().toISOString(),
  }

  const events = readEvents()
  events.push(event)
  writeEvents(events)

  // mock sink
  console.info('[analytics-mock]', event)
}

export function hasTrackedEvent(name: AnalyticsEventName) {
  return readEvents().some((event) => event.name === name)
}

export function useAnalytics() {
  const track = useCallback((name: AnalyticsEventName, payload: AnalyticsPayload = {}) => {
    trackEvent(name, payload)
  }, [])

  const trackOnce = useCallback((name: AnalyticsEventName, payload: AnalyticsPayload = {}) => {
    if (hasTrackedEvent(name)) return
    trackEvent(name, payload)
  }, [])

  return { track, trackOnce }
}
