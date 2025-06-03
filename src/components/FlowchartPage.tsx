import React, { useState } from 'react';
import { Users, UserCheck, Shield } from 'lucide-react';

interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  x: number;
  y: number;
}

interface FlowchartConnection {
  from: string;
  to: string;
  label?: string;
}

const FlowchartPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'student' | 'counselor' | 'admin'>('student');
  const studentFlow: { nodes: FlowchartNode[]; connections: FlowchartConnection[] } = {    nodes: [      { id: 'start', label: 'Student Login\n(Username/Password)', type: 'start', x: 800, y: 100 },
      { id: 'dashboard', label: 'View Personal\nDashboard', type: 'process', x: 800, y: 200 },
      { id: 'notifications', label: 'Check Notifications\n& Alerts', type: 'process', x: 800, y: 300 },
      { id: 'choose', label: 'Select Main\nActivity', type: 'decision', x: 800, y: 400 },// Mental Health Assessment Branch (Left side)
      { id: 'mental_assess', label: 'Mental Health\nAssessment Menu', type: 'process', x: 300, y: 520 },
      { id: 'choose_assessment', label: 'Choose Assessment\nType', type: 'decision', x: 300, y: 620 },      { id: 'phq9', label: 'PHQ-9\n(Depression)', type: 'process', x: 120, y: 720 },
      { id: 'gad7', label: 'GAD-7\n(Anxiety)', type: 'process', x: 300, y: 720 },
      { id: 'dass21', label: 'DASS-21\n(Stress)', type: 'process', x: 480, y: 720 },
      { id: 'mental_results', label: 'View Assessment\nResults & Insights', type: 'process', x: 300, y: 820 },      // Career Exploration Branch (Center)
      { id: 'career_menu', label: 'Career Exploration\nMenu', type: 'process', x: 800, y: 520 },
      { id: 'choose_career', label: 'Choose Career\nTool', type: 'decision', x: 800, y: 620 },      { id: 'mbti', label: 'MBTI\n(Personality)', type: 'process', x: 650, y: 720 },
      { id: 'riasec', label: 'RIASEC\n(Interests)', type: 'process', x: 800, y: 720 },
      { id: 'skills', label: 'Skills\nAssessment', type: 'process', x: 950, y: 720 },
      { id: 'career_results', label: 'View Career\nRecommendations', type: 'process', x: 800, y: 820 },// Profile & Settings Branch (Right side)
      { id: 'profile_menu', label: 'Profile &\nSettings', type: 'process', x: 1300, y: 520 },
      { id: 'profile_choose', label: 'Profile\nOptions', type: 'decision', x: 1300, y: 620 },      { id: 'edit_profile', label: 'Edit Personal\nInformation', type: 'process', x: 1150, y: 720 },
      { id: 'privacy', label: 'Privacy\nSettings', type: 'process', x: 1300, y: 720 },
      { id: 'history', label: 'View Assessment\nHistory', type: 'process', x: 1450, y: 720 },
      { id: 'profile_updated', label: 'Profile\nUpdated', type: 'process', x: 1300, y: 820 },        // Common paths (Center bottom)
      { id: 'counseling_req', label: 'Request Counseling\nSession', type: 'process', x: 800, y: 940 },
      { id: 'final_review', label: 'Review All\nResults', type: 'process', x: 800, y: 1040 },
      { id: 'end', label: 'Logout &\nSession End', type: 'end', x: 800, y: 1140 }
    ],
    connections: [
      { from: 'start', to: 'dashboard' },
      { from: 'dashboard', to: 'notifications' },
      { from: 'notifications', to: 'choose' },
      
      // Mental Health branch
      { from: 'choose', to: 'mental_assess', label: 'Mental Health' },
      { from: 'mental_assess', to: 'choose_assessment' },
      { from: 'choose_assessment', to: 'phq9', label: 'Depression' },
      { from: 'choose_assessment', to: 'gad7', label: 'Anxiety' },
      { from: 'choose_assessment', to: 'dass21', label: 'Stress' },
      { from: 'phq9', to: 'mental_results' },
      { from: 'gad7', to: 'mental_results' },
      { from: 'dass21', to: 'mental_results' },
      { from: 'mental_results', to: 'counseling_req' },
      
      // Career branch
      { from: 'choose', to: 'career_menu', label: 'Career' },
      { from: 'career_menu', to: 'choose_career' },
      { from: 'choose_career', to: 'mbti', label: 'Personality' },
      { from: 'choose_career', to: 'riasec', label: 'Interests' },
      { from: 'choose_career', to: 'skills', label: 'Skills' },
      { from: 'mbti', to: 'career_results' },
      { from: 'riasec', to: 'career_results' },
      { from: 'skills', to: 'career_results' },
      { from: 'career_results', to: 'counseling_req' },
      
      // Profile branch
      { from: 'choose', to: 'profile_menu', label: 'Profile' },
      { from: 'profile_menu', to: 'profile_choose' },
      { from: 'profile_choose', to: 'edit_profile', label: 'Edit Info' },
      { from: 'profile_choose', to: 'privacy', label: 'Privacy' },
      { from: 'profile_choose', to: 'history', label: 'History' },
      { from: 'edit_profile', to: 'profile_updated' },
      { from: 'privacy', to: 'profile_updated' },
      { from: 'history', to: 'profile_updated' },
      { from: 'profile_updated', to: 'counseling_req' },
      
      // Final paths
      { from: 'counseling_req', to: 'final_review' },
      { from: 'final_review', to: 'end' }
    ]
  };  const counselorFlow: { nodes: FlowchartNode[]; connections: FlowchartConnection[] } = {    nodes: [      { id: 'start', label: 'Counselor Login\n(Secure Access)', type: 'start', x: 800, y: 100 },
      { id: 'dashboard', label: 'Counselor\nDashboard', type: 'process', x: 800, y: 200 },
      { id: 'alerts', label: 'Check Priority\nAlerts & Cases', type: 'process', x: 800, y: 300 },
      { id: 'choose', label: 'Select Main\nActivity', type: 'decision', x: 800, y: 400 },// Student Management Branch (Left side)
      { id: 'student_mgmt', label: 'Student\nManagement', type: 'process', x: 300, y: 520 },
      { id: 'student_choose', label: 'Student\nActions', type: 'decision', x: 300, y: 620 },      { id: 'view_students', label: 'View Student\nProfiles & Classes', type: 'process', x: 120, y: 720 },
      { id: 'assign_class', label: 'Assign Students\nto Classes', type: 'process', x: 300, y: 720 },
      { id: 'track_progress', label: 'Track Student\nProgress', type: 'process', x: 480, y: 720 },
      { id: 'student_report', label: 'Generate Student\nProgress Report', type: 'process', x: 300, y: 820 },      // Counseling Sessions Branch (Center)
      { id: 'sessions_menu', label: 'Counseling\nSessions', type: 'process', x: 800, y: 520 },
      { id: 'session_choose', label: 'Session\nType', type: 'decision', x: 800, y: 620 },      { id: 'individual', label: 'Individual\nCounseling', type: 'process', x: 650, y: 720 },
      { id: 'group', label: 'Group\nCounseling', type: 'process', x: 800, y: 720 },
      { id: 'crisis', label: 'Crisis\nIntervention', type: 'process', x: 950, y: 720 },
      { id: 'session_notes', label: 'Record Session\nNotes & Plans', type: 'process', x: 800, y: 820 },      // Reports & Analytics Branch (Right side)
      { id: 'reports_menu', label: 'Reports &\nAnalytics', type: 'process', x: 1300, y: 520 },
      { id: 'report_choose', label: 'Report\nType', type: 'decision', x: 1300, y: 620 },      { id: 'mental_health_report', label: 'Mental Health\nTrends', type: 'process', x: 1150, y: 720 },
      { id: 'class_report', label: 'Class Performance\nAnalysis', type: 'process', x: 1300, y: 720 },
      { id: 'outcome_report', label: 'Counseling\nOutcomes', type: 'process', x: 1450, y: 720 },
      { id: 'analytics', label: 'Advanced Analytics\n& Insights', type: 'process', x: 1300, y: 820 },
        // Follow-up actions (Center bottom)
      { id: 'recommendations', label: 'Create Treatment\nRecommendations', type: 'process', x: 800, y: 940 },
      { id: 'referrals', label: 'External Referrals\n& Resources', type: 'process', x: 800, y: 1040 },
      { id: 'end', label: 'Complete Session\n& Logout', type: 'end', x: 800, y: 1140 }
    ],
    connections: [
      { from: 'start', to: 'dashboard' },
      { from: 'dashboard', to: 'alerts' },
      { from: 'alerts', to: 'choose' },
      
      // Student Management branch
      { from: 'choose', to: 'student_mgmt', label: 'Students' },
      { from: 'student_mgmt', to: 'student_choose' },
      { from: 'student_choose', to: 'view_students', label: 'View' },
      { from: 'student_choose', to: 'assign_class', label: 'Assign' },
      { from: 'student_choose', to: 'track_progress', label: 'Track' },
      { from: 'view_students', to: 'student_report' },
      { from: 'assign_class', to: 'student_report' },
      { from: 'track_progress', to: 'student_report' },
      { from: 'student_report', to: 'recommendations' },
      
      // Sessions branch
      { from: 'choose', to: 'sessions_menu', label: 'Sessions' },
      { from: 'sessions_menu', to: 'session_choose' },
      { from: 'session_choose', to: 'individual', label: 'Individual' },
      { from: 'session_choose', to: 'group', label: 'Group' },
      { from: 'session_choose', to: 'crisis', label: 'Crisis' },
      { from: 'individual', to: 'session_notes' },
      { from: 'group', to: 'session_notes' },
      { from: 'crisis', to: 'session_notes' },
      { from: 'session_notes', to: 'recommendations' },
      
      // Reports branch
      { from: 'choose', to: 'reports_menu', label: 'Reports' },
      { from: 'reports_menu', to: 'report_choose' },
      { from: 'report_choose', to: 'mental_health_report', label: 'Mental Health' },
      { from: 'report_choose', to: 'class_report', label: 'Classes' },
      { from: 'report_choose', to: 'outcome_report', label: 'Outcomes' },
      { from: 'mental_health_report', to: 'analytics' },
      { from: 'class_report', to: 'analytics' },
      { from: 'outcome_report', to: 'analytics' },
      { from: 'analytics', to: 'recommendations' },
      
      // Final paths
      { from: 'recommendations', to: 'referrals' },
      { from: 'referrals', to: 'end' }
    ]
  };  const adminFlow: { nodes: FlowchartNode[]; connections: FlowchartConnection[] } = {    nodes: [      { id: 'start', label: 'Admin Login\n(Multi-Factor Auth)', type: 'start', x: 800, y: 100 },
      { id: 'dashboard', label: 'Administrator\nDashboard', type: 'process', x: 800, y: 200 },
      { id: 'system_check', label: 'System Health\nCheck', type: 'process', x: 800, y: 300 },
      { id: 'choose', label: 'Administrative\nTask Category', type: 'decision', x: 800, y: 400 },// User Management Branch (Left side)
      { id: 'user_mgmt', label: 'User Management\nSystem', type: 'process', x: 300, y: 520 },
      { id: 'user_choose', label: 'User\nOperations', type: 'decision', x: 300, y: 620 },      { id: 'create_users', label: 'Create New\nUsers & Roles', type: 'process', x: 120, y: 720 },
      { id: 'manage_counselors', label: 'Manage Counselor\nAccounts', type: 'process', x: 300, y: 720 },
      { id: 'bulk_student', label: 'Bulk Student\nImport/Export', type: 'process', x: 480, y: 720 },
      { id: 'user_audit', label: 'User Activity\nAudit Log', type: 'process', x: 300, y: 820 },      // System Configuration Branch (Center)
      { id: 'system_config', label: 'System\nConfiguration', type: 'process', x: 800, y: 520 },
      { id: 'config_choose', label: 'Configuration\nType', type: 'decision', x: 800, y: 620 },      { id: 'database_config', label: 'Database\nConfiguration', type: 'process', x: 650, y: 720 },
      { id: 'assessment_config', label: 'Assessment Tools\nConfiguration', type: 'process', x: 800, y: 720 },
      { id: 'notification_config', label: 'Notification\nSettings', type: 'process', x: 950, y: 720 },
      { id: 'system_update', label: 'System Updates\n& Maintenance', type: 'process', x: 800, y: 820 },      // Analytics & Reports Branch (Right side)
      { id: 'analytics_menu', label: 'System Analytics\n& Reports', type: 'process', x: 1300, y: 520 },
      { id: 'analytics_choose', label: 'Analytics\nType', type: 'decision', x: 1300, y: 620 },      { id: 'usage_stats', label: 'System Usage\nStatistics', type: 'process', x: 1150, y: 720 },
      { id: 'performance_metrics', label: 'Performance\nMetrics', type: 'process', x: 1300, y: 720 },
      { id: 'compliance_report', label: 'Compliance &\nSecurity Report', type: 'process', x: 1450, y: 720 },
      { id: 'comprehensive_report', label: 'Generate\nComprehensive Report', type: 'process', x: 1300, y: 820 },// Security & Backup Operations (Center bottom) - Fixed coordinates with proper spacing
      { id: 'security_ops', label: 'Security &\nBackup Operations', type: 'process', x: 800, y: 940 },
      { id: 'security_choose', label: 'Security\nTask', type: 'decision', x: 800, y: 1040 },
      { id: 'backup', label: 'Data Backup\n& Recovery', type: 'process', x: 600, y: 1140 },
      { id: 'security_scan', label: 'Security Scan\n& Monitoring', type: 'process', x: 800, y: 1140 },
      { id: 'access_control', label: 'Access Control\nManagement', type: 'process', x: 1000, y: 1140 },
      
      { id: 'final_review', label: 'Final System\nReview', type: 'process', x: 800, y: 1240 },
      { id: 'end', label: 'Secure Logout\n& Session End', type: 'end', x: 800, y: 1340 }
    ],
    connections: [
      { from: 'start', to: 'dashboard' },
      { from: 'dashboard', to: 'system_check' },
      { from: 'system_check', to: 'choose' },
      
      // User Management branch
      { from: 'choose', to: 'user_mgmt', label: 'Users' },
      { from: 'user_mgmt', to: 'user_choose' },
      { from: 'user_choose', to: 'create_users', label: 'Create' },
      { from: 'user_choose', to: 'manage_counselors', label: 'Counselors' },
      { from: 'user_choose', to: 'bulk_student', label: 'Bulk Ops' },
      { from: 'create_users', to: 'user_audit' },
      { from: 'manage_counselors', to: 'user_audit' },
      { from: 'bulk_student', to: 'user_audit' },
      { from: 'user_audit', to: 'security_ops' },
      
      // System Configuration branch
      { from: 'choose', to: 'system_config', label: 'Config' },
      { from: 'system_config', to: 'config_choose' },
      { from: 'config_choose', to: 'database_config', label: 'Database' },
      { from: 'config_choose', to: 'assessment_config', label: 'Assessments' },
      { from: 'config_choose', to: 'notification_config', label: 'Notifications' },
      { from: 'database_config', to: 'system_update' },
      { from: 'assessment_config', to: 'system_update' },
      { from: 'notification_config', to: 'system_update' },
      { from: 'system_update', to: 'security_ops' },
      
      // Analytics branch
      { from: 'choose', to: 'analytics_menu', label: 'Analytics' },
      { from: 'analytics_menu', to: 'analytics_choose' },
      { from: 'analytics_choose', to: 'usage_stats', label: 'Usage' },
      { from: 'analytics_choose', to: 'performance_metrics', label: 'Performance' },
      { from: 'analytics_choose', to: 'compliance_report', label: 'Compliance' },
      { from: 'usage_stats', to: 'comprehensive_report' },
      { from: 'performance_metrics', to: 'comprehensive_report' },
      { from: 'compliance_report', to: 'comprehensive_report' },
      { from: 'comprehensive_report', to: 'security_ops' },
      
      // Security operations
      { from: 'security_ops', to: 'security_choose' },
      { from: 'security_choose', to: 'backup', label: 'Backup' },
      { from: 'security_choose', to: 'security_scan', label: 'Security' },
      { from: 'security_choose', to: 'access_control', label: 'Access' },
      { from: 'backup', to: 'final_review' },
      { from: 'security_scan', to: 'final_review' },
      { from: 'access_control', to: 'final_review' },
      { from: 'final_review', to: 'end' }
    ]
  };

  const getFlowData = () => {
    switch (activeView) {
      case 'student': return studentFlow;
      case 'counselor': return counselorFlow;
      case 'admin': return adminFlow;
      default: return studentFlow;
    }
  };
  const getNodeStyle = (type: string) => {
    const baseStyle = {
      strokeWidth: 2,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };
    
    switch (type) {
      case 'start':
        return { ...baseStyle, fill: '#10b981', stroke: '#059669' };
      case 'process':
        return { ...baseStyle, fill: '#3b82f6', stroke: '#2563eb' };
      case 'decision':
        return { ...baseStyle, fill: '#f59e0b', stroke: '#d97706' };
      case 'end':
        return { ...baseStyle, fill: '#ef4444', stroke: '#dc2626' };
      default:
        return { ...baseStyle, fill: '#6b7280', stroke: '#4b5563' };
    }
  };

  const renderNode = (node: FlowchartNode) => {
    const isDecision = node.type === 'decision';
    const width = 120;
    const height = 60;
    
    return (
      <g key={node.id} className="flowchart-node group">
        {isDecision ? (
          <polygon
            points={`${node.x},${node.y - height/2} ${node.x + width/2},${node.y} ${node.x},${node.y + height/2} ${node.x - width/2},${node.y}`}
            style={getNodeStyle(node.type)}
            className="group-hover:brightness-110"
          />
        ) : (
          <rect
            x={node.x - width/2}
            y={node.y - height/2}
            width={width}
            height={height}
            rx={node.type === 'start' || node.type === 'end' ? 25 : 8}
            style={getNodeStyle(node.type)}
            className="group-hover:brightness-110"
          />
        )}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-xs font-medium pointer-events-none"
          style={{ fontSize: '11px' }}
        >
          {node.label.split('\n').map((line, i) => (
            <tspan key={i} x={node.x} dy={i === 0 ? 0 : 12}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  const renderConnection = (connection: FlowchartConnection, nodes: FlowchartNode[]) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate start and end points with node padding
    const padding = 60;
    const startX = fromNode.x + (dx / distance) * padding;
    const startY = fromNode.y + (dy / distance) * padding;
    const endX = toNode.x - (dx / distance) * padding;
    const endY = toNode.y - (dy / distance) * padding;

    // Calculate arrow head
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    const angle = Math.atan2(dy, dx);
    
    const arrowX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
    const arrowX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = endY - arrowLength * Math.sin(angle + arrowAngle);

    return (
      <g key={`${connection.from}-${connection.to}`} className="flowchart-connection">
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#6b7280"
          strokeWidth="2"
          className="hover:stroke-blue-500 transition-colors"
        />
        <polygon
          points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill="#6b7280"
          className="hover:fill-blue-500 transition-colors"
        />
        {connection.label && (
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2 - 8}
            textAnchor="middle"
            className="fill-gray-600 text-xs font-medium bg-white"
            style={{ fontSize: '10px' }}
          >
            <tspan className="bg-white px-1">{connection.label}</tspan>
          </text>
        )}
      </g>
    );
  };  const flowData = getFlowData();
  return (
    <div className="bg-gray-50 p-1">
      <div className="w-full">{/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Workflow Flowchart
          </h1>
          <p className="text-base text-gray-600 max-w-4xl mx-auto">
            Interactive flowchart showing the workflow from three different perspectives: 
            Student, Counselor, and Administrator
          </p>
        </div>        {/* View Selector */}
        <div className="flex justify-center mb-3">
          <div className="bg-white rounded-lg shadow-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveView('student')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'student'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student View</span>
            </button>
            <button
              onClick={() => setActiveView('counselor')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'counselor'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Counselor View</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'admin'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin View</span>
            </button>
          </div>
        </div>        {/* Legend */}
        <div className="flex justify-center mb-3">
          <div className="bg-white rounded-lg shadow-lg p-3">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Legend</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-700">Start</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-700">Process</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 transform rotate-45"></div>
                <span className="text-xs text-gray-700">Decision</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-700">End</span>
              </div>
            </div>
          </div>
        </div>        {/* Flowchart */}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto overflow-y-hidden">
          <div className="w-full">
            <svg width="100%" height="1300" viewBox="0 0 1600 1350" className="w-full min-w-[1600px]" preserveAspectRatio="xMidYTop meet">
              {/* Render connections first (so they appear behind nodes) */}
              {flowData.connections.map(connection =>
                renderConnection(connection, flowData.nodes)
              )}
              
              {/* Render nodes */}
              {flowData.nodes.map(node => renderNode(node))}
            </svg>
          </div>
        </div>        {/* Description */}
        <div className="mt-3 bg-white rounded-lg shadow-lg p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeView === 'student' && 'Student Workflow Description'}
            {activeView === 'counselor' && 'Counselor Workflow Description'}
            {activeView === 'admin' && 'Administrator Workflow Description'}
          </h3>          <div className="text-gray-700 space-y-1 text-sm">
            {activeView === 'student' && (
              <>
                <p><strong>Comprehensive Student Journey:</strong></p>
                <p>• <strong>Authentication & Dashboard:</strong> Secure login with personalized dashboard showing progress and notifications</p>
                <p>• <strong>Mental Health Assessment:</strong> Complete PHQ-9 (depression), GAD-7 (anxiety), and DASS-21 (stress) assessments</p>
                <p>• <strong>Career Exploration:</strong> Take MBTI personality test, RIASEC interest inventory, and skills assessment</p>
                <p>• <strong>Profile Management:</strong> Update personal information, privacy settings, and view assessment history</p>
                <p>• <strong>Counseling Integration:</strong> Request counseling sessions based on assessment results</p>
                <p>• <strong>Results & Recommendations:</strong> Comprehensive review of all assessment results with personalized insights</p>
              </>
            )}
            {activeView === 'counselor' && (
              <>
                <p><strong>Professional Counselor Workflow:</strong></p>
                <p>• <strong>Secure Access:</strong> Multi-role authentication with priority alerts and urgent case notifications</p>
                <p>• <strong>Student Management:</strong> View student profiles, assign to classes, and track individual progress</p>
                <p>• <strong>Counseling Sessions:</strong> Conduct individual, group, and crisis intervention sessions with detailed documentation</p>
                <p>• <strong>Advanced Analytics:</strong> Mental health trends, class performance analysis, and counseling outcome reports</p>
                <p>• <strong>Treatment Planning:</strong> Create comprehensive treatment recommendations and manage external referrals</p>
                <p>• <strong>Professional Documentation:</strong> Session notes, progress tracking, and resource coordination</p>
              </>
            )}
            {activeView === 'admin' && (
              <>
                <p><strong>System Administration & Management:</strong></p>
                <p>• <strong>Secure Administration:</strong> Multi-factor authentication with comprehensive system health monitoring</p>
                <p>• <strong>User Management:</strong> Create/manage users, bulk student operations, and counselor account administration</p>
                <p>• <strong>System Configuration:</strong> Database management, assessment tool configuration, and notification settings</p>
                <p>• <strong>Advanced Analytics:</strong> System usage statistics, performance metrics, and compliance reporting</p>
                <p>• <strong>Security Operations:</strong> Data backup/recovery, security scanning, and access control management</p>
                <p>• <strong>Comprehensive Oversight:</strong> System-wide monitoring, maintenance operations, and final security review</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartPage;
