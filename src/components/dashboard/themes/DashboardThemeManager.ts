import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardTheme } from '../DashboardRenderer';

/**
 * Dashboard Theme Manager
 * 
 * Manages dashboard themes including:
 * - Built-in themes (light, dark)
 * - Custom theme creation and management
 * - Theme persistence and loading
 * - Theme switching and validation
 * - Theme inheritance and composition
 */

// Extended theme interface with additional properties
export interface ExtendedDashboardTheme extends DashboardTheme {
  description?: string;
  author?: string;
  version?: string;
  category?: 'built-in' | 'custom' | 'community';
  preview?: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  customizations?: {
    borderRadius?: number;
    shadowIntensity?: number;
    animationDuration?: number;
    fontScale?: number;
  };
}

// Built-in themes with extended properties
export const BUILT_IN_THEMES: Record<string, ExtendedDashboardTheme> = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright theme for daytime use',
    author: 'Lattice Team',
    version: '1.0.0',
    category: 'built-in',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      heading: 'text-gray-900',
      body: 'text-gray-700',
      caption: 'text-gray-500',
    },
    preview: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    customizations: {
      borderRadius: 12,
      shadowIntensity: 0.1,
      animationDuration: 200,
      fontScale: 1.0,
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme for low-light environments',
    author: 'Lattice Team',
    version: '1.0.0',
    category: 'built-in',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      heading: 'text-white',
      body: 'text-gray-200',
      caption: 'text-gray-400',
    },
    preview: {
      primaryColor: '#60a5fa',
      backgroundColor: '#111827',
      textColor: '#f9fafb',
    },
    customizations: {
      borderRadius: 12,
      shadowIntensity: 0.2,
      animationDuration: 200,
      fontScale: 1.0,
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue theme inspired by ocean depths',
    author: 'Lattice Team',
    version: '1.0.0',
    category: 'built-in',
    colors: {
      primary: '#0891b2',
      secondary: '#0284c7',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#164e63',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      heading: 'text-cyan-900',
      body: 'text-cyan-800',
      caption: 'text-cyan-600',
    },
    preview: {
      primaryColor: '#0891b2',
      backgroundColor: '#f0f9ff',
      textColor: '#164e63',
    },
    customizations: {
      borderRadius: 16,
      shadowIntensity: 0.15,
      animationDuration: 250,
      fontScale: 1.0,
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm gradient theme with sunset colors',
    author: 'Lattice Team',
    version: '1.0.0',
    category: 'built-in',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#92400e',
      textSecondary: '#d97706',
      border: '#fed7aa',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      heading: 'text-orange-900',
      body: 'text-orange-800',
      caption: 'text-orange-600',
    },
    preview: {
      primaryColor: '#f97316',
      backgroundColor: '#fffbeb',
      textColor: '#92400e',
    },
    customizations: {
      borderRadius: 20,
      shadowIntensity: 0.2,
      animationDuration: 300,
      fontScale: 1.05,
    },
  },
};

export class DashboardThemeManager {
  private static instance: DashboardThemeManager;
  private themes: Map<string, ExtendedDashboardTheme> = new Map();
  private currentThemeId: string = 'light';
  private storageKey = 'dashboard_themes';
  private currentThemeKey = 'dashboard_current_theme';

  private constructor() {
    this.initializeBuiltInThemes();
  }

  static getInstance(): DashboardThemeManager {
    if (!DashboardThemeManager.instance) {
      DashboardThemeManager.instance = new DashboardThemeManager();
    }
    return DashboardThemeManager.instance;
  }

  /**
   * Initialize built-in themes
   */
  private initializeBuiltInThemes(): void {
    Object.values(BUILT_IN_THEMES).forEach(theme => {
      this.themes.set(theme.id, theme);
    });
  }

