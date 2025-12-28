/**
 * Storage Manager - ניהול אחסון מקומי ו-Sync
 * מאפשר עבודה אופליין עם סנכרון אוטומטי
 */

const StorageManager = {
    
    // Keys for localStorage
    KEYS: {
        PENDING_WORKOUTS: 'gym_pending_workouts',
        PENDING_SETS: 'gym_pending_sets',
        CACHED_EXERCISES: 'gym_cached_exercises',
        CACHED_WORKOUTS: 'gym_cached_workouts',
        CURRENT_WORKOUT: 'gym_current_workout',
        USER_SETTINGS: 'gym_user_settings',
        LAST_SYNC: 'gym_last_sync'
    },
    
    // ====================================
    // Basic Storage Operations
    // ====================================
    
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    // ====================================
    // Offline Queue Management
    // ====================================
    
    // הוספת פעולה לתור הממתין (לסנכרון כשחוזרים לאינטרנט)
    addToPendingQueue(type, data) {
        const key = type === 'workout' ? this.KEYS.PENDING_WORKOUTS : this.KEYS.PENDING_SETS;
        const queue = this.get(key) || [];
        
        queue.push({
            id: this.generateId(),
            timestamp: Date.now(),
            data
        });
        
        this.set(key, queue);
    },
    
    // קבלת כל הפעולות הממתינות
    getPendingQueue(type) {
        const key = type === 'workout' ? this.KEYS.PENDING_WORKOUTS : this.KEYS.PENDING_SETS;
        return this.get(key) || [];
    },
    
    // ניקוי תור לאחר סנכרון מוצלח
    clearPendingQueue(type) {
        const key = type === 'workout' ? this.KEYS.PENDING_WORKOUTS : this.KEYS.PENDING_SETS;
        this.remove(key);
    },
    
    // הסרת פריט ספציפי מהתור
    removeFromPendingQueue(type, itemId) {
        const key = type === 'workout' ? this.KEYS.PENDING_WORKOUTS : this.KEYS.PENDING_SETS;
        const queue = this.get(key) || [];
        const filtered = queue.filter(item => item.id !== itemId);
        this.set(key, filtered);
    },
    
    // ====================================
    // Current Workout (אימון פעיל)
    // ====================================
    
    // שמירת אימון נוכחי (Real-time save)
    saveCurrentWorkout(workout) {
        return this.set(this.KEYS.CURRENT_WORKOUT, {
            ...workout,
            lastUpdated: Date.now()
        });
    },
    
    // קבלת אימון נוכחי
    getCurrentWorkout() {
        return this.get(this.KEYS.CURRENT_WORKOUT);
    },
    
    // ניקוי אימון נוכחי (בסיום)
    clearCurrentWorkout() {
        return this.remove(this.KEYS.CURRENT_WORKOUT);
    },
    
    // בדיקה אם יש אימון לא גמור
    hasUnfinishedWorkout() {
        const workout = this.getCurrentWorkout();
        return workout && !workout.completed;
    },
    
    // ====================================
    // Cache Management
    // ====================================
    
    // שמירת תרגילים ב-Cache
    cacheExercises(exercises) {
        return this.set(this.KEYS.CACHED_EXERCISES, {
            data: exercises,
            cachedAt: Date.now()
        });
    },
    
    // קבלת תרגילים מ-Cache
    getCachedExercises() {
        const cache = this.get(this.KEYS.CACHED_EXERCISES);
        if (!cache) return null;
        
        // Cache valid for 1 day
        const ONE_DAY = 24 * 60 * 60 * 1000;
        if (Date.now() - cache.cachedAt > ONE_DAY) {
            this.remove(this.KEYS.CACHED_EXERCISES);
            return null;
        }
        
        return cache.data;
    },
    
    // שמירת אימונים ב-Cache
    cacheWorkouts(workouts) {
        return this.set(this.KEYS.CACHED_WORKOUTS, {
            data: workouts,
            cachedAt: Date.now()
        });
    },
    
    // קבלת אימונים מ-Cache
    getCachedWorkouts() {
        const cache = this.get(this.KEYS.CACHED_WORKOUTS);
        if (!cache) return null;
        
        // Cache valid for 1 hour
        const ONE_HOUR = 60 * 60 * 1000;
        if (Date.now() - cache.cachedAt > ONE_HOUR) {
            return null; // stale but don't delete - might need offline
        }
        
        return cache.data;
    },
    
    // ====================================
    // User Settings
    // ====================================
    
    getSettings() {
        return this.get(this.KEYS.USER_SETTINGS) || {
            theme: 'light',
            units: 'metric',
            notifications: true
        };
    },
    
    updateSettings(updates) {
        const current = this.getSettings();
        return this.set(this.KEYS.USER_SETTINGS, { ...current, ...updates });
    },
    
    // ====================================
    // Sync Management
    // ====================================
    
    getLastSyncTime() {
        return this.get(this.KEYS.LAST_SYNC);
    },
    
    updateLastSyncTime() {
        return this.set(this.KEYS.LAST_SYNC, Date.now());
    },
    
    // סנכרון כל הנתונים הממתינים
    async syncPendingData() {
        if (!navigator.onLine) {
            console.log('Offline - sync postponed');
            return { success: false, reason: 'offline' };
        }
        
        const results = {
            workouts: { success: 0, failed: 0 },
            sets: { success: 0, failed: 0 }
        };
        
        // סנכרון אימונים
        const pendingWorkouts = this.getPendingQueue('workout');
        for (const item of pendingWorkouts) {
            try {
                await Database.createWorkout(item.data);
                this.removeFromPendingQueue('workout', item.id);
                results.workouts.success++;
            } catch (e) {
                console.error('Failed to sync workout:', e);
                results.workouts.failed++;
            }
        }
        
        // סנכרון סטים
        const pendingSets = this.getPendingQueue('set');
        for (const item of pendingSets) {
            try {
                await Database.addSet(item.data);
                this.removeFromPendingQueue('set', item.id);
                results.sets.success++;
            } catch (e) {
                console.error('Failed to sync set:', e);
                results.sets.failed++;
            }
        }
        
        if (results.workouts.failed === 0 && results.sets.failed === 0) {
            this.updateLastSyncTime();
        }
        
        return { success: true, results };
    },
    
    // ====================================
    // Utilities
    // ====================================
    
    // יצירת ID זמני (לשימוש אופליין)
    generateId() {
        return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // בדיקה אם ID זמני
    isTemporaryId(id) {
        return id && id.toString().startsWith('temp_');
    },
    
    // חישוב גודל האחסון
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
            }
        }
        return {
            bytes: total,
            kb: (total / 1024).toFixed(2),
            mb: (total / (1024 * 1024)).toFixed(2)
        };
    },
    
    // ניקוי כל ה-Cache (לא הנתונים הממתינים!)
    clearCache() {
        this.remove(this.KEYS.CACHED_EXERCISES);
        this.remove(this.KEYS.CACHED_WORKOUTS);
    },
    
    // ניקוי הכל (זהירות!)
    clearAll() {
        Object.values(this.KEYS).forEach(key => this.remove(key));
    }
};

// ====================================
// Online/Offline Event Listeners
// ====================================

// כשחוזרים לאינטרנט - סנכרון אוטומטי
window.addEventListener('online', async () => {
    console.log('Back online - starting sync...');
    
    // הסתרת באנר אופליין
    const offlineBanner = document.getElementById('offline-banner');
    if (offlineBanner) offlineBanner.classList.add('hidden');
    
    // סנכרון נתונים
    const result = await StorageManager.syncPendingData();
    
    if (result.success) {
        console.log('Sync completed:', result.results);
        // אפשר להציג הודעה למשתמש
    }
});

// כשנכנסים למצב אופליין
window.addEventListener('offline', () => {
    console.log('Gone offline');
    
    // הצגת באנר אופליין
    const offlineBanner = document.getElementById('offline-banner');
    if (offlineBanner) offlineBanner.classList.remove('hidden');
});

// Export
window.StorageManager = StorageManager;
