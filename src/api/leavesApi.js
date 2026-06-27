import api from './axiosConfig';

export const leavesApi = {
  getLeaves: (params = {}) => 
    api.get('/leave-out/', { params }),
  
  createLeave: (data) => 
    api.post('/leave-out/', data),
  
  approveLeave: (id, status) => 
    api.post(`/leave-out/${id}/approve/`, { status }),

  deleteLeave: (id) => 
    api.delete(`/leave-out/${id}/`),
};

export default leavesApi;
