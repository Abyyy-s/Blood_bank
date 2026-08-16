import api from './api';

export const healthService = {
  getAll: () =>
    api.get('/donor_health'),

  create: (data) =>
    api.post('/donor_health', {
      donor_id: data.donor_id,
      hemoglobin_level: data.hemoglobin_level,
      bp: data.bp,
      weight: data.weight,
      disease_detected: data.disease_detected,
      eligibility_status: data.eligibility_status,
    }),
};
