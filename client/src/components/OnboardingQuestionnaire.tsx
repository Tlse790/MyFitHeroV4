import React from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ConversationalOnboarding from './ConversationalOnboarding';
import { OnboardingData } from '@/types/conversationalOnboarding';

interface OnboardingQuestionnaireProps {
  user: any;
  onComplete: () => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ user, onComplete }) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Gérer la finalisation du nouvel onboarding
  const handleConversationalComplete = async (data: OnboardingData) => {
    try {
      console.log('Début de la finalisation de l\'onboarding', { userId: user?.id, data });
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          profile_type: 'complete',
          modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'], // Corrigé: active_modules → modules
          active_modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'], // Ajouté pour cohérence
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        console.error('🔴 Détails de l\'erreur:', error.message);
        console.error('🔴 Code d\'erreur:', error.code);
        console.error('🔴 User ID utilisé:', user.id);
        throw error;
      }

      console.log('Mise à jour Supabase réussie');

      toast({
        title: 'Bienvenue dans MyFitHero !',
        description: 'Votre profil a été créé avec succès.',
      });

      onComplete();
      // Rediriger vers la page d'accueil après succès
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la finalisation. Veuillez réessayer.',
        variant: 'destructive'
      });
      // Ne pas appeler onComplete() en cas d'erreur pour permettre à l'utilisateur de réessayer
    }
  };

  return (
    <ConversationalOnboarding
      onComplete={handleConversationalComplete}
    />
  );
};

export default OnboardingQuestionnaire;
