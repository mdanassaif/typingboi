'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MonkeyRankers() {
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      if (!res.ok) throw new Error('Failed to load monkey scores');
      const data = await res.json();
      const sortedScores = data
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 5);
      setTopScores(sortedScores);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRankTag = (index) => {
    switch(index) {
      case 0: return 'Diamond Boi';
      case 1: return 'Gold Boi';
      case 2: return 'Silver Boi';
      case 3: return 'ronze Boi';
      case 4: return 'Iron Boi';
      default: return '';
    }
  };

  return (
    <div className="max-h-screen h-[768px] bg-[#2c3e50] p-4 mx-auto text-white">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-yellow-400">
        Top Monkey Rankers
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-400">Climbing leaderboard...</div>
      ) : error ? (
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button 
            onClick={fetchScores}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      ) : topScores.length === 0 ? (
        <div className="text-center text-gray-400">
          No boi points yet. Be the first monkey!
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop View */}
          <div className="hidden md:grid grid-cols-5 gap-4 font-bold bg-gray-800 p-4 rounded-t">
            <div>Rank</div>
            <div>Monkey Name</div>
            <div>WPM</div>
            <div>Accuracy</div>
            <div>Achievement</div>
          </div>
          
          {topScores.map((score, index) => (
            <div key={score._id}>
              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-5 gap-4 bg-gray-700 p-4 rounded hover:bg-gray-800 transition">
                <div>#{index + 1}</div>
                <div>{score.name}</div>
                <div className="text-green-400">{score.wpm}</div>
                <div className="text-yellow-400">{score.accuracy}%</div>
                <div className="text-sm font-semibold">{getRankTag(index)}</div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden bg-gray-700 p-4 rounded mb-2 hover:bg-gray-800 transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">#{index + 1} {score.name}</span>
                  <span className="text-sm font-semibold">{getRankTag(index)}</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-green-400">WPM: {score.wpm}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Accuracy: {score.accuracy}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded"
        >
          Take Typing Test
        </Link>
      </div>
    </div>
  );
}