import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, ROLES } from '../../constants/config';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface MenuOption {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress: () => void;
  allowedRoles: string[];
}

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user, selectedProject, logout } = useAuth();

  const isAdmin = user?.rol === ROLES.ADMIN;
  const isSupervisor = user?.rol === ROLES.SUPERVISOR;
  const isOperator = user?.rol === ROLES.JEFE_EN_FRENTE;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const menuOptions: MenuOption[] = [
    {
      title: 'Crear Reporte',
      description: 'Registrar actividades diarias',
      icon: 'document-text',
      iconColor: COLORS.primary,
      onPress: () => navigation.navigate('ReportForm', {}),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.JEFE_EN_FRENTE],
    },
    {
      title: 'Mis Reportes',
      description: 'Ver reportes creados',
      icon: 'list',
      iconColor: COLORS.success,
      onPress: () => navigation.navigate('ReportList'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.JEFE_EN_FRENTE],
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: 'people',
      iconColor: COLORS.warning,
      onPress: () => navigation.navigate('UserManagement'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR],
    },
    {
      title: 'Gestión de Vehículos',
      description: 'Administrar flota de vehículos',
      icon: 'car',
      iconColor: COLORS.info,
      onPress: () => navigation.navigate('VehicleManagement'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR],
    },
    {
      title: 'Gestión de Proyectos',
      description: 'Administrar proyectos mineros',
      icon: 'construct',
      iconColor: COLORS.danger,
      onPress: () => navigation.navigate('ProjectManagement'),
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: 'Zonas de Trabajo',
      description: 'Administrar zonas y secciones',
      icon: 'location',
      iconColor: '#8b5cf6',
      onPress: () => navigation.navigate('WorkZoneManagement'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR],
    },
  ];

  const filteredOptions = menuOptions.filter((option) =>
    option.allowedRoles.includes(user?.rol || '')
  );

  const renderMenuOption = (option: MenuOption) => (
    <TouchableOpacity
      key={option.title}
      style={styles.menuCard}
      onPress={option.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${option.iconColor}15` }]}>
        <Ionicons name={option.icon} size={28} color={option.iconColor || COLORS.primary} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{option.title}</Text>
        <Text style={styles.menuDescription}>{option.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bienvenido,</Text>
            <Text style={styles.userName}>{user?.nombre}</Text>
            <Text style={styles.userRole}>{user?.rol}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.white} />
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectInfo}>
          <Text style={styles.projectLabel}>Proyecto Actual:</Text>
          <Text style={styles.projectName}>{selectedProject?.nombre}</Text>
          <Text style={styles.projectLocation}>{selectedProject?.ubicacion}</Text>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Menú Principal</Text>
          {filteredOptions.map(renderMenuOption)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryDark, // Blue 900
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#bfdbfe', // blue-200
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  userRole: {
    fontSize: 13,
    color: '#93c5fd', // blue-300
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red 500 with opacity
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  projectInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primaryDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  projectLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  menuContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: COLORS.secondary,
    lineHeight: 18,
  },
});

export default DashboardScreen;
