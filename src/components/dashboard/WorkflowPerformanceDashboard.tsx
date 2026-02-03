import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Clock, Target, Zap, Award,
  Calendar, CheckCircle, XCircle, ArrowRight, Filter,
  Activity, PieChart, LineChart, DollarSign, Users
} from 'lucide-react';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId, type Workflow } from '../../lib/workflowTracking';
import { WorkflowOutcomes, type WorkflowImpactMetrics } from '../../lib/workflowOutcomes';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line, Area, AreaChart, ComposedChart
} from 'recharts';

interface WorkflowPerformanceMetrics {
  workflowId: WorkflowId;
  workflowName: string;
  category: string;
  
  // Completion metrics
  totalCompletions: number;
  averageTimeToComplete: number; // in days
  fastestCompletion: number; // in days
  slowestCompletion: number; // in days
  completionRate: number; // percentage
  
  // Step metrics
  averageStepsCompleted: number;
  averageStepTime: number; // in hours
  mostCompletedStep: string;
  leastCompletedStep: string;
  
  // Performance metrics
  averageProgress: number;
  activeUsers: number;
  abandonmentRate: number; // percentage
  
  // Impact metrics
  averageApplicationsSubmitted?: number;
  averageInterviewsScheduled?: number;
  averageSkillsImproved?: number;
  averageROI?: number;
  
  // Timeline
  firstCompleted?: string;
  lastCompleted?: string;
  completionsThisMonth: number;
  completionsLastMonth: number;
}

interface PerformanceDashboardProps {
  workflowId?: WorkflowId;
  timeRange?: 'week' | 'month' | 'quarter' | 'all';
}

