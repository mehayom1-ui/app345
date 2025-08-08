import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth } from '../services/firebase';

const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      timeout = setTimeout(() => {
        setShowContent(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            if (user) {
              navigation.replace('Main');
            } else {
              navigation.replace('Auth');
            }
          }, 800); // Wait a bit after fade-in
        });
      }, 1300); // Wait before showing content (total ~2.5s)
    });
    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <BackgroundImage style={styles.container}>
      <View style={styles.centeredContent}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        {showContent && (
          <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>מהיום</Animated.Text>
        )}
        <ActivityIndicator size="large" color="#888" style={styles.loader} />
      </View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    alignSelf: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginTop: 10,
  },
});

export default SplashScreen; 