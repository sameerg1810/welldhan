import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  testID,
  accessibilityLabel,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-accent shadow-accent/30';
      case 'secondary':
        return 'bg-slate-100 dark:bg-surface border border-slate-200 dark:border-white/10';
      case 'outline':
        return 'bg-transparent border border-accent';
      case 'danger':
        return 'bg-red-500/10 border border-red-500/20';
      default:
        return 'bg-accent';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary-dark font-extrabold';
      case 'secondary':
        return 'text-slate-600 dark:text-slate-400 font-bold';
      case 'outline':
        return 'text-accent font-bold';
      case 'danger':
        return 'text-red-500 font-bold';
      default:
        return 'text-primary-dark font-extrabold';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-4 rounded-xl';
      case 'md':
        return 'py-3.5 px-6 rounded-2xl';
      case 'lg':
        return 'py-4 px-8 rounded-2xl';
      default:
        return 'py-3.5 px-6 rounded-2xl';
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center gap-2.5 ${getVariantClasses()} ${getSizeClasses()} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0d1b13' : '#4ade80'} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={variant === 'primary' ? '#0d1b13' : '#4ade80'} />}
          <Text className={`${getTextClasses()} ${size === 'sm' ? 'text-[13px]' : 'text-[15px]'}`}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
