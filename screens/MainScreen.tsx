import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { Camera, CameraMountError, CameraView } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { auth, db } from '../services/firebase';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const screenWidth = Dimensions.get('window').width;

const MOODS = [
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'happy', emoji: '😊', label: 'Happy' },
];

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
  const [current, setCurrent] = useState(-1); // -1 for intro page
  const q = questions[current];

  const handleNext = async () => {
    if (current === -1) {
      setCurrent(0);
      return;
    }
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

  // Progress bar: from 0 to questions.length
  const progress = current === -1 ? 0 : (current + 1) / questions.length;
  const percent = Math.round(progress * 100);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, width: '100%', height: '100%' }}>
      <BackgroundImage>
        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          {/* Progress Bar */}
          <View style={{ width: '100%', marginTop: 32, marginBottom: 8 }}>
            <View style={{ width: '100%', height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: `${progress * 100}%`, height: 8, backgroundColor: '#E48BFF', borderRadius: 4 }} />
            </View>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginTop: 8 }}>{percent}%</Text>
          </View>
          {current === -1 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 24 }}>
                שאלון פתיחה – היכרות אישית
              </Text>
              <Text style={{ fontSize: 20, color: '#fff', textAlign: 'center', marginBottom: 24 }}>
                המסע שלנו מתחיל מהיום{"\n"}רק נבין מי אתה ומשם נתקדם יחד.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#E48BFF', borderRadius: 8, padding: 16, marginTop: 24, alignItems: 'center', width: '80%' }}
                onPress={handleNext}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>התחל</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#fff', textAlign: 'right', width: '100%' }}>{q.question}</Text>
              {q.options.length === 0 ? (
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16, marginBottom: 24, textAlign: 'right', width: '100%', fontSize: 18, color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
                  value={answers[q.id] || ''}
                  onChangeText={v => setAnswers({ ...answers, [q.id]: v })}
                  placeholder="הכנס תשובה"
                  placeholderTextColor="#ccc"
                />
              ) : (
                q.options.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={{ padding: 16, borderRadius: 8, backgroundColor: answers[q.id] === opt.value ? '#E48BFF' : 'rgba(255,255,255,0.08)', marginBottom: 16, width: '100%' }}
                    onPress={() => setAnswers({ ...answers, [q.id]: opt.value })}
                  >
                    <Text style={{ color: '#fff', fontSize: 18, textAlign: 'right' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                style={{ backgroundColor: '#E48BFF', borderRadius: 8, padding: 16, marginTop: 24, alignItems: 'center', width: '100%' }}
                onPress={handleNext}
                disabled={q.options.length === 0 ? !answers[q.id] : !answers[q.id]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>הבא</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BackgroundImage>
    </View>
  );
}

// Motivational sentences
const nonReg = [
  "תזכור למה התחלת",
  "תתמקד במטרות שלך",
  "האם זה באמת שווה את?",
  "תמשיך – ויום אחד תתעורר שבור לגמרי.",
  "אם תוותר עכשיו – תוותר על עצמך.",
  "אתה מחבל בעצמך בשידור חי.",
  "שוב פעם??",
  "אתה תתחרט על זה כמו תמיד",
  "די, כמה פעמים עוד תיפול ותתפלל שזה האחרון?",
  "אל תעשה את זה. הפעם – תנצח"
];
const religious = [
  '"בריתי לא תחללו" (ויקרא כ"ו, ט"ו)\n➡ כל יום שאתה שומר – אתה נאמן לברית עם בורא עולם.',
  "אתה שומר על עצמך – והקב\"ה שומר עליך.",
  "היצר מחכה – אבל אתה שולט בו, לא הוא בך.",
  "לשמור את העיניים – זו הדרך לראות את האמת והגדולה.",
  '"אִישׁ כִּגְבוּרָתוֹ" (שמות ט"ו, ג\')\n➡ הגיבור האמיתי – הוא זה שמתגבר על יצרו.',
  '"קדש עצמך במותר לך"\n📚 יבמות כ\'\n(לא רק להתרחק מאסור – אלא גם להרים את הרף האישי)',
  '"איזהו גיבור? הכובש את יצרו"\n📚 פרקי אבות ד\', א\'\n(הגדרה אמיתית של כוח – שליטה עצמית)',
  "כל שנייה של שמירה – בונה אותך לעולם הבא.",
  "הכוח להתגבר – הוא המתנה שה' שם בלב שלך.",
  "הנפש שלך קדושה מדי בשביל לחיות בשבי של יצר."
];

// PanicScreen component
function PanicScreen({ onClose }: { onClose: () => void }) {
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [belief, setBelief] = useState<'religious' | 'nonReg'>('nonReg');
  const [sentence, setSentence] = useState('');
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Fetch belief from Firestore
    const fetchBelief = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        const b = data.belief === 'religious' ? 'religious' : 'nonReg';
        setBelief(b);
        const arr = b === 'religious' ? religious : nonReg;
        setSentence(arr[Math.floor(Math.random() * arr.length)]);
      }
    };
    fetchBelief();
  }, []);

  const handleCameraError = (error: CameraMountError) => {
    setCameraError(error.message || 'Camera failed to load.');
  };

  if (hasPermission === null) return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#E48BFF" />
      <Text style={{ color: '#fff', fontSize: 20, marginTop: 16 }}>מבקש הרשאת מצלמה...</Text>
    </View>
  );
  if (hasPermission === false) return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>אין הרשאת מצלמה</Text>
      <TouchableOpacity onPress={onClose} style={{ marginTop: 24 }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>סגור</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundImage>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' }}>אתה במצוקה?</Text>
        <View style={{ borderWidth: 2, borderColor: '#E48BFF', borderRadius: 18, overflow: 'hidden', width: '90%', aspectRatio: 3/3.6, marginBottom: 24, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          {isFocused && hasPermission && !cameraError && (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1, width: '100%', height: '100%' }}
              facing="front"
            />
          )}
          {cameraError && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>שגיאה בטעינת המצלמה: {cameraError}</Text>
            </View>
          )}
        </View>
        <View style={{ borderWidth: 2, borderColor: '#E48BFF', borderRadius: 18, padding: 18, width: '90%', backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20, textAlign: 'center', lineHeight: 32 }}>{sentence}</Text>
        </View>
        {/* Add safe and fell buttons below the sentence */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
          <TouchableOpacity
            style={{ alignItems: 'center', marginHorizontal: 24 }}
            onPress={onClose}
          >
            <Image source={require('../assets/images/safe.png')} style={{ width: 80, height: 80, marginBottom: 8 }} resizeMode="contain" />
          </TouchableOpacity>
          <FellButton onDone={onClose} />
        </View>
        {/* X exit button removed as requested */}
      </View>
    </BackgroundImage>
  );
}

