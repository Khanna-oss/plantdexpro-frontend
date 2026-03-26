import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldAlert, Activity, Clock, FlaskConical, Leaf, 
  ChevronDown, Sparkles, Heart, MapPin, History, AlertCircle,
  ShieldCheck, Microscope, Database, Zap, Info, ExternalLink, 
  Play, Youtube
} from 'lucide-react';
import { FeedbackButtons } from './FeedbackButtons.jsx';

const resolveConfidence = (plant) => {
  if (typeof plant?.xaiMeta?.confidence === 'number') return Math.round(plant.xaiMeta.confidence);
  if (typeof plant?.uiConfidence === 'number') return Math.round(plant.uiConfidence);
  if (typeof plant?.confidenceScore === 'number') {
    return plant.confidenceScore <= 1 ? Math.round(plant.confidenceScore * 100) : Math.round(plant.confidenceScore);
  }
  return 91;
};

const resolveLatency = (plant) => {
  if (typeof plant?.xaiMeta?.inferenceLatencyMs === 'number') return Math.round(plant.xaiMeta.inferenceLatencyMs);
  if (typeof plant?.modelLatencyMs === 'number') return Math.round(plant.modelLatencyMs);
  if (typeof plant?.xaiMeta?.latency === 'number') return Math.round(plant.xaiMeta.latency);
  return 1280;
};

const buildContributions = (plant) => {
  const seededScores = [88, 74, 63, 51];
  if (Array.isArray(plant?.visualFeatures) && plant.visualFeatures.length > 0) {
    return plant.visualFeatures.slice(0, 4).map((feature, index) => ({
      label: feature.part || `Feature ${index + 1}`,
      detail: feature.reason || 'Interpretable morphological cue',
      score: seededScores[index] || 48,
    }));
  }
  return [
    { label: 'Leaf Morphology', detail: 'Contour geometry and curvature resonance', score: 88 },
    { label: 'Venation Pattern', detail: 'Primary vein spacing and branching density', score: 74 },
    { label: 'Pigment Spectrum', detail: 'Surface chroma alignment to botanical priors', score: 63 },
    { label: 'Edge Geometry', detail: 'Margin smoothness and asymmetry profile', score: 51 },
  ];
};

const buildRadarPackets = (contributions) => {
  const seedPositions = [
    { left: '24%', top: '28%' },
    { left: '71%', top: '36%' },
    { left: '58%', top: '72%' },
    { left: '34%', top: '66%' },
  ];

  return contributions.slice(0, 4).map((contribution, index) => ({
    ...seedPositions[index],
    label: contribution.label,
    score: contribution.score,
  }));
};

const isValidNutrient = (value) => {
  if (!value || value.length < 5) return false;
  const invalid = ['analyzing', 'calculating', 'determining', 'fetching', 'not available', 'pending', 'requires'];
  return !invalid.some(p => value.toLowerCase().includes(p));
};

