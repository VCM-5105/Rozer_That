const DB_NAME = 'rozer_that';

const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

const EXAM_CATEGORIES = {
  NDA: 'NDA',
  CDS: 'CDS',
  AFCAT: 'AFCAT',
  CAPF: 'CAPF',
  SSB: 'SSB',
  REVISION: 'Revision',
  FINAL_PRACTICE: 'Final Practice',
  GENERAL: 'General',
  ALL: 'All',
};

const NEWS_CATEGORIES = {
  NATIONAL: 'National',
  INTERNATIONAL: 'International',
  DEFENCE: 'Defence',
  ECONOMY: 'Economy',
  SCIENCE: 'Science',
  SPORTS: 'Sports',
};

const TOPIC_DIFFICULTY = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

module.exports = {
  DB_NAME,
  USER_ROLES,
  EXAM_CATEGORIES,
  NEWS_CATEGORIES,
  TOPIC_DIFFICULTY,
};
