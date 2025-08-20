import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface ActionButtonProps {
  title: string;
  icon: React.ComponentType<{ width: number; height: number; stroke: string }>;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  color?: string;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon: IconComponent,
  onPress,
  variant = 'primary',
  color,
  className = '',
}) => {
  const isPrimary = variant === 'primary';
  const buttonColor = color || (isPrimary ? '#10a37f' : '#f9fafb');
  const textColor = isPrimary ? 'text-white' : 'text-gray-700';
  const borderClass = isPrimary ? '' : 'border border-gray-200';

  return (
    <TouchableOpacity
      className={`flex-1 rounded-xl p-4 items-center ${borderClass} ${className}`}
      style={{ backgroundColor: buttonColor }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconComponent width={24} height={24} stroke={isPrimary ? '#ffffff' : '#6B7280'} />
      <Text className={`font-semibold mt-2 ${textColor}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
