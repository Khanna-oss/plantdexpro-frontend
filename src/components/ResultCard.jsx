import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Youtube, ShieldAlert, CheckCircle2, Leaf, Sparkles, Stethoscope, ImageOff } from 'lucide-react';

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
  const [isFavorite, setIsFavorite] = useState(false);
  
  // --- 4-LAYER IMAGE FALLBACK LOGIC ---
  // 1. Wiki Image (High Res) -> 2. YouTube Thumbnail -> 3. API Image -> 4. User Upload
  const [imgSrc, setImgSrc] = useState(plant.imageUrl);
  const [fallbackLevel, setFallbackLevel] = useState(1);

  useEffect(() => {
      // Reset whenever plant changes
      // Priority: Wiki > YouTube > API > Original
      if (plant.imageUrl) {
          setImgSrc(plant.imageUrl);
          setFallbackLevel(1);
      } else if (plant.youtubeImage) {
          setImgSrc(plant.youtubeImage);
          setFallbackLevel(2);
      } else if (plant.apiImage) {
           setImgSrc(plant.apiImage);
           setFallbackLevel(3);
      } else {
           setImgSrc(originalImage);
           setFallbackLevel(4);
      }
  }, [plant, originalImage]);

  const handleImageError = () => {
      // Progressive degradation: If current fails, try next available
      if (fallbackLevel === 1 && plant.youtubeImage) {
          setImgSrc(plant.youtubeImage);
          setFallbackLevel(2);
      } else if (fallbackLevel <= 2 && plant.apiImage) {
          setImgSrc(plant.apiImage);
          setFallbackLevel(3);
      } else {
          setImgSrc(originalImage);
          setFallbackLevel(4);
      }
  };

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
      className="group relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      {/* LAYOUT FIX: CSS Grid. Image 50% width on desktop. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        
        {/* IMAGE SECTION */}
        <div className="relative bg-gray-100 dark:bg-black h-80 lg:h-auto overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            src={imgSrc}
            alt={`Image of ${plant.commonName}`}
            loading="lazy"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
          
          <div className="absolute top-6 right-6 lg:hidden">
             <EdibleBadge isEdible={plant.isEdible} />
          </div>
          
          {/* Source Label */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] text-white/90 uppercase tracking-wider font-bold flex items-center gap-1.5">
             {fallbackLevel === 1 && <span>Wikipedia Image</span>}
             {fallbackLevel === 2 && <span className="flex items-center gap-1"><Youtube size={10}/> Video Thumbnail</span>}
             {fallbackLevel === 3 && <span>Database Image</span>}
             {fallbackLevel === 4 && <span className="flex items-center gap-1"><ImageOff size={10}/> Your Photo</span>}
          </div>
        </div>
        
        {/* CONTENT SECTION */}
        <div className="p-8 lg:p-12 flex flex-col justify-between bg-white dark:bg-gray-900">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50 mb-3 inline-block">
                   {plant.scientificName}
                </span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                  {plant.commonName}
                </h2>
              </div>
              <div className="hidden lg:block transform scale-110">
                  <EdibleBadge isEdible={plant.isEdible} />
              </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                {plant.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
               {plant.isEdible ? (
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Leaf size={14} /> Edible Parts
                    </h4>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                      {plant.edibleParts.join(', ')}
                    </p>
                  </div>
               ) : (
                   <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                      <h4 className="font-bold text-rose-800 dark:text-rose-200 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                          <ShieldAlert size={14} /> Toxicity
                      </h4>
                      <div className="text-rose-700 dark:text-rose-300 text-sm font-medium">
                          {renderList(plant.toxicParts)}
                      </div>
                   </div>
               )}
               
               <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center">
                   <ConfidenceMeter score={plant.confidenceScore} />
               </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  {plant.videoContext === 'recipes' ? <Youtube size={16} className="text-red-600"/> : <Stethoscope size={16} className="text-blue-600"/>}
                  {plant.videoContext === 'recipes' ? 'Curated Recipes' : 'Beneficial Uses & Care'}
              </h3>

              {plant.videos && plant.videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {plant.videos.map((v, i) => (
                          <a key={i} href={v.link} target="_blank" rel="noreferrer" className="group/card block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-offset-1 hover:ring-emerald-500 transition-all">
                              <div className="aspect-video relative">
                                  <img src={v.thumbnail} className="w-full h-full object-cover" alt={v.title}/>
                                  <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/0 transition-colors"></div>
                                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded">Video</div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800/80">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1 group-hover/card:text-emerald-600 transition-colors">{v.title}</p>
                                  <p className="text-[10px] text-gray-500">{v.channel}</p>
                              </div>
                          </a>
                      ))}
                  </div>
              ) : (
                  <a href={`https://www.youtube.com/results?search_query=${plant.commonName}+${plant.isEdible ? 'recipe' : 'benefits'}`} target="_blank" className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                      <Youtube size={18} />
                      Find Videos on YouTube
                  </a>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};