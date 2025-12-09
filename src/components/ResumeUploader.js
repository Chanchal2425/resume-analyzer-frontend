import React, { useState } from "react";
import axios from "axios";
import "./ResumeUploader.css";

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile?.name || "");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF resume first!");
      return;
    }
    if (!jobDesc.trim()) {
      alert("Please enter a job description!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/resume/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      if (err.code === 'ECONNREFUSED') {
        alert("Cannot connect to server. Make sure backend is running on port 3001.");
      } else if (err.response) {
        setResult({ error: `Server Error: ${err.response.status} - ${err.response.data.error}` });
      } else if (err.request) {
        setResult({ error: "No response from server. Check if backend is running." });
      } else {
        setResult({ error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLevel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  const testBackendConnection = async () => {
    try {
      await axios.get("http://localhost:3001/api/health", { timeout: 5000 });
      alert("✅ Backend connection successful!");
    } catch (error) {
      alert("❌ Backend connection failed. Make sure server is running on port 3001.");
    }
  };

  return (
    <div className="resume-analyzer-container">
      {/* Header */}
      <div className="analyzer-header">
        <div className="logo-section">
          <span className="logo-icon">📊</span>
          <div>
            <h1 className="main-title">ResumeAnalyzer Pro</h1>
            <p className="tagline">AI-powered ATS optimization & skill gap analysis</p>
          </div>
        </div>
        <button className="test-btn" onClick={testBackendConnection}>
          Test Connection
        </button>
      </div>

      <div className="main-content">
        {/* Input Section */}
        <div className="input-section">
          {/* Job Description Card */}
          <div className="input-card">
            <div className="card-header">
              <span className="card-icon">📋</span>
              <h3>Job Description</h3>
            </div>
            <textarea
              placeholder="Paste the complete job description including required skills, qualifications, and technical requirements..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="job-textarea"
            />
            <div className="char-count">{jobDesc.length} characters</div>
          </div>

          {/* Upload Card */}
          <div className="input-card">
            <div className="card-header">
              <span className="card-icon">📄</span>
              <h3>Upload Resume</h3>
            </div>

            <div className="upload-area">
              <input
                type="file"
                id="resume-upload"
                accept="application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="resume-upload" className="upload-label">
                <div className="upload-icon">📤</div>
                <p className="upload-text">Choose PDF Resume</p>
                <span className="file-name">{fileName || "No file chosen"}</span>
                <span className="file-hint">Max 10MB • PDF only</span>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !fileName || !jobDesc.trim()}
              className="analyze-button"
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Analyze Resume & Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="results-section">
            {result.error ? (
              <div className="error-card">
                <h3>❌ Error</h3>
                <p>{result.error}</p>
              </div>
            ) : (
              <>
                {/* Score Header */}
                <div className="score-header">
                  <div className="score-card">
                    <div className="score-circle">
                      <div
                        className="score-progress"
                        style={{
                          background: `conic-gradient(${getScoreColor(result.atsScore)} ${result.atsScore * 3.6}deg, #f3f4f6 0deg)`
                        }}
                      >
                        <div className="score-inner">
                          <span className="score-value">{result.atsScore}%</span>
                          <span className="score-label">ATS Score</span>
                        </div>
                      </div>
                    </div>
                    <div className="score-info">
                      <h3 className="score-level">{getScoreLevel(result.atsScore)}</h3>
                      <p>Compatibility with job requirements</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-number">{result.matchedSkills?.length || 0}</span>
                      <span className="stat-label">Matched Skills</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">{result.missingSkills?.length || 0}</span>
                      <span className="stat-label">Missing Skills</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">{result.resumeSkillsCount || 0}</span>
                      <span className="stat-label">Total Skills Mentioned In resume</span>
                    </div>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="results-grid">
                  <div className="result-card matched-skills">
                    <div className="card-header">
                      <span className="card-icon">✅</span>
                      <h4>Matching Skills</h4>
                    </div>
                    <div className="skills-list">
                      {result.matchedSkills?.length > 0 ? (
                        result.matchedSkills.map((skill, index) => (
                          <span key={index} className="skill-tag matched">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="no-skills">No matching skills found</p>
                      )}
                    </div>
                  </div>

                  <div className="result-card missing-skills">
                    <div className="card-header">
                      <span className="card-icon">❌</span>
                      <h4>Missing Skills</h4>
                    </div>
                    <div className="skills-list">
                      {result.missingSkills?.length > 0 ? (
                        result.missingSkills.map((skill, index) => (
                          <span key={index} className="skill-tag missing">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="no-skills">All required skills are present! 🎉</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-icon">📝</span>
                    <h4>Analysis Summary</h4>
                  </div>
                  <div className="summary-content">
                    {result.summary?.split('\n').map((line, index) => (
                      <p key={index} className="summary-line">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Resume Preview */}
                {result.extractedResumePreview && (
                  <div className="preview-card">
                    <div className="card-header">
                      <span className="card-icon">🔍</span>
                      <h4>Extracted Resume Text (Preview)</h4>
                    </div>
                    <div className="preview-content">
                      {result.extractedResumePreview}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="analyzer-footer">
        <p>Designed and implemented by Soumya sahu and Chanchal Mankar.</p>
      </div>
    </div>
  );
};

export default ResumeUploader;



