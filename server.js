// server.js - ULTIMATE ROBUST VERSION
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Enhanced skills database
const skillsDatabase = {
  technical: [
    "javascript", "python", "java", "c++", "c#", "php", "ruby", "go", "swift",
    "react", "angular", "vue", "node.js", "express", "django", "flask", "spring",
    "html", "css", "sass", "less", "bootstrap", "tailwind",
    "sql", "mysql", "postgresql", "mongodb", "redis", "oracle",
    "git", "docker", "kubernetes", "aws", "azure", "gcp",
    "rest", "graphql", "api", "json", "xml",
    "linux", "unix", "windows", "macos",
    "machine learning", "ai", "data science", "big data", "tableau", "power bi"
  ],
  soft: [
    "communication", "teamwork", "leadership", "problem solving", "creativity",
    "time management", "adaptability", "critical thinking", "decision making",
    "collaboration", "negotiation", "presentation", "public speaking",
    "project management", "agile", "scrum", "kanban"
  ]
};

function getScoreLevel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Improvement";
}

function getRecommendation(atsScore, matchedSkills, missingSkills) {
  if (atsScore >= 85) {
    return "🎉 STRONG MATCH! You should definitely apply for this position.";
  } else if (atsScore >= 70) {
    return "✅ GOOD MATCH! You should apply. Focus on highlighting your matching skills.";
  } else if (atsScore >= 50) {
    return "⚠️ MODERATE MATCH! Consider applying if you have related experience.";
  } else if (atsScore >= 30) {
    return "🤔 WEAK MATCH! Only apply if you have strong related experience.";
  } else {
    return "❌ POOR MATCH! Not recommended to apply. Consider upskilling first.";
  }
}

