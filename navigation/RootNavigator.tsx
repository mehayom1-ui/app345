import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BreathingScreen from '../screens/BreathingScreen';
import FAQScreen from '../screens/FAQScreen';
import ListenScreen from '../screens/ListenScreen';
import MaamarimScreen from '../screens/MaamarimScreen';
import MusicPlayerScreen from '../screens/MusicPlayerScreen';
import MyPromiseScreen from '../screens/MyPromiseScreen';
import ResetScreen from '../screens/ResetScreen';
import SplashScreen from '../screens/SplashScreen';
import WatchScreen from '../screens/WatchScreen';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Breathing: undefined;
  Reset: undefined;
  FAQ: undefined;
  MyPromise: undefined;
  MusicPlayer: { soundKey: string; label: string };
  Maamarim: undefined;
  Watch: undefined;
  Listen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="Reset" component={ResetScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="MyPromise" component={MyPromiseScreen} />
      <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
      <Stack.Screen name="Maamarim" component={MaamarimScreen} />
      <Stack.Screen name="Watch" component={WatchScreen} />
      <Stack.Screen name="Listen" component={ListenScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 