"use client";

import { useState } from "react";
import type { GalleryImage } from "@/types/pc";

interface GalleryProps {
  images: GalleryImage[];
  videoUrl?: string;
}

export function Gallery({ images, videoUrl }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const currentImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main display */}
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
        {showVideo && videoUrl ? (
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentImage?.url})` }}
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => {
              setShowVideo(false);
              setSelectedIndex(index);
            }}
            className={`flex-shrink-0 w-20 h-20 rounded bg-cover bg-center border-2 transition-colors ${
              !showVideo && selectedIndex === index
                ? "border-primary"
                : "border-transparent hover:border-primary/50"
            }`}
            style={{ backgroundImage: `url(${image.url})` }}
          />
        ))}
        {videoUrl && (
          <button
            onClick={() => setShowVideo(true)}
            className={`flex-shrink-0 w-20 h-20 rounded bg-muted border-2 transition-colors flex items-center justify-center ${
              showVideo ? "border-primary" : "border-transparent hover:border-primary/50"
            }`}
          >
            <svg
              className="w-8 h-8 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
