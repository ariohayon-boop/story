/**
 * Supabase Client Configuration
 * GymTracker - מעקב אימונים
 */

// Supabase Configuration
// TODO: החלף את הערכים האלה בפרטי ה-Supabase שלך
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // לדוגמה: 'https://xrbzofqgyukkdjwumdft.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Auth Functions - ניהול משתמשים
 */
const Auth = {
    
    // בדיקה אם המשתמש מחובר
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    },
    
    // האזנה לשינויים במצב ההתחברות
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    },
    
    // התחברות עם אימייל וסיסמה
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },
    
    // הרשמה עם אימייל וסיסמה
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },
    
    // התנתקות
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
    
    // איפוס סיסמה
    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    }
};

/**
 * Database Functions - ניהול נתונים
 */
const Database = {
    
    // ====== WORKOUTS ======
    
    // קבלת כל האימונים של המשתמש
    async getWorkouts(limit = 50) {
        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .order('workout_date', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    },
    
    // קבלת אימון בודד עם כל הפרטים
    async getWorkoutById(workoutId) {
        const { data, error } = await supabase
            .from('workouts')
            .select(`
                *,
                workout_exercises (
                    *,
                    exercises (*),
                    sets (*)
                )
            `)
            .eq('id', workoutId)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // יצירת אימון חדש
    async createWorkout(workoutData) {
        const { data, error } = await supabase
            .from('workouts')
            .insert([workoutData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // עדכון אימון
    async updateWorkout(workoutId, updates) {
        const { data, error } = await supabase
            .from('workouts')
            .update(updates)
            .eq('id', workoutId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // מחיקת אימון
    async deleteWorkout(workoutId) {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);
        
        if (error) throw error;
    },
    
    // ====== EXERCISES ======
    
    // קבלת כל התרגילים (כולל מותאמים אישית)
    async getExercises() {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('exercise_name');
        
        if (error) throw error;
        return data;
    },
    
    // קבלת תרגילים לפי קבוצת שרירים
    async getExercisesByMuscle(muscleGroup) {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('muscle_group', muscleGroup)
            .order('exercise_name');
        
        if (error) throw error;
        return data;
    },
    
    // יצירת תרגיל מותאם אישית
    async createExercise(exerciseData) {
        const { data, error } = await supabase
            .from('exercises')
            .insert([{ ...exerciseData, is_custom: true }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // ====== WORKOUT EXERCISES ======
    
    // הוספת תרגיל לאימון
    async addExerciseToWorkout(workoutExerciseData) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .insert([workoutExerciseData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // עדכון סדר תרגילים
    async updateExerciseOrder(workoutExerciseId, newOrder) {
        const { error } = await supabase
            .from('workout_exercises')
            .update({ exercise_order: newOrder })
            .eq('id', workoutExerciseId);
        
        if (error) throw error;
    },
    
    // הסרת תרגיל מאימון
    async removeExerciseFromWorkout(workoutExerciseId) {
        const { error } = await supabase
            .from('workout_exercises')
            .delete()
            .eq('id', workoutExerciseId);
        
        if (error) throw error;
    },
    
    // ====== SETS ======
    
    // הוספת סט
    async addSet(setData) {
        const { data, error } = await supabase
            .from('sets')
            .insert([setData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // עדכון סט
    async updateSet(setId, updates) {
        const { data, error } = await supabase
            .from('sets')
            .update(updates)
            .eq('id', setId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // מחיקת סט
    async deleteSet(setId) {
        const { error } = await supabase
            .from('sets')
            .delete()
            .eq('id', setId);
        
        if (error) throw error;
    },
    
    // ====== STATISTICS ======
    
    // קבלת סטטיסטיקות כלליות
    async getWorkoutStats(userId) {
        // אימונים השבוע
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: weeklyData, error: weeklyError } = await supabase
            .from('workouts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .gte('workout_date', weekAgo.toISOString());
        
        // אימונים החודש
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        const { data: monthlyData, error: monthlyError } = await supabase
            .from('workouts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .gte('workout_date', monthAgo.toISOString());
        
        if (weeklyError) throw weeklyError;
        if (monthlyError) throw monthlyError;
        
        return {
            weeklyWorkouts: weeklyData?.length || 0,
            monthlyWorkouts: monthlyData?.length || 0
        };
    },
    
    // קבלת היסטוריית תרגיל ספציפי (לגרפים)
    async getExerciseHistory(exerciseId, limit = 20) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .select(`
                workout_id,
                workouts!inner (workout_date),
                sets (weight_kg, reps, rpe)
            `)
            .eq('exercise_id', exerciseId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    },
    
    // קבלת הסט האחרון של תרגיל (להצגה ב-Active Workout)
    async getLastPerformance(exerciseId, userId) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .select(`
                workouts!inner (user_id, workout_date),
                sets (weight_kg, reps, rpe, set_number)
            `)
            .eq('exercise_id', exerciseId)
            .eq('workouts.user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        return data;
    },
    
    // ====== PERSONAL RECORDS ======
    
    // קבלת כל השיאים
    async getPersonalRecords(userId) {
        const { data, error } = await supabase
            .from('personal_records')
            .select(`
                *,
                exercises (exercise_name, muscle_group)
            `)
            .eq('user_id', userId)
            .order('achieved_date', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    // בדיקה ועדכון שיא
    async checkAndUpdatePR(exerciseId, userId, recordType, value, workoutId) {
        // בדיקה אם יש שיא קיים
        const { data: existingPR, error: fetchError } = await supabase
            .from('personal_records')
            .select('*')
            .eq('exercise_id', exerciseId)
            .eq('user_id', userId)
            .eq('record_type', recordType)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        // אם אין שיא או השיא החדש גדול יותר - עדכון
        if (!existingPR || value > existingPR.value) {
            if (existingPR) {
                // עדכון שיא קיים
                const { error } = await supabase
                    .from('personal_records')
                    .update({
                        value,
                        achieved_date: new Date().toISOString(),
                        workout_id: workoutId
                    })
                    .eq('id', existingPR.id);
                
                if (error) throw error;
            } else {
                // יצירת שיא חדש
                const { error } = await supabase
                    .from('personal_records')
                    .insert([{
                        exercise_id: exerciseId,
                        user_id: userId,
                        record_type: recordType,
                        value,
                        achieved_date: new Date().toISOString(),
                        workout_id: workoutId
                    }]);
                
                if (error) throw error;
            }
            
            return true; // שיא חדש!
        }
        
        return false; // לא שיא
    }
};

// Export for use in other files
window.supabaseClient = supabase;
window.Auth = Auth;
window.Database = Database;
