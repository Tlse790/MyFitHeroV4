import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Target,
  Play,
  CheckCircle,
  TrendingUp,
  Plus,
  Minus,
  Edit3,
  Save,
  Pause,
  Square
} from 'lucide-react';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { useWorkoutSession, WorkoutExercise } from '@/hooks/useWorkoutSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkoutPageProps {
  userProfile?: SupabaseAuthUserType;
}

interface SetEditState {
  exerciseId: string;
  setIndex: number;
  field: 'reps' | 'weight' | 'duration';
  value: string;
}

// Timer de repos par série
interface RestTimerState {
  exerciseId: string;
  setIndex: number;
  secondsLeft: number;
  running: boolean;
}

const DEFAULT_REST_TIME = 90;
const REST_STEP = 15;

const WorkoutPage: React.FC<WorkoutPageProps> = () => {
  const {
    currentSession,
    isSessionActive,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    addExercise,
    updateExerciseSet,
    completeExercise,
    loadExercisesFromLastSession,
    addSetToExercise,
    removeSetFromExercise
  } = useWorkoutSession();

  const [editingSet, setEditingSet] = useState<SetEditState | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null);
  const [showChangeExercise, setShowChangeExercise] = useState<string | null>(null);
  
  // Exemple de données d'exercices par défaut
  const defaultExercises: Omit<WorkoutExercise, 'id'>[] = [
    {
      name: 'Développé Couché',
      sets: [
        { reps: 10, weight: 60, completed: false },
        { reps: 8, weight: 65, completed: false },
        { reps: 6, weight: 70, completed: false }
      ],
      completed: false,
      restTime: 120
    },
    {
      name: 'Squats',
      sets: [
        { reps: 12, weight: 80, completed: false },
        { reps: 10, weight: 85, completed: false },
        { reps: 8, weight: 90, completed: false }
      ],
      completed: false,
      restTime: 90
    },
    {
      name: 'Tractions',
      sets: [
        { reps: 8, completed: false },
        { reps: 6, completed: false },
        { reps: 4, completed: false }
      ],
      completed: false,
      restTime: 90
    }
  ];

  const handleStartWorkout = () => {
    const workoutName = "Entraînement Force";
    
    // Charger les exercices avec les données de la dernière session
    const exercisesToAdd = loadExercisesFromLastSession(workoutName, defaultExercises);
    
    // Démarrer la session
    startSession(workoutName, 45);
    
    // Ajouter les exercices à la session
    setTimeout(() => {
      exercisesToAdd.forEach(exercise => {
        addExercise(exercise);
      });
    }, 100);
  };

  const handleSetEdit = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'duration') => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets[setIndex];
    
    if (set) {
      setEditingSet({
        exerciseId,
        setIndex,
        field,
        value: (set[field] || 0).toString()
      });
    }
  };

  const handleSetSave = () => {
    if (editingSet) {
      const numValue = parseFloat(editingSet.value) || 0;
      updateExerciseSet(editingSet.exerciseId, editingSet.setIndex, {
        [editingSet.field]: numValue
      });
      setEditingSet(null);
    }
  };

  const handleSetComplete = (exerciseId: string, setIndex: number) => {
    updateExerciseSet(exerciseId, setIndex, { completed: true });
    // Démarrer le timer de repos pour cette série
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const restTime = exercise?.restTime ?? DEFAULT_REST_TIME;
    setRestTimer({ exerciseId, setIndex, secondsLeft: restTime, running: true });
  };

  // Timer de repos par série
  useEffect(() => {
    if (restTimer && restTimer.running && restTimer.secondsLeft > 0) {
      const interval = setInterval(() => {
        setRestTimer((prev) => prev && prev.secondsLeft > 0 ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : prev);
      }, 1000);
      return () => clearInterval(interval);
    }
    if (restTimer && restTimer.secondsLeft === 0) {
      setRestTimer((prev) => prev ? { ...prev, running: false } : null);
    }
  }, [restTimer]);

  const handleRestAdjust = (delta: number) => {
    setRestTimer((prev) => prev ? { ...prev, secondsLeft: Math.max(0, prev.secondsLeft + delta) } : prev);
  };

  const handleRestStop = () => {
    setRestTimer(null);
  };

  const handleExerciseComplete = (exerciseId: string) => {
    completeExercise(exerciseId);
  };

  const incrementSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'duration') => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets[setIndex];
    
    if (set) {
      const currentValue = set[field] || 0;
      const increment = field === 'weight' ? 2.5 : 1;
      updateExerciseSet(exerciseId, setIndex, {
        [field]: currentValue + increment
      });
    }
  };

  const decrementSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'duration') => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets[setIndex];
    
    if (set) {
      const currentValue = set[field] || 0;
      const decrement = field === 'weight' ? 2.5 : 1;
      const newValue = Math.max(0, currentValue - decrement);
      updateExerciseSet(exerciseId, setIndex, {
        [field]: newValue
      });
    }
  };

  // Timer pour suivre le temps d'entraînement
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isSessionActive && currentSession?.status === 'active') {
      intervalId = setInterval(() => {
        setWorkoutTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isSessionActive, currentSession?.status]);

  // Calculer les statistiques
  const completedExercises = currentSession?.exercises.filter(e => e.completed).length || 0;
  const totalExercises = currentSession?.exercises.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Dumbbell className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentSession?.name || 'Entraînement'}
              </h1>
              <p className="text-sm text-gray-600">
                {currentSession?.status === 'active' ? 'En cours' : 'Prêt à commencer'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-gray-500">Temps écoulé</p>
          </div>
        </div>
      </div>

      {/* Timer de repos par série (overlay) */}
      {restTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="text-3xl font-bold mb-2">Repos</div>
            <div className="text-5xl font-mono text-blue-600 mb-4">{Math.floor(restTimer.secondsLeft / 60)}:{(restTimer.secondsLeft % 60).toString().padStart(2, '0')}</div>
            <div className="flex space-x-4 mb-4">
              <Button onClick={() => handleRestAdjust(-REST_STEP)} variant="outline" className="text-lg">-15s</Button>
              <Button onClick={() => handleRestAdjust(REST_STEP)} variant="outline" className="text-lg">+15s</Button>
            </div>
            <Button onClick={handleRestStop} className="bg-green-600 hover:bg-green-700 w-full">Reprendre</Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {!currentSession ? (
          // Écran de démarrage
          <div className="text-center py-12">
            <div className="mb-6">
              <Dumbbell size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Prêt pour l'entraînement ?</h2>
              <p className="text-gray-600">Commencez votre session d'entraînement maintenant</p>
            </div>
            <Button onClick={handleStartWorkout} size="lg" className="bg-red-600 hover:bg-red-700">
              <Play className="mr-2" size={20} />
              Commencer l'entraînement
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2" size={20} />
                  Progression: {Math.round(progressPercentage)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  {currentSession.status === 'active' ? (
                    <Button onClick={pauseSession} variant="outline" className="flex-1">
                      <Pause className="mr-2" size={16} />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeSession} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Play className="mr-2" size={16} />
                      Reprendre
                    </Button>
                  )}
                  <Button
                    onClick={completeSession}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Terminer
                  </Button>
                  <Button
                    onClick={cancelSession}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Square className="mr-2" size={16} />
                    Arrêter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exercises */}
            <div className="space-y-4">
              {currentSession?.exercises.map((exercise) => (
                <Card key={exercise.id} className={exercise.completed ? 'bg-green-50 border-green-200' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Dumbbell className="mr-2" size={16} />
                        {exercise.name}
                        {/* Bouton changer exercice (manuel/IA) */}
                        <Button size="sm" variant="outline" className="ml-2 text-xs px-2 py-1" onClick={() => setShowChangeExercise(exercise.id)}>
                          Changer
                        </Button>
                        <Button size="sm" variant="outline" className="ml-2 text-xs px-2 py-1" onClick={() => alert('Suggestion IA à venir')}>IA</Button>
                      </span>
                      {exercise.completed && (
                        <CheckCircle className="text-green-600" size={20} />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {/* UI de changement d'exercice (manuel) */}
                  {showChangeExercise === exercise.id && (
                    <div className="p-2 bg-gray-100 rounded mb-2 flex flex-col space-y-2">
                      <input
                        type="text"
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Nouveau nom d'exercice"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            // Changer le nom de l'exercice (il faut mettre à jour l'objet exercice)
                            if (currentSession) {
                              const updatedExercises = currentSession.exercises.map(ex =>
                                ex.id === exercise.id ? { ...ex, name: e.currentTarget.value } : ex
                              );
                              const updatedSession = { ...currentSession, exercises: updatedExercises };
                              localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
                              window.location.reload(); // Forcer le refresh pour voir le changement (sinon il faudrait passer par le hook)
                            }
                            setShowChangeExercise(null);
                          }
                        }}
                      />
                      <Button size="sm" onClick={() => setShowChangeExercise(null)} variant="outline">Annuler</Button>
                    </div>
                  )}
                  <CardContent>
                    <div className="space-y-3">
                      {exercise.sets && exercise.sets.length > 0 ? (
                        exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className={`p-3 rounded-lg border ${set.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Série {setIndex + 1}</span>
                              {!set.completed && (
                                <Button
                                  onClick={() => handleSetComplete(exercise.id, setIndex)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle size={14} />
                                </Button>
                              )}
                              {/* Timer de repos par série (badge) */}
                              {set.completed && restTimer && restTimer.exerciseId === exercise.id && restTimer.setIndex === setIndex && restTimer.running && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono animate-pulse">
                                  Repos: {Math.floor(restTimer.secondsLeft / 60)}:{(restTimer.secondsLeft % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          
                            <div className="flex items-center space-x-4 mt-2">
                              {/* Répétitions */}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Reps:</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    onClick={() => decrementSet(exercise.id, setIndex, 'reps')}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus size={12} />
                                  </Button>
                                  {editingSet?.exerciseId === exercise.id && 
                                   editingSet?.setIndex === setIndex && 
                                   editingSet?.field === 'reps' ? (
                                    <div className="flex items-center space-x-1">
                                      <Input
                                        value={editingSet.value}
                                        onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                        className="h-6 w-12 text-center text-xs"
                                      />
                                      <Button
                                        onClick={handleSetSave}
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <Save size={10} />
                                      </Button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleSetEdit(exercise.id, setIndex, 'reps')}
                                      className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1"
                                    >
                                      <span>{set.reps}</span>
                                      <Edit3 size={10} />
                                    </button>
                                  )}
                                  <Button
                                    onClick={() => incrementSet(exercise.id, setIndex, 'reps')}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus size={12} />
                                  </Button>
                                </div>
                              </div>

                              {/* Poids (si applicable) */}
                              {set.weight !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">Poids:</span>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      onClick={() => decrementSet(exercise.id, setIndex, 'weight')}
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Minus size={12} />
                                    </Button>
                                    {editingSet?.exerciseId === exercise.id && 
                                     editingSet?.setIndex === setIndex && 
                                     editingSet?.field === 'weight' ? (
                                      <div className="flex items-center space-x-1">
                                        <Input
                                          value={editingSet.value}
                                          onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                          className="h-6 w-12 text-center text-xs"
                                        />
                                        <Button
                                          onClick={handleSetSave}
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                        >
                                          <Save size={10} />
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleSetEdit(exercise.id, setIndex, 'weight')}
                                        className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1"
                                      >
                                        <span>{set.weight}kg</span>
                                        <Edit3 size={10} />
                                      </button>
                                    )}
                                    <Button
                                      onClick={() => incrementSet(exercise.id, setIndex, 'weight')}
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Plus size={12} />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Durée (si applicable) */}
                              {set.duration !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">Durée:</span>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      onClick={() => decrementSet(exercise.id, setIndex, 'duration')}
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Minus size={12} />
                                    </Button>
                                    {editingSet?.exerciseId === exercise.id && 
                                     editingSet?.setIndex === setIndex && 
                                     editingSet?.field === 'duration' ? (
                                      <div className="flex items-center space-x-1">
                                        <Input
                                          value={editingSet.value}
                                          onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                          className="h-6 w-12 text-center text-xs"
                                        />
                                        <Button
                                          onClick={handleSetSave}
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                        >
                                          <Save size={10} />
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleSetEdit(exercise.id, setIndex, 'duration')}
                                        className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1"
                                      >
                                        <span>{set.duration}s</span>
                                        <Edit3 size={10} />
                                      </button>
                                    )}
                                    <Button
                                      onClick={() => incrementSet(exercise.id, setIndex, 'duration')}
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Plus size={12} />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Aucune série configurée pour cet exercice</p>
                        </div>
                      )}
                      
                      {/* Boutons pour ajouter/supprimer des séries */}
                      {!exercise.completed && (
                        <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                          <Button
                            onClick={() => addSetToExercise(exercise.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Plus className="mr-1" size={14} />
                            Ajouter une série
                          </Button>
                          {exercise.sets && exercise.sets.length > 1 && (
                            <Button
                              onClick={() => removeSetFromExercise(exercise.id, exercise.sets.length - 1)}
                              size="sm"
                              variant="outline"
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Minus className="mr-1" size={14} />
                              Supprimer la dernière
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {!exercise.completed && (
                        <Button
                          onClick={() => handleExerciseComplete(exercise.id)}
                          className="w-full bg-green-600 hover:bg-green-700 mt-3"
                        >
                          <CheckCircle className="mr-2" size={16} />
                          Marquer comme terminé
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Card */}
        {currentSession && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Statistiques de la session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.floor(workoutTime / 60)}</div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedExercises}</div>
                  <div className="text-xs text-gray-500">Exercices terminés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentSession.caloriesBurned}</div>
                  <div className="text-xs text-gray-500">Calories brûlées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkoutPage;
