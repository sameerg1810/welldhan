import React from 'react';
import { View, Text, ViewProps, TouchableOpacity } from 'react-native';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  variant?: 'default' | 'elevated' | 'flat' | 'accented';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  onPress,
  children,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  variant = 'default',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-slate-50 dark:bg-surface border border-slate-100 dark:border-white/5';
      case 'elevated':
        return 'bg-white dark:bg-surface border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200 dark:shadow-black';
      case 'flat':
        return 'bg-slate-50 dark:bg-primary-dark border border-slate-100 dark:border-white/5';
      case 'accented':
        return 'bg-green-500/5 dark:bg-green-500/10 border border-green-500/10 dark:border-green-500/20';
      default:
        return 'bg-slate-50 dark:bg-surface border border-slate-100 dark:border-white/5';
    }
  };

  const content = (
    <>
      {(title || subtitle) && (
        <View className="mb-4">
          {title && (
            <Text className={`text-lg font-black text-slate-900 dark:text-white tracking-tight ${titleClassName}`}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className={`text-slate-500 dark:text-slate-400 text-sm mt-1 leading-5 ${subtitleClassName}`}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className={`rounded-3xl p-5 ${getVariantClasses()} ${className}`}
        {...(props as any)}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className={`rounded-3xl p-5 ${getVariantClasses()} ${className}`} {...props}>
      {content}
    </View>
  );
};
