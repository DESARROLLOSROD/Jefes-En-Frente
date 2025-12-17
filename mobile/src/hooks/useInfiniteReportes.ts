import { useInfiniteQuery } from '@tanstack/react-query';
import ApiService from '../services/api';
import { ReporteActividades } from '../types';

export interface ReportesPage {
  reportes: ReporteActividades[];
  nextPage: number | null;
  totalPages: number;
  totalReportes: number;
}

/**
 * Hook para obtener reportes con paginación infinita
 * Permite cargar más reportes al hacer scroll
 */
export const useInfiniteReportes = (proyectoId?: string, pageSize: number = 20) => {
  return useInfiniteQuery<ReportesPage>({
    queryKey: ['reportes', 'infinite', proyectoId, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      // Por ahora la API no soporta paginación, así que simulamos
      // En el futuro, la API debería aceptar ?page=1&limit=20
      const allReportes = await ApiService.getReportes(proyectoId);

      // Simular paginación en el cliente
      const startIndex = ((pageParam as number) - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReportes = allReportes.slice(startIndex, endIndex);

      const totalPages = Math.ceil(allReportes.length / pageSize);
      const hasNextPage = (pageParam as number) < totalPages;

      return {
        reportes: paginatedReportes,
        nextPage: hasNextPage ? (pageParam as number) + 1 : null,
        totalPages,
        totalReportes: allReportes.length,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!proyectoId,
  });
};

/**
 * Hook alternativo para paginación con números de página
 * Más adecuado para UI con botones de página
 */
export const usePaginatedReportes = (
  proyectoId?: string,
  page: number = 1,
  pageSize: number = 20
) => {
  return useInfiniteQuery<ReportesPage>({
    queryKey: ['reportes', 'paginated', proyectoId, page, pageSize],
    queryFn: async () => {
      const allReportes = await ApiService.getReportes(proyectoId);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReportes = allReportes.slice(startIndex, endIndex);

      const totalPages = Math.ceil(allReportes.length / pageSize);

      return {
        reportes: paginatedReportes,
        nextPage: page < totalPages ? page + 1 : null,
        totalPages,
        totalReportes: allReportes.length,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: page,
    staleTime: 5 * 60 * 1000,
    enabled: !!proyectoId,
  });
};
