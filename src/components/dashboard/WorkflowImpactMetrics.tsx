import { useState, useEffect } from 'react';
import { WorkflowOutcomes, type WorkflowImpactMetrics } from '../../lib/workflowOutcomes';
import { WorkflowTracking, WORKFLOW_DEFINITIONS, type WorkflowId } from '../../lib/workflowTracking';
import {
  Briefcase, Calendar, TrendingUp, Award, FileText, Target,
  DollarSign, BarChart3, ArrowRight, CheckCircle
} from 'lucide-react';

interface WorkflowImpactMetricsProps {
  workflowId?: WorkflowId;
  showAll?: boolean;
}

export default function WorkflowImpactMetricsComponent({ 
  workflowId, 
  showAll = false 
}: WorkflowImpactMetricsProps) {
  const [impactMetrics, setImpactMetrics] = useState<WorkflowImpactMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // Check and track outcomes for completed workflows
      await WorkflowOutcomes.checkAndTrackOutcomes();
      
      // Load impact metrics
      if (workflowId) {
        const metrics = WorkflowOutcomes.getImpactMetrics(workflowId);
        setImpactMetrics(metrics ? [metrics] : []);
      } else if (showAll) {
        const allMetrics = WorkflowOutcomes.getAllImpactMetrics();
        setImpactMetrics(allMetrics);
      } else {
        // Show metrics for completed workflows
        const workflows = WorkflowTracking.getAllWorkflows();
        const completedWorkflows = workflows.filter(w => w.completedAt);
        const metrics = completedWorkflows
          .map(w => WorkflowOutcomes.getImpactMetrics(w.id))
          .filter((m): m is WorkflowImpactMetrics => m !== null);
        setImpactMetrics(metrics);
      }
      
      setIsLoading(false);
    };

    loadMetrics();
  }, [workflowId, showAll]);

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (impactMetrics.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-8 text-center">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Impact Data Yet</h3>
        <p className="text-slate-600">Complete workflows to see your real-world impact metrics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-slate-900">Your Workflow Impact</h2>
      </div>

      {impactMetrics.map((metrics) => {
        const definition = WORKFLOW_DEFINITIONS[metrics.workflowId];
        const roi = WorkflowOutcomes.calculateROI(metrics.workflowId);

        const getCategoryColor = (category: string) => {
          switch (category) {
            case 'Career Hub': return {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              text: 'text-blue-600',
              bgDark: 'bg-blue-600'
            };
            case 'Brand Building': return {
              bg: 'bg-purple-50',
              border: 'border-purple-200',
              text: 'text-purple-600',
              bgDark: 'bg-purple-600'
            };
            case 'Upskilling': return {
              bg: 'bg-green-50',
              border: 'border-green-200',
              text: 'text-green-600',
              bgDark: 'bg-green-600'
            };
            case 'Cross-Category': return {
              bg: 'bg-orange-50',
              border: 'border-orange-200',
              text: 'text-orange-600',
              bgDark: 'bg-orange-600'
            };
            default: return {
              bg: 'bg-indigo-50',
              border: 'border-indigo-200',
              text: 'text-indigo-600',
              bgDark: 'bg-indigo-600'
            };
          }
        };

        const colors = getCategoryColor(definition.category);

        return (
          <div
            key={metrics.workflowId}
            className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 shadow-lg`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${colors.bgDark} rounded-lg flex items-center justify-center text-white`}>
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${colors.text}`}>
                    {metrics.workflowName}
                  </h3>
                  <p className="text-sm text-slate-600">{definition.category}</p>
                </div>
              </div>
              {roi && (
                <div className="text-right">
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    ${roi.estimatedValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">Estimated Value</div>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Job Application Pipeline Metrics */}
              {metrics.applicationsSubmitted !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Applications</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metrics.applicationsSubmitted}
                  </div>
                  <div className="text-xs text-slate-500">submitted</div>
                </div>
              )}

              {metrics.interviewsScheduled !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Interviews</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metrics.interviewsScheduled}
                  </div>
                  <div className="text-xs text-slate-500">scheduled</div>
                </div>
              )}

              {metrics.averageMatchScore !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Match Score</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metrics.averageMatchScore}%
                  </div>
                  <div className="text-xs text-slate-500">average</div>
                </div>
              )}

              {/* Skill Development Metrics */}
              {metrics.skillsImproved !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Skills</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metrics.skillsImproved}
                  </div>
                  <div className="text-xs text-slate-500">improved</div>
                </div>
              )}

              {metrics.certificationsEarned !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Certifications</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metrics.certificationsEarned}
                  </div>
                  <div className="text-xs text-slate-500">earned</div>
                </div>
              )}

              {/* Brand Building Metrics */}
              {metrics.brandScoreIncrease !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Brand Score</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    +{metrics.brandScoreIncrease}
                  </div>
                  <div className="text-xs text-slate-500">points increase</div>
                </div>
              )}

              {metrics.contentCreated !== undefined && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-xs font-medium text-slate-600">Content</span>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metrics.contentCreated}
                  </div>
                  <div className="text-xs text-slate-500">pieces created</div>
                </div>
              )}

              {/* ROI Metrics */}
              {roi && (
                <div className="bg-white/80 rounded-lg p-4 col-span-2 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-4 h-4 ${colors.text}`} />
                        <span className="text-xs font-medium text-slate-600">ROI Estimate</span>
                      </div>
                      <div className={`text-xl font-bold ${colors.text}`}>
                        {roi.roi > 0 ? `+${roi.roi}%` : `${roi.roi}%`} ROI
                      </div>
                      <div className="text-xs text-slate-500">
                        {roi.timeInvested} days invested • ${roi.estimatedValue.toLocaleString()} estimated value
                      </div>
                    </div>
                    {roi.roi > 100 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Excellent ROI</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
