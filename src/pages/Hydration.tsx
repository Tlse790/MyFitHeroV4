import React, { useState } from 'react';
import { 
  Droplets, 
  Plus, 
  Target,
  TrendingUp,
  Clock,
  Zap,
  Sun,
  Dumbbell,
  Thermometer,
  Award,
  Coffee,
  Wine,
  Minus,
  RotateCcw,
  Bell
} from 'lucide-react';

const Hydration = () => {
  const [selectedAmount, setSelectedAmount] = useState(250);

  // Données mockées
  const dailyData = {
    current: 1.8,
    goal: 2.5,
    unit: 'L'
  };

  const quickAmounts = [125, 250, 330, 500, 750];

  const todayIntakes = [
    { time: '07:30', amount: 250, type: 'water', icon: Droplets },
    { time: '09:15', amount: 200, type: 'coffee', icon: Coffee },
    { time: '11:00', amount: 330, type: 'water', icon: Droplets },
    { time: '12:30', amount: 250, type: 'water', icon: Droplets },
    { time: '14:45', amount: 200, type: 'water', icon: Droplets },
    { time: '16:20', amount: 330, type: 'water', icon: Droplets },
    { time: '18:00', amount: 250, type: 'water', icon: Droplets }
  ];

  const weeklyStats = {
    average: 2.1,
    bestDay: 2.8,
    streak: 4,
    totalWeek: 14.7
  };

  const hydrationTips = [
    {
      icon: Sun,
      title: 'Buvez dès le réveil',
      description: 'Commencez la journée avec un grand verre d\'eau',
      priority: 'high'
    },
    {
      icon: Dumbbell,
      title: 'Hydratation pendant l\'effort',
      description: 'Buvez 150-200ml toutes les 15-20min pendant l\'exercice',
      priority: 'high'
    },
    {
      icon: Thermometer,
      title: 'Augmentez par temps chaud',
      description: 'Ajoutez 500ml par jour quand il fait plus de 25°C',
      priority: 'medium'
    },
    {
      icon: Coffee,
      title: 'Compensez la caféine',
      description: 'Buvez 150ml d\'eau supplémentaire par café/thé',
      priority: 'low'
    }
  ];

  const achievements = [
    { title: 'Hydratation parfaite', description: '7 jours d\'objectif atteint', emoji: '🏆', unlocked: true },
    { title: 'Lève-tôt hydraté', description: 'Eau avant 8h pendant 5 jours', emoji: '🌅', unlocked: true },
    { title: 'Marathon hydratation', description: '30 jours consécutifs', emoji: '🏃‍♂️', unlocked: false },
    { title: 'Maître de l\'eau', description: '3L par jour pendant 7 jours', emoji: '💧', unlocked: false }
  ];

  // Calculs
  const currentMl = dailyData.current * 1000;
  const goalMl = dailyData.goal * 1000;
  const remaining = goalMl - currentMl;
  const percentage = Math.min((currentMl / goalMl) * 100, 100);

  // Fonctions
  const addWater = (amount) => {
    console.log(`Ajout de ${amount}ml d'eau`);
    // Ici on ajouterait la logique pour mettre à jour les données
  };

  const removeLastIntake = () => {
    console.log('Suppression de la dernière prise');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'water': return 'text-blue-500';
      case 'coffee': return 'text-brown-500';
      case 'tea': return 'text-green-500';
      case 'juice': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const QuickAmountButton = ({ amount, isSelected, onClick }) => (
    <button
      onClick={() => onClick(amount)}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
        isSelected 
          ? 'bg-fitness-hydration text-white shadow-sm' 
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {amount}ml
    </button>
  );

  const IntakeItem = ({ intake, index }) => {
    const IntakeIcon = intake.icon;
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-3">
          <IntakeIcon size={16} className={getTypeColor(intake.type)} />
          <span className="text-sm text-gray-600">{intake.time}</span>
        </div>
        <span className="text-sm font-medium text-gray-800">{intake.amount}ml</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hydratation</h1>
            <p className="text-gray-600">Suivez votre consommation d'eau quotidienne</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Objectif principal */}
        <div className="bg-gradient-hydration p-5 rounded-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Aujourd'hui</h3>
            <Target size={24} />
          </div>
          
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-1">{dailyData.current}L</div>
            <div className="text-white/80">sur {dailyData.goal}L</div>
            <div className="text-sm text-white/70 mt-1">
              {remaining > 0 ? `${(remaining/1000).toFixed(1)}L restants` : 'Objectif atteint ! 🎉'}
            </div>
          </div>

          {/* Barre de progression avec vagues */}
          <div className="relative w-full bg-white/20 rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className="bg-white rounded-full h-4 transition-all duration-500 relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 opacity-30 animate-pulse bg-blue-200 rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center text-sm text-white/80">
            {Math.round(percentage)}% de l'objectif atteint
          </div>

          {/* Effet de vagues en arrière-plan */}
          <div className="absolute bottom-0 left-0 right-0 opacity-10">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8">
              <path d="M0,60 C300,100 900,20 1200,60 L1200,120 L0,120 Z" fill="white" className="animate-pulse"></path>
            </svg>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Ajouter de l'eau</h2>
          
          {/* Quantités rapides */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickAmounts.map((amount) => (
              <QuickAmountButton
                key={amount}
                amount={amount}
                isSelected={selectedAmount === amount}
                onClick={setSelectedAmount}
              />
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => addWater(selectedAmount)}
              className="bg-fitness-hydration text-white p-4 rounded-xl font-medium flex flex-col items-center hover:bg-fitness-hydration/90 transition-colors"
            >
              <Plus size={24} className="mb-1" />
              <span className="text-sm">Ajouter {selectedAmount}ml</span>
            </button>
            <button 
              onClick={removeLastIntake}
              className="bg-white text-gray-600 p-4 rounded-xl font-medium flex flex-col items-center border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Minus size={24} className="mb-1" />
              <span className="text-sm">Annuler</span>
            </button>
            <button className="bg-white text-gray-600 p-4 rounded-xl font-medium flex flex-col items-center border border-gray-200 hover:bg-gray-50 transition-colors">
              <RotateCcw size={24} className="mb-1" />
              <span className="text-sm">Reset</span>
            </button>
          </div>
        </div>

        {/* Statistiques de la semaine */}
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Cette semaine</h3>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{weeklyStats.average}L</div>
              <div className="text-gray-600 text-sm">Moyenne/jour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{weeklyStats.bestDay}L</div>
              <div className="text-gray-600 text-sm">Meilleur jour</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Award size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600">Série: {weeklyStats.streak} jours</span>
            </div>
            <div className="text-sm text-gray-600">Total: {weeklyStats.totalWeek}L</div>
          </div>
        </div>

        {/* Historique du jour */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Aujourd'hui</h2>
            <span className="text-sm text-gray-500">{todayIntakes.length} prises</span>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {todayIntakes.map((intake, index) => (
                <IntakeItem key={index} intake={intake} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Conseils d'hydratation */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Conseils d'hydratation</h2>
          </div>
          
          <div className="space-y-3">
            {hydrationTips.map((tip, index) => {
              const TipIcon = tip.icon;
              return (
                <div key={index} className={`p-4 rounded-xl border-l-4 ${getPriorityColor(tip.priority)}`}>
                  <div className="flex items-start space-x-3">
                    <TipIcon size={20} className="text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Award size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Achievements</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{achievement.emoji}</div>
                  <h3 className="font-medium text-gray-800 text-sm">{achievement.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rappel hydratation */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Prochain rappel</h3>
              <p className="text-blue-700 text-sm">
                Dans 45 minutes • Buvez 250ml d'eau 💧
              </p>
            </div>
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Hydration;
