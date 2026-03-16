import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { StyleSheet } from 'react-native';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarLabelStyle: styles.tabLabel,
    }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Admin', tabBarIcon: ({ color, size }) => <Ionicons name="shield" size={size} color={color} /> }} />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#12141d', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', height: 60, paddingBottom: 8, paddingTop: 8 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
