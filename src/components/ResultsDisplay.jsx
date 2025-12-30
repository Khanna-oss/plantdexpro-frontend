
import React from 'react';
import { ResultCard } from './ResultCard.jsx';

export const ResultsDisplay = ({ results }) => {
  return (
    <div className="space-y-8 pb-12">
      {results.map((plant, index) => (
        <ResultCard 
          key={plant.scientificName || index} 
          plant={plant} 
          index={index + 1} 
        />
      ))}
    </div>
  );
};
