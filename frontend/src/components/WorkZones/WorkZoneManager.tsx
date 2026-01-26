import React, { useState, useEffect } from 'react';
import { WorkZone, Section, CreateWorkZoneDTO, UpdateWorkZoneDTO, CreateSectionDTO, UpdateSectionDTO } from '../../types/workZone.types';
import { workZoneService } from '../../services/workZone.service';
import WorkZoneCard from './WorkZoneCard';
import WorkZoneModal from './WorkZoneModal';
import SectionModal from './SectionModal';
import './WorkZones.css';

interface WorkZoneManagerProps {
  projectId: string;
  isAdmin: boolean;
}

const WorkZoneManager: React.FC<WorkZoneManagerProps> = ({ projectId, isAdmin }) => {
  const [zones, setZones] = useState<WorkZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<WorkZone | null>(null);
  const [editingSection, setEditingSection] = useState<{ zoneId: string; section: Section } | null>(null);
  const [addingSectionToZone, setAddingSectionToZone] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, [projectId]);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workZoneService.getZonesByProject(projectId);
      setZones(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las zonas de trabajo');
    } finally {
      setLoading(false);
    }
  };

  // Zone CRUD operations
  const handleCreateZone = () => {
    setEditingZone(null);
    setIsZoneModalOpen(true);
  };

  const handleEditZone = (zone: WorkZone) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = async (data: CreateWorkZoneDTO | UpdateWorkZoneDTO) => {
    try {
      if (editingZone) {
        await workZoneService.updateZone(editingZone._id, data as UpdateWorkZoneDTO);
      } else {
        await workZoneService.createZone(data as CreateWorkZoneDTO);
      }
      await loadZones();
      setIsZoneModalOpen(false);
      setEditingZone(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la zona');
      throw err;
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await workZoneService.deleteZone(zoneId);
      await loadZones();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la zona');
    }
  };

  // Section CRUD operations
  const handleAddSection = (zoneId: string) => {
    setAddingSectionToZone(zoneId);
    setEditingSection(null);
    setIsSectionModalOpen(true);
  };

  const handleEditSection = (zoneId: string, section: Section) => {
    setEditingSection({ zoneId, section });
    setAddingSectionToZone(null);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (data: CreateSectionDTO | UpdateSectionDTO) => {
    try {
      if (editingSection) {
        await workZoneService.updateSection(
          editingSection.zoneId,
          editingSection.section.id,
          data as UpdateSectionDTO
        );
      } else if (addingSectionToZone) {
        await workZoneService.addSection(addingSectionToZone, data as CreateSectionDTO);
      }
      await loadZones();
      setIsSectionModalOpen(false);
      setEditingSection(null);
      setAddingSectionToZone(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la sección');
      throw err;
    }
  };

  const handleDeleteSection = async (zoneId: string, sectionId: string) => {
    try {
      await workZoneService.deleteSection(zoneId, sectionId);
      await loadZones();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la sección');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>CARGANDO ZONAS DE TRABAJO...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p className="error-message">{(error || 'ERROR DESCONOCIDO').toUpperCase()}</p>
        <button className="btn-primary" onClick={loadZones}>
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="work-zones-container">
      <div className="work-zones-header">
        <h1 className="work-zones-title">ZONAS DE TRABAJO</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={handleCreateZone}>
            + NUEVA ZONA
          </button>
        )}
      </div>

      {zones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <h3 className="empty-title">NO HAY ZONAS DE TRABAJO</h3>
          <p className="empty-description">
            {isAdmin
              ? 'CREA TU PRIMERA ZONA PARA COMENZAR A ORGANIZAR EL PROYECTO'
              : 'NO HAY ZONAS DE TRABAJO DISPONIBLES EN ESTE PROYECTO'}
          </p>
          {isAdmin && (
            <button className="btn-primary" onClick={handleCreateZone}>
              + CREAR PRIMERA ZONA
            </button>
          )}
        </div>
      ) : (
        <div className="work-zones-grid">
          {zones.map((zone) => (
            <WorkZoneCard
              key={zone._id}
              zone={zone}
              isAdmin={isAdmin}
              onEdit={handleEditZone}
              onDelete={handleDeleteZone}
              onAddSection={handleAddSection}
              onEditSection={handleEditSection}
              onDeleteSection={handleDeleteSection}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <WorkZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setEditingZone(null);
        }}
        onSave={handleSaveZone}
        zone={editingZone}
        projectId={projectId}
      />

      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingSection(null);
          setAddingSectionToZone(null);
        }}
        onSave={handleSaveSection}
        section={editingSection?.section || null}
      />
    </div>
  );
};

export default WorkZoneManager;