  /**
   * Load themes from storage
   */
  async loadThemes(): Promise<void> {
    try {
      // Load custom themes
      const storedThemes = await AsyncStorage.getItem(this.storageKey);
      if (storedThemes) {
        const customThemes: ExtendedDashboardTheme[] = JSON.parse(storedThemes);
        customThemes.forEach(theme => {
          this.themes.set(theme.id, theme);
        });
      }

      // Load current theme
      const currentTheme = await AsyncStorage.getItem(this.currentThemeKey);
      if (currentTheme && this.themes.has(currentTheme)) {
        this.currentThemeId = currentTheme;
      }

      if (__DEV__) {


        console.log(`✅ Loaded ${this.themes.size} dashboard themes`);


      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  }

  /**
   * Save custom themes to storage
   */
  async saveThemes(): Promise<void> {
    try {
      const customThemes = Array.from(this.themes.values())
        .filter(theme => theme.category !== 'built-in');
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(customThemes));
      await AsyncStorage.setItem(this.currentThemeKey, this.currentThemeId);
    } catch (error) {
      console.error('Failed to save themes:', error);
    }
  }

  /**
   * Get all themes
   */
  getAllThemes(): ExtendedDashboardTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get themes by category
   */
  getThemesByCategory(category: 'built-in' | 'custom' | 'community'): ExtendedDashboardTheme[] {
    return Array.from(this.themes.values())
      .filter(theme => theme.category === category);
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId: string): ExtendedDashboardTheme | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ExtendedDashboardTheme {
    return this.themes.get(this.currentThemeId) || BUILT_IN_THEMES.light;
  }

  /**
   * Set current theme
   */
  async setCurrentTheme(themeId: string): Promise<boolean> {
    if (!this.themes.has(themeId)) {
      console.warn(`Theme ${themeId} not found`);
      return false;
    }

    this.currentThemeId = themeId;
    await this.saveThemes();
    
    if (__DEV__) {

    
      console.log(`🎨 Switched to theme: ${themeId}`);

    
    }
    return true;
  }

  /**
   * Create custom theme
   */
  async createCustomTheme(theme: Partial<ExtendedDashboardTheme> & { id: string; name: string }): Promise<boolean> {
    if (this.themes.has(theme.id)) {
      console.warn(`Theme ${theme.id} already exists`);
      return false;
    }

    // Create theme with defaults
    const customTheme: ExtendedDashboardTheme = {
      ...BUILT_IN_THEMES.light, // Use light theme as base
      ...theme,
      category: 'custom',
      version: theme.version || '1.0.0',
      author: theme.author || 'User',
    };

    this.themes.set(theme.id, customTheme);
    await this.saveThemes();
    
    if (__DEV__) {

    
      console.log(`✨ Created custom theme: ${theme.name} (${theme.id})`);

    
    }
    return true;
  }

  /**
   * Update existing theme
   */
  async updateTheme(themeId: string, updates: Partial<ExtendedDashboardTheme>): Promise<boolean> {
    const existingTheme = this.themes.get(themeId);
    if (!existingTheme) {
      console.warn(`Theme ${themeId} not found`);
      return false;
    }

    // Don't allow updating built-in themes
    if (existingTheme.category === 'built-in') {
      console.warn(`Cannot update built-in theme: ${themeId}`);
      return false;
    }

    const updatedTheme: ExtendedDashboardTheme = {
      ...existingTheme,
      ...updates,
      id: themeId, // Ensure ID doesn't change
    };

    this.themes.set(themeId, updatedTheme);
    await this.saveThemes();
    
    if (__DEV__) {

    
      console.log(`🔄 Updated theme: ${themeId}`);

    
    }
    return true;
  }

  /**
   * Delete custom theme
   */
  async deleteTheme(themeId: string): Promise<boolean> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.warn(`Theme ${themeId} not found`);
      return false;
    }

    // Don't allow deleting built-in themes
    if (theme.category === 'built-in') {
      console.warn(`Cannot delete built-in theme: ${themeId}`);
      return false;
    }

    // Switch to light theme if deleting current theme
    if (this.currentThemeId === themeId) {
      await this.setCurrentTheme('light');
    }

    this.themes.delete(themeId);
    await this.saveThemes();
    
    if (__DEV__) {

    
      console.log(`🗑️ Deleted theme: ${themeId}`);

    
    }
    return true;
  }

  /**
   * Create theme from existing theme (clone)
   */
  async cloneTheme(sourceThemeId: string, newThemeId: string, newThemeName: string): Promise<boolean> {
    const sourceTheme = this.themes.get(sourceThemeId);
    if (!sourceTheme) {
      console.warn(`Source theme ${sourceThemeId} not found`);
      return false;
    }

    if (this.themes.has(newThemeId)) {
      console.warn(`Theme ${newThemeId} already exists`);
      return false;
    }

    const clonedTheme: ExtendedDashboardTheme = {
      ...sourceTheme,
      id: newThemeId,
      name: newThemeName,
      category: 'custom',
      author: 'User',
      version: '1.0.0',
    };

    this.themes.set(newThemeId, clonedTheme);
    await this.saveThemes();
    
    if (__DEV__) {

    
      console.log(`📋 Cloned theme: ${sourceThemeId} → ${newThemeId}`);

    
    }
    return true;
  }

  /**
   * Export theme configuration
   */
  exportTheme(themeId: string): string | null {
    const theme = this.themes.get(themeId);
    if (!theme) {
      return null;
    }

    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme from configuration
   */
  async importTheme(themeConfig: string): Promise<boolean> {
    try {
      const theme: ExtendedDashboardTheme = JSON.parse(themeConfig);
      
      // Validate theme structure
      if (!theme.id || !theme.name || !theme.colors) {
        console.error('Invalid theme configuration');
        return false;
      }

      // Mark as custom if not specified
      theme.category = theme.category || 'custom';

      return await this.createCustomTheme(theme);
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  /**
   * Reset to default themes
   */
  async resetToDefaults(): Promise<void> {
    this.themes.clear();
    this.initializeBuiltInThemes();
    this.currentThemeId = 'light';
    
    await AsyncStorage.removeItem(this.storageKey);
    await AsyncStorage.removeItem(this.currentThemeKey);
    
    if (__DEV__) {

    
      console.log('🔄 Reset themes to defaults');

    
    }
  }

  /**
   * Get theme statistics
   */
  getStats() {
    const themes = Array.from(this.themes.values());
    return {
      total: themes.length,
      builtIn: themes.filter(t => t.category === 'built-in').length,
      custom: themes.filter(t => t.category === 'custom').length,
      community: themes.filter(t => t.category === 'community').length,
      current: this.currentThemeId,
    };
  }
}

// Export singleton instance
export const themeManager = DashboardThemeManager.getInstance();

export default DashboardThemeManager;
