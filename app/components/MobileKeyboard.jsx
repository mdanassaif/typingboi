import { useState } from "react";

export const MobileKeyboard = ({ onKeyPress, theme = "dark", disabled = false, className = "" }) => {
  const [isCaps, setIsCaps] = useState(false);

  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
    ['123', ' ', 'return']
  ];

  const handleKeyPress = (key) => {
    if (disabled) return;

    if (key === '⇧') {
      setIsCaps(prev => !prev);
    } else if (key === '⌫') {
      onKeyPress('⌫');
    } else if (key === 'return') {
      onKeyPress('\n');
    } else if (key === '123') {
      // Could toggle to number pad in future enhancement
      return;
    } else {
      onKeyPress(isCaps ? key.toUpperCase() : key);
    }
  };

  return (
    <div className={`
      w-full max-w-3xl mx-auto select-none 
      ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-slate-200/95'} 
      p-2 rounded-t-xl shadow-lg
      ${className}
    `}>
      {keys.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-center gap-1 mb-1"
          style={{ marginLeft: rowIndex === 1 ? '20px' : rowIndex === 2 ? '40px' : '0px' }}
        >
          {row.map((key) => {
            const isSpace = key === ' ';
            const isBackspace = key === '⌫';
            const isShift = key === '⇧';
            const isSpecial = key === '123' || key === 'return';

            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={disabled}
                className={`
                  flex items-center justify-center
                  ${isSpace ? 'flex-1 max-w-[40%]' : isSpecial ? 'w-16' : 'w-10'}
                  h-12
                  rounded-lg
                  font-medium
                  transition-all
                  duration-100
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                  relative
                  overflow-hidden
                  ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}
                  ${
                    isBackspace
                      ? `${theme === 'dark' ? 'bg-rose-600/90' : 'bg-rose-500/90'} text-white`
                      : isShift
                      ? `${theme === 'dark' ? 'bg-slate-600/90' : 'bg-slate-400/90'} ${isCaps ? 'bg-emerald-500/90' : ''}`
                      : isSpecial
                      ? `${theme === 'dark' ? 'bg-slate-600/90' : 'bg-slate-400/90'}`
                      : isSpace
                      ? `${theme === 'dark' ? 'bg-slate-700/90' : 'bg-white/90'}`
                      : `${theme === 'dark' ? 'bg-slate-700/90' : 'bg-white/90'}`
                  }
                  shadow-md
                  ${!disabled && 'hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm'}
                  border ${theme === 'dark' ? 'border-slate-600/50' : 'border-slate-300/50'}
                  after:absolute
                  after:inset-0
                  after:bg-white/10
                  after:opacity-0
                  ${!disabled && 'hover:after:opacity-100'}
                  after:transition-opacity
                `}
              >
                <span className="relative z-10 text-sm font-mono">
                  {key === ' ' ? 'space' : 
                   key === '⇧' ? (isCaps ? '⇧' : '⇧') : 
                   key === '⌫' ? '⌫' : 
                   key === 'return' ? '⏎' : 
                   key === '123' ? '123' : 
                   isCaps ? key.toUpperCase() : key}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};