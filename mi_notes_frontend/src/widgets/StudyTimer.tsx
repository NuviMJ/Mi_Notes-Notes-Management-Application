import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Timer,
  AlarmClock,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Target,
  Coffee,
  BookOpen,
} from 'lucide-react';
import alarmSound from '../assets/rainbow-countdown-289372.mp3';

interface TimerSession {
  startTime: string;
  endTime: string;
  duration: number;
  type: 'focus' | 'break';
}

const StudyTimer: React.FC = () => {
  // Timer/Stopwatch state
  const [mode, setMode] = useState<'timer' | 'countdown'>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Countdown specific state
  const [countdownTime, setCountdownTime] = useState(25 * 60); // 25 minutes default
  const [countdownInput, setCountdownInput] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [timeRemaining, setTimeRemaining] = useState(countdownTime);
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [currentSessionType, setCurrentSessionType] = useState<'focus' | 'break'>('focus');
  
  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('studyTimerState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setSessions(state.sessions || []);
      setSoundEnabled(state.soundEnabled ?? true);
    }

    // Create audio element for alarm with custom sound
    audioRef.current = new Audio(alarmSound);
    audioRef.current.volume = 0.7; // Set volume to 70%

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      sessions,
      soundEnabled,
    };
    localStorage.setItem('studyTimerState', JSON.stringify(state));
  }, [sessions, soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      if (mode === 'timer') {
        intervalRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      } else {
        intervalRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              handleCountdownComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  const handleCountdownComplete = () => {
    setIsRunning(false);
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    // Save session
    const session: TimerSession = {
      startTime: new Date(Date.now() - countdownTime * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: countdownTime,
      type: currentSessionType,
    };
    setSessions((prev) => [...prev, session]);
    
    // Toggle session type
    if (currentSessionType === 'focus') {
      setCurrentSessionType('break');
      setCountdownInput({ hours: 0, minutes: 5, seconds: 0 });
      setCountdownTime(5 * 60);
      setTimeRemaining(5 * 60);
    } else {
      setCurrentSessionType('focus');
      setCountdownInput({ hours: 0, minutes: 25, seconds: 0 });
      setCountdownTime(25 * 60);
      setTimeRemaining(25 * 60);
    }
  };

  const handleStart = () => {
    if (mode === 'timer') {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (mode === 'timer' && elapsedTime > 0) {
      const session: TimerSession = {
        startTime: new Date(startTimeRef.current).toISOString(),
        endTime: new Date().toISOString(),
        duration: elapsedTime,
        type: 'focus',
      };
      setSessions((prev) => [...prev, session]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setTimeRemaining(countdownTime);
  };

  const updateCountdownTime = (field: 'hours' | 'minutes' | 'seconds', value: number) => {
    const newInput = { ...countdownInput, [field]: value };
    setCountdownInput(newInput);
    const totalSeconds = newInput.hours * 3600 + newInput.minutes * 60 + newInput.seconds;
    setCountdownTime(totalSeconds);
    if (!isRunning) {
      setTimeRemaining(totalSeconds);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalStudyTime = () => {
    const total = sessions.reduce((acc, session) => acc + session.duration, 0);
    return formatTime(total);
  };

  const getTodayStudyTime = () => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      (session) => new Date(session.startTime).toDateString() === today
    );
    const total = todaySessions.reduce((acc, session) => acc + session.duration, 0);
    return formatTime(total);
  };

  // Pomodoro presets
  const pomodoroPresets = [
    { name: 'Focus', minutes: 25, icon: Target, color: 'bg-red-400' },
    { name: 'Short Break', minutes: 5, icon: Coffee, color: 'bg-green-400' },
    { name: 'Long Break', minutes: 15, icon: Coffee, color: 'bg-blue-400' },
    { name: 'Study Hour', minutes: 60, icon: BookOpen, color: 'bg-amber-400' },
  ];

  return (
    <div className="bg-gradient-to-br from-palette-100 to-palette-300/50 rounded-xl shadow-lg p-6 my-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-palette-700 mr-3" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900">
            Study Timer
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-palette-200 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute alarm' : 'Unmute alarm'}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-palette-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-palette-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1 flex">
          <button
            onClick={() => setMode('timer')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'timer'
                ? 'bg-palette-600 text-white'
                : 'text-palette-600 hover:bg-palette-100'
            }`}
          >
            <Timer className="h-5 w-5 inline mr-2" />
            Timer
          </button>
          <button
            onClick={() => setMode('countdown')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'countdown'
                ? 'bg-palette-600 text-white'
                : 'text-palette-600 hover:bg-palette-100'
            }`}
          >
            <AlarmClock className="h-5 w-5 inline mr-2" />
            Countdown
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-6xl md:text-8xl font-bold text-palette-800 font-mono">
          {mode === 'timer' ? formatTime(elapsedTime) : formatTime(timeRemaining)}
        </div>
        
        {mode === 'countdown' && (
          <div className="mt-4 text-sm text-palette-600">
            {currentSessionType === 'focus' ? 'Focus Session' : 'Break Time'}
          </div>
        )}
      </div>

      {/* Countdown Input */}
      {mode === 'countdown' && !isRunning && (
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center">
            <label className="text-xs text-palette-600">Hours</label>
            <div className="flex flex-col">
              <button
                onClick={() => updateCountdownTime('hours', Math.min(23, countdownInput.hours + 1))}
                className="p-1 hover:bg-palette-200 rounded"
              >
                <ChevronUp className="h-4 w-4 text-palette-600" />
              </button>
              <input
                type="number"
                value={countdownInput.hours}
                onChange={(e) =>
                  updateCountdownTime('hours', Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))
                }
                className="w-16 text-center py-2 bg-white/50 rounded-lg font-mono text-xl"
                min="0"
                max="23"
              />
              <button
                onClick={() => updateCountdownTime('hours', Math.max(0, countdownInput.hours - 1))}
                className="p-1 hover:bg-palette-200 rounded"
              >
                <ChevronDown className="h-4 w-4 text-palette-600" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <label className="text-xs text-palette-600">Minutes</label>
            <div className="flex flex-col">
              <button
                onClick={() => updateCountdownTime('minutes', Math.min(59, countdownInput.minutes + 1))}
                className="p-1 hover:bg-palette-200 rounded"
              >
                <ChevronUp className="h-4 w-4 text-palette-600" />
              </button>
              <input
                type="number"
                value={countdownInput.minutes}
                onChange={(e) =>
                  updateCountdownTime('minutes', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className="w-16 text-center py-2 bg-white/50 rounded-lg font-mono text-xl"
                min="0"
                max="59"
              />
              <button
                onClick={() => updateCountdownTime('minutes', Math.max(0, countdownInput.minutes - 1))}
                className="p-1 hover:bg-palette-200 rounded"
              >
                <ChevronDown className="h-4 w-4 text-palette-600" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <label className="text-xs text-palette-600">Seconds</label>
            <div className="flex flex-col">
              <button
                onClick={() => updateCountdownTime('seconds', Math.min(59, countdownInput.seconds + 1))}
                className="p-1 hover:bg-palette-200 rounded"
              >
                <ChevronUp className="h-4 w-4 text-palette-600" />
              </button>
              <input
                type="number"
                value={countdownInput.seconds}
                onChange={(e) =>
                  updateCountdownTime('seconds', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className="w-16 text-center py-2 bg-white/50 rounded-lg font-mono text-xl"
                min="0"
                max="59"
              />
              <button
                onClick={() => updateCountdownTime('seconds', Math.max(0, countdownInput.seconds - 1))}
                className="p-1 hover:bg-palette-200 rounded"
              >
                <ChevronDown className="h-4 w-4 text-palette-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pomodoro Presets */}
      {mode === 'countdown' && !isRunning && (
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {pomodoroPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setCountdownInput({ hours: 0, minutes: preset.minutes, seconds: 0 });
                setCountdownTime(preset.minutes * 60);
                setTimeRemaining(preset.minutes * 60);
              }}
              className={`px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity ${preset.color}`}
            >
              <preset.icon className="h-4 w-4 inline mr-2" />
              {preset.name}
            </button>
          ))}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Play className="h-5 w-5" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Pause className="h-5 w-5" />
            Pause
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-palette-600 text-white rounded-xl font-semibold hover:bg-palette-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-5 w-5" />
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-palette-800">{getTodayStudyTime()}</div>
          <div className="text-sm text-palette-600">Today's Study Time</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-palette-800">{getTotalStudyTime()}</div>
          <div className="text-sm text-palette-600">Total Study Time</div>
        </div>
      </div>

      {/* Session History Toggle */}
      <div className="mt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-palette-600 hover:text-palette-700 font-semibold text-sm"
        >
          {showHistory ? 'Hide' : 'Show'} Session History ({sessions.length} sessions)
        </button>
        
        {showHistory && sessions.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto">
            {sessions.slice(-5).reverse().map((session, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-3 bg-white/30 rounded-lg mb-2"
              >
                <div className="flex items-center gap-2">
                  {session.type === 'focus' ? (
                    <Target className="h-4 w-4 text-palette-600" />
                  ) : (
                    <Coffee className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm text-palette-700">
                    {new Date(session.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-palette-800">
                  {formatTime(session.duration)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;