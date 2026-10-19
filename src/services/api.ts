import axios from 'axios';
import type {
  PredictRequest,
  PredictResponse,
  HistoryListResponse,
  HistoryDetailResponse,
  SystemStatistics,
  ModelMetricsResponse,
  ModelInfoResponse,
  HealthResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  // Prediction
  predictMessage: async (payload: PredictRequest): Promise<PredictResponse> => {
    const response = await apiClient.post<PredictResponse>('/predict', payload);
    return response.data;
  },

  // History
  getHistory: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    label?: string;
    sort?: 'newest' | 'oldest';
  }): Promise<HistoryListResponse> => {
    const response = await apiClient.get<HistoryListResponse>('/history', {
      params,
    });
    return response.data;
  },

  getHistoryDetail: async (id: number): Promise<HistoryDetailResponse> => {
    const response = await apiClient.get<HistoryDetailResponse>(`/history/${id}`);
    return response.data;
  },

  deleteHistoryRecord: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/history/${id}`);
    return response.data;
  },

  clearAllHistory: async (): Promise<{ success: boolean; message: string; deleted_count: number }> => {
    const response = await apiClient.delete<{ success: boolean; message: string; deleted_count: number }>(
      '/history?confirm=true'
    );
    return response.data;
  },

  // Statistics
  getStatistics: async (): Promise<SystemStatistics> => {
    const response = await apiClient.get<SystemStatistics>('/statistics');
    return response.data;
  },

  // Model
  getModelMetrics: async (): Promise<ModelMetricsResponse> => {
    const response = await apiClient.get<ModelMetricsResponse>('/model/metrics');
    return response.data;
  },

  getModelInfo: async (): Promise<ModelInfoResponse> => {
    const response = await apiClient.get<ModelInfoResponse>('/model/info');
    return response.data;
  },
};
