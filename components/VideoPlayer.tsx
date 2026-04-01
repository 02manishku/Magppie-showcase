"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  poster: string;
  isActive: boolean;
}

export default function VideoPlayer({ src, poster, isActive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress(video.currentTime / video.duration);
  }, []);

  const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = parseFloat(e.target.value) * video.duration;
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        preload={isActive ? "auto" : "none"}
        onTimeUpdate={onTimeUpdate}
        onClick={togglePlay}
        className="max-h-[85vh] max-w-full cursor-pointer rounded"
        style={{ outline: "none" }}
      />

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-bg-dark/60 to-transparent p-4 pt-10">
        <button onClick={togglePlay} className="text-text-light/80 transition-colors hover:text-text-light">
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={onSeek}
          className="video-progress h-0.5 flex-1 cursor-pointer appearance-none rounded bg-text-light/20"
          style={{
            background: `linear-gradient(to right, var(--color-accent) ${progress * 100}%, rgba(245,240,232,0.2) ${progress * 100}%)`,
          }}
        />

        <button onClick={toggleMute} className="text-text-light/80 transition-colors hover:text-text-light">
          {muted ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
