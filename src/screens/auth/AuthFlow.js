import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/UIComponents';
import { useAuth } from '../../hooks/useAuth';

function friendlyError(error) {
  const code = error?.code ?? '';

  if (code.includes('invalid-credential')) {
    return 'The email or password is incorrect.';
  }

  if (code.includes('email-already-in-use') || code.includes('credential-already-in-use')) {
    return 'An account already uses this email. Try logging in instead.';
  }

  if (code.includes('weak-password')) {
    return 'Use a password with at least 6 characters.';
  }

  if (code.includes('invalid-email')) {
    return 'Enter a valid email address.';
  }

  if (code.includes('operation-not-allowed')) {
    return 'Email/password login must be enabled in the Firebase console.';
  }

  if (code.includes('network-request-failed')) {
    return 'Check your internet connection and try again.';
  }

  return error?.message ?? 'Something went wrong. Please try again.';
}

export default function AuthFlow() {
  const { login, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requestIsRunning, setRequestIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isLoginMode = mode === 'login';
  const heading = isLoginMode ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT';
  const title = isLoginMode ? 'Log in' : 'Sign up';
  const submitLabel = requestIsRunning
    ? 'Please wait…'
    : (isLoginMode ? 'Log in' : 'Create account');
  const switchModeLabel = isLoginMode
    ? 'New to DisasterBuddy? Sign up'
    : 'Already have an account? Log in';

  function validateForm() {
    if (!email.trim() || !password) {
      return 'Enter your email and password.';
    }

    if (!isLoginMode && !displayName.trim()) {
      return 'Enter the name you would like DisasterBuddy to use.';
    }

    if (!isLoginMode && password.length < 6) {
      return 'Your password must be at least 6 characters.';
    }

    if (!isLoginMode && password !== confirmPassword) {
      return 'The passwords do not match.';
    }

    return '';
  }

  const submit = async () => {
    setErrorMessage('');
    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setRequestIsRunning(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signUp(displayName, email, password);
      }
    } catch (error) {
      setErrorMessage(friendlyError(error));
    } finally {
      setRequestIsRunning(false);
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Enter your email first, then tap “Forgot password?”.');
      return;
    }

    setRequestIsRunning(true);
    setErrorMessage('');

    try {
      await resetPassword(email);
      Alert.alert('Reset email sent', 'Check your inbox for a link to reset your password.');
    } catch (error) {
      setErrorMessage(friendlyError(error));
    } finally {
      setRequestIsRunning(false);
    }
  };

  const switchMode = () => {
    setMode((currentMode) => (currentMode === 'login' ? 'signup' : 'login'));
    setErrorMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={local.safeArea}>
      <KeyboardAvoidingView style={local.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={local.page}>
          <View><Text style={local.brand}>DisasterBuddy</Text><Text style={local.tagline}>Prepare today. Respond with confidence.</Text></View>
          <View style={local.card}>
            <Text style={local.eyebrow}>{heading}</Text>
            <Text style={local.title}>{title}</Text>
            {!isLoginMode && <Field label="Your name" value={displayName} onChangeText={setDisplayName} autoCapitalize="words" placeholder="e.g. Cliff" />}
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="name@gmail.com" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={isLoginMode ? 'current-password' : 'new-password'} placeholder="At least 6 characters" />
            {!isLoginMode && <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" placeholder="Re-enter your password" />}
            {errorMessage ? <Text accessibilityRole="alert" style={local.error}>{errorMessage}</Text> : null}
            {isLoginMode && <Pressable accessibilityRole="button" accessibilityLabel="Forgot password?" accessibilityState={{ disabled: requestIsRunning }} disabled={requestIsRunning} onPress={forgotPassword} style={local.textAction}><Text style={local.linkRight}>Forgot password?</Text></Pressable>}
            <AppButton disabled={requestIsRunning} label={submitLabel} onPress={submit} />
            <Pressable accessibilityRole="button" accessibilityLabel={switchModeLabel} accessibilityState={{ disabled: requestIsRunning }} disabled={requestIsRunning} onPress={switchMode} style={local.textAction}><Text style={local.switch}>{switchModeLabel}</Text></Pressable>
          </View>
          <Text style={local.privacy}>Your preparedness details are stored under your private Firebase account.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }) {
  return <View style={local.field}><Text style={local.label}>{label}</Text><TextInput accessibilityLabel={label} style={local.input} placeholderTextColor="#8B9991" {...props} /></View>;
}

const local = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: '#F4F7F5' },
  page: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24 },
  brand: { color: '#173A2A', fontSize: 30, fontWeight: '900' }, tagline: { color: '#64736A', marginTop: 5 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#DFE7E1', padding: 20, gap: 14 },
  eyebrow: { color: '#2E7D58', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }, title: { color: '#17211C', fontSize: 26, fontWeight: '900' },
  field: { gap: 6 }, label: { color: '#405047', fontSize: 13, fontWeight: '800' },
  input: { backgroundColor: '#F5F7F6', borderRadius: 12, borderWidth: 1, borderColor: '#DCE4DE', paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#17211C' },
  textAction: { minHeight: 44, justifyContent: 'center' },
  error: { color: '#A33D3D', backgroundColor: '#FCE7E7', borderRadius: 10, padding: 10, lineHeight: 19 },
  linkRight: { color: '#2E7D58', fontWeight: '800', textAlign: 'right' }, switch: { color: '#2E7D58', textAlign: 'center', fontWeight: '800', paddingVertical: 4 },
  privacy: { color: '#77837C', textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
