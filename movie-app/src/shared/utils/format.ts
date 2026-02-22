export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}
