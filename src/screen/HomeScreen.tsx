import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Menu } from 'react-native-feather';
import { FloatingChatInput, SidePanel, ChatBubble, TypingAnimation } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ChatStorage, { ChatMessage as StoredChatMessage } from '../stores/storage/chatStorage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width: screenWidth } = Dimensions.get('window');

// Use the ChatMessage interface from ChatStorage
type ChatMessage = StoredChatMessage;

// Import enhanced financial responses
import financialResponsesData from '../../financial-responses.json';
const FINANCIAL_RESPONSES = financialResponsesData.financialResponses;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isSidePanelVisible, setIsSidePanelVisible] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [inputLayout, setInputLayout] = React.useState({
    height: 48,
    keyboardHeight: 0,
    totalHeight: 68,
  });
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(true);
  const [chatHistoryRefreshTrigger, setChatHistoryRefreshTrigger] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(-320)).current;
  const gestureTranslateX = React.useRef(new Animated.Value(0)).current;

  const combinedTranslateX = React.useRef(Animated.add(translateX, gestureTranslateX)).current;

  const constrainedTranslateX = React.useRef(
    combinedTranslateX.interpolate({
      inputRange: [-400, -320, 0, 80],
      outputRange: [-340, -320, 0, 20],
      extrapolate: 'clamp',
    })
  ).current;

  // Load messages from storage on component mount
  React.useEffect(() => {
    const loadStoredMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const storedMessages = await ChatStorage.loadMessages();
        setMessages(storedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadStoredMessages();
  }, []);

  const addMessage = async (
    text: string,
    isUser: boolean,
    isFinancialAdvice: boolean = false,
    chartConfig?: any,
    financialData?: any
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      isFinancialAdvice,
      chartConfig,
      financialData,
    };

    // Update local state immediately for UI responsiveness
    setMessages(prev => {
      const newMessages = [...prev, newMessage];
      // If this is the first user message, trigger chat history refresh
      if (isUser && prev.length === 0) {
        setTimeout(() => setChatHistoryRefreshTrigger(prev => prev + 1), 100);
      }
      return newMessages;
    });

    // Save to storage asynchronously
    try {
      await ChatStorage.addMessage(newMessage);
    } catch (error) {
      console.error('Failed to save message to storage:', error);
      // Could show a toast notification here
    }
  };

  // Keyword detection function
  const detectKeywords = (
    message: string
  ): keyof typeof FINANCIAL_RESPONSES | 'both_crypto' | null => {
    const lowerMessage = message.toLowerCase();

    // Check for combined crypto request (both BTC and ETH)
    if (
      /\b(bitcoin|btc).*\band\b.*\b(ethereum|eth)\b/i.test(lowerMessage) ||
      /\b(ethereum|eth).*\band\b.*\b(bitcoin|btc)\b/i.test(lowerMessage) ||
      /\b(btc|bitcoin)\b.*\b(eth|ethereum)\b/i.test(lowerMessage) ||
      /\bcrypto.*\b(chart|price|prices)\b/i.test(lowerMessage)
    ) {
      return 'both_crypto';
    }

    // Define keyword patterns for each response type
    const keywordPatterns = {
      tesla: [
        /\b(tesla|tsla)\b.*\b(chart|price|stock|show|give)\b/i,
        /\b(show|give|display).*\b(tesla|tsla)\b/i,
        /\btsla\b/i,
        /\btesla.*\b(chart|price|stock)\b/i,
      ],
      apple: [
        /\b(apple|aapl)\b.*\b(chart|price|stock|show|give)\b/i,
        /\b(show|give|display).*\b(apple|aapl)\b/i,
        /\baapl\b/i,
        /\bapple.*\b(chart|price|stock)\b/i,
      ],
      nvidia: [
        /\b(nvidia|nvda)\b.*\b(chart|price|stock|show|give)\b/i,
        /\b(show|give|display).*\b(nvidia|nvda)\b/i,
        /\bnvda\b/i,
        /\bnvidia.*\b(chart|price|stock)\b/i,
      ],
      bitcoin: [
        /\b(bitcoin|btc)\b.*\b(chart|price|show|give)\b/i,
        /\b(show|give|display).*\b(bitcoin|btc)\b/i,
        /\bbtc\b/i,
        /\bbitcoin.*\b(chart|price)\b/i,
      ],
      ethereum: [
        /\b(ethereum|eth)\b.*\b(chart|price|show|give)\b/i,
        /\b(show|give|display).*\b(ethereum|eth)\b/i,
        /\beth\b/i,
        /\bethereum.*\b(chart|price)\b/i,
      ],
    };

    // Check each pattern
    for (const [responseKey, patterns] of Object.entries(keywordPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          return responseKey as keyof typeof FINANCIAL_RESPONSES;
        }
      }
    }

    return null;
  };

  const handleSendMessage = async (message: string) => {
    await addMessage(message, true);

    // Show typing animation
    setIsTyping(true);

    // Check for keyword matches
    const detectedKeyword = detectKeywords(message);

    if (detectedKeyword) {
      // Handle detected keyword with chart response
      setTimeout(async () => {
        setIsTyping(false);

        if (detectedKeyword === 'both_crypto') {
          // Handle combined crypto request (both BTC and ETH)
          const btcData = FINANCIAL_RESPONSES['bitcoin'];
          const ethData = FINANCIAL_RESPONSES['ethereum'];

          // Add a summary message first
          await addMessage(
            `BTC $${btcData.currentPrice?.toLocaleString()} (${btcData.changePercent > 0 ? '+' : ''}${btcData.changePercent}%) • ETH $${ethData.currentPrice?.toLocaleString()} (${ethData.changePercent > 0 ? '+' : ''}${ethData.changePercent}%)`,
            false,
            true,
            null,
            null
          );

          // Add BTC chart
          setTimeout(async () => {
            setIsTyping(true);
            setTimeout(async () => {
              setIsTyping(false);
              await addMessage(btcData.fullResponse, false, true, btcData.chartConfig, btcData);
            }, 1000);
          }, 2000);

          // Add ETH chart
          setTimeout(async () => {
            setIsTyping(true);
            setTimeout(async () => {
              setIsTyping(false);
              await addMessage(ethData.fullResponse, false, true, ethData.chartConfig, ethData);
            }, 1000);
          }, 4000);
        } else {
          // Handle individual responses (tesla, apple, nvidia, bitcoin, ethereum)
          const responseData =
            FINANCIAL_RESPONSES[detectedKeyword as keyof typeof FINANCIAL_RESPONSES];
          let chartConfig = null;
          let financialData = responseData;

          if (
            detectedKeyword === 'tesla' ||
            detectedKeyword === 'apple' ||
            detectedKeyword === 'nvidia' ||
            detectedKeyword === 'bitcoin' ||
            detectedKeyword === 'ethereum'
          ) {
            chartConfig = responseData.chartConfig;
          }

          await addMessage(responseData.fullResponse, false, true, chartConfig, financialData);
        }
      }, 2000);
    } else {
      // Default response for unrecognized messages
      setTimeout(async () => {
        setIsTyping(false);
        await addMessage(
          "I can help you with financial charts and analysis! Try asking for:\n• Bitcoin or Ethereum charts\n• Tesla, Apple, or NVIDIA stock charts\n• Just say something like 'show me bitcoin chart' or 'tesla price'",
          false,
          true
        );
      }, 2000);
    }
  };

  const handleStarterPress = async (
    prompt: string,
    responseKey: keyof typeof FINANCIAL_RESPONSES
  ) => {
    // Add user message
    await addMessage(prompt, true);

    // Show typing animation
    setIsTyping(true);

    // Add AI response after typing delay with enhanced data
    setTimeout(async () => {
      setIsTyping(false);
      const responseData = FINANCIAL_RESPONSES[responseKey];

      // Handle all responses as individual charts now
      let chartConfig = null;
      let financialData = responseData;

      if (
        responseKey === 'tesla' ||
        responseKey === 'apple' ||
        responseKey === 'nvidia' ||
        responseKey === 'bitcoin' ||
        responseKey === 'ethereum'
      ) {
        chartConfig = responseData.chartConfig;
      }

      await addMessage(responseData.fullResponse, false, true, chartConfig, financialData);
    }, 2500);
  };

  const handleInputLayoutChange = (layout: {
    height: number;
    keyboardHeight: number;
    totalHeight: number;
  }) => {
    setInputLayout(layout);
  };

  const handleNewChat = async () => {
    try {
      // Create a new session (this will save current messages if any exist)
      await ChatStorage.createNewSession();

      // Clear current messages from UI
      setMessages([]);

      // Trigger chat history refresh
      setChatHistoryRefreshTrigger(prev => prev + 1);

      // Close side panel
      closeSidePanel();
    } catch (error) {
      console.error('Failed to create new chat session:', error);
      // Could show error toast here
    }
  };

  const handleLoadChatSession = async (sessionId: string) => {
    try {
      // Save current messages as a session if there are any
      if (messages.length > 0) {
        await ChatStorage.createNewSession();
      }

      // Load the selected session
      const session = await ChatStorage.loadSession(sessionId);
      if (session) {
        setMessages(session.messages);
        if (__DEV__) {
          console.log(`Loaded session with ${session.messages.length} messages`);
        }
      } else {
        console.error('Session not found:', sessionId);
        Alert.alert('Error', 'The selected conversation could not be found.');
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
      Alert.alert('Error', 'Failed to load the conversation. Please try again.');
    }
  };

  const handleMenuPress = () => {
    if (__DEV__) {
      console.log('Hamburger menu pressed');
    }
    openSidePanel();
  };

  const openSidePanel = () => {
    setIsSidePanelVisible(true);
    gestureTranslateX.setValue(0);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 225,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeSidePanel = () => {
    gestureTranslateX.setValue(0);
    Animated.timing(translateX, {
      toValue: -320,
      duration: 195,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSidePanelVisible(false);
    });
  };

  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: gestureTranslateX } }], {
    useNativeDriver: true,
  });

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      const currentBaseX = (translateX as any)._value;
      const finalPosition = currentBaseX + translationX;

      gestureTranslateX.setValue(0);

      const shouldOpen = finalPosition > -160 || velocityX > 500;
      const shouldClose = finalPosition < -160 || velocityX < -500;

      if (shouldOpen && !isSidePanelVisible) {
        setIsSidePanelVisible(true);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 225,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else if (shouldClose && isSidePanelVisible) {
        Animated.timing(translateX, {
          toValue: -320,
          duration: 195,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setIsSidePanelVisible(false);
        });
      } else if (isSidePanelVisible) {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateX, {
          toValue: -320,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // Import conversation starters from the JSON
  const conversationStarters = financialResponsesData.conversationStarters.map(starter => ({
    text: starter.text,
    key: starter.responseKey as keyof typeof FINANCIAL_RESPONSES,
  }));

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          minPointers={1}
          maxPointers={1}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-10, 10]}
          shouldCancelWhenOutside={false}
          enableTrackpadTwoFingerGesture={true}
        >
          <Animated.View className="flex-1">
            <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
              <StatusBar style="dark" />

              {/* Header */}
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
                <TouchableOpacity
                  className="p-2 rounded-lg hover:bg-gray-50"
                  onPress={handleMenuPress}
                  activeOpacity={0.7}
                >
                  <Menu width={20} height={20} stroke="#1a1a1a" />
                </TouchableOpacity>

                <Text className="text-xl font-semibold text-secondary text-center flex-1">
                  Lattice
                </Text>

                {/* Removed dashboard button - keeping space for balanced layout */}
                <View className="p-2" style={{ width: 36, height: 36 }} />
              </View>

              {/* Messages Container - Scrollable */}
              <ScrollView
                className="flex-1"
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: 20,
                  paddingBottom: inputLayout.totalHeight + 20, // Add space for floating input + extra margin
                }}
                showsVerticalScrollIndicator={false}
              >
                {isLoadingMessages ? (
                  // Loading Screen
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-lg text-gray-500 mb-2">
                      Loading your conversations...
                    </Text>
                    <Text className="text-sm text-gray-400">Please wait</Text>
                  </View>
                ) : messages.length === 0 ? (
                  // Welcome Screen
                  <View className="flex-1 justify-center">
                    <Text className="text-3xl font-semibold text-secondary text-center mb-3">
                      Your Financial Advisor
                    </Text>
                    <Text className="text-base text-gray-500 text-center leading-6 mb-10 px-2.5">
                      I'm Lattice AI, your intelligent financial assistant. I can help with
                      investment analysis, portfolio advice, market predictions, and more.
                    </Text>

                    <View className="gap-3">
                      {conversationStarters.map((starter, index) => (
                        <TouchableOpacity
                          key={index}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm"
                          onPress={() => handleStarterPress(starter.text, starter.key)}
                          activeOpacity={0.7}
                        >
                          <Text className="text-base text-gray-700 font-medium">
                            {starter.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  // Chat Messages
                  <View className="pt-4">
                    {messages.map(message => (
                      <ChatBubble
                        key={message.id}
                        message={message.text}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        isFinancialAdvice={message.isFinancialAdvice}
                        chartConfig={message.chartConfig}
                        financialData={message.financialData}
                      />
                    ))}
                    {/* Typing Animation */}
                    <TypingAnimation isVisible={isTyping} />
                  </View>
                )}
              </ScrollView>

              <FloatingChatInput
                onSendMessage={handleSendMessage}
                placeholder="Message Lattice..."
                bottomSpacing={0}
                onLayoutChange={handleInputLayoutChange}
              />
            </SafeAreaView>
          </Animated.View>
        </PanGestureHandler>

        <SidePanel
          isVisible={isSidePanelVisible}
          onClose={closeSidePanel}
          translateX={constrainedTranslateX}
          onNavigateToDashboard={() => navigation.navigate('Dashboard')}
          onNewChat={handleNewChat}
          onLoadChatSession={handleLoadChatSession}
          refreshTrigger={chatHistoryRefreshTrigger}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default HomeScreen;
