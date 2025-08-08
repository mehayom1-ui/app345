import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import type { RootStackParamList } from '../navigation/RootNavigator';

const ContentCard = ({ image, title, summary, link }: any) => (
  <TouchableOpacity onPress={() => Linking.openURL(link)} style={styles.card}>
    <Image source={image} style={styles.cardImage} />
    <View style={{ flex: 1, paddingLeft: 10 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSummary}>{summary}</Text>
    </View>
  </TouchableOpacity>
);

const soundIcons = {
  fire: require('../assets/images/fire.png'),
  rain: require('../assets/images/rain.png'),
  waves: require('../assets/images/waves.png'),
  whitenoise: require('../assets/images/whitenoise.png'),
};

const soundLabels = {
  fire: 'אש',
  rain: 'גשם',
  waves: 'גלים',
  whitenoise: 'רעש לבן',
};

const SoundButton = ({ label, icon, onPress, alignRight }: any) => (
  <TouchableOpacity style={styles.soundButton} onPress={onPress}>
    <View style={[styles.soundButtonContent, alignRight && styles.soundButtonContentRight]}>
      <Text style={[styles.soundButtonText, alignRight && styles.soundButtonTextRight]}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Image source={icon} style={[styles.soundButtonIcon, alignRight && styles.soundButtonIconRight]} />
    </View>
  </TouchableOpacity>
);

export default function EntertainmentScreen() {
  const [sound, setSound] = useState<any>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const playSound = async (url: string) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
    setSound(newSound);
    await newSound.playAsync();
  };

  const readImages = [
    require('../assets/images/logo.png'),
    require('../assets/images/logo.png'),
  ];

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {/* Top 3 Buttons */}
        <View style={styles.topThreeButtonsRow}>
          <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.navigate('Listen')}>
            <Image source={require('../assets/images/listen.png')} style={styles.topIconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.navigate('Watch')}>
            <Image source={require('../assets/images/watch.png')} style={styles.topIconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.navigate('Maamarim')}>
            <Image source={require('../assets/images/read.png')} style={styles.topIconImage} />
          </TouchableOpacity>
        </View>

        {/* Row with 2 buttons: q@lib and breath@lib */}
        <View style={styles.rowTwoButtons}>
          <TouchableOpacity style={styles.libButton} onPress={() => navigation.getParent()?.navigate('FAQ')}>
            <Image source={require('../assets/images/questions.png')} style={styles.libButtonImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.libButton} onPress={() => navigation.getParent()?.navigate('Breathing')}>
            <Image source={require('../assets/images/breath@lib.png')} style={styles.libButtonImage} />
          </TouchableOpacity>
        </View>

        {/* Hebrew description text */}
        <Text style={styles.libraryDescription}>
          בספרייה זו נמצאים מיטב הכלים בכדי לעזור לך בתהליך הגמילה וההפסקה. אספנו פה את מיטב הכלים: פודקאסטים, סרטונים מעשירים, מאמרים עם מידע וידע אשר יעזרו לך להיגמל במהרה. אנו מאמינים כי בהתמדה ולמידה ננצח את ההתמכרות וחייך ישתפרו בכמה רמות
        </Text>

        {/* Relaxation Sounds */}
        <Text style={styles.sectionTitle}>צלילים מרגיעים</Text>
        <View style={styles.soundGrid}>
          <View style={styles.soundRow}>
            <SoundButton label={soundLabels.fire} icon={soundIcons.fire} onPress={() => Linking.openURL('https://youtu.be/6nlEmH7eZLk?si=M-MHS_HH_OJxK4kZ')} />
            <SoundButton label={soundLabels.rain} icon={soundIcons.rain} onPress={() => Linking.openURL('https://youtu.be/q76bMs-NwRk?si=rf7lFldvN_NeOEY1')} />
          </View>
          <View style={styles.soundRow}>
            <SoundButton label={soundLabels.waves} icon={soundIcons.waves} onPress={() => Linking.openURL('https://youtu.be/vPhg6sc1Mk4?si=zIyBQsITznsBblr7')} />
            <SoundButton label={soundLabels.whitenoise} icon={soundIcons.whitenoise} onPress={() => Linking.openURL('https://youtu.be/Og40mpl8VNc?si=X59hxoFRKpy18jT2')} />
          </View>
        </View>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    color: '#fff',
  },
  breatheButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    color: '#fff',
  },
  contentRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 30,
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSummary: {
    fontSize: 12,
    color: '#fff',
  },
  mapSection: {
    marginBottom: 30,
  },
  mapImage: {
    width: 120,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#fff',
    textAlign: 'right',
  },
  soundGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 0,
  },
  soundButton: {
    width: 170,
    padding: 0,
    marginVertical: 0,
    backgroundColor: 'transparent',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  soundButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-end',
    padding: 10,
  },
  soundButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 0,
  },
  soundButtonIcon: {
    width: 96,
    height: 96,
    marginLeft: 8,
  },
  soundButtonContentRight: {
    flexDirection: 'row-reverse',
  },
  soundButtonTextRight: {
    marginLeft: 0,
    marginRight: 18,
  },
  soundButtonIconRight: {
    marginLeft: 0,
    marginRight: 8,
  },
  topThreeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
    marginTop: 60, // Add space above to lower the buttons
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
  rowTwoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  libButton: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libButtonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  libraryDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
}); 