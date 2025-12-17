import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';
import { User } from '../types';
import { showErrorAlert } from '../utils/errorHandler';
import { Alert } from 'react-native';

// Hook para obtener todos los usuarios
export const useUsuarios = () => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: () => ApiService.getUsuarios(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un usuario específico
export const useUsuario = (usuarioId: string) => {
  return useQuery({
    queryKey: ['usuarios', usuarioId],
    queryFn: () => ApiService.getUsuarioById(usuarioId),
    staleTime: 5 * 60 * 1000,
    enabled: !!usuarioId,
  });
};

// Hook para crear usuario
export const useCreateUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuario: Partial<User> & { password: string }) => ApiService.createUsuario(usuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      Alert.alert('Éxito', 'Usuario creado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al crear el usuario');
    },
  });
};

// Hook para actualizar usuario
export const useUpdateUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, usuario }: { id: string; usuario: Partial<User> }) =>
      ApiService.updateUsuario(id, usuario),
    onSuccess: (data) => {
      queryClient.setQueryData(['usuarios', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      Alert.alert('Éxito', 'Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al actualizar el usuario');
    },
  });
};

// Hook para eliminar usuario
export const useDeleteUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: string) => ApiService.deleteUsuario(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      Alert.alert('Éxito', 'Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al eliminar el usuario');
    },
  });
};
