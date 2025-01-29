export const MobileKeyboard = ({ onKeyPress, currentSentence, currentIndex }) => {
    const rows = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ];
  
    // Helper function to determine if a key is the next character needed
    const isNextKey = (key) => {
      return currentSentence[currentIndex]?.toLowerCase() === key.toLowerCase();
    };
  
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 pb-safe">
        <div className="max-w-lg mx-auto px-2 py-4">
          {rows.map((row, i) => (
            <div 
              key={i} 
              className={`flex justify-center gap-1.5 mb-1.5 ${
                i === 1 ? 'px-4' : i === 2 ? 'px-8' : ''
              }`}
            >
              {row.map((key) => {
                const isNext = isNextKey(key);
                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`
                      flex-1 h-14 min-w-[8%] rounded-xl font-medium text-base
                      transition-all duration-200 active:scale-95
                      ${isNext 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'}
                      border border-slate-700/50
                      backdrop-blur-sm
                    `}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
  
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => onKeyPress("⌫")}
              className="w-[15%] h-14 bg-rose-500/90 text-white rounded-xl font-medium 
                       transition-all active:scale-95 border border-rose-400/30
                       shadow-lg shadow-rose-500/20"
            >
              ⌫
            </button>
            <button
              onClick={() => onKeyPress(" ")}
              className="flex-1 h-14 bg-slate-800/80 text-slate-200 rounded-xl font-medium 
                       transition-all active:scale-95 border border-slate-700/50
                       hover:bg-slate-700"
            >
              space
            </button>
          </div>
        </div>
      </div>
    );
  };