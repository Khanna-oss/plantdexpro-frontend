import React from 'react';

export const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <svg
        className="animate-spin h-12 w-12 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="4"
        />
        <path
          d="M12 2C12 4.20914 10.2091 6 8 6C5.79086 6 4 4.20914 4 2C4 3.76213 4.63013 5.40578 5.75736 6.53301C6.88459 7.66024 8.52825 8.29037 10.2904 8.29037C12.4995 8.29037 14.3004 6.48951 14.3004 4.28037C14.3004 3.72824 14.1953 3.20108 14.004 2.72021"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Identifying Plant...</p>
    </div>
  );
};
