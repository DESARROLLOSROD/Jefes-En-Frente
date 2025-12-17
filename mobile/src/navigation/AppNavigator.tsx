import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ProjectSelectionScreen from '../screens/projects/ProjectSelectionScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ReportFormWebStyle from '../screens/reports/ReportFormWebStyle';
import ReportListScreen from '../screens/reports/ReportListScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';
import UserManagementScreen from '../screens/users/UserManagementEnhanced';
import VehicleManagementScreen from '../screens/vehicles/VehicleManagementEnhanced';
import ProjectManagementScreen from '../screens/projects/ProjectManagementScreen';
import WorkZoneManagementScreen from '../screens/workzones/WorkZoneManagementEnhanced';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { Proyecto } from '../types';

export type RootStackParamList = {
  Login: undefined;
  ProjectSelection: undefined;
  ProjectDetail: { proyecto: Proyecto };
  Dashboard: undefined;
  ReportForm: { reportId?: string };
  ReportList: undefined;
  ReportDetail: { reportId: string };
  UserManagement: undefined;
  VehicleManagement: undefined;
  ProjectManagement: undefined;
  WorkZoneManagement: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, selectedProject } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="root"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : !selectedProject ? (
          <>
            <Stack.Screen
              name="ProjectSelection"
              component={ProjectSelectionScreen}
              options={{ title: 'Seleccionar Proyecto', headerLeft: () => null }}
            />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ title: 'Detalle del Proyecto' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Jefes en Frente', headerLeft: () => null }}
            />
            <Stack.Screen
              name="ReportForm"
              component={ReportFormWebStyle}
              options={{ title: 'Crear Reporte' }}
            />
            <Stack.Screen
              name="ReportList"
              component={ReportListScreen}
              options={{ title: 'Mis Reportes' }}
            />
            <Stack.Screen
              name="ReportDetail"
              component={ReportDetailScreen}
              options={{ title: 'Detalle de Reporte' }}
            />
            <Stack.Screen
              name="UserManagement"
              component={UserManagementScreen}
              options={{ title: 'Gestión de Usuarios' }}
            />
            <Stack.Screen
              name="VehicleManagement"
              component={VehicleManagementScreen}
              options={{ title: 'Gestión de Vehículos' }}
            />
            <Stack.Screen
              name="ProjectManagement"
              component={ProjectManagementScreen}
              options={{ title: 'Gestión de Proyectos' }}
            />
            <Stack.Screen
              name="WorkZoneManagement"
              component={WorkZoneManagementScreen}
              options={{ title: 'Gestión de Zonas' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Configuración' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
