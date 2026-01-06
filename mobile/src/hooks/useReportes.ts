import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';
import { ReporteActividades } from '../types';
import toast, { handleApiError } from '../utils/toast';

// Hook para obtener reportes
export const useReportes = (proyectoId?: string) => {
  return useQuery({
    queryKey: ['reportes', proyectoId],
    queryFn: () => ApiService.getReportes(proyectoId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!proyectoId, // Solo ejecutar si hay proyectoId
  });
};

// Hook para obtener un reporte específico
export const useReporte = (reporteId: string) => {
  return useQuery({
    queryKey: ['reportes', reporteId],
    queryFn: () => ApiService.getReporteById(reporteId),
    staleTime: 5 * 60 * 1000,
    enabled: !!reporteId,
  });
};

// Hook para crear reporte
export const useCreateReporte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporte: ReporteActividades) => ApiService.createReporte(reporte),
    onSuccess: (data, variables) => {
      // Invalidar solo la cache específica del proyecto para refrescar la lista
      // Usamos invalidateQueries con exact: false para invalidar todas las queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['reportes', variables.proyectoId],
        exact: false, // Invalidar también las queries infinitas
        refetchType: 'active' // Solo refetch de queries activas
      });
      toast.success('Reporte creado exitosamente');
    },
    onError: (error: any) => {
      handleApiError(error, 'Error al crear el reporte');
    },
  });
};

// Hook para actualizar reporte
export const useUpdateReporte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reporte }: { id: string; reporte: Partial<ReporteActividades> }) =>
      ApiService.updateReporte(id, reporte),
    onSuccess: (data) => {
      // Actualizar la cache del reporte específico
      queryClient.setQueryData(['reportes', data._id], data);

      // Invalidar solo las listas de reportes del proyecto específico
      queryClient.invalidateQueries({
        queryKey: ['reportes', data.proyectoId],
        exact: false,
        refetchType: 'active'
      });

      toast.success('Reporte actualizado exitosamente');
    },
    onError: (error: any) => {
      handleApiError(error, 'Error al actualizar el reporte');
    },
  });
};

// Hook para eliminar reporte
export const useDeleteReporte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => ApiService.deleteReporte(reporteId),
    onSuccess: () => {
      // Invalidar todas las queries de reportes (sin proyecto específico porque no lo tenemos)
      queryClient.invalidateQueries({
        queryKey: ['reportes'],
        exact: false,
        refetchType: 'active'
      });
      toast.success('Reporte eliminado exitosamente');
    },
    onError: (error: any) => {
      handleApiError(error, 'Error al eliminar el reporte');
    },
  });
};
