// Hook for managing offline data synchronization
// Handles PWA offline functionality
import { useState, useEffect, useCallback } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState([]);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add data to sync queue when offline
  const addToSyncQueue = useCallback((data) => {
    if (!isOnline) {
      setPendingSync(prev => [...prev, { ...data, timestamp: Date.now() }]);
    }
  }, [isOnline]);

  // Sync pending data when back online
  const syncPendingData = useCallback(async () => {
    if (isOnline && pendingSync.length > 0) {
      try {
        // Process each pending sync item
        for (const item of pendingSync) {
          // Implement actual sync logic here
          console.log('Syncing:', item);
        }
        setPendingSync([]);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }, [isOnline, pendingSync]);

  useEffect(() => {
    if (isOnline) {
      syncPendingData();
    }
  }, [isOnline, syncPendingData]);

  return {
    isOnline,
    pendingSync: pendingSync.length,
    addToSyncQueue
  };
};
