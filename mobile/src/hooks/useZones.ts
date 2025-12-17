import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';
import { WorkZone } from '../types';
import { showErrorAlert } from '../utils/errorHandler';
import { Alert } from 'react-native';

// Hook para obtener zonas por proyecto
export const useZonesByProject = (projectId?: string) => {
  return useQuery({
    queryKey: ['zones', 'project', projectId],
    queryFn: () => ApiService.getZonesByProject(projectId!),
    staleTime: 10 * 60 * 1000,
    enabled: !!projectId,
  });
};

// Hook para obtener una zona específica
export const useZone = (zoneId: string) => {
  return useQuery({
    queryKey: ['zones', zoneId],
    queryFn: () => ApiService.getZoneById(zoneId),
    staleTime: 10 * 60 * 1000,
    enabled: !!zoneId,
  });
};

// Hook para crear zona
export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zone: Partial<WorkZone>) => ApiService.createZone(zone),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['zones', 'project', data.projectId] });
      Alert.alert('Éxito', 'Zona creada exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al crear la zona');
    },
  });
};

// Hook para actualizar zona
export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, zone }: { zoneId: string; zone: Partial<WorkZone> }) =>
      ApiService.updateZone(zoneId, zone),
    onSuccess: (data) => {
      queryClient.setQueryData(['zones', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['zones', 'project'] });
      Alert.alert('Éxito', 'Zona actualizada exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al actualizar la zona');
    },
  });
};

// Hook para eliminar zona
export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => ApiService.deleteZone(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      Alert.alert('Éxito', 'Zona eliminada exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al eliminar la zona');
    },
  });
};

// Hook para agregar sección a zona
export const useAddSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, section }: { zoneId: string; section: any }) =>
      ApiService.addSection(zoneId, section),
    onSuccess: (data) => {
      queryClient.setQueryData(['zones', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      Alert.alert('Éxito', 'Sección agregada exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al agregar la sección');
    },
  });
};

// Hook para actualizar sección
export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, sectionId, section }: { zoneId: string; sectionId: string; section: any }) =>
      ApiService.updateSection(zoneId, sectionId, section),
    onSuccess: (data) => {
      queryClient.setQueryData(['zones', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      Alert.alert('Éxito', 'Sección actualizada exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al actualizar la sección');
    },
  });
};

// Hook para eliminar sección
export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, sectionId }: { zoneId: string; sectionId: string }) =>
      ApiService.deleteSection(zoneId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      Alert.alert('Éxito', 'Sección eliminada exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al eliminar la sección');
    },
  });
};
