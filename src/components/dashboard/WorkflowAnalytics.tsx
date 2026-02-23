import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Target, CheckCircle, Clock, Zap,
  ArrowRight, Calendar, Award, Activity, PieChart, LineChart
} from 'lucide-react';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId } from '../../lib/workflowTracking';
import WorkflowImpactMetricsComponent from './WorkflowImpactMetrics';
import WorkflowWizard from '../workflows/WorkflowWizard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line, Area, AreaChart
} from 'recharts';

interface WorkflowAnalyticsProps {
  workflows: any[];
}

export default function WorkflowAnalytics({ workflows }: WorkflowAnalyticsProps) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [wizardWorkflowId, setWizardWorkflowId] = useState<WorkflowId | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const getWorkflowDefinition = (id: unknown) => {
    if (typeof id !== 'string') return undefined;
    return WORKFLOW_DEFINITIONS[id as WorkflowId];
  };

  // Calculate analytics
  const activeWorkflows = workflows.filter(w => w.isActive);
  const completedWorkflows = workflows.filter(w => w.completedAt);
  const notStartedWorkflows = workflows.filter(w => !w.isActive && !w.completedAt);

  // Calculate completion rate
  const totalStarted = activeWorkflows.length + completedWorkflows.length;
  const completionRate = totalStarted > 0 
    ? Math.round((completedWorkflows.length / totalStarted) * 100) 
    : 0;

  // Calculate average progress
  const averageProgress = workflows.length > 0
    ? Math.round(workflows.reduce((sum, w) => sum + (w.progress || 0), 0) / workflows.length)
    : 0;

  // Calculate total steps completed
  const totalStepsCompleted = workflows.reduce((sum, w) => {
    return sum + w.steps.filter((s: any) => s.status === 'completed').length;
  }, 0);

  // Calculate total steps
  const totalSteps = workflows.reduce((sum, w) => sum + w.steps.length, 0);

  // Workflow progress data for bar chart
  const workflowProgressData = workflows.map(w => ({
    name: getWorkflowDefinition(w.id)?.name || String(w.id),
    progress: w.progress || 0,
    category: getWorkflowDefinition(w.id)?.category || 'Other',
    status: w.completedAt ? 'Completed' : w.isActive ? 'Active' : 'Not Started'
  }));

  // Status distribution for pie chart
  const statusData = [
    { name: 'Completed', value: completedWorkflows.length, color: '#10b981' },
    { name: 'Active', value: activeWorkflows.length, color: '#3b82f6' },
    { name: 'Not Started', value: notStartedWorkflows.length, color: '#94a3b8' }
  ];

  // Category distribution
  const categoryData = workflows.reduce((acc: any, w) => {
    const category = getWorkflowDefinition(w.id)?.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Number(value),
    color: name === 'Career Hub' ? '#3b82f6' : 
           name === 'Brand Building' ? '#a855f7' : 
           name === 'Upskilling' ? '#10b981' : 
           '#f59e0b'
  }));

  // Steps completion timeline (simulated - in real app would track actual dates)
  const stepsTimeline = workflows.flatMap(w => 
    w.steps
      .filter((s: any) => s.completedAt)
      .map((s: any) => ({
        date: new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        workflow: getWorkflowDefinition(w.id)?.name || String(w.id),
        step: s.name
      }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by date for timeline chart
  const timelineData = stepsTimeline.reduce((acc: any, item) => {
    if (!acc[item.date]) {
      acc[item.date] = 0;
    }
    acc[item.date]++;
    return acc;
  }, {});

  const timelineChartData = Object.entries(timelineData).map(([date, count]) => ({
    date,
    steps: count
  }));

  // Get top performing workflows
  const topWorkflows = [...workflows]
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 3);

  // Get recommended next workflows
  const getRecommendedNext = (): WorkflowId[] => {
    const completedIds = completedWorkflows.map(w => w.id);
    const activeIds = activeWorkflows.map(w => w.id);
    
    // If user completed Job Application Pipeline, suggest Interview Prep
    if (completedIds.includes('job-application-pipeline')) {
      if (!activeIds.includes('interview-preparation-ecosystem') && !completedIds.includes('interview-preparation-ecosystem')) {
        return ['interview-preparation-ecosystem'];
      }
    }
    
    // If user completed Skill Development, suggest Market Intelligence
    if (completedIds.includes('skill-development-advancement')) {
      if (!activeIds.includes('market-intelligence-career-strategy') && !completedIds.includes('market-intelligence-career-strategy')) {
        return ['market-intelligence-career-strategy'];
      }
    }
    
    return [];
  };

  const recommendedNext = getRecommendedNext();

  if (workflows.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-8 text-center">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Workflows Yet</h3>
        <p className="text-slate-600 mb-6">Start a workflow to see your analytics and progress here.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all flex items-center gap-2 mx-auto"
        >
          Browse Workflows
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Workflow Analytics</h2>
          <p className="text-slate-600 mt-1">Track your progress and performance across all workflows</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                timeRange === range
                  ? 'bg-slate-600 text-white'
                  : 'bg-white/60 text-slate-700 hover:bg-white/80'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-slate-600" />
            </div>
            <span className="text-2xl font-bold text-slate-600">{workflows.length}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Total Workflows</h3>
          <p className="text-xs text-slate-600">Started or completed</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Completion Rate</h3>
          <p className="text-xs text-slate-600">{completedWorkflows.length} of {totalStarted} completed</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{averageProgress}%</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Average Progress</h3>
          <p className="text-xs text-slate-600">Across all workflows</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{totalStepsCompleted}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Steps Completed</h3>
          <p className="text-xs text-slate-600">{totalStepsCompleted} of {totalSteps} total</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Progress Bar Chart */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Workflow Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workflowProgressData}>
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}%`, 'Progress']}
              />
              <Bar dataKey="progress" fill="#6366f1" radius={[8, 8, 0, 0]}>
                {workflowProgressData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.status === 'Completed' ? '#10b981' :
                      entry.status === 'Active' ? '#3b82f6' :
                      '#94a3b8'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-World Impact Metrics */}
      <WorkflowImpactMetricsComponent showAll={true} />

      {/* Category Distribution and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Workflows by Category</h3>
          <div className="space-y-3">
            {categoryChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{item.name}</span>
                    <span className="text-sm font-bold text-slate-700">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(item.value / workflows.length) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Completion Timeline */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Steps Completion Timeline</h3>
          {timelineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineChartData}>
                <defs>
                  <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="steps" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#stepsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No steps completed yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Workflows and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Workflows */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Performing Workflows
          </h3>
          <div className="space-y-4">
            {topWorkflows.map((workflow, index) => {
              const definition = getWorkflowDefinition(workflow.id);
              return (
                <div 
                  key={workflow.id}
                  className="flex items-center gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all cursor-pointer"
                  onClick={() => {
                    const nextStep = WorkflowTracking.getNextStep(workflow.id as WorkflowId);
                    if (nextStep) {
                      navigate(nextStep.featurePath);
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{definition?.name || workflow.id}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-slate-600 h-2 rounded-full transition-all"
                          style={{ width: `${workflow.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{workflow.progress || 0}%</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Recommended Next
          </h3>
          {recommendedNext.length > 0 ? (
            <div className="space-y-4">
              {recommendedNext.map((workflowId) => {
                const definition = WORKFLOW_DEFINITIONS[workflowId];
                return (
                  <div
                    key={workflowId}
                    className="p-4 bg-gradient-to-r from-slate-50 to-purple-50 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer"
                    onClick={async () => {
                      const workflow = await WorkflowTracking.initializeWorkflow(workflowId);
                      const firstStep = workflow.steps.find(s => s.status === 'not-started') || workflow.steps[0];
                      if (firstStep) {
                        navigate(firstStep.featurePath);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{definition?.name}</h4>
                        <p className="text-sm text-slate-600 mb-3">{definition?.description}</p>
                        <button className="px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center gap-2 text-sm">
                          Start Workflow
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keep working on your current workflows!</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Workflows Quick View */}
      {activeWorkflows.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Active Workflows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorkflows.map((workflow) => {
              const definition = getWorkflowDefinition(workflow.id);
              const nextStep = WorkflowTracking.getNextStep(workflow.id as WorkflowId);
              return (
                <div
                  key={workflow.id}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all cursor-pointer"
                  onClick={() => {
                    // Open wizard for active workflow
                    setWizardWorkflowId(workflow.id);
                    setIsWizardOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{definition?.name}</h4>
                      <p className="text-xs text-slate-600">{definition?.category}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {workflow.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${workflow.progress || 0}%` }}
                    />
                  </div>
                  {nextStep && (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">Next: {nextStep.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Workflow Wizard */}
      {wizardWorkflowId && (
        <WorkflowWizard
          workflowId={wizardWorkflowId}
          isOpen={isWizardOpen}
          onClose={() => {
            setIsWizardOpen(false);
            setWizardWorkflowId(null);
          }}
        />
      )}
    </div>
  );
}

