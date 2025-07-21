// client/src/data/onboardingData.ts
import { OnboardingModule, SportOption } from '@/types/onboarding';

export const AVAILABLE_MODULES: OnboardingModule[] = [
  {
    id: 'sport',
    name: 'Sport & Performance',
    icon: '🏃‍♂️',
    description: 'Personalized training programs for your sport',
    benefits: [
      'Sport and position-specific programs',
      'Performance tracking and progression',
      'Season-based planning'
    ]
  },
  {
    id: 'strength',
    name: 'Strength Training',
    icon: '💪',
    description: 'Muscle building and physical development',
    benefits: [
      'Strength and hypertrophy programs',
      'Injury prevention',
      'Athletic performance improvement'
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: '🥗',
    description: 'Optimized nutrition for your goals',
    benefits: [
      'Personalized meal plans',
      'Macro tracking',
      'Sport-specific recipes'
    ]
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: '😴',
    description: 'Recovery and rest optimization',
    benefits: [
      'Sleep quality analysis',
      'Recovery improvement tips',
      'Optimized sleep schedules'
    ]
  },
  {
    id: 'hydration',
    name: 'Hydration',
    icon: '💧',
    description: 'Hydration tracking and optimization',
    benefits: [
      'Smart hydration reminders',
      'Activity-based goals',
      'Hydration performance tracking'
    ]
  },
  {
    id: 'wellness',
    name: 'Global Wellness',
    icon: '🧘‍♀️',
    description: 'Holistic approach to health and wellness',
    benefits: [
      'All aspects coordination',
      'Personalized AI coaching',
      'Work-life-sport balance'
    ]
  }
];

export const WELLNESS_PACKS = [
  {
    id: 'athlete_complete',
    name: 'Athlète Complet',
    description: 'Pour les sportifs visant la performance maximale',
    modules: ['sport', 'strength', 'nutrition', 'hydration', 'sleep'],
    price_tier: 'premium'
  },
  {
    id: 'sport_essentials',
    name: 'Sport & Récupération',
    description: "L'essentiel pour progresser dans votre sport",
    modules: ['sport', 'sleep', 'hydration'],
    price_tier: 'standard'
  },
  {
    id: 'body_transformation',
    name: 'Transformation Physique',
    description: 'Musculation et nutrition pour transformer votre corps',
    modules: ['strength', 'nutrition', 'hydration'],
    price_tier: 'standard'
  },
  {
    id: 'wellness_basics',
    name: 'Bien-être Quotidien',
    description: 'Les bases pour une meilleure santé',
    modules: ['nutrition', 'sleep', 'hydration'],
    price_tier: 'basic'
  },
  {
    id: 'custom',
    name: 'Sur Mesure',
    description: 'Choisissez vos modules à la carte',
    modules: [],
    price_tier: 'variable'
  }
];

// Le reste du fichier reste identique...

// Sports disponibles avec leurs positions (basé sur vos données existantes)
export const AVAILABLE_SPORTS: SportOption[] = [
  {
    id: 'football',
    name: 'Football',
    emoji: '⚽',
    positions: ['Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche', 'Milieu défensif', 'Milieu central', 'Milieu offensif', 'Ailier droit', 'Ailier gauche', 'Attaquant', 'Avant-centre']
  },
  {
    id: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    positions: ['Meneur (PG)', 'Arrière (SG)', 'Ailier (SF)', 'Ailier Fort (PF)', 'Pivot (C)']
  },
  {
    id: 'rugby',
    name: 'Rugby',
    emoji: '🏉',
    positions: ['Pilier', 'Talonneur', 'Deuxième ligne', 'Troisième ligne', 'Demi de mêlée', 'Demi d\'ouverture', 'Centre', 'Ailier', 'Arrière']
  },
  {
    id: 'tennis',
    name: 'Tennis',
    emoji: '🎾',
    positions: ['Joueur de fond de court', 'Joueur offensif', 'Joueur polyvalent']
  },
  {
    id: 'american_football',
    name: 'Football Américain',
    emoji: '🏈',
    positions: ['Quarterback (QB)', 'Running Back (RB)', 'Wide Receiver (WR)', 'Tight End (TE)', 'Offensive Line', 'Defensive Line', 'Linebacker (LB)', 'Cornerback (CB)', 'Safety']
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    emoji: '🏐',
    positions: ['Passeur', 'Attaquant', 'Central', 'Libéro', 'Universel']
  },
  {
    id: 'running',
    name: 'Course à Pied',
    emoji: '🏃‍♂️',
    positions: ['Sprint', 'Demi-fond', 'Fond', 'Marathon', 'Trail']
  },
  {
    id: 'cycling',
    name: 'Cyclisme',
    emoji: '🚴‍♂️',
    positions: ['Route', 'VTT', 'Piste', 'BMX']
  },
  {
    id: 'swimming',
    name: 'Natation',
    emoji: '🏊‍♂️',
    positions: ['Nage libre', 'Brasse', 'Dos crawlé', 'Papillon', 'Quatre nages']
  },
  {
    id: 'musculation',
    name: 'Musculation',
    emoji: '💪',
    positions: ['Bodybuilding', 'Powerlifting', 'Haltérophilie', 'CrossFit', 'Fitness général']
  },
  {
    id: 'other',
    name: 'Autre sport',
    emoji: '🎯',
    positions: []
  }
];

export const DIETARY_PREFERENCES = [
  { id: 'omnivore', name: 'Omnivore', description: 'Je mange de tout' },
  { id: 'vegetarian', name: 'Végétarien', description: 'Pas de viande ni poisson' },
  { id: 'vegan', name: 'Végétalien', description: 'Aucun produit animal' },
  { id: 'pescatarian', name: 'Pescétarien', description: 'Poisson mais pas de viande' },
  { id: 'flexitarian', name: 'Flexitarien', description: 'Principalement végétarien' },
  { id: 'keto', name: 'Cétogène', description: 'Très faible en glucides' },
  { id: 'paleo', name: 'Paléo', description: 'Aliments non transformés' },
  { id: 'mediterranean', name: 'Méditerranéen', description: 'Régime méditerranéen' }
];

export const COMMON_ALLERGIES = [
  'Gluten',
  'Lactose',
  'Fruits à coque',
  'Arachides',
  'Œufs',
  'Poisson',
  'Crustacés',
  'Soja',
  'Sésame'
];

export const STRENGTH_OBJECTIVES = [
  { id: 'strength', name: 'Force Pure', description: 'Développer la force maximale' },
  { id: 'power', name: 'Puissance Explosive', description: 'Améliorer l\'explosivité' },
  { id: 'hypertrophy', name: 'Prise de Masse', description: 'Développer le volume musculaire' },
  { id: 'injury_prevention', name: 'Prévention Blessures', description: 'Renforcer pour éviter les blessures' },
  { id: 'endurance', name: 'Endurance Musculaire', description: 'Améliorer la résistance' }
];

export const NUTRITION_OBJECTIVES = [
  { id: 'muscle_gain', name: 'Prise de Masse', description: 'Développer la masse musculaire' },
  { id: 'weight_loss', name: 'Perte de Poids', description: 'Réduire la masse grasse' },
  { id: 'maintenance', name: 'Maintien', description: 'Maintenir mon poids actuel' },
  { id: 'performance', name: 'Performance', description: 'Optimiser pour le sport' }
];

export const LIFESTYLE_OPTIONS = [
  { id: 'student', name: 'Étudiant(e)', description: 'Horaires flexibles, budget étudiant' },
  { id: 'office_worker', name: 'Travail de Bureau', description: 'Sédentaire, horaires fixes' },
  { id: 'physical_job', name: 'Travail Physique', description: 'Activité physique professionnelle' },
  { id: 'retired', name: 'Retraité(e)', description: 'Temps libre, focus santé' }
];

export const EQUIPMENT_LEVELS = [
  { id: 'no_equipment', name: 'Aucun Matériel', description: 'Entraînements au poids du corps' },
  { id: 'minimal_equipment', name: 'Matériel Minimal', description: 'Élastiques, poids légers' },
  { id: 'some_equipment', name: 'Équipement Partiel', description: 'Home gym de base' },
  { id: 'full_gym', name: 'Salle Complète', description: 'Accès à une salle de sport' }
];

export const SPORT_LEVELS = [
  { id: 'recreational', name: 'Loisir', description: 'Pour le plaisir et la forme' },
  { id: 'amateur_competitive', name: 'Amateur Compétitif', description: 'Compétitions locales/régionales' },
  { id: 'semi_professional', name: 'Semi-Professionnel', description: 'Niveau élevé, entraînement intensif' },
  { id: 'professional', name: 'Professionnel', description: 'Sport de haut niveau' }
];

export const FITNESS_EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'Débutant', description: 'Moins de 6 mois d\'expérience' },
  { id: 'intermediate', name: 'Intermédiaire', description: '6 mois à 2 ans d\'expérience' },
  { id: 'advanced', name: 'Avancé', description: '2 à 5 ans d\'expérience' },
  { id: 'expert', name: 'Expert', description: 'Plus de 5 ans d\'expérience' }
];

export const SEASON_PERIODS = [
  { id: 'off_season', name: 'Hors Saison', description: 'Période de récupération et préparation' },
  { id: 'pre_season', name: 'Pré-Saison', description: 'Préparation pour la saison' },
  { id: 'in_season', name: 'En Saison', description: 'Période de compétition' },
  { id: 'recovery', name: 'Récupération', description: 'Phase de récupération active' }
];
