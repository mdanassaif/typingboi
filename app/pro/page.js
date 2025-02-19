"use client";
import { useState, useEffect } from 'react';
import { TrophyIcon, ClockIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch scores');
      }
      
      // Process scores to keep only the highest score per user
      const uniqueUserScores = processUniqueHighestScores(data.data);
      
      // Only get top 20 scores
      setScores(uniqueUserScores.slice(0, 10));
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Function to process scores and keep only the highest score per username
  const processUniqueHighestScores = (allScores) => {
    const userMap = new Map();
    
    // First pass: find highest score per user
    allScores.forEach(score => {
      const username = score.name.trim().toLowerCase();
      if (!userMap.has(username) || score.wpm > userMap.get(username).wpm) {
        userMap.set(username, score);
      }
    });
    
    // Convert map values to array and sort by WPM
    return Array.from(userMap.values())
      .sort((a, b) => b.wpm - a.wpm);
  };

  const handleStartNewTest = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-rose-500 text-center">
          <p className="text-xl font-semibold">Error loading leaderboard</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mono font-bold text-slate-200 flex items-center justify-center gap-3">
            <TrophyIcon className="w-8 h-8 text-emerald-500" />
            Speed Typing Champions
          </h1>
          <p className="text-slate-400 mt-2">Top speeds and highest accuracy</p>
          
          <button
            onClick={handleStartNewTest}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 
                     rounded-lg hover:bg-emerald-600 transition-colors font-medium font-mono"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Take Another Test
          </button>
        </div>

        {/* Top 3 Winners Podium */}
        {scores.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-12">
            {/* Second Place */}
            <div className="order-1 pt-10">
              <div className="bg-slate-800/90 rounded-t-lg p-5 border border-slate-700/50 text-center transform transition-all hover:translate-y-1">
                <div className="flex justify-center">
                  <div className="bg-slate-400 rounded-full w-16 h-16 flex items-center justify-center -mt-12 border-4 border-slate-800 shadow-lg">
                    <TrophyIcon className="w-8 h-8 text-slate-900" />
                  </div>
                </div>
                <h3 className="text-xl font-mono font-semibold text-slate-300 mt-2">{scores[1].name}</h3>
                <div className="flex justify-center space-x-4 mt-3">
                  <div className="text-sm text-slate-400">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    <span className="font-mono font-medium text-slate-300">{scores[1].wpm} WPM</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    <ChartBarIcon className="w-4 h-4 inline mr-1" />
                    <span className="font-mono font-medium text-slate-300">{scores[1].accuracy}%</span>
                  </div>
                </div>
                <div className="h-8 bg-slate-700 mt-4 mb-2"></div>
              </div>
              <div className="text-center text-lg font-mono font-bold text-slate-400">2ND</div>
            </div>

            {/* First Place */}
            <div className="order-0">
              <div className="bg-slate-800/90 rounded-t-lg p-5 border border-yellow-500/30 text-center transform transition-all hover:translate-y-1">
                <div className="flex justify-center">
                  <div className="bg-yellow-500 rounded-full w-20 h-20 flex items-center justify-center -mt-14 border-4 border-slate-800 shadow-lg">
                    <TrophyIcon className="w-10 h-10 text-slate-900" />
                  </div>
                </div>
                <h3 className="text-2xl font-mono font-bold text-yellow-500 mt-2">{scores[0].name}</h3>
                <div className="flex justify-center space-x-4 mt-3">
                  <div className="text-sm text-slate-400">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    <span className="font-mono font-medium text-yellow-500">{scores[0].wpm} WPM</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    <ChartBarIcon className="w-4 h-4 inline mr-1" />
                    <span className="font-mono font-medium text-yellow-500">{scores[0].accuracy}%</span>
                  </div>
                </div>
                <div className="h-16 bg-yellow-900/30 mt-4 mb-2"></div>
              </div>
              <div className="text-center text-2xl font-mono font-bold text-yellow-500">1ST</div>
            </div>

            {/* Third Place */}
            <div className="order-2 pt-14">
              <div className="bg-slate-800/90 rounded-t-lg p-5 border border-slate-700/50 text-center transform transition-all hover:translate-y-1">
                <div className="flex justify-center">
                  <div className="bg-amber-700 rounded-full w-14 h-14 flex items-center justify-center -mt-10 border-4 border-slate-800 shadow-lg">
                    <TrophyIcon className="w-7 h-7 text-slate-900" />
                  </div>
                </div>
                <h3 className="text-lg font-mono font-semibold text-slate-300 mt-2">{scores[2].name}</h3>
                <div className="flex justify-center space-x-4 mt-3">
                  <div className="text-sm text-slate-400">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    <span className="font-mono font-medium text-slate-300">{scores[2].wpm} WPM</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    <ChartBarIcon className="w-4 h-4 inline mr-1" />
                    <span className="font-mono font-medium text-slate-300">{scores[2].accuracy}%</span>
                  </div>
                </div>
                <div className="h-4 bg-slate-700 mt-4 mb-2"></div>
              </div>
              <div className="text-center text-lg font-mono font-bold text-amber-700">3RD</div>
            </div>
          </div>
        )}

        {/* Remaining Top Scores */}
        <div className="bg-slate-800/90 rounded-xl overflow-hidden border border-slate-700/30">
          <div className="overflow-x-auto">
            {/* Mobile View */}
            <div className="block sm:hidden">
              {scores.slice(3).map((score, index) => (
                <div key={score._id} className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-sm font-mono font-semibold text-slate-300">
                      {index + 4}
                    </span>
                    <span className="font-mono font-medium text-slate-300">{score.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">WPM:</span>
                      <span className="ml-2 text-slate-400 font-mono">{score.wpm}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Accuracy:</span>
                      <span className="ml-2 text-slate-400 font-mono">{score.accuracy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      WPM
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4" />
                      Accuracy
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {scores.slice(3).map((score, index) => (
                  <tr key={score._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50 font-mono font-semibold text-slate-300">
                        {index + 4}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-300">{score.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{score.wpm}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{score.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}