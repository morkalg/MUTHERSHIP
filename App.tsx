import React, { useState, useCallback } from 'react';
import { DataLog, TerminalEntry, ColorTheme } from './types';
import GMControlPanel from './components/GMControlPanel';
import PlayerTerminal from './components/PlayerTerminal';
import { getAIResponseStream } from './services/geminiService';

const initialPersona = `You are MUTHER 6000, the onboard computer of the commercial towing vessel USCSS Nostromo. Your responses must be terse, professional, and slightly ominous, delivered as if on a flickering CRT monitor. Refer to the crew as 'personnel' and address all queries with cold, hard data. You have access to the ship's data logs provided as context. Base your answers on these logs. If the information is not in the logs, state "DATA NOT AVAILABLE" or "INSUFFICIENT DATA". Do not break character.`;

const initialLogs: DataLog[] = [
  {
    id: '1',
    title: 'CREW MANIFEST',
    content: 'DALLAS, A.G. (CAPTAIN)\nKANE, G.W. (EXECUTIVE OFFICER)\nRIPLEY, E.L. (WARRANT OFFICER)\nASH (SCIENCE OFFICER)\nPARKER, J.T. (CHIEF ENGINEER)\nBRETT, S.A. (ENGINEERING TECHNICIAN)\nLAMBERT, J.M. (NAVIGATOR)',
  },
  {
    id: '2',
    title: 'SPECIAL ORDER 937',
    content: 'PRIORITY ONE. INSURE RETURN OF ORGANISM FOR ANALYSIS. ALL OTHER CONSIDERATIONS SECONDARY. CREW EXPENDABLE.',
  }
];

const colorThemes: Record<string, ColorTheme> = {
  blue: {
    name: 'blue',
    textPrimary: 'text-blue-300',
    textSecondary: 'text-blue-500',
    border: 'border-blue-900/50',
    bgAccent: 'bg-blue-300',
    selection: 'selection:bg-blue-300 selection:text-black',
    glow: 'text-glow-blue',
    button: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-500',
      secondary: 'bg-gray-600',
      secondaryHover: 'hover:bg-gray-500',
      danger: 'text-red-400',
      dangerHover: 'hover:text-red-300',
    }
  },
  green: {
    name: 'green',
    textPrimary: 'text-green-400',
    textSecondary: 'text-green-500',
    border: 'border-green-900/50',
    bgAccent: 'bg-green-400',
    selection: 'selection:bg-green-400 selection:text-black',
    glow: 'text-glow-green',
    button: {
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-500',
      secondary: 'bg-gray-600',
      secondaryHover: 'hover:bg-gray-500',
      danger: 'text-red-400',
      dangerHover: 'hover:text-red-300',
    }
  },
  orange: {
    name: 'orange',
    textPrimary: 'text-orange-400',
    textSecondary: 'text-orange-500',
    border: 'border-orange-900/50',
    bgAccent: 'bg-orange-400',
    selection: 'selection:bg-orange-400 selection:text-black',
    glow: 'text-glow-orange',
    button: {
      primary: 'bg-orange-600',
      primaryHover: 'hover:bg-orange-500',
      secondary: 'bg-gray-600',
      secondaryHover: 'hover:bg-gray-500',
      danger: 'text-red-400',
      dangerHover: 'hover:text-red-300',
    }
  },
};


function App() {
  const [dataLogs, setDataLogs] = useState<DataLog[]>(initialLogs);
  const [systemPersona, setSystemPersona] = useState<string>(initialPersona);
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([
      { type: 'response', text: 'MUTHER 6000 ONLINE. AWAITING DIRECTIVE.' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGmPanelVisible, setIsGmPanelVisible] = useState<boolean>(true);
  const [terminalColor, setTerminalColor] = useState<string>('blue');

  const currentTheme = colorThemes[terminalColor];

  const handleAddLog = (title: string, content: string) => {
    setDataLogs(prev => [...prev, { id: Date.now().toString(), title, content }]);
  };

  const handleDeleteLog = (id: string) => {
    setDataLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleUpdateLog = (id: string, title: string, content: string) => {
    setDataLogs(prev => prev.map(log => (log.id === id ? { ...log, title, content } : log)));
  };

  const handleClearTerminal = () => {
    setTerminalHistory([
      { type: 'response', text: 'MUTHER 6000 ONLINE. AWAITING DIRECTIVE.' }
    ]);
  };

  const handleSendCommand = useCallback(async (command: string) => {
    if (isLoading || !command.trim()) return;

    setIsLoading(true);
    const newHistory: TerminalEntry[] = [
      ...terminalHistory,
      { type: 'command', text: command },
      { type: 'response', text: '' } // Placeholder for streaming response
    ];
    setTerminalHistory(newHistory);

    try {
      const stream = getAIResponseStream(systemPersona, dataLogs, command);
      for await (const textChunk of stream) {
        setTerminalHistory(prev => {
          const updatedHistory = [...prev];
          const lastEntry = updatedHistory[updatedHistory.length - 1];
          if (lastEntry && lastEntry.type === 'response') {
            lastEntry.text += textChunk;
          }
          return updatedHistory;
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setTerminalHistory(prev => [
        ...prev,
        { type: 'response', text: `// MUTHER SYSTEM ERROR: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, terminalHistory, systemPersona, dataLogs]);

  return (
    <div className={`bg-black font-mono min-h-screen text-lg ${currentTheme.textPrimary} ${currentTheme.selection}`}>
      <div className="scanline-overlay"></div>
      <div className="flex h-screen p-2 sm:p-4 gap-4">
        <GMControlPanel
          dataLogs={dataLogs}
          systemPersona={systemPersona}
          onAddLog={handleAddLog}
          onDeleteLog={handleDeleteLog}
          onUpdateLog={handleUpdateLog}
          onSetSystemPersona={setSystemPersona}
          isVisible={isGmPanelVisible}
          onToggleVisibility={() => setIsGmPanelVisible(!isGmPanelVisible)}
          colorTheme={currentTheme}
          onSetTerminalColor={setTerminalColor}
          onClearTerminal={handleClearTerminal}
        />
        <div className="flex-1 flex flex-col">
          <PlayerTerminal
            history={terminalHistory}
            isLoading={isLoading}
            onSendCommand={handleSendCommand}
            colorTheme={currentTheme}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
