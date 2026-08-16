import api from './api';

export const notificationService = {
  getAll: () =>
    api.get('/notifications'),

  markRead: (id) =>
    api.post(`/notifications/${id}/read`),
};
