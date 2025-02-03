"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  HomeModernIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  CommandLineIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { sentences } from "../constants/sentences";
import { MobileKeyboard } from './MobileKeyboard';


const MetricCard = ({ icon, value, label, unit = "", className = "" }) => (
  <div className={`
    p-4 rounded-2xl bg-white/80 backdrop-blur-sm
    border border-slate-200 
    transition-all duration-200 
    ${className}
  `}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-600">{icon}</span>
      <span className="text-2xl font-semibold text-slate-800">
        {value}{unit}
      </span>
    </div>
    <div className="text-sm text-slate-500 capitalize">{label}</div>
  </div>
);

const StatPanel = ({ icon, value, label, unit = "", color, className = "" }) => (
  <div className={`
    p-6 rounded-2xl
    transition-all duration-200  
    ${className}
  `}>
    <div className="flex items-center gap-3 mb-2">
      <span className={`${color}`}>{icon}</span>
      <span className="text-3xl font-bold text-slate-800">
        {value}{unit}
      </span>
    </div>
    <div className="text-slate-600">{label}</div>
  </div>
);

const ActionButton = ({ children, onClick, icon, variant = "primary", className = "" }) => {
  const baseStyles = "flex items-center gap-2 rounded-2xl font-medium transition-all duration-200";
  const variants = {
    primary: "bg-pink-500 hover:bg-pink-600 text-white ",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-700"
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
  const [gameState, setGameState] = useState('username');
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
    rawWpm: 0,
    mistakes: 0,
    streak: 0,
    maxStreak: 0,
    keystrokes: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);
  const hasSubmittedRef = useRef(false);

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
      rawWpm: 0,
      mistakes: 0,
      streak: 0,
      maxStreak: 0,
      keystrokes: 0
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
    const finalRawWpm = Math.round((totalCharsTypedRef.current / 5) / (timeElapsed / 60));

    setStats(prev => ({
      ...prev,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      rawWpm: finalRawWpm,
      time: 0,
      mistakes: 0,
      streak: 0,
      maxStreak: 0,
      keystrokes: 0
    }));

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username.trim(),
          wpm: finalWpm,
          accuracy: finalAccuracy,
          rawWpm: finalRawWpm
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Score submission failed');
      }

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
      let currentStreak = stats.streak;
      let maxStreak = stats.maxStreak;
      let mistakes = stats.mistakes;

      if (addedChars > 0) {
        totalCharsTypedRef.current += addedChars;
        for (let i = input.length; i < newInput.length; i++) {
          if (newInput[i] === sentence[i]) {
            correctCharsRef.current++;
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            mistakes++;
            currentStreak = 0;
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

      const rawWpm = Math.round(
        timeElapsed > 0 ? (totalCharsTypedRef.current / 5 / (timeElapsed / 60)) : 0
      );

      const accuracy = totalCharsTypedRef.current > 0
        ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
        : 100;

      setStats(prev => ({
        ...prev,
        wpm: netWpm,
        rawWpm: rawWpm,
        accuracy: accuracy,
        mistakes,
        streak: currentStreak,
        maxStreak,
        keystrokes: totalCharsTypedRef.current
      }));

      if (newInput === sentence && !hasSubmittedRef.current) {
        endGame();
      }
    },
    [sentence, endGame, startTimer, input.length, stats.streak, stats.maxStreak, stats.mistakes, gameState]
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
    startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {gameState === "username" && (
          <div className="text-center animate-fade-in min-h-[80vh] flex items-center justify-center">
            <div className="  backdrop-blur-lg rounded-3xl  p-12 max-w-md w-full mx-auto">
              <div className="flex items-center justify-center mb-8">
                <SparklesIcon className="w-12 h-12 text-pink-500" />
                <h1 className="text-4xl font-bold text-slate-800 ml-3">Typing Boi</h1>
              </div>
              <p className="text-slate-600 mb-8 text-lg">
                Nobody watching you what speed at you are :)
              </p>

              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSubmitError('');
                    }}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 
                             focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20
                             text-lg transition duration-200 bg-white/50 backdrop-blur"
                    placeholder="Enter your nickname"
                    maxLength="20"
                    autoFocus
                  />
                  {submitError && (
                    <p className="text-rose-500 text-sm mt-2 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                      {submitError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white 
                           px-8 py-4 rounded-2xl font-medium text-lg transition-all
                           transform hover:scale-[1.02] active:scale-[0.98]
                            "
                >
                  Start Typing
                </button>
              </form>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
            {isMobile && (
              <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-50 p-2">
                <div className="flex justify-center items-center gap-2 text-slate-700">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-2xl font-semibold">{stats.time}s</span>
                </div>
              </div>
            )}

            {!isMobile && (
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  icon={<ClockIcon className="w-5 h-5" />}
                  value={stats.time}
                  label="seconds"
                />
                <MetricCard
                  icon={<BoltIcon className="w-5 h-5" />}
                  value={stats.wpm}
                  label="wpm"
                />
                <MetricCard
                  icon={<ChartBarIcon className="w-5 h-5" />}
                  value={stats.accuracy}
                  label="accuracy"
                  unit="%"
                />
                <MetricCard
                  icon={<CommandLineIcon className="w-5 h-5" />}
                  value={stats.rawWpm}
                  label="raw"
                />
              </div>
            )}

            <div className={`
              relative
              text-xl md:text-2xl
              leading-relaxed font-mono
              p-4 md:p-8 bg-white/90 backdrop-blur-lg rounded-3xl 
              transition-all duration-300
              ${isMobile ? "h-[45vh] overflow-y-auto mt-14" : "min-h-[30vh]"}
            `}>
              <div className="absolute inset-x-0 top-0 h-1 bg-slate-100 rounded-t-3xl">
                <div 
                  className="h-full bg-pink-500 rounded-l-full transition-all duration-200"
                  style={{ width: `${(input.length / sentence.length) * 100}%` }}
                />
              </div>

              <div className="relative">
                {sentence.split("").map((char, index) => {
                  const inputChar = input[index];
                  const isActive = index === input.length;
                  return (
                    <span
                      key={index}
                      className={`
                        relative
                        ${isActive ? "text-pink-500" : ""}
                        ${inputChar !== undefined
                          ? inputChar === char
                            ? "text-slate-800"
                            : "text-rose-500"
                          : "text-slate-400"
                        }
                        ${isActive ? "animate-pulse" : ""}
                        transition-colors duration-150
                      `}
                    >
                      {char}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-pink-500 animate-pulse" />
                      )}
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

            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-100/95 to-white/95 backdrop-blur-lg  border-t border-slate-200 p-3 pb-4">
                <MobileKeyboard
                  onKeyPress={handleVirtualInput}
                />
              </div>
            )}
          </div>
        )}

        {gameState === "results" && (
          <div className="animate-slide-up max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl  p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                  Nice typing, {username}!
                </h2>
                <p className="text-slate-600 text-lg">
                  Here's how you did...
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                <StatPanel
                  value={stats.wpm}
                  label="Words per minute"
                  icon={<BoltIcon className="w-8 h-8" />}
                  color="text-pink-500"
                  className="bg-pink-50"
                />
                <StatPanel
                  value={stats.accuracy}
                  label="Accuracy"
                  icon={<ChartBarIcon className="w-8 h-8" />}
                  color="text-emerald-500"
                  unit="%"
                  className="bg-emerald-50"
                />
                <StatPanel
                  value={stats.rawWpm}
                  label="Raw WPM"
                  icon={<HomeModernIcon className="w-8 h-8" />}
                  color="text-purple-500"
                  className="bg-purple-50"
                />
                <StatPanel
                  value={stats.maxStreak}
                  label="Max Streak"
                  icon={<BoltIcon className="w-8 h-8" />}
                  color="text-amber-500"
                  className="bg-amber-50"
                />
                <StatPanel
                  value={stats.mistakes}
                  label="Mistakes"
                  icon={<ExclamationCircleIcon className="w-8 h-8" />}
                  color="text-rose-500"
                  className="bg-rose-50"
                />
                <StatPanel
                  value={stats.keystrokes}
                  label="Keystrokes"
                  icon={<CommandLineIcon className="w-8 h-8" />}
                  color="text-slate-500"
                  className="bg-slate-50"
                />
              </div>

              <div className="flex justify-center gap-4">
                <ActionButton
                  onClick={startGame}
                  icon={<ArrowPathIcon className="w-5 h-5" />}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  Try Again
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}