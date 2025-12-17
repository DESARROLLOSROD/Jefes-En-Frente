import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';
import { Proyecto } from '../types';
import { showErrorAlert } from '../utils/errorHandler';
import { Alert } from 'react-native';

// Hook para obtener todos los proyectos
export const useProyectos = () => {
  return useQuery({
    queryKey: ['proyectos'],
    queryFn: () => ApiService.getProyectos(),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener un proyecto específico
export const useProyecto = (proyectoId: string) => {
  return useQuery({
    queryKey: ['proyectos', proyectoId],
    queryFn: () => ApiService.getProyectoById(proyectoId),
    staleTime: 10 * 60 * 1000,
    enabled: !!proyectoId,
  });
};

// Hook para crear proyecto
export const useCreateProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proyecto: Partial<Proyecto>) => ApiService.createProyecto(proyecto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      Alert.alert('Éxito', 'Proyecto creado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al crear el proyecto');
    },
  });
};

// Hook para actualizar proyecto
export const useUpdateProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, proyecto }: { id: string; proyecto: Partial<Proyecto> }) =>
      ApiService.updateProyecto(id, proyecto),
    onSuccess: (data) => {
      queryClient.setQueryData(['proyectos', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      Alert.alert('Éxito', 'Proyecto actualizado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al actualizar el proyecto');
    },
  });
};

// Hook para eliminar proyecto
export const useDeleteProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proyectoId: string) => ApiService.deleteProyecto(proyectoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      Alert.alert('Éxito', 'Proyecto eliminado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al eliminar el proyecto');
    },
  });
};
