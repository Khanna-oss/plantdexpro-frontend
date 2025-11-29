import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Youtube, ShieldAlert, CheckCircle2, Leaf, Sparkles, Stethoscope } from 'lucide-react';

const EdibleBadge = ({ isEdible }) => {
  const bgColor = isEdible ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40';
  const textColor = isEdible ? 'text-emerald-700 dark:text-emerald-200' : 'text-rose-700 dark:text-rose-200';
  const borderColor = isEdible ? 'border-emerald-200 dark:border-emerald-700' : 'border-rose-200 dark:border-rose-700';
  const text = isEdible ? 'Edible' : 'Not Edible';
  const Icon = isEdible ? CheckCircle2 : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${bgColor} ${textColor} ${borderColor} shadow-sm`}>
      <Icon size={16} />
      {text}
    </span>
  );
};

const ConfidenceMeter = ({ score }) => {
    const percentage = Math.round(score * 100);
    let barColor = 'bg-rose-500';
    if (percentage > 50) barColor = 'bg-amber-500';
    if (percentage > 80) barColor = 'bg-emerald-500';

    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} /> AI Match
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`${barColor} h-2 rounded-full shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                />
            </div>
        </div>
    );
};

export const ResultCard = ({ plant, index, originalImage }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [currentImage, setCurrentImage] = useState(plant.imageUrl || originalImage);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
      // Reset when plant changes
      setCurrentImage(plant.imageUrl || originalImage);
      setImgError(false);
  }, [plant.imageUrl, originalImage]);

  const renderList = (items) => items && items.length > 0 && (
    <ul className="text-sm space-y-1 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0"></span>
            <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row w-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      {/* Left Side: Immersive Image */}
      <div className="lg:w-[45%] h-80 lg:h-auto bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          src={imgError ? originalImage : currentImage}
          alt={`Image of ${plant.commonName}`}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/5"></div>
        
        <div className="absolute top-6 right-6 lg:hidden">
           <EdibleBadge isEdible={plant.isEdible} />
        </div>
        
        {/* Image Source Label */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] text-white/80 uppercase tracking-wider font-medium">
            {imgError ? 'Your Upload' : 'Reference Image'}
        </div>
      </div>
      
      {/* Right Side: Intelligent Content */}
      <div className="p-8 lg:p-12 flex-grow flex flex-col justify-between bg-white dark:bg-gray-900">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50">
                    {plant.scientificName}
                 </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-2">
                {plant.commonName}
              </h2>
            </div>
            <div className="hidden lg:block">
                <EdibleBadge isEdible={plant.isEdible} />
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-10">
             <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {plant.description}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
             {/* Edible Parts Card */}
             {plant.isEdible && plant.edibleParts && plant.edibleParts.length > 0 && (
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-sm mb-3 flex items-center gap-2">
                    <Leaf size={16} />
                    Edible Parts
                  </h4>
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                    {plant.edibleParts.join(', ')}
                  </p>
                </div>
             )}

             {/* Safety Warnings Card */}
             {((plant.toxicParts && plant.toxicParts.length > 0) || (plant.safetyWarnings && plant.safetyWarnings.length > 0)) && (
                 <div className="bg-rose-50/50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/30 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <h4 className="font-bold text-rose-800 dark:text-rose-200 text-sm mb-3 flex items-center gap-2">
                        <ShieldAlert size={16} /> 
                        Safety & Toxicity
                    </h4>
                    <div className="text-rose-700 dark:text-rose-300 font-medium">
                        {renderList(plant.toxicParts)}
                        {renderList(plant.safetyWarnings)}
                    </div>
                 </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
            <div className="max-w-xs">
                <ConfidenceMeter score={plant.confidenceScore} />
            </div>

            {/* Dynamic Video Section */}
            {plant.videos && plant.videos.length > 0 ? (
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        {plant.videoContext === 'recipes' ? <Youtube size={16} className="text-red-600"/> : <Stethoscope size={16} className="text-blue-600"/>}
                        {plant.videoContext === 'recipes' ? 'Curated Recipes' : 'Beneficial Uses & Care'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {plant.videos.map((v, i) => (
                            <a key={i} href={v.link} target="_blank" rel="noopener noreferrer" className="group/video relative bg-gray-100 dark:bg-gray-800/50 rounded-xl overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-emerald-500 dark:ring-offset-gray-900 transition-all">
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-90 group-hover/video:opacity-100 group-hover/video:scale-110 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/0 transition-colors"></div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded">
                                        Video
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">{v.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{v.channel}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            ) : (
                // Smart Fallback Button
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-start">
                     <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(plant.commonName)}+${plant.isEdible ? 'recipe' : 'benefits'}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5">
                        <Youtube size={20} /> 
                        Watch Videos on YouTube
                    </a>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};