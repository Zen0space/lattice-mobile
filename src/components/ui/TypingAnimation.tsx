import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface TypingAnimationProps {
  isVisible: boolean;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ isVisible }) => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    if (isVisible) {
      // Start the typing animation with staggered delays
      dot1Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1, // infinite repeat
        false
      );

      dot2Opacity.value = withDelay(
        200,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          false
        )
      );

      dot3Opacity.value = withDelay(
        400,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          false
        )
      );
    } else {
      // Reset to initial state
      dot1Opacity.value = withTiming(0.3, { duration: 200 });
      dot2Opacity.value = withTiming(0.3, { duration: 200 });
      dot3Opacity.value = withTiming(0.3, { duration: 200 });
    }
  }, [isVisible]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View className="mb-4 items-start">
      <View className="flex-row items-end" style={{ maxWidth: '85%' }}>
        {/* AI Avatar */}
        <View className="w-8 h-8 rounded-full items-center justify-center mb-1 mx-2"
              style={{ 
                backgroundColor: '#10a37f',
                flexShrink: 0
              }}>
          <View className="text-white text-xs font-semibold">
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
        </View>
        
        {/* Typing Bubble */}
        <View 
          className="rounded-2xl rounded-bl-md px-4 py-3"
          style={{
            backgroundColor: '#f3f4f6',
            flex: 1,
            maxWidth: '100%'
          }}
        >
          <View className="flex-row items-center justify-center py-1">
            <Animated.View 
              className="w-2 h-2 rounded-full bg-gray-400 mx-1"
              style={dot1Style}
            />
            <Animated.View 
              className="w-2 h-2 rounded-full bg-gray-400 mx-1"
              style={dot2Style}
            />
            <Animated.View 
              className="w-2 h-2 rounded-full bg-gray-400 mx-1"
              style={dot3Style}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TypingAnimation;
