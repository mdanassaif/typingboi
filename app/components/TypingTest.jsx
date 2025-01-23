'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sentences = [
  "In the heart of the bustling city, where skyscrapers touch the clouds and the streets hum with ceaseless activity, there lies a small park, a sanctuary of tranquility amidst the chaos. Birds chirp melodiously, oblivious to the rush around them, while the leaves rustle softly in the gentle breeze, creating a symphony of nature's own design.",
  "Technology has transformed every aspect of human life, from communication to transportation, education to healthcare. The rapid pace of innovation challenges us to adapt continuously, learning new skills and embracing change. Yet, amidst this progress, we must not forget the importance of human connection and the values that define our humanity.",
  "Exploring the depths of the ocean reveals a world as alien and fascinating as outer space. Bioluminescent creatures glide through the inky darkness, their bodies glowing with otherworldly light. Hydrothermal vents spew minerals into the water, supporting ecosystems that thrive in extreme conditions, a testament to life's resilience.",
  "Literature opens windows to diverse experiences, allowing us to walk in another's shoes, if only for a few pages. Through the power of storytelling, authors capture the complexities of the human condition, weaving tales that inspire, challenge, and provoke thought. Each book is a journey, a dialogue between the reader and the writer across time and space.",
  "The pursuit of knowledge is a journey without end, a path that winds through the forests of uncertainty and the mountains of discovery. Every question answered leads to new mysteries, driving the relentless engine of scientific inquiry. Curiosity, the spark that ignites innovation, reminds us that the universe is vast and full of wonders yet to be uncovered."
];

export default function TypingTest() {
  const [playerName, setPlayerName] = useState('');
  const [currentSentence, setCurrentSentence] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [characterStatus, setCharacterStatus] = useState([]);
  const [gameState, setGameState] = useState('name-input');
  const [stats, setStats] = useState({ 
    wpm: 0, 
    accuracy: 0,
    correctChars: 0,
    totalChars: 0
  });
  const [startTime, setStartTime] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

 const startGame = useCallback(() => {
  if (!playerName.trim()) return;
  const sentence = sentences[Math.floor(Math.random() * sentences.length)];
  setCurrentSentence(sentence);
  setCurrentIndex(0);
  setCharacterStatus(Array(sentence.length).fill('pending'));
  setGameState('playing');
  setStartTime(Date.now());
  setTimeElapsed(0);
  setStats({ wpm: 0, accuracy: 0, correctChars: 0, totalChars: 0 });
}, [playerName]);

  const handleKeyPress = useCallback((e) => {
    if (gameState !== 'playing') return;
    const expectedChar = currentSentence[currentIndex];
    const typedChar = e.key;

    if (typedChar.length > 1) return;

    setCharacterStatus(prev => {
      const newStatus = [...prev];
      newStatus[currentIndex] = typedChar === expectedChar ? 'correct' : 'incorrect';
      return newStatus;
    });

    setStats(prev => ({
      ...prev,
      correctChars: prev.correctChars + (typedChar === expectedChar ? 1 : 0),
      totalChars: prev.totalChars + 1
    }));

    if (typedChar === expectedChar) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, currentSentence, gameState]);

  const finishGame = useCallback(async () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const minutes = elapsed / 60;
    const wpm = Math.round((stats.correctChars / 5) / Math.max(minutes, 0.1));
    const accuracy = Math.round((stats.correctChars / stats.totalChars) * 100) || 0;
    setStats(prev => ({ ...prev, wpm, accuracy }));
    setGameState('finished');

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName.trim(), wpm, accuracy })
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }, [startTime, stats, playerName]);

  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);
        if (elapsed >= 15) finishGame();
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime, finishGame]);

  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [gameState, handleKeyPress]);

  const timeRemaining = Math.max(0, 15 - Math.floor(timeElapsed));

  return (
    <div className="max-h-screen h-[650px]  text-white flex flex-col items-center   justify-center">
      <div className="w-full max-w-4xl text-center">
        {gameState === 'name-input' ? (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-emerald-400">Typing Boi</h1>
            <p className="text-xl text-gray-400 mb-6">Type as fast as you can.../)</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full max-w-xs p-3   bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                autoFocus
              />
              <button
                onClick={startGame}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8   transition-all duration-300 transform hover:scale-105"
                disabled={!playerName.trim()}
              >
                Start
              </button>
            </div>
          </div>
        ) : gameState === 'playing' ? (
          <div>
            <div className="flex justify-between items-center mb-4 px-4 w-full md:w-3/4 mx-auto">
              <div className="text-emerald-400">
                <span className="text-xl font-bold">{timeRemaining}</span>s remaining
              </div>
              <div className="text-blue-400">
                Words: <span className="text-xl font-bold">{Math.floor(stats.correctChars / 5)}</span>
              </div>
            </div>
            <div className="text-2xl mb-8 leading-relaxed font-mono bg-gray-800 p-6  w-full md:w-3/4 mx-auto">
              {currentSentence.split('').map((char, index) => (
                <span
                  key={index}
                  className={`
                    ${characterStatus[index] === 'correct' ? 'text-emerald-400' : 
                     characterStatus[index] === 'incorrect' ? 'text-red-500 underline' : 
                     'text-gray-400'}
                    ${index === currentIndex ? 'border-b-2 border-yellow-400' : ''}
                  `}
                >
                  {char}
                </span>
              ))}
            </div>
            
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">Test Results</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 p-6 ">
                <p className="text-xl mb-2">WPM</p>
                <p className="text-4xl font-bold text-emerald-400">{stats.wpm}</p>
              </div>
              <div className="bg-gray-800 p-6 ">
                <p className="text-xl mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-blue-400">{stats.accuracy}%</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setGameState('name-input')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6  transition duration-300"
              >
                Play Again
              </button>
              <Link href="/pro" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6  transition duration-300">
                View Leaderboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}