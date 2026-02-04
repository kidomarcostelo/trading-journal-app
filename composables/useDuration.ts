export const useDuration = () => {
  const parseDate = (val: string | number | undefined): Date | null => {
    if (!val) return null;
    
    // Excel Serial Date
    if (!isNaN(Number(val)) && Number(val) > 20000) {
      return new Date((Number(val) - 25569) * 86400 * 1000);
    }
    
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return `${days}d ${remainingHours}h`;
  };

  const getDuration = (start: string | number | undefined, end: string | number | undefined, status?: string): string => {
    const startDate = parseDate(start);
    if (!startDate) return '--';

    let endDate: Date | null = null;

    if (status === 'Open') {
      endDate = new Date();
    } else {
      endDate = parseDate(end);
    }

    if (!endDate) return '--';

    const diff = endDate.getTime() - startDate.getTime();
    if (diff < 0) return '0d 0h';

    return formatDuration(diff);
  };

  return {
    getDuration
  };
};