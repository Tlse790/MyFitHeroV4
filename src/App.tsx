import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import type { Session } from '@supabase/supabase-js';

// Import des pages
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import Dashboard from '@/pages/Dashboard';
import Hydration from '@/pages/Hydration';
import Nutrition from '@/pages/Nutrition';
import Sleep from '@/pages/Sleep';
import Workout from '@/pages/Workout';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';

// Types pour l'onboarding
interface UserProfileOnboarding {
  profile_type: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus';
  modules: string[];
  active_modules?: string[];
  age: number | null;
  gender: 'male' | 'female' | null;
  lifestyle: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
  available_time_per_day: number | null;
  fitness_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  injuries: string[];
  primary_goals: string[];
  motivation: string;
  fitness_goal?: string | null;
  sport: string | null;
  sport_position: string | null;
  sport_level: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional' | null;
  training_frequency: number | null;
  season_period: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
  dietary_preference?: string | null;
  food_allergies?: string[];
  dietary_restrictions?: string[];
  food_dislikes?: string[];
}

const App: React.FC = () => {
  // Debug logs
  console.log('🚀 MyFitHero App starting...');

  // States
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Store et hooks
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  const { toast } = useToast();

  console.log('📦 Store user:', appStoreUser);

  // Vérification de session au montage
  useEffect(() => {
    console.log('🔄 Checking auth session...');

    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Current session:', session ? 'Found' : 'None');
      setSession(session);
      
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event);
      setSession(session);
      
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setHasCompletedOnboarding(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier le statut onboarding
  const checkOnboardingStatus = async (userId: string) => {
    try {
      console.log('🔍 Checking onboarding status for:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking onboarding:', error);
        setLoading(false);
        return;
      }

      if (data && data.age && data.gender && data.sport) {
        console.log('✅ Onboarding completed');
        setHasCompletedOnboarding(true);
        
        // Mettre à jour le store avec les données utilisateur
        updateAppStoreUserProfile({
          id: data.id,
          name: data.full_name || data.username || 'Utilisateur',
          email: data.email || '',
          age: data.age,
          gender: data.gender,
          sport: data.sport,
          sport_position: data.sport_position,
          sport_level: data.sport_level,
          lifestyle: data.lifestyle,
          fitness_experience: data.fitness_experience,
          primary_goals: data.primary_goals || [],
          training_frequency: data.training_frequency,
          season_period: data.season_period,
          available_time_per_day: data.available_time_per_day,
          daily_calories: data.daily_calories,
          active_modules: data.active_modules || ['sport'],
          modules: data.modules || ['sport', 'nutrition', 'sleep', 'hydration'],
          profile_type: data.profile_type,
          sport_specific_stats: data.sport_specific_stats || {}
        });
      } else {
        console.log('⚠️ Onboarding not completed');
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('❌ Error in checkOnboardingStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la fin d'onboarding
  const handleOnboardingComplete = async (profileData: UserProfileOnboarding) => {
    if (!session?.user) {
      console.error('❌ No user session found');
      toast({
        title: "Erreur",
        description: "Session utilisateur introuvable. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Completing onboarding with data:', profileData);
      
      // MAPPING profile_type → active_modules
      const getActiveModules = (profileType: string): string[] => {
        switch (profileType) {
          case 'complete':
            return ['sport', 'nutrition', 'sleep', 'hydration'];
          case 'wellness':
            return ['nutrition', 'sleep', 'hydration'];
          case 'sport_only':
            return ['sport'];
          case 'sleep_focus':
            return ['sleep', 'hydration'];
          default:
            return ['sport'];
        }
      };

      // CALCUL AUTOMATIQUE CALORIES
      const calculateDailyCalories = (age: number, gender: string, lifestyle: string, fitnessGoal: string) => {
        const weight = 70; // Poids moyen par défaut
        
        // BMR (Métabolisme de base)
        const bmr = gender === 'male' 
          ? 88.362 + (13.397 * weight) + (4.799 * 175) - (5.677 * age)
          : 447.593 + (9.247 * weight) + (3.098 * 160) - (4.330 * age);
        
        // Facteur d'activité selon lifestyle
        const activityFactors: Record<string, number> = {
          'student': 1.4,
          'office_worker': 1.3,
          'physical_job': 1.6,
          'retired': 1.2
        };
        
        const activityFactor = activityFactors[lifestyle] || 1.4;
        
        // Ajustement selon l'objectif
        const goalAdjustments: Record<string, number> = {
          'weight_loss': -300,
          'muscle_gain': 400,
          'performance': 200,
          'general': 0
        };
        
        const adjustment = goalAdjustments[fitnessGoal] || 0;
        
        return Math.round(bmr * activityFactor + adjustment);
      };

      const activeModules = getActiveModules(profileData.profile_type);
      const dailyCalories = calculateDailyCalories(
        profileData.age || 25, 
        profileData.gender || 'male', 
        profileData.lifestyle || 'office_worker', 
        profileData.fitness_goal || 'general'
      );
      
      const updatesToDb = {
        // Champs critiques
        profile_type: profileData.profile_type,
        modules: ['sport', 'nutrition', 'sleep', 'hydration'],
        active_modules: activeModules,
        daily_calories: dailyCalories,
        
        // Données profil
        age: profileData.age,
        gender: profileData.gender,
        lifestyle: profileData.lifestyle,
        available_time_per_day: profileData.available_time_per_day,
        fitness_experience: profileData.fitness_experience,
        injuries: profileData.injuries,
        primary_goals: profileData.primary_goals,
        motivation: profileData.motivation,
        fitness_goal: profileData.fitness_goal || 'general',
        sport: profileData.sport || 'none',
        sport_position: profileData.sport_position,
        sport_level: profileData.sport_level || 'recreational',
        training_frequency: profileData.training_frequency || 0,
        season_period: profileData.season_period || 'off_season',
        dietary_preference: profileData.dietary_preference,
        food_allergies: profileData.food_allergies || [],
        dietary_restrictions: profileData.dietary_restrictions || [],
        food_dislikes: profileData.food_dislikes || [],
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Saving to DB with active_modules:', activeModules);
      console.log('🍎 Daily calories calculated:', dailyCalories);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updatesToDb)
        .eq('id', session.user.id)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      if (data && data[0]) {
        console.log('✅ Onboarding completed successfully:', data[0]);
        
        // Mettre à jour le store
        updateAppStoreUserProfile({
          id: data[0].id,
          name: data[0].full_name || data[0].username || 'Utilisateur',
          email: session.user.email || '',
          age: data[0].age,
          gender: data[0].gender,
          sport: data[0].sport,
          sport_position: data[0].sport_position,
          sport_level: data[0].sport_level,
          lifestyle: data[0].lifestyle,
          fitness_experience: data[0].fitness_experience,
          primary_goals: data[0].primary_goals || [],
          training_frequency: data[0].training_frequency,
          season_period: data[0].season_period,
          available_time_per_day: data[0].available_time_per_day,
          daily_calories: data[0].daily_calories,
          active_modules: data[0].active_modules || activeModules,
          modules: data[0].modules || ['sport', 'nutrition', 'sleep', 'hydration'],
          profile_type: data[0].profile_type,
          level: appStoreUser.level || 1,
          totalPoints: appStoreUser.totalPoints || 0,
          joinDate: new Date(data[0].created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
        
        setHasCompletedOnboarding(true);
        
        toast({
          title: "Profil complété !",
          description: `Bienvenue dans MyFitHero ! ${activeModules.length} module(s) activé(s).`,
        });
      }

    } catch (error: any) {
      console.error('❌ Error saving onboarding data:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de MyFitHero...</p>
        </div>
      </div>
    );
  }

  // Pas de session = redirection auth
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">MyFitHero</h1>
          <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Onboarding non terminé
  if (!hasCompletedOnboarding) {
    return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
  }

  // App principale avec routes
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/hydration" 
          element={
            <ProtectedRoute moduleRequired="hydration">
              <Hydration />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/nutrition" 
          element={
            <ProtectedRoute moduleRequired="nutrition">
              <Nutrition />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sleep" 
          element={
            <ProtectedRoute moduleRequired="sleep">
              <Sleep />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/workout" 
          element={
            <ProtectedRoute moduleRequired="sport">
              <Workout />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Route de fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
