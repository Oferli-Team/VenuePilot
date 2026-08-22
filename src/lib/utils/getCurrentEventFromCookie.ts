export const getCurrentEventFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const eventCookie = cookies.find(cookie => cookie.trim().startsWith('eventSlug='));
  return eventCookie ? decodeURIComponent(eventCookie.split('=')[1] ?? '') : null;
};

export const setEventInCookie = (eventSlug: string) => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `eventSlug=${eventSlug}; path=/`;
};

export const clearEventFromCookie = () => {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'eventSlug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}; 