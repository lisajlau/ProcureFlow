export const formatCurrency = (amount: number, currency: string = 'MYR'): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getDaysRemaining = (targetDateStr: string): { days: number; isPast: boolean; label: string } => {
  if (!targetDateStr) return { days: 0, isPast: false, label: '-' };
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = target - now;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return { days: Math.abs(days), isPast: true, label: `${Math.abs(days)} days overdue` };
  } else if (days === 0) {
    return { days: 0, isPast: false, label: 'Due today' };
  } else {
    return { days, isPast: false, label: `${days} days left` };
  }
};

export const getCTOSColor = (status: string, riskLevel?: string) => {
  if (status === 'Verified' || riskLevel === 'Low') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800'
    };
  }
  if (status === 'Pending' || riskLevel === 'Medium') {
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800'
    };
  }
  return {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800'
  };
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'High':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Medium':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Awarded':
    case 'Paid':
    case 'Fulfilled':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Quotes Received':
    case 'Under Evaluation':
    case 'Shortlisted':
    case 'Scheduled':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'RFQ Issued':
    case 'Sent':
    case 'Received':
    case 'Pending Approval':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Overdue':
    case 'Flagged':
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Draft':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
