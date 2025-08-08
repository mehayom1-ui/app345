import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import type { RootStackParamList } from '../navigation/RootNavigator';
const maamarim: { title: string; explanation: string }[] = [
  {
    title: "פורנו וההשפעה על המוח – למה זה כל כך ממכר?",
    explanation: "בכל צפייה בפורנו, המוח מוצף בגל של דופמין – אותו כימיקל שאחראי על תחושת עונג. עם הזמן, המוח מתרגל לרמות גבוהות יותר ודורש תוכן יותר קיצוני כדי לחוות את אותה הנאה. התוצאה: רגישות נמוכה יותר לגירויים טבעיים כמו מגע או קשר אנושי. זו לא רק הרגל – זו התמכרות ביולוגית."
  },
  {
    title: "איך פורנו הורס את הביטחון והדימוי העצמי שלך",
    explanation: "פורנו מציג עולם לא מציאותי של מראה חיצוני, שליטה וביצועים מיניים. ההשוואה הזו יוצרת תחושת חוסר ערך וחוסר שקט פנימי. אתה מתחיל להרגיש 'פחות', ולאט לאט מאבד את הביטחון ואת הכוח שלך."
  },
  {
    title: "פורנו והקשר למיניות – למה זה פוגע בזקפה, בחשק ובהנאה?",
    explanation: "המוח לומד להתרגש מגירוי לא טבעי – מסכים, סאונד, קצב מוגזם. במציאות, הגוף לא מגיב. תופעה נפוצה: אין אונות שנגרמת מצפייה בפורנו (P.I.E.D). בנוסף, יש פחות חיבור עם בת הזוג ויותר צורך בדמיון כדי להתרגש. זה לא מקרי – זו תוצאה ישירה של הפורנו."
  },
  {
    title: "איך פורנו הופך להרגל רע – ולמה קשה כל כך להפסיק",
    explanation: "ההתמכרות היא לא רק לתוכן אלא למה שהוא נותן רגעית – בריחה, ריגוש, שחרור. הוא מחליף פתרונות בריאים והופך לתגובה אוטומטית למצבים כמו עייפות, לחץ, בדידות או שיעמום. ככה המוח לומד שזה הפתרון היחיד."
  },
  {
    title: "הנזקים הבריאותיים של פורנו – לא רק בראש",
    explanation: "פורנו משפיע גם על הגוף: מחליש אנרגיה, פוגע בשינה ובריכוז, מדכא הורמונים גבריים ויכול לגרום לדיכאון ועצבנות. הסיבה: גירוי יתר כרוני של מערכת העצבים ורמות דופמין לא טבעיות."
  },
  {
    title: "הגבר שאתה יכול להיות – ואיך פורנו גונב לך את זה",
    explanation: "פורנו גונב ממך את היכולת להיות עוצמתי, ממוקד ובטוח בעצמך. גברים שנגמלים מדווחים על ביטחון עצמי מוגבר, פוקוס, שיפור בזוגיות, אנרגיה טבעית והצלחה. האם תוותר על כל זה בשביל מסך?"
  },
  {
    title: "הקשר בין פורנו לסמים",
    explanation: "פורנו משפיע על המוח כמו סמים – מפעיל את מרכזי העונג ודורש גירוי קיצוני יותר ויותר. הוא גם פוגע באזורים שאחראים על שליטה עצמית וריכוז. זו לא חולשה – זו השפעה נוירולוגית. אבל כמו כל התמכרות – אפשר להפסיק, והמוח יודע להשתקם."
  }
];

export default function MaamarimScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        <Text style={styles.header}>מאמרים ומידע</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {maamarim.length === 0 ? (
            <Text style={styles.placeholder}>לא נמצאו מאמרים.</Text>
          ) : (
            maamarim.map((item, idx) => (
              <View key={idx} style={styles.topicBox}>
                <TouchableOpacity onPress={() => setOpenIndex(openIndex === idx ? null : idx)}>
                  <Text style={styles.topicTitle}>{item.title}</Text>
                </TouchableOpacity>
                {openIndex === idx && (
                  <Text style={styles.topicExplanation}>{item.explanation}</Text>
                )}
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
  },
  topicExplanation: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'right',
    lineHeight: 24,
    marginTop: 8,
  },
  placeholder: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 32,
  },
}); 
