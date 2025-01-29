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
      
      setScores(data.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleStartNewTest = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-rose-500 text-center">
          <p className="text-xl font-semibold">Error loading leaderboard</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
            Hacker Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">Top 100 typing performances</p>
          
          <button
            onClick={handleStartNewTest}
            className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
          >
            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Take Another Test
          </button>
        </div>

        <div className="bg-white rounded-xl   overflow-hidden">
          <div className="overflow-x-auto">
            {/* Mobile View */}
            <div className="block sm:hidden">
              {scores.map((score, index) => (
                <div key={score._id} className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-slate-100 text-slate-700' :
                        index === 2 ? 'bg-amber-100 text-amber-700' :
                        'text-slate-600'}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-800">{score.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">WPM:</span>
                      <span className="ml-2 text-slate-700">{score.wpm}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Accuracy:</span>
                      <span className="ml-2 text-slate-700">{score.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Raw WPM:</span>
                      <span className="ml-2 text-slate-700">{score.rawWpm}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Date:</span>
                      <span className="ml-2 text-slate-700">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      WPM
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4" />
                      Accuracy
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Raw WPM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {scores.map((score, index) => (
                  <tr key={score._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-slate-100 text-slate-700' :
                          index === 2 ? 'bg-amber-100 text-amber-700' :
                          'text-slate-600'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{score.name}</td>
                    <td className="px-6 py-4 text-slate-600">{score.wpm}</td>
                    <td className="px-6 py-4 text-slate-600">{score.accuracy}%</td>
                    <td className="px-6 py-4 text-slate-600">{score.rawWpm}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </td>
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