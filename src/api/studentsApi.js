import api from './axiosConfig';

export const studentsApi = {
  getStudents: () => 
    api.get('/students/'),
  
  createStudent: (data) => 
    api.post('/students/', data),
  
  getStudentByAdmission: (admissionNo) => 
    api.get(`/students/by-admission/${admissionNo}/`),
  
  getStudentsByRoom: (roomId) => 
    api.get(`/students/by-room/${roomId}/`),
  
  updateStudent: (id, data) => 
    api.patch(`/students/${id}/`, data),

  deleteStudent: (id) =>
    api.delete(`/students/${id}/`),
};
export default studentsApi;
