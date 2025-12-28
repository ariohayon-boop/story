/**
 * GymTracker - Main Application Logic
 * Home Screen functionality
 */

// ====================================
// App State
// ====================================

const App = {
    user: null,
    workouts: [],
    isOnline: navigator.onLine,
    
    // ====================================
    // Initialization
    // ====================================
    
    async init() {
        console.log('🏋️ GymTracker initializing...');
        
        // Apply saved theme
        this.applyTheme();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check auth state
        await this.checkAuth();
        
        // Hide loading screen
        this.hideLoading();
        
        // Check for unfinished workout
        this.checkUnfinishedWorkout();
        
        console.log('✅ GymTracker ready!');
    },
    
    // ====================================
    // Authentication
    // ====================================
    
    async checkAuth() {
        try {
            this.user = await Auth.getCurrentUser();
            
            if (this.user) {
                console.log('User logged in:', this.user.email);
                await this.loadDashboardData();
            } else {
                console.log('No user - showing auth modal');
                this.showAuthModal();
            }
            
            // Listen for auth changes
            Auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.user = session.user;
                    this.hideAuthModal();
                    this.loadDashboardData();
                } else if (event === 'SIGNED_OUT') {
                    this.user = null;
                    this.showAuthModal();
                }
            });
            
        } catch (error) {
            console.error('Auth check failed:', error);
            // Try to work offline
            this.loadFromCache();
        }
    },
    
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('hidden');
    },
    
    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.add('hidden');
    },
    
    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isSignup = document.getElementById('auth-form').dataset.mode === 'signup';
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'מעבד...';
        submitBtn.disabled = true;
        
        try {
            if (isSignup) {
                await Auth.signUp(email, password);
                this.showNotification('נרשמת בהצלחה! בדוק את האימייל לאימות', 'success');
            } else {
                await Auth.signIn(email, password);
                this.showNotification('התחברת בהצלחה! 💪', 'success');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showNotification(error.message || 'שגיאה בהתחברות', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },
    
    toggleAuthMode() {
        const form = document.getElementById('auth-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const toggleBtn = document.getElementById('toggle-signup');
        const title = form.closest('.modal-content').querySelector('h2');
        
        if (form.dataset.mode === 'signup') {
            form.dataset.mode = 'login';
            submitBtn.textContent = 'התחבר';
            toggleBtn.textContent = 'הירשם';
            title.textContent = 'התחברות';
            toggleBtn.previousSibling.textContent = 'אין לך חשבון? ';
        } else {
            form.dataset.mode = 'signup';
            submitBtn.textContent = 'הירשם';
            toggleBtn.textContent = 'התחבר';
            title.textContent = 'הרשמה';
            toggleBtn.previousSibling.textContent = 'כבר יש לך חשבון? ';
        }
    },
    
    // ====================================
    // Data Loading
    // ====================================
    
    async loadDashboardData() {
        try {
            // Load workouts
            const workouts = await Database.getWorkouts(10);
            this.workouts = workouts;
            
            // Cache for offline
            StorageManager.cacheWorkouts(workouts);
            
            // Update UI
            this.renderRecentWorkouts(workouts.slice(0, 5));
            
            // Load stats
            const stats = await Database.getWorkoutStats(this.user.id);
            this.updateStats(stats);
            
            // Calculate streak
            this.calculateStreak(workouts);
            
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.loadFromCache();
        }
    },
    
    loadFromCache() {
        const cachedWorkouts = StorageManager.getCachedWorkouts();
        if (cachedWorkouts) {
            this.workouts = cachedWorkouts;
            this.renderRecentWorkouts(cachedWorkouts.slice(0, 5));
        }
    },
    
    // ====================================
    // UI Rendering
    // ====================================
    
    renderRecentWorkouts(workouts) {
        const container = document.getElementById('recent-workouts-list');
        const emptyState = document.getElementById('empty-workouts');
        
        if (!workouts || workouts.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        // Clear previous cards (but keep empty state)
        const existingCards = container.querySelectorAll('.workout-card');
        existingCards.forEach(card => card.remove());
        
        // Render workout cards
        workouts.forEach(workout => {
            const card = this.createWorkoutCard(workout);
            container.appendChild(card);
        });
    },
    
    createWorkoutCard(workout) {
        const card = document.createElement('a');
        card.href = `workout-details.html?id=${workout.id}`;
        card.className = 'workout-card animate-slideUp';
        
        const date = new Date(workout.workout_date);
        const formattedDate = this.formatDate(date);
        const duration = workout.duration_minutes ? `${workout.duration_minutes} דקות` : '';
        
        // Choose icon based on workout name
        const icon = this.getWorkoutIcon(workout.workout_name);
        
        card.innerHTML = `
            <div class="workout-icon">${icon}</div>
            <div class="workout-info">
                <div class="workout-name">${workout.workout_name}</div>
                <div class="workout-meta">
                    <span>📅 ${formattedDate}</span>
                    ${duration ? `<span>⏱️ ${duration}</span>` : ''}
                </div>
            </div>
            <span class="workout-arrow">←</span>
        `;
        
        return card;
    },
    
    updateStats(stats) {
        const weeklyEl = document.getElementById('weekly-workouts');
        const monthlyEl = document.getElementById('monthly-workouts');
        
        if (weeklyEl) weeklyEl.textContent = stats.weeklyWorkouts || 0;
        if (monthlyEl) monthlyEl.textContent = stats.monthlyWorkouts || 0;
    },
    
    calculateStreak(workouts) {
        if (!workouts || workouts.length === 0) {
            this.updateStreak(0);
            return;
        }
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Sort by date descending
        const sortedWorkouts = [...workouts].sort(
            (a, b) => new Date(b.workout_date) - new Date(a.workout_date)
        );
        
        let currentDate = today;
        
        for (const workout of sortedWorkouts) {
            const workoutDate = new Date(workout.workout_date);
            workoutDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0 || diffDays === 1) {
                streak++;
                currentDate = workoutDate;
            } else {
                break;
            }
        }
        
        this.updateStreak(streak);
    },
    
    updateStreak(streak) {
        const streakEl = document.getElementById('current-streak');
        const streakDisplay = document.getElementById('streak-display');
        
        if (streakEl) streakEl.textContent = streak;
        
        if (streakDisplay && streak > 0) {
            streakDisplay.textContent = `🔥 ${streak} ימים רצופים!`;
        }
    },
    
    // ====================================
    // Theme Management
    // ====================================
    
    applyTheme() {
        const settings = StorageManager.getSettings();
        const theme = settings.theme || 'light';
        
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    },
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        StorageManager.updateSettings({ theme: newTheme });
        this.updateThemeIcon(newTheme);
    },
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    },
    
    // ====================================
    // Event Listeners
    // ====================================
    
    setupEventListeners() {
        // Theme toggle
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // Start workout button
        const startBtn = document.getElementById('start-workout-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                window.location.href = 'workout.html';
            });
        }
        
        // View all workouts
        const viewAllBtn = document.getElementById('view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                window.location.href = 'history.html';
            });
        }
        
        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }
        
        // Toggle signup/login
        const toggleBtn = document.getElementById('toggle-signup');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAuthMode());
        }
    },
    
    // ====================================
    // Unfinished Workout Check
    // ====================================
    
    checkUnfinishedWorkout() {
        if (StorageManager.hasUnfinishedWorkout()) {
            const workout = StorageManager.getCurrentWorkout();
            const lastUpdated = new Date(workout.lastUpdated);
            const now = new Date();
            const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
            
            // If less than 24 hours old, ask to continue
            if (hoursDiff < 24) {
                this.showContinueWorkoutPrompt(workout);
            } else {
                // Too old, clear it
                StorageManager.clearCurrentWorkout();
            }
        }
    },
    
    showContinueWorkoutPrompt(workout) {
        const confirmed = confirm(`יש לך אימון לא גמור (${workout.name}). רוצה להמשיך?`);
        if (confirmed) {
            window.location.href = 'workout.html?continue=true';
        } else {
            StorageManager.clearCurrentWorkout();
        }
    },
    
    // ====================================
    // Utilities
    // ====================================
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    },
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} animate-slideUp`;
        notification.textContent = message;
        
        // Style it
        Object.assign(notification.style, {
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: type === 'success' ? 'var(--success)' : 
                            type === 'error' ? 'var(--error)' : 'var(--primary)',
            color: 'white',
            fontWeight: '500',
            zIndex: '1001',
            boxShadow: 'var(--shadow-lg)'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    formatDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate.getTime() === today.getTime()) {
            return 'היום';
        } else if (compareDate.getTime() === yesterday.getTime()) {
            return 'אתמול';
        } else {
            return date.toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'short'
            });
        }
    },
    
    getWorkoutIcon(name) {
        const nameLower = name.toLowerCase();
        
        if (nameLower.includes('push') || nameLower.includes('chest')) return '💪';
        if (nameLower.includes('pull') || nameLower.includes('back')) return '🔙';
        if (nameLower.includes('leg') || nameLower.includes('squat')) return '🦵';
        if (nameLower.includes('shoulder')) return '🎯';
        if (nameLower.includes('arm')) return '💪';
        if (nameLower.includes('core') || nameLower.includes('abs')) return '🔥';
        if (nameLower.includes('cardio') || nameLower.includes('run')) return '🏃';
        if (nameLower.includes('full')) return '⚡';
        
        return '🏋️';
    },
    
    // Greeting based on time of day
    getGreeting() {
        const hour = new Date().getHours();
        
        if (hour < 12) return 'בוקר טוב! ☀️';
        if (hour < 17) return 'צהריים טובים! 🌤️';
        if (hour < 21) return 'ערב טוב! 🌆';
        return 'לילה טוב! 🌙';
    }
};

// ====================================
// Initialize App
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Update greeting
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        greetingEl.textContent = App.getGreeting();
    }
    
    // Initialize app
    App.init();
});

// Export
window.App = App;
