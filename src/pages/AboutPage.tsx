import React from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  Database,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Code2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          About the Spam Message Detection System
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          An end-to-end machine learning system built for real-time natural language classification of unsolicited and fraudulent SMS messages.
        </p>
      </div>

      {/* Problem Statement & Objective */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600">
          <Lightbulb className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Project Objective & Problem Statement
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Short Message Service (SMS) remains one of the most trusted and immediate communication channels globally, boasting open rates exceeding 95%. Consequently, it has become a primary vector for smishing (SMS phishing), fraudulent prize lotteries, account suspension scams, and unsolicited marketing blasts.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The goal of this system is to deploy a high-speed, probabilistic natural language classifier that accurately discriminates between legitimate communications (<strong>HAM</strong>) and deceptive/unsolicited messages (<strong>SPAM</strong>) with negligible latency and high precision to protect users from fraudulent scams without discarding critical authentic messages.
        </p>
      </div>

      {/* How the System Works */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600">
          <Layers className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            How the System Works (End-to-End Pipeline)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h4 className="font-bold text-slate-800">Text Sanitization</h4>
            <p className="text-slate-500 leading-snug">
              Input messages undergo lowercasing, regex normalization of URLs, phone numbers, and currency values.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h4 className="font-bold text-slate-800">TF-IDF Vectorization</h4>
            <p className="text-slate-500 leading-snug">
              Converts raw tokens into 5,000 sublinear unigram and bigram TF-IDF numerical vectors.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h4 className="font-bold text-slate-800">Naive Bayes Inference</h4>
            <p className="text-slate-500 leading-snug">
              Calculates posterior class probabilities P(Spam | Message) with Laplace smoothing (alpha=0.1).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h4 className="font-bold text-slate-800">Database Storage</h4>
            <p className="text-slate-500 leading-snug">
              Verdicts, confidence estimates, and indicators are persisted into SQLite/PostgreSQL with audit metadata.
            </p>
          </div>
        </div>
      </div>

      {/* Machine Learning Algorithm Deep-Dive */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600">
          <BrainCircuit className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Why Multinomial Naive Bayes?
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Multinomial Naive Bayes (MNB) is the industry benchmark for high-throughput text classification. Based on Bayes’ theorem with the "naive" assumption of conditional feature independence given the class label:
        </p>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs text-blue-900 font-semibold overflow-x-auto">
          P(C | x₁, x₂, ..., xₙ) ∝ P(C) × ∏ P(xᵢ | C)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
            <h5 className="font-bold text-blue-900">Sub-Millisecond Speed</h5>
            <p className="text-slate-600">
              Inference requires only matrix multiplications in log-space, generating classifications in less than 2 milliseconds.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
            <h5 className="font-bold text-indigo-900">Robust to Imbalance</h5>
            <p className="text-slate-600">
              Natural SMS distributions are heavily skewed (typically 87% ham, 13% spam). Class prior probabilities handle this skew naturally.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
            <h5 className="font-bold text-purple-900">Laplace Smoothing</h5>
            <p className="text-slate-600">
              An alpha hyperparameter of 0.1 prevents zero-probability collapse on previously unseen rare vocabulary terms.
            </p>
          </div>
        </div>
      </div>

      {/* Technologies Used */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600">
          <Code2 className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Technology Stack
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-800 block">Frontend Framework</span>
            <span className="text-slate-500 mt-0.5 block">React 19, TypeScript, Vite, Tailwind CSS</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-800 block">Backend Framework</span>
            <span className="text-slate-500 mt-0.5 block">FastAPI, Uvicorn, Pydantic, Python 3.11</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-800 block">Machine Learning</span>
            <span className="text-slate-500 mt-0.5 block">Scikit-learn, TF-IDF, Pandas, NumPy, Joblib</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-800 block">Database & ORM</span>
            <span className="text-slate-500 mt-0.5 block">SQLAlchemy, SQLite (Dev) / PostgreSQL (Prod)</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-800 block">Visualizations</span>
            <span className="text-slate-500 mt-0.5 block">Recharts Responsive Charts & Lucide Icons</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-800 block">Testing Suite</span>
            <span className="text-slate-500 mt-0.5 block">Pytest (Backend) & Vitest (Frontend)</span>
          </div>
        </div>
      </div>

      {/* Model Limitations & Ethics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Model Limitations & Ethical Safeguards
          </h3>
        </div>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <li>
            <strong>Probabilistic Estimations:</strong> Statistical models reflect correlations in historical training data. A prediction does not constitute legal or definitive security proof.
          </li>
          <li>
            <strong>Adversarial Evasion:</strong> Spammers often attempt character homoglyphs (e.g., using "w1n" or zero-width spaces) or images to bypass bag-of-words filters.
          </li>
          <li>
            <strong>False Positive Minimization:</strong> Misidentifying legitimate family or two-factor authentication messages is significantly worse than allowing occasional spam. The model is tuned with 98.3% precision to protect genuine communications.
          </li>
        </ul>
      </div>

      {/* Privacy Considerations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-600">
          <Lock className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Privacy & Data Retention
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The system never executes embedded URLs or code contained within submitted messages. Users maintain full control over their analysis history, with the ability to inspect, delete individual records, or clear all historical data with a single confirmed action.
        </p>
      </div>
    </div>
  );
};
