import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image } from 'react-native';
import EntertainmentScreen from '../screens/EntertainmentScreen';
import MainScreen from '../screens/MainScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 56,
          backgroundColor: '#0E437C',
          borderTopWidth: 0,
        },
        tabBarIcon: ({ focused }) => {
          let icon;
          if (route.name === 'Home') {
            icon = require('../assets/images/home.png');
          } else if (route.name === 'Entertainment') {
            icon = require('../assets/images/entertainment.png');
          } else if (route.name === 'Stats') {
            icon = require('../assets/images/stats.png');
          } else if (route.name === 'Profile') {
            icon = require('../assets/images/profile.png');
          }
          return <Image source={icon} style={{ width: 36, height: 36, opacity: focused ? 1 : 0.6 }} resizeMode="contain" />;
        },
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="Entertainment" component={EntertainmentScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs; 