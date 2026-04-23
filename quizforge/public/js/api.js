// public/js/api.js
// Unit II: HTTP Services in Node.js / Fetch API (modern JS, Unit II Syllabus 1)
// Handles all communication between frontend and Express REST API

const API_BASE = '/api';

const Api = (() => {
  // Get JWT token from localStorage
  const getToken = () => localStorage.getItem('qf_token');

  // Build headers — attach Bearer token if present
  const headers = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...extra,
  });

  // Generic request helper using Promises (Unit III: Async Programming)
  const request = async (method, endpoint, body = null) => {
    const options = { method, headers: headers() };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    get:    (endpoint)        => request('GET',    endpoint),
    post:   (endpoint, body)  => request('POST',   endpoint, body),
    put:    (endpoint, body)  => request('PUT',    endpoint, body),
    delete: (endpoint)        => request('DELETE', endpoint),
  };
})();

// ── Seeded local quiz data (used when backend is offline / during dev) ──
// This mirrors the MongoDB schema from models/Quiz.js
const LOCAL_QUIZZES = [
  {
    _id: '1', title: 'HTML5 & CSS3 Foundations', topic: 'HTML/CSS', difficulty: 'easy',
    timerPerQuestion: 30, totalPlays: 42, bestScore: 100,
    questions: [
      { questionText: 'Which HTML5 element defines the main content area of a document?', options: ['<section>', '<main>', '<article>', '<div>'], correctAnswer: 1, explanation: 'The <main> element represents the dominant content of the <body>. Each page should have only one <main>.' },
      { questionText: 'Which CSS property controls the stacking order of overlapping elements?', options: ['position', 'display', 'z-index', 'float'], correctAnswer: 2, explanation: 'z-index controls which elements appear on top when they overlap. It only works on positioned elements.' },
      { questionText: 'In CSS Flexbox, which property aligns items along the cross axis?', options: ['justify-content', 'align-items', 'flex-direction', 'flex-wrap'], correctAnswer: 1, explanation: 'align-items aligns flex items on the cross axis (perpendicular to the main axis). justify-content works on the main axis.' },
      { questionText: 'What does the CSS Box Model consist of, from inside out?', options: ['Content, padding, border, margin', 'Content, spacing, shadow, border', 'Width, height, position, display', 'Font, color, background, border'], correctAnswer: 0, explanation: 'The CSS Box Model: content → padding → border → margin, from the inside out.' },
      { questionText: 'Which CSS property is used to create a responsive grid layout?', options: ['flexbox', 'grid-template-columns', 'float', 'position'], correctAnswer: 1, explanation: 'grid-template-columns defines the number and size of columns in a CSS Grid layout, enabling responsive multi-column designs.' },
    ]
  },
  {
    _id: '2', title: 'JavaScript Fundamentals', topic: 'JavaScript', difficulty: 'easy',
    timerPerQuestion: 25, totalPlays: 78, bestScore: 95,
    questions: [
      { questionText: 'Which keyword declares a block-scoped variable in modern JavaScript?', options: ['var', 'let', 'const', 'def'], correctAnswer: 1, explanation: 'let declares a block-scoped, reassignable variable. const is also block-scoped but cannot be reassigned. var is function-scoped.' },
      { questionText: 'What does typeof null return in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctAnswer: 2, explanation: 'typeof null === "object" is a famous JavaScript bug retained for backward compatibility. null is not actually an object.' },
      { questionText: 'Which array method transforms each element and returns a new array?', options: ['forEach', 'filter', 'map', 'reduce'], correctAnswer: 2, explanation: 'map() applies a function to each element and returns a new array of the same length. forEach just iterates without returning.' },
      { questionText: 'What is the result of: [1,2,3].reduce((acc, x) => acc + x, 0)?', options: ['123', '6', '0', 'undefined'], correctAnswer: 1, explanation: 'reduce() accumulates values. Starting at 0: 0+1=1, 1+2=3, 3+3=6. The second argument to reduce is the initial value.' },
      { questionText: 'What does the spread operator (...) do in an array context?', options: ['Creates a deep copy', 'Spreads iterable elements into the array', 'Declares rest parameters only', 'Merges object properties'], correctAnswer: 1, explanation: 'The spread operator expands an iterable into individual elements. [...arr1, ...arr2] merges arrays.' },
    ]
  },
  {
    _id: '3', title: 'Advanced JS & Async', topic: 'JavaScript', difficulty: 'hard',
    timerPerQuestion: 20, totalPlays: 35, bestScore: 80,
    questions: [
      { questionText: 'What is a closure in JavaScript?', options: ['A function with no return value', 'A function that retains access to its outer scope', 'An immediately invoked function expression', 'A pure function without side effects'], correctAnswer: 1, explanation: 'A closure is created when a function retains access to its lexical scope variables even after the outer function has returned.' },
      { questionText: 'In the event loop, microtasks vs macrotasks — which runs first?', options: ['Macrotasks (setTimeout)', 'Microtasks (Promises)', 'They run simultaneously', 'Depends on the browser'], correctAnswer: 1, explanation: 'After each macrotask, ALL pending microtasks (Promises, queueMicrotask) run before the next macrotask starts.' },
      { questionText: 'What is the output of: console.log(1); setTimeout(()=>console.log(2),0); Promise.resolve().then(()=>console.log(3));', options: ['1,2,3', '1,3,2', '3,1,2', '2,1,3'], correctAnswer: 1, explanation: '1 logs synchronously. Promise.then is a microtask (runs before next macrotask). setTimeout is a macrotask. Output: 1, 3, 2.' },
      { questionText: 'What does async/await primarily replace syntactically?', options: ['Callbacks only', 'Promise .then() chains', 'Both callbacks and event emitters', 'Generator functions only'], correctAnswer: 1, explanation: 'async/await is syntactic sugar over Promises, making .then() chains easier to read as sequential code.' },
    ]
  },
  {
    _id: '4', title: 'Node.js Basics', topic: 'Node.js', difficulty: 'easy',
    timerPerQuestion: 30, totalPlays: 61, bestScore: 100,
    questions: [
      { questionText: 'What does REPL stand for in Node.js?', options: ['Run Execute Print Loop', 'Read Evaluate Print Loop', 'Remote Execution Protocol Layer', 'Runtime Environment Programming Layer'], correctAnswer: 1, explanation: 'REPL = Read-Evaluate-Print Loop. It is an interactive shell for executing Node.js code line by line.' },
      { questionText: 'Which Node.js core module handles file system operations?', options: ['path', 'http', 'fs', 'os'], correctAnswer: 2, explanation: 'The fs (File System) module provides APIs for reading, writing, and manipulating files and directories.' },
      { questionText: 'What command initializes a new Node.js project and creates package.json?', options: ['npm start', 'npm create', 'npm init', 'node new'], correctAnswer: 2, explanation: 'npm init creates a package.json by prompting for project information. npm init -y skips the prompts with defaults.' },
      { questionText: 'What is EventEmitter used for in Node.js?', options: ['Only for DOM events', 'Custom event-driven programming', 'HTTP server only', 'Database queries'], correctAnswer: 1, explanation: 'EventEmitter implements the observer pattern — you can emit named events and register listeners with .on().' },
      { questionText: 'What does npm stand for?', options: ['Node Package Module', 'Node Package Manager', 'New Package Module', 'Native Package Manager'], correctAnswer: 1, explanation: 'npm = Node Package Manager. It manages project dependencies and scripts via package.json.' },
    ]
  },
  {
    _id: '5', title: 'MongoDB & Mongoose', topic: 'MongoDB', difficulty: 'medium',
    timerPerQuestion: 25, totalPlays: 29, bestScore: 90,
    questions: [
      { questionText: 'What is a MongoDB collection analogous to in SQL?', options: ['A row', 'A table', 'A database', 'An index'], correctAnswer: 1, explanation: 'A collection in MongoDB holds documents, similar to how a SQL table holds rows.' },
      { questionText: 'In Mongoose, what defines the structure/shape of a document?', options: ['Model', 'Schema', 'Collection', 'Document'], correctAnswer: 1, explanation: 'A Mongoose Schema defines field names, types, validators, and defaults for documents in a collection.' },
      { questionText: 'Which MongoDB shell command inserts a single document?', options: ['db.col.add()', 'db.col.insert()', 'db.col.insertOne()', 'db.col.create()'], correctAnswer: 2, explanation: 'insertOne() inserts a single document and returns an acknowledgment. insertMany() handles multiple documents.' },
      { questionText: 'What does CRUD stand for?', options: ['Create, Read, Update, Delete', 'Connect, Read, Update, Deploy', 'Create, Render, Upload, Delete', 'None of the above'], correctAnswer: 0, explanation: 'CRUD = Create, Read, Update, Delete — the four basic operations for persistent storage.' },
    ]
  },
  {
    _id: '6', title: 'TypeScript Fundamentals', topic: 'TypeScript', difficulty: 'medium',
    timerPerQuestion: 30, totalPlays: 44, bestScore: 85,
    questions: [
      { questionText: 'What does a TypeScript interface define?', options: ['A class with abstract methods', 'A contract/shape that an object must conform to', 'A type alias only', 'An enum of values'], correctAnswer: 1, explanation: 'An interface defines a contract — property names and types that implementing objects must satisfy.' },
      { questionText: 'What is a union type in TypeScript?', options: ['Combining two classes via inheritance', 'A value that can be one of several types', 'An intersection of two types', 'A generic type constraint'], correctAnswer: 1, explanation: 'A union type (string | number) allows a variable to hold one of several specified types.' },
      { questionText: 'What does the TypeScript compiler (tsc) produce as output?', options: ['WebAssembly', 'JavaScript', 'Minified CSS', 'Machine bytecode'], correctAnswer: 1, explanation: 'TypeScript is a superset of JavaScript that compiles down to plain JavaScript via tsc.' },
      { questionText: 'What does type inference mean in TypeScript?', options: ['You must always declare types manually', 'TypeScript automatically determines types from values', 'Types are optional at runtime', 'The compiler converts types to comments'], correctAnswer: 1, explanation: 'TypeScript can infer types from assigned values — const x = 5 is automatically typed as number without annotation.' },
    ]
  },
  {
    _id: '7', title: 'Express.js & REST APIs', topic: 'Express', difficulty: 'medium',
    timerPerQuestion: 25, totalPlays: 38, bestScore: 88,
    questions: [
      { questionText: 'What is Express.js?', options: ['A database for Node.js', 'A minimal Node.js web framework', 'A CSS preprocessor', 'A testing library'], correctAnswer: 1, explanation: 'Express.js is a fast, minimalist web framework for Node.js that simplifies building HTTP servers and REST APIs.' },
      { questionText: 'Which method defines a GET route in Express?', options: ['app.route()', 'app.get()', 'app.fetch()', 'app.request()'], correctAnswer: 1, explanation: 'app.get(path, handler) defines a route that responds to HTTP GET requests at the specified path.' },
      { questionText: 'What is middleware in Express?', options: ['Database connection logic', 'Functions that have access to req, res, and next', 'Route definitions only', 'Template rendering engine'], correctAnswer: 1, explanation: 'Middleware are functions that execute during the request-response cycle. They can modify req/res or call next().' },
      { questionText: 'What does express.Router() provide?', options: ['A database connection', 'A mini Express application for modular routing', 'Session management', 'Static file serving'], correctAnswer: 1, explanation: 'express.Router() creates a modular, mountable route handler — great for organizing routes by feature.' },
    ]
  },
];
