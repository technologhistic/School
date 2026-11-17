import React from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { formatSchoolDate } from '../../utils/bsDate';

export const DateDisplay: React.FC<{ date: string; className?: string }> = ({
  date,
  className = '',
}) => {
  const calendarMode = useSchoolStore((s) => s.calendarMode);
  const language = useSchoolStore((s) => s.language);
  return (
    <span className={`tabular-nums ${className}`}>
      {formatSchoolDate(date, calendarMode, language)}
    </span>
  );
};
