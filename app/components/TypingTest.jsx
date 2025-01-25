'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ClockIcon, BoltIcon, ChartBarIcon, HomeModernIcon } from '@heroicons/react/24/outline';

const sentences = [
  "In the intricate cybernetic ecosystem of computational evolution, algorithmic mastery emerges not through sporadic intellectual bursts but through meticulously cultivated deliberate practice patterns that transform nascent programmers into symphonic code architects, bridging conceptual chasms with methodical precision and unwavering dedication.",
  
  "Within the labyrinthine neural networks of technological prowess, typing velocity transcends mere mechanical input, metamorphosing into a profound metric of computational thinking proficiency—where each keystroke represents a quantum leap of cognitive translation, mapping abstract algorithmic landscapes into tangible digital manifestations.",
  
  "Syntactical precision operates as the quantum entanglement of development workflow efficiency, where each meticulously crafted line of code becomes a linguistic algorithm transforming chaotic potential into structured elegance, accelerating technological paradigms through microscopic grammatical interventions.",
  
  "Keyboard fluency manifests as a sophisticated cognitive bandwidth allocation mechanism, where fingers dance across electromagnetic terrains, translating neurological impulses into digital symphonies that expand human computational consciousness beyond traditional perceptual boundaries.",
  
  "Repetitive motion optimization emerges as a nuanced ergonomic philosophy, strategically reducing developer fatigue factors by transforming mechanical interactions into biomechanical poetry—where technological interface becomes an extension of human neurological potential, minimizing physical entropy and maximizing creative output."
];

export default function ProfessionalTypingLab() {
  const [input, setInput] = useState('');
  const [sentence, setSentence] = useState('');
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, time: 30 });
  const [gameState, setGameState] = useState('playing');
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const [showVirtual, setShowVirtual] = useState(false);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setShowVirtual(isMobile);
    isMobile && inputRef.current?.focus();
  }, [gameState]);

  const generateSentence = useCallback(() => {
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return sentences[values[0] % sentences.length];
  }, []);

  const startGame = useCallback(() => {
    const newSentence = generateSentence();
    setSentence(newSentence);
    setInput('');
    setGameState('playing');
    setStats({ wpm: 0, accuracy: 100, time: 30 });
    timerStartedRef.current = false;
    startTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [generateSentence]);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('results');
  }, []);

  const startTimer = useCallback(() => {
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        setStats(prev => {
          if (prev.time <= 1) {
            endGame();
            return { ...prev, time: 0 };
          }
          return { ...prev, time: prev.time - 1 };
        });
      }, 1000);
    }
  }, [endGame]);

  const processInput = useCallback((newInput) => {
    if (!timerStartedRef.current && newInput.length > 0) {
      startTimer();
    }

    setInput(newInput);

    const correctChars = [...newInput].filter((c, i) => c === sentence[i]).length;
    const accuracy = Math.round((correctChars / (newInput.length || 1)) * 100);

    if (timerStartedRef.current) {
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      const wpm = Math.round((correctChars / 5) / (timeElapsed / 60)) || 0;
      setStats(prev => ({ ...prev, accuracy, wpm }));
    }

    if (newInput === sentence) endGame();
  }, [sentence, endGame, startTimer]);

  const handlePhysicalInput = (e) => {
    if (gameState !== 'playing') return;
    processInput(e.target.value);
  };

  const handleVirtualInput = (key) => {
    if (gameState !== 'playing') return;
    
    const newInput = key === '⌫' 
      ? input.slice(0, -1) 
      : input + key;

    processInput(newInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-geist">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {gameState === 'playing' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-3 gap-4 text-slate-600">
              <MetricCard icon={<ClockIcon className="w-6 h-6" />} value={stats.time} label="Seconds" />
              <MetricCard icon={<BoltIcon className="w-6 h-6" />} value={stats.wpm} label="Words/Min" />
              <MetricCard icon={<ChartBarIcon className="w-6 h-6" />} value={stats.accuracy} label="Accuracy" unit="%" />
            </div>

            <div className="text-2xl leading-relaxed text-center font-mono text-slate-800 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              {sentence.split('').map((char, index) => {
                const inputChar = input[index];
                return (
                  <span
                    key={index}
                    className={`
                      ${inputChar 
                        ? inputChar === char 
                          ? 'text-emerald-500' 
                          : 'text-rose-500 underline'
                        : 'text-slate-400'}
                      ${index === input.length ? 'border-b-4 border-blue-500' : ''}
                      transition-colors duration-75
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
              className="absolute opacity-0 h-0 w-0"
              autoFocus
            />
          </div>
        )}

        {gameState === 'results' && (
          <div className="text-center animate-slide-up">
            <h2 className="text-3xl font-semibold text-slate-800 mb-8">Session Analytics</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatPanel value={stats.wpm} label="Words/Min" icon={<BoltIcon className="w-8 h-8" />} color="text-blue-500" />
              <StatPanel value={stats.accuracy} label="Accuracy" icon={<ChartBarIcon className="w-8 h-8" />} color="text-emerald-500" unit="%" />
             
            </div>
            <div className="flex gap-4 justify-center">
            <ActionButton 
  onClick={() => {}} 
  icon={<HomeModernIcon className="w-5 h-5" />} 
  variant="secondary"
>
  <Link href="/pro">
    Leaderboard
  </Link>
</ActionButton>
            </div>
          </div>
        )}
      </div>

      {showVirtual && gameState === 'playing' && (
        <MobileKeyboard
          onKeyPress={handleVirtualInput}
          currentSentence={sentence}
          currentIndex={currentIndex}
        />
      )}
    </div>
  );
}

const MobileKeyboard = ({ 
  onKeyPress,
  currentSentence,
  currentIndex
}) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    [' ']
  ];

  const getNextChar = () => currentSentence[currentIndex]?.toLowerCase() || '';

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-slate-200 safe-area-pb">
      <div className="p-2 space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((key) => {
              const isNext = key === getNextChar();
              const isSpace = key === ' ';
              return (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className={`${isSpace ? 'w-64' : 'w-10 h-14'} ${
                    isNext ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  } flex items-center justify-center rounded font-medium active:scale-95 transition-all duration-75 ${
                    !isSpace && 'shadow-sm'
                  }`}
                >
                  {isSpace ? 'Space' : key}
                </button>
              )}
            )}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          <button
            onClick={() => onKeyPress('⌫')}
            className="w-24 h-14 bg-rose-500 text-white flex items-center justify-center rounded active:scale-95"
          >
            ⌫ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, value, label, unit = '' }) => (
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

const StatPanel = ({ value, label, icon, color, unit = '' }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200">
    <div className={`${color} mb-4`}>{icon}</div>
    <div className="text-4xl font-bold text-slate-800 mb-1">
      {value}
      {unit}
    </div>
    <div className="text-sm text-slate-500 font-medium">{label}</div>
  </div>
);

const ActionButton = ({ 
  children, 
  onClick, 
  icon, 
  variant = 'primary' 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      variant === 'primary' 
        ? 'bg-blue-500 text-white hover:bg-blue-600' 
        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
    }`}
  >
    {icon}
    {children}
  </button>
);