interface EventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

/**
 * Placeholder analytics tracker.
 * Replace with your real provider (PostHog, Mixpanel, etc.) before going to production.
 */
export const trackEvent = (_data: EventData): void => {
  // no-op — real events are fired by the production analytics provider
};
