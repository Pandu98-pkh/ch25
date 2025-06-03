import { useState } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  ClipboardCheck, 
  GraduationCap, 
  ChevronRight, 
  Award, 
  Monitor,
  Layers,
  Compass,
  Trophy
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CareerResource } from '../../types';
import { cn } from '../../utils/cn';

const typeIcons = {
  article: BookOpen,
  video: Video,
  assessment: ClipboardCheck,
  program: GraduationCap,
  course: Monitor,
  module: Layers,
  path: Compass,
  quiz: Award,
  certification: Trophy,
};

const typeColors = {
  article: 'bg-blue-100 text-blue-700',
  video: 'bg-purple-100 text-purple-700',
  assessment: 'bg-green-100 text-green-700',
  program: 'bg-orange-100 text-orange-700',
  course: 'bg-emerald-100 text-emerald-700',
  module: 'bg-indigo-100 text-indigo-700',
  path: 'bg-sky-100 text-sky-700',
  quiz: 'bg-amber-100 text-amber-700',
  certification: 'bg-rose-100 text-rose-700',
};

interface ResourcesTabProps {
  resources: CareerResource[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onResourceSearch: (term: string) => void;
}

export default function ResourcesTab({ 
  resources, 
  searchTerm, 
  onSearchChange, 
  onResourceSearch 
}: ResourcesTabProps) {
  const { t } = useLanguage();

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResourceSearch(searchTerm);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('career.searchResources', 'Cari sumber daya...')}
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onResourceSearch(e.target.value);
            }}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <Filter className="h-5 w-5 mr-2" />
            {t('career.filter', 'Filter')}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('career.resources', 'Sumber Daya Karir')}</h2>
          
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredResources.map((resource) => {
                const Icon = typeIcons[resource.type];
                return (
                  <div
                    key={resource.id}
                    className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start">
                      <div className={cn(
                        'p-3 rounded-xl',
                        typeColors[resource.type]
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-md font-semibold text-gray-900">{resource.title}</h3>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                        
                        {/* Tags */}
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {resource.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {resource.tags.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{resource.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors duration-150"
                          >
                            {t(`career.type.${resource.type}`, resource.type)}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm 
                  ? t('career.noResourcesFound', 'Tidak ada sumber daya ditemukan') 
                  : t('career.noResourcesAvailable', 'Belum ada sumber daya tersedia')
                }
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? t('career.tryDifferentSearch', 'Coba kata kunci pencarian yang berbeda')
                  : t('career.resourcesComingSoon', 'Sumber daya akan segera tersedia')
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
