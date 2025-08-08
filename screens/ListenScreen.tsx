import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import type { RootStackParamList } from '../navigation/RootNavigator';

export default function ListenScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [audios, setAudios] = useState<{ title: string; link: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await import('./listen.json');
        setAudios(data.default || data);
      } catch (e) {
        setAudios([]);
      }
    })();
  }, []);

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {/* X button top left */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/images/X.png')} style={styles.closeIcon} />
        </TouchableOpacity>
        {/* Top 3 buttons (listen, watch, read) in a single row */}
        <View style={styles.topThreeButtonsRow}>
          <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.replace('Listen')}>
            <Image source={require('../assets/images/listen.png')} style={styles.topIconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.replace('Watch')}>
            <Image source={require('../assets/images/watch.png')} style={styles.topIconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.replace('Maamarim')}>
            <Image source={require('../assets/images/read.png')} style={styles.topIconImage} />
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>האזן והעמק</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {audios.length === 0 ? (
            <Text style={styles.placeholder}>לא נמצאו קבצי שמע.</Text>
          ) : (
            audios.map((item, idx) => (
              <View key={idx} style={styles.topicBox}>
                <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                  <Text style={styles.topicTitle}>{item.title}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 24,
    left: 12,
    zIndex: 10,
    padding: 0,
    backgroundColor: 'transparent',
  },
  closeIcon: {
    width: 56,
    height: 56,
  },
  topThreeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 0,
    paddingHorizontal: 10,
    marginTop: 60,
  },
  topIconButton: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topIconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  topicBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E48BFF',
    marginBottom: 8,
    textAlign: 'right',
    // No underline
  },
  placeholder: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 32,
  },
}); 