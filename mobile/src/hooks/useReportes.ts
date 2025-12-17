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
      // Invalidar la cache de reportes para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['reportes', variables.proyectoId] });
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

      // Invalidar la lista de reportes
      queryClient.invalidateQueries({ queryKey: ['reportes'] });

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
      // Invalidar todas las queries de reportes
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Reporte eliminado exitosamente');
    },
    onError: (error: any) => {
      handleApiError(error, 'Error al eliminar el reporte');
    },
  });
};
