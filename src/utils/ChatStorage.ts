import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isFinancialAdvice?: boolean;
  chartConfig?: any;
  financialData?: any;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

class ChatStorage {
  private static readonly STORAGE_KEY = '@LatticeChat:messages';
  private static readonly SESSIONS_KEY = '@LatticeChat:sessions';
  private static readonly CURRENT_SESSION_KEY = '@LatticeChat:currentSession';

  /**
   * Save messages to AsyncStorage
   */
  static async saveMessages(messages: ChatMessage[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(messages);
      await AsyncStorage.setItem(this.STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving messages:', error);
      throw error;
    }
  }

  /**
   * Load messages from AsyncStorage
   */
  static async loadMessages(): Promise<ChatMessage[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (jsonValue !== null) {
        const messages = JSON.parse(jsonValue);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  /**
   * Add a single message and save to storage
   */
  static async addMessage(message: ChatMessage): Promise<void> {
    try {
      const existingMessages = await this.loadMessages();
      const updatedMessages = [...existingMessages, message];
      await this.saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Clear all messages from storage
   */
  static async clearMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing messages:', error);
      throw error;
    }
  }

  /**
   * Create a new chat session
   */
  static async createNewSession(): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const currentMessages = await this.loadMessages();
      
      if (currentMessages.length > 0) {
        // Save current messages as a session
        const session: ChatSession = {
          id: sessionId,
          messages: currentMessages,
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        
        await this.saveSession(session);
      }
      
      // Clear current messages to start fresh
      await this.clearMessages();
      
      // Set new session as current
      await AsyncStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating new session:', error);
      throw error;
    }
  }

  /**
   * Save a chat session
   */
  static async saveSession(session: ChatSession): Promise<void> {
    try {
      const existingSessions = await this.loadSessions();
      const updatedSessions = [...existingSessions.filter(s => s.id !== session.id), session];
      const jsonValue = JSON.stringify(updatedSessions);
      await AsyncStorage.setItem(this.SESSIONS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  /**
   * Load all chat sessions
   */
  static async loadSessions(): Promise<ChatSession[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.SESSIONS_KEY);
      if (jsonValue !== null) {
        const sessions = JSON.parse(jsonValue);
        return sessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastUpdated: new Date(session.lastUpdated),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  /**
   * Load a specific session
   */
  static async loadSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessions = await this.loadSessions();
      return sessions.find(session => session.id === sessionId) || null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  /**
   * Get current session ID
   */
  static async getCurrentSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Error getting current session ID:', error);
      return null;
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.loadSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      const jsonValue = JSON.stringify(updatedSessions);
      await AsyncStorage.setItem(this.SESSIONS_KEY, jsonValue);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalMessages: number;
    totalSessions: number;
    currentSessionMessages: number;
  }> {
    try {
      const messages = await this.loadMessages();
      const sessions = await this.loadSessions();
      
      return {
        totalMessages: messages.length,
        totalSessions: sessions.length,
        currentSessionMessages: messages.length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalMessages: 0,
        totalSessions: 0,
        currentSessionMessages: 0
      };
    }
  }

  /**
   * Export all chat data (for backup purposes)
   */
  static async exportAllData(): Promise<{
    currentMessages: ChatMessage[];
    sessions: ChatSession[];
    currentSessionId: string | null;
  }> {
    try {
      const [currentMessages, sessions, currentSessionId] = await Promise.all([
        this.loadMessages(),
        this.loadSessions(),
        this.getCurrentSessionId()
      ]);

      return {
        currentMessages,
        sessions,
        currentSessionId
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import chat data (for restore purposes)
   */
  static async importAllData(data: {
    currentMessages: ChatMessage[];
    sessions: ChatSession[];
    currentSessionId: string | null;
  }): Promise<void> {
    try {
      await Promise.all([
        this.saveMessages(data.currentMessages),
        AsyncStorage.setItem(this.SESSIONS_KEY, JSON.stringify(data.sessions)),
        data.currentSessionId 
          ? AsyncStorage.setItem(this.CURRENT_SESSION_KEY, data.currentSessionId)
          : AsyncStorage.removeItem(this.CURRENT_SESSION_KEY)
      ]);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export default ChatStorage;
