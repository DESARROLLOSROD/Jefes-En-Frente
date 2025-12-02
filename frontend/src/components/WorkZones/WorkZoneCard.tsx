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

  const handleDelete = () => {
    if (window.confirm(`¿ESTÁS SEGURO DE ELIMINAR LA ZONA "${zone.name.toUpperCase()}" Y TODAS SUS SECCIONES?`)) {
      onDelete(zone._id);
    }
  };

  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    if (window.confirm(`¿ESTÁS SEGURO DE ELIMINAR LA SECCIÓN "${sectionName.toUpperCase()}"?`)) {
      onDeleteSection(zone._id, sectionId);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVO';
      case 'inactive':
        return 'INACTIVO';
      case 'completed':
        return 'COMPLETADO';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="work-zone-card">
      <div className="work-zone-card-header">
        <div className="work-zone-header-top">
          <h3 className="work-zone-name">📍 {zone.name.toUpperCase()}</h3>
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

        {zone.description && <p className="work-zone-description">{zone.description.toUpperCase()}</p>}

        <div className="work-zone-meta">
          <span className={`status-badge ${getStatusColor(zone.status)}`}>
            {getStatusText(zone.status)}
          </span>
          <span className="sections-count">
            {zone.sections.length} {zone.sections.length === 1 ? 'SECCIÓN' : 'SECCIONES'}
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
            {zone.sections.length > 0 ? (
              <ul className="sections-list">
                {zone.sections.map((section) => (
                  <li key={section.id} className="section-item">
                    <div className="section-info">
                      <div className="section-name">{section.name.toUpperCase()}</div>
                      {section.description && (
                        <div className="section-description">{section.description.toUpperCase()}</div>
                      )}
                      <span className={`status-badge ${getStatusColor(section.status)}`}>
                        {getStatusText(section.status)}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="section-actions">
                        <button
                          className="btn-icon"
                          onClick={() => onEditSection(zone._id, section)}
                          title="EDITAR SECCIÓN"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteSection(section.id, section.name)}
                          title="ELIMINAR SECCIÓN"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                NO HAY SECCIONES EN ESTA ZONA
              </p>
            )}

            {isAdmin && (
              <button className="btn-add-section" onClick={() => onAddSection(zone._id)}>
                + AGREGAR SECCIÓN
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkZoneCard;