export default function WorkflowPerformanceDashboard({ 
  workflowId,
  timeRange = 'all'
}: PerformanceDashboardProps) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<WorkflowPerformanceMetrics[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowId | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // Get all workflows
      const workflows = WorkflowTracking.getAllWorkflows();
      const allWorkflowIds = Object.keys(WORKFLOW_DEFINITIONS) as WorkflowId[];
      
      // Calculate metrics for each workflow
      const calculatedMetrics: WorkflowPerformanceMetrics[] = [];
      
      for (const id of allWorkflowIds) {
        if (workflowId && id !== workflowId) continue;
        
        const definition = WORKFLOW_DEFINITIONS[id];
        const workflowInstances = workflows.filter(w => w.id === id);
        
        // Completion metrics
        const completedWorkflows = workflowInstances.filter(w => w.completedAt);
        const totalCompletions = completedWorkflows.length;
        
        // Calculate time to complete
        const completionTimes = completedWorkflows
          .filter(w => w.startedAt && w.completedAt)
          .map(w => {
            const start = new Date(w.startedAt!).getTime();
            const end = new Date(w.completedAt!).getTime();
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // days
          });
        
        const averageTimeToComplete = completionTimes.length > 0
          ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
          : 0;
        const fastestCompletion = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
        const slowestCompletion = completionTimes.length > 0 ? Math.max(...completionTimes) : 0;
        
        // Completion rate
        const startedWorkflows = workflowInstances.filter(w => w.startedAt || w.isActive);
        const completionRate = startedWorkflows.length > 0
          ? Math.round((totalCompletions / startedWorkflows.length) * 100)
          : 0;
        
        // Step metrics
        const allSteps = completedWorkflows.flatMap(w => w.steps);
        const completedSteps = allSteps.filter(s => s.status === 'completed');
        const averageStepsCompleted = completedWorkflows.length > 0
          ? Math.round(completedSteps.length / completedWorkflows.length)
          : 0;
        
        // Calculate average step time
        const stepTimes: number[] = [];
        completedWorkflows.forEach(w => {
          w.steps.forEach(step => {
            if (step.completedAt && step.metadata?.startedAt) {
              const start = new Date(step.metadata.startedAt).getTime();
              const end = new Date(step.completedAt).getTime();
              stepTimes.push((end - start) / (1000 * 60 * 60)); // hours
            }
          });
        });
        const averageStepTime = stepTimes.length > 0
          ? Math.round((stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length) * 10) / 10
          : 0;
        
        // Most/least completed steps
        const stepCompletionCounts: Record<string, number> = {};
        completedWorkflows.forEach(w => {
          w.steps.forEach(step => {
            if (step.status === 'completed') {
              stepCompletionCounts[step.id] = (stepCompletionCounts[step.id] || 0) + 1;
            }
          });
        });
        
        const mostCompletedStep = Object.entries(stepCompletionCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const leastCompletedStep = Object.entries(stepCompletionCounts)
          .sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';
        
        // Performance metrics
        const averageProgress = workflowInstances.length > 0
          ? Math.round(workflowInstances.reduce((sum, w) => sum + (w.progress || 0), 0) / workflowInstances.length)
          : 0;
        
        const activeUsers = workflowInstances.filter(w => w.isActive).length;
        
        // Abandonment rate (started but not completed and not active)
        const abandoned = workflowInstances.filter(w => 
          w.startedAt && !w.completedAt && !w.isActive
        ).length;
        const abandonmentRate = startedWorkflows.length > 0
          ? Math.round((abandoned / startedWorkflows.length) * 100)
          : 0;
        
        // Timeline metrics
        const completionDates = completedWorkflows
          .map(w => w.completedAt!)
          .filter(Boolean)
          .sort();
        const firstCompleted = completionDates[0];
        const lastCompleted = completionDates[completionDates.length - 1];
        
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        
        const completionsThisMonth = completedWorkflows.filter(w => {
          if (!w.completedAt) return false;
          const completed = new Date(w.completedAt);
          return completed >= thisMonth;
        }).length;
        
        const completionsLastMonth = completedWorkflows.filter(w => {
          if (!w.completedAt) return false;
          const completed = new Date(w.completedAt);
          return completed >= lastMonth && completed < thisMonth;
        }).length;
        
        // Impact metrics from outcomes
        const outcomes = WorkflowOutcomes.getOutcomes().filter(o => o.workflowId === id);
        const impactMetrics = outcomes.length > 0 ? {
          averageApplicationsSubmitted: Math.round(
            outcomes.reduce((sum, o) => sum + (o.applicationsSubmitted || 0), 0) / outcomes.length
          ),
          averageInterviewsScheduled: Math.round(
            outcomes.reduce((sum, o) => sum + (o.interviewsScheduled || 0), 0) / outcomes.length
          ),
          averageSkillsImproved: Math.round(
            outcomes.reduce((sum, o) => sum + (o.skillsImproved || 0), 0) / outcomes.length
          ),
          averageROI: Math.round(
            outcomes.reduce((sum, o) => {
              const roi = WorkflowOutcomes.calculateROI(id);
              return sum + (roi?.roi || 0);
            }, 0) / outcomes.length
          )
        } : {};
        
        calculatedMetrics.push({
          workflowId: id,
          workflowName: definition.name,
          category: definition.category,
          totalCompletions,
          averageTimeToComplete,
          fastestCompletion,
          slowestCompletion,
          completionRate,
          averageStepsCompleted,
          averageStepTime,
          mostCompletedStep: workflowInstances[0]?.steps?.find(s => s.id === mostCompletedStep)?.name || mostCompletedStep,
          leastCompletedStep: workflowInstances[0]?.steps?.find(s => s.id === leastCompletedStep)?.name || leastCompletedStep,
          averageProgress,
          activeUsers,
          abandonmentRate,
          firstCompleted,
          lastCompleted,
          completionsThisMonth,
          completionsLastMonth,
          ...impactMetrics
        });
      }
      
      setMetrics(calculatedMetrics);
      setIsLoading(false);
    };

    loadMetrics();
  }, [workflowId, timeRange]);

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading performance metrics...</p>
      </div>
    );
  }

  const filteredMetrics = selectedWorkflow === 'all' 
    ? metrics 
    : metrics.filter(m => m.workflowId === selectedWorkflow);

  const selectedMetric = selectedWorkflow !== 'all' 
    ? metrics.find(m => m.workflowId === selectedWorkflow)
    : null;

  // Chart data
  const completionTimeData = filteredMetrics.map(m => ({
    name: m.workflowName.length > 20 ? m.workflowName.substring(0, 20) + '...' : m.workflowName,
    avgTime: m.averageTimeToComplete,
    fastest: m.fastestCompletion,
    slowest: m.slowestCompletion
  }));

  const completionRateData = filteredMetrics.map(m => ({
    name: m.workflowName.length > 20 ? m.workflowName.substring(0, 20) + '...' : m.workflowName,
    completionRate: m.completionRate,
    abandonmentRate: m.abandonmentRate
  }));

  const categoryData = metrics.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + m.totalCompletions;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    color: name === 'Career Hub' ? '#3b82f6' :
           name === 'Brand Building' ? '#a855f7' :
           name === 'Upskilling' ? '#10b981' :
           '#f59e0b'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Workflow Performance Dashboard</h2>
          <p className="text-slate-600 mt-1">Detailed analytics and metrics for all workflows</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value as WorkflowId | 'all')}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium text-sm"
          >
            <option value="all">All Workflows</option>
            {metrics.map(m => (
              <option key={m.workflowId} value={m.workflowId}>{m.workflowName}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {(['overview', 'detailed', 'comparison'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/60 text-slate-700 hover:bg-white/80'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {filteredMetrics.reduce((sum, m) => sum + m.totalCompletions, 0)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Total Completions</h3>
          <p className="text-xs text-slate-600">Across all workflows</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {filteredMetrics.length > 0
                ? Math.round(filteredMetrics.reduce((sum, m) => sum + m.averageTimeToComplete, 0) / filteredMetrics.length)
                : 0}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Avg Time to Complete</h3>
          <p className="text-xs text-slate-600">Days</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {filteredMetrics.length > 0
                ? Math.round(filteredMetrics.reduce((sum, m) => sum + m.completionRate, 0) / filteredMetrics.length)
                : 0}%
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Avg Completion Rate</h3>
          <p className="text-xs text-slate-600">Percentage</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {filteredMetrics.reduce((sum, m) => sum + m.activeUsers, 0)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Active Users</h3>
          <p className="text-xs text-slate-600">Currently working on workflows</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Time Chart */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Completion Time Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={completionTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                stroke="#64748b"
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="avgTime" fill="#6366f1" name="Average" radius={[8, 8, 0, 0]} />
              <Line type="monotone" dataKey="fastest" stroke="#10b981" strokeWidth={2} name="Fastest" />
              <Line type="monotone" dataKey="slowest" stroke="#ef4444" strokeWidth={2} name="Slowest" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Rate Chart */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Completion vs Abandonment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                stroke="#64748b"
              />
              <YAxis 
                domain={[0, 100]}
                stroke="#64748b"
                fontSize={12}
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate" radius={[8, 8, 0, 0]} />
              <Bar dataKey="abandonmentRate" fill="#ef4444" name="Abandonment Rate" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Completions by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Completion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { month: 'Last Month', completions: filteredMetrics.reduce((sum, m) => sum + m.completionsLastMonth, 0) },
              { month: 'This Month', completions: filteredMetrics.reduce((sum, m) => sum + m.completionsThisMonth, 0) }
            ]}>
              <defs>
                <linearGradient id="completionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completions" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#completionsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      {viewMode === 'detailed' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Workflow</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Completions</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Avg Time (days)</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Completion Rate</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Avg Steps</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Active Users</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Abandonment</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((metric) => (
                  <tr key={metric.workflowId} className="border-b border-slate-100 hover:bg-white/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-900">{metric.workflowName}</div>
                        <div className="text-xs text-slate-500">{metric.category}</div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-slate-900">{metric.totalCompletions}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-slate-700">{metric.averageTimeToComplete}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${
                        metric.completionRate >= 70 ? 'text-green-600' :
                        metric.completionRate >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {metric.completionRate}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-slate-700">{metric.averageStepsCompleted}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-slate-700">{metric.activeUsers}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${
                        metric.abandonmentRate <= 20 ? 'text-green-600' :
                        metric.abandonmentRate <= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {metric.abandonmentRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Impact Metrics */}
      {selectedMetric && selectedMetric.averageApplicationsSubmitted !== undefined && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Real-World Impact Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedMetric.averageApplicationsSubmitted !== undefined && (
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 mb-1">Avg Applications</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {selectedMetric.averageApplicationsSubmitted}
                </div>
              </div>
            )}
            {selectedMetric.averageInterviewsScheduled !== undefined && (
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 mb-1">Avg Interviews</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {selectedMetric.averageInterviewsScheduled}
                </div>
              </div>
            )}
            {selectedMetric.averageSkillsImproved !== undefined && (
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 mb-1">Avg Skills Improved</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {selectedMetric.averageSkillsImproved}
                </div>
              </div>
            )}
            {selectedMetric.averageROI !== undefined && (
              <div className="bg-white/80 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 mb-1">Avg ROI</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {selectedMetric.averageROI}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
