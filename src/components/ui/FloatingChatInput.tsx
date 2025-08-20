import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  bottomSpacing?: number;
  onLayoutChange?: (layout: {
    height: number;
    keyboardHeight: number;
    totalHeight: number;
  }) => void;
}

const FloatingChatInput: React.FC<FloatingChatInputProps> = ({
  onSendMessage,
  placeholder = 'Type your message...',
  bottomSpacing = 20,
  onLayoutChange,
}) => {
  const [message, setMessage] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Check initial keyboard state using official API
    setIsKeyboardVisible(Keyboard.isVisible());
    const metrics = Keyboard.metrics();
    if (metrics) {
      setKeyboardHeight(metrics.height);
    }

    // Official React Native Keyboard API event listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', event => {
      if (__DEV__) {
        console.log('Keyboard shown - Height:', event.endCoordinates.height);
      }
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (__DEV__) {
        console.log('Keyboard hidden - Returning to original position');
      }
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim().length > 0) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const isValidMessage = message.trim().length > 0;

  // Calculate position based on keyboard state using official API data and safe area insets
  const getInputPosition = () => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      // Position above keyboard with small margin
      return keyboardHeight + 40;
    }
    // Return to original position when keyboard is hidden, accounting for bottom safe area
    return bottomSpacing + insets.bottom + 10;
  };

  // Calculate and report layout dimensions to parent
  const reportLayoutChange = () => {
    const inputHeight = 48; // Base input height (min-h-12 = 48px)
    const currentPosition = getInputPosition();
    const totalHeight = inputHeight + currentPosition;

    if (onLayoutChange) {
      onLayoutChange({
        height: inputHeight,
        keyboardHeight: keyboardHeight,
        totalHeight: totalHeight,
      });
    }
  };

  // Report layout changes when keyboard state or dimensions change
  useEffect(() => {
    reportLayoutChange();
  }, [keyboardHeight, isKeyboardVisible, bottomSpacing, insets.bottom]);

  return (
    <View
      className="absolute left-4 right-4 bg-gray-50 rounded-3xl border border-gray-300 flex-row items-center px-4 py-3 min-h-12"
      style={{ bottom: getInputPosition() }}
    >
      <TextInput
        className="flex-1 text-base text-gray-800 pr-10 py-0"
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={true}
        maxLength={1000}
        textAlignVertical="center"
        returnKeyType="default"
        blurOnSubmit={false}
      />
      <TouchableOpacity
        className="absolute right-2 w-8 h-8 rounded-full items-center justify-center shadow-md"
        style={{
          backgroundColor: isValidMessage ? '#10a37f' : '#f3f4f6',
        }}
        onPress={handleSend}
        disabled={!isValidMessage}
      >
        <Text
          className={`text-base font-semibold ${isValidMessage ? 'text-white' : 'text-gray-400'}`}
        >
          ↑
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingChatInput;
