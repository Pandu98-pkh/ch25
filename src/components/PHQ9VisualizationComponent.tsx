import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
// Import directly instead of using require
import { usePHQ9ML as useActualPHQ9ML } from './PHQ9MachineLearningProvider';

// Define interfaces since the provider might not exist yet
interface PHQ9Assessment {
  id: string;
  score: number;
  date: string;
  responses?: {
    questionId: number;
    answer: number;
  }[];
}

interface MLPrediction {
  trend: 'improving' | 'stable' | 'worsening';
  confidence: number;
  nextPredictedScore?: number;
  recommendedInterventions: string[];
}

// Fallback ML hooks in case the provider doesn't exist
const useMockPHQ9ML = () => {
  
  const resetModel = () => {};
  
  
  const getPrediction = (): MLPrediction => {
    return {
      trend: 'stable',
      confidence: 0.7,
      nextPredictedScore: 10,
      recommendedInterventions: ["Continue regular assessment", "Monitor symptoms"]
    };
  };
  
  return {
    resetModel,
    getPrediction
  };
};

// Use a function to get the appropriate hook
const getMLHook = () => {
  // Check if the imported hook exists and return it or return mock
  if (typeof useActualPHQ9ML === 'function') {
    return useActualPHQ9ML;
  }
  return useMockPHQ9ML;
};

// Get the appropriate hook
const usePHQ9ML = getMLHook();

interface PHQ9VisualizationProps {
  assessments: PHQ9Assessment[];
  className?: string;
}

// PHQ-9 severity levels
const PHQ9_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'bg-green-100 text-green-800' },
  { range: [5, 9], level: 'mild', color: 'bg-blue-100 text-blue-800' },
  { range: [10, 14], level: 'moderate', color: 'bg-yellow-100 text-yellow-800' },
  { range: [15, 19], level: 'moderately severe', color: 'bg-orange-100 text-orange-800' },
  { range: [20, 27], level: 'severe', color: 'bg-red-100 text-red-800' }
];

export default function PHQ9VisualizationComponent({ 
  assessments,
  className = ''
}: PHQ9VisualizationProps) {
  // Use the actual or mock ML provider
  const phq9ML = usePHQ9ML();
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  
  useEffect(() => {
    try {
      // Reset the model
      phq9ML.resetModel();
    } catch (error) {
      console.error("Error with ML predictions:", error);
      setPrediction(null);
    }
  }, [assessments, phq9ML]);
  
  // Get severity level for a score
  const getSeverityLevel = (score: number) => {
    return PHQ9_SEVERITY.find(s => score >= s.range[0] && score <= s.range[1]) || PHQ9_SEVERITY[0];
  };
  
  // Sort assessments by date
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (assessments.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No PHQ-9 Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete a PHQ-9 assessment to see visualization and ML insights
          </p>
        </div>
      </div>
    );
  }
  
  // Calculate max score for graph scaling
  const maxScore = Math.max(...assessments.map(a => a.score), 27);
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">PHQ-9 Depression Trend Analysis</h2>
        {prediction && (
          <div className="flex items-center text-sm font-medium rounded-full px-3 py-1 bg-purple-100 text-purple-800">
            <Brain className="h-4 w-4 mr-1.5" />
            ML-powered insights
          </div>
        )}
      </div>
      
      {/* Score Visualization */}
      <div className="mb-6">
        <div className="relative h-40 mt-4">
          {/* Score lines and points */}
          <div className="absolute inset-0 flex items-end">
            {sortedAssessments.map((assessment, index) => {
              const itemWidth = `${100 / Math.max(1, sortedAssessments.length - 1)}%`;
              const heightPercentage = `${(assessment.score / maxScore) * 100}%`;
              const severity = getSeverityLevel(assessment.score);
              
              return (
                <div 
                  key={assessment.id}
                  className="flex flex-col items-center"
                  style={{ 
                    width: index === 0 ? itemWidth : itemWidth,
                    marginLeft: index === 0 ? '0' : '0'
                  }}
                >
                  {/* Line to next point */}
                  {index < sortedAssessments.length - 1 && (
                    <div 
                      className="absolute h-0.5 bg-gray-300 z-0" 
                      style={{
                        width: `${itemWidth}`,
                        bottom: `${(assessment.score / maxScore) * 100}%`,
                        left: `${(index / (sortedAssessments.length - 1)) * 100}%`,
                        transform: 'translateY(-50%)',
                      }}
                    />
                  )}
                  
                  {/* Data point */}
                  <div 
                    className="absolute z-10"
                    style={{
                      bottom: heightPercentage,
                      left: `${(index / Math.max(1, sortedAssessments.length - 1)) * 100}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full border-2 border-white ${severity.color.split(' ')[0]} cursor-pointer`}
                      title={`Score: ${assessment.score} (${severity.level}) on ${format(new Date(assessment.date), 'MMM d, yyyy')}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Severity level markers */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {PHQ9_SEVERITY.map((severity, index) => (
              <div 
                key={index}
                className="relative h-0 border-t border-dashed border-gray-200"
                style={{ 
                  bottom: `${(severity.range[0] / maxScore) * 100}%`,
                }}
              >
                <span className="absolute left-0 -top-2 text-xs text-gray-500">
                  {severity.range[0]}
                </span>
                <span className="absolute right-full -top-2 mr-2 text-xs text-gray-500">
                  {severity.level}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* X-axis dates */}
        <div className="flex justify-between mt-2">
          {sortedAssessments.map((assessment, index) => (
            <div 
              key={index}
              className="text-xs text-gray-500"
              style={{ 
                width: `${100 / Math.max(1, sortedAssessments.length)}%`,
                textAlign: 'center'
              }}
            >
              {format(new Date(assessment.date), 'MM/dd')}
            </div>
          ))}
        </div>
      </div>
      
      {/* ML Prediction */}
      {prediction && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Machine Learning Prediction
            </h3>
            
            <div className="flex items-center mb-1.5">
              {prediction.trend === 'improving' ? (
                <TrendingDown className="h-5 w-5 text-green-500 mr-1.5" />
              ) : prediction.trend === 'stable' ? (
                <Minus className="h-5 w-5 text-blue-500 mr-1.5" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-500 mr-1.5" />
              )}
              
              <span className={`text-sm font-medium ${
                prediction.trend === 'improving' 
                  ? 'text-green-700' 
                  : prediction.trend === 'stable' 
                    ? 'text-blue-700' 
                    : 'text-red-700'
              }`}>
                {prediction.trend === 'improving' 
                  ? 'Depression symptoms are likely improving' 
                  : prediction.trend === 'stable'
                    ? 'Depression symptoms are likely stable'
                    : 'Depression symptoms may be worsening'}
                <span className="text-gray-500 font-normal ml-1">
                  (Confidence: {Math.round(prediction.confidence * 100)}%)
                </span>
              </span>
            </div>
            
            {prediction.nextPredictedScore !== undefined && (
              <div className="text-sm text-gray-600 mb-3 ml-6">
                Predicted next PHQ-9 score: {prediction.nextPredictedScore} 
                ({getSeverityLevel(prediction.nextPredictedScore).level})
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-blue-600 mr-1.5" />
              Recommended Interventions
            </h4>
            <ul className="space-y-1">
              {prediction.recommendedInterventions.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-1.5">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Note: These recommendations are generated by an ML model and should be reviewed by a healthcare professional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
