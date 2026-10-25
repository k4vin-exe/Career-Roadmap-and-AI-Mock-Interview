// ─── Weekly Quiz Bank & Dynamic Quiz Generator ──────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Curated technical question bank categorized by technical domains and keywords
const QUESTION_BANK: Array<QuizQuestion & { keywords: string[] }> = [
  // ── HTML & Accessibility ──
  {
    id: 'a11y-1',
    keywords: ['accessibility', 'a11y', 'aria', 'screen reader'],
    question: 'Which HTML attribute provides an accessible name for interactive elements lacking visible text?',
    options: ['aria-hidden', 'aria-label', 'title-text', 'alt-name'],
    correctIndex: 1,
    explanation: 'aria-label defines a string value that labels an interactive element directly for assistive technologies like screen readers.',
  },
  {
    id: 'html-1',
    keywords: ['html', 'semantic', 'markup', 'dom'],
    question: 'Which of the following is considered a semantic HTML5 landmark tag?',
    options: ['<div>', '<span>', '<main>', '<container>'],
    correctIndex: 2,
    explanation: '<main>, <header>, <nav>, and <article> are semantic HTML5 tags that provide structural meaning to browsers and assistive tools.',
  },

  // ── CSS & Responsive Design ──
  {
    id: 'css-1',
    keywords: ['css', 'flexbox', 'grid', 'layout', 'styling', 'responsive'],
    question: 'In CSS Flexbox, which property aligns items along the cross axis?',
    options: ['justify-content', 'align-items', 'flex-direction', 'gap'],
    correctIndex: 1,
    explanation: 'justify-content controls alignment along the main axis, while align-items aligns items along the cross axis.',
  },
  {
    id: 'css-2',
    keywords: ['css', 'box model', 'margin', 'padding'],
    question: 'When box-sizing is set to border-box, what does the element width include?',
    options: ['Content only', 'Content and margin', 'Content, padding, and border', 'Padding and margin only'],
    correctIndex: 2,
    explanation: 'border-box includes content, padding, and border within the specified width and height, preventing layout breakage.',
  },

  // ── JavaScript Core & Async ──
  {
    id: 'js-1',
    keywords: ['javascript', 'js', 'es6', 'array', 'methods'],
    question: 'Which Array method produces a brand new array with transformed elements without mutating the original?',
    options: ['forEach()', 'push()', 'map()', 'splice()'],
    correctIndex: 2,
    explanation: 'map() returns a new array resulting from applying a callback function to every element without modifying the original array.',
  },
  {
    id: 'js-2',
    keywords: ['javascript', 'async', 'promise', 'event loop', 'asynchronous'],
    question: 'What is the primary purpose of the JavaScript Event Loop?',
    options: [
      'To compile TypeScript into JavaScript',
      'To coordinate execution of synchronous code, microtasks, and macrotasks',
      'To manage database transactions',
      'To allocate RAM for browser garbage collection'
    ],
    correctIndex: 1,
    explanation: 'The Event Loop monitors the Call Stack and Task Queue, dequeuing microtasks (like Promises) and macrotasks (like setTimeout) when the stack is empty.',
  },
  {
    id: 'js-3',
    keywords: ['closure', 'scope', 'javascript', 'functions'],
    question: 'What is a closure in JavaScript?',
    options: [
      'A method used to close database connections',
      'A function bundled together with references to its surrounding lexical state',
      'A function that terminates script execution',
      'A syntax error caused by unclosed curly braces'
    ],
    correctIndex: 1,
    explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
  },

  // ── React & Frontend Frameworks ──
  {
    id: 'react-1',
    keywords: ['react', 'components', 'hooks', 'virtual dom', 'frontend'],
    question: 'In React, when does a component re-render by default?',
    options: [
      'Every 100 milliseconds automatically',
      'When its state or received props change',
      'Only when the browser window is resized',
      'Whenever localStorage is accessed'
    ],
    correctIndex: 1,
    explanation: 'React components trigger a re-render whenever state updates via useState/reducers or when parent props change.',
  },
  {
    id: 'react-2',
    keywords: ['useeffect', 'react', 'hooks', 'lifecycle'],
    question: 'What happens if you provide an empty dependency array [] to useEffect in React?',
    options: [
      'The effect runs on every single render',
      'The effect throws a runtime syntax error',
      'The effect runs only once after the initial mount',
      'The component will never unmount'
    ],
    correctIndex: 2,
    explanation: 'An empty dependency array [] indicates the effect has no reactive dependencies and only executes once when mounted.',
  },
  {
    id: 'react-3',
    keywords: ['state management', 'redux', 'context', 'zustand'],
    question: 'What problem does React Context API primarily solve?',
    options: [
      'Rendering 3D graphics inside canvas',
      'Avoiding prop drilling across deep component trees',
      'Encrypting passwords in the browser',
      'Replacing Node.js backend servers'
    ],
    correctIndex: 1,
    explanation: 'Context provides a way to pass data through the component tree without manually passing props down at every level (prop drilling).',
  },

  // ── TypeScript ──
  {
    id: 'ts-1',
    keywords: ['typescript', 'types', 'generics', 'interface'],
    question: 'What is the main benefit of using TypeScript over vanilla JavaScript?',
    options: [
      'It speeds up JavaScript runtime execution in V8 engine',
      'It provides static type checking at compile time to catch bugs early',
      'It eliminates the need for CSS files',
      'It allows direct access to the computer BIOS'
    ],
    correctIndex: 1,
    explanation: 'TypeScript adds optional static typing that catches structural and type errors at compile time before code runs in production.',
  },

  // ── Backend, APIs & Node.js ──
  {
    id: 'node-1',
    keywords: ['node', 'nodejs', 'express', 'backend', 'server'],
    question: 'Why is Node.js considered non-blocking and single-threaded for I/O?',
    options: [
      'It spawns a new physical thread for each incoming HTTP request',
      'It delegates I/O operations to libuv and the OS kernel, notifying the main thread via callbacks',
      'It runs only in web browsers with WebWorkers',
      'It converts all code into synchronous machine code'
    ],
    correctIndex: 1,
    explanation: 'Node uses an event-driven architecture with libuv to offload file, network, and timer operations asynchronously.',
  },
  {
    id: 'api-1',
    keywords: ['api', 'rest', 'http', 'endpoints', 'json'],
    question: 'Which HTTP status code signifies that a resource was successfully created on the server?',
    options: ['200 OK', '201 Created', '204 No Content', '304 Not Modified'],
    correctIndex: 1,
    explanation: '201 Created is the standard HTTP status code returned following a successful POST request that creates a new resource.',
  },
  {
    id: 'auth-1',
    keywords: ['auth', 'jwt', 'security', 'token', 'authentication'],
    question: 'What are the three parts of a JSON Web Token (JWT) separated by dots?',
    options: [
      'User, Password, Hash',
      'Header, Payload, Signature',
      'Domain, Protocol, Path',
      'Request, Response, Cookie'
    ],
    correctIndex: 1,
    explanation: 'A JWT consists of Header (algorithm & token type), Payload (claims/data), and Signature (cryptographic hash).',
  },

  // ── Databases (SQL & NoSQL) ──
  {
    id: 'db-1',
    keywords: ['database', 'sql', 'query', 'postgres', 'mysql', 'relational'],
    question: 'In relational databases (SQL), which clause is used to filter aggregated data?',
    options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'],
    correctIndex: 1,
    explanation: 'WHERE filters rows before aggregation, whereas HAVING filters grouped records after aggregation.',
  },
  {
    id: 'db-2',
    keywords: ['nosql', 'mongodb', 'schema', 'document', 'database'],
    question: 'In MongoDB, what is the primary purpose of an index?',
    options: [
      'To encrypt sensitive document fields',
      'To drastically speed up document query and search performance',
      'To automatically delete duplicate collections',
      'To compress image files stored in GridFS'
    ],
    correctIndex: 1,
    explanation: 'Indexes store a small portion of the dataset in an easy-to-traverse form (like B-trees) to avoid scanning every document in a collection.',
  },

  // ── DevOps, Docker, Git & Cloud ──
  {
    id: 'git-1',
    keywords: ['git', 'version control', 'github', 'branch'],
    question: 'What does "git merge" do compared to "git rebase"?',
    options: [
      'Merge creates a merge commit preserving exact history, while rebase rewrites commits linearly',
      'Merge deletes the feature branch, rebase preserves it',
      'Merge only works locally, rebase only works on remote repositories',
      'Merge changes file permissions, rebase downloads new packages'
    ],
    correctIndex: 0,
    explanation: 'git merge creates a commit with two parents preserving commit timestamps, whereas git rebase replays your commits onto another base for a linear history.',
  },
  {
    id: 'docker-1',
    keywords: ['docker', 'container', 'kubernetes', 'devops', 'infrastructure'],
    question: 'What is the difference between a Docker Image and a Docker Container?',
    options: [
      'An image is a running instance; a container is a static blueprint',
      'An image is a read-only blueprint; a container is a runnable, isolated instance of that image',
      'Containers run in Windows; images only run in Linux',
      'There is no difference; they are synonymous'
    ],
    correctIndex: 1,
    explanation: 'A Docker image is an immutable template with instructions, while a container is the live, executable running instance of that image.',
  },
  {
    id: 'cloud-1',
    keywords: ['cloud', 'aws', 'deploy', 'ci/cd', 'serverless'],
    question: 'In modern CI/CD pipelines, what is the role of Continuous Integration (CI)?',
    options: [
      'Automatically charging customer credit cards',
      'Regularly merging developer code into a shared repository, running automated builds and tests',
      'Managing physical office server racks',
      'Writing marketing copy for software releases'
    ],
    correctIndex: 1,
    explanation: 'Continuous Integration ensures new code changes are continuously built, tested, and validated to catch integration conflicts immediately.',
  },

  // ── Data Science, Python & AI ──
  {
    id: 'python-1',
    keywords: ['python', 'data science', 'ai', 'scripting'],
    question: 'In Python, what is the output of [x**2 for x in range(3)]?',
    options: ['[1, 4, 9]', '[0, 1, 4]', '[0, 1, 2]', '[1, 2, 3]'],
    correctIndex: 1,
    explanation: 'range(3) produces 0, 1, 2. Squaring each number results in [0**2, 1**2, 2**2] = [0, 1, 4].',
  },
  {
    id: 'ml-1',
    keywords: ['machine learning', 'data science', 'ai', 'model', 'training'],
    question: 'What is overfitting in machine learning?',
    options: [
      'A model that has too few training samples to learn anything',
      'A model that learns training data noise and details too well, performing poorly on unseen test data',
      'When GPU memory runs out during model deployment',
      'When a neural network trains in fewer than 2 epochs'
    ],
    correctIndex: 1,
    explanation: 'Overfitting occurs when a model fits the training set too closely, capturing random noise rather than generalizable underlying patterns.',
  },

  // ── Testing & Software Design ──
  {
    id: 'test-1',
    keywords: ['testing', 'unit test', 'jest', 'qa', 'tdd'],
    question: 'In the Testing Pyramid, which type of tests should form the largest foundation?',
    options: [
      'Manual Exploratory Tests',
      'End-to-End (E2E) Browser Tests',
      'Fast, isolated Unit Tests',
      'Load Stress Tests'
    ],
    correctIndex: 2,
    explanation: 'Unit tests are fast, reliable, and cheap to maintain, forming the broadest base of the test automation pyramid.',
  },
];

