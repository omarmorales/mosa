import React, { useState, useEffect } from 'react';

export default function RetroTypewriter({ 
  text = '', 
  speed = 25, 
  blinkCursor = true, 
  skip = false,
  onComplete = () => {} 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (skip) {
      setDisplayedText(text);
      setDone(true);
      onComplete();
      return;
    }

    setDisplayedText('');
    setDone(false);
    if (!text) return;

    let index = 0;
    let currentText = '';

    const timer = setInterval(() => {
      if (index < text.length) {
        currentText += text.charAt(index);
        setDisplayedText(currentText);
        index++;
      } else {
        clearInterval(timer);
        setDone(true);
        onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, skip]);

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {displayedText}
      {blinkCursor && !done && <span className="retro-cursor"></span>}
    </span>
  );
}
