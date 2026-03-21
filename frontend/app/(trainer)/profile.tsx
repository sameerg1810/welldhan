import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPORT_COLORS } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { getSportIcon } from '../../src/utils';
import { Trainer } from '../../src/types';
import { ScreenLayout, Card, Button } from '../../src/components';

export default function TrainerProfile() {
  const { userData, logout } = useAuthStore();
  const trainer = userData as Trainer;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const stars = Math.floor(trainer?.rating || 0);

  return (
    <ScreenLayout title="My Profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Trainer Card */}
        <Card className="mx-5 my-6 items-center p-8" testID="trainer-profile-card">
          {trainer?.image_url ? (
            <Image 
              source={{ uri: trainer.image_url }} 
              className="w-24 h-24 rounded-full border-4 border-accent mb-4" 
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-accent/20 items-center justify-center border-4 border-accent mb-4">
              <Text className="text-4xl font-black text-accent">{trainer?.name?.[0] || 'T'}</Text>
            </View>
          )}
          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2">{trainer?.name}</Text>
          <View 
            className="px-4 py-1.5 rounded-full mb-4" 
            style={{ backgroundColor: (SPORT_COLORS[trainer?.sport || ''] || '#4ade80') + '22' }}
          >
            <Text 
              className="text-sm font-bold" 
              style={{ color: SPORT_COLORS[trainer?.sport || ''] || '#4ade80' }}
            >
              {getSportIcon(trainer?.sport || '')} {trainer?.sport}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xl">{'⭐'.repeat(stars)}</Text>
            <Text className="text-base font-bold text-slate-500 dark:text-slate-400">{trainer?.rating} / 5.0</Text>
          </View>
        </Card>

        {/* Info Section */}
        <View className="px-5 mb-8">
          <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Professional Info</Text>
          <Card className="p-0 overflow-hidden">
            {[
              { icon: 'school-outline', label: 'Certification', value: trainer?.certification },
              { icon: 'time-outline', label: 'Experience', value: `${trainer?.experience_years} years` },
              { icon: 'call-outline', label: 'Phone', value: trainer?.phone },
              { icon: 'mail-outline', label: 'Email', value: trainer?.email },
            ].map((item, idx, arr) => (
              <View 
                key={item.label} 
                className={`flex-row items-center gap-4 p-4 ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
              >
                <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
                  <Ionicons name={item.icon as any} size={20} color="#4ade80" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{item.label}</Text>
                  <Text className="text-[15px] font-bold text-slate-900 dark:text-white mt-0.5">{item.value}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        <View className="px-5">
          <Button
            label="Sign Out"
            variant="danger"
            icon="log-out-outline"
            onPress={handleLogout}
            testID="trainer-logout-btn"
            className="bg-red-500/10 border border-red-500/20"
            labelClassName="text-red-500"
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

