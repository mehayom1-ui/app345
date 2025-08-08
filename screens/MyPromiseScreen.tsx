import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth, db } from '../services/firebase';

function CollapsiblePromise({ promise, date }: { promise: string; date: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.collapseContainer}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.collapseHeader}>
        <Text style={styles.collapseDate}>{date}</Text>
        <Text style={styles.collapseToggle}>{open ? '-' : '+'}</Text>
      </TouchableOpacity>
      {open && <Text style={styles.collapseText}>{promise}</Text>}
    </View>
  );
}

export default function MyPromiseScreen() {
  const navigation = useNavigation();
  const [promise, setPromise] = useState('');
  const [saving, setSaving] = useState(false);
  const [pastPromises, setPastPromises] = useState<{ promise: string; date: string }[]>([]);

  useEffect(() => {
    const fetchPromises = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists() && userSnap.data().promiseHistory) {
        setPastPromises(userSnap.data().promiseHistory);
      }
    };
    fetchPromises();
  }, []);

  const handleSave = async () => {
    if (!promise.trim()) return;
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let history: { promise: string; date: string }[] = [];
    if (userSnap.exists() && userSnap.data().promiseHistory) {
      history = userSnap.data().promiseHistory;
    }
    const newEntry = { promise, date: new Date().toLocaleDateString('he-IL') };
    history = [newEntry, ...history];
    await updateDoc(userRef, { promiseHistory: history, promise });
    setPastPromises(history);
    setPromise('');
    setSaving(false);
  };

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {/* X button top left */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/images/X.png')} style={styles.closeIcon} />
        </TouchableOpacity>
        {/* Header */}
        <Text style={styles.header}>מה ההבטחה שלך מהיום?</Text>
        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="כתוב כאן את ההבטחה שלך..."
          placeholderTextColor="#aaa"
          value={promise}
          onChangeText={setPromise}
          multiline
        />
        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'שומר...' : 'שמור'}</Text>
        </TouchableOpacity>
        {/* Past promises */}
        <ScrollView style={styles.pastList} contentContainerStyle={{ paddingBottom: 40 }}>
          {pastPromises.map((item, idx) => (
            <CollapsiblePromise key={idx} promise={item.promise} date={item.date} />
          ))}
        </ScrollView>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
  },
  closeIcon: {
    width: 72,
    height: 72,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    padding: 16,
    minHeight: 60,
    marginBottom: 16,
    textAlign: 'right',
  },
  saveBtn: {
    backgroundColor: '#E48BFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pastList: {
    flex: 1,
    marginTop: 8,
  },
  collapseContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  collapseDate: {
    color: '#E48BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  collapseToggle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  collapseText: {
    color: '#fff',
    fontSize: 16,
    padding: 14,
    paddingTop: 0,
    textAlign: 'right',
  },
}); 