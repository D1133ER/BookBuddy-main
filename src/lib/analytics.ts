interface EventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export const trackEvent = (data: EventData) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[Analytics Event]', data);
  }
};
