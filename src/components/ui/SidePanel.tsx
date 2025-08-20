import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, Plus, User, Edit3, Trash2, ExternalLink } from 'react-native-feather';
import ChatStorage, { ChatSession } from '../../utils/ChatStorage';

interface SidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  translateX: Animated.Value | Animated.AnimatedAddition<number> | Animated.AnimatedInterpolation<number>;
  onNavigateToDashboard?: () => void;
  onNewChat?: () => void;
  onLoadChatSession?: (sessionId: string) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  preview: string;
  messageCount: number;
  lastUpdated: Date;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isVisible,
  onClose,
  translateX,
  onNavigateToDashboard,
  onNewChat,
  onLoadChatSession,
  refreshTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Modal and editing state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Dropdown state
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [dropdownChat, setDropdownChat] = useState<ChatHistoryItem | null>(null);
  
  const insets = useSafeAreaInsets();

  // Load chat sessions from storage
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const sessions = await ChatStorage.loadSessions();
        
        // Convert ChatSessions to ChatHistoryItems
        const historyItems: ChatHistoryItem[] = sessions.map((session: ChatSession) => {
          const firstMessage = session.messages.find(msg => msg.isUser);
          const preview = firstMessage ? firstMessage.text.substring(0, 50) + '...' : 'No messages';
          const title = generateChatTitle(firstMessage?.text || 'Untitled Chat');
          
          return {
            id: session.id,
            title,
            date: formatRelativeDate(session.lastUpdated),
            preview,
            messageCount: session.messages.length,
            lastUpdated: session.lastUpdated
          };
        });
        
        // Sort by last updated (most recent first)
        historyItems.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
        
        setChatHistory(historyItems);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    // Load chat history when component becomes visible or when refresh is triggered
    if (isVisible) {
      loadChatHistory();
    }
  }, [isVisible, refreshTrigger]);

  // Helper function to generate chat title from first message
  const generateChatTitle = (firstMessage: string): string => {
    if (!firstMessage || firstMessage.trim().length === 0) {
      return 'Untitled Chat';
    }
    
    // Extract meaningful title from first message
    const cleanMessage = firstMessage.trim();
    if (cleanMessage.length <= 30) {
      return cleanMessage;
    }
    
    // Try to find a good breaking point
    const words = cleanMessage.split(' ');
    let title = '';
    for (const word of words) {
      if ((title + word).length > 30) break;
      title += (title ? ' ' : '') + word;
    }
    
    return title || cleanMessage.substring(0, 30) + '...';
  };

  // Helper function to format relative date
  const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleChatPress = (chatId: string) => {
    console.log('Loading chat session:', chatId);
    onLoadChatSession?.(chatId);
    onClose();
  };

  const handleNewChat = () => {
    console.log('New chat pressed');
    onNewChat?.();
  };

  const handleEditPress = (chat: ChatHistoryItem) => {
    setSelectedChat(chat);
    setEditedTitle(chat.title);
    setModalVisible(true);
  };

  const handleLongPress = (chat: ChatHistoryItem, event: any) => {
    // Get touch position for dropdown positioning
    const { pageX, pageY } = event.nativeEvent;
    
    // Position dropdown using screen coordinates (Modal uses full screen)
    const x = Math.max(10, Math.min(pageX - 50, 250)); // Center around touch, keep in bounds
    const y = Math.max(50, pageY + 10); // Position below touch point with margin
    
    setDropdownPosition({ x, y });
    setDropdownChat(chat);
    setDropdownVisible(true);
  };

  const handleSaveEdit = () => {
    if (selectedChat && editedTitle.trim()) {
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, title: editedTitle.trim() }
            : chat
        )
      );
      setModalVisible(false);
      setSelectedChat(null);
      setEditedTitle('');
    }
  };

  const handleDeleteChat = () => {
    if (selectedChat) {
      Alert.alert(
        'Delete Chat',
        'Are you sure you want to delete this conversation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await ChatStorage.deleteSession(selectedChat.id);
                setChatHistory(prev => 
                  prev.filter(chat => chat.id !== selectedChat.id)
                );
                setModalVisible(false);
                setSelectedChat(null);
                setEditedTitle('');
              } catch (error) {
                console.error('Failed to delete chat session:', error);
                Alert.alert('Error', 'Failed to delete the conversation. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChat(null);
    setEditedTitle('');
  };

  // Dropdown handlers
  const closeDropdown = () => {
    setDropdownVisible(false);
    setDropdownChat(null);
  };

  const handleDropdownOpen = () => {
    if (dropdownChat) {
      handleChatPress(dropdownChat.id);
      closeDropdown();
    }
  };

  const handleDropdownEdit = () => {
    if (dropdownChat) {
      setSelectedChat(dropdownChat);
      setEditedTitle(dropdownChat.title);
      setModalVisible(true);
      closeDropdown();
    }
  };

  const handleDropdownDelete = () => {
    if (dropdownChat) {
      Alert.alert(
        'Delete Chat',
        'Are you sure you want to delete this conversation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await ChatStorage.deleteSession(dropdownChat.id);
                setChatHistory(prev => 
                  prev.filter(chat => chat.id !== dropdownChat.id)
                );
                closeDropdown();
              } catch (error) {
                console.error('Failed to delete chat session:', error);
                Alert.alert('Error', 'Failed to delete the conversation. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        className="absolute inset-0 bg-black/50 z-40"
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Side Panel */}
      <Animated.View
        className="absolute left-0 top-0 bottom-0 w-80 bg-white z-50 border-r border-gray-200"
        style={{
          transform: [{ translateX }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Header - Search Section */}
        <View className="px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              className="mr-3 p-2 rounded-lg bg-gray-100"
              onPress={onClose}
            >
              <X width={18} height={18} stroke="#6B7280" />
            </TouchableOpacity>
            <Text className="text-gray-900 text-lg font-semibold">Lattice</Text>
          </View>
          
          {/* Search Input */}
          <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Search width={16} height={16} stroke="#9CA3AF" />
            <TextInput
              className="flex-1 text-gray-900 text-base ml-2"
              placeholder="Search conversations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Main Content - Chat History */}
        <ScrollView className="flex-1 px-4 py-2">
          {/* New Chat Button */}
          <TouchableOpacity
            className="flex-row items-center py-3 px-3 mb-2 rounded-lg bg-primary/10 border border-primary/20"
            onPress={handleNewChat}
          >
            <Plus width={18} height={18} stroke="#10a37f" />
            <Text className="text-primary font-medium ml-3">New Chat</Text>
          </TouchableOpacity>

          {/* Chat History List */}
          <View className="mt-4">
            <Text className="text-gray-600 text-sm font-medium mb-3 px-1">Recent Conversations</Text>

            {isLoadingHistory ? (
              // Loading State
              <View className="py-8 px-3">
                <Text className="text-gray-400 text-sm text-center">Loading conversations...</Text>
              </View>
            ) : chatHistory.length === 0 ? (
              // Empty State
              <View className="py-8 px-3">
                <Text className="text-gray-400 text-sm text-center">No conversations yet</Text>
                <Text className="text-gray-300 text-xs text-center mt-1">Start a new chat to begin</Text>
              </View>
            ) : (
              // Chat History
              chatHistory
                .filter(chat => 
                  searchQuery === '' || 
                  chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((chat) => (
                <View key={chat.id} className="mb-2">
                  <TouchableOpacity
                    className="py-3 px-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100"
                    onPress={() => handleChatPress(chat.id)}
                    onLongPress={(event) => handleLongPress(chat, event)}
                    delayLongPress={500}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-gray-900 font-medium flex-1 mr-2" numberOfLines={1}>
                        {chat.title}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 text-xs mr-2">{chat.date}</Text>
                        <TouchableOpacity
                          className="p-1 rounded hover:bg-gray-200 z-10"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEditPress(chat);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Edit3 width={14} height={14} stroke="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                      {chat.preview}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Footer - Dashboard Section */}
        <View className="px-4 py-4 border-t border-gray-200">
          <TouchableOpacity 
            className="flex-row items-center py-3 px-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100"
            onPress={() => {
              onNavigateToDashboard?.();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
              <User width={16} height={16} stroke="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Dashboard</Text>
              <Text className="text-gray-600 text-sm">Manage your account</Text>
            </View>
            <Text className="text-gray-400">→</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Dropdown Menu Modal - Using Modal for proper layering */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={closeDropdown}
        >
                     <View
             className="absolute bg-white rounded-lg border border-gray-200 shadow-lg min-w-40"
             style={{
               left: dropdownPosition.x,
               top: dropdownPosition.y,
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 4 },
               shadowOpacity: 0.15,
               shadowRadius: 12,
               elevation: 8,
             }}
           >
            {/* Open Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 hover:bg-gray-50"
              onPress={handleDropdownOpen}
            >
              <ExternalLink width={16} height={16} stroke="#6B7280" />
              <Text className="text-gray-700 font-medium ml-3">Open</Text>
            </TouchableOpacity>

            {/* Edit Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 hover:bg-gray-50 border-t border-gray-100"
              onPress={handleDropdownEdit}
            >
              <Edit3 width={16} height={16} stroke="#6B7280" />
              <Text className="text-gray-700 font-medium ml-3">Edit</Text>
            </TouchableOpacity>

            {/* Delete Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 hover:bg-red-50 border-t border-gray-100"
              onPress={handleDropdownDelete}
            >
              <Trash2 width={16} height={16} stroke="#DC2626" />
              <Text className="text-red-600 font-medium ml-3">Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit/Delete Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl mx-4 w-80 max-w-full">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-900">Edit Conversation</Text>
                <TouchableOpacity
                  onPress={closeModal}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X width={20} height={20} stroke="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Content */}
            <View className="px-6 py-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
              <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-base"
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Enter conversation title..."
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
                selectTextOnFocus={true}
              />
            </View>

            {/* Modal Actions */}
            <View className="px-6 py-4 border-t border-gray-200">
              <View className="flex-row justify-between">
                {/* Delete Button */}
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2 rounded-lg bg-red-50 border border-red-200"
                  onPress={handleDeleteChat}
                >
                  <Trash2 width={16} height={16} stroke="#DC2626" />
                  <Text className="text-red-600 font-medium ml-2">Delete</Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                    onPress={closeModal}
                  >
                    <Text className="text-gray-700 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 rounded-lg bg-primary border border-primary"
                    onPress={handleSaveEdit}
                    disabled={!editedTitle.trim()}
                  >
                    <Text className="text-white font-medium">Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SidePanel;
