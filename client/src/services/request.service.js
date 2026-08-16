import api from './api';

export const requestService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.blood_group) query.append('blood_group', params.blood_group);
    const qs = query.toString();
    return api.get(qs ? `/requests?${qs}` : '/requests');
  },

  create: (data) =>
    api.post('/requests', {
      hospital_id: data.hospital_id,
      blood_group: data.blood_group,
      component_type: data.component_type,
      quantity_units: data.quantity_units,
      urgency_level: data.urgency_level,
    }),

  updateStatus: (id, status) =>
    api.put(`/requests/${id}`, { status }),

  cancel: (id) =>
    api.delete(`/requests/${id}`),
};
