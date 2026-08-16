import api from './api';

export const inventoryService = {
  getStock: (params = {}) => {
    const query = new URLSearchParams();
    if (params.blood_group) query.append('blood_group', params.blood_group);
    if (params.bank_id) query.append('bank_id', params.bank_id);
    if (params.component_type) query.append('component_type', params.component_type);
    const qs = query.toString();
    return api.get(qs ? `/stock?${qs}` : '/stock');
  },

  getDashboard: () =>
    api.get('/dashboard'),
};