/**
 * Derives a 3-question quiz for any given week.
 * Matches keywords from topics, theme, and goal, falling back to smart concept checks.
 */
export function getQuizForWeek(
  weekNumber: number,
  theme: string,
  goal: string,
  topics: string[],
  role: string
): QuizQuestion[] {
  const searchableText = `${theme} ${goal} ${topics.join(' ')} ${role}`.toLowerCase();

  // Find matching questions from the bank
  const matched = QUESTION_BANK.filter((item) =>
    item.keywords.some((k) => searchableText.includes(k.toLowerCase()))
  );

  // Pick up to 3 matched questions
  const selected: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  for (const q of matched) {
    if (!usedIds.has(q.id)) {
      selected.push(q);
      usedIds.add(q.id);
      if (selected.length === 3) break;
    }
  }

  // If fewer than 3 questions were matched, generate contextual concept questions
  if (selected.length < 3) {
    const primaryTopic = topics[0] || theme || 'Core Engineering';
    const secondaryTopic = topics[1] || 'Best Practices';

    if (selected.length === 0) {
      selected.push({
        id: `dyn-${weekNumber}-1`,
        question: `What is the primary objective of mastering "${primaryTopic}" in Week ${weekNumber}?`,
        options: [
          `To build foundational competency and solve real-world problems in ${primaryTopic}`,
          `To bypass architectural design reviews and coding standards`,
          `To eliminate the need for version control and testing`,
          `To run code without any runtime environment or browser`
        ],
        correctIndex: 0,
        explanation: `Mastering ${primaryTopic} builds fundamental problem-solving skills required for technical interviews and production applications.`
      });
    }

    if (selected.length < 2) {
      selected.push({
        id: `dyn-${weekNumber}-2`,
        question: `When implementing ${secondaryTopic}, which engineering practice is most critical?`,
        options: [
          'Skipping automated error handling to increase execution speed',
          'Writing modular, readable code accompanied by structured testing and validation',
          'Hardcoding secrets and configuration parameters in source code',
          'Avoiding version control branching'
        ],
        correctIndex: 1,
        explanation: `Modular architecture and automated testing ensure scalable, reliable software that is easy to debug and maintain.`
      });
    }

    if (selected.length < 3) {
      selected.push({
        id: `dyn-${weekNumber}-3`,
        question: `How does completing the Week ${weekNumber} milestone ("${goal}") help you prepare for technical interviews?`,
        options: [
          'It gives you hands-on practical experience and concrete architectural talking points',
          'It guarantees you will never be asked technical questions',
          'It replaces the need for data structure understanding',
          'It automatically issues certified diplomas without testing'
        ],
        correctIndex: 0,
        explanation: 'Hands-on project work provides tangible proof of capability and gives you concrete experiences to discuss in technical interviews.'
      });
    }
  }

  return selected.slice(0, 3);
}
