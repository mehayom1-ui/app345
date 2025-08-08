import type { Auth } from 'firebase/auth';
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackgroundImage from '../components/ui/BackgroundImage';
import { auth, db } from '../services/firebase';
const typedAuth: Auth = auth;

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(typedAuth, email, password);
      if (!userCredential.user.emailVerified) {
        alert('Please verify your email before logging in.');
        setShowResend(true);
        setPendingUser(userCredential.user);
        return;
      }
      // Update Firestore with latest emailVerified status
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        emailVerified: userCredential.user.emailVerified,
      });
      navigation.replace('Main');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleResendVerification = async () => {
    if (pendingUser) {
      await sendEmailVerification(pendingUser);
      alert('Verification email resent. Please check your inbox.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address above first.');
      return;
    }
    try {
      await sendPasswordResetEmail(typedAuth, email);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <BackgroundImage>
      <View style={styles.centeredContent}>
        <Text style={styles.inputLabel}>הכנס כתובת מייל:</Text>
        <TextInput style={styles.input} onChangeText={setEmail} placeholder="הכנס כתובת מייל" placeholderTextColor="#aaa" />
        <Text style={styles.inputLabel}>הכנס סיסמה:</Text>
        <TextInput style={styles.input} secureTextEntry onChangeText={setPassword} placeholder="הכנס סיסמה" placeholderTextColor="#aaa" />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.imageButton} onPress={handleLogin}>
            <Image source={require('../assets/images/login.png')} style={styles.buttonImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={() => navigation.navigate('Register')}>
            <Image source={require('../assets/images/register.png')} style={styles.buttonImage} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
          <Text style={styles.forgotButtonText}>שכחת סיסמה?</Text>
        </TouchableOpacity>
        {showResend && (
          <Button title="Resend Verification Email" onPress={handleResendVerification} color="#e63946" />
        )}
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
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'flex-end', // align label to the right
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    gap: 16,
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
  },
  buttonImage: {
    width: 140,
    height: 48,
    resizeMode: 'contain',
  },
  forgotButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  forgotButtonText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'none',
  },
}); 