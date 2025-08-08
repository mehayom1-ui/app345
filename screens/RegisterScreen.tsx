import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth, db } from '../services/firebase';

const questions = [
  { id: 2, question: 'שם:', options: [] },
  { id: 3, question: 'גיל:', options: [] },
  { id: 4, question: 'באיזה גיל נחשפת לראשונה לתוכן פורנוגרפי?', options: [
    { value: 'a', label: 'א. מתחת לגיל 12' },
    { value: 'b', label: 'ב. בין 13 ל-16' },
    { value: 'c', label: 'ג. בין 17 ל-24' },
    { value: 'd', label: 'ד. גיל 25 ומעלה' },
  ] },
  { id: 5, question: 'כמה פעמים בשבוע אתה בדרך כלל צופה בתכנים פורנוגרפים?', options: [
    { value: 'a', label: 'א. יותר מפעם ביום' },
    { value: 'b', label: 'ב. בערך פעם ביום' },
    { value: 'c', label: 'ג. 2–4 פעמים בשבוע' },
    { value: 'd', label: 'ד. פחות מפעם בשבוע' },
  ] },
  { id: 6, question: 'האם עם הזמן הרגשת שאתה צורך תכנים פורנוגרפים לעיתים קרובות יותר?', options: [
    { value: 'a', label: 'א. כן' },
    { value: 'b', label: 'ב. לא' },
  ] },
  { id: 7, question: 'האם עם הזמן אתה צורך תכנים פורנוגרפים קיצונים/אלימים יותר?', options: [
    { value: 'a', label: 'א. כן' },
    { value: 'b', label: 'ב. לא' },
  ] },
  { id: 8, question: 'מתי הייתה הפעם הראשונה שלך בחוויה מינית כלשהי (פיזית)?', options: [
    { value: 'a', label: 'א. בגיל 12 ומטה' },
    { value: 'b', label: 'ב. בין 13 ל-17' },
    { value: 'c', label: 'ג. גיל 18 ומעלה' },
    { value: 'd', label: 'ד. עדיין לא' },
  ] },
  { id: 9, question: 'איך אתה מגדיר את עצמך מבחינת מין?', options: [
    { value: 'a', label: 'א. זכר' },
    { value: 'b', label: 'ב. נקבה' },
    { value: 'c', label: 'ג. אחר / מעדיף לא לציין' },
  ] },
  { id: 10, question: 'האם קשה לך להגיע לגמירה בלי דמיון או צפייה בתוכן פורנוגרפי?', options: [
    { value: 'a', label: 'א. לרוב' },
    { value: 'b', label: 'ב. לפעמים' },
    { value: 'c', label: 'ג. כמעט אף פעם' },
  ] },
  { id: 11, question: 'האם אתה מוצא את עצמך פונה לתוכן פורנוגרפי כשאתה מרגיש לחץ, עצב או בדידות?', options: [
    { value: 'a', label: 'א. לעיתים קרובות' },
    { value: 'b', label: 'ב. לפעמים' },
    { value: 'c', label: 'ג. כמעט ולא' },
  ] },
  { id: 12, question: 'האם אתה פונה לתוכן פורנוגרפי מתוך שעמום, גם כשאין חשק מיני?', options: [
    { value: 'a', label: 'א. כן, לעיתים קרובות' },
    { value: 'b', label: 'ב. לפעמים' },
    { value: 'c', label: 'ג. כמעט ולא' },
  ] },
  { id: 13, question: 'איך היית מגדיר את עצמך מבחינה דתית?', options: [
    { value: 'a', label: 'א. דתי / חרדי' },
    { value: 'b', label: 'ב. מסורתי' },
    { value: 'c', label: 'ג. חילוני' },
    { value: 'd', label: 'ד. אחר' },
  ] },
];

function BeliefQuestionnaire({ user, onComplete }: { user: any, onComplete: () => void }) {
  const [answers, setAnswers] = useState<any>({});
  const [current, setCurrent] = useState(0);
  const q = questions[current];

  const handleNext = async () => {
    if (current === questions.length - 1) {
      // Save answers to Firestore
      let belief = 'nonReg';
      if (answers[13] === 'a' || answers[13] === 'b') belief = 'religious';
      await updateDoc(doc(db, 'users', user.uid), {
        belief,
        questionnaire: answers,
      });
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#222', textAlign: 'right' }}>{q.question}</Text>
        {q.options.length === 0 ? (
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'right' }}
            value={answers[q.id] || ''}
            onChangeText={v => setAnswers({ ...answers, [q.id]: v })}
            placeholder="הכנס תשובה"
          />
        ) : (
          q.options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={{ padding: 12, borderRadius: 8, backgroundColor: answers[q.id] === opt.value ? '#E48BFF' : '#eee', marginBottom: 8 }}
              onPress={() => setAnswers({ ...answers, [q.id]: opt.value })}
            >
              <Text style={{ color: answers[q.id] === opt.value ? '#fff' : '#222', fontSize: 16, textAlign: 'right' }}>{opt.label}</Text>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity
          style={{ backgroundColor: '#E48BFF', borderRadius: 8, padding: 12, marginTop: 16, alignItems: 'center' }}
          onPress={handleNext}
          disabled={q.options.length === 0 ? !answers[q.id] : !answers[q.id]}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>הבא</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RegisterScreen({ navigation }: any) {
  const [showBelief, setShowBelief] = useState(false);
  const [userObj, setUserObj] = useState<any>(null);

  useEffect(() => {
    const checkBelief = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserObj(user);
        if (!data.belief) setShowBelief(true);
      }
    };
    checkBelief();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send verification email
      await sendEmailVerification(userCredential.user);
      // Save email and emailVerified to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        emailVerified: userCredential.user.emailVerified,
        lastReset: new Date(),
      }, { merge: true });
      alert('Verification email sent. Please check your inbox.');
      navigation.replace('Onboarding');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <BackgroundImage>
      <View style={styles.centeredContent}>
        <Text style={styles.inputLabel}>אימייל:</Text>
        <TextInput style={styles.input} onChangeText={setEmail} placeholder="הכנס אימייל" placeholderTextColor="#aaa" />
        <Text style={styles.inputLabel}>סיסמה:</Text>
        <TextInput style={styles.input} secureTextEntry onChangeText={setPassword} placeholder="הכנס סיסמה" placeholderTextColor="#aaa" />
        <TouchableOpacity style={styles.imageButton} onPress={handleRegister}>
          <Image source={require('../assets/images/register.png')} style={styles.buttonImage} />
        </TouchableOpacity>
      </View>
      {showBelief && userObj && (
        <BeliefQuestionnaire user={userObj} onComplete={() => setShowBelief(false)} />
      )}
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
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'flex-end',
    marginBottom: 6,
    marginRight: 8,
    textAlign: 'right',
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 18,
    padding: 16,
    marginBottom: 20,
    textAlign: 'right',
  },
  imageButton: {
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonImage: {
    width: 180,
    height: 48,
    resizeMode: 'contain',
  },
}); 