import React, { useState, useEffect } from 'react';
import type { DataLog, ColorTheme, CrewMember } from '../types';

interface GMControlPanelProps {
  dataLogs: DataLog[];
  systemPersona: string;
  crewMembers: CrewMember[];
  onAddLog: (title: string, content: string, requiredRole: string | null) => void;
  onDeleteLog: (id: string) => void;
  onUpdateLog: (id: string, title: string, content: string, requiredRole: string | null) => void;
  onSetSystemPersona: (persona: string) => void;
  onAddCrewMember: (name: string, role: string, password: string) => void;
  onUpdateCrewMember: (id: string, name: string, role: string, password: string) => void;
  onDeleteCrewMember: (id: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  colorTheme: ColorTheme;
  onSetTerminalColor: (color: string) => void;
  onClearTerminal: () => void;
}

const PanelToggleButton: React.FC<{ onClick: () => void; isVisible: boolean }> = ({ onClick, isVisible }) => (
    <button onClick={onClick} className="absolute top-2 -right-7 bg-gray-800/80 text-gray-200 p-1 rounded-r-lg hover:bg-gray-700 transition-colors z-20">
      {isVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      )}
    </button>
  );


const GMControlPanel: React.FC<GMControlPanelProps> = (props) => {
  const {
    dataLogs, systemPersona, crewMembers, onAddLog, onDeleteLog, onUpdateLog, onSetSystemPersona,
    onAddCrewMember, onUpdateCrewMember, onDeleteCrewMember,
    isVisible, onToggleVisibility, colorTheme, onSetTerminalColor, onClearTerminal
  } = props;

  // State for Data Logs
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logRole, setLogRole] = useState('');
  const [editingLog, setEditingLog] = useState<DataLog | null>(null);
  
  // State for Crew Members
  const [crewName, setCrewName] = useState('');
  const [crewRole, setCrewRole] = useState('');
  const [crewPassword, setCrewPassword] = useState('');
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);

  useEffect(() => {
    if (editingLog) {
      setLogTitle(editingLog.title);
      setLogContent(editingLog.content);
      setLogRole(editingLog.requiredRole || '');
    } else {
      setLogTitle('');
      setLogContent('');
      setLogRole('');
    }
  }, [editingLog]);

  useEffect(() => {
    if (editingCrew) {
        setCrewName(editingCrew.name);
        setCrewRole(editingCrew.role);
        setCrewPassword(editingCrew.password);
    } else {
        setCrewName('');
        setCrewRole('');
        setCrewPassword('');
    }
  }, [editingCrew]);

  const handleSaveLog = () => {
    if (!logTitle.trim() || !logContent.trim()) return;
    const role = logRole.trim() ? logRole.trim().toUpperCase() : null;
    if (editingLog) {
      onUpdateLog(editingLog.id, logTitle, logContent, role);
    } else {
      onAddLog(logTitle, logContent, role);
    }
    setEditingLog(null);
  };

  const handleSaveCrew = () => {
    if (!crewName.trim() || !crewRole.trim() || !crewPassword.trim()) return;
    if (editingCrew) {
        onUpdateCrewMember(editingCrew.id, crewName.toUpperCase(), crewRole.toUpperCase(), crewPassword);
    } else {
        onAddCrewMember(crewName.toUpperCase(), crewRole.toUpperCase(), crewPassword);
    }
    setEditingCrew(null);
  };

  const commonInputClass = `w-full p-2 bg-black/50 border rounded focus:ring-1 focus:outline-none ${colorTheme.border} focus:ring-blue-400`;

  return (
    <div className={`relative transition-all duration-300 ease-in-out ${isVisible ? 'w-full md:w-1/3 xl:w-1/4' : 'w-0'}`}>
        <PanelToggleButton onClick={onToggleVisibility} isVisible={isVisible} />
        <div className={`h-full bg-gray-900/70 border-2 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto transition-opacity duration-300 ${colorTheme.border} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className={`text-xl font-bold ${colorTheme.glow}`}>GM CONTROL PANEL</h2>
          
          <div className="space-y-4 border-t pt-4 ${colorTheme.border}">
            <h3 className={`text-lg font-bold ${colorTheme.glow}`}>Settings</h3>
            <div className="p-2 border rounded bg-black/40 ${colorTheme.border}">
              <div className="mb-2">
                  <label className="block mb-1 text-sm">Terminal Color</label>
                  <div className="flex gap-2">
                      <button onClick={() => onSetTerminalColor('blue')} className={`px-3 py-1 rounded transition-colors text-white text-sm ${colorTheme.name === 'blue' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Blue</button>
                      <button onClick={() => onSetTerminalColor('green')} className={`px-3 py-1 rounded transition-colors text-white text-sm ${colorTheme.name === 'green' ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Green</button>
                      <button onClick={() => onSetTerminalColor('orange')} className={`px-3 py-1 rounded transition-colors text-white text-sm ${colorTheme.name === 'orange' ? 'bg-orange-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Orange</button>
                  </div>
              </div>
              <div>
                  <label className="block mb-1 text-sm">Terminal Actions</label>
                  <button onClick={onClearTerminal} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors text-sm`}>
                    Clear History
                  </button>
              </div>
            </div>
          </div>

          <div className={`space-y-2 border-t pt-4 ${colorTheme.border}`}>
            <details className="group">
                <summary className={`text-lg font-bold ${colorTheme.glow} cursor-pointer list-inside`}>
                    Help / Instructions
                </summary>
                <div className={`mt-2 p-2 border rounded bg-black/40 ${colorTheme.border} text-sm space-y-3`}>
                    <p>This panel controls the MUTHER terminal. Here are the commands your players can use:</p>
                    <div>
                        <p><strong className={colorTheme.textSecondary}>General Queries:</strong></p>
                        <p className="pl-2">Players can type any question. MUTHER will answer based on the "System Persona" and the available "Data Logs".</p>
                    </div>
                    <div>
                        <p><strong className={colorTheme.textSecondary}>Login:</strong></p>
                        <p className="pl-2">To access restricted data logs, players must log in using credentials from the "Crew Roster". The command format is:</p>
                        <code className={`block bg-black/50 p-1 rounded my-1 text-center tracking-widest ${colorTheme.textPrimary}`}>LOGIN &lt;NAME&gt; &lt;PASSWORD&gt;</code>
                        <p className="pl-2">Example: <code className={`bg-black/50 px-1 rounded ${colorTheme.textPrimary}`}>LOGIN DALLAS password</code></p>
                        <p className="pl-2 text-xs opacity-70">Note: The name is not case-sensitive, but the password is.</p>
                    </div>
                     <div>
                        <p><strong className={colorTheme.textSecondary}>Logout:</strong></p>
                        <p className="pl-2">To secure the terminal and log out the current user, the command is simply:</p>
                         <code className={`block bg-black/50 p-1 rounded my-1 text-center tracking-widest ${colorTheme.textPrimary}`}>LOGOUT</code>
                    </div>
                </div>
            </details>
          </div>

          <div className="space-y-4 border-t pt-4 ${colorTheme.border}">
            <label className={`block mb-1 text-lg font-bold ${colorTheme.glow}`}>System Persona</label>
            <textarea value={systemPersona} onChange={(e) => onSetSystemPersona(e.target.value)} className={`${commonInputClass} h-32`}/>
          </div>
        
          <div className={`space-y-4 border-t pt-4 ${colorTheme.border}`}>
              <h3 className={`text-lg font-bold ${colorTheme.glow}`}>{editingCrew ? 'Edit Crew Member' : 'Add Crew Member'}</h3>
              <input type="text" placeholder="Crew Name (e.g., DALLAS)" value={crewName} onChange={(e) => setCrewName(e.target.value)} className={`${commonInputClass} uppercase`}/>
              <input type="text" placeholder="Crew Role (e.g., CAPTAIN)" value={crewRole} onChange={(e) => setCrewRole(e.target.value)} className={`${commonInputClass} uppercase`}/>
              <input type="password" placeholder="Password" value={crewPassword} onChange={(e) => setCrewPassword(e.target.value)} className={commonInputClass}/>
              <div className="flex gap-2">
                  <button onClick={handleSaveCrew} className={`${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white px-3 py-1 rounded transition-colors flex-1`}>{editingCrew ? 'Update' : 'Add'}</button>
                  {editingCrew && <button onClick={() => setEditingCrew(null)} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>Cancel</button>}
              </div>
          </div>
          <div className="flex-1 overflow-y-auto border-t pt-4 ${colorTheme.border}">
              <h3 className={`text-lg font-bold mb-2 ${colorTheme.glow}`}>Crew Roster</h3>
              <ul className="space-y-2">
              {crewMembers.map(c => (
                  <li key={c.id} className={`bg-black/40 p-2 rounded border ${colorTheme.border}`}>
                  <p className="font-bold">{c.name} ({c.role})</p>
                  <div className="flex gap-2 mt-2">
                      <button onClick={() => setEditingCrew(c)} className={`text-sm ${colorTheme.textPrimary} hover:text-white`}>Edit</button>
                      <button onClick={() => onDeleteCrewMember(c.id)} className={`text-sm ${colorTheme.button.danger} ${colorTheme.button.dangerHover}`}>Delete</button>
                  </div>
                  </li>
              ))}
              </ul>
          </div>

          <div className={`space-y-4 border-t pt-4 ${colorTheme.border}`}>
            <h3 className={`text-lg font-bold ${colorTheme.glow}`}>{editingLog ? 'Edit Data Log' : 'Add Data Log'}</h3>
            <input type="text" placeholder="Log Title" value={logTitle} onChange={(e) => setLogTitle(e.target.value)} className={commonInputClass}/>
            <textarea placeholder="Log Content..." value={logContent} onChange={(e) => setLogContent(e.target.value)} className={`${commonInputClass} h-24`}/>
            <input type="text" placeholder="Required Role (optional, e.g., CAPTAIN)" value={logRole} onChange={(e) => setLogRole(e.target.value)} className={`${commonInputClass} uppercase`}/>
            <div className="flex gap-2">
              <button onClick={handleSaveLog} className={`${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white px-3 py-1 rounded transition-colors flex-1`}>{editingLog ? 'Update Log' : 'Add Log'}</button>
              {editingLog && <button onClick={() => setEditingLog(null)} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>Cancel</button>}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto border-t pt-4 ${colorTheme.border}">
            <h3 className={`text-lg font-bold mb-2 ${colorTheme.glow}`}>Existing Logs</h3>
            <ul className="space-y-2">
              {dataLogs.map(log => (
                <li key={log.id} className={`bg-black/40 p-2 rounded border ${colorTheme.border}`}>
                  <p className="font-bold">{log.title} {log.requiredRole && <span className={`${colorTheme.textSecondary} text-sm`}>({log.requiredRole} ONLY)</span>}</p>
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