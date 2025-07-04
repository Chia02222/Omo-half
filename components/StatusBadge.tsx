
import React from 'react';
import { CandidateStatus } from '../types';

interface StatusBadgeProps {
  status: CandidateStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusStyles: Record<CandidateStatus, string> = {
    Pass: 'bg-green-100/60 text-green-700',
    Rejected: 'bg-red-100/60 text-red-700',
    Pending: 'bg-orange-100/60 text-orange-700',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-center text-xs px-3 py-1.5 rounded-md ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};
