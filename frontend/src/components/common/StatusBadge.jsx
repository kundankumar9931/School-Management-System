import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'present', 'paid', 'success', 'published', 'passed'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['late', 'partially paid', 'scheduled', 'ongoing', 'partially_paid'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['inactive', 'absent', 'unpaid', 'overdue', 'failed', 'needs improvement'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['excused', 'draft', 'graduated'].includes(normalized)) {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status}
    </span>
  );
};
