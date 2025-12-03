
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import React from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';

export interface TabBarItem {
  route: string;
  label: string;
  icon: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 32,
  borderRadius = 25,
  bottomMargin = 34,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  
  const animatedIndex = useSharedValue(0);

  const handleTabPress = (route: string) => {
    const index = tabs.findIndex(tab => pathname.includes(tab.route));
    if (index !== -1) {
      animatedIndex.value = withSpring(index);
    }
    router.push(route as any);
  };

  const currentIndex = tabs.findIndex(tab => pathname.includes(tab.route));
  if (currentIndex !== -1 && animatedIndex.value !== currentIndex) {
    animatedIndex.value = withSpring(currentIndex);
  }

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedIndex.value,
      tabs.map((_, i) => i),
      tabs.map((_, i) => (containerWidth / tabs.length) * i)
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, { bottom: bottomMargin }]} edges={['bottom']}>
      <BlurView
        style={[
          styles.tabBar,
          {
            width: containerWidth,
            borderRadius,
          },
        ]}
        intensity={80}
        tint={theme.dark ? 'dark' : 'light'}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              width: containerWidth / tabs.length,
              borderRadius: borderRadius - 4,
            },
            indicatorStyle,
          ]}
        />
        
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.route}
              style={[
                styles.tab,
                { width: containerWidth / tabs.length },
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={tab.icon as any}
                size={24}
                color={isActive ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.text,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: colors.border,
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  indicator: {
    position: 'absolute',
    height: '80%',
    backgroundColor: colors.highlight,
    top: '10%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
