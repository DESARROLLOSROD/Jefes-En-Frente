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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, ROLES } from '../../constants/config';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface MenuOption {
  title: string;
  description: string;
  icon: string;
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
      icon: '📝',
      onPress: () => navigation.navigate('ReportForm', {}),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.JEFE_EN_FRENTE],
    },
    {
      title: 'Mis Reportes',
      description: 'Ver reportes creados',
      icon: '📋',
      onPress: () => navigation.navigate('ReportList'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.JEFE_EN_FRENTE],
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      onPress: () => navigation.navigate('UserManagement'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR],
    },
    {
      title: 'Gestión de Vehículos',
      description: 'Administrar flota de vehículos',
      icon: '🚗',
      onPress: () => navigation.navigate('VehicleManagement'),
      allowedRoles: [ROLES.ADMIN, ROLES.SUPERVISOR],
    },
    {
      title: 'Gestión de Proyectos',
      description: 'Administrar proyectos mineros',
      icon: '🏗️',
      onPress: () => navigation.navigate('ProjectManagement'),
      allowedRoles: [ROLES.ADMIN],
    },
    {
      title: 'Zonas de Trabajo',
      description: 'Administrar zonas y secciones',
      icon: '📍',
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
    >
      <Text style={styles.menuIcon}>{option.icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{option.title}</Text>
        <Text style={styles.menuDescription}>{option.description}</Text>
      </View>
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
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  projectInfo: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  projectLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  menuContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: COLORS.secondary,
  },
});

export default DashboardScreen;
