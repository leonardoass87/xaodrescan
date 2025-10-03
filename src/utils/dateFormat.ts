export function formatDateInSaoPaulo(dateValue: string | Date | undefined | null): string {
    if (dateValue === undefined || dateValue === null) return '';
  
    const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(dateObj);
  
    return formatted.replace(/\//g, '-');
  }
  
  export function formatDateTimeInSaoPaulo(dateValue: string | Date): string {
    if (dateValue === undefined || dateValue === null) return '';
  
    const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(dateObj);
  
    return formatted.replace(',', '').replace(/\//g, '-');
  }