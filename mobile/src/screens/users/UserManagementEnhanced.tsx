import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import { User, UserRole, Proyecto } from '../../types';
import { COLORS, ROLES } from '../../constants/config';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

const UserManagementEnhanced = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<UserRole>('jefe en frente');
  const [selectedProyectos, setSelectedProyectos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const roles: UserRole[] = ['admin', 'supervisor', 'jefe en frente'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usuariosData, proyectosData] = await Promise.all([
        ApiService.getUsuarios(),
        ApiService.getProyectos(),
      ]);
      setUsuarios(usuariosData);
      setProyectos(proyectosData.filter(p => p.activo));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setNombre(user.nombre);
      setEmail(user.email);
      setRol(user.rol);
      setSelectedProyectos(user.proyectos);
      setPassword('');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('jefe en frente');
    setSelectedProyectos([]);
  };

  const toggleProyecto = (proyectoId: string) => {
    if (selectedProyectos.includes(proyectoId)) {
      setSelectedProyectos(selectedProyectos.filter(id => id !== proyectoId));
    } else {
      setSelectedProyectos([...selectedProyectos, proyectoId]);
    }
  };

  const handleSave = async () => {
    if (!nombre || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (!editingUser && !password) {
      Alert.alert('Error', 'La contraseña es requerida para nuevos usuarios');
      return;
    }

    setSaving(true);
    try {
      const userData: any = {
        nombre,
        email: email.toLowerCase().trim(),
        rol,
        proyectos: selectedProyectos,
      };

      if (password) {
        userData.password = password;
      }

      if (editingUser) {
        await ApiService.updateUsuario(editingUser._id, userData);
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        await ApiService.createUsuario(userData);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }

      setModalVisible(false);
      loadData();
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de eliminar al usuario ${user.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteUsuario(user._id);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  const getRolColor = (rol: UserRole) => {
    switch (rol) {
      case 'admin':
        return COLORS.danger;
      case 'supervisor':
        return COLORS.warning;
      default:
        return COLORS.info;
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card>
      <View style={styles.userHeader}>
        <View style={styles.flex1}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRolColor(item.rol) }]}>
            <Text style={styles.roleText}>{item.rol}</Text>
          </View>
          <Text style={styles.userDetail}>
            Proyectos: {item.proyectos.length}
          </Text>
        </View>
        {currentUser?.rol === 'admin' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openModal(item)}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay usuarios registrados</Text>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>

              <Input
                label="Nombre Completo"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Juan Pérez"
                required
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Input
                label={editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                required={!editingUser}
              />

              <Text style={styles.label}>Rol *</Text>
              <View style={styles.roleGrid}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleButton,
                      rol === r && styles.roleButtonSelected,
                    ]}
                    onPress={() => setRol(r)}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        rol === r && styles.roleButtonTextSelected,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Proyectos Asignados</Text>
              <View style={styles.proyectosList}>
                {proyectos.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    style={[
                      styles.proyectoItem,
                      selectedProyectos.includes(p._id) && styles.proyectoItemSelected,
                    ]}
                    onPress={() => toggleProyecto(p._id)}
                  >
                    <Text
                      style={[
                        styles.proyectoText,
                        selectedProyectos.includes(p._id) && styles.proyectoTextSelected,
                      ]}
                    >
                      {p.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title={editingUser ? 'Actualizar' : 'Crear'}
                  onPress={handleSave}
                  loading={saving}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userDetail: {
    fontSize: 12,
    color: COLORS.gray,
  },
  actions: {
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  roleGrid: {
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  roleButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  proyectosList: {
    gap: 8,
    marginBottom: 16,
  },
  proyectoItem: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  proyectoItemSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  proyectoText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  proyectoTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default UserManagementEnhanced;
