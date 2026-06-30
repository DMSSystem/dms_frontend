import api from './axiosConfig';

export const auditLogApi = {
  getAuditLogs: (params = {}) =>
    api.get('/audit-logs/', { params }),
};

export default auditLogApi;
