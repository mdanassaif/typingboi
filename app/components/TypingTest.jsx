"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { sentences } from "../constants/sentences";
import { MobileKeyboard } from './MobileKeyboard';

const MetricCard = ({ icon, value, label, unit = "", className = "" }) => (
  <div className={`
    p-4 rounded-xl bg-slate-800/90 text-slate-200
    transition-all duration-200 
    ${className}
  `}>
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{icon}</span>
      <span className="text-2xl font-mono font-semibold">
        {value}{unit}
      </span>
    </div>
    <div className="text-sm text-slate-400 mt-1 capitalize">{label}</div>
  </div>
);

const StatPanel = ({ icon, value, label, unit = "", color, className = "" }) => (
  <div className={`
    p-6 rounded-xl bg-slate-800/90 text-slate-200
    transition-all duration-200 shadow-lg  
    ${className}
  `}>
    <div className="flex items-center gap-3 mb-1">
      <span className={`${color}`}>{icon}</span>
      <span className="text-3xl font-mono font-bold">
        {value}{unit}
      </span>
    </div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
);

const ActionButton = ({ children, onClick, icon, variant = "primary", className = "" }) => {
  const baseStyles = "flex items-center gap-2 rounded-xl font-medium transition-all duration-200";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

export default function ProfessionalTypingLab() {
  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [username, setUsername] = useState('');
  const [gameState, setGameState] = useState('loading');
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [theme, setTheme] = useState("dark");

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);
  const hasSubmittedRef = useRef(false);

  // Check for saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('typingUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setGameState('playing');
    } else {
      setGameState('username');
    }
  }, []);

  const generateSentence = useCallback(() => {
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return sentences[values[0] % sentences.length];
  }, []);

  const startGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;

    const newSentence = generateSentence();
    setSentence(newSentence);
    setInput("");
    setGameState("playing");
    setStats({
      wpm: 0,
      accuracy: 100,
      time: 30,
    });

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [generateSentence]);

  useEffect(() => {
    if (gameState === 'playing' && !sentence) {
      setSentence(generateSentence());
    }
  }, [gameState, generateSentence, sentence]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const endGame = useCallback(async () => {
    if (hasSubmittedRef.current) {
      return;
    }
  
    hasSubmittedRef.current = true;
  
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  
    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    const finalWpm = Math.round((correctCharsRef.current / 5) / (timeElapsed / 60));
    const finalAccuracy = totalCharsTypedRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
      : 100;
  
    setStats(prev => ({
      ...prev,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      time: 0,
    }));
  
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username.trim(),
          wpm: finalWpm,
          accuracy: finalAccuracy,
          rawWpm: finalWpm,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Score submission failed');
      }
  
      console.log('Score saved successfully:', data);
      setSubmitError('');
    } catch (error) {
      console.error('Save Error:', error);
      setSubmitError(error.message);
    }
  
    setGameState("results");
  }, [username]);

  const startTimer = useCallback(() => {
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimeRef.current = Date.now();
  
      timerRef.current = setInterval(() => {
        setStats((prev) => {
          const newTime = prev.time - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            endGame();  
            return { ...prev, time: 0 };
          }
          return { ...prev, time: newTime };
        });
      }, 1000);
    }
  }, [endGame]);

  const processInput = useCallback(
    (newInput) => {
      if (gameState !== "playing") return;

      if (!timerStartedRef.current && newInput.length > 0) {
        startTimer();
      }

      const addedChars = newInput.length - input.length;
      if (addedChars > 0) {
        totalCharsTypedRef.current += addedChars;
        for (let i = input.length; i < newInput.length; i++) {
          if (newInput[i] === sentence[i]) {
            correctCharsRef.current++;
          }
        }
      } else if (addedChars < 0) {
        for (let i = newInput.length; i < input.length; i++) {
          if (input[i] === sentence[i]) {
            correctCharsRef.current--;
          }
        }
      }

      setInput(newInput);

      const timeElapsed = timerStartedRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : 0;

      const netWpm = Math.round(
        timeElapsed > 0 ? (correctCharsRef.current / 5 / (timeElapsed / 60)) : 0
      );

      const accuracy = totalCharsTypedRef.current > 0
        ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
        : 100;

      setStats(prev => ({
        ...prev,
        wpm: netWpm,
        accuracy: accuracy,
      }));

      if (newInput === sentence && !hasSubmittedRef.current) {
        endGame();
      }
    },
    [sentence, endGame, startTimer, input.length, gameState]
  );

  const handlePhysicalInput = useCallback((e) => {
    if (gameState !== "playing") return;
    processInput(e.target.value);
  }, [gameState, processInput]);

  const handleVirtualInput = useCallback((key) => {
    if (gameState !== "playing") return;
    const newInput = key === "⌫" ? input.slice(0, -1) : input + key;
    processInput(newInput);
  }, [gameState, processInput, input]);

  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setSubmitError('Please enter a name with at least 2 characters');
      return;
    }
    
    // Save username to localStorage
    localStorage.setItem('typingUsername', username.trim());
    startGame();
  };

  const resetUsername = () => {
    localStorage.removeItem('typingUsername');
    setGameState('username');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {gameState === "username" && (
          <div className="text-center animate-fade-in min-h-[80vh] flex items-center justify-center">
            <div className={`${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-lg rounded-xl p-10 max-w-md w-full mx-auto border border-slate-700/20 shadow-xl`}>
              <div className="flex items-center justify-center mb-8">
                <UserPlusIcon className="w-10 h-10 text-emerald-500" />
                <h1 className={`text-3xl font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} ml-3`}>
                  Typing Boi
                </h1>
              </div>

              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSubmitError('');
                    }}
                    className={`w-full px-5 py-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-emerald-500/30' : 'bg-white border-slate-300 text-slate-800 focus:ring-emerald-500/20'} 
                             focus:outline-none focus:border-emerald-500 focus:ring-4
                             font-mono text-xl transition duration-200`}
                    placeholder="enter your name"
                    maxLength="20"
                    autoFocus
                  />
                  {submitError && (
                    <p className="text-rose-500 text-sm mt-1 flex items-center">
                      {submitError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 
                           px-6 py-4 rounded-lg font-medium text-lg transition-all
                           transform hover:scale-[1.02] active:scale-[0.98] font-mono"
                >
                  start typing
                </button>
              </form>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {isMobile && (
              <div className={`fixed top-0 left-0 right-0 ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-lg z-50 p-2`}>
                <div className={`flex justify-center items-center gap-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-2xl font-mono font-semibold">{stats.time}s</span>
                </div>
              </div>
            )}

            <div className={`
              relative
              text-xl md:text-2xl lg:text-3xl
              leading-relaxed font-mono
              p-6 md:p-8 lg:p-10 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'} backdrop-blur-lg rounded-xl 
              transition-all duration-300 border ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-200/70'}
              shadow-lg
              ${isMobile ? "h-[40vh] overflow-y-auto mt-14" : "min-h-[35vh]"}
            `}>
              <div className="relative mt-6">
                {sentence.split("").map((char, index) => {
                  const inputChar = input[index];
                  const isActive = index === input.length;
                  return (
                    <span
                      key={index}
                      className={`
                        relative font-mono
                        ${isActive ? "text-emerald-500 border-b-2 border-emerald-500" : ""}
                        ${inputChar !== undefined
                          ? inputChar === char
                            ? theme === 'dark' ? "text-slate-300" : "text-slate-700"
                            : "text-rose-500"
                          : theme === 'dark' ? "text-slate-500" : "text-slate-400"
                        }
                        ${isActive ? "animate-pulse" : ""}
                        transition-colors duration-150
                      `}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handlePhysicalInput}
                className="absolute inset-0 opacity-0 cursor-text"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>

            {/* Stats Display at the Bottom */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'} shadow-md flex flex-col items-center justify-center`}>
                <div className="text-emerald-500 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6" />
                  <span className={`text-2xl font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {stats.time}s
                  </span>
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Time Remaining</div>
              </div>
              
              <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'} shadow-md flex flex-col items-center justify-center`}>
                <div className="text-emerald-500 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6" />
                  <span className={`text-2xl font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {stats.wpm}
                  </span>
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>WPM</div>
              </div>
              
              <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'} shadow-md flex flex-col items-center justify-center`}>
                <div className="text-emerald-500 flex items-center gap-2">
                  <ChartBarIcon className="w-6 h-6" />
                  <span className={`text-2xl font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {stats.accuracy}%
                  </span>
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy</div>
              </div>
            </div>

            {/* Reset Username Link */}
            <div className="text-center mt-8">
              <button 
                onClick={resetUsername}
                className={`text-sm ${theme === 'dark' ? 'text-slate-500 hover:text-slate-400' : 'text-slate-500 hover:text-slate-700'} underline font-mono transition-colors duration-200`}
              >
                change username
              </button>
            </div>

            {isMobile && (
              <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-lg border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-3 pb-4`}>
                <MobileKeyboard
                  onKeyPress={handleVirtualInput}
                theme={theme}
                className="max-w-md mx-auto"
                />
              </div>
            )}
          </div>
        )}

        {gameState === "results" && (
          <div className="animate-slide-up max-w-4xl mx-auto">
            <div className={`${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-lg rounded-xl p-8 md:p-10 border ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-200/70'} shadow-xl`}>
              <div className="text-center mb-10">
                <h2 className={`text-3xl font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-3`}>
                  {username}'s results
                </h2>
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Great job on completing the typing test!
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                <StatPanel
                  value={stats.wpm}
                  label="Words Per Minute"
                  icon={<BoltIcon className="w-7 h-7" />}
                  color="text-emerald-500"
                />
                <StatPanel
                  value={stats.accuracy}
                  label="Accuracy Rate"
                  icon={<ChartBarIcon className="w-7 h-7" />}
                  color="text-emerald-500"
                  unit="%"
                />
              </div>

              <div className="flex justify-center gap-6">
                <ActionButton
                  onClick={startGame}
                  icon={<ArrowPathIcon className="w-5 h-5" />}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  try again
                </ActionButton>
                
                <ActionButton
                  onClick={resetUsername}
                  variant="secondary"
                  className="text-lg px-8 py-4"
                >
                  change username
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}