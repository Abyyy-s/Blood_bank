import api from './api';

export const donorService = {
  getAll: () =>
    api.get('/donors'),

  getById: (id) =>
    api.get(`/donors/${id}`),

  register: (data) =>
    api.post('/donors', {
      name: data.name,
      age: data.age,
      gender: data.gender,
      blood_group: data.blood_group,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
    }),

  update: (id, data) =>
    api.put(`/donors/${id}`, {
      name: data.name,
      age: data.age,
      gender: data.gender,
      blood_group: data.blood_group,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
    }),

  delete: (id) =>
    api.delete(`/donors/${id}`),
};
