export const getCurrentOrgFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const orgCookie = cookies.find(cookie => cookie.trim().startsWith('orgSlug='));
  return orgCookie ? decodeURIComponent(orgCookie.split('=')[1] ?? '') : null;
};