import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { format } from 'date-fns';

export interface Assessment {
  id: string;
  type: string;
  score: number;
  date: string;
  risk: 'low' | 'moderate' | 'high';
  notes?: string;
  responses: Array<{
    questionId: number;
    answer: number;
    category?: string;
    question?: string;
  }>;
  mlPrediction?: {
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;
    nextPredictedScore: number;
  };
  recommendations?: string[];
  // Add DASS-21 specific properties
  subScores?: {
    depression: number;
    anxiety: number;
    stress: number;
  };
  severityLevels?: {
    depression: string;
    anxiety: string;
    stress: string;
  };
  severityColors?: {
    depression: string;
    anxiety: string;
    stress: string;
  };
}

interface AssessmentContextType {
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  deleteAssessment: (id: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessments = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessments must be used within an AssessmentProvider');
  }
  return context;
};

// Initial mock data
const initialMockData: Assessment[] = [
  {
    id: '1',
    type: 'PHQ-9',
    score: 12,
    date: '2023-11-10',
    risk: 'moderate',
    notes: 'Patient exhibits symptoms of moderate depression',
    responses: [
      { questionId: 1, answer: 2 },
      { questionId: 2, answer: 2 },
      { questionId: 3, answer: 1 },
      { questionId: 4, answer: 2 },
      { questionId: 5, answer: 1 },
      { questionId: 6, answer: 1 },
      { questionId: 7, answer: 1 },
      { questionId: 8, answer: 1 },
      { questionId: 9, answer: 1 }
    ],
    mlPrediction: {
      trend: 'improving',
      confidence: 0.72,
      nextPredictedScore: 10
    },
    recommendations: [
      "Continue current therapy sessions",
      "Maintain daily mood tracking",
      "Consider light exercise 3 times per week"
    ]
  },
  {
    id: '2',
    type: 'GAD-7',
    score: 18,
    date: '2023-11-05',
    risk: 'high',
    notes: 'Severe anxiety symptoms, recommend follow-up',
    responses: [
      { questionId: 1, answer: 3 },
      { questionId: 2, answer: 2 },
      { questionId: 3, answer: 3 },
      { questionId: 4, answer: 2 },
      { questionId: 5, answer: 3 },
      { questionId: 6, answer: 2 },
      { questionId: 7, answer: 3 }
    ],
    mlPrediction: {
      trend: 'worsening',
      confidence: 0.81,
      nextPredictedScore: 20
    },
    recommendations: [
      "Schedule psychiatric consultation",
      "Consider anxiety management program",
      "Daily anxiety tracking recommended"
    ]
  },
  {
    id: '3',
    type: 'PHQ-9',
    score: 5,
    date: '2023-10-15',
    risk: 'low',
    notes: 'Mild depression symptoms showing improvement',
    responses: [
      { questionId: 1, answer: 1 },
      { questionId: 2, answer: 1 },
      { questionId: 3, answer: 0 },
      { questionId: 4, answer: 1 },
      { questionId: 5, answer: 0 },
      { questionId: 6, answer: 1 },
      { questionId: 7, answer: 0 },
      { questionId: 8, answer: 1 },
      { questionId: 9, answer: 0 }
    ],
    mlPrediction: {
      trend: 'stable',
      confidence: 0.85,
      nextPredictedScore: 6
    },
    recommendations: [
      "Continue mindfulness practice",
      "Maintain social connections"
    ]
  }
];

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Load assessments from localStorage on mount
  useEffect(() => {
    const loadAssessments = () => {
      try {
        const storedAssessments = localStorage.getItem('mental_health_assessments');
        
        if (storedAssessments) {
          // Use stored assessments if available
          setAssessments(JSON.parse(storedAssessments));
        } else {
          // Otherwise use initial mock data
          setAssessments(initialMockData);
          // Save initial data to localStorage
          localStorage.setItem('mental_health_assessments', JSON.stringify(initialMockData));
        }
      } catch (error) {
        console.error('Error loading assessments from localStorage:', error);
        // Fallback to mock data
        setAssessments(initialMockData);
      }
      
      setLoading(false);
    };

    // Simulate loading delay
    setTimeout(loadAssessments, 1000);
  }, []);

  // Save to localStorage whenever assessments change
  useEffect(() => {
    // Skip initial empty state
    if (assessments.length > 0 && !loading) {
      localStorage.setItem('mental_health_assessments', JSON.stringify(assessments));
    }
  }, [assessments, loading]);

  const addAssessment = (assessment: Omit<Assessment, 'id'>) => {
    const highestId = assessments.reduce((max, item) => {
      const id = parseInt(item.id);
      return isNaN(id) ? max : Math.max(max, id);
    }, 0);
    
    const newId = (highestId + 1).toString();
    const newAssessment = { ...assessment, id: newId };
    
    const updatedAssessments = [newAssessment, ...assessments];
    setAssessments(updatedAssessments);
  };

  const deleteAssessment = (id: string) => {
    const updatedAssessments = assessments.filter(assessment => assessment.id !== id);
    setAssessments(updatedAssessments);
  };

  return (
    <AssessmentContext.Provider value={{ assessments, addAssessment, deleteAssessment, loading, setLoading }}>
      {children}
    </AssessmentContext.Provider>
  );
};
