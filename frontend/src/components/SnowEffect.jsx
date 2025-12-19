import React, { useEffect, useRef, useState } from 'react';

const SnowEffect = () => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Function to update canvas size based on parent container
  const updateCanvasSize = () => {
    if (canvasRef.current) {
      setCanvasSize({
        width: canvasRef.current.parentElement.offsetWidth,
        height: canvasRef.current.parentElement.offsetHeight,
      });
    }
  };

  useEffect(() => {
    // Update canvas size on component mount and window resize
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    let snowflakes = [];
    const numSnowflakes = 300;

    function createSnowflakes() {
      for (let i = 0; i < numSnowflakes; i++) {
        snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 2 + 0.5,
        });
      }
    }

    function drawSnowflakes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();

      snowflakes.forEach(snowflake => {
        ctx.moveTo(snowflake.x, snowflake.y);
        ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
      });

      ctx.fill();
      updateSnowflakes();
    }

    function updateSnowflakes() {
      snowflakes.forEach(snowflake => {
        snowflake.y += snowflake.speed;
        if (snowflake.y > canvas.height) {
          snowflake.y = -snowflake.radius;
          snowflake.x = Math.random() * canvas.width;
        }
      });
    }

    function animate() {
      drawSnowflakes();
      requestAnimationFrame(animate);
    }

    createSnowflakes();
    animate();

    // Cleanup on component unmount
    return () => {
      snowflakes = [];
    };
  }, [canvasSize]);

  return <canvas className='absolute top-0'  ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>;
};

export default SnowEffect;
