import api from './api';

export const donationService = {
  getAll: () =>
    api.get('/donations'),

  create: (data) =>
    api.post('/donations', {
      donor_id: data.donor_id,
      bank_id: data.bank_id,
      screening_id: data.screening_id,
      donation_date: data.donation_date || undefined,
      component_type: data.component_type,
      quantity_units: data.quantity_units,
    }),
};
