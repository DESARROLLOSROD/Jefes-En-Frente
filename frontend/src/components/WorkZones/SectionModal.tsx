import React, { useState, useEffect } from 'react';
import { Section, CreateSectionDTO, UpdateSectionDTO } from '../../types/workZone.types';
import './WorkZones.css';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSectionDTO | UpdateSectionDTO) => Promise<void>;
  section?: Section | null;
}

const SectionModal: React.FC<SectionModalProps> = ({ isOpen, onClose, onSave, section }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'completed'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section) {
      setName(section.name);
      setDescription(section.description || '');
      setStatus(section.status);
    } else {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (section) {
        await onSave({ name, description, status });
      } else {
        await onSave({ name, description });
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar sección:', error);
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
          <h2 className="modal-title">{section ? 'EDITAR SECCIÓN' : 'NUEVA SECCIÓN'}</h2>
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
                placeholder="EJ: SECCIÓN A, BLOQUE 1..."
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
                placeholder="DESCRIPCIÓN OPCIONAL DE LA SECCIÓN..."
              />
            </div>

            {section && (
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
              {loading ? 'GUARDANDO...' : section ? 'ACTUALIZAR' : 'CREAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal;
