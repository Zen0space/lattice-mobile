import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardConfig } from '../components/dashboard/types';
import { useDashboardStore } from '../stores/dashboardStore';

const DASHBOARDS_KEY = 'user_dashboards';
const ACTIVE_DASHBOARD_KEY = 'active_dashboard';

export class DashboardStorage {
  /**
   * Helper function to safely convert a date to ISO string
   */
  private static safeToISOString(date: any): string {
    try {
      if (!date) return new Date().toISOString();
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString();
      }
      // Try to parse as date if it's a string
      if (typeof date === 'string') {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
      }
      // Fallback to current date
      console.warn('⚠️ Invalid date found, using current date as fallback:', date);
      return new Date().toISOString();
    } catch (error) {
      console.warn('⚠️ Error converting date to ISO string, using current date:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Helper function to safely create a Date object
   */
  private static safeToDate(dateValue: any): Date {
    try {
      if (!dateValue) return new Date();
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue;
      }
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
      // Fallback to current date
      console.warn('⚠️ Invalid date value found, using current date as fallback:', dateValue);
      return new Date();
    } catch (error) {
      console.warn('⚠️ Error creating date object, using current date:', error);
      return new Date();
    }
  }
  /**
   * Save all dashboard configurations to local storage
   */
  static async saveDashboards(dashboards: DashboardConfig[]): Promise<void> {
    try {
      const dashboardsJson = JSON.stringify(dashboards.map(dashboard => ({
        ...dashboard,
        createdAt: this.safeToISOString(dashboard.createdAt),
        lastAccessed: this.safeToISOString(dashboard.lastAccessed),
        widgets: dashboard.widgets?.map(widget => ({
          ...widget,
          createdAt: this.safeToISOString(widget.createdAt),
          updatedAt: this.safeToISOString(widget.updatedAt),
        })) || [],
      })));
      await AsyncStorage.setItem(DASHBOARDS_KEY, dashboardsJson);
      console.log('✅ Dashboards with widgets saved to local storage');
    } catch (error) {
      console.error('❌ Error saving dashboards:', error);
      throw error;
    }
  }

  /**
   * Load all dashboard configurations from local storage
   */
  static async loadDashboards(): Promise<DashboardConfig[]> {
    try {
      const dashboardsJson = await AsyncStorage.getItem(DASHBOARDS_KEY);
      if (!dashboardsJson) {
        console.log('📝 No saved dashboards found, returning empty array');
        return [];
      }

      let dashboards;
      try {
        dashboards = JSON.parse(dashboardsJson);
      } catch (parseError) {
        console.error('❌ Error parsing dashboard JSON, clearing corrupted data:', parseError);
        await AsyncStorage.removeItem(DASHBOARDS_KEY);
        return [];
      }

      if (!Array.isArray(dashboards)) {
        console.error('❌ Dashboard data is not an array, clearing corrupted data');
        await AsyncStorage.removeItem(DASHBOARDS_KEY);
        return [];
      }

      return dashboards.map((dashboard: any) => {
        try {
          return {
            ...dashboard,
            createdAt: this.safeToDate(dashboard.createdAt),
            lastAccessed: this.safeToDate(dashboard.lastAccessed),
            widgets: dashboard.widgets?.map((widget: any) => ({
              ...widget,
              createdAt: this.safeToDate(widget.createdAt),
              updatedAt: this.safeToDate(widget.updatedAt),
            })) || [],
          };
        } catch (widgetError) {
          console.warn('⚠️ Error processing dashboard, using fallback values:', widgetError);
          return {
            ...dashboard,
            createdAt: new Date(),
            lastAccessed: new Date(),
            widgets: [],
          };
        }
      });
    } catch (error) {
      console.error('❌ Error loading dashboards:', error);
      return [];
    }
  }

  /**
   * Save a single dashboard configuration
   */
  static async saveDashboard(dashboard: DashboardConfig): Promise<void> {
    try {
      const dashboards = await this.loadDashboards();
      const existingIndex = dashboards.findIndex(d => d.id === dashboard.id);
      
      if (existingIndex >= 0) {
        // Update existing dashboard
        dashboards[existingIndex] = {
          ...dashboard,
          lastAccessed: new Date(),
        };
      } else {
        // Add new dashboard
        dashboards.push({
          ...dashboard,
          createdAt: new Date(),
          lastAccessed: new Date(),
        });
      }

      await this.saveDashboards(dashboards);
      console.log(`✅ Dashboard "${dashboard.name}" saved`);
    } catch (error) {
      console.error('❌ Error saving dashboard:', error);
      throw error;
    }
  }

  /**
   * Delete a dashboard configuration and all associated widgets
   */
  static async deleteDashboard(dashboardId: string): Promise<boolean> {
    try {
      const dashboards = await this.loadDashboards();
      const dashboardToDelete = dashboards.find(d => d.id === dashboardId);
      
      if (!dashboardToDelete) {
        console.warn(`⚠️ Dashboard with ID "${dashboardId}" not found`);
        return false;
      }

      // CRITICAL: Log widget cleanup for debugging
      const widgetCount = dashboardToDelete.widgets?.length || 0;
      if (widgetCount > 0) {
        console.log(`🧹 Cleaning up ${widgetCount} widgets from dashboard "${dashboardId}"`);
        dashboardToDelete.widgets?.forEach(widget => {
          console.log(`  - Deleting widget: "${widget.title}" (${widget.type})`);
        });
      }

      // Remove dashboard (and implicitly all its widgets)
      const filteredDashboards = dashboards.filter(d => d.id !== dashboardId);
      await this.saveDashboards(filteredDashboards);
      
      console.log(`✅ Dashboard "${dashboardId}" and ${widgetCount} widgets deleted successfully`);
      
      // Check if the deleted dashboard was the active one
      const activeDashboard = await this.getActiveDashboard();
      const wasActiveDashboard = activeDashboard === dashboardId;
      
      return wasActiveDashboard;
    } catch (error) {
      console.error('❌ Error deleting dashboard:', error);
      throw error;
    }
  }

  /**
   * Get a specific dashboard by ID
   */
  static async getDashboard(dashboardId: string): Promise<DashboardConfig | null> {
    try {
      const dashboards = await this.loadDashboards();
      const dashboard = dashboards.find(d => d.id === dashboardId);
      
      if (dashboard) {
        // Update last accessed time
        dashboard.lastAccessed = new Date();
        await this.saveDashboard(dashboard);
      }
      
      return dashboard || null;
    } catch (error) {
      console.error('❌ Error getting dashboard:', error);
      return null;
    }
  }

  /**
   * Set the active dashboard ID
   */
  static async setActiveDashboard(dashboardId: string | null): Promise<void> {
    try {
      if (dashboardId) {
        await AsyncStorage.setItem(ACTIVE_DASHBOARD_KEY, dashboardId);
      } else {
        await AsyncStorage.removeItem(ACTIVE_DASHBOARD_KEY);
      }
      console.log(`✅ Active dashboard set to: ${dashboardId || 'none'}`);
    } catch (error) {
      console.error('❌ Error setting active dashboard:', error);
      throw error;
    }
  }

  /**
   * Get the active dashboard ID
   */
  static async getActiveDashboard(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_DASHBOARD_KEY);
    } catch (error) {
      console.error('❌ Error getting active dashboard:', error);
      return null;
    }
  }

  /**
   * Clear all dashboard data (useful for reset/logout)
   */
  static async clearAllDashboards(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DASHBOARDS_KEY);
      await AsyncStorage.removeItem(ACTIVE_DASHBOARD_KEY);
      console.log('✅ All dashboard data cleared');
    } catch (error) {
      console.error('❌ Error clearing dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<{
    totalDashboards: number;
    lastModified: Date | null;
    activeDashboard: string | null;
  }> {
    try {
      const dashboards = await this.loadDashboards();
      const activeDashboard = await this.getActiveDashboard();
      
      let lastModified: Date | null = null;
      if (dashboards.length > 0) {
        lastModified = dashboards.reduce((latest, dashboard) => {
          return dashboard.lastAccessed > latest ? dashboard.lastAccessed : latest;
        }, dashboards[0].lastAccessed);
      }

      return {
        totalDashboards: dashboards.length,
        lastModified,
        activeDashboard,
      };
    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      return {
        totalDashboards: 0,
        lastModified: null,
        activeDashboard: null,
      };
    }
  }

  /**
   * Export dashboards for backup
   */
  static async exportDashboards(): Promise<string> {
    try {
      const dashboards = await this.loadDashboards();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        dashboards,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Error exporting dashboards:', error);
      throw error;
    }
  }

  /**
   * Import dashboards from backup
   */
  static async importDashboards(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      if (!importData.dashboards || !Array.isArray(importData.dashboards)) {
        throw new Error('Invalid dashboard export format');
      }

      const dashboards = importData.dashboards.map((dashboard: any) => ({
        ...dashboard,
        createdAt: new Date(dashboard.createdAt),
        lastAccessed: new Date(dashboard.lastAccessed),
      }));

      await this.saveDashboards(dashboards);
      console.log(`✅ Imported ${dashboards.length} dashboards`);
    } catch (error) {
      console.error('❌ Error importing dashboards:', error);
      throw error;
    }
  }

  /**
   * Save widgets for a specific dashboard
   * Now validates dashboard existence using Zustand store
   */
  static async saveDashboardWidgets(dashboardId: string, widgets: any[]): Promise<void> {
    try {
      // CRITICAL: Validate inputs
      if (!dashboardId) {
        throw new Error('Dashboard ID is required for saving widgets');
      }
      
      if (!Array.isArray(widgets)) {
        throw new Error('Widgets must be an array');
      }

      // Get dashboard from Zustand store for validation
      const { dashboards, updateDashboard } = useDashboardStore.getState();
      const targetDashboard = dashboards.find(d => d.id === dashboardId);
      
      // CRITICAL: Validate dashboard exists in current state
      if (!targetDashboard) {
        const availableDashboards = dashboards.map(d => `${d.name} (${d.id})`).join(', ');
        const errorMsg = `Dashboard "${dashboardId}" not found in current state. Available dashboards: ${availableDashboards}`;
        console.error(`❌ Cannot save widgets: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      // Validate widget data
      widgets.forEach((widget, index) => {
        if (!widget.id || !widget.title || !widget.type) {
          throw new Error(`Invalid widget data at index ${index}: missing required fields (id, title, type)`);
        }
      });
      
      // Update dashboard in Zustand store with widgets
      updateDashboard(dashboardId, { 
        widgets, 
        lastAccessed: new Date() 
      });
      
      console.log(`✅ Saved ${widgets.length} widgets for dashboard "${targetDashboard.name}" (${dashboardId})`);
      console.log(`✅ Dashboards with widgets saved to local storage`);
    } catch (error) {
      console.error('❌ Error saving dashboard widgets:', error);
      console.error('Dashboard ID:', dashboardId);
      console.error('Widget count:', widgets?.length || 0);
      throw error;
    }
  }

  /**
   * Load widgets for a specific dashboard
   * Now uses Zustand store as source of truth for dashboard existence
   */
  static async loadDashboardWidgets(dashboardId: string): Promise<any[]> {
    try {
      // Get dashboard from Zustand store instead of old storage
      const { dashboards } = useDashboardStore.getState();
      const dashboard = dashboards.find(d => d.id === dashboardId);
      
      // CRITICAL: Handle case where dashboard doesn't exist in Zustand store
      if (!dashboard) {
        console.warn(`⚠️ Cannot load widgets: Dashboard "${dashboardId}" not found in current state`);
        return []; // Return empty array for non-existent dashboard
      }
      
      const widgets = dashboard.widgets || [];
      console.log(`📝 Loaded ${widgets.length} widgets for dashboard ${dashboardId}`);
      if (widgets.length === 0) {
        console.log(`📝 No widgets found for ${dashboard.name} dashboard`);
      }
      return widgets;
    } catch (error) {
      console.error('❌ Error loading dashboard widgets:', error);
      return [];
    }
  }

  /**
   * Clear all widgets for a specific dashboard (used during deletion)
   */
  static async clearDashboardWidgets(dashboardId: string): Promise<number> {
    try {
      // First, get current widget count for reporting
      const currentWidgets = await this.loadDashboardWidgets(dashboardId);
      const widgetCount = currentWidgets.length;
      
      if (widgetCount === 0) {
        console.log(`📝 No widgets to clear for dashboard: ${dashboardId}`);
        return 0;
      }
      
      console.log(`🧹 Clearing ${widgetCount} widgets for dashboard: ${dashboardId}`);
      
      // Get dashboard from Zustand store and clear widgets
      const { dashboards, updateDashboard } = useDashboardStore.getState();
      const targetDashboard = dashboards.find(d => d.id === dashboardId);
      
      if (!targetDashboard) {
        console.warn(`⚠️ Dashboard ${dashboardId} not found in current state during widget clearing`);
        return 0;
      }
      
      // Update dashboard in Zustand store with empty widgets array
      updateDashboard(dashboardId, { widgets: [] });
      console.log(`✅ Successfully cleared ${widgetCount} widgets from dashboard: ${dashboardId}`);
      
      return widgetCount;
    } catch (error) {
      console.error(`❌ Error clearing widgets for dashboard ${dashboardId}:`, error);
      throw error; // Throw error so deletion process can handle it properly
    }
  }
}

export default DashboardStorage;
