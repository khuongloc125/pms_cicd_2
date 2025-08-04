// src/components/CustomCursor.jsx
import React, { useEffect, useRef } from "react";
import "../styles/user/customCursor.css";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    document.addEventListener("mousemove", handleMouseMove);

    const followMouse = () => {
      // Chấm đỏ đi theo ngay lập tức
      if (dotRef.current) {
        dotRef.current.style.left = `${mouse.current.x}px`;
        dotRef.current.style.top = `${mouse.current.y}px`;
      }

      // Vòng đỏ di chuyển mượt hơn (trễ)
      ring.current.x += (mouse.current.x - ring.current.x) * 0.1;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.1;

      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }

      requestAnimationFrame(followMouse);
    };

    followMouse();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

export default CustomCursor;
