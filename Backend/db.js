const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');


const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite connection error:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


const initDB = async () => {
  try {
   
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

   
    await run(`
      CREATE TABLE IF NOT EXISTS sheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT,
        icon TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);

   
    await run(`
      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sheet_id INTEGER REFERENCES sheets(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Medium',
        notes_content TEXT,
        video_url TEXT,
        pdf_url TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);

    
    await run(`
      CREATE TABLE IF NOT EXISTS user_topic_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        is_completed INTEGER DEFAULT 0,
        revision_count INTEGER DEFAULT 0,
        is_bookmarked INTEGER DEFAULT 0,
        notes TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic_id)
      )
    `);

    
    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        exam TEXT NOT NULL,
        eligibility TEXT,
        age_limit TEXT,
        apply_start TEXT,
        apply_end TEXT,
        official_link TEXT,
        pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    
    await run(`
      CREATE TABLE IF NOT EXISTS pyqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        exam TEXT NOT NULL,
        year INTEGER NOT NULL,
        paper_type TEXT,
        file_url TEXT,
        download_count INTEGER DEFAULT 0
      )
    `);

   
    await run(`
      CREATE TABLE IF NOT EXISTS current_affairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    
    await run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        exam TEXT DEFAULT 'All',
        duration_minutes INTEGER DEFAULT 10,
        questions_json TEXT NOT NULL
      )
    `);

    
    await run(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        time_spent_seconds INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    
    await run(`
      CREATE TABLE IF NOT EXISTS mock_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        exam TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 120,
        total_marks REAL NOT NULL,
        positive_marks REAL DEFAULT 1.0,
        negative_marks REAL DEFAULT 0.33,
        questions_json TEXT NOT NULL
      )
    `);

   
    await run(`
      CREATE TABLE IF NOT EXISTS mock_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        mock_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
        score REAL NOT NULL,
        total_marks REAL NOT NULL,
        attempted_count INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        wrong_count INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        time_spent_seconds INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('SQLite Tables Initialized');
    await seedInitialData();

  } catch (err) {
    console.error('❌ DB Initialization error:', err);
  }
};

const seedInitialData = async () => {
  
  const admin = await get('SELECT * FROM users WHERE email = ?', ['admin@rozerthat.com']);
  if (!admin) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['CommanderAdmin', 'admin@rozerthat.com', hash, 'admin']
    );

   
    const studentHash = await bcrypt.hash('Student@123', 10);
    await run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['CadetRahul', 'rahul@rozerthat.com', studentHash, 'student']
    );
    console.log('✅ Default users seeded (Admin: admin@rozerthat.com / Admin@123)');
  }

 
  const sheetCount = await get('SELECT COUNT(*) as count FROM sheets');
  if (sheetCount.count === 0) {
    const sheetsData = [
      {
        title: 'Mission NDA',
        slug: 'mission-nda',
        description: 'Comprehensive preparation roadmap for National Defence Academy written exam & SSB.',
        category: 'NDA',
        icon: 'Shield',
        order_index: 1,
        topics: [
          { title: 'Trigonometry & Heights and Distances', subject: 'Mathematics', difficulty: 'Medium', notes_content: 'Key formulas: sin²θ + cos²θ = 1, tan(A+B) expansion. Focus on height ratios.' },
          { title: 'Matrices & Determinants', subject: 'Mathematics', difficulty: 'Easy', notes_content: 'Properties of symmetric, skew-symmetric matrices and inverse properties.' },
          { title: 'Calculus: Limits, Continuity & Differentiability', subject: 'Mathematics', difficulty: 'Hard', notes_content: 'L\'Hopital\'s rule, continuity conditions, standard derivatives.' },
          { title: 'Vector Algebra & 3D Geometry', subject: 'Mathematics', difficulty: 'Medium', notes_content: 'Dot product, cross product applications, line and plane equations.' },
          { title: 'English Grammar: Spotting Errors & Prepositions', subject: 'General Ability', difficulty: 'Easy', notes_content: 'Subject-verb agreement rules, common prepositional usage.' },
          { title: 'Physics: Mechanics, Electricity & Optics', subject: 'General Ability', difficulty: 'Medium', notes_content: 'Newton\'s laws of motion, Ohm\'s law, mirror & lens formula.' },
          { title: 'Indian National Movement (1857-1947)', subject: 'General Ability', difficulty: 'Medium', notes_content: 'Revolt of 1857, Non-Cooperation Movement, Quit India Movement, Independence Act.' }
        ]
      },
      {
        title: 'Operation CDS',
        slug: 'operation-cds',
        description: 'Master English, General Knowledge, and Elementary Maths for Combined Defence Services.',
        category: 'CDS',
        icon: 'Crosshair',
        order_index: 2,
        topics: [
          { title: 'Reading Comprehension & Para Jumbles', subject: 'English', difficulty: 'Easy', notes_content: 'Contextual vocabulary deduction, connecting pronoun clues in jumbled paragraphs.' },
          { title: 'Indian Polity: Constitution, Fundamental Rights & Parliament', subject: 'General Knowledge', difficulty: 'Hard', notes_content: 'Articles 12-35, Emergency provisions, Constitutional Amendments.' },
          { title: 'Indian Economy & Budget Analysis', subject: 'General Knowledge', difficulty: 'Medium', notes_content: 'GDP calculation, RBI Monetary policy tools, Inflation types, Budget highlights.' },
          { title: 'Elementary Mathematics: Number System & LCM/HCF', subject: 'Mathematics', difficulty: 'Easy', notes_content: 'Divisibility rules, remainder theorems, HCF-LCM applications.' },
          { title: 'Speed, Distance & Time (Trains & Streams)', subject: 'Mathematics', difficulty: 'Medium', notes_content: 'Relative speed concepts, upstream and downstream formulas.' }
        ]
      },
      {
        title: 'Falcon AFCAT',
        slug: 'falcon-afcat',
        description: 'Air Force Common Admission Test preparation covering Verbal, Reasoning, GA, and Quant.',
        category: 'AFCAT',
        icon: 'Plane',
        order_index: 3,
        topics: [
          { title: 'Military Awareness & Defence Equipment', subject: 'General Awareness', difficulty: 'Easy', notes_content: 'Commands of IAF, missiles (BrahMos, Akash), fighter aircrafts (Rafale, Su-30MKI).' },
          { title: 'Spatial Reasoning & Pattern Completion', subject: 'Reasoning', difficulty: 'Medium', notes_content: 'Venn diagrams, embedded figures, mirror images, sequence continuation.' },
          { title: 'Numerical Ability: Ratio, Proportion & Mixtures', subject: 'Numerical Ability', difficulty: 'Medium', notes_content: 'Weighted average formula, replacement rule in mixtures.' },
          { title: 'Synonyms, Antonyms & Idioms', subject: 'English', difficulty: 'Easy', notes_content: 'High-frequency AFCAT vocabulary lists and usage in sentences.' }
        ]
      },
      {
        title: 'Officer\'s Roadmap',
        slug: 'officers-roadmap',
        description: 'Strategic guide for SSB Interview, Psychological Tests, GTO, and Personal Interview.',
        category: 'SSB',
        icon: 'Award',
        order_index: 4,
        topics: [
          { title: 'OIR Test (Officers Intelligence Rating)', subject: 'Stage-1', difficulty: 'Easy', notes_content: 'Verbal & Non-Verbal intelligence questions practice with 30-sec time constraints.' },
          { title: 'PPDT & TAT Story Writing Techniques', subject: 'Psychology', difficulty: 'Hard', notes_content: 'Officer Like Qualities (OLQs) integration in hero character and story resolution.' },
          { title: 'WAT (Word Association Test) Practice', subject: 'Psychology', difficulty: 'Medium', notes_content: 'Positive action-oriented sentences for 60 words in 15 minutes.' },
          { title: 'SRT (Situation Reaction Test)', subject: 'Psychology', difficulty: 'Medium', notes_content: 'Practical and realistic reactions to 60 daily situations.' }
        ]
      },
      {
        title: 'Warrior Revision Sheet',
        slug: 'warrior-revision-sheet',
        description: 'High-yield quick revision points, formulas, and memory mnemonics for quick review.',
        category: 'Revision',
        icon: 'Zap',
        order_index: 5,
        topics: [
          { title: 'Quick Formula Sheet: Geometry & Mensuration', subject: 'Mathematics', difficulty: 'Easy', notes_content: 'Volume, Surface Area of Sphere, Cone, Cylinder, Frustum formulas.' },
          { title: 'Important Battles in Indian History', subject: 'History', difficulty: 'Medium', notes_content: 'Panipat 1, 2, 3, Plassey 1757, Buxar 1764, Anglo-Maratha wars summary.' },
          { title: 'Periodic Table & Chemical Reactions Quick Cheat Sheet', subject: 'Chemistry', difficulty: 'Easy', notes_content: 'Oxidation-reduction, Acids and Bases, Important ores and alloys.' }
        ]
      },
      {
        title: 'Final Assault Sheet',
        slug: 'final-assault-sheet',
        description: 'Last 30-day exam oriented practice problems and high frequency expected questions.',
        category: 'Final Practice',
        icon: 'Target',
        order_index: 6,
        topics: [
          { title: 'Top 100 Expected Maths Questions for NDA/CDS', subject: 'Mathematics', difficulty: 'Hard', notes_content: 'Comprehensive problem set covering algebra, trigonometry, and calculus.' },
          { title: 'Top Defence Current Affairs (Last 6 Months)', subject: 'Current Affairs', difficulty: 'Medium', notes_content: 'Exercise Malabar, Yudh Abhyas, Joint Military Exercises list.' }
        ]
      }
    ];

    for (const s of sheetsData) {
      const res = await run(
        'INSERT INTO sheets (title, slug, description, category, icon, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        [s.title, s.slug, s.description, s.category, s.icon, s.order_index]
      );
      let tIdx = 1;
      for (const t of s.topics) {
        await run(
          'INSERT INTO topics (sheet_id, title, subject, difficulty, notes_content, order_index) VALUES (?, ?, ?, ?, ?, ?)',
          [res.lastID, t.title, t.subject, t.difficulty, t.notes_content, tIdx++]
        );
      }
    }
    console.log('Study Sheets seeded');
  }

  // Seed Notifications
  const notifCount = await get('SELECT COUNT(*) as count FROM notifications');
  if (notifCount.count === 0) {
    const notifs = [
      {
        title: 'UPSC NDA & NA (I) Official Notification',
        exam: 'NDA',
        eligibility: '10+2 Pass / Appearing (Physics & Maths for Air Force/Navy)',
        age_limit: '16.5 to 19.5 years',
        apply_start: '2026-01-10',
        apply_end: '2026-02-15',
        official_link: 'https://upsc.gov.in',
        pdf_url: '#'
      },
      {
        title: 'UPSC CDS (I) Examination Notification',
        exam: 'CDS',
        eligibility: 'Graduation Degree from recognized University',
        age_limit: '19 to 24 years (IMA/INA/AFA)',
        apply_start: '2026-01-15',
        apply_end: '2026-02-20',
        official_link: 'https://upsc.gov.in',
        pdf_url: '#'
      },
      {
        title: 'IAF AFCAT 01/2026 Notification Released',
        exam: 'AFCAT',
        eligibility: 'Graduate with min 60% marks in Flying / Ground Duty',
        age_limit: '20 to 24 years (Flying Branch)',
        apply_start: '2026-02-01',
        apply_end: '2026-03-05',
        official_link: 'https://afcat.cdac.in',
        pdf_url: '#'
      }
    ];

    for (const n of notifs) {
      await run(
        'INSERT INTO notifications (title, exam, eligibility, age_limit, apply_start, apply_end, official_link, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [n.title, n.exam, n.eligibility, n.age_limit, n.apply_start, n.apply_end, n.official_link, n.pdf_url]
      );
    }
    console.log('✅ Defence Notifications seeded');
  }


  const pyqCount = await get('SELECT COUNT(*) as count FROM pyqs');
  if (pyqCount.count === 0) {
    const pyqList = [
      { title: 'NDA I 2025 Mathematics Question Paper', exam: 'NDA', year: 2025, paper_type: 'Mathematics', file_url: '#' },
      { title: 'NDA I 2025 General Ability Test (GAT)', exam: 'NDA', year: 2025, paper_type: 'GAT', file_url: '#' },
      { title: 'CDS I 2025 English Question Paper', exam: 'CDS', year: 2025, paper_type: 'English', file_url: '#' },
      { title: 'CDS I 2025 General Knowledge Paper', exam: 'CDS', year: 2025, paper_type: 'GK', file_url: '#' },
      { title: 'AFCAT I 2025 Official Memory-Based Paper', exam: 'AFCAT', year: 2025, paper_type: 'Combined', file_url: '#' }
    ];

    for (const p of pyqList) {
      await run(
        'INSERT INTO pyqs (title, exam, year, paper_type, file_url) VALUES (?, ?, ?, ?, ?)',
        [p.title, p.exam, p.year, p.paper_type, p.file_url]
      );
    }
    console.log('✅ PYQs seeded');
  }

  
  const newsCount = await get('SELECT COUNT(*) as count FROM current_affairs');
  if (newsCount.count === 0) {
    const newsList = [
      {
        title: 'Exercise Dustlik 2026: Joint Military Exercise Conducted',
        category: 'Defence',
        content: 'Indian Army contingent participates in the 7th edition of Joint Military Exercise Dustlik focusing on anti-terror operations in semi-urban terrain.',
        date: '2026-08-01',
        image_url: ''
      },
      {
        title: 'INS Vikrant Achieves Full Operational Capability Milestone',
        category: 'Defence',
        content: 'India\'s indigenous aircraft carrier INS Vikrant completes night landing trials with MiG-29K aircraft, enhancing naval strike capabilities.',
        date: '2026-08-02',
        image_url: ''
      },
      {
        title: 'ISRO Successfully Launches Defence Surveillance Satellite',
        category: 'Science',
        content: 'ISRO launched advanced electro-optical earth observation satellite for border surveillance using PSLV launch vehicle.',
        date: '2026-08-03',
        image_url: ''
      }
    ];

    for (const ca of newsList) {
      await run(
        'INSERT INTO current_affairs (title, category, content, date, image_url) VALUES (?, ?, ?, ?, ?)',
        [ca.title, ca.category, ca.content, ca.date, ca.image_url]
      );
    }
    console.log('✅ Current Affairs seeded');
  }

 
  
  const quoteCount = await get('SELECT COUNT(*) as count FROM quotes');
  if (quoteCount.count === 0) {
    const quotes = [
      { quote: 'Some goals are so worthy, it\'s glorious even to fail.', author: 'Captain Manoj Kumar Pandey, Param Vir Chakra' },
      { quote: 'Either I will come back after hoisting the Tricolour, or I will come back wrapped in it, but I will be back for sure.', author: 'Captain Vikram Batra, Param Vir Chakra' },
      { quote: 'The safety, honour and welfare of your country come first, always and every time.', author: 'Chetwode Motto, IMA Dehradun' },
      { quote: 'If a man says he is not afraid of dying, he is either lying or he is a Gorkha.', author: 'Field Marshal Sam Manekshaw' }
    ];

    for (const q of quotes) {
      await run('INSERT INTO quotes (quote, author) VALUES (?, ?)', [q.quote, q.author]);
    }
    console.log('✅ Quotes seeded');
  }

  const quizCount = await get('SELECT COUNT(*) as count FROM quizzes');
  if (quizCount.count === 0) {
    const sampleQuiz = {
      title: 'Defence Awareness & Military Knowledge Quiz',
      subject: 'Defence GK',
      exam: 'All',
      duration_minutes: 10,
      questions_json: JSON.stringify([
        {
          id: 1,
          question: 'Where is the Headquarters of the Southern Command of the Indian Army located?',
          options: ['Pune', 'Udhampur', 'Lucknow', 'Jaipur'],
          answerIndex: 0,
          explanation: 'The Southern Command of the Indian Army is headquartered in Pune, Maharashtra.'
        },
        {
          id: 2,
          question: 'What is the motto of the National Defence Academy (NDA)?',
          options: ['Touch the Sky with Glory', 'Service Before Self (Seva Parmo Dharma)', 'Valour and Faith', 'Victory Through Knowledge'],
          answerIndex: 1,
          explanation: 'The motto of NDA is "Seva Parmo Dharma" which translates to "Service Before Self".'
        },
        {
          id: 3,
          question: 'Which is India\'s first indigenously built ballistic missile submarine?',
          options: ['INS Kalvari', 'INS Vikrant', 'INS Arihant', 'INS Chakra'],
          answerIndex: 2,
          explanation: 'INS Arihant is India\'s first nuclear-powered ballistic missile submarine.'
        },
        {
          id: 4,
          question: 'Who was the first Indian officer to receive the highest military decoration, Param Vir Chakra?',
          options: ['Major Somnath Sharma', 'Captain Vikram Batra', 'Lance Naik Albert Ekka', 'Subedar Joginder Singh'],
          answerIndex: 0,
          explanation: 'Major Somnath Sharma was posthumously awarded India\'s first Param Vir Chakra for his heroism in Badgam in 1947.'
        },
        {
          id: 5,
          question: 'What is the rank equivalent of Wing Commander in the Indian Navy?',
          options: ['Commander', 'Captain', 'Lieutenant Commander', 'Commodore'],
          answerIndex: 0,
          explanation: 'Wing Commander in Air Force is equivalent to Commander in Navy and Lieutenant Colonel in Army.'
        }
      ])
    };

    await run(
      'INSERT INTO quizzes (title, subject, exam, duration_minutes, questions_json) VALUES (?, ?, ?, ?, ?)',
      [sampleQuiz.title, sampleQuiz.subject, sampleQuiz.exam, sampleQuiz.duration_minutes, sampleQuiz.questions_json]
    );
    console.log('✅ Quizzes seeded');
  }


  const mockCount = await get('SELECT COUNT(*) as count FROM mock_tests');
  if (mockCount.count === 0) {
    const sampleMock = {
      title: 'Full Length NDA Mock Test - Paper I (Mathematics)',
      exam: 'NDA',
      duration_minutes: 60,
      total_marks: 100,
      positive_marks: 2.5,
      negative_marks: 0.83,
      questions_json: JSON.stringify([
        {
          id: 101,
          section: 'Mathematics',
          question: 'If A and B are two sets such that n(A) = 15, n(B) = 20, and n(A ∪ B) = 30, then what is n(A ∩ B)?',
          options: ['5', '10', '15', '25'],
          answerIndex: 0,
          explanation: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B) => 30 = 15 + 20 - n(A ∩ B) => n(A ∩ B) = 5.'
        },
        {
          id: 102,
          section: 'Mathematics',
          question: 'What is the value of sin(75°)?',
          options: ['(√6 + √2)/4', '(√6 - √2)/4', '(√3 + 1)/2', '(√3 - 1)/2'],
          answerIndex: 0,
          explanation: 'sin(75°) = sin(45° + 30°) = sin45°cos30° + cos45°sin30° = (1/√2)(√3/2) + (1/√2)(1/2) = (√6 + √2)/4.'
        },
        {
          id: 103,
          section: 'Mathematics',
          question: 'What is the modulus of complex number z = 3 + 4i?',
          options: ['5', '7', '25', '1'],
          answerIndex: 0,
          explanation: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5.'
        },
        {
          id: 104,
          section: 'Mathematics',
          question: 'What is the derivative of e^(2x) with respect to x?',
          options: ['e^(2x)', '2e^(2x)', 'e^x', '2xe^(2x)'],
          answerIndex: 1,
          explanation: 'd/dx (e^(2x)) = 2 * e^(2x) using chain rule.'
        }
      ])
    };

    await run(
      'INSERT INTO mock_tests (title, exam, duration_minutes, total_marks, positive_marks, negative_marks, questions_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sampleMock.title, sampleMock.exam, sampleMock.duration_minutes, sampleMock.total_marks, sampleMock.positive_marks, sampleMock.negative_marks, sampleMock.questions_json]
    );
    console.log('Mock Tests seeded');
  }
};

initDB();

module.exports = {
  db,
  run,
  get,
  all
};