function findSkillsInText(text, skillsList) {
  const foundSkills = [];
  const textLower = text.toLowerCase();
  
  skillsList.forEach(skill => {
    const skillLower = skill.toLowerCase();
    
    // Handle common variations
    if (skillLower === "c++" && (textLower.includes("c++") || textLower.includes("c plus plus") || textLower.includes("cpp"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "github" && (textLower.includes("github") || textLower.includes("git"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "javascript" && (textLower.includes("javascript") || textLower.includes("js"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "node.js" && (textLower.includes("node.js") || textLower.includes("nodejs") || textLower.includes("node"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "html" && (textLower.includes("html") || textLower.includes("html5"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "css" && (textLower.includes("css") || textLower.includes("css3"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "data structures" && (textLower.includes("data structures") || textLower.includes("dsa"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "algorithms" && (textLower.includes("algorithms") || textLower.includes("algo"))) {
      foundSkills.push(skill);
    }
    else if (skillLower === "oop" && (textLower.includes("oop") || textLower.includes("object oriented programming"))) {
      foundSkills.push(skill);
    }
    else if (textLower.includes(skillLower)) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

// MULTIPLE PDF PARSING METHODS
async function extractTextMethod1(pdfBuffer) {
  // Method 1: pdf-parse (for standard PDFs)
  try {
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;
    if (text && text.length > 100) {
      console.log("Method 1 (pdf-parse) successful:", text.length, "chars");
      return text.toLowerCase();
    }
  } catch (err) {
    console.log("Method 1 failed:", err.message);
  }
  return null;
}

async function extractTextMethod2(pdfBuffer) {
  // Method 2: pdfreader (alternative parser)
  try {
    const { PdfReader } = require("pdfreader");
    const reader = new PdfReader();
    
    return new Promise((resolve, reject) => {
      let text = "";
      reader.parseBuffer(pdfBuffer, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve(text.length > 100 ? text.toLowerCase() : null);
        } else if (item.text) {
          text += item.text + " ";
        }
      });
    });
  } catch (err) {
    console.log("Method 2 failed:", err.message);
    return null;
  }
}

async function extractTextMethod3(pdfBuffer) {
  // Method 3: Extract raw text from PDF buffer (simple approach)
  try {
    const bufferStr = pdfBuffer.toString('utf8', 0, 10000);
    // Look for text patterns in the raw PDF
    const textMatches = bufferStr.match(/\(([^)]+)\)/g) || [];
    let extractedText = textMatches
      .map(match => match.slice(1, -1)) // Remove parentheses
      .join(' ')
      .replace(/\\\w+/g, ' ') // Remove escape sequences
      .replace(/\s+/g, ' ')
      .trim();
    
    if (extractedText.length > 100) {
      console.log("Method 3 (raw extraction) successful:", extractedText.length, "chars");
      return extractedText.toLowerCase();
    }
  } catch (err) {
    console.log("Method 3 failed:", err.message);
  }
  return null;
}

async function extractTextFromPDF(pdfBuffer) {
  console.log("Trying multiple PDF extraction methods...");
  
  // Try Method 1
  let text = await extractTextMethod1(pdfBuffer);
  if (text) return { text, method: "pdf-parse" };
  
  // Try Method 2
  text = await extractTextMethod2(pdfBuffer);
  if (text) return { text, method: "pdfreader" };
  
  // Try Method 3
  text = await extractTextMethod3(pdfBuffer);
  if (text) return { text, method: "raw extraction" };
  
  // If all methods fail, try external service approach
  console.log("All local methods failed, trying fallback...");
  
  // Method 4: Save and provide download option
  const tempPath = path.join(__dirname, 'temp_resume.pdf');
  fs.writeFileSync(tempPath, pdfBuffer);
  console.log("PDF saved temporarily at:", tempPath);
  
  return { 
    text: "PDF received but could not extract text automatically. Please try:\n1. Convert PDF to text using an online tool\n2. Save as a different PDF format\n3. Copy text manually and paste it",
    method: "failed",
    filePath: tempPath 
  };
}

// Main endpoint
app.post("/api/resume/analyze", upload.single("resume"), async (req, res) => {
  try {
    console.log("=== RESUME ANALYSIS STARTED ===");
    
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }
    
    const jobDescription = (req.body.jobDescription || "").toLowerCase();
    const resumeTextInput = (req.body.resumeText || "").toLowerCase();
    
    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: "Please provide a detailed job description" });
    }
    
    console.log(`File: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    console.log(`Job description length: ${jobDescription.length} chars`);
    
    let resumeText = "";
    let extractionMethod = "unknown";
    
    // OPTION 1: Use provided text if available
    if (resumeTextInput && resumeTextInput.trim().length > 50) {
      resumeText = resumeTextInput;
      extractionMethod = "manual text input";
      console.log("Using manual text input");
    } 
    // OPTION 2: Try to extract from PDF
    else {
      const extractionResult = await extractTextFromPDF(req.file.buffer);
      resumeText = extractionResult.text;
      extractionMethod = extractionResult.method;
      
      if (extractionResult.filePath) {
        console.log("PDF saved for manual processing:", extractionResult.filePath);
      }
    }
    
    console.log(`Extraction method: ${extractionMethod}`);
    console.log(`Text length: ${resumeText.length}`);
    
    // Check if we have meaningful text
    if (resumeText.length < 50 || resumeText.includes("could not extract")) {
      console.log("Insufficient text extracted");
      
      // Provide helpful error with solutions
      return res.status(400).json({
        error: "Could not extract sufficient text from PDF",
        suggestions: [
          "Copy and paste your resume text directly",
          "Convert PDF to text using: https://tools.pdf24.org/en/pdf-to-text",
          "Save as a different PDF format",
          "Ensure PDF is not password protected or scanned"
        ],
        extractedPreview: resumeText.slice(0, 200)
      });
    }
    
    console.log("Text preview:", resumeText.slice(0, 300));
    
    // PERFORM ANALYSIS
    const allSkills = [...skillsDatabase.technical, ...skillsDatabase.soft];
    const resumeSkills = findSkillsInText(resumeText, allSkills);
    const jdSkills = findSkillsInText(jobDescription, allSkills);
    
    console.log("\n=== ANALYSIS RESULTS ===");
    console.log("Skills in resume:", resumeSkills);
    console.log("Skills in job:", jdSkills);
    
    const matchedSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
    const missingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));
    
    const atsScore = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;
    
    console.log("Matched:", matchedSkills);
    console.log("Missing:", missingSkills);
    console.log("ATS Score:", atsScore + "%");
    
    // Generate report
    const summary = `📊 ATS COMPATIBILITY SCORE: ${atsScore}% - ${getScoreLevel(atsScore)}

✅ Matched Skills (${matchedSkills.length}): ${matchedSkills.join(", ") || "None"}

📋 Missing Skills (${missingSkills.length}): ${missingSkills.join(", ") || "None - Great job!"}

💡 Recommendation: ${getRecommendation(atsScore, matchedSkills, missingSkills)}

Extraction Method: ${extractionMethod}
Text Length: ${resumeText.length} characters`;

    res.json({
      matchedSkills,
      missingSkills,
      atsScore,
      summary,
      resumeSkillsCount: resumeSkills.length,
      jdSkillsCount: jdSkills.length,
      extractedResumePreview: resumeText.slice(0, 400) + "...",
      extractionMethod,
      success: true
    });
    
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ 
      error: "Analysis failed", 
      details: err.message,
      suggestion: "Please try converting your PDF to text first"
    });
  }
});

// Text-only analysis endpoint (fallback)
app.post("/api/analyze-text", express.json(), async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Both resume text and job description are required" });
    }
    
    const allSkills = [...skillsDatabase.technical, ...skillsDatabase.soft];
    const resumeSkills = findSkillsInText(resumeText.toLowerCase(), allSkills);
    const jdSkills = findSkillsInText(jobDescription.toLowerCase(), allSkills);
    
    const matchedSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
    const missingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));
    const atsScore = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;
    
    const summary = `📊 ATS COMPATIBILITY SCORE: ${atsScore}% - ${getScoreLevel(atsScore)}

✅ Matched Skills (${matchedSkills.length}): ${matchedSkills.join(", ") || "None"}

📋 Missing Skills (${missingSkills.length}): ${missingSkills.join(", ") || "None - Great job!"}

💡 Recommendation: ${getRecommendation(atsScore, matchedSkills, missingSkills)}`;

    res.json({
      matchedSkills,
      missingSkills,
      atsScore,
      summary,
      resumeSkillsCount: resumeSkills.length,
      jdSkillsCount: jdSkills.length,
      success: true
    });
    
  } catch (err) {
    res.status(500).json({ error: "Text analysis failed", details: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Healthy", 
    message: "Resume Analyzer API is running",
    timestamp: new Date().toISOString()
  });
});

app.listen(3001, () => {
  console.log("🚀 Backend running on http://localhost:3001");
  console.log("✅ Ready to analyze all PDF types");
});




// // server.js - SIMPLIFIED VERSION
// import express from "express";
// import multer from "multer";
// import cors from "cors";
// import * as pdfParse from "pdf-parse";

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "20mb" }));

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// const skillsDatabase = {
//   technical: ["javascript", "python", "java", "c++", "react", "node.js", "express"],
//   soft: ["communication", "teamwork", "leadership", "problem solving"]
// };

// app.post("/api/resume/analyze", upload.single("resume"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });
    
//     const jobDescription = (req.body.jobDescription || "").toLowerCase();
//     let resumeText = "";

//     try {
//       const pdfData = await pdfParse(req.file.buffer);
//       resumeText = pdfData.text.toLowerCase();
//     } catch (err) {
//       resumeText = "Could not extract text from PDF";
//     }

//     // Simple skill matching
//     const matchedSkills = [];
//     const missingSkills = [];

//     skillsDatabase.technical.forEach(skill => {
//       if (resumeText.includes(skill) && jobDescription.includes(skill)) {
//         matchedSkills.push(skill);
//       } else if (jobDescription.includes(skill)) {
//         missingSkills.push(skill);
//       }
//     });

//     const atsScore = jobDescription.length > 0 ? Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100) : 0;

//     res.json({
//       matchedSkills,
//       missingSkills,
//       atsScore,
//       summary: `ATS Score: ${atsScore}% - ${matchedSkills.length} skills matched, ${missingSkills.length} skills missing`,
//       resumeSkillsCount: matchedSkills.length,
//       jdSkillsCount: matchedSkills.length + missingSkills.length,
//       extractedResumePreview: resumeText.slice(0, 200) + "..."
//     });

//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ error: "Analysis failed", details: err.message });
//   }
// });

// app.get("/api/health", (req, res) => {
//   res.json({ status: "Healthy", message: "Resume Analyzer API is running" });
// });

// app.listen(3001, () => console.log("🚀 Backend running on http://localhost:3001"));