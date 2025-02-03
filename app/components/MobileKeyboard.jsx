export const MobileKeyboard = ({ onKeyPress }) => {
  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
    [' '] // Space bar
  ];

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      {keys.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex justify-center gap-1.5 mb-1.5"
          style={{ paddingLeft: rowIndex * 12 + 'px' }}
        >
          {row.map((key) => {
            const isSpace = key === ' ';
            const isBackspace = key === '⌫';
            
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  ${isSpace ? 'w-48' : 'w-10'} 
                  h-12
                  rounded-xl
                  font-medium
                  transition-all
                  duration-150
                  active:scale-95
                  relative
                  overflow-hidden
                  ${isBackspace 
                    ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white' 
                    : isSpace
                    ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'
                    : 'bg-gradient-to-br from-white to-slate-100 text-slate-700'}
                  shadow-lg
                  hover:shadow-xl
                  hover:-translate-y-0.5
                  active:shadow-md
                  after:absolute
                  after:inset-0
                  after:bg-white/20
                  after:opacity-0
                  hover:after:opacity-100
                  after:transition-opacity
                  border border-slate-200/50
                `}
              >
                <span className="relative z-10 uppercase text-sm">
                  {key === ' ' ? 'space' : key}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};