import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 60000 });

// Profile
export const analyseProfile = (data)  => api.post('/profile/analyse', data);

// Aptitude
export const getAptitudeQuestions = (role) => api.get('/aptitude/questions', { params: { role } });
export const evaluateAptitude     = (data) => api.post('/aptitude/evaluate', data);

// Coding
export const getCodingProblem  = (role, difficulty) => api.get('/coding/problem', { params: { role, difficulty } });
export const evaluateCode      = (data) => api.post('/coding/evaluate', data);

// Interview
export const generateQuestion  = (data) => api.post('/interview/question', data);
export const evaluateAnswer    = (data) => api.post('/interview/evaluate', data);
export const getAriaFeedback   = (data) => api.post('/interview/feedback', data);

// Results
export const computeResults    = (data) => api.post('/results/compute', data);

// Admin
export const getAdminStats      = ()     => api.get('/admin/stats');
export const getAdminCandidates = ()     => api.get('/admin/candidates');
export const getAdminRoles      = ()     => api.get('/admin/roles');

export default api;
