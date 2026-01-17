import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { DataLog, ColorTheme, CrewMember, ShipSystem } from '../types';

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
  shipSystems: ShipSystem[];
  onAddSystem: (name: string, status: any, details: string) => void;
  onUpdateSystem: (id: string, name: string, status: any, details: string) => void;
  onDeleteSystem: (id: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  colorTheme: ColorTheme;
  onSetTerminalColor: (color: string) => void;
  onClearTerminal: () => void;
}

const PanelToggleButton: React.FC<{ onClick: () => void; isVisible: boolean }> = ({ onClick, isVisible }) => (
  <button onClick={onClick} className={`absolute top-2 bg-gray-800/80 text-gray-200 p-1 rounded-r-lg hover:bg-gray-700 transition-all z-20 ${isVisible ? '-right-7' : '-right-8 w-8 h-8 flex items-center justify-center'}`}>
    {isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    )}
  </button>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultCollapsed?: boolean; colorTheme: ColorTheme }> = ({ title, children, defaultCollapsed = true, colorTheme }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`border-t pt-4 ${colorTheme.border}`}>
      <h3
        className={`text-lg font-bold ${colorTheme.glow} cursor-pointer flex items-center justify-between select-none`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span>{title}</span>
        <span className={`transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </h3>
      {!isCollapsed && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
};




const ShipSystemsSection: React.FC<{
  colorTheme: ColorTheme;
  shipSystems: ShipSystem[];
  onAddSystem: (n: string, s: any, d: string) => void;
  onUpdateSystem: (id: string, n: string, s: any, d: string) => void;
  onDeleteSystem: (id: string) => void;
  commonInputClass: string;
}> = ({ colorTheme, shipSystems, onAddSystem, onUpdateSystem, onDeleteSystem, commonInputClass }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('OPTIMAL');
  const [details, setDetails] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      onUpdateSystem(editingId, name.toUpperCase(), status, details);
      setEditingId(null);
    } else {
      onAddSystem(name.toUpperCase(), status, details);
    }
    setName('');
    setDetails('');
    setStatus('OPTIMAL');
  };

  const startEdit = (sys: ShipSystem) => {
    setName(sys.name);
    setStatus(sys.status);
    setDetails(sys.details);
    setEditingId(sys.id);
  };

  return (
    <CollapsibleSection title="Ship Systems" colorTheme={colorTheme}>
      <div className="space-y-4">
        <h4 className="font-bold">{editingId ? 'Edit System' : 'Add System'}</h4>
        <input type="text" placeholder="System Name (e.g. HYPERDRIVE)" value={name} onChange={e => setName(e.target.value)} className={`${commonInputClass} uppercase`} />
        <select value={status} onChange={e => setStatus(e.target.value)} className={commonInputClass}>
          <option value="OPTIMAL">OPTIMAL</option>
          <option value="DAMAGED">DAMAGED</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="OFFLINE">OFFLINE</option>
        </select>
        <textarea placeholder="Technical Details..." value={details} onChange={e => setDetails(e.target.value)} className={`${commonInputClass} h-20`} />

        <div className="flex gap-2">
          <button onClick={handleSave} className={`${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white px-3 py-1 rounded transition-colors flex-1`}>
            {editingId ? 'Update System' : 'Add System'}
          </button>
          {editingId && <button onClick={() => { setEditingId(null); setName(''); setDetails(''); setStatus('OPTIMAL'); }} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>Cancel</button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        <h4 className="font-bold mb-2">Systems Status</h4>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {shipSystems.map(sys => (
            <li key={sys.id} className={`bg-black/40 p-2 rounded border ${colorTheme.border}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold">{sys.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${sys.status === 'OPTIMAL' ? 'bg-green-900 text-green-300' : (sys.status === 'OFFLINE' ? 'bg-gray-700 text-gray-300' : 'bg-red-900 text-red-300')}`}>{sys.status}</span>
              </div>
              <p className="text-sm opacity-70 truncate">{sys.details}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => startEdit(sys)} className={`text-sm ${colorTheme.textPrimary} hover:text-white`}>Edit</button>
                <button onClick={() => onDeleteSystem(sys.id)} className={`text-sm ${colorTheme.button.danger} ${colorTheme.button.dangerHover}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleSection>
  );
};


const GMControlPanel: React.FC<GMControlPanelProps> = (props) => {
  const {
    dataLogs, systemPersona, crewMembers, onAddLog, onDeleteLog, onUpdateLog, onSetSystemPersona,
    onAddCrewMember, onUpdateCrewMember, onDeleteCrewMember,
    shipSystems, onAddSystem, onUpdateSystem, onDeleteSystem,
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

  // State for resizing
  const [panelWidth, setPanelWidth] = useState(450);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startWidth = panelRef.current?.offsetWidth ?? 0;
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const newWidth = startWidth + dx;
      const maxWidth = window.innerWidth * 0.8;
      const minWidth = 320;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

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
    const finalName = crewName.trim().toUpperCase();
    const finalRole = crewRole.trim().toUpperCase();
    if (editingCrew) {
      onUpdateCrewMember(editingCrew.id, finalName, finalRole, crewPassword);
    } else {
      onAddCrewMember(finalName, finalRole, crewPassword);
    }
    setEditingCrew(null);
  };

  const commonInputClass = `w-full p-2 bg-black/50 border rounded focus:ring-1 focus:outline-none ${colorTheme.border} focus:ring-blue-400`;

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 transition-all duration-300 ease-in-out`}
      style={{ width: isVisible ? `${panelWidth}px` : '0px', minWidth: isVisible ? '320px' : '0' }}
    >
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 right-0 h-full w-2 cursor-col-resize z-30 transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />
      <PanelToggleButton onClick={onToggleVisibility} isVisible={isVisible} />

      <div className={`h-full bg-gray-900/70 border-2 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto transition-opacity duration-300 ${colorTheme.border} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className={`text-xl font-bold ${colorTheme.glow}`}>GM CONTROL PANEL</h2>

        <CollapsibleSection title="Settings" colorTheme={colorTheme}>
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
        </CollapsibleSection>

        <CollapsibleSection title="Help / Instructions" colorTheme={colorTheme}>
          <div className={`p-2 border rounded bg-black/40 ${colorTheme.border} text-sm space-y-3`}>
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
        </CollapsibleSection>

        <CollapsibleSection title="System Persona" colorTheme={colorTheme}>
          <textarea value={systemPersona} onChange={(e) => onSetSystemPersona(e.target.value)} className={`${commonInputClass} h-32`} />
        </CollapsibleSection>

        <CollapsibleSection title="Crew Roster" colorTheme={colorTheme}>
          <div className="space-y-4">
            <h4 className="font-bold">{editingCrew ? 'Edit Crew Member' : 'Add Crew Member'}</h4>
            <input type="text" placeholder="Crew Name (e.g., DALLAS)" value={crewName} onChange={(e) => setCrewName(e.target.value)} className={`${commonInputClass} uppercase`} />
            <input type="text" placeholder="Crew Role (e.g., CAPTAIN)" value={crewRole} onChange={(e) => setCrewRole(e.target.value)} className={`${commonInputClass} uppercase`} />
            <input type="password" placeholder="Password" value={crewPassword} onChange={(e) => setCrewPassword(e.target.value)} className={commonInputClass} />
            <div className="flex gap-2">
              <button onClick={handleSaveCrew} className={`${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white px-3 py-1 rounded transition-colors flex-1`}>{editingCrew ? 'Update' : 'Add'}</button>
              {editingCrew && <button onClick={() => setEditingCrew(null)} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>Cancel</button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pt-4">
            <h4 className="font-bold mb-2">Current Roster</h4>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
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
        </CollapsibleSection>

        <CollapsibleSection title="Data Logs" colorTheme={colorTheme}>
          <div className="space-y-4">
            <h4 className="font-bold">{editingLog ? 'Edit Data Log' : 'Add Data Log'}</h4>
            <input type="text" placeholder="Log Title" value={logTitle} onChange={(e) => setLogTitle(e.target.value)} className={commonInputClass} />
            <textarea placeholder="Log Content..." value={logContent} onChange={(e) => setLogContent(e.target.value)} className={`${commonInputClass} h-24`} />
            <input type="text" placeholder="Required Role (optional, e.g., CAPTAIN)" value={logRole} onChange={(e) => setLogRole(e.target.value)} className={`${commonInputClass} uppercase`} />
            <div className="flex gap-2">
              <button onClick={handleSaveLog} className={`${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white px-3 py-1 rounded transition-colors flex-1`}>{editingLog ? 'Update Log' : 'Add Log'}</button>
              {editingLog && <button onClick={() => setEditingLog(null)} className={`${colorTheme.button.secondary} ${colorTheme.button.secondaryHover} text-white px-3 py-1 rounded transition-colors`}>Cancel</button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pt-4">
            <h4 className="font-bold mb-2">Existing Logs</h4>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
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
        </CollapsibleSection>

        <ShipSystemsSection
          colorTheme={colorTheme}
          shipSystems={shipSystems}
          onAddSystem={onAddSystem}
          onUpdateSystem={onUpdateSystem}
          onDeleteSystem={onDeleteSystem}
          commonInputClass={commonInputClass}
        />

      </div>
    </div>
  );
};

export default GMControlPanel;