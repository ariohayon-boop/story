/**
 * Workout Manager - ניהול אימון פעיל
 * הליבה של האפליקציה
 */

const WorkoutApp = {
    // State
    exercises: [],           // כל התרגילים מה-DB
    selectedExercises: [],   // תרגילים שנבחרו לאימון
    currentWorkout: null,    // האימון הנוכחי עם כל הסטים
    timer: null,             // טיימר
    startTime: null,         // זמן התחלה
    currentFilter: 'all',    // פילטר נוכחי
    
    // ====================================
    // Initialization
    // ====================================
    
    async init() {
        console.log('🏋️ Workout Manager initializing...');
        
        // Apply theme
        this.applyTheme();
        
        // Check if continuing previous workout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('continue') === 'true') {
            this.continueWorkout();
        }
        
        // Load exercises
        await this.loadExercises();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide loading
        document.getElementById('loading-screen').classList.add('hidden');
        
        console.log('✅ Workout Manager ready!');
    },
    
    applyTheme() {
        const settings = StorageManager.getSettings();
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    },
    
    // ====================================
    // Exercise Loading
    // ====================================
    
    async loadExercises() {
        try {
            // Try to get from cache first (faster)
            let exercises = StorageManager.getCachedExercises();
            
            if (!exercises) {
                // Load from database
                exercises = await Database.getExercises();
                StorageManager.cacheExercises(exercises);
            }
            
            // If still no exercises, use defaults
            if (!exercises || exercises.length === 0) {
                exercises = this.getDefaultExercises();
            }
            
            this.exercises = exercises;
            this.renderExerciseList(exercises);
            
        } catch (error) {
            console.error('Failed to load exercises:', error);
            // Use defaults as fallback
            this.exercises = this.getDefaultExercises();
            this.renderExerciseList(this.exercises);
        }
    },
    
    getDefaultExercises() {
        return [
            // Chest
            { id: 'ex1', exercise_name: 'Bench Press', muscle_group: 'Chest', exercise_type: 'weights' },
            { id: 'ex2', exercise_name: 'Incline Bench Press', muscle_group: 'Chest', exercise_type: 'weights' },
            { id: 'ex3', exercise_name: 'Dumbbell Press', muscle_group: 'Chest', exercise_type: 'weights' },
            { id: 'ex4', exercise_name: 'Dumbbell Flyes', muscle_group: 'Chest', exercise_type: 'weights' },
            { id: 'ex5', exercise_name: 'Cable Flyes', muscle_group: 'Chest', exercise_type: 'weights' },
            { id: 'ex6', exercise_name: 'Push-ups', muscle_group: 'Chest', exercise_type: 'bodyweight' },
            { id: 'ex7', exercise_name: 'Dips', muscle_group: 'Chest', exercise_type: 'bodyweight' },
            
            // Back
            { id: 'ex8', exercise_name: 'Deadlift', muscle_group: 'Back', exercise_type: 'weights' },
            { id: 'ex9', exercise_name: 'Bent Over Row', muscle_group: 'Back', exercise_type: 'weights' },
            { id: 'ex10', exercise_name: 'Pull-ups', muscle_group: 'Back', exercise_type: 'bodyweight' },
            { id: 'ex11', exercise_name: 'Lat Pulldown', muscle_group: 'Back', exercise_type: 'weights' },
            { id: 'ex12', exercise_name: 'Cable Row', muscle_group: 'Back', exercise_type: 'weights' },
            { id: 'ex13', exercise_name: 'T-Bar Row', muscle_group: 'Back', exercise_type: 'weights' },
            { id: 'ex14', exercise_name: 'Face Pulls', muscle_group: 'Back', exercise_type: 'weights' },
            
            // Legs
            { id: 'ex15', exercise_name: 'Squat', muscle_group: 'Legs', exercise_type: 'weights' },
            { id: 'ex16', exercise_name: 'Leg Press', muscle_group: 'Legs', exercise_type: 'weights' },
            { id: 'ex17', exercise_name: 'Romanian Deadlift', muscle_group: 'Legs', exercise_type: 'weights' },
            { id: 'ex18', exercise_name: 'Leg Curl', muscle_group: 'Legs', exercise_type: 'weights' },
            { id: 'ex19', exercise_name: 'Leg Extension', muscle_group: 'Legs', exercise_type: 'weights' },
            { id: 'ex20', exercise_name: 'Lunges', muscle_group: 'Legs', exercise_type: 'weights' },
            { id: 'ex21', exercise_name: 'Calf Raises', muscle_group: 'Legs', exercise_type: 'weights' },
            
            // Shoulders
            { id: 'ex22', exercise_name: 'Overhead Press', muscle_group: 'Shoulders', exercise_type: 'weights' },
            { id: 'ex23', exercise_name: 'Lateral Raises', muscle_group: 'Shoulders', exercise_type: 'weights' },
            { id: 'ex24', exercise_name: 'Front Raises', muscle_group: 'Shoulders', exercise_type: 'weights' },
            { id: 'ex25', exercise_name: 'Rear Delt Flyes', muscle_group: 'Shoulders', exercise_type: 'weights' },
            { id: 'ex26', exercise_name: 'Arnold Press', muscle_group: 'Shoulders', exercise_type: 'weights' },
            { id: 'ex27', exercise_name: 'Shrugs', muscle_group: 'Shoulders', exercise_type: 'weights' },
            
            // Arms
            { id: 'ex28', exercise_name: 'Barbell Curl', muscle_group: 'Arms', exercise_type: 'weights' },
            { id: 'ex29', exercise_name: 'Dumbbell Curl', muscle_group: 'Arms', exercise_type: 'weights' },
            { id: 'ex30', exercise_name: 'Hammer Curl', muscle_group: 'Arms', exercise_type: 'weights' },
            { id: 'ex31', exercise_name: 'Tricep Pushdown', muscle_group: 'Arms', exercise_type: 'weights' },
            { id: 'ex32', exercise_name: 'Skull Crushers', muscle_group: 'Arms', exercise_type: 'weights' },
            { id: 'ex33', exercise_name: 'Close Grip Bench', muscle_group: 'Arms', exercise_type: 'weights' },
            
            // Core
            { id: 'ex34', exercise_name: 'Plank', muscle_group: 'Core', exercise_type: 'bodyweight' },
            { id: 'ex35', exercise_name: 'Crunches', muscle_group: 'Core', exercise_type: 'bodyweight' },
            { id: 'ex36', exercise_name: 'Leg Raises', muscle_group: 'Core', exercise_type: 'bodyweight' },
            { id: 'ex37', exercise_name: 'Russian Twists', muscle_group: 'Core', exercise_type: 'bodyweight' },
            { id: 'ex38', exercise_name: 'Cable Crunches', muscle_group: 'Core', exercise_type: 'weights' },
        ];
    },
    
    // ====================================
    // Rendering
    // ====================================
    
    renderExerciseList(exercises) {
        const container = document.getElementById('exercise-list');
        container.innerHTML = '';
        
        const filtered = this.currentFilter === 'all' 
            ? exercises 
            : exercises.filter(e => e.muscle_group === this.currentFilter);
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <p>לא נמצאו תרגילים</p>
                </div>
            `;
            return;
        }
        
        filtered.forEach(exercise => {
            const isSelected = this.selectedExercises.some(e => e.id === exercise.id);
            const item = document.createElement('div');
            item.className = `exercise-item ${isSelected ? 'selected' : ''}`;
            item.dataset.id = exercise.id;
            
            item.innerHTML = `
                <div class="exercise-icon">${this.getMuscleIcon(exercise.muscle_group)}</div>
                <div class="exercise-details">
                    <div class="exercise-name">${exercise.exercise_name}</div>
                    <div class="exercise-muscle">${this.translateMuscle(exercise.muscle_group)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => this.toggleExercise(exercise));
            container.appendChild(item);
        });
    },
    
    renderWorkoutExercises() {
        const container = document.getElementById('workout-exercises');
        container.innerHTML = '';
        
        this.currentWorkout.exercises.forEach((exercise, exerciseIndex) => {
            const card = document.createElement('div');
            card.className = 'workout-exercise-card';
            card.dataset.index = exerciseIndex;
            
            // Header with exercise info
            let headerHTML = `
                <div class="exercise-header">
                    <div class="exercise-header-info">
                        <span>${this.getMuscleIcon(exercise.muscle_group)}</span>
                        <h3>${exercise.exercise_name}</h3>
                        <span class="muscle-tag">${this.translateMuscle(exercise.muscle_group)}</span>
                    </div>
                    <div class="exercise-header-actions">
                        <button class="icon-btn" onclick="WorkoutApp.removeExercise(${exerciseIndex})">🗑️</button>
                    </div>
                </div>
            `;
            
            // Previous performance (if exists)
            if (exercise.lastPerformance) {
                headerHTML += `
                    <div class="exercise-previous">
                        פעם קודמת: <strong>${exercise.lastPerformance.weight_kg}kg × ${exercise.lastPerformance.reps}</strong>
                        ${exercise.lastPerformance.rpe ? `(RPE ${exercise.lastPerformance.rpe})` : ''}
                    </div>
                `;
            }
            
            // Sets container
            let setsHTML = `
                <div class="sets-container">
                    <div class="sets-header">
                        <span>סט</span>
                        <span>משקל (ק"ג)</span>
                        <span>חזרות</span>
                        <span>RPE</span>
                        <span></span>
                    </div>
            `;
            
            // Render each set
            exercise.sets.forEach((set, setIndex) => {
                setsHTML += `
                    <div class="set-row" data-set="${setIndex}">
                        <div class="set-number">${setIndex + 1}</div>
                        <input type="number" class="set-input ${set.completed ? 'completed' : ''}" 
                               data-field="weight" value="${set.weight_kg || ''}" 
                               placeholder="${exercise.lastPerformance?.weight_kg || '-'}"
                               oninput="WorkoutApp.updateSet(${exerciseIndex}, ${setIndex}, 'weight_kg', this.value)">
                        <input type="number" class="set-input ${set.completed ? 'completed' : ''}" 
                               data-field="reps" value="${set.reps || ''}" 
                               placeholder="${exercise.lastPerformance?.reps || '-'}"
                               oninput="WorkoutApp.updateSet(${exerciseIndex}, ${setIndex}, 'reps', this.value)">
                        <input type="number" class="set-input ${set.completed ? 'completed' : ''}" 
                               data-field="rpe" value="${set.rpe || ''}" min="1" max="10"
                               placeholder="-"
                               oninput="WorkoutApp.updateSet(${exerciseIndex}, ${setIndex}, 'rpe', this.value)">
                        <button class="set-check ${set.completed ? 'checked' : ''}" 
                                onclick="WorkoutApp.toggleSetComplete(${exerciseIndex}, ${setIndex})">
                            ${set.completed ? '✓' : ''}
                        </button>
                    </div>
                `;
            });
            
            // Add set button
            setsHTML += `
                    <div class="add-set-row">
                        <button class="add-set-btn" onclick="WorkoutApp.addSet(${exerciseIndex})">
                            + הוסף סט
                        </button>
                    </div>
                </div>
            `;
            
            card.innerHTML = headerHTML + setsHTML;
            container.appendChild(card);
        });
        
        this.updateProgress();
    },
    
    // ====================================
    // Exercise Selection
    // ====================================
    
    toggleExercise(exercise) {
        const index = this.selectedExercises.findIndex(e => e.id === exercise.id);
        
        if (index > -1) {
            this.selectedExercises.splice(index, 1);
        } else {
            this.selectedExercises.push(exercise);
        }
        
        this.updateStartButton();
        this.renderExerciseList(this.exercises);
    },
    
    updateStartButton() {
        const btn = document.getElementById('start-training-btn');
        const count = this.selectedExercises.length;
        
        btn.disabled = count === 0;
        btn.textContent = `התחל (${count})`;
    },
    
    // ====================================
    // Workout Flow
    // ====================================
    
    startWorkout() {
        if (this.selectedExercises.length === 0) return;
        
        // Initialize workout object
        this.currentWorkout = {
            id: StorageManager.generateId(),
            startTime: Date.now(),
            exercises: this.selectedExercises.map(ex => ({
                ...ex,
                sets: [{ set_number: 1, weight_kg: null, reps: null, rpe: null, completed: false }],
                lastPerformance: null
            })),
            completed: false
        };
        
        // Save to local storage
        StorageManager.saveCurrentWorkout(this.currentWorkout);
        
        // Start timer
        this.startTime = Date.now();
        this.startTimer();
        
        // Load last performance for each exercise
        this.loadLastPerformances();
        
        // Switch to workout step
        this.showStep('workout');
        this.renderWorkoutExercises();
    },
    
    continueWorkout() {
        const saved = StorageManager.getCurrentWorkout();
        if (!saved) return;
        
        this.currentWorkout = saved;
        this.startTime = saved.startTime;
        this.startTimer();
        
        this.showStep('workout');
        this.renderWorkoutExercises();
    },
    
    async loadLastPerformances() {
        if (!this.currentWorkout) return;
        
        try {
            const user = await Auth.getCurrentUser();
            if (!user) return;
            
            for (const exercise of this.currentWorkout.exercises) {
                try {
                    const lastData = await Database.getLastPerformance(exercise.id, user.id);
                    if (lastData && lastData.sets && lastData.sets.length > 0) {
                        // Get the best set from last workout
                        const bestSet = lastData.sets.reduce((best, set) => 
                            (set.weight_kg || 0) > (best.weight_kg || 0) ? set : best
                        , lastData.sets[0]);
                        exercise.lastPerformance = bestSet;
                    }
                } catch (e) {
                    // No previous data - that's fine
                }
            }
            
            this.renderWorkoutExercises();
        } catch (error) {
            console.error('Failed to load last performances:', error);
        }
    },
    
    // ====================================
    // Set Management
    // ====================================
    
    addSet(exerciseIndex) {
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        const newSetNumber = exercise.sets.length + 1;
        
        exercise.sets.push({
            set_number: newSetNumber,
            weight_kg: null,
            reps: null,
            rpe: null,
            completed: false
        });
        
        this.saveWorkout();
        this.renderWorkoutExercises();
    },
    
    updateSet(exerciseIndex, setIndex, field, value) {
        const set = this.currentWorkout.exercises[exerciseIndex].sets[setIndex];
        set[field] = value ? parseFloat(value) : null;
        
        this.saveWorkout();
    },
    
    toggleSetComplete(exerciseIndex, setIndex) {
        const set = this.currentWorkout.exercises[exerciseIndex].sets[setIndex];
        set.completed = !set.completed;
        
        this.saveWorkout();
        this.renderWorkoutExercises();
    },
    
    removeExercise(exerciseIndex) {
        if (confirm('להסיר את התרגיל?')) {
            this.currentWorkout.exercises.splice(exerciseIndex, 1);
            this.saveWorkout();
            this.renderWorkoutExercises();
        }
    },
    
    saveWorkout() {
        if (this.currentWorkout) {
            StorageManager.saveCurrentWorkout(this.currentWorkout);
        }
    },
    
    updateProgress() {
        const allSets = this.currentWorkout.exercises.flatMap(e => e.sets);
        const completed = allSets.filter(s => s.completed).length;
        const total = allSets.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        
        document.getElementById('progress-bar').style.width = `${percentage}%`;
    },
    
    // ====================================
    // Timer
    // ====================================
    
    startTimer() {
        this.timer = setInterval(() => this.updateTimer(), 1000);
    },
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
    
    updateTimer() {
        const elapsed = Date.now() - this.startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const display = document.getElementById('timer-display');
        if (display) {
            display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    },
    
    getDuration() {
        return Math.floor((Date.now() - this.startTime) / 60000); // minutes
    },
    
    formatDuration(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m} דק'`;
    },
    
    // ====================================
    // Finish Workout
    // ====================================
    
    finishWorkout() {
        this.stopTimer();
        
        const duration = this.getDuration();
        const exerciseCount = this.currentWorkout.exercises.length;
        const totalSets = this.currentWorkout.exercises.reduce((sum, e) => 
            sum + e.sets.filter(s => s.completed).length, 0
        );
        const totalVolume = this.currentWorkout.exercises.reduce((sum, e) => 
            sum + e.sets.reduce((setSum, s) => 
                s.completed ? setSum + ((s.weight_kg || 0) * (s.reps || 0)) : setSum, 0
            ), 0
        );
        
        // Update summary
        document.getElementById('summary-duration').textContent = this.formatDuration(duration);
        document.getElementById('summary-exercises').textContent = exerciseCount;
        document.getElementById('summary-sets').textContent = totalSets;
        document.getElementById('summary-volume').textContent = Math.round(totalVolume).toLocaleString();
        
        // Suggest workout name based on muscles worked
        const muscles = [...new Set(this.currentWorkout.exercises.map(e => e.muscle_group))];
        const suggestedName = this.suggestWorkoutName(muscles);
        document.getElementById('workout-name').value = suggestedName;
        
        // Show summary
        this.showStep('summary');
    },
    
    suggestWorkoutName(muscles) {
        if (muscles.includes('Chest') && muscles.includes('Shoulders') && muscles.includes('Arms')) {
            return 'Push Day';
        }
        if (muscles.includes('Back') && muscles.includes('Arms')) {
            return 'Pull Day';
        }
        if (muscles.includes('Legs')) {
            return 'Leg Day';
        }
        if (muscles.length === 1) {
            return this.translateMuscle(muscles[0]) + ' Workout';
        }
        return 'Full Body';
    },
    
    async saveAndFinish() {
        const name = document.getElementById('workout-name').value || 'אימון';
        const notes = document.getElementById('workout-notes').value;
        const duration = this.getDuration();
        
        const workoutData = {
            workout_name: name,
            workout_date: new Date(this.startTime).toISOString(),
            duration_minutes: duration,
            notes: notes
        };
        
        try {
            const user = await Auth.getCurrentUser();
            
            if (user && navigator.onLine) {
                // Save to database
                workoutData.user_id = user.id;
                const savedWorkout = await Database.createWorkout(workoutData);
                
                // Save exercises and sets
                for (let i = 0; i < this.currentWorkout.exercises.length; i++) {
                    const exercise = this.currentWorkout.exercises[i];
                    
                    const workoutExercise = await Database.addExerciseToWorkout({
                        workout_id: savedWorkout.id,
                        exercise_id: exercise.id,
                        exercise_order: i + 1
                    });
                    
                    for (const set of exercise.sets) {
                        if (set.completed) {
                            await Database.addSet({
                                workout_exercise_id: workoutExercise.id,
                                set_number: set.set_number,
                                weight_kg: set.weight_kg,
                                reps: set.reps,
                                rpe: set.rpe,
                                completed: true
                            });
                        }
                    }
                }
                
                alert('💪 האימון נשמר בהצלחה!');
            } else {
                // Save offline
                StorageManager.addToPendingQueue('workout', {
                    ...workoutData,
                    exercises: this.currentWorkout.exercises
                });
                alert('💾 האימון נשמר מקומית - יסונכרן כשתחזור לאינטרנט');
            }
            
            // Clear current workout
            StorageManager.clearCurrentWorkout();
            
            // Go back to home
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Failed to save workout:', error);
            alert('שגיאה בשמירה: ' + error.message);
        }
    },
    
    discardWorkout() {
        if (confirm('בטוח שרוצה למחוק את האימון?')) {
            this.stopTimer();
            StorageManager.clearCurrentWorkout();
            window.location.href = 'index.html';
        }
    },
    
    cancelWorkout() {
        if (confirm('לבטל את האימון? הנתונים לא יישמרו')) {
            this.stopTimer();
            StorageManager.clearCurrentWorkout();
            window.location.href = 'index.html';
        }
    },
    
    // ====================================
    // Step Navigation
    // ====================================
    
    showStep(stepName) {
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${stepName}`).classList.add('active');
    },
    
    addMoreExercises() {
        // Go back to selection but keep current workout
        this.showStep('selection');
        
        // Pre-select current exercises
        this.selectedExercises = [...this.currentWorkout.exercises];
        this.updateStartButton();
        this.renderExerciseList(this.exercises);
    },
    
    // ====================================
    // Modal
    // ====================================
    
    openModal() {
        document.getElementById('custom-exercise-modal').classList.remove('hidden');
    },
    
    closeModal() {
        document.getElementById('custom-exercise-modal').classList.add('hidden');
        document.getElementById('custom-exercise-form').reset();
    },
    
    async addCustomExercise(e) {
        e.preventDefault();
        
        const name = document.getElementById('custom-name').value;
        const muscle = document.getElementById('custom-muscle').value;
        
        const newExercise = {
            id: StorageManager.generateId(),
            exercise_name: name,
            muscle_group: muscle,
            exercise_type: 'weights',
            is_custom: true
        };
        
        // Add to local list
        this.exercises.push(newExercise);
        
        // Try to save to DB
        try {
            if (navigator.onLine) {
                await Database.createExercise(newExercise);
            }
        } catch (e) {
            console.log('Will sync custom exercise later');
        }
        
        // Update cache
        StorageManager.cacheExercises(this.exercises);
        
        // Re-render and close modal
        this.renderExerciseList(this.exercises);
        this.closeModal();
    },
    
    // ====================================
    // Event Listeners
    // ====================================
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('exercise-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = this.exercises.filter(ex => 
                    ex.exercise_name.toLowerCase().includes(query)
                );
                this.renderExerciseList(filtered);
            });
        }
        
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.renderExerciseList(this.exercises);
            });
        });
        
        // Start training button
        const startBtn = document.getElementById('start-training-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startWorkout());
        }
        
        // Add more exercises
        const addMoreBtn = document.getElementById('add-more-btn');
        if (addMoreBtn) {
            addMoreBtn.addEventListener('click', () => this.addMoreExercises());
        }
        
        // Finish workout
        const finishBtn = document.getElementById('finish-workout-btn');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishWorkout());
        }
        
        // Save workout
        const saveBtn = document.getElementById('save-workout-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAndFinish());
        }
        
        // Discard
        const discardBtn = document.getElementById('discard-btn');
        if (discardBtn) {
            discardBtn.addEventListener('click', () => this.discardWorkout());
        }
        
        // Cancel
        const cancelBtn = document.getElementById('cancel-workout-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelWorkout());
        }
        
        // Custom exercise modal
        const addCustomBtn = document.getElementById('add-custom-btn');
        if (addCustomBtn) {
            addCustomBtn.addEventListener('click', () => this.openModal());
        }
        
        const customForm = document.getElementById('custom-exercise-form');
        if (customForm) {
            customForm.addEventListener('submit', (e) => this.addCustomExercise(e));
        }
    },
    
    // ====================================
    // Helpers
    // ====================================
    
    getMuscleIcon(muscle) {
        const icons = {
            'Chest': '💪',
            'Back': '🔙',
            'Legs': '🦵',
            'Shoulders': '🎯',
            'Arms': '💪',
            'Core': '🔥',
            'Cardio': '🏃'
        };
        return icons[muscle] || '🏋️';
    },
    
    translateMuscle(muscle) {
        const translations = {
            'Chest': 'חזה',
            'Back': 'גב',
            'Legs': 'רגליים',
            'Shoulders': 'כתפיים',
            'Arms': 'ידיים',
            'Core': 'בטן',
            'Cardio': 'קרדיו'
        };
        return translations[muscle] || muscle;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    WorkoutApp.init();
});

// Export
window.WorkoutApp = WorkoutApp;
