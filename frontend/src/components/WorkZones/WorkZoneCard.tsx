import React, { useState } from 'react';
import { WorkZone, Section } from '../../types/workZone.types';
import './WorkZones.css';

interface WorkZoneCardProps {
  zone: WorkZone;
  isAdmin: boolean;
  onEdit: (zone: WorkZone) => void;
  onDelete: (zoneId: string) => void;
  onAddSection: (zoneId: string) => void;
  onEditSection: (zoneId: string, section: Section) => void;
  onDeleteSection: (zoneId: string, sectionId: string) => void;
}

const WorkZoneCard: React.FC<WorkZoneCardProps> = ({
  zone,
  isAdmin,
  onEdit,
  onDelete,
  onAddSection,
  onEditSection,
  onDeleteSection,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Valores seguros con defaults
  const zoneName = zone?.name || 'SIN NOMBRE';
  const zoneDescription = zone?.description || '';
  const zoneStatus = zone?.status || 'active';
  const zoneSections = zone?.sections || [];
  const zoneId = zone?._id || zone?.id || '';

  const handleDelete = () => {
    if (window.confirm(`¿ESTAS SEGURO DE ELIMINAR LA ZONA "${zoneName.toUpperCase()}" Y TODAS SUS SECCIONES?`)) {
      onDelete(zoneId);
    }
  };

  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    const name = sectionName || 'SIN NOMBRE';
    if (window.confirm(`¿ESTAS SEGURO DE ELIMINAR LA SECCION "${name.toUpperCase()}"?`)) {
      onDeleteSection(zoneId, sectionId);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'completed':
        return 'completed';
      default:
        return 'active';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVO';
      case 'inactive':
        return 'INACTIVO';
      case 'completed':
        return 'COMPLETADO';
      default:
        return 'ACTIVO';
    }
  };

  return (
    <div className="work-zone-card">
      <div className="work-zone-card-header">
        <div className="work-zone-header-top">
          <h3 className="work-zone-name">📍 {zoneName.toUpperCase()}</h3>
          {isAdmin && (
            <div className="work-zone-actions">
              <button className="btn-icon" onClick={() => onEdit(zone)} title="EDITAR ZONA">
                ✏️
              </button>
              <button className="btn-icon" onClick={handleDelete} title="ELIMINAR ZONA">
                🗑️
              </button>
            </div>
          )}
        </div>

        {zoneDescription && <p className="work-zone-description">{zoneDescription.toUpperCase()}</p>}

        <div className="work-zone-meta">
          <span className={`status-badge ${getStatusColor(zoneStatus)}`}>
            {getStatusText(zoneStatus)}
          </span>
          <span className="sections-count">
            {zoneSections.length} {zoneSections.length === 1 ? 'SECCION' : 'SECCIONES'}
          </span>
        </div>
      </div>

      <div className="work-zone-sections">
        <div className="sections-header" onClick={() => setIsExpanded(!isExpanded)}>
          <h4>SECCIONES</h4>
          <span>{isExpanded ? '▲' : '▼'}</span>
        </div>

        {isExpanded && (
          <>
            {zoneSections.length > 0 ? (
              <ul className="sections-list">
                {zoneSections.map((section) => {
                  const sectionName = section?.name || 'SIN NOMBRE';
                  const sectionDescription = section?.description || '';
                  const sectionStatus = section?.status || 'active';
                  const sectionId = section?.id || '';

                  return (
                    <li key={sectionId} className="section-item">
                      <div className="section-info">
                        <div className="section-name">{sectionName.toUpperCase()}</div>
                        {sectionDescription && (
                          <div className="section-description">{sectionDescription.toUpperCase()}</div>
                        )}
                        <span className={`status-badge ${getStatusColor(sectionStatus)}`}>
                          {getStatusText(sectionStatus)}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="section-actions">
                          <button
                            className="btn-icon"
                            onClick={() => onEditSection(zoneId, section)}
                            title="EDITAR SECCION"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteSection(sectionId, sectionName)}
                            title="ELIMINAR SECCION"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                NO HAY SECCIONES EN ESTA ZONA
              </p>
            )}

            {isAdmin && (
              <button className="btn-add-section" onClick={() => onAddSection(zoneId)}>
                + AGREGAR SECCION
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkZoneCard;
