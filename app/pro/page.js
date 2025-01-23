'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProRankers() {
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      if (!res.ok) throw new Error('Failed to load scores');
      const data = await res.json();
      setTopScores(data);
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

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-emerald-500">
        Leaderboard
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-400">Loading rankings...</div>
      ) : error ? (
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button 
            onClick={fetchScores}
            className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      ) : topScores.length === 0 ? (
        <div className="text-center text-gray-400">
          No scores yet. Be the first!
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 font-bold bg-gray-800 p-4 rounded-t text-white">
            <div>Rank</div>
            <div>Name</div>
            <div>WPM</div>
            <div>Accuracy</div>
          </div>
          
          {topScores.map((score, index) => (
            <div 
              key={score._id}
              className="grid grid-cols-4 gap-4 bg-gray-600/50 p-4 rounded hover:bg-gray-800 transition"
            >
              <div>#{index + 1}</div>
              <div>{score.name}</div>
              <div className="text-emerald-800">{score.wpm}</div>
              <div className="text-blue-800">{score.accuracy}%</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded"
        >
          Take Test
        </Link>
      </div>
    </div>
  );
}