import React, { useCallback } from 'react';

const MobileKeyboard = ({ onKeyPress }) => {
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','],
    ['space']
  ];

  const handleKeyClick = useCallback((key) => {
    // Simulate a keypress event
    const event = new KeyboardEvent('keypress', { key: key === 'space' ? ' ' : key });
    window.dispatchEvent(event);
  }, [onKeyPress]);

  return (
    <div className="mobile-keyboard fixed bottom-0 left-0 w-full bg-gray-800 p-2 shadow-lg">
      {keyboardRows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex justify-center gap-1 mb-1"
        >
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={`
                ${key === 'space' ? 'w-full' : 'w-8'} 
                bg-gray-700 text-white p-2 rounded-md text-sm uppercase 
                h-10 flex items-center justify-center hover:bg-gray-600
              `}
            >
              {key === 'space' ? 'Space' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MobileKeyboard;