function FellButton({ onDone }: { onDone: () => void }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const handleFell = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let resets: { [key: string]: number } = {};
        if (userSnap.exists() && userSnap.data().resets) {
          resets = { ...userSnap.data().resets };
        }
        resets[todayStr] = (resets[todayStr] || 0) + 1;
        await updateDoc(userRef, {
          lastReset: new Date(),
          resets,
        });
      }
      setLoading(false);
      onDone();
      navigation.navigate('Main', { screen: 'Home' } as never);
    } catch (e) {
      setLoading(false);
      // Optionally show error
    }
  };
  return (
    <TouchableOpacity
      style={{ alignItems: 'center', marginHorizontal: 24, opacity: loading ? 0.6 : 1 }}
      onPress={handleFell}
      disabled={loading}
    >
      <Image source={require('../assets/images/fell.png')} style={{ width: 80, height: 80, marginBottom: 8 }} resizeMode="contain" />
    </TouchableOpacity>
  );
}

export default function MainScreen() {
  const [selectedDay, setSelectedDay] = useState(0); // Default to Sunday
  const [registerDate, setRegisterDate] = useState<string | null>(null);
  const [registerTimestamp, setRegisterTimestamp] = useState<Date | null>(null);
  const [lastResetTimestamp, setLastResetTimestamp] = useState<Date | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showBelief, setShowBelief] = useState(false);
  const [userObj, setUserObj] = useState<any>(null);
  const [showPanic, setShowPanic] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<Date[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showPickerIndex, setShowPickerIndex] = useState<number | 'add' | null>(null);

  // Add progress state
  const TOTAL_PROGRESS = 90;
  const [progress, setProgress] = useState(0); // You can update this as needed
  const progressPercent = Math.round((progress / TOTAL_PROGRESS) * 100);

  // Update progress based on days since last reset
  useEffect(() => {
    setProgress(elapsed.days);
  }, [elapsed.days]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const user = auth.currentUser;
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    unsubscribe = onSnapshot(userDoc, (userSnap) => {
      if (!userSnap.exists()) return;
      const data = userSnap.data();
      // Set registration date (button 1)
      let createdAt = data.createdAt;
      if (createdAt) {
        const startDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        setRegisterTimestamp(startDate);
        setRegisterDate(startDate.toLocaleDateString('he-IL'));
      }
      // Set lastResetTimestamp for timer (do NOT fall back to createdAt)
      if (data.lastReset) {
        let lastResetDate = null;
        // Firestore Timestamp object
        if (data.lastReset && typeof data.lastReset.toDate === 'function') {
          lastResetDate = data.lastReset.toDate();
        // ISO string or number
        } else if (typeof data.lastReset === 'string' || typeof data.lastReset === 'number') {
          const d = new Date(data.lastReset);
          lastResetDate = isNaN(d.getTime()) ? null : d;
        }
        setLastResetTimestamp(lastResetDate);
      } else {
        setLastResetTimestamp(null);
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Timer counts ONLY from lastResetTimestamp
  useEffect(() => {
    if (!lastResetTimestamp) {
      setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const updateElapsed = () => {
      const now = new Date();
      let diff = Math.floor((now.getTime() - lastResetTimestamp.getTime()) / 1000);
      const days = Math.floor(diff / (24 * 3600));
      diff = diff % (24 * 3600);
      const hours = Math.floor(diff / 3600);
      diff = diff % 3600;
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setElapsed({ days, hours, minutes, seconds });
    };
    updateElapsed();
    intervalRef.current = setInterval(updateElapsed, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lastResetTimestamp]);

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

  const handleMoodSelect = (moodKey: string) => {
    setSelectedMood(moodKey);
    setShowMoodSelector(false);
  };

  const getSelectedMoodEmoji = () => {
    const mood = MOODS.find(m => m.key === selectedMood);
    return mood ? mood.emoji : '';
  };

  // Fetch notification times from Firestore on mount
  useEffect(() => {
    const fetchNotificationTimes = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists() && userSnap.data().notificationTimes) {
        setNotificationTimes(userSnap.data().notificationTimes.map((t: any) => new Date(t)));
      }
    };
    fetchNotificationTimes();
  }, []);

  // Save notification times to Firestore and schedule notifications
  const saveNotificationTimes = async (times: Date[]) => {
    setLoadingNotifications(true);
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      notificationTimes: times.map(t => t.toISOString()),
    });
    setNotificationTimes(times);
    await scheduleAllNotifications(times);
    setLoadingNotifications(false);
    setNotificationModalVisible(false);
  };

  // Schedule notifications for all times
  const scheduleAllNotifications = async (times: Date[]) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const time of times) {
      await scheduleNotification(time);
    }
  };

  // Schedule a single notification
  const scheduleNotification = async (time: Date) => {
    // Get a random belief sentence from Firestore
    const user = auth.currentUser;
    if (!user) return;
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    let belief = 'nonReg';
    if (userSnap.exists() && userSnap.data().belief) {
      belief = userSnap.data().belief;
    }
    // Fetch sentences from Firestore or use local fallback
    let sentences = [];
    if (belief === 'religious') {
      sentences = religious;
    } else {
      sentences = nonReg;
    }
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];

    // Calculate the next trigger time (today if in the future, otherwise tomorrow)
    const now = new Date();
    let triggerDate = new Date(now);
    triggerDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    if (triggerDate <= now) {
      // If the time has already passed today, schedule for tomorrow
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'מהיום',
        body: randomSentence,
        sound: true,
      },
      trigger: {
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
        channelId: 'default', // Required for Android
      },
    });
  };

  // Request notification permissions
  useEffect(() => {
    (async () => {
      // Android: create notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      }
      // Permissions for both iOS and Android
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('יש לאפשר הרשאות התראות לאפליקציה כדי לקבל התראות יומיות.');
      }
    })();
  }, []);

  // UI for notification modal
  const renderNotificationModal = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }}>
      <BlurView intensity={60} tint="dark" style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }} />
      <View style={{ backgroundColor: 'rgba(14,67,124,0.97)', borderRadius: 24, padding: 28, width: '90%', maxWidth: 400, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 24, elevation: 12, zIndex: 2 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 20, textAlign: 'center', color: '#fff', letterSpacing: 0.5 }}>בחר עד 3 זמנים להתראה יומית</Text>
        <View style={{ width: '100%', marginBottom: 16 }}>
          {notificationTimes.map((time, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, width: '100%' }}>
              <TouchableOpacity onPress={() => setShowPickerIndex(idx)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 32, paddingVertical: 12, paddingHorizontal: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
                <Ionicons name="time-outline" size={22} color="#E48BFF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#fff', letterSpacing: 1, textAlign: 'center' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                const newTimes = notificationTimes.filter((_, i) => i !== idx);
                setNotificationTimes(newTimes);
              }} style={{ marginLeft: 10, backgroundColor: '#fff', borderRadius: 16, padding: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                <Ionicons name="close" size={18} color="#e63946" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {notificationTimes.length < 3 && (
          <TouchableOpacity
            onPress={() => setShowPickerIndex('add')}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E48BFF', borderRadius: 32, paddingVertical: 10, paddingHorizontal: 22, marginBottom: 18, shadowColor: '#E48BFF', shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 }}>
            <Ionicons name="add-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>הוסף זמן</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.13)', width: '100%', marginVertical: 10 }}></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%' }}>
          <TouchableOpacity onPress={() => setNotificationModalVisible(false)} style={{ padding: 14, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>ביטול</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => saveNotificationTimes(notificationTimes)} style={{ backgroundColor: '#E48BFF', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 32, shadowColor: '#E48BFF', shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 }} disabled={loadingNotifications}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{loadingNotifications ? 'שומר...' : 'שמור'}</Text>
          </TouchableOpacity>
        </View>
        {showPickerIndex !== null && (
          <DateTimePicker
            value={typeof showPickerIndex === 'number' ? notificationTimes[showPickerIndex] || new Date() : new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
            onChange={(event, selectedDate) => {
              if (event.type === 'set' && selectedDate) {
                if (showPickerIndex === 'add') {
                  // Only add if the selected time is not the same as now
                  const now = new Date();
                  if (
                    selectedDate.getHours() !== now.getHours() ||
                    selectedDate.getMinutes() !== now.getMinutes()
                  ) {
                    setNotificationTimes([...notificationTimes, selectedDate]);
                  }
                } else if (typeof showPickerIndex === 'number') {
                  const newTimes = [...notificationTimes];
                  newTimes[showPickerIndex] = selectedDate;
                  setNotificationTimes(newTimes);
                }
              }
              setShowPickerIndex(null);
            }}
          />
        )}
      </View>
    </View>
  );

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {/* Weekday Circles */}
        <View style={styles.weekdayRow}>
          {weekdays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.circle,
                selectedDay === index && styles.activeCircle
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Brain Image with 2 buttons to the right and progress bar to the left */}
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 10}}>
          {/* Progress Bar aligned 10px from left edge, fixed width */}
          <View style={{width: 120, alignItems: 'flex-start', marginLeft: 15}}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { height: `${progressPercent}%` }]} />
                  {/* Percentage label centered in the bar */}
                  <View style={styles.progressPercentLabelCenter}>
                    <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                  </View>
                </View>
              </View>
              {/* Counter below the bar */}
              <Text style={styles.progressCounter}>{progress}/{TOTAL_PROGRESS}</Text>
            </View>
          </View>
          {/* Centered Brain with flex: 1 for explicit centering */}
          <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <TouchableOpacity onPress={() => navigation.navigate('FAQ')}>
              <Image source={require('../assets/images/Brain.png')} style={styles.brainImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          {/* Buttons aligned 10px from right edge, fixed width */}
          <View style={{width: 120, alignItems: 'flex-end', marginRight: 10}}>
            <View style={styles.rightButtonsContainer}>
              <TouchableOpacity style={styles.notificationButton} onPress={() => setNotificationModalVisible(true)}>
                <Image source={require('../assets/images/notifications.png')} style={styles.notificationIconImage} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resetButton]} onPress={() => navigation.navigate('Reset')}>
                <Image source={require('../assets/images/reset.png')} style={styles.resetIconImage} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Time Counter */}
        <View style={styles.timeCounterContainer}>
          {lastResetTimestamp ? (
            <>
              <Text style={styles.timeCounterMain}>
                {elapsed.days > 0
                  ? `${elapsed.days} ימים`
                  : elapsed.hours > 0
                  ? `${elapsed.hours} שעות`
                  : elapsed.minutes > 0
                  ? `${elapsed.minutes} דקות`
                  : `${elapsed.seconds} שניות`}
              </Text>
              <Text style={styles.timeCounterSub}>
                {elapsed.days > 0 && `${elapsed.hours} שעות / `}
                {elapsed.days > 0 || elapsed.hours > 0 ? `${elapsed.minutes} דקות / ` : ''}
                {elapsed.days > 0 || elapsed.hours > 0 || elapsed.minutes > 0 ? `${elapsed.seconds} שניות` : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.timeCounterMain}>--</Text>
          )}
        </View>

        {/* 2x2 Grid of Buttons at the bottom */}
        <View style={[styles.gridContainer, { marginBottom: 10 }]}> {/* Lower grid by reducing marginBottom */}
          <View style={styles.gridRow}>
            <TouchableOpacity style={styles.statusBox}>
              <Text style={styles.statusText}>אתה בתהליך מ-</Text>
              <Text style={styles.statusDate}>{registerDate ? registerDate : '...'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MyPromise')}>
              <Image source={require('../assets/images/promise.png')} style={[styles.btn3Image, { width: 80, height: 80 }]} resizeMode="contain" />
              {/* <Text style={styles.actionButtonText}>ההבטחה שלי מהיום</Text> */}
            </TouchableOpacity>
          </View>
          <View style={styles.gridRow}>
            <TouchableOpacity style={styles.btn3Button} onPress={() => navigation.navigate('Main', { screen: 'Entertainment' } as never)}>
              <View style={styles.btn3Content}>
                <Image source={require('../assets/images/library.png')} style={styles.btn3Image} resizeMode="contain" />
                <Text style={styles.btn3Text}>הרגעת האינסטינקט</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moodButton}
              onPress={() => setShowMoodSelector(!showMoodSelector)}
            >
              <Text style={styles.moodButtonText}>מצב הרוח שלי היום</Text>
              {selectedMood && (
                <Text style={styles.selectedMoodText}>{getSelectedMoodEmoji()}</Text>
              )}
              {showMoodSelector && (
                <View style={styles.moodRow}>
                  {MOODS.map((mood) => (
                    <TouchableOpacity
                      key={mood.key}
                      style={[
                        styles.moodEmoji,
                        selectedMood === mood.key && styles.selectedMoodEmoji
                      ]}
                      onPress={() => handleMoodSelect(mood.key)}
                    >
                      <Text style={styles.emojiText}>{mood.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Panic button above the spacer */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 0 }}>
          <TouchableOpacity
            onPress={() => setShowPanic(true)}
            style={{ width: 280, height: 70, borderRadius: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
            hitSlop={0}
          >
            <Image source={require('../assets/images/panic2.png')} style={{ width: 300, height: 70, resizeMode: 'contain' }} />
          </TouchableOpacity>
        </View>
        {/* Spacer to push everything above to the top */}
        <View style={{ flex: 0 }} />
        {showPanic && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <PanicScreen onClose={() => setShowPanic(false)} />
          </View>
        )}
        {notificationModalVisible && renderNotificationModal()}
      </View>
      {showBelief && userObj && (
        <BeliefQuestionnaire user={userObj} onComplete={() => setShowBelief(false)} />
      )}
    </BackgroundImage>
  );
}

const BUTTON_SIZE = screenWidth * 0.26;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // adjust to your preference
    // backgroundColor: '#fff', // Remove to allow background image to show
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  circle: {
    width: screenWidth / 9,
    height: screenWidth / 9,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#69f',
  },
  dayText: {
    color: '#333',
    fontWeight: 'bold',
  },
  gridContainer: {
    marginTop: 40,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  actionButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  statusBox: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusDate: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedMoodText: {
    fontSize: 32,
    marginTop: 8,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  moodEmoji: {
    marginHorizontal: 2,
    padding: 0,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodEmoji: {
    backgroundColor: '#69f',
    borderColor: '#69f',
  },
  emojiText: {
    fontSize: 28,
  },
  moodButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  moodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  btn3Content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btn3Image: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  btn3Text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  btn3Button: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  brainContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10, // reduce bottom margin to keep buttons visible
  },
  brainImage: {
    width: 120,
    height: 120,
  },
  timeCounterContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  timeCounterMain: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 2,
  },
  timeCounterSub: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  rightButtonsContainer: {
    marginLeft: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
    marginTop: 40, // move buttons lower
  },
  iconButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // backgroundColor: 'rgba(255,255,255,0.15)', // remove background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  iconImage: {
    width: 48,
    height: 48,
  },
  progressBarContainer: {
    alignItems: 'center',
    marginRight: 32,
    flex: 0,
  },
  progressBarWrapper: {
    height: 120,
    width: 46, // 10px wider
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  progressBarBg: {
    width: 28, // 10px wider
    height: 120,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#69f',
    borderRadius: 8,
  },
  progressPercentLabel: {
    position: 'absolute',
    left: '100%',
    transform: [{ translateX: 8 }],
    alignItems: 'center',
  },
  progressPercentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressCounter: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  progressPercentLabelInside: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    top: 4,
  },
  progressPercentLabelCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  notificationButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  notificationIconImage: {
    width: 48,
    height: 48,
  },
  resetButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  resetIconImage: {
    width: 66,
    height: 66,
  },
}); 