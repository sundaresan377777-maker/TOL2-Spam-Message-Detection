/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnalyzerPage } from '../pages/AnalyzerPage';
import { AboutPage } from '../pages/AboutPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    predictMessage: vi.fn(),
    checkHealth: vi.fn(),
    getStatistics: vi.fn(),
    getModelMetrics: vi.fn(),
    getHistory: vi.fn(),
  },
}));

describe('AnalyzerPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input card with example selectors and character counter', () => {
    render(
      <BrowserRouter>
        <AnalyzerPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Message Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Prize Winner (Spam)')).toBeInTheDocument();
    expect(screen.getByText('Meeting Sync (Ham)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type or paste an SMS message here/i)).toBeInTheDocument();
    expect(screen.getByText('0 / 5,000')).toBeInTheDocument();
  });

  it('populates text area when an example message is clicked', () => {
    render(
      <BrowserRouter>
        <AnalyzerPage />
      </BrowserRouter>
    );

    const exampleBtn = screen.getByText('Prize Winner (Spam)');
    fireEvent.click(exampleBtn);

    const textarea = screen.getByPlaceholderText(/Type or paste an SMS message here/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Congratulations! You have won a free prize.');
  });

  it('displays validation error if analyzing empty message', async () => {
    render(
      <BrowserRouter>
        <AnalyzerPage />
      </BrowserRouter>
    );

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Message/i });
    // Button is disabled when input is empty
    expect(analyzeBtn).toBeDisabled();
  });

  it('submits prediction and displays SPAM verdict card', async () => {
    (api.predictMessage as any).mockResolvedValue({
      id: 101,
      prediction: 'SPAM',
      confidence: 0.998,
      spam_probability: 0.998,
      ham_probability: 0.002,
      message_preview: 'Congratulations! You have won a free prize.',
      character_count: 45,
      detected_indicators: ['free', 'prize'],
      explanation: 'Classified as SPAM with 99.8% model confidence.',
    });

    render(
      <BrowserRouter>
        <AnalyzerPage />
      </BrowserRouter>
    );

    const textarea = screen.getByPlaceholderText(/Type or paste an SMS message here/i);
    fireEvent.change(textarea, { target: { value: 'Congratulations! You have won a free prize.' } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Message/i });
    expect(analyzeBtn).not.toBeDisabled();
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('SPAM DETECTED')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument(); // 0.998 rounded
      expect(screen.getByText(/Classified as SPAM with 99.8% model confidence/i)).toBeInTheDocument();
      expect(screen.getByText('free')).toBeInTheDocument();
      expect(screen.getByText('prize')).toBeInTheDocument();
    });
  });

  it('submits prediction and displays HAM verdict card', async () => {
    (api.predictMessage as any).mockResolvedValue({
      id: 102,
      prediction: 'HAM',
      confidence: 0.994,
      spam_probability: 0.006,
      ham_probability: 0.994,
      message_preview: "Hi, I'll meet you at the library at 3 PM.",
      character_count: 42,
      detected_indicators: [],
      explanation: 'Classified as HAM (Legitimate) with 99.4% model confidence.',
    });

    render(
      <BrowserRouter>
        <AnalyzerPage />
      </BrowserRouter>
    );

    const textarea = screen.getByPlaceholderText(/Type or paste an SMS message here/i);
    fireEvent.change(textarea, { target: { value: "Hi, I'll meet you at the library at 3 PM." } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Message/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('LEGITIMATE (HAM)')).toBeInTheDocument();
      expect(screen.getByText('99%')).toBeInTheDocument();
      expect(screen.getByText(/Classified as HAM \(Legitimate\)/i)).toBeInTheDocument();
    });
  });

  it('handles backend API errors gracefully', async () => {
    (api.predictMessage as any).mockRejectedValue({
      response: { data: { detail: 'Service temporarily unavailable.' } },
    });

    render(
      <BrowserRouter>
        <AnalyzerPage />
      </BrowserRouter>
    );

    const textarea = screen.getByPlaceholderText(/Type or paste an SMS message here/i);
    fireEvent.change(textarea, { target: { value: 'Test message for failure' } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Message/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('Service temporarily unavailable.')).toBeInTheDocument();
    });
  });
});

describe('AboutPage Component', () => {
  it('renders problem statement, pipeline, and algorithm details', () => {
    render(<AboutPage />);
    expect(screen.getByText(/About the Spam Message Detection System/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Multinomial Naive Bayes\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Text Sanitization/i)).toBeInTheDocument();
    expect(screen.getByText(/Model Limitations & Ethical Safeguards/i)).toBeInTheDocument();
  });
});
