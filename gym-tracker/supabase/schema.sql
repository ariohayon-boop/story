-- ====================================
-- GymTracker Database Schema
-- Run this in Supabase SQL Editor
-- ====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. EXERCISES (בנק תרגילים)
-- ====================================
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT NOT NULL CHECK (muscle_group IN ('Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio')),
    exercise_type TEXT NOT NULL DEFAULT 'weights' CHECK (exercise_type IN ('weights', 'bodyweight', 'cardio', 'stretching')),
    is_custom BOOLEAN DEFAULT FALSE,
    description TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);

-- ====================================
-- 2. WORKOUTS (אימונים)
-- ====================================
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_name TEXT NOT NULL,
    workout_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date DESC);

-- ====================================
-- 3. WORKOUT_EXERCISES (תרגילים באימון)
-- ====================================
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    exercise_order INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises(exercise_id);

-- ====================================
-- 4. SETS (סטים - הנתונים החשובים!)
-- ====================================
CREATE TABLE IF NOT EXISTS sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight_kg DECIMAL(10,2),
    reps INTEGER,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    distance_km DECIMAL(10,2),
    duration_seconds INTEGER,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets(workout_exercise_id);

-- ====================================
-- 5. PERSONAL_RECORDS (שיאים אישיים)
-- ====================================
CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume')),
    value DECIMAL(10,2) NOT NULL,
    achieved_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Each user can have one record per exercise per type
    UNIQUE(user_id, exercise_id, record_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_id);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Enable RLS on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- ====================================
-- RLS Policies
-- ====================================

-- EXERCISES: Users can see default exercises (user_id IS NULL) and their own custom ones
CREATE POLICY "Users can view default and own exercises" ON exercises
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create custom exercises" ON exercises
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own exercises" ON exercises
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own exercises" ON exercises
    FOR DELETE USING (user_id = auth.uid());

-- WORKOUTS: Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON workouts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create workouts" ON workouts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workouts" ON workouts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workouts" ON workouts
    FOR DELETE USING (user_id = auth.uid());

-- WORKOUT_EXERCISES: Access through workout ownership
CREATE POLICY "Users can view workout exercises" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workout exercises" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update workout exercises" ON workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete workout exercises" ON workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

-- SETS: Access through workout_exercises → workouts
CREATE POLICY "Users can view sets" ON sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create sets" ON sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sets" ON sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sets" ON sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

-- PERSONAL_RECORDS: Users can only access their own records
CREATE POLICY "Users can view own records" ON personal_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create records" ON personal_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own records" ON personal_records
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own records" ON personal_records
    FOR DELETE USING (user_id = auth.uid());

-- ====================================
-- INSERT DEFAULT EXERCISES
-- ====================================

INSERT INTO exercises (exercise_name, muscle_group, exercise_type, is_custom) VALUES
-- Chest
('Bench Press', 'Chest', 'weights', FALSE),
('Incline Bench Press', 'Chest', 'weights', FALSE),
('Decline Bench Press', 'Chest', 'weights', FALSE),
('Dumbbell Press', 'Chest', 'weights', FALSE),
('Incline Dumbbell Press', 'Chest', 'weights', FALSE),
('Dumbbell Flyes', 'Chest', 'weights', FALSE),
('Cable Flyes', 'Chest', 'weights', FALSE),
('Push-ups', 'Chest', 'bodyweight', FALSE),
('Dips', 'Chest', 'bodyweight', FALSE),
('Machine Chest Press', 'Chest', 'weights', FALSE),
('Pec Deck', 'Chest', 'weights', FALSE),

-- Back
('Deadlift', 'Back', 'weights', FALSE),
('Bent Over Row', 'Back', 'weights', FALSE),
('T-Bar Row', 'Back', 'weights', FALSE),
('Pull-ups', 'Back', 'bodyweight', FALSE),
('Chin-ups', 'Back', 'bodyweight', FALSE),
('Lat Pulldown', 'Back', 'weights', FALSE),
('Cable Row', 'Back', 'weights', FALSE),
('Seated Row', 'Back', 'weights', FALSE),
('Face Pulls', 'Back', 'weights', FALSE),
('Single Arm Dumbbell Row', 'Back', 'weights', FALSE),
('Hyperextensions', 'Back', 'bodyweight', FALSE),

