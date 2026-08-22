export interface ThemeColor {
  id: string;
  name: string;
  badgeBg: string;
  colors: Record<string, string>;
}

export const THEME_COLORS: ThemeColor[] = [
  {
    id: 'indigo',
    name: 'Tím Indigo (Mặc định)',
    badgeBg: 'bg-indigo-500',
    colors: {
      '--brand-50': '#eef2ff',
      '--brand-100': '#e0e7ff',
      '--brand-200': '#c7d2fe',
      '--brand-300': '#a5b4fc',
      '--brand-400': '#818cf8',
      '--brand-500': '#6366f1',
      '--brand-600': '#4f46e5',
      '--brand-700': '#4338ca',
      '--brand-800': '#3730a3',
      '--brand-900': '#312e81',
      '--brand-950': '#1e1b4b',
    }
  },
  {
    id: 'blue',
    name: 'Xanh Dương Ocean',
    badgeBg: 'bg-blue-500',
    colors: {
      '--brand-50': '#eff6ff',
      '--brand-100': '#dbeafe',
      '--brand-200': '#bfdbfe',
      '--brand-300': '#93c5fd',
      '--brand-400': '#60a5fa',
      '--brand-500': '#3b82f6',
      '--brand-600': '#2563eb',
      '--brand-700': '#1d4ed8',
      '--brand-800': '#1e40af',
      '--brand-900': '#1e3a8a',
      '--brand-950': '#172554',
    }
  },
  {
    id: 'emerald',
    name: 'Xanh Ngọc Emerald',
    badgeBg: 'bg-emerald-500',
    colors: {
      '--brand-50': '#ecfdf5',
      '--brand-100': '#d1fae5',
      '--brand-200': '#a7f3d0',
      '--brand-300': '#6ee7b7',
      '--brand-400': '#34d399',
      '--brand-500': '#10b981',
      '--brand-600': '#059669',
      '--brand-700': '#047857',
      '--brand-800': '#065f46',
      '--brand-900': '#064e3b',
      '--brand-950': '#022c22',
    }
  },
  {
    id: 'rose',
    name: 'Hồng Ruby Rose',
    badgeBg: 'bg-rose-500',
    colors: {
      '--brand-50': '#fff1f2',
      '--brand-100': '#ffe4e6',
      '--brand-200': '#fecdd3',
      '--brand-300': '#fda4af',
      '--brand-400': '#fb7185',
      '--brand-500': '#f43f5e',
      '--brand-600': '#e11d48',
      '--brand-700': '#be123c',
      '--brand-800': '#9f1239',
      '--brand-900': '#881337',
      '--brand-950': '#4c0519',
    }
  },
  {
    id: 'orange',
    name: 'Cam Sunset',
    badgeBg: 'bg-orange-500',
    colors: {
      '--brand-50': '#fff7ed',
      '--brand-100': '#ffedd5',
      '--brand-200': '#fed7aa',
      '--brand-300': '#fdba74',
      '--brand-400': '#fb923c',
      '--brand-500': '#f97316',
      '--brand-600': '#ea580c',
      '--brand-700': '#c2410c',
      '--brand-800': '#9a3412',
      '--brand-900': '#7c2d12',
      '--brand-950': '#431407',
    }
  },
  {
    id: 'purple',
    name: 'Tím Hoàng Gia',
    badgeBg: 'bg-purple-500',
    colors: {
      '--brand-50': '#faf5ff',
      '--brand-100': '#f3e8ff',
      '--brand-200': '#e9d5ff',
      '--brand-300': '#d8b4fe',
      '--brand-400': '#c084fc',
      '--brand-500': '#a855f7',
      '--brand-600': '#9333ea',
      '--brand-700': '#7e22ce',
      '--brand-800': '#6b21a8',
      '--brand-900': '#581c87',
      '--brand-950': '#3b0764',
    }
  }
];

export class ThemeService {
  private static STORAGE_KEY = 'vm_primary_theme_color';

  public static getSelectedTheme(): string {
    return localStorage.getItem(this.STORAGE_KEY) || 'indigo';
  }

  public static applyTheme(themeId: string): void {
    const theme = THEME_COLORS.find(t => t.id === themeId) || THEME_COLORS[0];
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    localStorage.setItem(this.STORAGE_KEY, theme.id);
  }

  public static init(): void {
    const saved = this.getSelectedTheme();
    this.applyTheme(saved);
  }
}