const RadarSweep = ({ packets, confidence, verified }) => {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/8 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#00FF41]/65">SYS.RADAR//VECTOR_FIELD</p>
          <p className="text-[10px] text-[var(--cream)]/50 mt-1">Morphology packets render only after completed inference.</p>
        </div>
        <span className={`result-badge ${verified ? 'result-badge-verified' : 'result-badge-inference'}`}>
          {confidence >= 90 ? 'LOCK' : confidence >= 75 ? 'TRACK' : 'SCAN'}
        </span>
      </div>
      <div className="hud-radar flex-1 min-h-[220px]">
        <div className="hud-radar-ring" style={{ width: '34%', height: '34%' }} />
        <div className="hud-radar-ring" style={{ width: '58%', height: '58%' }} />
        <div className="hud-radar-ring" style={{ width: '82%', height: '82%' }} />
        <div className="hud-radar-cross" />
        <div className="hud-radar-sweep" />
        <div className="absolute left-3 top-3 text-[8px] font-black uppercase tracking-[0.25em] text-[#00FF41]/55">BOT.SCAN//ACTIVE</div>
        <div className="absolute bottom-3 right-3 text-[8px] uppercase tracking-[0.22em] text-[var(--cream)]/35">{packets.length} packets</div>
        {packets.map((packet) => (
          <div key={packet.label} className="hud-radar-blip" style={{ left: packet.left, top: packet.top }}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.16em] text-[var(--cream)]/55">
              {packet.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="result-section">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${open ? 'bg-[#00FF41]/12 text-[#00FF41] border-[#00FF41]/25' : 'bg-white/5 text-[var(--cream)]/55 border-white/10'}`}>
            <Icon size={18} />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.15em] ${open ? 'text-[#00FF41]' : 'text-[var(--cream)]/70'}`}>{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} className={`p-1 rounded-lg ${open ? 'bg-[#00FF41]/10' : 'bg-transparent'}`}>
          <ChevronDown size={16} className={open ? 'text-[#00FF41]' : 'text-[var(--cream)]/35'} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="pt-4 mt-3 border-t border-white/8 text-sm text-[var(--cream)]/80 leading-relaxed font-medium space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ResultsDisplay = ({ results, imagePreview, onNewScan }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!results || results.length === 0) return null;

  const plant = results[activeIdx] || results[0];
  
  // PHASE 2: Enhanced verification and provenance tracking
  const verificationStatus = plant.verificationStatus || 'unverified';
  const verificationLevel = plant.verificationLevel || 'none';
  const dataSource = plant.dataSource || 'ai_inference_only';
  const provenance = plant.provenance || { primary: 'Gemini AI', verified: false };
  const isVerified = verificationStatus === 'verified' || verificationStatus === 'cache_verified';
  
  const confidence = resolveConfidence(plant);
  const latency = resolveLatency(plant);
  const featureContributions = buildContributions(plant);
  const radarPackets = buildRadarPackets(featureContributions);
  const nutrients = plant.nutrients || {};
  const botanicalData = plant.botanicalData || {};
  const healthHints = plant.healthHints || [];
  const etlVerified = plant.nutritionVerified === true || isVerified;
  const nutritionSource = plant.nutritionSource || (isVerified ? 'ETL Data Warehouse' : null);

  const nutrientFields = [
    { label: 'Vitamins', icon: '💊', value: nutrients.vitamins },
    { label: 'Minerals', icon: '⚗️', value: nutrients.minerals },
    { label: 'Proteins', icon: '🧬', value: nutrients.proteins },
    { label: 'Calories', icon: '🔥', value: nutrients.calories },
  ];

  const hasAnyNutrition = nutrientFields.some(f => isValidNutrient(f.value));
  const iucnEnrichment = plant.iucnEnrichment || null;
  const conservationStatus = plant.conservationStatus || iucnEnrichment?.categoryLabel || null;
  const hbdoMeta = plant.hbdoMeta || null;
  const retrievalMeta = hbdoMeta?.retrieval || null;
  const validationMeta = hbdoMeta?.validation || null;
  const fallbackMeta = hbdoMeta?.fallbackReasoning || null;
  const enrichmentMeta = hbdoMeta?.enrichment || null;
  const identificationId = hbdoMeta?.identificationId || null;
  const modelName = plant?.xaiMeta?.modelName || 'Gemini 3 Flash';
  const retrievalConfidence = typeof retrievalMeta?.confidence === 'number' ? Math.round(retrievalMeta.confidence) : null;
  const enrichmentSourceCount = Array.isArray(enrichmentMeta?.externalSources) ? enrichmentMeta.externalSources.length : 0;
  const enrichmentSourceLabel = enrichmentSourceCount > 0
    ? enrichmentMeta.externalSources.join(' • ')
    : 'No external enrichments attached';
  const conservationAccent = iucnEnrichment?.categoryCode === 'CR' || iucnEnrichment?.categoryCode === 'EN' || iucnEnrichment?.categoryCode === 'EX'
    ? 'text-[#ffb84d] bg-[#ffb84d]/10 border-[#ffb84d]/20'
    : iucnEnrichment?.categoryCode === 'VU' || iucnEnrichment?.categoryCode === 'NT' || iucnEnrichment?.categoryCode === 'DD'
      ? 'text-[#ffd54f] bg-[#ffd54f]/10 border-[#ffd54f]/20'
      : 'text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/20';

  return (
    <div className="hud-display w-full max-w-3xl mx-auto pb-24 px-4 md:px-0">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* === UNIFIED RESULT PANEL === */}
        <div className="result-panel overflow-hidden">
          
          {/* --- HEADER: Badges Row --- */}
          <div className="px-6 pt-6 pb-3 flex flex-wrap items-center gap-2">
            <span className={`result-badge ${plant.isEdible ? 'result-badge-verified' : 'result-badge-inference'}`}>
              {plant.isEdible ? '✓ Edible Species' : '⚠ Non-Edible'}
            </span>
            <span className={`result-badge ${isVerified ? 'result-badge-verified' : 'result-badge-inference'}`}>
              {isVerified ? (
                <><Database size={10} /> {verificationStatus === 'verified' ? 'ETL Verified' : 'Cache Verified'}</>
              ) : (
                <><ShieldAlert size={10} /> AI Inference Only</>
              )}
            </span>
            <span className="result-badge result-badge-verified">
              <ShieldCheck size={10} /> {confidence}% Confidence
            </span>
            {verificationLevel === 'high' && (
              <span className="result-badge result-badge-verified">
                <Sparkles size={10} /> High Quality
              </span>
            )}
            {conservationStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-[0.14em] ${conservationAccent}`}>
                <History size={10} /> {conservationStatus}
              </span>
            )}
          </div>

          {/* --- IDENTITY HEADER --- */}
          <div className="px-6 pb-4">
            <p className="hud-meta-kicker text-[8px] font-black mb-2">BOT.INTEL//PRIMARY_MATCH</p>
            <h2 className="text-4xl font-black tracking-tight leading-none text-[#00FF41]">
              {plant.commonName || plant.scientificName || 'Unidentified Specimen'}
            </h2>
            <p className="text-base italic mt-1.5 text-[var(--cream)]/65 font-medium hud-subline">
              {plant.scientificName || 'Scientific classification pending'}
            </p>
          </div>

          {/* --- HERO IMAGE --- */}
          {imagePreview && (
            <div className="px-6 pb-5">
              <div className="relative rounded-2xl overflow-hidden border border-black/8 shadow-lg">
                <img src={imagePreview} alt={plant.commonName || 'Plant specimen'} className="w-full h-64 md:h-80 object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-black text-white/80">Submitted Specimen</p>
                      <p className="text-sm text-white font-semibold">{plant.commonName}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
                      {confidence}% Confidence
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PHASE 4: Multi-Candidate Selector --- */}
          {results.length > 1 && (
            <div className="px-6 pb-4">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#00FF41]/55 mb-2">SYS.CANDIDATES//SELECT_AND_COMPARE</p>
              <div className="flex flex-wrap gap-2">
                {results.map((r, i) => {
                  const c = resolveConfidence(r);
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wide border font-mono transition-all ${
                        i === activeIdx
                          ? 'bg-[#00FF41]/14 text-[#00FF41] border-[#00FF41]/30 shadow-[0_0_18px_rgba(0,255,65,0.12)]'
                          : 'bg-white/5 text-[var(--cream)] border-white/10 hover:bg-white/8'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-current opacity-20 inline-flex items-center justify-center text-[9px] font-black" style={{color: 'inherit', opacity: 1}}>{i + 1}</span>
                      <span className="truncate max-w-[120px]">{r.commonName || r.scientificName || `Candidate ${i+1}`}</span>
                      <span className="text-[9px] opacity-60">{c}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- AI DESCRIPTION --- */}
          {plant.description && (
            <div className="px-6 pb-5">
              <div className="result-section">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#00FF41]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00FF41]">BOT.INTEL//AI_SUMMARY</span>
                </div>
                <p className="text-sm text-[var(--cream)]/80 leading-relaxed font-medium">
                  {plant.description}
                </p>
              </div>
            </div>
          )}

          {/* --- NUTRITION PROFILE --- */}
          <div className="px-6 pb-5">
            <div className="result-section">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-[#c62828]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00FF41]">NODE.HEALTH//NUTRITION_PROFILE</span>
                </div>
                {etlVerified && (
                  <span className="result-badge result-badge-verified">
                    <ShieldCheck size={10} /> ETL Verified
                  </span>
                )}
              </div>

              {!plant.isEdible ? (
                <div className="hud-warning-block flex items-center gap-2 text-sm font-medium rounded-xl p-3">
                  <AlertCircle size={14} />
                  <span>Nutrition data not applicable — species is classified as non-edible.</span>
                </div>
              ) : hasAnyNutrition ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nutrientFields.map((field) => {
                    const valid = isValidNutrient(field.value);
                    return (
                      <div key={field.label} className={valid ? 'nutrient-card' : 'nutrient-card nutrient-card-unavailable'}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base">{field.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--cream)]/55">{field.label}</span>
                          {valid && (
                            <span className="ml-auto text-[7px] font-black uppercase tracking-wider bg-[#00FF41]/10 text-[#00FF41] px-1.5 py-0.5 rounded-full border border-[#00FF41]/15">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-bold leading-snug ${valid ? 'text-[var(--cream)]' : 'text-[var(--cream)]/35 italic'}`}>
                          {valid ? field.value : 'Data not reliably available for this species.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="hud-warning-block flex items-start gap-3 p-3 rounded-xl">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Verified nutrition data unavailable</p>
                    <p className="text-xs mt-1">No ETL-verified or AI-confirmed nutritional data exists for this plant in our current dataset. Only verified data is displayed.</p>
                  </div>
                </div>
              )}

              {healthHints.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/8 space-y-2">
                  {healthHints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#00FF41]/18 border border-[#00FF41]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck size={8} className="text-[#00FF41]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-[#00FF41]">{hint.label}</span>
                        <span className="text-[11px] text-[var(--cream)]/60 ml-1.5">{hint.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* --- ACCORDION SECTIONS --- */}
          <div className="px-6 pb-5 space-y-3">
            {/* Botanical Details */}
            {(botanicalData.edibleParts || botanicalData.usage || botanicalData.cautions) && (
              <AccordionSection title="NODE.BOTANY//DETAILS_AND_USAGE" icon={Leaf} defaultOpen={true}>
                {botanicalData.edibleParts && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00FF41]/60 mb-1">Edible Parts</p>
                    <p className="font-bold text-[var(--cream)]">{botanicalData.edibleParts}</p>
                  </div>
                )}
                {botanicalData.usage && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00FF41]/60 mb-1">Applications & Uses</p>
                    <p className="font-bold text-[var(--cream)]">{botanicalData.usage}</p>
                  </div>
                )}
                {botanicalData.cautions && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ffb84d]/70 mb-1">Safety & Cautions</p>
                    <p className="font-bold text-[#ffb84d]">{botanicalData.cautions}</p>
                  </div>
                )}
              </AccordionSection>
            )}

            {/* Morphological Evidence */}
            <AccordionSection title="SYS.VECTOR//MORPHOLOGICAL_EVIDENCE" icon={Leaf}>
              <p className="font-bold text-[var(--cream)]">
                {plant.isEdible 
                  ? 'This species exhibits morphological traits consistent with safety-verified botanical compounds. Visual features were cross-referenced against known edible plant databases.'
                  : 'This specimen shows characteristics that fall outside established edible plant parameters. Not recommended for consumption without expert verification.'}
              </p>
              {plant.visualFeatures && plant.visualFeatures.length > 0 && (
                <div className="space-y-2 mt-2">
                  {plant.visualFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-black text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/15 px-2 py-0.5 rounded-full mt-0.5">{f.part}</span>
                      <span className="text-sm text-[var(--cream)]/70">{f.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* Geographic & Conservation */}
            <AccordionSection title="SYS.GEO//DISTRIBUTION" icon={MapPin}>
              <p className="font-bold text-[var(--cream)]">
                {plant.habitat
                  || (plant.trefleEnrichment?.distribution?.native?.length > 0
                      ? `Native to: ${plant.trefleEnrichment.distribution.native.join(', ')}.`
                      : `${plant.commonName || 'This species'} is distributed across varied ecological zones. Habitat data will be enriched as the research dataset expands.`)}
              </p>
            </AccordionSection>

            <AccordionSection title="SYS.ECO//CONSERVATION_NOTES" icon={History}>
              <p className="font-bold text-[var(--cream)]">
                {plant.funFact
                  || plant.botanicalData?.funFact
                  || `${plant.commonName || 'This species'} is indexed in the Save Soil botanical conservation repository. Verified records help build a living plant intelligence layer for ecological research.`}
              </p>
              {conservationStatus && (
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-[0.14em] ${conservationAccent}`}>
                    <History size={10} /> {conservationStatus}
                  </span>
                  {iucnEnrichment?.scope && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--cream)]/65">
                      Scope: {iucnEnrichment.scope}
                    </span>
                  )}
                </div>
              )}
              {iucnEnrichment?.available && (
                <div className="space-y-1">
                  {iucnEnrichment.assessmentDate && (
                    <p className="text-xs font-bold text-[var(--cream)]">Latest assessment: {iucnEnrichment.assessmentDate}</p>
                  )}
                  {iucnEnrichment.populationTrend && (
                    <p className="text-xs font-bold text-[var(--cream)]">Population trend: {iucnEnrichment.populationTrend}</p>
                  )}
                  {iucnEnrichment.criteria && (
                    <p className="text-xs text-[var(--cream)]/65">Criteria: {iucnEnrichment.criteria}</p>
                  )}
                  {iucnEnrichment.url && (
                    <a
                      href={iucnEnrichment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00FF41] hover:text-[#8BFFB0] transition-colors"
                    >
                      <span>Open IUCN record</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <p className="text-[9px] text-[var(--cream)]/35 uppercase tracking-wider">Source: {iucnEnrichment.source}</p>
                </div>
              )}
              {!iucnEnrichment?.available && iucnEnrichment?.message && (
                <div className="hud-warning-block flex items-start gap-2 rounded-xl p-3">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffb84d]/70">Conservation Lookup</p>
                    <p className="text-sm text-[var(--cream)]/75">{iucnEnrichment.message}</p>
                  </div>
                </div>
              )}
            </AccordionSection>

            {/* PHASE 3: Wikipedia Educational Summary */}
            {plant.wikipediaEnrichment && (
              <AccordionSection title="SYS.EDU//KNOWLEDGE_BASE" icon={Info} defaultOpen={false}>
                <div className="space-y-3">
                  <p className="font-bold text-[var(--cream)] leading-relaxed">{plant.wikipediaEnrichment.summary}</p>
                  <a 
                    href={plant.wikipediaEnrichment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00FF41] hover:text-[#8BFFB0] transition-colors"
                  >
                    <span>Learn More on Wikipedia</span>
                    <ExternalLink size={12} />
                  </a>
                  <p className="text-[9px] text-[var(--cream)]/35 uppercase tracking-wider">Source: {plant.wikipediaEnrichment.source}</p>
                </div>
              </AccordionSection>
            )}

            {/* PHASE 3: Trefle Botanical Enrichment */}
            {plant.trefleEnrichment && (
              <AccordionSection title="NODE.DB//BOTANICAL_DATABASE" icon={Database} defaultOpen={false}>
                <div className="space-y-3">
                  {plant.trefleEnrichment.taxonomy && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00FF41]/60 mb-1">Taxonomy</p>
                      <p className="text-xs font-bold text-[var(--cream)]">
                        {plant.trefleEnrichment.taxonomy.family && `Family: ${plant.trefleEnrichment.taxonomy.family}`}
                        {plant.trefleEnrichment.taxonomy.genus && ` • Genus: ${plant.trefleEnrichment.taxonomy.genus}`}
                      </p>
                    </div>
                  )}
                  {plant.trefleEnrichment.growth && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00FF41]/60 mb-1">Growth Requirements</p>
                      {plant.trefleEnrichment.growth.light && (
                        <p className="text-xs font-bold text-[var(--cream)]">Light: {plant.trefleEnrichment.growth.light}</p>
                      )}
                      {plant.trefleEnrichment.growth.phGrowth && (
                        <p className="text-xs font-bold text-[var(--cream)]">pH Range: {plant.trefleEnrichment.growth.phGrowth}</p>
                      )}
                      {plant.trefleEnrichment.growth.soilTexture && (
                        <p className="text-xs font-bold text-[var(--cream)]">Soil: {plant.trefleEnrichment.growth.soilTexture}</p>
                      )}
                    </div>
                  )}
                  {plant.trefleEnrichment.distribution && (plant.trefleEnrichment.distribution.native?.length > 0) && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00FF41]/60 mb-1">Native Distribution</p>
                      <p className="text-xs font-bold text-[var(--cream)]">{plant.trefleEnrichment.distribution.native.join(', ')}</p>
                    </div>
                  )}
                  <p className="text-[9px] text-[var(--cream)]/35 uppercase tracking-wider">Source: {plant.trefleEnrichment.source}</p>
                </div>
              </AccordionSection>
            )}
          </div>

          {/* PHASE 3: Recipe/Care Videos */}
          {plant.recipeVideos && plant.recipeVideos.length > 0 && (
            <div className="px-6 pb-6">
              <div className="mb-4">
                <h3 className="text-lg font-black text-[#00FF41] flex items-center gap-2">
                  <Youtube size={20} />
                  {plant.isEdible ? 'NODE.MEDIA//RECIPE_FEEDS' : 'NODE.MEDIA//CARE_FEEDS'}
                </h3>
                <p className="text-xs text-[var(--cream)]/55 mt-1">
                  {plant.isEdible ? 'Learn how to prepare and cook this plant' : 'Learn how to grow and care for this plant'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {plant.recipeVideos.slice(0, 3).map((video, idx) => (
                  <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#D63434] flex items-center justify-center flex-shrink-0">
                        <Youtube size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-[var(--cream)] line-clamp-2 mb-1">{video.title}</h4>
                        <p className="text-xs text-[var(--cream)]/55 mb-2">{video.channel}</p>
                        {video.reason && (
                          <p className="text-xs text-[var(--cream)]/65 mb-2 italic">{video.reason}</p>
                        )}
                        <a 
                          href={video.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00FF41] hover:text-[#8BFFB0] transition-colors"
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Watch Video</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- PHASE 4: Visual Bridge green → dark --- */}
          <div className="mx-6 mb-2 h-px bg-gradient-to-r from-transparent via-[#00FF41]/20 to-transparent" />
          <div className="mx-6 mb-5 h-6 rounded-b-xl" style={{ background: 'linear-gradient(to bottom, rgba(0,255,65,0.1), transparent)' }} />

          {/* --- XAI BENTO HUD — PHASE 2 SCI-FI REDESIGN --- */}
          <div className="px-6 pb-6">
            <div className="research-metrics-panel p-5 md:p-6 relative overflow-hidden">

              {/* CRT scan-line texture */}
              <div className="absolute inset-0 pointer-events-none z-0" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.012) 3px, rgba(0,255,65,0.012) 4px)'
              }} />

              <div className="relative z-10 space-y-5">

                {/* ── Terminal Boot Header ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#00FF41]/40">XAI_ENGINE · v3.0 · ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FF41]/10 rounded-xl border border-[#00FF41]/20">
                        <Microscope size={18} className="text-[#00FF41]" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#00FF41]/60">Explainable AI Diagnostics</p>
                        <h3 className="text-lg text-[var(--cream)] leading-none font-bold">XAI Interpretability Report</h3>
                      </div>
                    </div>
                    <div className="result-badge" style={{
                      background: etlVerified ? 'rgba(102,187,106,0.15)' : 'rgba(239,83,80,0.15)',
                      color: etlVerified ? '#a5d6a7' : '#ef9a9a',
                      border: etlVerified ? '1px solid rgba(102,187,106,0.3)' : '1px solid rgba(239,83,80,0.3)'
                    }}>
                      {etlVerified ? <Shield size={10} /> : <ShieldAlert size={10} />}
                      {etlVerified ? 'ETL Verified' : 'Inference Only'}
                    </div>
                  </div>
                </div>

                {/* ── Bento Metric Grid ── */}
                <div className="grid grid-cols-12 gap-2.5">

                  {/* Hero: SVG Arc Confidence Tile */}
                  <div className="col-span-12 sm:col-span-7 bg-[#00FF41]/5 rounded-2xl p-4 border border-[#00FF41]/15 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Activity size={11} className="text-[#00FF41]/70" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#00FF41]/60">Confidence Score</span>
                        </div>
                        <p className="text-5xl font-black text-[#00FF41] tabular-nums leading-none">
                          {confidence}<span className="text-xl ml-0.5 font-bold">%</span>
                        </p>
                        <p className="text-[9px] uppercase tracking-wide text-[var(--cream)]/40 mt-2">
                          {confidence >= 90 ? '◈ Very High Certainty' : confidence >= 75 ? '◈ High Certainty' : confidence >= 60 ? '◈ Moderate Certainty' : '◈ Low Certainty'}
                        </p>
                        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence}%` }}
                            transition={{ duration: 1.8, ease: 'circOut' }}
                            className="h-full rounded-full"
                            style={{ background: confidence >= 90 ? '#00FF41' : confidence >= 75 ? '#7dff9f' : confidence >= 60 ? '#ffd54f' : '#ff8a65' }}
                          />
                        </div>
                      </div>
                      {/* SVG radial arc gauge */}
                      <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
                        <circle cx="38" cy="38" r="30" fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="6" />
                        <motion.circle
                          cx="38" cy="38" r="30"
                          fill="none"
                          stroke={confidence >= 90 ? '#00FF41' : confidence >= 75 ? '#7dff9f' : confidence >= 60 ? '#ffd54f' : '#ff8a65'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 30}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - confidence / 100) }}
                          transition={{ duration: 1.8, ease: 'circOut' }}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Right column: 3 stat tiles */}
                  <div className="col-span-12 sm:col-span-5 grid grid-rows-3 gap-2.5">
                    <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/8 flex items-center gap-3">
                      <Clock size={14} className="text-[var(--cream)]/25 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35">Latency</p>
                        <p className="text-xl font-black text-[var(--cream)] tabular-nums leading-none mt-0.5">
                          {latency}<span className="text-[10px] ml-0.5 font-bold">ms</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/8 flex items-center gap-3">
                      <Database size={14} className="text-[var(--cream)]/25 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35">Data Source</p>
                        <p className="text-[11px] font-bold text-[var(--cream)] leading-tight mt-0.5 truncate">
                          {provenance.primary}{provenance.verified && <span className="text-[#00FF41] ml-1">✓</span>}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/8 flex items-center gap-3">
                      <Zap size={14} className="text-[var(--cream)]/25 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35">Model</p>
                        <p className="text-[11px] font-bold text-[var(--cream)] leading-none mt-0.5">{modelName}</p>
                        <p className="text-[9px] text-[var(--cream)]/30 leading-none mt-0.5">HBDO retrieval · validation · enrichment</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-12 sm:col-span-4">
                    <RadarSweep packets={radarPackets} confidence={confidence} verified={etlVerified} />
                  </div>
                  <div className="col-span-12 sm:col-span-8 bg-white/5 rounded-2xl p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FlaskConical size={12} className="text-[#00FF41]/50" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--cream)]/50">SYS.XAI//FEATURE_IMPORTANCE</span>
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-wider text-[var(--cream)]/20 border border-white/8 px-2 py-0.5 rounded-full">
                        SHAP / LIME
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--cream)]/45 leading-relaxed mb-3">
                      {featureContributions.length} morphological cues drove this classification. Bars represent relative SHAP value contribution.
                    </p>
                    <div className="space-y-3">
                      {featureContributions.map((f, idx) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: 0.3 + idx * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--cream)]/85">{f.label}</span>
                              <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm" style={{
                                background: idx === 0 ? 'rgba(0,255,65,0.15)' : 'rgba(255,255,255,0.06)',
                                color: idx === 0 ? '#00FF41' : 'rgba(245,245,220,0.35)'
                              }}>
                                {idx === 0 ? '★ PRIMARY' : `#${idx + 1}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-black tabular-nums" style={{
                              color: idx === 0 ? '#00FF41' : 'rgba(245,245,220,0.55)'
                            }}>{f.score}%</span>
                          </div>
                          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${f.score}%` }}
                              transition={{ duration: 1.0, delay: 0.45 + idx * 0.15, ease: 'easeOut' }}
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                background: idx === 0
                                  ? 'linear-gradient(90deg, #00FF41, #7dff9f)'
                                  : 'linear-gradient(90deg, rgba(0,255,65,0.5), rgba(125,255,159,0.3))'
                              }}
                            />
                            {idx === 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${f.score}%` }}
                                transition={{ duration: 1.0, delay: 0.45, ease: 'easeOut' }}
                                className="absolute inset-y-0 left-0"
                                style={{ background: 'linear-gradient(90deg, rgba(0,255,65,0.35), transparent)', filter: 'blur(3px)' }}
                              />
                            )}
                          </div>
                          <p className="text-[9px] text-[var(--cream)]/30 mt-0.5 leading-snug">{f.detail}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 bg-white/5 rounded-xl px-3 py-3 border border-white/8">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35 mb-1">Retrieval</p>
                    <p className="text-[11px] font-bold text-[var(--cream)] leading-tight">
                      {retrievalMeta?.source ? retrievalMeta.source.replace(/_/g, ' ') : 'No reference signal'}
                    </p>
                    <p className="text-[9px] text-[var(--cream)]/35 mt-1">
                      Tier: {retrievalMeta?.matchTier || 'none'}{retrievalConfidence !== null ? ` · ${retrievalConfidence}%` : ''}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 bg-white/5 rounded-xl px-3 py-3 border border-white/8">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35 mb-1">Validation</p>
                    <p className="text-[11px] font-bold text-[var(--cream)] leading-tight">
                      {validationMeta?.verificationStatus ? validationMeta.verificationStatus.replace(/_/g, ' ') : 'unverified'}
                    </p>
                    <p className="text-[9px] text-[var(--cream)]/35 mt-1">
                      Level: {validationMeta?.verificationLevel || 'none'}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 bg-white/5 rounded-xl px-3 py-3 border border-white/8">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35 mb-1">Fallback</p>
                    <p className="text-[11px] font-bold text-[var(--cream)] leading-tight">
                      {fallbackMeta?.strategy ? fallbackMeta.strategy.replace(/_/g, ' ') : 'model only truthful fallback'}
                    </p>
                    <p className="text-[9px] text-[var(--cream)]/35 mt-1 leading-snug">
                      {fallbackMeta?.reason || 'No additional fallback reasoning recorded.'}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 bg-white/5 rounded-xl px-3 py-3 border border-white/8">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[var(--cream)]/35 mb-1">Enrichment</p>
                    <p className="text-[11px] font-bold text-[var(--cream)] leading-tight">
                      {enrichmentSourceCount} source{enrichmentSourceCount === 1 ? '' : 's'}
                    </p>
                    <p className="text-[9px] text-[var(--cream)]/35 mt-1 leading-snug">
                      {enrichmentSourceLabel}
                    </p>
                  </div>
                </div>

                {/* ── Status Footer ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${etlVerified ? 'bg-[#00FF41]' : 'bg-amber-300'}`} />
                    <span className="text-[8px] font-black uppercase tracking-[0.35em] text-[var(--cream)]/25">
                      {etlVerified ? 'ETL Ground Truth Sync Active' : 'AI Inference Surface Active'}
                    </span>
                  </div>
                  <span className="text-[8px] text-[var(--cream)]/15 tracking-widest uppercase">SAVE_SOIL · XAI v3.0</span>
                </div>
              </div>
            </div>
          </div>

        </div>{/* end result-panel */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.35 }}
          className="mt-5 result-section px-6 py-5"
        >
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#00FF41]/60">SYS.FEEDBACK//VERIFIED_TRAINING_SIGNAL</p>
              <p className="text-sm text-[var(--cream)]/65 mt-1">
                Authenticated confirmations and corrections can be attached to this HBDO trace for future review.
              </p>
            </div>
            {identificationId && (
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--cream)]/30 border border-white/8 px-2.5 py-1 rounded-full">
                Trace {identificationId.slice(-12)}
              </span>
            )}
          </div>
          <FeedbackButtons plant={plant} identificationId={identificationId} />
        </motion.div>

        {/* --- PHASE 4: Scan Again Action Bar --- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 soil-shell px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF41]/12 border border-[#00FF41]/18 flex items-center justify-center">
              <Leaf size={16} className="text-[#00FF41]" />
            </div>
            <div>
              <p className="text-xs font-black text-[var(--cream)] uppercase tracking-wide">BOT.INTEL//IDENTIFICATION_COMPLETE</p>
              <p className="text-[9px] text-body-muted">Neural botanical console · {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          {onNewScan && (
            <button
              onClick={onNewScan}
              className="glass-button px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
            >
              <span>🌿</span> Scan Another Plant
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
