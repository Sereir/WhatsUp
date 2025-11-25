import * as Sentry from '@sentry/vue'

export function initSentry(){
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return
  
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES || '0.2'),
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  })
}

export function captureException(e){
  if (Sentry) Sentry.captureException(e)
}
