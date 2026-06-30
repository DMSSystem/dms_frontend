import api from './axiosConfig';

export const usersApi = {
  getUsers: (params = {}) =>
    api.get('/users/', { params }),
    
  getUsersByRole: (role) =>
    api.get('/users/by_role/', { params: { role } }),
    
  getCurrentUser: () =>
    api.get('/users/me/'),
};

export default usersApi;
