'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BoltIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

  const getRankColor = (index) => {
    switch(index) {
      case 0: return 'text-blue-500';
      case 1: return 'text-emerald-500';
      case 2: return 'text-amber-500';
      case 3: return 'text-rose-500';
      case 4: return 'text-slate-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-geist p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-8 text-center">
          TypingBoi Leaderboard
        </h1>

        {loading ? (
          <div className="text-center text-slate-500 p-8">
            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
            Loading ranking data...
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="text-rose-500 mb-4">{error}</div>
            <button 
              onClick={fetchScores}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : topScores.length === 0 ? (
          <div className="text-center text-slate-500 p-8">
            No records yet. Be the first!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-12 gap-4 text-slate-600 font-medium mb-4">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2">WPM</div>
                <div className="col-span-3">Accuracy</div>
                <div className="col-span-2">Level</div>
              </div>
              
              {topScores.map((score, index) => (
                <div key={score._id} className="grid grid-cols-12 gap-4 items-center py-3 border-t border-slate-100">
                  <div className="col-span-1 font-mono">#{index + 1}</div>
                  <div className="col-span-4 text-slate-800">{score.name}</div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-blue-500">
                      <BoltIcon className="w-5 h-5" />
                      {score.wpm}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5 text-emerald-500" />
                      {score.accuracy}%
                    </div>
                  </div>
                  <div className={`col-span-2 ${getRankColor(index)} font-medium`}>
                    {getRankTag(index)}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {topScores.map((score, index) => (
                <div key={score._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800">#{index + 1}</span>
                    <span className={`text-sm ${getRankColor(index)}`}>
                      {getRankTag(index)}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-slate-800 mb-2">{score.name}</div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 text-blue-500">
                      <BoltIcon className="w-5 h-5" />
                      {score.wpm} WPM
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500">
                      <ChartBarIcon className="w-5 h-5" />
                      {score.accuracy}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            <ArrowPathIcon className="w-5 h-5" />
            New Typing Session
          </Link>
        </div>
      </div>
    </div>
  );
}
