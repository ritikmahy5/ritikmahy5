import { useState, useEffect } from 'react';
import { summarizeNotes, getSavedNotes, deleteNote } from '../utils/api';

export default function AINoteSummarizer() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summarize');

  useEffect(() => {
    fetchSavedNotes();
  }, []);

  const fetchSavedNotes = async () => {
    try {
      const notes = await getSavedNotes();
      setSavedNotes(notes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleSummarize = async () => {
    if (text.length < 50) {
      setError('Please enter at least 50 characters to summarize.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await summarizeNotes(text, title, 'study notes');
      setSummary(result);
      await fetchSavedNotes();
    } catch (err) {
      setError('Failed to summarize notes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote(noteId);
      setSavedNotes(savedNotes.filter(n => n.id !== noteId));
      if (summary?.id === noteId) {
        setSummary(null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleClear = () => {
    setText('');
    setTitle('');
    setSummary(null);
    setError(null);
  };

  const viewNote = (note) => {
    setSummary(note);
    setActiveTab('summarize');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 AI Note Summarizer</h1>
        <p className="text-gray-600">Paste your study notes and get an AI-powered summary with key points</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('summarize')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'summarize'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Summarize Notes
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Saved Notes ({savedNotes.length})
        </button>
      </div>

      {activeTab === 'summarize' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📄 Your Notes</h2>
            
            <div className="mb-4">
              <label className="label">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 5 Notes, Lecture Summary..."
                className="input-field"
              />
            </div>

            <div className="mb-4">
              <label className="label">Paste your notes here</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your study notes, lecture content, or any text you want to summarize..."
                className="input-field h-64 resize-none"
              />
              <div className="text-sm text-gray-500 mt-1">
                {text.length} characters (minimum 50 required)
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleSummarize}
                disabled={loading || text.length < 50}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Summarizing...' : '✨ Summarize'}
              </button>
              <button
                onClick={handleClear}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Summary</h2>
            
            {summary ? (
              <div className="space-y-4">
                {summary.title && (
                  <div className="text-lg font-semibold text-blue-600">{summary.title}</div>
                )}

                {summary.summary.type === 'ai' ? (
                  <div className="whitespace-pre-wrap text-gray-700">{summary.summary.content}</div>
                ) : (
                  <>
                    {/* Brief Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Brief Summary</h3>
                      <p className="text-gray-700">{summary.summary.briefSummary}</p>
                    </div>

                    {/* Key Points */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">Key Points</h3>
                      <ul className="space-y-1">
                        {summary.summary.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Important Terms */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Important Terms</h3>
                      <div className="flex flex-wrap gap-2">
                        {summary.summary.importantTerms.map((term, i) => (
                          <span key={i} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Review Questions */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Review Questions</h3>
                      <ol className="space-y-2">
                        {summary.summary.reviewQuestions.map((q, i) => (
                          <li key={i} className="text-gray-700">
                            <span className="font-medium text-yellow-700">{i + 1}.</span> {q}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📊 {summary.summary.stats.wordCount} words</span>
                      <span>⏱️ {summary.summary.stats.readingTime} read</span>
                      <span>📈 {summary.summary.stats.difficulty}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">📄</div>
                <p>Enter your notes and click "Summarize" to see the summary here</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Notes Tab */
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Saved Summaries</h2>
          
          {savedNotes.length > 0 ? (
            <div className="space-y-4">
              {savedNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{note.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString()} • {note.summary?.stats?.wordCount || '?'} words
                      </p>
                      <p className="text-gray-600 mt-2 line-clamp-2">
                        {note.summary?.briefSummary || note.originalText?.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => viewNote(note)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📭</div>
              <p>No saved notes yet. Summarize some notes to see them here!</p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 card bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Tips for Better Summaries</h3>
        <ul className="space-y-2 text-green-700">
          <li>• Include complete sentences for more accurate summaries</li>
          <li>• Paste lecture notes, textbook content, or your own notes</li>
          <li>• Use the review questions to test your understanding</li>
          <li>• Save important summaries for later review</li>
        </ul>
      </div>
    </div>
  );
}
