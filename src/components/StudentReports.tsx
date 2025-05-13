import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentReports() {
  const { t } = useLanguage();

  // Mock reports data
  const reports = [
    {
      id: '1',
      title: 'Academic Progress Report',
      date: '2025-04-01',
      type: 'academic',
      description: 'Mid-semester academic evaluation and progress tracking'
    },
    {
      id: '2',
      title: 'Career Assessment Results',
      date: '2025-03-15',
      type: 'career',
      description: 'Results from the Holland Code career interest inventory'
    },
    {
      id: '3',
      title: 'Mental Health Evaluation',
      date: '2025-02-20',
      type: 'mental-health',
      description: 'Summary of recent mental health assessments and recommendations'
    }
  ];

  const reportTypeIcons: Record<string, React.ReactNode> = {
    academic: <FileText className="h-5 w-5 text-blue-600" />,
    career: <FileText className="h-5 w-5 text-green-600" />,
    'mental-health': <FileText className="h-5 w-5 text-purple-600" />
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports.title') || 'Student Reports'}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('reports.subtitle') || 'View and download your academic and counseling reports'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report.id} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-start">
                  <div className="mr-4">
                    {reportTypeIcons[report.type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {format(new Date(report.date), 'PPP')}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">{report.description}</p>
                    <div className="mt-4 flex space-x-4">
                      <button className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700">
                        <Download className="mr-1.5 h-4 w-4" />
                        {t('reports.download') || 'Download'}
                      </button>
                      <button className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800">
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        {t('reports.view') || 'View Online'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {t('reports.requestNew') || 'Request New Report'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('reports.requestDescription') || 'If you need a specific report that is not listed above, you can request it from your counselor.'}
          </p>
          <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            {t('reports.requestButton') || 'Request Report'}
          </button>
        </div>
      </div>
    </div>
  );
}