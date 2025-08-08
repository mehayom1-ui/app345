import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth, db } from '../services/firebase';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [promise, setPromise] = useState<string>('');
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        if (data.promise) setPromise(data.promise);
        if (data.notificationTime) setTime(new Date(data.notificationTime));
        if (data.profileImage) setProfileImage(data.profileImage);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { profileImage: result.assets[0].uri });
      }
    }
  };

  const savePromise = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      promise,
    });
    alert('Saved!');
  };

  const saveTime = async (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || time;
    setShowPicker(Platform.OS === 'ios');
    setTime(currentDate);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        notificationTime: currentDate.toISOString(),
      });
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace('Auth');
  };

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {/* Top right title */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, marginTop: 10, marginBottom: 10, marginRight: 4 }}>פרופיל</Text>
        </View>
        {/* Profile Image Centered */}
        <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center', marginBottom: 18 }}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../assets/images/profile.png')}
            style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#E48BFF', backgroundColor: '#fff' }}
          />
        </TouchableOpacity>
        {/* Flat, full-image buttons */}
        <TouchableOpacity style={styles.flatBtn} activeOpacity={0.7}>
          <Image source={require('../assets/images/settings1.png')} style={styles.flatBtnImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.flatBtn} activeOpacity={0.7}>
          <Image source={require('../assets/images/rateus1.png')} style={styles.flatBtnImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.flatBtn} activeOpacity={0.7}>
          <Image source={require('../assets/images/contact1.png')} style={styles.flatBtnImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.flatBtn} activeOpacity={0.7} onPress={() => navigation.navigate('MyPromise')}>
          <Image source={require('../assets/images/myPromise.png')} style={styles.flatBtnImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.flatBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Image source={require('../assets/images/.png')} style={styles.flatBtnImage} />
        </TouchableOpacity>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  flatBtn: {
    width: 320,
    height: 56,
    padding: 0,
    marginBottom: 15,
  },
  flatBtnImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
});
        