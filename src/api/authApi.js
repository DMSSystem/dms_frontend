// frontend/src/api/authApi.js
import api from './axiosConfig';

export const authApi = {
  login: (username, password) => 
    api.post('/token/', { username, password }),
  
  refreshToken: (refresh) => 
    api.post('/token/refresh/', { refresh }),
  
  signup: (data) => 
    api.post('/auth/signup/', data),
  
  verifyOtp: (username, otpCode) => 
    api.post('/auth/verify-otp/', { username, otp_code: otpCode }),
  
  resendOtp: (username) => 
    api.post('/auth/resend-otp/', { username }),
  
  getCurrentUser: () => 
    api.get('/users/me/'),
  
  changePassword: (data) => 
    api.post('/users/change_password/', data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password/', { email }),

  resetPassword: (username, otpCode, newPassword, confirmNewPassword) =>
    api.post('/auth/reset-password/', {
      username,
      otp_code: otpCode,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    }),
};