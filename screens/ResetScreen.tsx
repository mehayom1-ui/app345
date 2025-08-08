import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { auth, db } from '../services/firebase';

export default function ResetScreen() {
  const [reason, setReason] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleReset = async () => {
    const user = auth?.currentUser;
    if (!user) return;
    // Increment resets for today
    const today = new Date();
    const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let resets: Record<string, number> = {};
      let resetLogs: Array<{ timestamp: string; reason: string }> = [];
      if (userSnap.exists()) {
        if (userSnap.data().resets) {
          resets = { ...userSnap.data().resets };
        }
        if (userSnap.data().resetLogs) {
          resetLogs = [...userSnap.data().resetLogs];
        }
      }
      resets[todayStr] = (resets[todayStr] || 0) + 1;
      resetLogs.push({ timestamp: today.toISOString(), reason });
      await updateDoc(userRef, {
        lastReset: today,
        resets,
        resetLogs,
      });
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  return (
    <BackgroundImage>
      <View style={styles.container}>
        <Text style={styles.title}>שוב איפשרת לעצמך ליפול</Text>
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>
            קל להבין את המעגל האינסופי כשמחלקים אותו ...{"\n"}
            1. האורגזמה:{"\n"}
            אתה מרגיש מדהים והקלה באותו רגע{"\n"}
            2. ההבנה{"\n"}
            אתה מתחיל לאבד את האופוריה ונשאר עם חרטה ודיכאון{"\n"}
            3 הפיצוי:{"\n"}
            אתה עושה זאת שוב כדי לפצות על העצב והדיכאון
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="מה גרם לך ליפול?"
          placeholderTextColor="#aaa"
          value={reason}
          onChangeText={setReason}
          multiline
        />
        <Text style={styles.subtitle}>מהיום אתה לא נופל!!!</Text>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>הבנתי</Text>
        </TouchableOpacity>
      </View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  input: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 18,
    padding: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#e63946',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  explanationBox: {
    borderWidth: 2,
    borderColor: '#b39ddb', // light purple
    borderRadius: 14,
    padding: 16,
    marginBottom: 32,
    backgroundColor: 'rgba(179,157,219,0.08)',
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  explanationText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
    lineHeight: 26,
    fontWeight: '500',
  },
}); 