import api from './api'; // Senin oluşturduğun api.js'i kullanıyoruz

export const getDashboardSummary = async (userId) => {
  const response = await api.get(`/dashboard/summary/${userId}`);
  return response.data;
};