import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth, db } from '../services/firebase';

const screenWidth = Dimensions.get('window').width;
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const hebrewDaysReversed = [...hebrewDays].reverse();

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

export default function StatsScreen() {
  const [chartData, setChartData] = useState({ labels: hebrewDays, datasets: [{ data: [0,0,0,0,0,0,0] }] });
  const [barColors, setBarColors] = useState<string[]>(Array(7).fill('#00FF8B'));
  const [barLabels, setBarLabels] = useState<string[]>(Array(7).fill(''));
  const [loading, setLoading] = useState(true);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, -1 = prev, +1 = next
  const [minWeekOffset, setMinWeekOffset] = useState(0); // Earliest week user can access
  const [maxWeekOffset, setMaxWeekOffset] = useState(4); // Latest week user can access (4 weeks forward)
  const [startDateState, setStartDateState] = useState<Date | null>(null);
  const [resetsState, setResetsState] = useState<any>({});

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    unsubscribe = onSnapshot(userDoc, (userSnap) => {
      if (!userSnap.exists()) return;
      const data = userSnap.data();
      let resets = data.resets || {};
      let createdAt = data.createdAt;
      if (!createdAt) return;
      const startDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      setStartDateState(startDate);
      setResetsState(resets);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!startDateState) return;
    // chart calculation logic moved here, using resetsState and startDateState
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    const startWeekStart = getWeekStart(startDateState);
    const diffWeeks = Math.floor((currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    setMinWeekOffset(-diffWeeks);
    // maxWeekOffset is 4 (4 weeks forward)
    // Calculate weekStart for selected week
    const weekStart = new Date(currentWeekStart.getTime() + selectedWeekOffset * 7 * 24 * 60 * 60 * 1000);
    let dataArr = [];
    let colorsArr = [];
    let labelsArr = [];
    for (let i = 0; i < 7; i++) {
      // If future week, show empty
      if (selectedWeekOffset > 0) {
        dataArr.push(0);
        colorsArr.push('transparent');
        labelsArr.push('');
        continue;
      }
      const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      d.setHours(0,0,0,0);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      // Don't show days before startDate
      if (d < startDateState) {
        dataArr.push(0);
        colorsArr.push('transparent');
        labelsArr.push('');
        continue;
      }
      // Don't show future days (only for current week)
      const now = new Date();
      now.setHours(0,0,0,0);
      if (selectedWeekOffset === 0 && d > now) {
        dataArr.push(0);
        colorsArr.push('transparent');
        labelsArr.push('');
        continue;
      }
      // For any day: if resets > 0, show negative red bar
      if (resetsState[key] && resetsState[key] > 0) {
        dataArr.push(-resetsState[key]);
        colorsArr.push('#FF4444');
        labelsArr.push(`${resetsState[key]}`);
        continue;
      }
      // Otherwise, show green streak bar
      // Calculate streak for this week only, with n=0 at startDate, n=n+1 for each day with no reset, n=0 for next day after reset
      let weekStreak = 0;
      let lastReset = false;
      for (let j = 0; j <= i; j++) {
        const prevD = new Date(weekStart.getTime() + j * 24 * 60 * 60 * 1000);
        prevD.setHours(0,0,0,0);
        const prevY = prevD.getFullYear();
        const prevM = String(prevD.getMonth() + 1).padStart(2, '0');
        const prevDay = String(prevD.getDate()).padStart(2, '0');
        const prevKey = `${prevY}-${prevM}-${prevDay}`;
        if (prevD < startDateState) {
          weekStreak = 0;
          lastReset = false;
          continue;
        }
        if (j === 0 && prevD.getTime() === startDateState.getTime()) {
          weekStreak = 0;
          lastReset = resetsState[prevKey] && resetsState[prevKey] > 0;
          continue;
        }
        if (resetsState[prevKey] && resetsState[prevKey] > 0) {
          weekStreak = 0;
          lastReset = true;
        } else {
          weekStreak = lastReset ? 1 : weekStreak + 1;
          lastReset = false;
        }
      }
      dataArr.push(weekStreak);
      colorsArr.push('#00FF8B');
      labelsArr.push(weekStreak > 0 ? `${weekStreak}` : '');
    }
    setChartData({
      labels: hebrewDaysReversed,
      datasets: [{ data: dataArr.slice().reverse() }],
    });
    setBarColors(colorsArr.slice().reverse());
    setBarLabels(labelsArr.slice().reverse());
    setLoading(false);
  }, [selectedWeekOffset, resetsState, startDateState]);

  // Custom render for value labels above/below bars
  const renderValueLabels = ({ x, y, width, height, index, value }: any) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <Text
        key={`label-${index}`}
        style={{
          position: 'absolute',
          left: x + width / 2 - 10,
          top: isPositive ? y - 24 : y + height + 4,
          color: isPositive ? '#00FF8B' : '#FF4444',
          fontWeight: 'bold',
          fontSize: 16,
          textShadowColor: '#222',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {value > 0 ? `+${value}` : value}
      </Text>
    );
  };

  return (
    <BackgroundImage>
      <Text style={[styles.title, { marginTop: 48, textAlign: 'center', alignSelf: 'center' }]}>התהליך שלך</Text>
      {/* Week navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => setSelectedWeekOffset((w) => Math.min(w + 1, maxWeekOffset))}
          disabled={selectedWeekOffset >= maxWeekOffset}
          style={{ opacity: selectedWeekOffset >= maxWeekOffset ? 0.3 : 1, padding: 8 }}
        >
          <Text style={{ color: '#fff', fontSize: 22 }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 16, marginHorizontal: 16 }}>
          {'שבוע '}
          {selectedWeekOffset === 0
            ? 'נוכחי'
            : selectedWeekOffset > 0
              ? `+${selectedWeekOffset}`
              : selectedWeekOffset}
          {selectedWeekOffset > 0 && (() => {
            const today = new Date();
            const currentWeekStart = getWeekStart(today);
            const weekStart = new Date(currentWeekStart.getTime() + selectedWeekOffset * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const startStr = `${pad(weekStart.getDate())}/${pad(weekStart.getMonth() + 1)}`;
            const endStr = `${pad(weekEnd.getDate())}/${pad(weekEnd.getMonth() + 1)}`;
            return ` (${startStr} - ${endStr})`;
          })()}
        </Text>
        <TouchableOpacity
          onPress={() => setSelectedWeekOffset((w) => Math.max(w - 1, minWeekOffset))}
          disabled={selectedWeekOffset <= minWeekOffset}
          style={{ opacity: selectedWeekOffset <= minWeekOffset ? 0.3 : 1, padding: 8 }}
        >
          <Text style={{ color: '#fff', fontSize: 22 }}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {loading ? (
          <Text style={styles.loading}>טוען נתונים...</Text>
        ) : (
          <View style={{ flexDirection: 'row', width: screenWidth - 32, alignItems: 'center', alignSelf: 'center', marginTop: 24 }}>
            {/* Y-axis labels */}
            <View style={{ width: 32, height: 340, justifyContent: 'space-between', alignItems: 'flex-end', paddingVertical: 8 }}>
              {Array.from({ length: 15 }, (_, i) => 7 - i).map((num) => (
                <Text key={num} style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', opacity: num === 0 ? 1 : 0.7 }}>{num}</Text>
              ))}
            </View>
            {/* Chart area */}
            <View style={{ flex: 1, height: 340, justifyContent: 'center', position: 'relative' }}>
              {/* Zero line */}
              <Svg height="340" width="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
                <Line x1="0" y1={170} x2={screenWidth - 64} y2={170} stroke="#fff" strokeWidth="2" opacity="0.7" />
              </Svg>
              {/* Bars and labels */}
              {chartData.datasets[0].data.map((value, index) => {
                const barWidth = ((screenWidth - 32 - 32) / 7) * 0.6;
                const gap = ((screenWidth - 32 - 32) / 7) * 0.4;
                const x = index * (barWidth + gap) + gap / 2;
                const zeroY = 170;
                const maxBarHeight = 140;
                const barHeight = Math.abs(value) * (maxBarHeight / 7);
                const barY = value > 0 ? zeroY - barHeight : zeroY;
                return (
                  <React.Fragment key={`bar-label-${index}`}>
                    <View
                      style={{
                        position: 'absolute',
                        left: x,
                        top: barY,
                        width: barWidth,
                        height: barHeight,
                        borderRadius: 8,
                        backgroundColor: barColors[index],
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 2,
                        zIndex: 2,
                      }}
                    />
                    {/* Show label for green bars (streak) or red for today resets */}
                    {value !== 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          left: x,
                          top: value > 0 ? barY - 24 : barY + barHeight + 4,
                          width: barWidth,
                          alignItems: 'center',
                          zIndex: 3,
                        }}
                      >
                        <Text
                          style={{
                            color: barColors[index] === '#FF4444' ? '#FF4444' : '#00FF8B',
                            fontWeight: 'bold',
                            fontSize: 16,
                            textShadowColor: '#222',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}
                        >
                          {barLabels[index]}
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
              {/* X-axis labels */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', position: 'absolute', top: 170 + 12, left: 0, zIndex: 4 }}>
                {chartData.labels.map((label, index) => {
                  return (
                    <Text
                      key={`x-label-${index}`}
                      style={{
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        flex: 1,
                      }}
                    >
                      {label}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>
        )}
        {/* Remove axisLabels and xLabel */}
        {/* Add new outlined text block below the chart */}
        <View style={{
          borderWidth: 2,
          borderColor: '#E48BFF', // Pink outline (same as reset screen)
          borderRadius: 16,
          padding: 16,
          marginTop: 32,
          marginHorizontal: 8,
          backgroundColor: 'rgba(255,255,255,0.04)',
          alignItems: 'center',
          width: '100%',
          maxWidth: screenWidth - 32,
          alignSelf: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 15, textAlign: 'right', marginBottom: 8, width: '100%' }}>
            .בטבלה זו תראה את ההתקדמות שלך בדרכך{"\n"}
            בכל יום שתמנע מעצמך ליפול להתמכרות תראה התקדמות, אך אם תיפול שוב, ההתקדמות תתאפס ותציג את הכמות שנפלתם לאינסטינקט באותו יום.
          </Text>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
            בוא נתמיד מהיום!
          </Text>
        </View>
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
  },
  loading: {
    color: '#fff',
    fontSize: 18,
    marginTop: 40,
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  axisLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  xLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
}); 