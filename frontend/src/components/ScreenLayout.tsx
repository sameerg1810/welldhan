import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps extends ViewProps {
  title?: string;
  subtitle?: string;
  className?: string;
  headerContent?: React.ReactNode;
  useSafeArea?: boolean;
}

export const ScreenLayout: React.FC<LayoutProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerContent,
  useSafeArea = true,
  ...props
}) => {
  const Content = (
    <View className={`flex-1 bg-white dark:bg-primary-dark ${className}`} {...props}>
      {(title || subtitle || headerContent) && (
        <View className="px-5 pt-4 pb-2 flex-row justify-between items-start">
          <View className="flex-1">
            {title && (
              <Text className="text-2xl font-black text-slate-900 dark:text-white" testID="screen-title">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-[13px] text-accent font-bold mt-1">
                {subtitle}
              </Text>
            )}
          </View>
          {headerContent && (
            <View className="ml-4">
              {headerContent}
            </View>
          )}
        </View>
      )}
      {children}
    </View>
  );

  if (useSafeArea) {
    return (
      <SafeAreaView className="flex-1" edges={['top']}>
        {Content}
      </SafeAreaView>
    );
  }

  return Content;
};
