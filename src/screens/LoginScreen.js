// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';

const COLORS = {
  espresso: '#1A0A00', mocha: '#6B3A1F', latte: '#C49A6C',
  cream: '#F5EDD8', foam: '#FFF8EE', white: '#FFFFFF', muted: '#999',
};

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, sendPhoneOtp, verifyPhoneOtp, signInWithGoogle, signInWithApple } = useAuth();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) return Alert.alert('Missing info', 'Please enter email and password.');
    setLoading(true);
    const { error } = isSignUp
      ? await signUpWithEmail(email, password, fullName)
      : await signInWithEmail(email, password);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else if (isSignUp) Alert.alert('Check your email', 'Confirm your email to finish signing up.');
  };

  const handleSendOtp = async () => {
    if (!phone) return Alert.alert('Missing info', 'Please enter your phone number.');
    setLoading(true);
    const { error } = await sendPhoneOtp(phone);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert('Missing info', 'Enter the code sent to your phone.');
    setLoading(true);
    const { error } = await verifyPhoneOtp(phone, otp);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) Alert.alert('Google sign-in failed', error.message);
  };

  const handleApple = async () => {
    setLoading(true);
    const { error } = await signInWithApple();
    setLoading(false);
    if (error) Alert.alert('Apple sign-in failed', error.message);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.logo}>☕ BrewHouse</Text>
          <Text style={styles.subtitle}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>

          {/* Mode toggle */}
          <View style={styles.modeRow}>
            <TouchableOpacity style={[styles.modeBtn, mode === 'email' && styles.modeBtnActive]} onPress={() => setMode('email')}>
              <Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeBtn, mode === 'phone' && styles.modeBtnActive]} onPress={() => setMode('phone')}>
              <Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>Phone</Text>
            </TouchableOpacity>
          </View>

          {mode === 'email' ? (
            <>
              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.muted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailAuth} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : (
                  <Text style={styles.primaryBtnText}>{isSignUp ? 'Sign up' : 'Log in'}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchText}>
                  {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="+1 555 123 4567"
                placeholderTextColor={COLORS.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!otpSent}
              />
              {otpSent && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                />
              )}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={COLORS.white} /> : (
                  <Text style={styles.primaryBtnText}>{otpSent ? 'Verify code' : 'Send code'}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogle} disabled={loading}>
            <Text style={styles.socialBtnText}>🔵 Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.socialBtn} onPress={handleApple} disabled={loading}>
              <Text style={styles.socialBtnText}>🍎 Continue with Apple</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.espresso },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 32, fontWeight: '600', color: COLORS.latte, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 28 },
  modeRow: { flexDirection: 'row', backgroundColor: '#2a1500', borderRadius: 12, padding: 4, marginBottom: 20 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  modeBtnActive: { backgroundColor: COLORS.mocha },
  modeText: { color: '#888', fontSize: 13, fontWeight: '500' },
  modeTextActive: { color: COLORS.white },
  input: {
    backgroundColor: COLORS.foam, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: COLORS.espresso, marginBottom: 12,
  },
  primaryBtn: { backgroundColor: COLORS.latte, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: COLORS.espresso, fontSize: 15, fontWeight: '600' },
  switchText: { color: COLORS.latte, fontSize: 13, textAlign: 'center', marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#3a2510' },
  dividerText: { color: '#888', fontSize: 12, marginHorizontal: 10 },
  socialBtn: {
    backgroundColor: '#2a1500', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: '#3a2510',
  },
  socialBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
});
