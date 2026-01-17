"use client";

import { Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Fake waveform pattern (height percentages) to make it look like real audio
const WAVEFORM_BARS = [20, 40, 60, 30, 70, 40, 20, 60, 80, 40, 20, 40, 60, 30, 70, 40, 20, 60, 80, 40];

export default function VoiceMessage({ src, isMe }: { src: string, isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if(audio.duration !== Infinity) setDuration(audio.duration);
    };
    
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Sometimes duration isn't available immediately for blobs
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("durationchange", setAudioData); 
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("durationchange", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate percentage for progress
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 p-2 rounded-2xl min-w-[240px] select-none ${isMe ? "bg-white/10" : "bg-black/20"}`}>
      <audio ref={audioRef} src={src} className="hidden" />
      
      {/* 1. Play/Pause Button (White Circle) */}
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:scale-105 transition-all shrink-0 cursor-pointer group"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-black fill-current" />
        ) : (
          <Play className="w-4 h-4 text-black fill-current ml-0.5 group-hover:text-indigo-600 transition-colors" />
        )}
      </button>

      {/* 2. Waveform Visualization */}
      <div className="flex items-center gap-[3px] h-8 flex-1 min-w-0 px-2 justify-center">
        {WAVEFORM_BARS.map((height, i) => {
          // Determine if this bar is "active" (played) based on progress
          // We map the index (0 to 19) to a percentage (0 to 100)
          const barPercent = (i / WAVEFORM_BARS.length) * 100;
          const isPlayed = barPercent < progressPercent;

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-colors duration-150`}
              style={{
                height: `${height}%`,
                // COLOR LOGIC:
                // If isMe (Sent): Played = White, Unplayed = White/30
                // If !isMe (Received): Played = Indigo, Unplayed = White/20
                backgroundColor: isMe 
                  ? (isPlayed ? "#ffffff" : "rgba(255,255,255,0.3)") 
                  : (isPlayed ? "#6366f1" : "rgba(255,255,255,0.2)")
              }}
            />
          );
        })}
      </div>

      {/* 3. Timer Pill */}
      <div className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono shadow-sm ${
        isMe ? "bg-white text-indigo-600" : "bg-white text-black"
      }`}>
        {formatTime(currentTime || duration)}
      </div>
    </div>
  );
}