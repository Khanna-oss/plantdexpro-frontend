import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Youtube } from 'lucide-react';

const EdibleBadge = ({ isEdible }) => {
  const bgColor = isEdible ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const textColor = isEdible ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300';
  const text = isEdible ? 'Edible' : 'Not Edible';
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

const ConfidenceMeter = ({ score }) => {
    const percentage = Math.round(score * 100);
    let barColor = 'bg-red-500';
    if (percentage > 50) barColor = 'bg-yellow-500';
    if (percentage > 80) barColor = 'bg-primary';

    return (
        <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence: {percentage}%</span>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1 overflow-hidden">
                <motion.div 
                  className={`${barColor} h-2.5 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

export const ResultCard = ({ plant, index }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  return (
    <motion.div 
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-56 w-full object-cover md:h-full md:w-64" 
            src={plant.imageUrl} 
            alt={`Image of ${plant.commonName}`} 
            loading="lazy"
          />
        </div>
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="uppercase tracking-wide text-sm text-primary dark:text-primary-light font-semibold">{plant.scientificName}</div>
              <h2 className="block mt-1 text-3xl leading-tight font-bold text-black dark:text-white">{plant.commonName}</h2>
            </div>
            <EdibleBadge isEdible={plant.isEdible} />
          </div>
          
          <p className="mt-4 text-gray-600 dark:text-gray-400">{plant.description}</p>
          
          {plant.isEdible && plant.edibleParts && plant.edibleParts.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Edible Parts:</h4>
              <p className="text-gray-600 dark:text-gray-400">{plant.edibleParts.join(', ')}</p>
            </div>
          )}

          <div className="mt-6">
            <ConfidenceMeter score={plant.confidenceScore} />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
              <Info size={16} /> Details
            </button>
            {plant.isEdible && (
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(plant.commonName)}+recipe`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                <Youtube size={16} /> Recipes
              </a>
            )}
             <button onClick={() => setIsFavorite(!isFavorite)} className={`ml-auto p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 ${isFavorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} aria-label="Save to Favorites">
              <Heart fill={isFavorite ? 'currentColor' : 'none'} size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
