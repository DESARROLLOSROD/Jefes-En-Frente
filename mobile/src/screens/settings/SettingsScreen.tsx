import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          onPress: logout,
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Perfil del usuario */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={[styles.avatarText, { color: theme.white }]}>
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {user?.nombre}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {user?.email}
              </Text>
              <Text style={[styles.userRole, { color: theme.primary }]}>
                {user?.rol}
              </Text>
            </View>
          </View>
        </View>

        {/* Configuración de Apariencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Apariencia
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.text }]}>
                    Modo Oscuro
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {isDark ? 'Tema oscuro activado' : 'Tema claro activado'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.inputBorder, true: theme.primary }}
                thumbColor={theme.white}
              />
            </View>
          </View>
        </View>

        {/* Información de la App */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Acerca de
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Versión
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                1.0.0
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Aplicación
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                Jefes en Frente
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.danger }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.white} />
          <Text style={[styles.logoutText, { color: theme.white }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Sistema de Reportes Mineros
          </Text>
          <Text style={[styles.footerText, { color: theme.textDisabled }]}>
            © 2025 Jefes en Frente
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default SettingsScreen;
