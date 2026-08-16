import api from './api';

export const bloodBankService = {
  getAll: () =>
    api.get('/blood_banks'),

  create: (data) =>
    api.post('/blood_banks', {
      bank_name: data.bank_name,
      location: data.location,
    }),

  delete: (id) =>
    api.delete(`/blood_banks/${id}`),
};
