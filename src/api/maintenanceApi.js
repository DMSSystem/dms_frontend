import api from './axiosConfig';

export const maintenanceApi = {
  getMaintenanceRequests: (params = {}) =>
    api.get('/maintenance/', { params }),
    
  createMaintenanceRequest: (data) =>
    api.post('/maintenance/', data),
    
  updateMaintenanceRequest: (id, data) =>
    api.patch(`/maintenance/${id}/`, data),
};

export default maintenanceApi;
