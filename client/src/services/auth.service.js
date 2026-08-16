import api from './api';

export const authService = {
  login: (email, password, role) =>
    api.post('/login', { email, password, role }),

  logout: () =>
    api.get('/logout'),

  getMe: () =>
    api.get('/api/me'),

  getProfile: () =>
    api.get('/api/profile'),

  updateProfile: (name, contact_number) =>
    api.put('/api/profile/update', { name, contact_number }),

  changePassword: (current_password, new_password) =>
    api.post('/api/profile/change-password', { current_password, new_password }),

  updateNotificationPrefs: (prefs) =>
    api.put('/api/profile/notification-preferences', prefs),
};
