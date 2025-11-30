import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Youtube, ShieldAlert, CheckCircle2, Leaf, Sparkles, Stethoscope, ImageOff, Share2, Lightbulb } from 'lucide-react';

const EdibleBadge = ({ isEdible }) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isEdible ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
    {isEdible ? <CheckCircle2 size={14}/> : <ShieldAlert size={14}/>}
    {isEdible ? 'Edible' : 'Not Edible'}
  </span>
);

const ConfidenceMeter = ({ score }) => {
    const percentage = Math.round(score * 100);
    let barColor = percentage > 80 ? 'bg-emerald-500' : (percentage > 50 ? 'bg-yellow-500' : 'bg-red-500');
    return (
        <div className="w-full">
            <div className="flex justify-between mb-1 text-xs font-bold text-gray-500 uppercase">
                <span>AI Match</span><span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div className={`${barColor} h-2 rounded-full`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8 }} />
            </div>
        </div>
    );
};

export const ResultCard = ({ plant, index, originalImage }) => {
  const [imgSrc, setImgSrc] = useState(plant.imageUrl);
  const [fallbackLevel, setFallbackLevel] = useState(1);

  useEffect(() => {
      // Initial Image Priority
      if (plant.imageUrl) { setImgSrc(plant.imageUrl); setFallbackLevel(1); }
      else if (plant.youtubeImage) { setImgSrc(plant.youtubeImage); setFallbackLevel(2); }
      else if (plant.apiImage) { setImgSrc(plant.apiImage); setFallbackLevel(3); }
      else { setImgSrc(originalImage); setFallbackLevel(4); }
  }, [plant, originalImage]);

  const handleImageError = () => {
      if (fallbackLevel === 1 && plant.youtubeImage) { setImgSrc(plant.youtubeImage); setFallbackLevel(2); }
      else if (fallbackLevel <= 2 && plant.apiImage) { setImgSrc(plant.apiImage); setFallbackLevel(3); }
      else { setImgSrc(originalImage); setFallbackLevel(4); }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden w-full max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* IMAGE: Fixed Aspect Ratio 16:9 (Cinema) to prevent vertical stretching */}
        <div className="relative bg-gray-100 aspect-video lg:aspect-auto lg:h-full overflow-hidden">
          <img src={imgSrc} alt={plant.commonName} className="w-full h-full object-cover" onError={handleImageError} />
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] rounded font-bold uppercase">
             {fallbackLevel === 1 ? 'Wikipedia' : fallbackLevel === 4 ? 'Your Upload' : 'Reference'}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{plant.scientificName}</span>
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{plant.commonName}</h2>
                    </div>
                    <EdibleBadge isEdible={plant.isEdible} />
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{plant.description}</p>

                {plant.funFact && (
                    <div className="flex gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100 mb-6">
                        <Lightbulb size={18} className="text-amber-500 shrink-0"/>
                        <p className="text-sm text-amber-800 italic">"{plant.funFact}"</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {plant.isEdible ? (
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1 flex gap-1"><Leaf size={12}/> Edible Parts</h4>
                            <p className="text-sm text-emerald-700">{plant.edibleParts?.join(', ')}</p>
                        </div>
                    ) : (
                        <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                            <h4 className="text-xs font-bold text-rose-800 uppercase mb-1 flex gap-1"><ShieldAlert size={12}/> Toxicity</h4>
                            <p className="text-sm text-rose-700">{plant.toxicParts?.join(', ')}</p>
                        </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg"><ConfidenceMeter score={plant.confidenceScore} /></div>
                </div>
            </div>

            {/* VIDEOS */}
            <div className="border-t pt-6 border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    {plant.videoContext === 'recipes' ? <Youtube size={14} className="text-red-600"/> : <Stethoscope size={14} className="text-blue-600"/>}
                    {plant.videoContext === 'recipes' ? 'Recipes' : 'Uses & Care'}
                </h3>
                {plant.videos?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {plant.videos.slice(0, 2).map((v, i) => (
                            <a key={i} href={v.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
                                <div className="w-20 h-12 bg-gray-200 rounded shrink-0 overflow-hidden"><img src={v.thumbnail} className="w-full h-full object-cover"/></div>
                                <div className="min-w-0"><p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-600">{v.title}</p></div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <a href={`https://www.youtube.com/results?search_query=${plant.commonName}+${plant.isEdible ? 'recipe' : 'benefits'}`} target="_blank" className="text-sm font-bold text-blue-600 hover:underline">Search on YouTube &rarr;</a>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};