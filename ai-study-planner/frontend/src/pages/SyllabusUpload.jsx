import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSyllabus, getSyllabi, deleteSyllabus, generatePlanFromSyllabus } from '../utils/api';

export default function SyllabusUpload() {
  const navigate = useNavigate();
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [professor, setProfessor] = useState('');
  
  // View state
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      const data = await getSyllabi();
      setSyllabi(data);
    } catch (err) {
      console.error('Failed to fetch syllabi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !subject) {
      setError('Please select a file and enter a subject name');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadSyllabus(file, subject, semester, professor);
      setSuccess(`Syllabus uploaded! ${result.assignmentsCreated} assignments extracted.`);
      setSyllabi([result.syllabus, ...syllabi]);
      
      // Reset form
      setFile(null);
      setSubject('');
      setSemester('');
      setProfessor('');
      document.getElementById('syllabus-file').value = '';
    } catch (err) {
      setError(err.message || 'Failed to upload syllabus');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this syllabus and all associated assignments?')) return;
    
    try {
      await deleteSyllabus(id);
      setSyllabi(syllabi.filter(s => s.id !== id));
      if (selectedSyllabus?.id === id) setSelectedSyllabus(null);
    } catch (err) {
      setError('Failed to delete syllabus');
    }
  };

  const handleGeneratePlan = async (syllabusId) => {
    setGenerating(syllabusId);
    try {
      const plan = await generatePlanFromSyllabus(syllabusId, {
        hoursPerDay: 2,
        difficulty: 'intermediate',
      });
      navigate(`/plan/${plan.id}`);
    } catch (err) {
      setError('Failed to generate study plan');
    } finally {
      setGenerating(null);
    }
  };

  const subjectPresets = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'English', 'History', 'Economics',
    'Psychology', 'Statistics', 'Engineering'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Syllabus Manager</h1>
        <p className="text-gray-600">Upload your course syllabi and let AI create study plans with assignment reminders</p>
      </div>

      {/* Upload Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📤 Upload New Syllabus</h2>
        
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="label">Syllabus File (PDF, TXT, DOC)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="syllabus-file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="syllabus-file"
                      name="syllabus-file"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, TXT, DOC up to 10MB</p>
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="label">Subject Name *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Calculus II, Introduction to Psychology"
              className="input-field"
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {subjectPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSubject(preset)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    subject === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semester */}
            <div>
              <label className="label">Semester (Optional)</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g., Fall 2024"
                className="input-field"
              />
            </div>

            {/* Professor */}
            <div>
              <label className="label">Professor (Optional)</label>
              <input
                type="text"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                placeholder="e.g., Dr. Smith"
                className="input-field"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !subject}
            className="btn-primary w-full disabled:opacity-50"
          >
            {uploading ? '📤 Uploading & Analyzing...' : '📤 Upload Syllabus'}
          </button>
        </form>
      </div>

      {/* Syllabi List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Your Syllabi</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : syllabi.length === 0 ? (
            <div className="card text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-gray-500">No syllabi uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first syllabus above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syllabi.map((syllabus) => (
                <div
                  key={syllabus.id}
                  onClick={() => setSelectedSyllabus(syllabus)}
                  className={`card cursor-pointer transition-all hover:shadow-md ${
                    selectedSyllabus?.id === syllabus.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{syllabus.subject}</h3>
                      <p className="text-sm text-gray-500">{syllabus.semester}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {syllabus.parsedData?.topics?.length || 0} topics • 
                        {syllabus.parsedData?.assignments?.length || 0} assignments
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(syllabus.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Syllabus Details */}
        <div className="lg:col-span-2">
          {selectedSyllabus ? (
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedSyllabus.subject}</h2>
                  <p className="text-gray-500">
                    {selectedSyllabus.semester} • {selectedSyllabus.professor}
                  </p>
                </div>
                <button
                  onClick={() => handleGeneratePlan(selectedSyllabus.id)}
                  disabled={generating === selectedSyllabus.id}
                  className="btn-primary disabled:opacity-50"
                >
                  {generating === selectedSyllabus.id ? 'Generating...' : '✨ Generate Study Plan'}
                </button>
              </div>

              {/* Topics */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📖 Course Topics</h3>
                <div className="space-y-2">
                  {selectedSyllabus.parsedData?.topics?.map((topic, i) => (
                    <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3">
                        {topic.week || i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{topic.name}</p>
                        {topic.description && (
                          <p className="text-sm text-gray-500">{topic.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📝 Assignments & Exams</h3>
                <div className="space-y-2">
                  {selectedSyllabus.parsedData?.assignments?.map((assignment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium mr-3 ${
                          assignment.type === 'exam' ? 'bg-red-200 text-red-800' :
                          assignment.type === 'project' ? 'bg-purple-200 text-purple-800' :
                          assignment.type === 'quiz' ? 'bg-orange-200 text-orange-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {assignment.type}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{assignment.title}</p>
                          {assignment.weight && (
                            <p className="text-sm text-gray-500">Weight: {assignment.weight}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grading */}
              {selectedSyllabus.parsedData?.gradingBreakdown && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">📊 Grading Breakdown</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(selectedSyllabus.parsedData.gradingBreakdown).map(([key, value]) => (
                      <div key={key} className="bg-gray-100 px-3 py-2 rounded-lg">
                        <p className="text-sm text-gray-500 capitalize">{key}</p>
                        <p className="font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Recommendations */}
              {selectedSyllabus.parsedData?.studyRecommendations && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">💡 Study Recommendations</h3>
                  <ul className="space-y-2">
                    {selectedSyllabus.parsedData.studyRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-gray-500">Select a syllabus to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
