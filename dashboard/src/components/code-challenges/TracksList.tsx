// src/components/code-challenges/TracksList.tsx
import React, { useState } from 'react';
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Book,
  Plus,
  Users,
  Clock,
  Star,
} from 'lucide-react';
import type { AdminTrack } from '../../types';

interface TracksListProps {
  tracks: AdminTrack[];
  loading: boolean;
  onAssignChallenges: (track: AdminTrack) => void;
  onEditTrack: (track: AdminTrack) => void;
  onRefresh: () => void;
}

const TracksList: React.FC<TracksListProps> = ({
  tracks,
  loading,
  onAssignChallenges,
  onEditTrack,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Filter functions
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || track.language === filterLanguage;
    const matchesDifficulty = filterDifficulty === 'all' || track.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'published' ? track.isActive : !track.isActive);
    
    return matchesSearch && matchesLanguage && matchesDifficulty && matchesStatus;
  });

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-400';
      case 'intermediate': return 'bg-amber-500/10 text-amber-400';
      case 'advanced': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getLanguageClasses = (language: string) => {
    switch (language) {
      case 'javascript': return 'bg-yellow-500/10 text-yellow-400';
      case 'python': return 'bg-cyan-500/10 text-cyan-400';
      case 'dart': return 'bg-blue-500/10 text-blue-400';
      case 'swift': return 'bg-orange-500/10 text-orange-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const toggleDropdown = (trackId: string) => {
    setOpenDropdown(openDropdown === trackId ? null : trackId);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner w-12 h-12 mx-auto mb-4" />
        <p className="text-[#a1a1aa]">Loading tracks...</p>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="select"
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="dart">Dart</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="select"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[#6b6b70]">
          Showing {filteredTracks.length} of {tracks.length} tracks
        </span>
        <button onClick={onRefresh} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {/* Tracks Grid */}
      {filteredTracks.length === 0 ? (
        <div className="card text-center py-12">
          <Book className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
          <h5 className="font-medium text-[#f5f5f4] mb-2">No tracks found</h5>
          <p className="text-[#6b6b70]">
            {tracks.length === 0 
              ? "No tracks have been created yet."
              : "No tracks match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map((track) => (
            <div key={track._id} className="card hover:border-[#3a3a3f] transition-all group">
              {/* Card Header */}
              <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h6 className="font-medium text-[#f5f5f4] mb-2 truncate">{track.title}</h6>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs ${getLanguageClasses(track.language)}`}>
                      {track.language}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClasses(track.difficulty)}`}>
                      {track.difficulty}
                    </span>
                    {track.isFeatured && (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs ${track.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {track.isActive ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <div className="relative ml-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(track._id);
                    }}
                    className="p-1.5 hover:bg-[#2a2a2e] rounded-lg transition-colors text-[#6b6b70] hover:text-[#f5f5f4]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {openDropdown === track._id && (
                    <div className="absolute right-0 top-full mt-1 w-48 card py-1 shadow-xl z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenDropdown(null);
                          onEditTrack(track);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Track Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenDropdown(null);
                          onAssignChallenges(track);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Manage Challenges
                      </button>
                      <div className="border-t border-[#2a2a2e] my-1" />
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Track
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <p className="text-sm text-[#6b6b70] mb-4 line-clamp-2">
                  {track.description}
                </p>
                
                <div className="flex justify-between text-sm text-[#6b6b70] mb-4">
                  <div className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {track.challenges.length} challenges
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {track.estimatedHours}h
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {track.stats.totalEnrolled}
                  </div>
                </div>

                {track.stats.totalRatings > 0 && (
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm text-[#a1a1aa]">
                      {track.stats.rating.toFixed(1)} ({track.stats.totalRatings} reviews)
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAssignChallenges(track);
                    }}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Challenges
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditTrack(track);
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TracksList;