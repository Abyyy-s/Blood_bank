import api from './api';

export const hospitalService = {
  getAll: () =>
    api.get('/hospitals'),

  create: (data) =>
    api.post('/hospitals', {
      hospital_name: data.hospital_name,
      location: data.location,
    }),

  delete: (id) =>
    api.delete(`/hospitals/${id}`),
};
