import React, { useState, useEffect } from 'react';
import { WorkZone, CreateWorkZoneDTO, UpdateWorkZoneDTO } from '../../types/workZone.types';
import './WorkZones.css';

interface WorkZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateWorkZoneDTO | UpdateWorkZoneDTO) => Promise<void>;
  zone?: WorkZone | null;
  projectId: string;
}

const WorkZoneModal: React.FC<WorkZoneModalProps> = ({ isOpen, onClose, onSave, zone, projectId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'completed'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setDescription(zone.description || '');
      setStatus(zone.status);
    } else {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (zone) {
        await onSave({ name, description, status });
      } else {
        await onSave({ projectId, name, description });
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar zona:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{zone ? 'EDITAR ZONA DE TRABAJO' : 'NUEVA ZONA DE TRABAJO'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                NOMBRE <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="EJ: ZONA NORTE, ÁREA DE EXTRACCIÓN..."
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPCIÓN</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="DESCRIPCIÓN OPCIONAL DE LA ZONA..."
              />
            </div>

            {zone && (
              <div className="form-group">
                <label className="form-label">ESTADO</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'completed')}
                >
                  <option value="active">ACTIVO</option>
                  <option value="inactive">INACTIVO</option>
                  <option value="completed">COMPLETADO</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              CANCELAR
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'GUARDANDO...' : zone ? 'ACTUALIZAR' : 'CREAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkZoneModal;
