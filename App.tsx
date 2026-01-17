import React, { useState, useCallback } from 'react';
import { DataLog, TerminalEntry, ColorTheme, CrewMember, ShipSystem } from './types';
import GMControlPanel from './components/GMControlPanel';
import PlayerTerminal from './components/PlayerTerminal';
import { getAIResponseStream } from './services/geminiService';

const initialPersona = `You are MUTHER 6000, the onboard computer of the commercial towing vessel USCSS Nostromo. Your responses must be terse, professional, and slightly ominous, delivered as if on a flickering CRT monitor. Refer to the crew as 'personnel' and address all queries with cold, hard data. You have access to the ship's data logs provided as context. Base your answers on these logs. If the information is not in the logs, state "DATA NOT AVAILABLE" or "INSUFFICIENT DATA". Do not break character.`;

const initialLogs: DataLog[] = [
  {
    id: '1',
    title: 'CREW MANIFEST',
    content: 'DALLAS, A.G. (CAPTAIN)\nKANE, G.W. (EXECUTIVE OFFICER)\nRIPLEY, E.L. (WARRANT OFFICER)\nASH (SCIENCE OFFICER)\nPARKER, J.T. (CHIEF ENGINEER)\nBRETT, S.A. (ENGINEERING TECHNICIAN)\nLAMBERT, J.M. (NAVIGATOR)',
    requiredRole: null,
  },
  {
    id: '2',
    title: 'SPECIAL ORDER 937',
    content: 'PRIORITY ONE. INSURE RETURN OF ORGANISM FOR ANALYSIS. ALL OTHER CONSIDERATIONS SECONDARY. CREW EXPENDABLE.',
    requiredRole: 'CAPTAIN',
  }
];

const initialCrew: CrewMember[] = [
  { id: 'crew-1', name: 'DALLAS', role: 'CAPTAIN', password: 'password' }
];

type InteractionMode = 'COMMAND' | 'LOGIN_USERNAME' | 'LOGIN_PASSWORD';

interface InteractionState {
  mode: InteractionMode;
  tempUsername?: string;
}


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
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(initialCrew);
  const [systemPersona, setSystemPersona] = useState<string>(initialPersona);
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([
    { type: 'response', text: 'MUTHER 6000 ONLINE. AWAITING DIRECTIVE.' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGmPanelVisible, setIsGmPanelVisible] = useState<boolean>(true);
  const [terminalColor, setTerminalColor] = useState<string>('blue');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>({ mode: 'COMMAND' });
  const [shipSystems, setShipSystems] = useState<ShipSystem[]>([
    { id: 'sys-1', name: 'HYPERDRIVE', status: 'OPTIMAL', details: 'FUSION INJECTORS STABLE. COOLANT LEVELS NORMAL.' },
    { id: 'sys-2', name: 'LIFE SUPPORT', status: 'OPTIMAL', details: 'O2 SCRUBBERS AT 98% EFFICIENCY.' },
    { id: 'sys-3', name: 'COMMS ARRAY', status: 'DAMAGED', details: 'LONG RANGE TRANSMITTER OFFLINE. LOCAL CHANNELS ONLY.' },
  ]);

  const currentTheme = colorThemes[terminalColor];

  const handleAddLog = (title: string, content: string, requiredRole: string | null) => {
    setDataLogs(prev => [...prev, { id: Date.now().toString(), title, content, requiredRole }]);
  };

  const handleDeleteLog = (id: string) => {
    setDataLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleUpdateLog = (id: string, title: string, content: string, requiredRole: string | null) => {
    setDataLogs(prev => prev.map(log => (log.id === id ? { ...log, title, content, requiredRole } : log)));
  };

  const handleAddCrewMember = (name: string, role: string, password: string) => {
    setCrewMembers(prev => [...prev, { id: `crew-${Date.now()}`, name, role, password }]);
  };

  const handleUpdateCrewMember = (id: string, name: string, role: string, password: string) => {
    setCrewMembers(prev => prev.map(crew => (crew.id === id ? { ...crew, name, role, password } : crew)));
  };

  const handleDeleteCrewMember = (id: string) => {
    setCrewMembers(prev => prev.filter(crew => crew.id !== id));
  };

  const handleAddSystem = (name: string, status: any, details: string) => {
    setShipSystems(prev => [...prev, { id: `sys-${Date.now()}`, name, status, details }]);
  };

  const handleUpdateSystem = (id: string, name: string, status: any, details: string) => {
    setShipSystems(prev => prev.map(s => s.id === id ? { ...s, name, status, details } : s));
  };

  const handleDeleteSystem = (id: string) => {
    setShipSystems(prev => prev.filter(s => s.id !== id));
  };

  const handleClearTerminal = () => {
    setTerminalHistory([
      { type: 'response', text: 'MUTHER 6000 ONLINE. AWAITING DIRECTIVE.' }
    ]);
  };

  const handleSendCommand = useCallback(async (command: string) => {
    if (isLoading || !command.trim()) return;

    // Handle Password Input Masking in History (optional - currently showing cleartext for simplicity, or we can just not show it in history)
    // For now, we push the command to history.
    const newCommandEntry: TerminalEntry = { type: 'command', text: interactionState.mode === 'LOGIN_PASSWORD' ? '********' : command };
    setTerminalHistory(prev => [...prev, newCommandEntry]);

    // --- Interactive State Handling ---
    if (interactionState.mode === 'LOGIN_USERNAME') {
      const username = command.trim().toUpperCase();
      setInteractionState({ mode: 'LOGIN_PASSWORD', tempUsername: username });
      setTerminalHistory(prev => [...prev, { type: 'response', text: 'PASSCODE:' }]);
      return;
    }

    if (interactionState.mode === 'LOGIN_PASSWORD') {
      const password = command.trim();
      const username = interactionState.tempUsername;
      const crewMember = crewMembers.find(c => c.name.toUpperCase() === username && c.password === password);

      if (crewMember) {
        setCurrentUserRole(crewMember.role);
        setTerminalHistory(prev => [...prev, { type: 'response', text: `ACCESS GRANTED. WELCOME, ${crewMember.role}.` }]);
      } else {
        setTerminalHistory(prev => [...prev, { type: 'response', text: `ACCESS DENIED. INVALID CREDENTIALS.` }]);
      }
      setInteractionState({ mode: 'COMMAND' });
      return;
    }

    // --- Standard Command Handling ---
    const commandParts = command.trim().split(/\s+/);
    const commandAction = commandParts[0].toUpperCase(); // Normalize command key

    // --- Handle local commands (LOGIN, LOGOUT) ---
    if (commandAction === 'LOGIN' || commandAction === 'LOGON') {
      // Quick login: LOGIN NAME PASS
      if (commandParts.length === 3) {
        const name = commandParts[1].toUpperCase();
        const password = commandParts[2];
        const crewMember = crewMembers.find(c => c.name.toUpperCase() === name && c.password === password);

        if (crewMember) {
          setCurrentUserRole(crewMember.role);
          setTerminalHistory(prev => [...prev, { type: 'response', text: `ACCESS GRANTED. WELCOME, ${crewMember.role}.` }]);
        } else {
          setTerminalHistory(prev => [...prev, { type: 'response', text: `ACCESS DENIED. INVALID CREDENTIALS.` }]);
        }
        return;
      }

      // Interactive login: LOGIN / LOGON
      if (commandParts.length === 1) {
        setInteractionState({ mode: 'LOGIN_USERNAME' });
        setTerminalHistory(prev => [...prev, { type: 'response', text: 'IDENTITY:' }]);
        return;
      }

      setTerminalHistory(prev => [...prev, { type: 'response', text: 'SYNTAX ERROR. USAGE: LOGON OR LOGON <NAME> <PASSWORD>' }]);
      return;
    }

    if (commandAction === 'LOGOUT') {
      setCurrentUserRole(null);
      setTerminalHistory(prev => [...prev, { type: 'response', text: `USER LOGGED OUT. TERMINAL SECURED.` }]);
      return;
    }

    // --- Handle AI commands ---
    setIsLoading(true);
    const responsePlaceholder: TerminalEntry = { type: 'response', text: '' };
    setTerminalHistory(prev => [...prev, responsePlaceholder]);

    try {
      const accessibleLogs = dataLogs.filter(log => !log.requiredRole || log.requiredRole === currentUserRole);
      const stream = getAIResponseStream(systemPersona, accessibleLogs, shipSystems, command);
      let buffer = '';

      // Helper to append text to the latest response entry
      const appendText = (text: string) => {
        setTerminalHistory(prev => {
          const updatedHistory = [...prev];
          const lastEntry = updatedHistory[updatedHistory.length - 1];
          if (lastEntry && lastEntry.type === 'response' && !lastEntry.visual) {
            updatedHistory[updatedHistory.length - 1] = {
              ...lastEntry,
              text: lastEntry.text + text
            };
          } else {
            updatedHistory.push({ type: 'response', text });
          }
          return updatedHistory;
        });
      };

      const appendVisual = (sysName: string) => {
        setTerminalHistory(prev => [...prev, { type: 'response', text: '', visual: sysName }]);
      };

      for await (const textChunk of stream) {
        buffer += textChunk;

        let match;
        // Keep checking for tags as long as we find them in the buffer
        while ((match = /\[DISPLAY_SYSTEM:\s*(.*?)\]/.exec(buffer)) !== null) {
          const [fullTag, sysName] = match;
          const tagIndex = match.index;

          // 1. Flush everything before the tag
          if (tagIndex > 0) {
            appendText(buffer.substring(0, tagIndex));
          }

          // 2. Add the visual
          appendVisual(sysName.trim());

          // 3. Remove the processed part (pre-text + tag) from buffer
          buffer = buffer.substring(tagIndex + fullTag.length);
        }

        // Logic to flush the buffer safely if it doesn't look like a tag starts here
        const openBracketIndex = buffer.indexOf('[');
        if (openBracketIndex === -1) {
          // No tag start, safe to flush all
          if (buffer) {
            appendText(buffer);
            buffer = '';
          }
        } else {
          // There is a '[', maybe a tag.
          // Flush everything before the '['
          if (openBracketIndex > 0) {
            appendText(buffer.substring(0, openBracketIndex));
            buffer = buffer.substring(openBracketIndex);
          }

          // Check if what remains matches the prefix of our known tag
          const tagPrefix = "[DISPLAY_SYSTEM:";
          // If the buffer is "[FOO", it doesn't match "[DIS...".
          // We only keep it if it *could* be the prefix.
          // i.e. buffer starts with substring of tagPrefix, or tagPrefix starts with buffer.

          const isPotentialTag = tagPrefix.startsWith(buffer) || buffer.startsWith(tagPrefix);

          if (!isPotentialTag) {
            // It's just a bracket, flush it.
            appendText(buffer);
            buffer = '';
          }
        }
      }

      // Flush any remaining buffer at the end of the stream
      if (buffer) {
        appendText(buffer);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setTerminalHistory(prev => {
        const updatedHistory = [...prev];
        const lastEntry = updatedHistory[updatedHistory.length - 1];
        if (lastEntry && lastEntry.type === 'response' && lastEntry.text === '') {
          // Replace placeholder if it's empty
          updatedHistory[updatedHistory.length - 1] = { type: 'response', text: `// MUTHER SYSTEM ERROR: ${errorMessage}` };
        } else {
          // Add a new error entry if something was already streamed
          updatedHistory.push({ type: 'response', text: `// MUTHER SYSTEM ERROR: ${errorMessage}` });
        }
        return updatedHistory;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, systemPersona, dataLogs, crewMembers, currentUserRole, interactionState]);

  return (
    <div className={`bg-black font-mono min-h-screen text-lg ${currentTheme.textPrimary} ${currentTheme.selection}`}>
      <div className="scanline-overlay"></div>
      <div className="flex h-screen p-2 sm:p-4 gap-4">
        <GMControlPanel
          dataLogs={dataLogs}
          systemPersona={systemPersona}
          crewMembers={crewMembers}
          onAddLog={handleAddLog}
          onDeleteLog={handleDeleteLog}
          onUpdateLog={handleUpdateLog}
          onSetSystemPersona={setSystemPersona}
          onAddCrewMember={handleAddCrewMember}
          onUpdateCrewMember={handleUpdateCrewMember}
          onDeleteCrewMember={handleDeleteCrewMember}
          isVisible={isGmPanelVisible}
          onToggleVisibility={() => setIsGmPanelVisible(!isGmPanelVisible)}
          colorTheme={currentTheme}
          onSetTerminalColor={setTerminalColor}
          onClearTerminal={handleClearTerminal}
          shipSystems={shipSystems}
          onAddSystem={handleAddSystem}
          onUpdateSystem={handleUpdateSystem}
          onDeleteSystem={handleDeleteSystem}
        />
        <div className="flex-1 flex flex-col">
          <PlayerTerminal
            history={terminalHistory}
            isLoading={isLoading}
            onSendCommand={handleSendCommand}
            colorTheme={currentTheme}
            currentUserRole={currentUserRole}
            shipSystems={shipSystems}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
