import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Identifying Plant...</p>
    </div>
  );
};