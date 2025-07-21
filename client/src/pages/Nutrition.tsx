import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Coffee,
  Sun,
  Moon as MoonIcon,
  Apple,
  Zap,
  Info,
  Dumbbell,
  Footprints,
  Trophy
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import AIIntelligence from '@/components/AIIntelligence';
import { UniformHeader } from '@/components/UniformHeader';

// --- TYPES & INTERFACES ---
type Sport = 'strength' | 'basketball' | 'american_football' | 'tennis' | 'endurance' | 'football';

interface MealSuggestion {
  name: string;
  icon: React.ElementType;
  meal_type_db: string;
}

interface SportNutritionConfig {
  emoji: string;
  calorieModifier: number;
  proteinMultiplier: number;
  carbMultiplier: number;
  dailyTip: string;
  hydrationTip: string;
  mealSuggestions: { [key: string]: MealSuggestion };
}

// --- CONFIGURATION NUTRITIONNELLE PAR SPORT ---
const sportsNutritionData: Record<Sport, SportNutritionConfig> = {
  strength: {
    emoji: '💪',
    calorieModifier: 300,
    proteinMultiplier: 1.5,
    carbMultiplier: 1.0,
    dailyTip: "Priorisez les protéines dans les 90 minutes après l'entraînement pour maximiser la réparation et la croissance musculaire. La créatine peut également être un supplément efficace.",
    hydrationTip: "Une bonne hydratation est cruciale pour la force. Visez au moins 2.5L par jour.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner Protéiné', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Déjeuner', icon: Sun, meal_type_db: 'lunch' },
      post_workout: { name: 'Post-Entraînement', icon: Dumbbell, meal_type_db: 'snack' },
      dinner: { name: 'Dîner', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  basketball: {
    emoji: '🏀',
    calorieModifier: 250,
    proteinMultiplier: 1.2,
    carbMultiplier: 1.3,
    dailyTip: "Les glucides à action rapide 1-2h avant un match ou un entraînement intense peuvent vous donner l'énergie explosive nécessaire sur le terrain.",
    hydrationTip: "L'hydratation est la clé de l'endurance. Buvez régulièrement tout au long de la journée, pas seulement pendant l'effort.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner', icon: Coffee, meal_type_db: 'breakfast' },
      pre_game: { name: 'Repas pré-match', icon: Zap, meal_type_db: 'lunch' },
      snack: { name: 'Collation énergétique', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner de récupération', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  american_football: {
    emoji: '🏈',
    calorieModifier: 500,
    proteinMultiplier: 1.6,
    carbMultiplier: 1.1,
    dailyTip: "Un apport calorique élevé et riche en protéines est essentiel pour construire et maintenir la masse musculaire nécessaire à l'impact.",
    hydrationTip: "Ne sous-estimez pas les pertes d'eau sous l'équipement. Buvez plus que votre soif.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner de Masse', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Déjeuner Riche', icon: Sun, meal_type_db: 'lunch' },
      snack: { name: 'Collation', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  tennis: {
    emoji: '🎾',
    calorieModifier: 150,
    proteinMultiplier: 1.1,
    carbMultiplier: 1.2,
    dailyTip: "Pendant un long match, des collations faciles à digérer comme une banane ou un gel énergétique peuvent maintenir votre niveau d'énergie.",
    hydrationTip: "Pensez aux électrolytes ! Ajoutez une pincée de sel et un peu de jus de citron à votre eau pour compenser les pertes dues à la transpiration.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Déjeuner Léger', icon: Sun, meal_type_db: 'lunch' },
      on_court_snack: { name: 'Collation (Court)', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  endurance: {
    emoji: '🏃‍♂️',
    calorieModifier: 400,
    proteinMultiplier: 1.2,
    carbMultiplier: 1.5,
    dailyTip: "Les glucides complexes (avoine, riz complet, patates douces) sont votre meilleur carburant. Consommez-les régulièrement pour maintenir vos réserves d'énergie.",
    hydrationTip: "Commencez à vous hydrater bien avant une longue sortie. L'hydratation de la veille est tout aussi importante.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner Énergie', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Repas Glucides Complexes', icon: Footprints, meal_type_db: 'lunch' },
      snack: { name: 'Collation', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner de Récupération', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  football: {
    emoji: '⚽',
    calorieModifier: 200,
    proteinMultiplier: 1.1,
    carbMultiplier: 1.4,
    dailyTip: "L'endurance nécessite des réserves de glycogène pleines. Mangez des glucides complexes 3-4h avant les matchs.",
    hydrationTip: "Pendant les 90 minutes de jeu, votre corps perd beaucoup d'eau. Hydratez-vous avant, pendant et après.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner', icon: Coffee, meal_type_db: 'breakfast' },
      pre_match: { name: 'Repas pré-match', icon: Zap, meal_type_db: 'lunch' },
      half_time: { name: 'Mi-temps', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Récupération', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  }
};

const Nutrition: React.FC = () => {
  // --- DONNÉES RÉELLES DU STORE ---
  const { appStoreUser } = useAppStore();

  // --- MAPPING SPORT UTILISATEUR ---
  const getSportCategory = (sport: string): Sport => {
    const mappings: Record<string, Sport> = {
      'basketball': 'basketball',
      'tennis': 'tennis', 
      'american_football': 'american_football',
      'football': 'football',
      'running': 'endurance',
      'cycling': 'endurance',
      'swimming': 'endurance',
      'musculation': 'strength',
      'powerlifting': 'strength',
      'crossfit': 'strength',
      'weightlifting': 'strength'
    };
    return mappings[sport?.toLowerCase()] || 'strength';
  };

  const userSport = getSportCategory(appStoreUser.sport || 'none');
  const sportConfig = sportsNutritionData[userSport];

  // --- CALCULS PERSONNALISÉS ---
  const personalizedGoals = useMemo(() => {
    // Calories de base (peut venir du store ou être calculées)
    let baseCalories = appStoreUser.daily_calories || 2000;
    
    // Si pas de calories calculées, utiliser une formule avec vraies données
    if (!appStoreUser.daily_calories && appStoreUser.age && appStoreUser.gender && appStoreUser.weight_kg && appStoreUser.height_cm) {
      const weight = appStoreUser.weight_kg;
      const height = appStoreUser.height_cm;
      
      // BMR avec vraies données
      const bmr = appStoreUser.gender === 'male'
        ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * appStoreUser.age)
        : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * appStoreUser.age);
      
      // Facteur d'activité selon lifestyle
      const activityFactor = {
        'student': 1.4,
        'office_worker': 1.3, 
        'physical_job': 1.6,
        'retired': 1.2
      }[appStoreUser.lifestyle as string] || 1.4;
      
      baseCalories = Math.round(bmr * activityFactor);
    } else if (!appStoreUser.daily_calories && (!appStoreUser.weight_kg || !appStoreUser.height_cm)) {
      // Si données incomplètes, utiliser valeur conservatrice et alerter
      console.warn('⚠️ Calcul nutritionnel avec données incomplètes');
      baseCalories = 1800; // Valeur conservatrice
    }

    // Ajustements selon objectifs
    let calorieAdjustment = 0;
    if (appStoreUser.primary_goals?.includes('weight_loss')) calorieAdjustment -= 300;
    if (appStoreUser.primary_goals?.includes('muscle_gain')) calorieAdjustment += 400;
    
    const finalCalories = baseCalories + sportConfig.calorieModifier + calorieAdjustment;
    
    return {
      calories: finalCalories,
      protein: Math.round((finalCalories * 0.15 / 4) * sportConfig.proteinMultiplier), // 15% en protéines ajusté
      carbs: Math.round((finalCalories * 0.50 / 4) * sportConfig.carbMultiplier), // 50% en glucides ajusté  
      fat: Math.round((finalCalories * 0.30 / 9)), // 30% en lipides
    };
  }, [appStoreUser, sportConfig]);

  // --- STATES ---
  const [currentCalories] = useState(850); // Simulation
  const [currentProtein] = useState(45);
  const [currentCarbs] = useState(120);
  const [currentFat] = useState(25);

  // --- CALCULS POURCENTAGES ---
  const caloriesPercentage = Math.min((currentCalories / personalizedGoals.calories) * 100, 100);
  const proteinPercentage = Math.min((currentProtein / personalizedGoals.protein) * 100, 100);
  const carbsPercentage = Math.min((currentCarbs / personalizedGoals.carbs) * 100, 100);
  const fatPercentage = Math.min((currentFat / personalizedGoals.fat) * 100, 100);

  // --- COMPOSANTS ---
  const MacroCard = ({ title, current, goal, unit, color, percentage, tip }: any) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <span className="text-xs font-medium text-gray-500">{Math.round(percentage)}%</span>
      </div>
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="text-lg font-bold text-gray-800">{Math.round(current)}</span>
        <span className="text-sm text-gray-500">/ {goal} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`${color} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {tip && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
          <Info size={12} className="inline mr-1" />
          {tip}
        </div>
      )}
    </div>
  );

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = () => {
    const progress = (currentCalories / personalizedGoals.calories) * 100;
    const userName = appStoreUser.name || 'Champion';
    
    if (progress >= 90) {
      return `🎯 Parfait ${userName} ! Objectif nutritionnel atteint pour ${appStoreUser.sport}`;
    } else if (progress >= 70) {
      return `💪 Excellent ${userName}, tu nourris bien ton corps d'athlète !`;
    } else if (progress >= 50) {
      return `⚡ Bien joué ${userName}, continue à alimenter ta performance !`;
    } else {
      return `🍎 ${userName}, ton corps a besoin de plus de carburant !`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header Uniforme */}
        <UniformHeader
          title="Nutrition"
          subtitle={`${sportConfig.emoji} ${getPersonalizedMessage()}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Calories avec Objectif Personnalisé */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Calories aujourd'hui</h3>
            <Target size={24} />
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-1">{currentCalories}</div>
            <div className="text-white/80">
              sur {personalizedGoals.calories} kcal ({appStoreUser.sport || 'sport'})
            </div>
            <div className="text-sm text-white/70 mt-1">
              {personalizedGoals.calories - currentCalories > 0 
                ? `${personalizedGoals.calories - currentCalories} kcal restantes`
                : 'Objectif atteint ! 🎉'
              }
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <div className="bg-white rounded-full h-3 transition-all duration-500" style={{ width: `${caloriesPercentage}%` }} />
          </div>
        </div>

        {/* Macronutriments Personnalisés */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Vos Macros Adaptées</h2>
          <div className="grid grid-cols-2 gap-3">
            <MacroCard 
              title="Protéines" 
              current={currentProtein} 
              goal={personalizedGoals.protein} 
              unit="g" 
              color="bg-red-500" 
              percentage={proteinPercentage}
              tip={userSport === 'strength' ? 'Crucial pour la masse musculaire' : 'Important pour la récupération'}
            />
            <MacroCard 
              title="Glucides" 
              current={currentCarbs} 
              goal={personalizedGoals.carbs} 
              unit="g" 
              color="bg-blue-500" 
              percentage={carbsPercentage}
              tip={userSport === 'endurance' ? 'Votre carburant principal' : 'Énergie pour l\'entraînement'}
            />
            <MacroCard 
              title="Lipides" 
              current={currentFat} 
              goal={personalizedGoals.fat} 
              unit="g" 
              color="bg-yellow-500" 
              percentage={fatPercentage}
            />
            <div className="bg-white p-3 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Performance</span>
              </div>
              <p className="text-xs text-gray-600">
                Tes macros sont optimisées pour {appStoreUser.primary_goals?.join(' et ') || 'ta performance'}
              </p>
            </div>
          </div>
        </div>

        {/* Repas du jour avec Suggestions Personnalisées */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Repas Recommandés</h2>
          <div className="space-y-3">
            {Object.entries(sportConfig.mealSuggestions).map(([key, meal]) => (
              <button
                key={key}
                className="w-full text-left p-4 rounded-xl border bg-white flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                onClick={() => alert(`Suggestion sélectionnée : ${meal.name}`)}
              >
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  {React.createElement(meal.icon, { size: 20 })}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                  <p className="text-sm text-gray-500">Optimisé pour {userSport}</p>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analyse Personnalisée */}
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-start space-x-3">
            <Zap size={20} className="text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">Analyse de votre Profil</h3>
              <p className="text-purple-700 text-sm mb-2">
                En tant que {appStoreUser.gender === 'male' ? 'homme' : 'femme'} de {appStoreUser.age || '?'} ans 
                pratiquant {appStoreUser.sport || 'le sport'}, vos besoins sont de {personalizedGoals.calories} kcal/jour.
              </p>
              <div className="text-xs text-purple-600 space-y-1">
                <p>• Protéines augmentées de {Math.round((sportConfig.proteinMultiplier - 1) * 100)}% pour {userSport}</p>
                <p>• Glucides ajustés de {Math.round((sportConfig.carbMultiplier - 1) * 100)}% selon votre sport</p>
                <p>• Calories bonus: +{sportConfig.calorieModifier} pour l'activité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conseil du jour Personnalisé */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">
                Conseil pour {appStoreUser.sport?.replace('_', ' ') || 'votre sport'}
              </h3>
              <p className="text-blue-700 text-sm">{sportConfig.dailyTip}</p>
              <div className="mt-2 p-2 bg-blue-100 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Hydratation:</strong> {sportConfig.hydrationTip}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Artificielle */}
        <AIIntelligence 
          pillar="nutrition"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />
      </div>
    </div>
  );
};

export default Nutrition;
