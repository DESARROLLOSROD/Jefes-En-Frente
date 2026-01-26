export interface Section {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkZone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  sections: Section[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkZoneDTO {
  projectId: string;
  name: string;
  description?: string;
  sections?: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>[];
  status?: 'active' | 'inactive' | 'completed';
}

export interface UpdateWorkZoneDTO {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed';
  sections?: Section[];
}

export interface CreateSectionDTO {
  name: string;
  description?: string;
}

export interface UpdateSectionDTO {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed';
}
