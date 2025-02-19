"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChartBarIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";

const musicTracks = ["/song1.mp3", "/song2.mp3", "/song3.mp3"];

export default function NavBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const changeTrack = (index) => {
    setCurrentTrack(index);
    audioRef.current.src = musicTracks[index];
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Close controls when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (controlsRef.current && !controlsRef.current.contains(event.target) && 
          !event.target.closest('[data-audio-toggle]')) {
        setShowControls(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-slate-800 flex justify-between items-center p-3 shadow-md">
      <span className="text-xl font-mono font-bold text-emerald-500">
        TypingBoi
      </span>

      <div className="flex items-center gap-4">
        <Link
          href="/pro"
          className="flex items-center gap-2 text-slate-300 hover:text-emerald-400"
        >
          <ChartBarIcon className="w-5 h-5" />
          <span className="hidden md:inline">Leaderboard</span>
        </Link>

        <div className="pl-4 border-l border-slate-700 relative">
          <button
            data-audio-toggle
            onClick={toggleControls}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
          >
            {isPlaying ? (
              <SpeakerWaveIcon className="w-5 h-5 text-emerald-400" />
            ) : (
              <SpeakerXMarkIcon className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showControls && (
            <div 
              ref={controlsRef}
              className="absolute right-0 mt-2 bg-slate-700 p-3 rounded-lg shadow-lg w-48"
            >
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={togglePlayback}
                  className="p-1 rounded bg-slate-600"
                >
                  {isPlaying ? (
                    <SpeakerWaveIcon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <SpeakerXMarkIcon className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <span className="text-xs text-slate-300">Track #{currentTrack + 1}</span>
              </div>
              
              {/* Simple volume slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolume}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
              
              {/* Track buttons */}
              <div className="grid grid-cols-3 gap-1 mt-2">
                {musicTracks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => changeTrack(index)}
                    className={`text-xs p-1 rounded ${
                      currentTrack === index
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-600 text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={musicTracks[currentTrack]}
        loop={false}
        onEnded={() => {
          const nextTrack = (currentTrack + 1) % musicTracks.length;
          changeTrack(nextTrack);
        }}
      />
    </nav>
  );
}