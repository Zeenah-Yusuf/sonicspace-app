import React, { useEffect, useRef, useState } from 'react';

export default function Sweeper({ imageUrl, isPlaying }) {
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(new Image());
  const pixelsRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    imgRef.current.crossOrigin = "Anonymous";
    imgRef.current.src = imageUrl;
    imgRef.current.onload = () => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 100;
      offCanvas.height = 50;
      const ctx = offCanvas.getContext('2d');
      ctx.drawImage(imgRef.current, 0, 0, 100, 50);
      pixelsRef.current = ctx.getImageData(0, 0, 100, 50).data;
      setIsLoaded(true);
    };
  }, [imageUrl]);

  useEffect(() => {
    // If not playing, stop the animation loop entirely
    if (!isPlaying || !isLoaded || !canvasRef.current || !pixelsRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 50; 
    canvas.height = 400; 

    const duration = 15000; // 15 seconds
    const startTime = performance.now();

    const draw = (currentTime) => {
      const elapsed = currentTime - startTime;
      let progress = elapsed / duration;
      
      // If audio finishes (15 seconds), stop drawing
      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; 
      }

      const xIndex = Math.floor(progress * 100);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#a855f7';

      for (let y = 0; y < canvas.height; y++) {
        const imgY = Math.floor((y / canvas.height) * 50);
        const pixelIndex = (imgY * 100 + xIndex) * 4;
        const r = pixelsRef.current[pixelIndex];
        const g = pixelsRef.current[pixelIndex + 1];
        const b = pixelsRef.current[pixelIndex + 2];
        const brightness = (r + g + b) / 3;

        const amplitude = (brightness / 255) * 20; 
        const xPos = (canvas.width / 2) + (amplitude * (y % 2 === 0 ? 1 : -1));

        if (y === 0) ctx.moveTo(xPos, y);
        else ctx.lineTo(xPos, y);
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded, isPlaying]);

  // If not playing, don't render the sweeper at all
  if (!isLoaded || !isPlaying) return null;

  return (
    <div className="absolute top-0 bottom-0 w-16 pointer-events-none z-10 animate-[sweep_15s_linear_infinite] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}