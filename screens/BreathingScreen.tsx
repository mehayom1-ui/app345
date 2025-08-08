import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';

const phases = ['לשאוף חזק חזק', 'להחזיק את הנשימה', 'לנשוף, לאט לאט'];
const phaseDuration = 5000; // 5 seconds

export default function BreathingScreen() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;
        return 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phaseIndex]);

  useEffect(() => {
    if (countdown === 1) {
      const timeout = setTimeout(() => {
        setPhaseIndex((prev) => (prev + 1) % phases.length);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [countdown]);

  useEffect(() => {
    // Animate scale for inhale/exhale, hold stays steady
    let toValue = 1;
    if (phaseIndex === 0) toValue = 1.10; // Inhale - expand (lower)
    else if (phaseIndex === 2) toValue = 0.92; // Exhale - contract (lower)
    else toValue = 1; // Hold - steady
    Animated.timing(scaleAnim, {
      toValue,
      duration: phaseDuration - 2000, // faster
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [phaseIndex]);

  return (
    <BackgroundImage>
      <View style={styles.container}>
        <TouchableOpacity style={styles.exitButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/images/X.png')} style={styles.exitIcon} />
        </TouchableOpacity>
        <Animated.Image
          source={require('../assets/images/breathing.png')}
          style={[styles.breathingImage, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
        <Text style={styles.phaseText}>{phases[phaseIndex]}</Text>
        <Text style={styles.countdownText}>{countdown}</Text>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  phaseText: { fontSize: 48, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  countdownText: { fontSize: 32, color: '#fff', marginTop: 16 },
  exitButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  exitIcon: {
    width: 96,
    height: 96,
  },
  breathingImage: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
}); 