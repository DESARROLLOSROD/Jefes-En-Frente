import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';
import { Material, Origen, Destino, Capacidad } from '../types';

export const useMateriales = () => {
    return useQuery({
        queryKey: ['materiales'],
        queryFn: () => ApiService.getMateriales(),
    });
};

export const useCreateMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (material: Partial<Material>) => ApiService.createMaterial(material),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materiales'] });
        },
    });
};

export const useOrigenes = () => {
    return useQuery({
        queryKey: ['origenes'],
        queryFn: () => ApiService.getOrigenes(),
    });
};

export const useCreateOrigen = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (origen: Partial<Origen>) => ApiService.createOrigen(origen),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['origenes'] });
        },
    });
};

export const useDestinos = () => {
    return useQuery({
        queryKey: ['destinos'],
        queryFn: () => ApiService.getDestinos(),
    });
};

export const useCreateDestino = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (destino: Partial<Destino>) => ApiService.createDestino(destino),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['destinos'] });
        },
    });
};

export const useCapacidades = () => {
    return useQuery({
        queryKey: ['capacidades'],
        queryFn: () => ApiService.getCapacidades(),
    });
};

export const useCreateCapacidad = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (capacidad: Partial<Capacidad>) => ApiService.createCapacidad(capacidad),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['capacidades'] });
        },
    });
};
