import React, { useState, useEffect, useRef } from 'react';
import type { TerminalEntry, ColorTheme } from '../types';

interface PlayerTerminalProps {
  history: TerminalEntry[];
  isLoading: boolean;
  onSendCommand: (command: string) => void;
  colorTheme: ColorTheme;
}

const BlinkingCursor: React.FC<{ colorTheme: ColorTheme }> = ({ colorTheme }) => (
  <span className={`${colorTheme.bgAccent} w-3 h-5 inline-block -mb-1 animate-pulse`} />
);

const PlayerTerminal: React.FC<PlayerTerminalProps> = ({ history, isLoading, onSendCommand, colorTheme }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSendCommand(inputValue);
    setInputValue('');
  };

  return (
    <div className={`flex flex-col h-full w-full bg-black/50 border-2 p-4 rounded-lg overflow-hidden animated-terminal ${colorTheme.border} ${colorTheme.glow}`}>
      <div className="flex-1 overflow-y-auto pr-2">
        {history.map((entry, index) => (
          <div key={index} className="mb-2 whitespace-pre-wrap break-words">
            {entry.type === 'command' ? (
              <div>
                <span className={`${colorTheme.textSecondary} mr-2`}>{'>'}</span>
                <span>{entry.text}</span>
              </div>
            ) : (
              <p>{entry.text}</p>
            )}
          </div>
        ))}
        {isLoading && <p className="animate-pulse">PROCESSING...</p>}
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-2">
        <div className="flex items-center">
          <span className={`${colorTheme.textSecondary} mr-2`}>{'>'}</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className={`bg-transparent border-none focus:ring-0 outline-none w-full p-0 m-0 ${colorTheme.textPrimary}`}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          {!isLoading && <BlinkingCursor colorTheme={colorTheme} />}
        </div>
      </form>
    </div>
  );
};

export default PlayerTerminal;
