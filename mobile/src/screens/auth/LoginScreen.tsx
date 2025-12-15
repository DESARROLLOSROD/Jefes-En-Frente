import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  const [isLoading, setIsLoading] = useState(false);
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
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
    } catch (error: any) {
      showErrorAlert(error, 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Jefes en Frente</Text>
          <Text style={styles.subtitle}>Sistema de Reportes Mineros</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            required
            icon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            secureTextEntry
            editable={!isLoading}
            required
            icon="lock-closed-outline"
            error={errors.password}
            helperText="Mínimo 6 caracteres"
          />

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            icon="log-in-outline"
            fullWidth
            size="large"
            style={styles.loginButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
