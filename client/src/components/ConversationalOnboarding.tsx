import { MultilangString } from '@/types/conversationalOnboarding';

function getLocaleString(val: string | MultilangString | undefined, locale: string = 'fr'): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale as keyof MultilangString] || val.fr || Object.values(val)[0] || '';
}
// client/src/components/ConversationalOnboarding.tsx
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Clock, Star, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  ConversationalStep, 
  OnboardingData
} from '@/types/conversationalOnboarding';
import { 
  CONVERSATIONAL_ONBOARDING_FLOW, 
  calculateEstimatedTime
} from '@/data/conversationalFlow';
import { AVAILABLE_SPORTS, WELLNESS_PACKS, AVAILABLE_MODULES } from '@/data/onboardingData';
import SportSelector from './SportSelector';
import PositionSelector from './PositionSelector';
import PersonalInfoForm from './PersonalInfoForm';
import { useSports } from '@/services/sportsService';
import { SportOption } from '@/types/onboarding';

interface ConversationalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

// --- Prix par module (exemple)
const MODULE_PRICES: Record<string, number> = {
  sport: 9,
  strength: 7,
  nutrition: 7,
  sleep: 5,
  hydration: 5,
  wellness: 4
};

export default function ConversationalOnboarding({ onComplete, onSkip }: ConversationalOnboardingProps) {
  // Détection de la locale (par défaut fr, ou selon onboardingData.locale)
  const [locale, setLocale] = useState<'fr' | 'en' | 'us'>('fr');
  const { toast } = useToast();
  const [currentStepId, setCurrentStepId] = useState(CONVERSATIONAL_ONBOARDING_FLOW.initialStep);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    progress: {
      currentStep: CONVERSATIONAL_ONBOARDING_FLOW.initialStep,
      completedSteps: [],
      totalSteps: CONVERSATIONAL_ONBOARDING_FLOW.steps.length,
      estimatedTimeLeft: CONVERSATIONAL_ONBOARDING_FLOW.estimatedDuration,
      skipCount: 0,
      moduleSpecificSteps: {}
    },
    startedAt: new Date(),
    lastUpdated: new Date()
  });
  
  const [currentResponse, setCurrentResponse] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState<string | undefined>(undefined);
  const [trialModules, setTrialModules] = useState<string[]>([]);
  const [dynamicPrice, setDynamicPrice] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportOption | undefined>(undefined);

  const { sports: dynamicSports } = useSports();
  const currentStep = CONVERSATIONAL_ONBOARDING_FLOW.steps.find(step => step.id === currentStepId);

  // Validation des réponses
  const validateResponse = useCallback((step: ConversationalStep, response: any): string[] => {
    const errors: string[] = [];
    if (!step.validation) return errors;
    step.validation.forEach(rule => {
      let msg = getLocaleString(rule.message, locale);
      switch (rule.type) {
        case 'required':
          if (!response || (Array.isArray(response) && response.length === 0)) {
            errors.push(msg);
          }
          break;
        case 'min':
          if (typeof response === 'string' && response.length < rule.value) {
            errors.push(msg);
          } else if (typeof response === 'number' && response < rule.value) {
            errors.push(msg);
          }
          break;
        case 'max':
          if (typeof response === 'string' && response.length > rule.value) {
            errors.push(msg);
          } else if (typeof response === 'number' && response > rule.value) {
            errors.push(msg);
          }
          break;
        case 'custom':
          if (rule.validator && !rule.validator(response)) {
            errors.push(msg);
          }
          break;
      }
    });
    return errors;
  }, [locale]);

  // Navigation vers l'étape suivante
  // --- Calcul du prix dynamique selon modules ---
  const calculatePrice = (modules: string[]) => {
    return modules.reduce((sum, mod) => sum + (MODULE_PRICES[mod] || 0), 0);
  };

  const goToNextStep = useCallback(async () => {
    if (!currentStep) return;
    
    const errors = validateResponse(currentStep, currentResponse);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    setIsLoading(true);
    
    try {
      // Mise à jour des données
      const updatedData = {
        ...onboardingData,
        [getDataKeyForStep(currentStep.id)]: currentResponse,
        lastUpdated: new Date(),
        progress: {
          ...onboardingData.progress,
          completedSteps: [...onboardingData.progress.completedSteps, currentStep.id]
        }
      };
      
      // Détermination de l'étape suivante
      let nextStepId: string;
      if (typeof currentStep.nextStep === 'function') {
        nextStepId = currentStep.nextStep(currentResponse, updatedData);
      } else {
        nextStepId = currentStep.nextStep || 'completion';
      }

      // Gestion du pack sélectionné
      if (currentStep.id === 'pack_selection') {
        setSelectedPack(currentResponse);
        updatedData.selectedPack = currentResponse;
        // Si custom, modules choisis plus tard
        if (currentResponse !== 'custom') {
          const pack = WELLNESS_PACKS.find(p => p.id === currentResponse);
          if (pack) {
            updatedData.selectedModules = pack.modules;
            setDynamicPrice(calculatePrice(pack.modules));
          }
        }
      }

      // Gestion des modules custom
      if (currentStep.id === 'custom_module_selection') {
        updatedData.selectedModules = currentResponse;
        setDynamicPrice(calculatePrice(currentResponse));
      }

      // Gestion de l'upsell : suggestion de modules complémentaires
      if (currentStep.id === 'pack_upsell') {
        // Exemple de logique d'upsell
        const modules = updatedData.selectedModules || [];
        const suggestions: string[] = [];
        if (modules.includes('sport') && !modules.includes('strength')) suggestions.push('strength');
        if (modules.includes('strength') && !modules.includes('nutrition')) suggestions.push('nutrition');
        if (modules.includes('sport') && !modules.includes('sleep')) suggestions.push('sleep');
        updatedData.suggestedModules = suggestions;
        // Proposer essai gratuit sur ces modules
        setTrialModules(suggestions);
        updatedData.trialModules = suggestions;
        if (suggestions.length > 0) {
          // Date de fin d'essai 15 jours
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 15);
          updatedData.trialEndDate = trialEnd.toISOString();
        }
      }
      
      // Logique spéciale pour les modules
      if (currentStep.id === 'module_selection') {
        updatedData.selectedModules = currentResponse;
        updatedData.progress.estimatedTimeLeft = calculateEstimatedTime(currentResponse);
      }
      
      // Gestion des positions sportives dynamiques
      if (currentStep.id === 'sport_selection') {
        const selectedSportData = dynamicSports.find(sport => sport.id === currentResponse) || 
                                 AVAILABLE_SPORTS.find(sport => sport.id === currentResponse);
        
        if (selectedSportData) {
          setSelectedSport(selectedSportData);
          
          // Mise à jour des options pour l'étape position
          const positionStep = CONVERSATIONAL_ONBOARDING_FLOW.steps.find(s => s.id === 'sport_position');
          if (positionStep && selectedSportData.positions && selectedSportData.positions.length > 0) {
            positionStep.options = selectedSportData.positions.map(pos => ({
              id: pos.toLowerCase().replace(/\s+/g, '_'),
              label: pos,
              value: pos
            }));
          }
        }
      }
      
      setOnboardingData(updatedData);
      setCurrentStepId(nextStepId);
      setCurrentResponse(null);
      
      // Sauvegarde automatique seulement à certaines étapes importantes
      if ([
        'module_selection',
        'custom_module_selection',
        'pack_selection',
        'pack_upsell',
        'sport_selection',
        'personal_info'
      ].includes(currentStep.id)) {
        await saveProgress(updatedData);
      }
      
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, currentResponse, validateResponse]); // Retirer onboardingData des dépendances

  // Fonction pour mapper les valeurs vers les contraintes de la base de données
  const mapFitnessGoal = (mainObjective: string): string => {
    const mapping: Record<string, string> = {
      'performance': 'performance',
      'health_wellness': 'general_health',
      'body_composition': 'muscle_gain', // ou 'weight_loss' selon le contexte
      'energy_sleep': 'energy',
      'strength_building': 'strength',
      'endurance_cardio': 'endurance',
      'recovery_focus': 'recovery',
      'weight_management': 'maintenance',
      'weight_loss': 'weight_loss',
      'muscle_gain': 'muscle_gain'
    };
    
    return mapping[mainObjective] || 'general'; // Valeur par défaut si pas trouvé
  };

  const mapSportLevel = (sportLevel: string): string => {
    const mapping: Record<string, string> = {
      'recreational': 'recreational',
      'amateur_competitive': 'amateur_competitive',
      'semi_professional': 'semi_professional',
      'professional': 'professional',
      'beginner': 'recreational',
      'intermediate': 'amateur_competitive',
      'advanced': 'semi_professional',
      'expert': 'professional'
    };
    
    return mapping[sportLevel] || 'recreational'; // Valeur par défaut
  };

  // Sauvegarde des données
  // --- Sauvegarde enrichie du pack, modules d'essai, date d'essai ---
  const saveProgress = async (data: OnboardingData) => {
    try {
      console.log('🟡 Début de saveProgress avec data:', data);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🟡 User récupéré:', user?.id);
      
      if (!user) {
        console.error('🔴 Aucun utilisateur connecté');
        return;
      }
      
      console.log('🟡 Préparation des données pour upsert');
      const upsertData = {
        id: user.id,
        first_name: data.firstName,
        age: data.age,
        gender: data.gender,
        lifestyle: data.lifestyle,
        fitness_goal: mapFitnessGoal(data.mainObjective || ''), // Corrigé: utiliser le mapping
        modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'],
        active_modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'],
        selected_pack: data.selectedPack,
        trial_modules: data.trialModules || [],
        trial_end_date: data.trialEndDate || null,
        suggested_modules: data.suggestedModules || [],
        sport: data.sport,
        sport_position: data.sportPosition,
        sport_level: mapSportLevel(data.sportLevel || ''),
        season_period: data.seasonPeriod,
        training_frequency: data.trainingFrequency,
        equipment_level: data.equipmentLevel,
        strength_objective: data.strengthObjective,
        strength_experience: data.strengthExperience,
        dietary_preference: data.dietaryPreference,
        food_allergies: data.foodAllergies || [], // S'assurer que c'est un array
        nutrition_objective: data.nutritionObjective,
        dietary_restrictions: data.dietaryRestrictions || [], // S'assurer que c'est un array
        sleep_hours_average: data.averageSleepHours, // Corrigé: average_sleep_hours → sleep_hours_average
        sleep_difficulties: data.sleepDifficulties,
        water_intake_goal: data.hydrationGoal, // Corrigé: hydration_goal → water_intake_goal
        hydration_reminders: data.hydrationReminders,
        motivation: data.motivation,
        available_time_per_day: data.availableTimePerDay,
        privacy_consent: data.privacyConsent,
        marketing_consent: data.marketingConsent,
        updated_at: new Date().toISOString()
      };
      
      console.log('🟡 Données préparées pour upsert:', upsertData);
      
      const { data: insertedData, error } = await supabase
        .from('user_profiles')
        .upsert(upsertData);
      
      if (error) {
        console.error('🔴 Erreur sauvegarde Supabase:', error);
        console.error('🔴 Détails de l\'erreur:', error.message);
        console.error('🔴 Code d\'erreur:', error.code);
        console.error('🔴 Données qui ont causé l\'erreur:', upsertData);
      } else {
        console.log('🟢 Sauvegarde Supabase réussie');
        console.log('🟢 Données sauvegardées:', insertedData);
      }
    } catch (error) {
      console.error('🔴 Erreur lors de la sauvegarde:', error);
      if (error instanceof Error) {
        console.error('🔴 Stack trace:', error.stack);
      }
    }
  };

  // Finalisation de l'onboarding
  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      console.log('🟡 Début de completeOnboarding dans ConversationalOnboarding');
      
      const finalData = {
        ...onboardingData,
        progress: {
          ...onboardingData.progress,
          completedSteps: [...onboardingData.progress.completedSteps, 'completion']
        }
      };
      
      console.log('🟡 finalData préparée:', finalData);
      
      await saveProgress(finalData);
      console.log('🟡 saveProgress terminé avec succès');
      
      // Ne pas mettre à jour Supabase ici - laissons OnboardingQuestionnaire s'en charger
      // pour éviter les conflits de concurrence
      
      console.log('🟡 Appel de onComplete avec finalData');
      onComplete(finalData);
      console.log('🟡 onComplete appelé avec succès');
      
    } catch (error) {
      console.error('🔴 Erreur lors de la finalisation dans ConversationalOnboarding:', error);
      if (error instanceof Error) {
        console.error('🔴 Stack trace:', error.stack);
      }
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction utilitaire pour obtenir la clé de données
  const getDataKeyForStep = (stepId: string): keyof OnboardingData => {
    const keyMap: Record<string, keyof OnboardingData> = {
      'get_name': 'firstName',
      'main_objective': 'mainObjective',
      'module_selection': 'selectedModules',
      'sport_selection': 'sport',
      'sport_position': 'sportPosition',
      'sport_level': 'sportLevel',
      'sport_equipment': 'equipmentLevel',
      'strength_setup': 'strengthObjective',
      'strength_experience': 'strengthExperience',
      'nutrition_setup': 'dietaryPreference',
      'nutrition_objective': 'nutritionObjective',
      'sleep_setup': 'averageSleepHours',
      'sleep_difficulties': 'sleepDifficulties',
      'hydration_setup': 'hydrationGoal',
      'hydration_reminders': 'hydrationReminders',
      'final_questions': 'motivation',
      'privacy_consent': 'privacyConsent'
    };
    
    return keyMap[stepId] || 'firstName';
  };

  // Calcul du pourcentage de progression
  const progressPercentage = Math.round(
    (onboardingData.progress.completedSteps.length / onboardingData.progress.totalSteps) * 100
  );

  // Rendu conditionnel selon le type d'étape
  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'info':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">{currentStep.illustration}</div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{getLocaleString(currentStep.title, locale)}</h1>
              {currentStep.subtitle && (
                <p className="text-xl text-gray-600">{getLocaleString(currentStep.subtitle, locale)}</p>
              )}
              {currentStep.description && (
                <p className="text-gray-700 max-w-2xl mx-auto">{getLocaleString(currentStep.description, locale)}</p>
              )}
            </div>
            
            {currentStep.tips && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {(Array.isArray(currentStep.tips) ? currentStep.tips : []).map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      {getLocaleString(tip, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={goToNextStep} 
              size="lg" 
              className="w-full max-w-md"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Commencer"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'question':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">{currentStep.illustration}</div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getLocaleString(currentStep.title, locale).replace('{firstName}', onboardingData.firstName || '')}
              </h1>
              {currentStep.question && (
                <p className="text-lg text-gray-700">{getLocaleString(currentStep.question, locale)}</p>
              )}
              {currentStep.description && (
                <p className="text-gray-600">{getLocaleString(currentStep.description, locale)}</p>
              )}
            </div>

            <div className="max-w-2xl mx-auto">
              {renderQuestionInput()}
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-center text-red-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between max-w-2xl mx-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowTips(!showTips)}
                className="flex items-center"
              >
                <Star className="h-4 w-4 mr-2" />
                Conseils
              </Button>
              
              <Button 
                onClick={goToNextStep}
                disabled={isLoading || !currentResponse}
                className="flex items-center"
              >
                {isLoading ? "Chargement..." : "Continuer"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">{currentStep.illustration}</div>
              <h1 className="text-2xl font-bold text-gray-900">{getLocaleString(currentStep.title, locale)}</h1>
              <p className="text-gray-600">{getLocaleString(currentStep.description, locale)}</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {renderSummaryContent()}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={completeOnboarding}
                disabled={isLoading}
                size="lg"
                className="w-full max-w-md"
              >
                {isLoading ? "Finalisation..." : "Terminer la configuration"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">{currentStep.illustration}</div>
            <h1 className="text-3xl font-bold text-gray-900">{getLocaleString(currentStep.title, locale)}</h1>
            <p className="text-xl text-gray-600">{getLocaleString(currentStep.description, locale)}</p>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🎉 Félicitations !</h3>
              <p className="text-green-800">
                Votre profil MyFitHero est maintenant configuré. Vous allez être redirigé vers votre tableau de bord personnalisé.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Rendu des types de questions
  const renderQuestionInput = () => {
    if (!currentStep) return null;

    switch (currentStep.inputType) {
      case 'text':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={currentResponse || ''}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Votre réponse..."
              className="text-lg p-4"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={currentResponse || ''}
              onChange={(e) => setCurrentResponse(Number(e.target.value))}
              placeholder="Votre réponse..."
              className="text-lg p-4"
            />
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {currentResponse || 7}
                {currentStep.id === 'hydration_setup' ? ' L/jour' : ' heures/nuit'}
              </span>
            </div>
            <Slider
              value={[currentResponse || 7]}
              onValueChange={(value) => setCurrentResponse(value[0])}
              max={currentStep.id === 'hydration_setup' ? 5 : 12}
              min={currentStep.id === 'hydration_setup' ? 1 : 4}
              step={0.5}
              className="w-full"
            />
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center justify-center space-x-3">
            <span className="text-lg">Non</span>
            <Switch
              checked={currentResponse || false}
              onCheckedChange={(checked) => setCurrentResponse(checked)}
            />
            <span className="text-lg">Oui</span>
          </div>
        );

      case 'single-select':
        // Gestion spéciale pour les informations personnelles
        if (currentStep.id === 'personal_info') {
          return (
            <PersonalInfoForm
              onComplete={(data) => {
                // Ne pas utiliser setCurrentResponse avec un objet car cela cause React error #31
                // Mettre à jour directement les données d'onboarding
                setOnboardingData(prev => ({
                  ...prev,
                  age: data.age,
                  gender: data.gender,
                  lifestyle: data.lifestyle,
                  availableTimePerDay: data.availableTimePerDay
                }));
                
                // Aller directement à l'étape suivante
                let nextStepId: string;
                if (typeof currentStep.nextStep === 'function') {
                  nextStepId = currentStep.nextStep(data, {
                    ...onboardingData,
                    age: data.age,
                    gender: data.gender,
                    lifestyle: data.lifestyle,
                    availableTimePerDay: data.availableTimePerDay
                  });
                } else {
                  nextStepId = currentStep.nextStep || 'completion';
                }
                
                if (nextStepId) {
                  setCurrentStepId(nextStepId);
                }
              }}
              initialData={{
                age: onboardingData.age,
                gender: onboardingData.gender,
                lifestyle: onboardingData.lifestyle,
                availableTimePerDay: onboardingData.availableTimePerDay
              }}
            />
          );
        }
        
        // Gestion spéciale pour la sélection de sport
        if (currentStep.id === 'sport_selection') {
          return (
            <SportSelector
              onSelect={(sport) => setCurrentResponse(sport.id)}
              selectedSport={selectedSport}
              placeholder="Recherchez votre sport..."
            />
          );
        }
        
        // Gestion spéciale pour la sélection de position
        if (currentStep.id === 'sport_position' && selectedSport) {
          return (
            <PositionSelector
              sport={selectedSport}
              onSelect={(position) => setCurrentResponse(position)}
              selectedPosition={typeof currentResponse === 'string' ? currentResponse : undefined}
            />
          );
        }
        
        return (
          <div className="grid gap-3">
            {currentStep.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => setCurrentResponse(option.value)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
                  currentResponse === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && <span className="text-2xl">{option.icon}</span>}
                  <div className="flex-1">
                    <div className="font-semibold">{getLocaleString(option.label, locale)}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600">{getLocaleString(option.description, locale)}</div>
                    )}
                  </div>
                  {currentResponse === option.value && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="grid gap-3">
            {currentStep.options?.map((option) => {
              const isSelected = Array.isArray(currentResponse) && currentResponse.includes(option.value);
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    const current = Array.isArray(currentResponse) ? currentResponse : [];
                    if (isSelected) {
                      setCurrentResponse(current.filter(v => v !== option.value));
                    } else {
                      setCurrentResponse([...current, option.value]);
                    }
                  }}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {option.icon && <span className="text-2xl">{option.icon}</span>}
                    <div className="flex-1">
                      <div className="font-semibold">{getLocaleString(option.label, locale)}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600">{getLocaleString(option.description, locale)}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  // Rendu du résumé
  const renderSummaryContent = () => {
    const sections = [
      {
        title: "Informations personnelles",
        items: [
          { label: "Prénom", value: onboardingData.firstName },
          { label: "Âge", value: onboardingData.age },
          { label: "Objectif principal", value: WELLNESS_PACKS.find(o => o.id === onboardingData.mainObjective)?.name }
        ]
      },
      {
        title: "Modules sélectionnés",
        items: onboardingData.selectedModules?.map(moduleId => ({
          label: AVAILABLE_MODULES.find(m => m.id === moduleId)?.name || moduleId,
          value: "✓"
        })) || []
      }
    ];

    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">Erreur de configuration</h1>
          <p className="text-gray-600 mt-2">Impossible de charger l'étape d'onboarding</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* En-tête avec progression */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="font-bold text-xl text-gray-900">MyFitHero</div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Onboarding
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>~{onboardingData.progress.estimatedTimeLeft} min</span>
              </div>
              {onSkip && (
                <Button variant="ghost" onClick={onSkip}>
                  Ignorer
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression: {progressPercentage}%
              </span>
              <span className="text-sm text-gray-500">
                ({onboardingData.progress.completedSteps.length}/{onboardingData.progress.totalSteps})
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>

      {/* Conseils en bas */}
      {showTips && currentStep.tips && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">💡 Conseils</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowTips(false)}>
              ×
            </Button>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            {(Array.isArray(currentStep.tips) ? currentStep.tips : []).map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                {getLocaleString(tip, locale)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
