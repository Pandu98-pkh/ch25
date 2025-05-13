import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayCircle } from 'lucide-react';
import { Lesson } from '../services/CourseCareer';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoCourseProps {
  lesson: Lesson;
}

export default function VideoCourse({ lesson }: VideoCourseProps) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);
  
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);
  
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);
  
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);
  
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);
  
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="my-6 rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div 
        ref={videoContainerRef}
        className="relative bg-black"
      >
        <video
          ref={videoRef}
          className="w-full aspect-video"
          poster="https://placehold.co/1280x720/000000/FFFFFF/png?text=Video+Lesson"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        >
          <source src={lesson.videoUrl || "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4"} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="bg-white/80 h-16 w-16 rounded-full flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-brand-600" />
            </div>
          </div>
        )}
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          <div className="flex flex-col gap-2">
            {/* Progress bar */}
            <div className="flex items-center gap-2 text-white">
              <span className="text-xs">{formatTime(currentTime)}</span>
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="text-xs">{formatTime(duration)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="p-1 hover:text-brand-300">
                  {isPlaying ? (
                    <div className="h-6 w-6 flex items-center justify-center">
                      <div className="h-3.5 w-3.5 border-l-2 border-r-2 border-white"></div>
                    </div>
                  ) : (
                    <PlayCircle className="h-6 w-6" />
                  )}
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowVolume(!showVolume)}
                    className="p-1 hover:text-brand-300"
                  >
                    {volume === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      </svg>
                    )}
                  </button>
                  
                  {showVolume && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded shadow-lg">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side controls */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleFullscreen} 
                  className="p-1 hover:text-brand-300"
                >
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                      <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                      <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                      <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8V5a2 2 0 0 1 2-2h3"></path>
                      <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                      <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                      <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Markers */}
        <div className="absolute bottom-14 left-0 right-0 px-4">
          <div className="relative h-8">
            {/* Example interactive markers - would be dynamically generated in real app */}
            <button 
              className="absolute h-6 w-6 bg-brand-500 rounded-full -mt-3 flex items-center justify-center text-white"
              style={{ left: '25%' }}
              title={t('course.quizAt130')}
            >
              Q
            </button>
            <button 
              className="absolute h-6 w-6 bg-blue-500 rounded-full -mt-3 flex items-center justify-center text-white"
              style={{ left: '50%' }}
              title={t('course.additionalInfo')}
            >
              i
            </button>
            <button 
              className="absolute h-6 w-6 bg-green-500 rounded-full -mt-3 flex items-center justify-center text-white"
              style={{ left: '75%' }}
              title={t('course.relatedResource')}
            >
              L
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{t('course.interactiveElements')}</h3>
          <button className="text-sm text-brand-600 hover:text-brand-700">{t('course.showAll')}</button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-4 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs">Q</div>
              <span className="text-gray-700 font-medium">{t('course.quizQuestion')}</span>
            </div>
            <p className="text-gray-500 text-xs">{t('course.testKnowledge')}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">i</div>
              <span className="text-gray-700 font-medium">{t('course.keyConcept')}</span>
            </div>
            <p className="text-gray-500 text-xs">{t('course.importantTopic')}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">L</div>
              <span className="text-gray-700 font-medium">{t('course.furtherReading')}</span>
            </div>
            <p className="text-gray-500 text-xs">{t('course.additionalResources')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
