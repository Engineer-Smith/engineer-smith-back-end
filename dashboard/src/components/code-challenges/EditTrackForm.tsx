// src/components/code-challenges/EditTrackForm.tsx
import React, { useState } from 'react';
import { Save, ArrowLeft, X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import type { AdminTrack, CreateTrackFormData, ProgrammingLanguage, TrackDifficultyLevel, TrackCategory } from '../../types';

interface EditTrackFormProps {
  track: AdminTrack;
  onTrackUpdated: () => void;
  onCancel: () => void;
}

const EditTrackForm: React.FC<EditTrackFormProps> = ({
  track,
  onTrackUpdated,
  onCancel
}) => {
  const { updateCodeTrack } = useCodeChallenge();
  
  const [formData, setFormData] = useState<CreateTrackFormData>({
    title: track.title,
    description: track.description,
    language: track.language,
    category: track.category,
    difficulty: track.difficulty,
    estimatedHours: track.estimatedHours,
    prerequisites: track.prerequisites || [],
    learningObjectives: track.learningObjectives || [],
    isFeatured: track.isFeatured
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningObjective, setLearningObjective] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateCodeTrack(track.language, track.slug, formData);
      onTrackUpdated();
    } catch (error: any) {
      setError(error.message || 'Failed to update track');
    } finally {
      setLoading(false);
    }
  };

  const addLearningObjective = () => {
    if (learningObjective.trim() && !formData.learningObjectives.includes(learningObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, learningObjective.trim()]
      }));
      setLearningObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLearningObjective();
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2e]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#6b6b70] hover:text-[#f5f5f4] hover:bg-[#2a2a2e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-mono text-lg font-semibold text-[#f5f5f4]">Edit Track</h2>
            <p className="text-sm text-[#6b6b70]">{track.title}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Language Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-[#f5f5f4] mb-2">
                Track Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                placeholder="e.g., JavaScript Fundamentals"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-[#f5f5f4] mb-2">
                Programming Language <span className="text-red-400">*</span>
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as ProgrammingLanguage }))}
                required
                disabled
                className="select opacity-60 cursor-not-allowed"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="dart">Dart</option>
              </select>
              <p className="mt-1 text-xs text-[#6b6b70]">
                Language cannot be changed after creation
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#f5f5f4] mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Describe what students will learn in this track..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="input resize-none"
            />
          </div>

          {/* Difficulty, Category, Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-[#f5f5f4] mb-2">
                Difficulty Level <span className="text-red-400">*</span>
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as TrackDifficultyLevel }))}
                required
                className="select"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#f5f5f4] mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TrackCategory }))}
                required
                className="select"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="data-structures">Data Structures</option>
                <option value="algorithms">Algorithms</option>
                <option value="dynamic-programming">Dynamic Programming</option>
                <option value="graphs">Graphs</option>
                <option value="trees">Trees</option>
                <option value="arrays">Arrays</option>
                <option value="strings">Strings</option>
                <option value="linked-lists">Linked Lists</option>
                <option value="stacks-queues">Stacks & Queues</option>
                <option value="sorting-searching">Sorting & Searching</option>
                <option value="math">Math</option>
                <option value="greedy">Greedy</option>
                <option value="backtracking">Backtracking</option>
                <option value="bit-manipulation">Bit Manipulation</option>
                <option value="design">Design</option>
                <option value="interview-prep">Interview Prep</option>
              </select>
            </div>
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-[#f5f5f4] mb-2">
                Estimated Hours <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="estimatedHours"
                min="1"
                max="100"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                required
                className="input"
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-[#f5f5f4] mb-2">
              Learning Objectives
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a learning objective..."
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addLearningObjective}
                disabled={!learningObjective.trim()}
                className="btn-secondary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {formData.learningObjectives.length > 0 && (
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0a0a0b]/50 divide-y divide-[#2a2a2e]">
                {formData.learningObjectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 group"
                  >
                    <span className="text-sm text-[#a1a1aa]">{objective}</span>
                    <button
                      type="button"
                      onClick={() => removeLearningObjective(index)}
                      className="p-1 rounded text-[#6b6b70] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formData.learningObjectives.length === 0 && (
              <p className="text-xs text-[#6b6b70]">
                No learning objectives added yet
              </p>
            )}
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-4 h-4 rounded border-[#3a3a3e] bg-[#1c1c1f] text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0"
            />
            <label htmlFor="isFeatured" className="text-sm text-[#a1a1aa] cursor-pointer">
              Featured Track <span className="text-[#6b6b70]">(will be highlighted on the platform)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#2a2a2e]">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTrackForm;