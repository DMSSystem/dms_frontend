import api from './axiosConfig';

export const roomsApi = {
  getDorms: () => 
    api.get('/dorms/'),
  
  createDorm: (data) => 
    api.post('/dorms/', data),
  
  getRooms: () => 
    api.get('/rooms/'),
    
  getRoomDetails: (id) => 
    api.get(`/rooms/${id}/`),

  deleteDorm: (id) =>
    api.delete(`/dorms/${id}/`),
};
