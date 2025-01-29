"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  HomeModernIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const sentences = [
  "In the world of coding, skill grows not from random moments but from steady and focused work that turns new programmers into masters who link ideas with clear steps, using their time and energy wisely to solve hard problems and build systems that stand the test of time.",
  "In the deep systems of tech, typing speed is more than just input; it becomes a sign of clear and strong thought where each press turns complex and abstract ideas into real results, bridging the gap between imagination and working code that shapes the digital world.",
  "Clear and simple code is like the glue of smooth and productive work where every small and careful line changes messy and scattered ideas into neat and organized ones, speeding up progress with fixes that are smart, quick, and precise, creating tools that make life easier.",
  "Typing well is like a skill where hands move fast and true, turning thoughts into code that pushes what humans can do with tech even further, allowing ideas to flow freely and opening the door to new possibilities that were once beyond reach.",
  "Good habits in typing cut down strain by making work smooth and easy while turning tough and tiring tasks into simple and clear flows, letting people create more, stay focused, and work longer without feeling the heavy toll of fatigue and stress.",
];

export default function ProfessionalTypingLab() {
  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const hasSubmittedRef = useRef(false); 
  const [stats, setStats] = useState({ 
    wpm: 0, 
    accuracy: 100, 
    time: 30,
    rawWpm: 0 
  });
  const [gameState, setGameState] = useState("username");
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("");
  const [submitError, setSubmitError] = useState("");
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const generateSentence = useCallback(() => {
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return sentences[values[0] % sentences.length];
  }, []);

  const startGame = useCallback(() => {
    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false; // Reset submission status
    const newSentence = generateSentence();
    setSentence(newSentence);
    setInput("");
    setGameState("playing");
    setStats({ wpm: 0, accuracy: 100, time: 30, rawWpm: 0 });
    timerStartedRef.current = false;
    startTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [generateSentence]);
  
  // Update the endGame function with submission guard
  const endGame = useCallback(async () => {
    // Prevent multiple submissions
    if (hasSubmittedRef.current) {
      return;
    }
    
    // Set submission flag immediately
    hasSubmittedRef.current = true;
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Final calculations
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
      time: 0
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
        if (prev.time <= 1 && !hasSubmittedRef.current) {
          endGame();
          return { ...prev, time: 0 };
        }
        return { ...prev, time: prev.time - 1 };
      });
    }, 1000);
  }
}, [endGame]);

  const processInput = useCallback(
    (newInput) => {
      if (!timerStartedRef.current && newInput.length > 0) {
        startTimer();
      }
  
      // Track character changes
      const addedChars = newInput.length - input.length;
      if (addedChars > 0) {
        totalCharsTypedRef.current += addedChars;
        for (let i = input.length; i < newInput.length; i++) {
          if (newInput[i] === sentence[i]) correctCharsRef.current++;
        }
      } else if (addedChars < 0) {
        for (let i = newInput.length; i < input.length; i++) {
          if (input[i] === sentence[i]) correctCharsRef.current--;
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
      }));
  
      // Check if sentence is complete
      if (newInput === sentence && !hasSubmittedRef.current) {
        endGame();
      }
    },
    [sentence, endGame, startTimer, input.length]
  );

  const handlePhysicalInput = (e) => {
    if (gameState !== "playing") return;
    processInput(e.target.value);
  };

  const handleVirtualInput = (key) => {
    if (gameState !== "playing") return;

    const newInput = key === "⌫" ? input.slice(0, -1) : input + key;
    processInput(newInput);
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setSubmitError('Please enter a name with at least 2 characters');
      return;
    }
    startGame();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-geist relative pb-[300px]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {gameState === "username" && (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-semibold text-slate-800 mb-8">
              Professional Typing Lab
            </h1>
            
            <form onSubmit={handleUsernameSubmit} className="max-w-sm mx-auto">
              <div className="mb-4">
                <label className="block text-sm text-slate-600 mb-2">
                  Enter your name to begin
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSubmitError('');
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your name"
                  maxLength="20"
                  autoFocus
                />
                {submitError && (
                  <p className="text-rose-500 text-sm mt-2">{submitError}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Start Test
              </button>
            </form>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-8 animate-fade-in">
            {!isMobile && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-slate-600">
                <MetricCard
                  icon={<ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                  value={stats.time}
                  label="Seconds"
                />
                <MetricCard
                  icon={<CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                  value={`${stats.wpm} / ${stats.rawWpm}`}
                  label="Net/Raw WPM"
                />
                <MetricCard
                  icon={<ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                  value={stats.accuracy}
                  label="Accuracy"
                  unit="%"
                />
              </div>
            )}

            <div className={`sm:text-xl md:text-xl lg:text-2xl xl:text-3xl 
                leading-relaxed text-center font-mono text-slate-800 
                p-6 bg-white rounded-xl shadow-sm border border-slate-200 
                ${isMobile ? "h-[50vh] overflow-auto" : ""}`}>
              {sentence.split("").map((char, index) => {
                const inputChar = input[index];
                return (
                  <span
                    key={index}
                    className={`${
                      inputChar
                        ? inputChar === char
                          ? "text-emerald-500"
                          : "text-rose-500 underline"
                        : "text-slate-400"
                    } ${
                      index === input.length
                        ? "border-b-4 border-blue-500"
                        : ""
                    } transition-colors duration-75`}
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
              className="absolute opacity-0 h-0 w-0"
              autoFocus
            />
          </div>
        )}

        {gameState === "results" && (
          <div className="text-center animate-slide-up">
            <h2 className="text-3xl font-semibold text-slate-800 mb-8">
              Session Results
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatPanel
                value={stats.wpm}
                label="Net WPM"
                icon={<BoltIcon className="w-8 h-8" />}
                color="text-blue-500"
              />
              <StatPanel
                value={stats.rawWpm}
                label="Raw WPM"
                icon={<HomeModernIcon className="w-8 h-8" />}
                color="text-purple-500"
              />
              <StatPanel
                value={stats.accuracy}
                label="Accuracy"
                icon={<ChartBarIcon className="w-8 h-8" />}
                color="text-emerald-500"
                unit="%"
              />
            </div>
            
            {submitError && (
              <p className="text-rose-500 text-sm mb-4">{submitError}</p>
            )}

            <div className="flex gap-4 justify-center">
              <ActionButton
                onClick={startGame}
                icon={<ArrowPathIcon className="w-5 h-5" />}
                variant="primary"
              >
                Try Again
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      {isMobile && gameState === "playing" && (
        <MobileKeyboard
          onKeyPress={handleVirtualInput}
          currentSentence={sentence}
          currentIndex={input.length}
        />
      )}
    </div>
  );
}

const MobileKeyboard = ({ onKeyPress, currentSentence, currentIndex }) => {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-slate-200 shadow-xl pt-2 pb-[env(safe-area-inset-bottom)] px-1 h-[50vh]">
      <div className="max-w-lg mx-auto">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 mb-1 px-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className="flex-1 h-12 min-w-[9%] bg-slate-100 text-slate-600 text-sm rounded-sm active:scale-95 transition-transform font-medium"
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        <div className="flex gap-1 px-1 mt-2">
          <button
            onClick={() => onKeyPress(" ")}
            className="flex-[2] h-12 bg-slate-100 text-slate-600 text-sm rounded-sm active:scale-95 transition-transform"
          >
            Space
          </button>
          <button
            onClick={() => onKeyPress("⌫")}
            className="flex-1 h-12 bg-rose-100 text-rose-600 text-sm rounded-sm active:scale-95 transition-transform"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, value, label, unit = "" }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
    <div className="flex items-center gap-2 text-slate-500 mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-3xl font-semibold text-slate-800">
      {value}
      {unit}
    </div>
  </div>
);

const StatPanel = ({ value, label, icon, color, unit = "" }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200">
    <div className={`${color} mb-4`}>{icon}</div>
    <div className="text-4xl font-bold text-slate-800 mb-1">
      {value}
      {unit}
    </div>
    <div className="text-sm text-slate-500 font-medium">{label}</div>
  </div>
);

const ActionButton = ({ children, onClick, icon, variant = "primary", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      variant === "primary"
        ? "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
    }`}
  >
    {icon}
    {children}
  </button>
);