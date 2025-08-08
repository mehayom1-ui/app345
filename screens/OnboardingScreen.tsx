import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth, db } from '../services/firebase';

export default function OnboardingScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [mood, setMood] = useState('');

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(doc(db, 'users', user.uid), {
      name,
      goal,
      mood,
      createdAt: new Date()
    });

    navigation.replace('Main');
  };

  return (
    <BackgroundImage>
      <View style={styles.centeredContent}>
        <Text>Your Name:</Text>
        <TextInput onChangeText={setName} style={styles.input} />

        <Text>Your Goal:</Text>
        <TextInput onChangeText={setGoal} style={styles.input} />

        <Text>How do you feel today?</Text>
        <TextInput onChangeText={setMood} style={styles.input} />

        <Button title="Save and Continue" onPress={saveProfile} />
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  input: { borderBottomWidth: 1, marginBottom: 20, width: '100%' },
}); 