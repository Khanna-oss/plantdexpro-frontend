/**
 * User Dashboard
 * Displays plant history, favorites, and user profile
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Heart, LogOut, Leaf, Star, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userDataService } from '../services/userDataService.js';

export const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [favoritePlants, setFavoritePlants] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [historyData, plantsData, recipesData] = await Promise.all([
        userDataService.getUserHistory(currentUser.uid),
        userDataService.getFavoritePlants(currentUser.uid),
        userDataService.getFavoriteRecipes(currentUser.uid)
      ]);
      
      setHistory(historyData);
      setFavoritePlants(plantsData);
      setFavoriteRecipes(recipesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRemoveFavorite = async (plantId) => {
    try {
      await userDataService.removeFromFavorites(currentUser.uid, plantId);
      setFavoritePlants(favoritePlants.filter(p => p.id !== plantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-panel mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--golden-soil)]/20 border border-[var(--golden-soil)]/30 flex items-center justify-center">
              <Leaf size={32} className="text-[var(--golden-soil)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--cream)]">
                {currentUser?.displayName || 'Plant Explorer'}
              </h1>
              <p className="text-sm text-[var(--cream)]/60">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[var(--cream)] text-sm font-bold transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
            activeTab === 'history'
              ? 'bg-[var(--golden-soil)] text-[var(--forest-green)]'
              : 'bg-white/10 text-[var(--cream)]/60 hover:bg-white/20'
          }`}
        >
          <History size={16} />
          <span>History</span>
          {history.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{history.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
            activeTab === 'favorites'
              ? 'bg-[var(--golden-soil)] text-[var(--forest-green)]'
              : 'bg-white/10 text-[var(--cream)]/60 hover:bg-white/20'
          }`}
        >
          <Heart size={16} />
          <span>Favorites</span>
          {favoritePlants.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{favoritePlants.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="glass-panel text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[var(--golden-soil)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--cream)]/60">Loading your data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="glass-panel text-center py-12">
                  <History size={48} className="mx-auto mb-4 text-[var(--cream)]/30" />
                  <p className="text-[var(--cream)]/60 mb-2">No plant identifications yet</p>
                  <p className="text-sm text-[var(--cream)]/40">Start identifying plants to build your history</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel hover:bg-white/15 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black/20">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-black text-[var(--cream)] truncate">{item.commonName || item.name}</h3>
                            <p className="text-sm text-[var(--cream)]/60 italic">{item.scientificName}</p>
                          </div>
                          {item.confidence && (
                            <span className="px-3 py-1 rounded-full bg-[var(--golden-soil)]/20 text-[var(--golden-soil)] text-xs font-black">
                              {item.confidence}% Match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--cream)]/40">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {item.date || new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          {item.feedback && (
                            <span className="flex items-center gap-1">
                              {item.feedback.type === 'confirm' ? (
                                <><CheckCircle size={12} className="text-green-400" /> Confirmed</>
                              ) : (
                                <><XCircle size={12} className="text-orange-400" /> Corrected</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {favoritePlants.length === 0 ? (
                <div className="glass-panel text-center py-12">
                  <Heart size={48} className="mx-auto mb-4 text-[var(--cream)]/30" />
                  <p className="text-[var(--cream)]/60 mb-2">No favorite plants yet</p>
                  <p className="text-sm text-[var(--cream)]/40">Save plants you love to access them quickly</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoritePlants.map((plant, idx) => (
                    <motion.div
                      key={plant.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-panel group relative"
                    >
                      <button
                        onClick={() => handleRemoveFavorite(plant.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                      {plant.image && (
                        <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-black/20">
                          <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h3 className="text-sm font-black text-[var(--cream)] mb-1">{plant.commonName || plant.name}</h3>
                      <p className="text-xs text-[var(--cream)]/60 italic">{plant.scientificName}</p>
                      {plant.isEdible && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold">
                          <Star size={10} />
                          Edible
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
