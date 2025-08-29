import React, { useState, useEffect, useRef } from 'react';
import type { TerminalEntry, ColorTheme } from '../types';

interface PlayerTerminalProps {
  history: TerminalEntry[];
  isLoading: boolean;
  onSendCommand: (command: string) => void;
  colorTheme: ColorTheme;
  currentUserRole: string | null;
}

const AnimatedCursor: React.FC<{ colorTheme: ColorTheme }> = ({ colorTheme }) => (
  <span className={`${colorTheme.bgAccent} w-3 h-5 inline-block -mb-1 cursor-animation`} />
);

const PlayerTerminal: React.FC<PlayerTerminalProps> = ({ history, isLoading, onSendCommand, colorTheme, currentUserRole }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    // Re-focus the input field whenever the AI is finished responding.
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSendCommand(inputValue);
    setInputValue('');
  };

  const promptSymbol = currentUserRole ? `[${currentUserRole}]` : '';

  return (
    <div className={`flex flex-col h-full w-full bg-black/50 border-2 p-4 rounded-lg overflow-hidden animated-terminal ${colorTheme.border} ${colorTheme.glow}`}>
      <div className="flex-1 overflow-y-auto pr-2">
        {history.map((entry, index) => (
          <div key={index} className="mb-2 whitespace-pre-wrap break-words">
            {entry.type === 'command' ? (
              <div>
                 <span className={`${colorTheme.textSecondary} mr-2`}>
                   {entry.text.toUpperCase().startsWith('LOGIN') ? '' : (currentUserRole ? `[${currentUserRole}]` : '')}&gt;
                 </span>
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
        <div className="flex items-center flex-nowrap">
           <span className={`${colorTheme.textSecondary} mr-2 flex-shrink-0`}>{promptSymbol}&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className={`bg-transparent border-none focus:ring-0 outline-none flex-1 min-w-0 p-0 m-0 ${colorTheme.textPrimary}`}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          <div className="flex-shrink-0">
            {!isLoading && <AnimatedCursor colorTheme={colorTheme} />}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlayerTerminal;