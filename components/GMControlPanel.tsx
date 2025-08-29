import React, { useState, useEffect } from 'react';
import type { DataLog, ColorTheme } from '../types';

interface GMControlPanelProps {
  dataLogs: DataLog[];
  systemPersona: string;
  onAddLog: (title: string, content: string) => void;
  onDeleteLog: (id: string) => void;
  onUpdateLog: (id: string, title: string, content: string) => void;
  onSetSystemPersona: (persona: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  colorTheme: ColorTheme;
  onSetTerminalColor: (color: string) => void;
  onClearTerminal: () => void;
}

const PanelToggleButton: React.FC<{ onClick: () => void; isVisible: boolean }> = ({ onClick, isVisible }) => (
    <button onClick={onClick} className="absolute top-2 -right-10 bg-blue-900/80 text-blue-200 p-2 rounded-r-lg hover:bg-blue-800 transition-colors z-20">
      {isVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      )}
    </button>
  );


const GMControlPanel: React.FC<GMControlPanelProps> = ({
  dataLogs,
  systemPersona,
  onAddLog,
  onDeleteLog,
  onUpdateLog,
  onSetSystemPersona,
  isVisible,
  onToggleVisibility,
  colorTheme,
  onSetTerminalColor,
  onClearTerminal
}) => {
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogContent, setNewLogContent] = useState('');
  const [editingLog, setEditingLog] = useState<DataLog | null>(null);

  useEffect(() => {
    if (editingLog) {
      setNewLogTitle(editingLog.title);
      setNewLogContent(editingLog.content);
    } else {
      setNewLogTitle('');
      setNewLogContent('');
    }
  }, [editingLog]);

  const handleSave = () => {
    if (!newLogTitle.trim() || !newLogContent.trim()) return;
    if (editingLog) {
      onUpdateLog(editingLog.id, newLogTitle, newLogContent);
    } else {
      onAddLog(newLogTitle, newLogContent);
    }
    setEditingLog(null);
  };

  return (
    <div className={`relative transition-all duration-300 ease-in-out ${isVisible ? 'w-full md:w-1/3' : 'w-0'}`}>
        <div className={`h-full bg-gray-900/70 border-2 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto transition-opacity duration-300 ${colorTheme.border} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <PanelToggleButton onClick={onToggleVisibility} isVisible={isVisible} />
          <h2 className={`text-xl font-bold ${colorTheme.glow}`}>GM CONTROL PANEL</h2>
          
          <div>
            <h3 className={`text-lg font-bold mb-2 ${colorTheme.glow}`}>Settings</h3>
            <div className="p-2 border rounded mb-4 bg-black/40 ${colorTheme.border}">
              <div className="mb-2">
                  <label className="block mb-1">Terminal Color</label>
                  <div className="flex gap-2">
                      <button onClick={() => onSetTerminalColor('blue')} className={`px-3 py-1 rounded transition-colors text-white ${colorTheme.name === 'blue' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Blue</button>
                      <button onClick={() => onSetTerminalColor('green')} className={`px-3 py-1 rounded transition-colors text-white ${colorTheme.name === 'green' ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Green</button>
                      <button onClick={() => onSetTerminalColor('orange')} className={`px-3 py-1 rounded transition-colors text-white ${colorTheme.name === 'orange' ? 'bg-orange-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Orange</button>
                  </div>
              </div>
              <div>
                  <label className="block mb-1">Terminal Actions</label>
                  <button onClick={onClearTerminal} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>
                    Clear History
                  </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1">System Persona</label>
            <textarea
              value={systemPersona}
              onChange={(e) => onSetSystemPersona(e.target.value)}
              className={`w-full h-32 p-2 bg-black/50 border rounded focus:ring-1 focus:outline-none ${colorTheme.border} focus:ring-blue-400`}
            />
          </div>

          <div>
            <h3 className={`text-lg font-bold mb-2 ${colorTheme.glow}`}>{editingLog ? 'Edit Data Log' : 'Add Data Log'}</h3>
            <input
              type="text"
              placeholder="Log Title (e.g., SHIP MANIFEST)"
              value={newLogTitle}
              onChange={(e) => setNewLogTitle(e.target.value)}
              className={`w-full p-2 mb-2 bg-black/50 border rounded focus:ring-1 focus:outline-none ${colorTheme.border} focus:ring-blue-400`}
            />
            <textarea
              placeholder="Log Content..."
              value={newLogContent}
              onChange={(e) => setNewLogContent(e.target.value)}
              className={`w-full h-24 p-2 bg-black/50 border rounded focus:ring-1 focus:outline-none ${colorTheme.border} focus:ring-blue-400`}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSave} className={`${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white px-3 py-1 rounded transition-colors flex-1`}>
                {editingLog ? 'Update Log' : 'Add Log'}
              </button>
              {editingLog && (
                <button onClick={() => setEditingLog(null)} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>
                  Cancel
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <h3 className={`text-lg font-bold mb-2 ${colorTheme.glow}`}>Existing Logs</h3>
            <ul className="space-y-2">
              {dataLogs.map(log => (
                <li key={log.id} className={`bg-black/40 p-2 rounded border ${colorTheme.border}`}>
                  <p className="font-bold">{log.title}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditingLog(log)} className={`text-sm ${colorTheme.textPrimary} hover:text-white`}>Edit</button>
                    <button onClick={() => onDeleteLog(log.id)} className={`text-sm ${colorTheme.button.danger} ${colorTheme.button.dangerHover}`}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
    </div>
  );
};

export default GMControlPanel;
