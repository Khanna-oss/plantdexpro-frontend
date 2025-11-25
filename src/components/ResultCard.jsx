
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
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Confidence</span>
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

  const renderList = (items, prefix) => items && items.length > 0 && (
    <ul className="text-sm list-disc list-inside space-y-1">
      {items.map((item, i) => <li key={i}>{prefix ? `${prefix}: ` : ''}{item}</li>)}
    </ul>
  );

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row w-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Image Section - Takes up 40% width on large screens for a "Feature" look */}
      <div className="md:w-2/5 lg:w-1/3 relative h-72 md:h-auto bg-gray-100 dark:bg-gray-900">
        <img
          className="w-full h-full object-cover"
          src={plant.imageUrl || originalImage}
          alt={`Image of ${plant.commonName}`}
          loading="lazy"
        />
        <div className="absolute top-4 right-4 md:hidden">
           <EdibleBadge isEdible={plant.isEdible} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden opacity-60"></div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 md:p-8 lg:p-10 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="uppercase tracking-wider text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-1">{plant.scientificName}</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">{plant.commonName}</h2>
            </div>
            <div className="hidden md:block">
                <EdibleBadge isEdible={plant.isEdible} />
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
             <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{plant.description}</p>
          </div>

          {plant.isEdible && plant.edibleParts && plant.edibleParts.length > 0 && (
            <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Edible Parts
              </h4>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">{plant.edibleParts.join(', ')}</p>
            </div>
          )}

          {((plant.toxicParts && plant.toxicParts.length > 0) || (plant.safetyWarnings && plant.safetyWarnings.length > 0)) && (
             <div className="mb-6 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
                <h4 className="font-bold text-red-800 dark:text-red-200 text-sm mb-2 flex items-center gap-2">
                    <ShieldAlert size={16} /> 
                    Safety Warnings
                </h4>
                <div className="text-red-700 dark:text-red-300">
                    {renderList(plant.toxicParts, "Toxic")}
                    {renderList(plant.safetyWarnings)}
                </div>
             </div>
          )}

          <div className="mb-8 max-w-md">
            <ConfidenceMeter score={plant.confidenceScore} />
          </div>
        </div>

        <div>
            <div className="flex flex-wrap items-center gap-4 mb-8">
                {plant.isEdible && (
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(plant.commonName)}+recipe`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    <Youtube size={20} /> 
                    Watch Recipes
                </a>
                )}
                
                <button className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Info size={20} /> 
                More Details
                </button>

                <button onClick={() => setIsFavorite(!isFavorite)} className={`p-3 rounded-full border transition-all ${isFavorite ? 'border-pink-200 bg-pink-50 text-pink-500 shadow-inner' : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`} aria-label="Save to Favorites">
                <Heart fill={isFavorite ? 'currentColor' : 'none'} size={22} />
                </button>
            </div>

            {/* Video Recommendations */}
            {plant.videos && plant.videos.length > 0 && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Curated Cooking Videos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plant.videos.map((v, i) => (
                            <a key={i} href={v.link} target="_blank" rel="noopener noreferrer" className="group block bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all">
                                <div className="aspect-video relative bg-gray-200 dark:bg-gray-800">
                                    {v.thumbnail ? (
                                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Youtube size={24} /></div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        <div className="bg-white/90 rounded-full p-2 text-red-600"><Youtube size={20} fill="currentColor" /></div>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{v.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{v.channel}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};