-- Legs
('Squat', 'Legs', 'weights', FALSE),
('Front Squat', 'Legs', 'weights', FALSE),
('Leg Press', 'Legs', 'weights', FALSE),
('Hack Squat', 'Legs', 'weights', FALSE),
('Romanian Deadlift', 'Legs', 'weights', FALSE),
('Stiff Leg Deadlift', 'Legs', 'weights', FALSE),
('Leg Curl', 'Legs', 'weights', FALSE),
('Leg Extension', 'Legs', 'weights', FALSE),
('Lunges', 'Legs', 'weights', FALSE),
('Bulgarian Split Squat', 'Legs', 'weights', FALSE),
('Calf Raises', 'Legs', 'weights', FALSE),
('Seated Calf Raises', 'Legs', 'weights', FALSE),
('Hip Thrust', 'Legs', 'weights', FALSE),
('Goblet Squat', 'Legs', 'weights', FALSE),

-- Shoulders
('Overhead Press', 'Shoulders', 'weights', FALSE),
('Seated Shoulder Press', 'Shoulders', 'weights', FALSE),
('Arnold Press', 'Shoulders', 'weights', FALSE),
('Lateral Raises', 'Shoulders', 'weights', FALSE),
('Front Raises', 'Shoulders', 'weights', FALSE),
('Rear Delt Flyes', 'Shoulders', 'weights', FALSE),
('Cable Lateral Raises', 'Shoulders', 'weights', FALSE),
('Shrugs', 'Shoulders', 'weights', FALSE),
('Upright Row', 'Shoulders', 'weights', FALSE),
('Machine Shoulder Press', 'Shoulders', 'weights', FALSE),

-- Arms
('Barbell Curl', 'Arms', 'weights', FALSE),
('Dumbbell Curl', 'Arms', 'weights', FALSE),
('Hammer Curl', 'Arms', 'weights', FALSE),
('Preacher Curl', 'Arms', 'weights', FALSE),
('Cable Curl', 'Arms', 'weights', FALSE),
('Concentration Curl', 'Arms', 'weights', FALSE),
('Tricep Pushdown', 'Arms', 'weights', FALSE),
('Overhead Tricep Extension', 'Arms', 'weights', FALSE),
('Skull Crushers', 'Arms', 'weights', FALSE),
('Close Grip Bench Press', 'Arms', 'weights', FALSE),
('Tricep Dips', 'Arms', 'bodyweight', FALSE),
('Cable Tricep Kickback', 'Arms', 'weights', FALSE),
('EZ Bar Curl', 'Arms', 'weights', FALSE),
('Wrist Curls', 'Arms', 'weights', FALSE),

-- Core
('Plank', 'Core', 'bodyweight', FALSE),
('Side Plank', 'Core', 'bodyweight', FALSE),
('Crunches', 'Core', 'bodyweight', FALSE),
('Sit-ups', 'Core', 'bodyweight', FALSE),
('Leg Raises', 'Core', 'bodyweight', FALSE),
('Hanging Leg Raises', 'Core', 'bodyweight', FALSE),
('Russian Twists', 'Core', 'bodyweight', FALSE),
('Cable Crunches', 'Core', 'weights', FALSE),
('Ab Wheel Rollout', 'Core', 'bodyweight', FALSE),
('Mountain Climbers', 'Core', 'bodyweight', FALSE),
('Dead Bug', 'Core', 'bodyweight', FALSE),
('Bird Dog', 'Core', 'bodyweight', FALSE),

-- Cardio
('Running', 'Cardio', 'cardio', FALSE),
('Cycling', 'Cardio', 'cardio', FALSE),
('Rowing', 'Cardio', 'cardio', FALSE),
('Elliptical', 'Cardio', 'cardio', FALSE),
('Stair Climber', 'Cardio', 'cardio', FALSE),
('Jump Rope', 'Cardio', 'cardio', FALSE),
('Swimming', 'Cardio', 'cardio', FALSE),
('Walking', 'Cardio', 'cardio', FALSE)

ON CONFLICT DO NOTHING;

-- ====================================
-- Done! 🎉
-- ====================================
