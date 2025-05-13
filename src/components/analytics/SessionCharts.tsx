import React, { useEffect, useRef } from 'react';
import { CounselingSession } from '../../types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import Chart from 'chart.js/auto';

interface SessionChartsProps {
  sessions: CounselingSession[];
}

const SessionCharts: React.FC<SessionChartsProps> = ({ sessions }) => {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    if (!sessions.length) return;
    
    let lineChart: Chart | null = null;
    let pieChart: Chart | null = null;
    let barChart: Chart | null = null;
    
    // Create charts only if we have sessions
    if (sessions.length > 0) {
      // Daily sessions line chart
      if (lineChartRef.current) {
        const ctx = lineChartRef.current.getContext('2d');
        if (ctx) {
          // Get current month date range
          const start = startOfMonth(new Date());
          const end = endOfMonth(new Date());
          const days = eachDayOfInterval({ start, end });
          
          // Count sessions per day in current month
          const sessionsPerDay = days.map(day => {
            return sessions.filter(session => {
              const sessionDate = parseISO(session.date);
              return isSameDay(sessionDate, day);
            }).length;
          });
          
          // Create chart
          lineChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: days.map(day => format(day, 'MMM d')),
              datasets: [{
                label: 'Sessions per Day',
                data: sessionsPerDay,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Sessions per Day (Current Month)'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }
          });
        }
      }
      
      // Session types pie chart
      if (pieChartRef.current) {
        const ctx = pieChartRef.current.getContext('2d');
        if (ctx) {
          // Count sessions by type
          const sessionsByType = sessions.reduce((acc, session) => {
            acc[session.type] = (acc[session.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Define colors for different types
          const backgroundColors = [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ];
          
          // Format labels for better display
          const formattedLabels = Object.keys(sessionsByType).map(type => {
            switch(type) {
              case 'academic': return 'Academic';
              case 'behavioral': return 'Behavioral';
              case 'mental-health': return 'Mental Health';
              case 'career': return 'Career';
              case 'social': return 'Social';
              default: return type.charAt(0).toUpperCase() + type.slice(1);
            }
          });
          
          // Create chart
          pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: formattedLabels,
              datasets: [{
                data: Object.values(sessionsByType),
                backgroundColor: backgroundColors.slice(0, Object.keys(sessionsByType).length)
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Sessions by Type'
                },
                legend: {
                  position: 'right'
                }
              }
            }
          });
        }
      }
      
      // Session outcomes bar chart
      if (barChartRef.current) {
        const ctx = barChartRef.current.getContext('2d');
        if (ctx) {
          // Count sessions by outcome
          const sessionsByOutcome = sessions.reduce((acc, session) => {
            acc[session.outcome] = (acc[session.outcome] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Format labels for better display
          const formattedLabels = Object.keys(sessionsByOutcome).map(outcome => {
            switch(outcome) {
              case 'positive': return 'Positive';
              case 'neutral': return 'Neutral';
              case 'negative': return 'Negative';
              default: return outcome.charAt(0).toUpperCase() + outcome.slice(1);
            }
          });
          
          // Define colors for different outcomes
          const outcomeColors = {
            positive: 'rgba(75, 192, 92, 0.6)',
            neutral: 'rgba(201, 203, 207, 0.6)',
            negative: 'rgba(255, 99, 132, 0.6)'
          };
          
          // Create chart
          barChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: formattedLabels,
              datasets: [{
                label: 'Sessions by Outcome',
                data: Object.values(sessionsByOutcome),
                backgroundColor: Object.keys(sessionsByOutcome).map(outcome => 
                  outcomeColors[outcome as keyof typeof outcomeColors] || 'rgba(201, 203, 207, 0.6)'
                )
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Sessions by Outcome'
                },
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }
          });
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (lineChart) lineChart.destroy();
      if (pieChart) pieChart.destroy();
      if (barChart) barChart.destroy();
    };
  }, [sessions]);
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
      
      {sessions.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No session data available for analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <canvas ref={lineChartRef} />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <canvas ref={pieChartRef} />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
            <canvas ref={barChartRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCharts;
