
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';

const getIconName = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case '(home)':
      return focused ? 'home' : 'home-outline';
    case 'all_etudes':
      return focused ? 'albums' : 'albums-outline';
    case 'documents':
      return focused ? 'document-text' : 'document-text-outline';
    case 'kpi':
      return focused ? 'stats-chart' : 'stats-chart-outline';
    case 'profile':
      return focused ? 'person-circle' : 'person-circle-outline';
    default:
      return 'ellipse';
  }
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8C8C8C',
        tabBarLabelStyle: { fontSize: 12, paddingBottom: Platform.OS === 'ios' ? 0 : 4 },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: '#FFFFFF',
          shadowColor: 'rgba(0,0,0,0.12)',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 12,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={getIconName(route.name, focused)} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Accueil',
        }}
      />
      <Tabs.Screen
        name="all_etudes"
        options={{
          title: 'Études',
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
        }}
      />
      <Tabs.Screen
        name="kpi"
        options={{
          title: 'KPI',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}
