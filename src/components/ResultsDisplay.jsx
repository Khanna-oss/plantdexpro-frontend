import React from 'react';
import { ResultCard } from './ResultCard';

export const ResultsDisplay = ({ results }) => {
  return (
    <div className="space-y-8">
      {results.map((plant, index) => (
        <ResultCard key={plant.id || index} plant={plant} index={index + 1}/>
      ))}
    </div>
  );
};
