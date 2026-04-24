// ── LifebyDesign Analytics ────────────────────────────────────────────────────
// Mock implementation — logs to console in dev.
// To wire up a real service (PostHog / Mixpanel / GA4), replace the
// `dispatch()` body below. All event calls throughout the app stay identical.
//
// PostHog example:
//   import posthog from 'posthog-js'
//   posthog.capture(name, props)
//
// GA4 example:
//   window.gtag?.('event', name, props)
//
// Mixpanel example:
//   mixpanel.track(name, props)
// ─────────────────────────────────────────────────────────────────────────────

type EventProps = Record<string, string | number | boolean | null | undefined>

function dispatch(name: string, props?: EventProps) {
  if (typeof window === 'undefined') return        // SSR guard

  // ── Swap this block to wire in your real analytics provider ──────────────
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, props ?? {})
  }
  // ── PostHog (uncomment + add NEXT_PUBLIC_POSTHOG_KEY to .env.local) ───────
  // (window as any).posthog?.capture(name, props)

  // ── GA4 (uncomment + add gtag snippet to layout.tsx) ────────────────────
  // (window as any).gtag?.('event', name, { ...props })

  // ── Mixpanel (uncomment + call mixpanel.init() in layout.tsx) ────────────
  // (window as any).mixpanel?.track(name, props)
}

// ─────────────────────────────────────────────────────────────────────────────
// Named events — one function per event keeps callsites clean and lets you
// grep for every place an event fires.
// ─────────────────────────────────────────────────────────────────────────────

/** Onboarding funnel */
export const analytics = {
  // ── Onboarding ─────────────────────────────────────────────────────────
  onboardingStepCompleted: (step: number, label: string) =>
    dispatch('onboarding_step_completed', { step, label }),

  onboardingCompleted: () =>
    dispatch('onboarding_completed'),

  relationshipContextSaved: (duration: string, stage: string, focus: string) =>
    dispatch('relationship_context_saved', { duration, stage, focus }),

  // ── Daily engagement ────────────────────────────────────────────────────
  firstMoodLogged: () =>
    dispatch('first_mood_logged'),

  moodLogged: (partner: 'A' | 'B', intensity: number) =>
    dispatch('mood_logged', { partner, intensity }),

  habitToggled: (habitId: string, completed: boolean) =>
    dispatch('habit_toggled', { habitId, completed }),

  todoAdded: () =>
    dispatch('todo_added'),

  journalWritten: () =>
    dispatch('journal_written'),

  // ── Weekly ritual funnel ────────────────────────────────────────────────
  weeklyRitualStarted: () =>
    dispatch('weekly_ritual_started'),

  weeklyRitualStepCompleted: (step: number, label: string) =>
    dispatch('weekly_ritual_step_completed', { step, label }),

  weeklyRitualCompleted: (ritualsTotal: number) =>
    dispatch('weekly_ritual_completed', { rituals_total: ritualsTotal }),

  emotionDumpRefined: () =>
    dispatch('emotion_dump_refined'),

  emotionDumpShared: () =>
    dispatch('emotion_dump_shared'),

  scoring360Submitted: () =>
    dispatch('scoring_360_submitted'),

  templateLibraryOpened: (category?: string) =>
    dispatch('template_library_opened', { category }),

  templateSelected: (templateTitle: string, category: string) =>
    dispatch('template_selected', { template_title: templateTitle, category }),

  // ── Monetisation funnel ─────────────────────────────────────────────────
  premiumGateSeen: (source: string) =>
    dispatch('premium_gate_seen', { source }),

  premiumDemoActivated: (source: string) =>
    dispatch('premium_demo_activated', { source }),

  trialStarted: (plan: 'monthly' | 'yearly') =>
    dispatch('trial_started', { plan }),

  subscribeClicked: (plan: 'monthly' | 'yearly', source: string) =>
    dispatch('subscribe_clicked', { plan, source }),

  pricingPageViewed: (source: string) =>
    dispatch('pricing_page_viewed', { source }),

  valueWallSeen: () =>
    dispatch('value_wall_seen'),

  upgradeCtaClicked: (source: string) =>
    dispatch('upgrade_cta_clicked', { source }),

  // ── Retention ───────────────────────────────────────────────────────────
  streakAtRiskSeen: (streakDays: number) =>
    dispatch('streak_at_risk_seen', { streak_days: streakDays }),

  reminderOptIn: (channel: 'email' | 'push') =>
    dispatch('reminder_opt_in', { channel }),

  // ── Trust & privacy ─────────────────────────────────────────────────────
  privacyPageViewed: () =>
    dispatch('privacy_page_viewed'),

  dataExportRequested: () =>
    dispatch('data_export_requested'),
}

export default analytics
