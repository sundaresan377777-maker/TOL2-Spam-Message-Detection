export type PredictionLabel = 'SPAM' | 'HAM';

export interface PredictRequest {
  message: string;
}

export interface PredictResponse {
  id: number;
  prediction: PredictionLabel;
  confidence: number;
  spam_probability: number;
  ham_probability: number;
  message_preview: string;
  character_count: number;
  detected_indicators: string[];
  explanation: string;
}

export interface HistoryItem {
  id: number;
  message_preview: string;
  predicted_label: PredictionLabel;
  confidence: number;
  spam_probability: number;
  ham_probability: number;
  character_count: number;
  indicators: string[];
  created_at: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface HistoryDetailResponse {
  id: number;
  message_text: string;
  predicted_label: PredictionLabel;
  confidence: number;
  spam_probability: number;
  ham_probability: number;
  character_count: number;
  indicators: string[];
  created_at: string;
}

export interface DailyActivity {
  date: string;
  total: number;
  spam: number;
  ham: number;
}

export interface SystemStatistics {
  total_analyzed: number;
  spam_count: number;
  ham_count: number;
  spam_ratio: number;
  ham_ratio: number;
  avg_confidence: number;
  recent_activity: DailyActivity[];
  latest_prediction_time: string | null;
}

export interface ConfusionMatrixData {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy_percent: number;
  precision_percent: number;
  recall_percent: number;
  f1_percent: number;
}

export interface ModelMetricsResponse {
  model_type: string;
  vectorizer: string;
  smoothing_alpha: number;
  dataset_name: string;
  total_dataset_samples: number;
  train_samples: number;
  test_samples: number;
  class_distribution: {
    ham_count: number;
    spam_count: number;
    ham_percentage: number;
    spam_percentage: number;
  };
  evaluation_metrics: EvaluationMetrics;
  confusion_matrix: ConfusionMatrixData;
  training_timestamp: string;
  random_seed: number;
}

export interface ModelInfoResponse {
  model_name: string;
  algorithm: string;
  feature_extraction: string;
  vocabulary_size: number;
  dataset_source: string;
  status: string;
  is_trained: boolean;
  evaluation_summary: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
  database_connected: boolean;
  timestamp: string;
  system_details: Record<string, unknown>;
}
