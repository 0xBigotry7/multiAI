import React, { useState, useEffect, useRef } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  text, 
  speed = 30, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const previousTextRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // If we received new text
    if (text !== previousTextRef.current) {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      
      // If this is a streaming update (quick succession)
      if (timeSinceLastUpdate < 100) {
        // Immediately append the new content
        const newContent = text.slice(displayedText.length);
        setDisplayedText(prev => prev + newContent);
      } else {
        // Start new typing animation
        setDisplayedText('');
        typeText(text);
      }
      
      previousTextRef.current = text;
      lastUpdateTimeRef.current = now;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text]);

  const typeText = (fullText: string, currentIndex: number = 0) => {
    if (currentIndex <= fullText.length) {
      setDisplayedText(fullText.slice(0, currentIndex));
      
      timeoutRef.current = setTimeout(() => {
        typeText(fullText, currentIndex + 1);
      }, speed);
    } else if (onComplete) {
      onComplete();
    }
  };

  // Handle component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return <>{displayedText}</>;
}; 