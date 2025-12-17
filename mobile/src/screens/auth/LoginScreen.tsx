import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/config';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { showErrorAlert } from '../../utils/errorHandler';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { login } = useAuth();

  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingresa un email válido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
    } catch (error: any) {
      showErrorAlert(error, 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../../assets/icon.png')} style={styles.backgroundImage}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🏗️</Text>
            <Text style={styles.title}>JEFES EN FRENTE</Text>
            <Text style={styles.subtitle}>SISTEMA INTEGRAL DE REPORTES MINEROS</Text>
          </View>

          <Input
            variant="login"
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            error={errors.email}
            containerStyle={styles.firstInput}
          />
          <Input
            variant="login"
            placeholder="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            secureTextEntry
            editable={!loading}
            error={errors.password}
            containerStyle={styles.lastInput}
          />

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            variant="orange"
            fullWidth
            uppercase
            style={styles.button}
          />

          <Text style={styles.footerText}>© 2024 DESARROLLOS ROD</Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.dark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  firstInput: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  lastInput: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    color: '#d1d5db',
    fontSize: 10,
    marginTop: 24,
  },
});

export default LoginScreen;
