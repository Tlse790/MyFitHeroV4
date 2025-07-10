// client/src/data/onboardingData.ts
import { OnboardingModule, SportOption } from '@/types/onboarding';

export const AVAILABLE_MODULES: OnboardingModule[] = [
  {
    id: 'sport',
    name: 'Sport & Performance',
    icon: '🏃‍♂️',
    description: 'Programmes d\'entraînement personnalisés selon votre sport',
    benefits: [
      'Programmes spécifiques à votre sport et position',
      'Suivi de performance et progression',
      'Planification selon la saison sportive'
    ]
  },
  {
    id: 'strength',
    name: 'Musculation',
    icon: '💪',
    description: 'Renforcement musculaire et développement physique',
    benefits: [
      'Programmes de force et hypertrophie',
      'Prévention des blessures',
      'Amélioration des performances sportives'
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: '🥗',
    description: 'Alimentation optimisée pour vos objectifs',
    benefits: [
      'Plans nutritionnels personnalisés',
      'Suivi des macronutriments',
      'Recettes adaptées à votre sport'
    ]
  },
  {
    id: 'sleep',
    name: 'Sommeil',
    icon: '😴',
    description: 'Optimisation de la récupération et du repos',
    benefits: [
      'Analyse de la qualité du sommeil',
      'Conseils pour améliorer la récupération',
      'Horaires de sommeil optimisés'
    ]
  },
  {
    id: 'hydration',
    name: 'Hydratation',
    icon: '💧',
    description: 'Suivi et optimisation de l\'hydratation',
    benefits: [
      'Rappels d\'hydratation intelligents',
      'Objectifs personnalisés selon l\'activité',
      'Suivi de la performance hydrique'
    ]
  },
  {
    id: 'wellness',
    name: 'Bien-être Global',
    icon: '🧘‍♀️',
    description: 'Approche holistique de la santé et du bien-être',
    benefits: [
      'Coordination de tous les aspects',
      'Coaching IA personnalisé',
      'Équilibre vie sportive/personnelle'
    ]
  }
];

export const MAIN_OBJECTIVES = [
  {
    id: 'performance',
    name: 'Performance Sportive',
    description: 'Améliorer mes performances dans mon sport',
    icon: '🏆',
    modules: ['sport', 'strength', 'nutrition', 'sleep']
  },
  {
    id: 'health_wellness',
    name: 'Santé & Bien-être',
    description: 'Maintenir une bonne santé générale',
    icon: '❤️',
    modules: ['nutrition', 'sleep', 'hydration', 'wellness']
  },
  {
    id: 'body_composition',
    name: 'Transformation Physique',
    description: 'Perdre du poids ou prendre du muscle',
    icon: '⚖️',
    modules: ['strength', 'nutrition', 'hydration']
  },
  {
    id: 'energy_sleep',
    name: 'Énergie & Récupération',
    description: 'Améliorer mon énergie et ma récupération',
    icon: '⚡',
    modules: ['sleep', 'nutrition', 'hydration', 'wellness']
  },
  {
    id: 'holistic',
    name: 'Accompagnement Complet',
    description: 'Optimiser tous les aspects de ma vie',
    icon: '🌟',
    modules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness']
  }
];

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
