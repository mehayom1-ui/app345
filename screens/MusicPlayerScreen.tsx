import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';

export default function MusicPlayerScreen() {
  const navigation = useNavigation();
  // const route = useRoute();
  // const soundMap: { [key: string]: any } = {
  //   campfire: require('../assets/sounds/campfire.mp3'),
  //   whiteNoise: require('../assets/sounds/whiteNoise.mp3'),
  //   rain: require('../assets/sounds/rain.mp3'),
  //   waves: require('../assets/sounds/waves.mp3'),
  // };
  // const { soundKey, label } = route.params as { soundKey: string; label: string };
  // const sound = soundMap[soundKey];
  // const soundRef = useRef<Audio.Sound | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {/* X button top left */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/images/X.png')} style={styles.closeIcon} />
        </TouchableOpacity>
        {/* Header */}
        <Text style={styles.header}>השמעת צלילים מקומיים אינה זמינה יותר</Text>
        <Text style={{ color: '#fff', fontSize: 18, marginTop: 24, textAlign: 'center' }}>
          כל הצלילים זמינים להאזנה ישירה ביוטיוב או בספריית ההרפיה.
        </Text>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 24,
    left: 16,
    zIndex: 10,
  },
  closeIcon: {
    width: 48,
    height: 48,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
  },
}); 