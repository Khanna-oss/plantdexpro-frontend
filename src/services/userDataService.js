/**
 * User Data Service
 * Manages user-specific data in Firestore: plant history, favorites, feedback
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Save plant identification to user history
 */
export const savePlantToHistory = async (userId, plantData) => {
  try {
    const historyRef = doc(collection(db, 'users', userId, 'history'));
    await setDoc(historyRef, {
      ...plantData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    return historyRef.id;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
};

/**
 * Get user's plant identification history
 */
export const getUserHistory = async (userId, limitCount = 50) => {
  try {
    const historyRef = collection(db, 'users', userId, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

/**
 * Add plant to favorites
 */
export const addToFavorites = async (userId, plantData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        favoritePlants: [plantData],
        createdAt: serverTimestamp()
      });
    } else {
      // Add to existing favorites
      await updateDoc(userRef, {
        favoritePlants: arrayUnion(plantData)
      });
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Remove plant from favorites
 */
export const removeFromFavorites = async (userId, plantId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const favorites = userDoc.data().favoritePlants || [];
      const updatedFavorites = favorites.filter(p => p.id !== plantId);
      
      await updateDoc(userRef, {
        favoritePlants: updatedFavorites
      });
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

/**
 * Get user's favorite plants
 */
export const getFavoritePlants = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().favoritePlants || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

/**
 * Add recipe to favorites
 */
export const addRecipeToFavorites = async (userId, recipeData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        favoriteRecipes: [recipeData],
        createdAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        favoriteRecipes: arrayUnion(recipeData)
      });
    }
  } catch (error) {
    console.error('Error adding recipe to favorites:', error);
    throw error;
  }
};

/**
 * Get user's favorite recipes
 */
export const getFavoriteRecipes = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().favoriteRecipes || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    return [];
  }
};

/**
 * Submit feedback on AI identification
 */
export const submitFeedback = async (userId, identificationId, feedback) => {
  try {
    const feedbackRef = doc(collection(db, 'feedback'));
    await setDoc(feedbackRef, {
      userId,
      identificationId,
      feedbackType: feedback.type, // 'confirm' or 'correct'
      correctName: feedback.correctName || null,
      comments: feedback.comments || null,
      submittedByAuthenticatedUser: true,
      plantSnapshot: feedback.plantSnapshot || null,
      hbdoSnapshot: feedback.hbdoSnapshot || null,
      xaiSnapshot: feedback.xaiSnapshot || null,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Also update the history entry with feedback
    const historyEntryId = feedback.historyEntryId || identificationId;
    if (historyEntryId) {
      const historyRef = doc(db, 'users', userId, 'history', historyEntryId);
      const historyDoc = await getDoc(historyRef);
      if (historyDoc.exists()) {
        await updateDoc(historyRef, {
          feedback: {
            id: feedbackRef.id,
            type: feedback.type,
            correctName: feedback.correctName || null,
            comments: feedback.comments || null,
            submittedAt: new Date().toISOString(),
            submittedByAuthenticatedUser: true
          }
        });
      }
    }
    
    return feedbackRef.id;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const userDataService = {
  savePlantToHistory,
  getUserHistory,
  addToFavorites,
  removeFromFavorites,
  getFavoritePlants,
  addRecipeToFavorites,
  getFavoriteRecipes,
  submitFeedback,
  getUserProfile
};
