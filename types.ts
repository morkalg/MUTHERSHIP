
export interface DataLog {
  id: string;
  title: string;
  content: string;
}

export interface TerminalEntry {
  type: 'command' | 'response';
  text: string;
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
