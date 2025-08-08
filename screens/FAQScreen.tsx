import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';

const FAQS = [
  {
    q: 'מהן ההשפעות השליליות של אוננות מופרזת?',
    a: 'אוננות מופרזת יכולה לגרום לעייפות, ירידה בריכוז, דיכאון ואובדן מוטיבציה. לעיתים היא גם פוגעת באינטימיות ובמערכות יחסים.'
  },
  {
    q: 'האם אוננות פוגעת באנרגיה ובכוח הרצון?',
    a: 'כן. רבים מדווחים על ירידה באנרגיה, דחיינות ותחושת חוסר שליטה עצמית בעקבות הרגל כפייתי.'
  },
  {
    q: 'איך אוננות משפיעה על המוח?',
    a: 'היא גורמת לשחרור דופמין מיידי וממכר. לאורך זמן, זה מחליש את תחושת הסיפוק וגורם לחיפוש תמידי אחר גירויים חזקים יותר.'
  },
  {
    q: 'האם אוננות פוגעת בזוגיות?',
    a: 'כן. היא עלולה להפחית את המשיכה לבן/בת הזוג וליצור בידוד רגשי והתמכרות לפורנו.'
  },
  {
    q: 'מה הקשר בין אוננות לפורנוגרפיה?',
    a: 'רוב ההתמכרויות לאוננות מלוות בצפייה בפורנו, שפוגע בתפיסת המציאות המינית ובציפיות מאינטימיות אמיתית.'
  },
  {
    q: 'האם הפסקת אוננות יכולה לשפר את הביטחון העצמי?',
    a: 'בהחלט. אנשים מדווחים על עלייה בביטחון, נחישות, ותחושת ערך עצמי לאחר הפסקה ממושכת.'
  },
  {
    q: 'מהם היתרונות של גמילה מאוננות?',
    a: 'שיפור באנרגיה, ריכוז, מצב רוח, מוטיבציה ויחסים בין-אישיים. בנוסף – תחושת שליטה עצמית חזקה יותר.'
  },
  {
    q: 'כמה זמן לוקח לראות שינוי לאחר הפסקה?',
    a: 'לרוב תוך שבועיים מורגשים שינויים ראשוניים. שיפור משמעותי מגיע לרוב אחרי חודש וחצי ומעלה של התמדה, וגמילה מלאה ותוצאות  מירביות אחריי 90 ימים.'
  },
  {
    q: 'איך האפליקציה עוזרת להפסיק לאונן?',
    a: 'האפליקציה מציעה מאמרים, סרטונים, תרגולי נשימה, מדיטציות, רעשי רקע מרגיעים ומעקב אחר התקדמות יומית.'
  },
  {
    q: 'האם זה נורמלי להרגיש דחפים חזקים?',
    a: 'כן. הדחפים הם טבעיים ונפוצים במיוחד בתחילת הדרך. חשוב ללמוד לזהות אותם ולהגיב בצורה מודעת.'
  },
  {
    q: 'מה עושים כשמרגישים רצון עז לאונן?',
    a: 'מומלץ להסיח את הדעת עם פעילות אחרת – נשימות, הליכה, שמיעת מוזיקה או שימוש באפליקציה.'
  },
  {
    q: 'איך מדיטציה עוזרת בגמילה מאוננות?',
    a: 'היא מחזקת מודעות לרגע, מפחיתה לחצים ודחפים אוטומטיים, ועוזרת ליצור תגובה רגועה במקום התנהגות כפייתית.'
  },
  {
    q: 'מה עושים אם נכשלתי וחזרתי לאונן?',
    a: 'לא נורא. קמים, לומדים ממה שהוביל לכך, וממשיכים הלאה. התמדה ולא שלמות מביאה את התוצאות.'
  },
  {
    q: 'האם יש קהילה או תמיכה באפליקציה?',
    a: 'כן. באפליקציה תוכל למצוא תכנים תומכים, המלצות ומסלול אישי לחיזוק והשראה.'
  },
  {
    q: 'האם הפסקת אוננות משפרת את איכות החיים הכללית?',
    a: 'בהחלט. משתמשים מדווחים על תחושת חיות גבוהה יותר, בהירות מנטלית, ורמות שמחה ויצירתיות מוגברות.'
  },
];

function CollapsibleFAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.faqQuestion}>
        <Text style={styles.faqQuestionText}>{q}</Text>
        <Text style={styles.faqPlusMinus}>{open ? '-' : '+'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.faqAnswerBox}>
          <Text style={styles.faqAnswerText}>{a}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const navigation = useNavigation();
  return (
    <BackgroundImage>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back arrow button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../assets/images/backarrow.png')} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Image source={require('../assets/images/FAQ.png')} style={styles.faqImage} resizeMode="contain" />
        <View style={styles.faqList}>
          {FAQS.map((item, idx) => (
            <CollapsibleFAQ key={idx} q={item.q} a={item.a} />
          ))}
        </View>
      </ScrollView>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 18,
    zIndex: 10,
    // No background, no border radius, no padding
  },
  backIcon: {
    width: 72,
    height: 72,
  },
  faqImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  faqList: {
    width: '92%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  faqItem: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: '#E48BFF',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  faqQuestionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  faqPlusMinus: {
    fontSize: 28,
    color: '#E48BFF',
    marginLeft: 12,
    marginRight: 0,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  faqAnswerBox: {
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    borderTopColor: '#E48BFF',
  },
  faqAnswerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
    lineHeight: 26,
  },
}); 