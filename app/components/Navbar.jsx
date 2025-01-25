"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  RocketLaunchIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";

const musicTracks = ["/song3.mp3", "/song1.mp3", "/song2.mp3"];

export default function NavBar() {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTrack: 0,
    volume: 0.5,
    progress: 0,
  });
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const togglePlayback = () => {
    if (audioState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleVolume = (e) => {
    const volume = parseFloat(e.target.value);
    audioRef.current.volume = volume;
    setAudioState((prev) => ({ ...prev, volume }));
  };

  const updateProgress = () => {
    const progress =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setAudioState((prev) => ({ ...prev, progress }));
  };

  const changeTrack = (index) => {
    audioRef.current.src = musicTracks[index];
    audioRef.current.play();
    setAudioState((prev) => ({
      ...prev,
      currentTrack: index,
      isPlaying: true,
      progress: 0,
    }));
  };

  useEffect(() => {
    audioRef.current.volume = audioState.volume;
    audioRef.current.addEventListener("timeupdate", updateProgress);

    return () => {
      audioRef.current?.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-sm flex justify-between items-center p-4 shadow-xl">
      <Link href="/" className="flex items-center space-x-3 group">
        <div className="p-2 bg-slate-700 rounded-lg group-hover:bg-emerald-500 transition-all">
          <RocketLaunchIcon className="w-6 h-6 text-emerald-400 group-hover:text-white" />
        </div>
        <span className="text-xl font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
          TypingBoi
        </span>
      </Link>

      <div className="flex items-center space-x-6">
        <Link
          href="/pro"
          className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors"
        >
          <ChartBarIcon className="w-5 h-5" />
          <span className="font-medium">Leaderboard</span>
        </Link>

        <div className="flex items-center space-x-4 pl-4 border-l border-slate-600">
          <div className="relative group">
            <button
              onClick={togglePlayback}
              className="p-2 rounded-lg bg-slate-700 hover:bg-emerald-500 transition-all"
            >
              {audioState.isPlaying ? (
                <SpeakerWaveIcon className="w-6 h-6 text-emerald-400 group-hover:text-white" />
              ) : (
                <SpeakerXMarkIcon className="w-6 h-6 text-slate-400 group-hover:text-white" />
              )}
            </button>

            <div className="absolute right-0 bottom-14 bg-slate-700 p-4 rounded-xl shadow-2xl w-64 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioState.volume}
                    onChange={handleVolume}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    {Math.round(audioState.volume * 100)}%
                  </span>
                </div>

                <div className="relative pt-1">
                  <div
                    ref={progressRef}
                    className="h-1 bg-slate-600 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${audioState.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {musicTracks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => changeTrack(index)}
                      className={`p-2 rounded-lg text-sm ${
                        audioState.currentTrack === index
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-600 hover:bg-slate-500 text-slate-300"
                      }`}
                    >
                      Track #{index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={musicTracks[audioState.currentTrack]}
        loop={false}
      />
    </nav>
  );
}
