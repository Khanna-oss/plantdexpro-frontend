import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Youtube, ShieldAlert, CheckCircle2 } from 'lucide-react';

const EdibleBadge = ({ isEdible }) => {
  const bgColor = isEdible ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const textColor = isEdible ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300';
  const borderColor = isEdible ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800';
  const text = isEdible ? 'Edible' : 'Not Edible';
  const Icon = isEdible ? CheckCircle2 : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${bgColor} ${textColor} ${borderColor}`}>
      <Icon size={16} />
      {text}
    </span>
  );
};

const ConfidenceMeter = ({ score }) => {
    const percentage = Math.round(score * 100);
    let barColor = 'bg-red-500';
    if (percentage > 50) barColor = 'bg-yellow-500';
    if (percentage > 80) barColor = 'bg-emerald-500';

    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Match</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className={`${barColor} h-2.5 rounded-full shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

export const ResultCard = ({ plant, index, originalImage }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Fallback Logic: If plant.imageUrl (Wiki/API) is missing, use originalImage (User upload)
  const displayImage = plant.imageUrl || originalImage;

  const renderList = (items, prefix) => items && items.length > 0 && (
    <ul className="text-sm list-disc list-inside space-y-1">
      {items.map((item, i) => <li key={i}>{prefix ? `${prefix}: ` : ''}{item}</li>)}
    </ul>
  );

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row w-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Left Side: Image - Takes 40% width on desktop for full screen feel */}
      <div className="lg:w-2/5 h-72 lg:h-auto bg-gray-100 dark:bg-gray-900 relative overflow-hidden group">
        <img
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
          src={displayImage}
          alt={`Image of ${plant.commonName}`}
          loading="lazy"
          onError={(e) => {
            // Critical Fallback: If Wiki/API image 404s, swap to user upload immediately
            if (e.currentTarget.src !== originalImage) {
                e.currentTarget.src = originalImage;
            }
          }}
        />
        <div className="absolute top-4 right-4 lg:hidden">
           <EdibleBadge isEdible={plant.isEdible} />
        </div>
      </div>
      
      {/* Right Side: Content */}
      <div className="p-6 md:p-8 lg:p-10 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="uppercase tracking-widest text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">{plant.scientificName}</div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">{plant.commonName}</h2>
            </div>
            <div className="hidden lg:block transform scale-110 origin-top-right">
                <EdibleBadge isEdible={plant.isEdible} />
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
             <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{plant.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             {/* Edible Parts Box */}
             {plant.isEdible && plant.edibleParts && plant.edibleParts.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-sm mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Edible Parts
                  </h4>
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium">{plant.edibleParts.join(', ')}</p>
                </div>
             )}

             {/* Safety Warnings Box */}
             {((plant.toxicParts && plant.toxicParts.length > 0) || (plant.safetyWarnings && plant.safetyWarnings.length > 0)) && (
                 <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-800/30">
                    <h4 className="font-bold text-red-800 dark:text-red-200 text-sm mb-2 flex items-center gap-2">
                        <ShieldAlert size={18} /> 
                        Safety Warnings
                    </h4>
                    <div className="text-red-700 dark:text-red-300 font-medium">
                        {renderList(plant.toxicParts, "Toxic")}
                        {renderList(plant.safetyWarnings)}
                    </div>
                 </div>
             )}
          </div>

          <div className="mb-8 max-w-xs">
            <ConfidenceMeter score={plant.confidenceScore} />
          </div>
        </div>

        {/* Recipe Section - Always attempts to show if videos exist */}
        {plant.videos && plant.videos.length > 0 ? (
        <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Youtube size={16} className="text-red-600"/> 
                Curated Recipes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {plant.videos.map((v, i) => (
                    <a key={i} href={v.link} target="_blank" rel="noopener noreferrer" className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:ring-2 hover:ring-emerald-500 transition-all shadow-sm hover:shadow-md">
                        <div className="aspect-video relative bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            {v.thumbnail ? (
                                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Youtube size={32} /></div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <div className="bg-white/90 rounded-full p-3 text-red-600 shadow-lg"><Youtube size={24} fill="currentColor" /></div>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1">{v.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{v.channel}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
        ) : (
            // Fallback Recipe Button if API didn't return videos
            plant.isEdible && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(plant.commonName)}+recipe`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                        <Youtube size={20} /> 
                        Find Recipes for {plant.commonName}
                    </a>
                </div>
            )
        )}
      </div>
    </motion.div>
  );
};