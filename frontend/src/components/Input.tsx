import React from 'react';
import { View, Text, TextInput, ViewProps, TextInputProps } from 'react-native';
import { useColorScheme } from 'nativewind';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  className?: string;
  containerClassName?: string;
  isFocused?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefix,
  className = '',
  containerClassName = '',
  isFocused = false,
  ...props
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mb-2 ml-1">
          {label}
        </Text>
      )}
      <View className={`flex-row items-center bg-slate-50 dark:bg-surface rounded-2xl border transition-colors ${isFocused ? 'border-accent bg-accent/5' : 'border-slate-200 dark:border-white/10'}`}>
        {prefix && (
          <View className="px-4 py-4 bg-slate-100/50 dark:bg-white/5 border-r border-slate-200 dark:border-white/10">
            <Text className="text-slate-900 dark:text-white text-[15px] font-bold">{prefix}</Text>
          </View>
        )}
        <TextInput
          className={`flex-1 px-4 py-4 text-slate-900 dark:text-white text-[16px] ${className}`}
          placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{error}</Text>
      )}
    </View>
  );
};
