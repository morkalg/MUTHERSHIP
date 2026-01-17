
export interface DataLog {
  id: string;
  title: string;
  content: string;
  requiredRole: string | null;
}

export interface TerminalEntry {
  type: 'command' | 'response';
  text: string;
  visual?: string; // e.g., 'SYSTEM_DIAGNOSTIC:ENGINES'
}

export interface ShipSystem {
  id: string;
  name: string;
  status: 'OPTIMAL' | 'DAMAGED' | 'CRITICAL' | 'OFFLINE';
  details: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  password: string;
}

export interface ColorTheme {
  name: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  bgAccent: string;
  selection: string;
  glow: string;
  button: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    danger: string;
    dangerHover: string;
  }
}
