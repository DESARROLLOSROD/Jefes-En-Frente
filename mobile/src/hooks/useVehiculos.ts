import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';
import { Vehiculo } from '../types';
import { showErrorAlert } from '../utils/errorHandler';
import { Alert } from 'react-native';

// Hook para obtener todos los vehículos
export const useVehiculos = () => {
  return useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => ApiService.getVehiculos(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener vehículos por proyecto
export const useVehiculosByProyecto = (proyectoId?: string) => {
  return useQuery({
    queryKey: ['vehiculos', 'proyecto', proyectoId],
    queryFn: () => ApiService.getVehiculosByProyecto(proyectoId!),
    staleTime: 10 * 60 * 1000,
    enabled: !!proyectoId,
  });
};

// Hook para crear vehículo
export const useCreateVehiculo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehiculo: Partial<Vehiculo>) => ApiService.createVehiculo(vehiculo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      Alert.alert('Éxito', 'Vehículo creado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al crear el vehículo');
    },
  });
};

// Hook para actualizar vehículo
export const useUpdateVehiculo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vehiculo }: { id: string; vehiculo: Partial<Vehiculo> }) =>
      ApiService.updateVehiculo(id, vehiculo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      Alert.alert('Éxito', 'Vehículo actualizado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al actualizar el vehículo');
    },
  });
};

// Hook para eliminar vehículo
export const useDeleteVehiculo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehiculoId: string) => ApiService.deleteVehiculo(vehiculoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      Alert.alert('Éxito', 'Vehículo eliminado exitosamente');
    },
    onError: (error: any) => {
      showErrorAlert(error, 'Error al eliminar el vehículo');
    },
  });
};
