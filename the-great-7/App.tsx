
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import EisenhowerMatrixPage from './pages/EisenhowerMatrixPage';
import SWOTAnalysisPage from './pages/SWOTAnalysisPage';
import ParetoChartPage from './pages/ParetoChartPage';
import DecisionMatrixPage from './pages/DecisionMatrixPage';
import GanttChartPage from './pages/GanttChartPage';
import SMARTGoalsPage from './pages/SMARTGoalsPage';
import RACIMatrixPage from './pages/RACIMatrixPage';
import MandalaChartPage from './pages/MandalaChartPage'; // Added
import { ToolKey } from './types';


const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path={`/tool/${ToolKey.EISENHOWER_MATRIX}`} element={<EisenhowerMatrixPage />} />
        <Route path={`/tool/${ToolKey.SWOT_ANALYSIS}`} element={<SWOTAnalysisPage />} />
        <Route path={`/tool/${ToolKey.PARETO_CHART}`} element={<ParetoChartPage />} />
        <Route path={`/tool/${ToolKey.DECISION_MATRIX}`} element={<DecisionMatrixPage />} />
        <Route path={`/tool/${ToolKey.GANTT_CHART}`} element={<GanttChartPage />} />
        <Route path={`/tool/${ToolKey.SMART_GOALS}`} element={<SMARTGoalsPage />} />
        <Route path={`/tool/${ToolKey.RACI_MATRIX}`} element={<RACIMatrixPage />} />
        <Route path={`/tool/${ToolKey.MANDALA_CHART}`} element={<MandalaChartPage />} /> {/* Added */}
      </Routes>
    </Layout>
  );
};

export default App;
