import { useState, useRef } from 'react';

export default function MusicPlayer({ tracks }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  return (
    <div>
      <audio 
        ref={audioRef} 
        src={tracks[currentTrack]} 
        onEnded={nextTrack}
      />
      <div>
        <button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={nextTrack}>Next</button>
      </div>
    </div>
  );
}