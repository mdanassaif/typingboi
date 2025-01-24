'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sentences = [
  "Monkeys type with wild excitement, jumping from key to key like branches in a jungle of letters!",
  "Bananas fuel the typing monkey's incredible speed and accuracy across the keyboard wilderness!",
  "In the digital jungle, every keystroke is an adventure, every word a treasure to be conquered!",
  "Swift fingers dance like playful primates, transforming random letters into meaningful messages!",
  "The typing monkey laughs in the face of complexity, turning chaos into coherent communication!"
];

export default function MonkeyTypingTest() {
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
  const [isFirstKeyPressed, setIsFirstKeyPressed] = useState(false);

  const startGame = useCallback(() => {
    if (!playerName.trim()) return;
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    setCurrentSentence(sentence);
    setCurrentIndex(0);
    setCharacterStatus(Array(sentence.length).fill('pending'));
    setGameState('playing');
    setIsFirstKeyPressed(false);
    setStartTime(0);
    setTimeElapsed(0);
    setStats({ wpm: 0, accuracy: 0, correctChars: 0, totalChars: 0 });
  }, [playerName]);

  const handleKeyPress = useCallback((e) => {
    if (gameState !== 'playing') return;
    const expectedChar = currentSentence[currentIndex];
    const typedChar = e.key;

    // Start timer on first correct key press
    if (!isFirstKeyPressed && typedChar === expectedChar) {
      setStartTime(Date.now());
      setIsFirstKeyPressed(true);
    }

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

    if (typedChar === expectedChar) {
      setCurrentIndex(prev => prev + 1);
      
      // Check if sentence is completed
      if (currentIndex + 1 === currentSentence.length) {
        finishGame();
      }
    }
  }, [currentIndex, currentSentence, gameState, isFirstKeyPressed]);

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
    if (gameState === 'playing' && isFirstKeyPressed) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);
        if (elapsed >= 15) finishGame();
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime, finishGame, isFirstKeyPressed]);

  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [gameState, handleKeyPress]);

  const timeRemaining = Math.max(0, 15 - Math.floor(timeElapsed));

  return (
    <div className="max-h-screen h-[768px]  bg-[#2c3e50] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        {gameState === 'name-input' ? (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-yellow-400">Typing Boi</h1>
            <p className="text-xl text-gray-300 mb-6">Type as fast as you can.../)</p>
            <div className=" flex  justify-center items-center gap-2">
              <input
                type="text"
                placeholder="Enter your boi name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full max-w-xs p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />
              <button
                onClick={startGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded transition-all "
                disabled={!playerName.trim()}
              >
                Start!
              </button>
            </div>
          </div>
        ) : gameState === 'playing' ? (
          <div>
            <div className="flex justify-between items-center mb-4 px-4 w-full md:w-3/4 mx-auto">
              <div className="text-yellow-400">
                <span className="text-xl font-bold">{timeRemaining}</span>s remaining
              </div>
              <div className="text-green-400">
                Words: <span className="text-xl font-bold">{Math.floor(stats.correctChars / 5)}</span>
              </div>
            </div>
            <div className="text-2xl mb-8 leading-relaxed font-mono bg-gray-800 p-6 rounded w-full md:w-3/4 mx-auto">
              {currentSentence.split('').map((char, index) => (
                <span
                  key={index}
                  className={`
                    ${characterStatus[index] === 'correct' ? 'text-green-400' : 
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
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">Current Result </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 p-6 rounded">
                <p className="text-xl mb-2">WPM</p>
                <p className="text-4xl font-bold text-green-400">{stats.wpm}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded">
                <p className="text-xl mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-yellow-400">{stats.accuracy}%</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setGameState('name-input')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded transition duration-300"
              >
                Play Again
              </button>
              <Link href="/pro" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded transition duration-300">
                Leaderboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}