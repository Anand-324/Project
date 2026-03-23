import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfile] = useState({
    name: 'Arjun Kumar',
    cgpa: '8.2',
    marks_10: '92',
    marks_12: '87',
    role: 'Backend Developer',
    skills: 'Python, Flask, MySQL, REST APIs, Docker',
    projects: 'Task management API with Flask and JWT auth. Sentiment analysis pipeline with BERT fine-tuning. Docker-based microservices deployment.',
    courses: 'Machine Learning (Coursera), Data Structures (NPTEL), Flask Web Development',
  });

  const [profileResult,  setProfileResult]  = useState(null);
  const [aptitudeResult, setAptitudeResult] = useState(null);
  const [codingResult,   setCodingResult]   = useState(null);
  const [interviewData,  setInterviewData]  = useState({ history: [], scores: [] });
  const [finalResults,   setFinalResults]   = useState(null);

  // Journey step completion tracking
  const [completed, setCompleted] = useState({
    profile: false, aptitude: false, coding: false, interview: false,
  });
  const markComplete = (step) => setCompleted(c => ({ ...c, [step]: true }));

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      profileResult,  setProfileResult,
      aptitudeResult, setAptitudeResult,
      codingResult,   setCodingResult,
      interviewData,  setInterviewData,
      finalResults,   setFinalResults,
      completed, markComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
