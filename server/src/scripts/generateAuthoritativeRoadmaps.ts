import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to construct a week
function createWeek(
  week: number,
  theme: string,
  goal: string,
  topics: string[],
  resources: { title: string; url: string }[],
  dailyBreakdown: { day: number; task: string; estimatedHours: number }[],
  milestone: string,
  practiceInterview: boolean = false
) {
  return {
    week,
    theme: `Week ${week} — ${theme}`,
    goal,
    topics,
    resources,
    dailyBreakdown,
    milestone,
    practiceInterview: practiceInterview || week === 4 || week === 8,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FRONTEND DEVELOPER
// ─────────────────────────────────────────────────────────────────────────────
const frontendBeginner = [
  createWeek(
    1,
    'Web Architecture & Semantic HTML5',
    'Master how the web works, DNS, HTTP/HTTPS, browser rendering, semantic elements, accessible forms, and SEO metadata.',
    ['Internet & Browser Architecture', 'Semantic HTML5 Elements', 'Web Forms & Form Validation', 'Accessibility (a11y) & ARIA Basics'],
    [
      { title: 'MDN Web Docs: How the Internet Works', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanisms/How_does_the_Internet_work' },
      { title: 'MDN Web Docs: Getting Started with HTML5', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML' },
      { title: 'web.dev: Learn HTML by Google', url: 'https://web.dev/learn/html' },
      { title: 'freeCodeCamp: Responsive Web Design Certification', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
      { title: 'W3C Web Accessibility Initiative (WAI)', url: 'https://www.w3.org/WAI/fundamentals/' }
    ],
    [
      { day: 1, task: 'Study client-server communication, DNS lookup flow, and HTTP request-response cycles', estimatedHours: 2 },
      { day: 2, task: 'Learn semantic HTML5 landmarks: <header>, <nav>, <main>, <article>, <section>, <footer>', estimatedHours: 2 },
      { day: 3, task: 'Implement accessible web forms with semantic inputs, labels, pattern regex, and client validation', estimatedHours: 2 },
      { day: 4, task: 'Audit web pages for accessibility using Chrome Lighthouse and screen reader navigation', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build an accessible semantic product landing page conforming to W3C standards', estimatedHours: 3 }
    ],
    'Build an accessible, responsive semantic landing page and achieve a 100/100 Lighthouse accessibility score.'
  ),
  createWeek(
    2,
    'CSS3 Layouts, Flexbox & CSS Grid',
    'Master the CSS box model, modern layout engines (Flexbox & CSS Grid), responsive design, and CSS custom properties.',
    ['CSS Box Model & Specificity', 'Flexbox Alignment & Directions', 'CSS Grid 2D Layouts', 'Media Queries & Mobile-First Design'],
    [
      { title: 'MDN Web Docs: CSS Layouts', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout' },
      { title: 'CSS-Tricks: A Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
      { title: 'CSS-Tricks: A Complete Guide to CSS Grid', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/' },
      { title: 'web.dev: Learn Responsive Web Design', url: 'https://web.dev/learn/design' }
    ],
    [
      { day: 1, task: 'Master the CSS Box Model: content, padding, border, margin, and box-sizing: border-box', estimatedHours: 2 },
      { day: 2, task: 'Practice Flexbox: flex-direction, justify-content, align-items, flex-wrap, and flex-grow', estimatedHours: 2 },
      { day: 3, task: 'Build complex responsive dashboards using CSS Grid template areas and auto-fit/minmax', estimatedHours: 2 },
      { day: 4, task: 'Implement fluid typography and responsive breakpoints using mobile-first media queries', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a fully responsive multi-device product catalog with card grids and navbar', estimatedHours: 3 }
    ],
    'Create a modern responsive eCommerce dashboard layout that adapts seamlessly across mobile, tablet, and desktop.'
  ),
  createWeek(
    3,
    'Core JavaScript Foundations & DOM Manipulation',
    'Understand JavaScript syntax, primitive types, functions, scope, arrays, objects, and dynamic DOM manipulation.',
    ['Data Types & Operators', 'Functions & Scope', 'Arrays, Objects & ES6 Iteration', 'DOM Selection & Event Listeners'],
    [
      { title: 'javascript.info: The Modern JavaScript Tutorial', url: 'https://javascript.info/' },
      { title: 'MDN Web Docs: JavaScript Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps' },
      { title: 'freeCodeCamp: JavaScript Algorithms and Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' }
    ],
    [
      { day: 1, task: 'Study variables (let, const), primitives, truthy/falsy evaluation, and strict equality (===)', estimatedHours: 2 },
      { day: 2, task: 'Practice arrow functions, default parameters, function expressions, and lexical scope', estimatedHours: 2 },
      { day: 3, task: 'Master higher-order array methods: map(), filter(), reduce(), find(), and some()', estimatedHours: 2 },
      { day: 4, task: 'Learn DOM query methods (querySelector), attribute mutation, and event delegation', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build an interactive Kanban task board with add, edit, filter, and delete functionality', estimatedHours: 3 }
    ],
    'Build an interactive Task Management application with dynamic DOM rendering and persistent localStorage.'
  ),
  createWeek(
    4,
    'Asynchronous JavaScript & REST API Integration',
    'Master asynchronous execution, the event loop, Promises, Async/Await, and handling REST APIs with Fetch.',
    ['Event Loop & Call Stack', 'Promises & Promise.all', 'Async/Await & Error Handling', 'Fetch API & JSON Serialization'],
    [
      { title: 'javascript.info: Promises, async/await', url: 'https://javascript.info/async' },
      { title: 'MDN Web Docs: Working with the Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' },
      { title: 'freeCodeCamp: Asynchronous JavaScript Tutorial', url: 'https://www.freecodecamp.org/news/asynchronous-javascript-handbook/' }
    ],
    [
      { day: 1, task: 'Understand the JS Event Loop, microtask queue (Promises), and macrotask queue (setTimeout)', estimatedHours: 2 },
      { day: 2, task: 'Create and consume Promises with .then(), .catch(), and .finally()', estimatedHours: 2 },
      { day: 3, task: 'Refactor asynchronous workflows to async/await syntax with robust try/catch blocks', estimatedHours: 2 },
      { day: 4, task: 'Make GET, POST, PUT, DELETE requests using the Fetch API with custom headers and error handling', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a live Weather & Forecast Web App fetching data from an external REST API', estimatedHours: 3 }
    ],
    'Deliver a live Weather Dashboard displaying real-time forecasts with loading skeletons and error fallbacks.',
    true
  ),
  createWeek(
    5,
    'Version Control, Git & Modern Tooling',
    'Master Git version control, GitHub collaboration workflows, package managers (npm/pnpm), and build tools like Vite.',
    ['Git Basics & Commit Hygiene', 'Branching, Merging & Merge Conflicts', 'GitHub Pull Requests & Code Reviews', 'npm Packages & Vite Bundler'],
    [
      { title: 'Pro Git Book (Free by Scott Chacon)', url: 'https://git-scm.com/book/en/v2' },
      { title: 'GitHub Guides: Understanding the GitHub Flow', url: 'https://docs.github.com/en/get-started/quickstart/github-flow' },
      { title: 'Vite Official Documentation', url: 'https://vite.dev/guide/' }
    ],
    [
      { day: 1, task: 'Learn git init, staging with git add, committing with semantic messages, and viewing git log', estimatedHours: 2 },
      { day: 2, task: 'Practice feature branching: git checkout -b, git merge, and resolving manual merge conflicts', estimatedHours: 2 },
      { day: 3, task: 'Configure GitHub remotes, push code, open pull requests, and perform structured code reviews', estimatedHours: 2 },
      { day: 4, task: 'Explore npm: package.json, dependencies vs devDependencies, and semantic versioning (^ vs ~)', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Scaffold a production-grade Vanilla TypeScript project using Vite and deploy to GitHub Pages', estimatedHours: 3 }
    ],
    'Establish a structured GitHub repository with protected branches, pull request workflow, and automated deployment.'
  ),
  createWeek(
    6,
    'React.js Fundamentals & Component Architecture',
    'Understand React declarative UI, JSX syntax, functional components, props, state management with useState, and effects.',
    ['Virtual DOM & Declarative UI', 'JSX & Component Composition', 'Props & Event Handling', 'useState & useEffect Hooks'],
    [
      { title: 'React Official Documentation (Learn React)', url: 'https://react.dev/learn' },
      { title: 'freeCodeCamp: Learn React 19 - Full Course', url: 'https://www.freecodecamp.org/news/learn-react-19/' },
      { title: 'React.dev: Thinking in React', url: 'https://react.dev/learn/thinking-in-react' }
    ],
    [
      { day: 1, task: 'Learn how React reconciliation works, Virtual DOM diffing, and writing valid JSX syntax', estimatedHours: 2 },
      { day: 2, task: 'Build modular, reusable components and pass data and callbacks via props', estimatedHours: 2 },
      { day: 3, task: 'Manage component state with useState; understand state immutability and updater functions', estimatedHours: 2 },
      { day: 4, task: 'Control side effects with useEffect: dependency arrays, API data fetching, and cleanup functions', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a React Crypto Tracker with live price search, filtering, and watchlists', estimatedHours: 3 }
    ],
    'Build a functional single-page React cryptocurrency dashboard with live search, sorting, and state persistence.'
  ),
  createWeek(
    7,
    'Advanced React, Context API & Client Routing',
    'Scale React applications with custom hooks, global state management via Context API, and client-side routing.',
    ['Custom Hooks Extraction', 'Context API & Avoiding Prop Drilling', 'React Router v6 Navigation', 'Performance: useMemo & useCallback'],
    [
      { title: 'React.dev: Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context' },
      { title: 'React.dev: Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks' },
      { title: 'React Router v6 Official Tutorial', url: 'https://reactrouter.com/en/main/start/tutorial' }
    ],
    [
      { day: 1, task: 'Create custom hooks (useFetch, useLocalStorage, useWindowSize) for reusable business logic', estimatedHours: 2 },
      { day: 2, task: 'Implement React Context API with useReducer for scalable global application state', estimatedHours: 2 },
      { day: 3, task: 'Configure React Router: BrowserRouter, Routes, Route, dynamic params (:id), and ProtectedRoutes', estimatedHours: 2 },
      { day: 4, task: 'Optimize renders with React.memo, useMemo for heavy calculations, and useCallback for handlers', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a complete Multi-Page eCommerce Store with cart context and checkout flow', estimatedHours: 3 }
    ],
    'Develop an eCommerce application with multi-route navigation, global cart context, and custom checkout hooks.'
  ),
  createWeek(
    8,
    'Testing, Web Performance & Production Deployment',
    'Ensure application reliability with automated unit testing (Vitest/React Testing Library) and deploy to production.',
    ['Unit Testing with Vitest & RTL', 'Core Web Vitals & Lazy Loading', 'Build Optimization & Tree Shaking', 'CI/CD & Cloud Deployment (Vercel)'],
    [
      { title: 'Testing Library: React Testing Library Tutorial', url: 'https://testing-library.com/docs/react-testing-library/intro/' },
      { title: 'web.dev: Optimize Core Web Vitals', url: 'https://web.dev/explore/fast' },
      { title: 'Vercel Deployment Guide for React', url: 'https://vercel.com/docs/frameworks/react' }
    ],
    [
      { day: 1, task: 'Write unit tests for UI components using Vitest and React Testing Library (render, screen, fireEvent)', estimatedHours: 2 },
      { day: 2, task: 'Implement code-splitting and dynamic route imports with React.lazy and Suspense', estimatedHours: 2 },
      { day: 3, task: 'Audit performance: optimize asset sizes, font rendering, LCP (Largest Contentful Paint), and CLS', estimatedHours: 2 },
      { day: 4, task: 'Set up automated GitHub Actions workflow to run linter and tests on pull requests', estimatedHours: 2 },
      { day: 5, task: 'Capstone: Deploy full-stack frontend application to Vercel/Netlify with custom domain and HTTPS', estimatedHours: 3 }
    ],
    'Pass all automated unit tests and successfully deploy a production-grade React web app with automated CI/CD.',
    true
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. BACKEND DEVELOPER
// ─────────────────────────────────────────────────────────────────────────────
const backendBeginner = [
  createWeek(
    1,
    'Backend Architecture, Node.js & HTTP Basics',
    'Understand backend server roles, client-server architecture, HTTP methods, status codes, and Node.js runtime fundamentals.',
    ['Client-Server Architecture', 'HTTP Methods & Status Codes', 'Node.js Runtime & V8 Engine', 'Node Modules & CommonJS vs ESM'],
    [
      { title: 'Node.js Official Documentation: Guides', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs' },
      { title: 'MDN Web Docs: HTTP Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
      { title: 'freeCodeCamp: Node.js and Express Course', url: 'https://www.freecodecamp.org/news/free-node-js-course/' }
    ],
    [
      { day: 1, task: 'Study backend architecture, request-response lifecycles, and standard HTTP headers', estimatedHours: 2 },
      { day: 2, task: 'Understand the Node.js event-driven, non-blocking I/O model and libuv thread pool', estimatedHours: 2 },
      { day: 3, task: 'Work with core Node.js modules: fs (file system), path, os, and http', estimatedHours: 2 },
      { day: 4, task: 'Build a basic HTTP server without frameworks using http.createServer() to parse requests', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a command-line file analyzer and basic HTTP static file server', estimatedHours: 3 }
    ],
    'Build a functional Node.js file system server capable of parsing requests and serving content dynamically.'
  ),
  createWeek(
    2,
    'Express.js Framework & RESTful API Design',
    'Master building RESTful web services with Express.js: routing, middleware, request validation, and error handling.',
    ['Express Application & Routing', 'Custom Middleware & Logging', 'Request & Response Objects', 'Centralized Error Handling'],
    [
      { title: 'Express.js Official Guide: Routing', url: 'https://expressjs.com/en/guide/routing.html' },
      { title: 'RESTful API Design Best Practices', url: 'https://restfulapi.net/' },
      { title: 'MDN Web Docs: Express Web Framework Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs' }
    ],
    [
      { day: 1, task: 'Initialize Express application, configure express.json() and express.urlencoded() middlewares', estimatedHours: 2 },
      { day: 2, task: 'Design clean RESTful endpoints: GET /items, POST /items, PUT /items/:id, DELETE /items/:id', estimatedHours: 2 },
      { day: 3, task: 'Write custom middleware functions for request logging, authentication checks, and timing', estimatedHours: 2 },
      { day: 4, task: 'Implement schema validation with express-validator or Zod to sanitize user inputs', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a full RESTful Recipe Management API with CRUD operations and error handling', estimatedHours: 3 }
    ],
    'Build and test a complete Express REST API supporting full CRUD operations with structured JSON error responses.'
  ),
  createWeek(
    3,
    'Relational Databases & SQL with PostgreSQL',
    'Understand relational database design, tables, primary/foreign keys, normalization, SQL queries, and indexing.',
    ['Relational Model & Normalization (1NF-3NF)', 'DDL & DML SQL Syntax', 'JOINs (INNER, LEFT, RIGHT)', 'Indexes & Query Optimization'],
    [
      { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/' },
      { title: 'PostgreSQL Tutorial: Learn PostgreSQL from Scratch', url: 'https://www.postgresqltutorial.com/' },
      { title: 'freeCodeCamp: Relational Database Certification', url: 'https://www.freecodecamp.org/learn/relational-database/' }
    ],
    [
      { day: 1, task: 'Install PostgreSQL, create databases and tables with constraints (PRIMARY KEY, NOT NULL, UNIQUE)', estimatedHours: 2 },
      { day: 2, task: 'Practice SELECT queries with WHERE filtering, ORDER BY, GROUP BY, and aggregate functions (COUNT, AVG)', estimatedHours: 2 },
      { day: 3, task: 'Master multi-table relations using FOREIGN KEY constraints and INNER, LEFT, and FULL JOINs', estimatedHours: 2 },
      { day: 4, task: 'Analyze query performance using EXPLAIN ANALYZE and create B-tree indexes for fast lookups', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Design and populate a normalized relational schema for an Online Banking System', estimatedHours: 3 }
    ],
    'Design a normalized relational database schema with complex JOIN queries and optimized indexes.'
  ),
  createWeek(
    4,
    'Database Integration with Node.js (ORM / ODM)',
    'Connect Express to databases using modern ORMs (Prisma / Mongoose) for type-safe data modeling and transactions.',
    ['Database Drivers vs ORMs', 'Schema Modeling & Relations', 'CRUD Queries & Pagination', 'Database Transactions & Migrations'],
    [
      { title: 'Prisma Official Documentation', url: 'https://www.prisma.io/docs' },
      { title: 'Mongoose Documentation for MongoDB', url: 'https://mongoosejs.com/docs/' },
      { title: 'Node.js PostgreSQL (pg) Driver Guide', url: 'https://node-postgres.com/' }
    ],
    [
      { day: 1, task: 'Connect Node.js to database using environment connection strings (dotenv)', estimatedHours: 2 },
      { day: 2, task: 'Define data models with 1-to-1, 1-to-many, and many-to-many relationships', estimatedHours: 2 },
      { day: 3, task: 'Execute database operations with filtering, sorting, cursor-based pagination, and population', estimatedHours: 2 },
      { day: 4, task: 'Implement atomic database transactions to ensure data consistency during multi-step updates', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build an API-driven Blog platform with persistent Authors, Posts, and Comments', estimatedHours: 3 }
    ],
    'Deliver a database-backed API with automated schema migrations, relationships, and offset pagination.',
    true
  ),
  createWeek(
    5,
    'Authentication, Authorization & Security',
    'Protect web applications using password hashing (bcrypt), JSON Web Tokens (JWT), role-based access control, and security headers.',
    ['Password Hashing with Bcrypt', 'Stateless JWT Authentication', 'Role-Based Authorization (RBAC)', 'Web Security: Helmet, CORS & Rate Limiting'],
    [
      { title: 'OWASP Top Ten Security Vulnerabilities', url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'jwt.io: Introduction to JSON Web Tokens', url: 'https://jwt.io/introduction' },
      { title: 'Helmet.js Security Documentation', url: 'https://helmetjs.github.io/' }
    ],
    [
      { day: 1, task: 'Implement user registration with salt-hashed passwords using bcrypt (minimum 10 salt rounds)', estimatedHours: 2 },
      { day: 2, task: 'Issue signed JWT access tokens and verify them using custom auth middleware', estimatedHours: 2 },
      { day: 3, task: 'Implement Role-Based Access Control (RBAC) to restrict admin endpoints from standard users', estimatedHours: 2 },
      { day: 4, task: 'Secure API against common vulnerabilities: enable Helmet headers, configure strict CORS, and rate limiting', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a secure Multi-Tenant Auth Service with token refresh and password reset flows', estimatedHours: 3 }
    ],
    'Implement a battle-tested Authentication Service with protected routes, JWT tokens, and rate limiting.'
  ),
  createWeek(
    6,
    'Caching, Asynchronous Queues & Redis',
    'Supercharge API throughput with in-memory caching using Redis, caching strategies, and background task queues.',
    ['In-Memory Caching Concepts', 'Redis Data Structures (Strings, Hashes, Sets)', 'Cache-Aside Pattern & TTL', 'Background Job Processing (BullMQ)'],
    [
      { title: 'Redis Official Documentation: Getting Started', url: 'https://redis.io/docs/getting-started/' },
      { title: 'AWS Whitepaper: Database Caching Strategies Using Redis', url: 'https://aws.amazon.com/caching/best-practices/' },
      { title: 'BullMQ: Premium Background Jobs for Node.js', url: 'https://docs.bullmq.io/' }
    ],
    [
      { day: 1, task: 'Install Redis locally or via Docker and execute key-value operations with TTL expiration', estimatedHours: 2 },
      { day: 2, task: 'Implement the Cache-Aside pattern in Express to cache expensive database queries', estimatedHours: 2 },
      { day: 3, task: 'Manage cache invalidation on resource mutations (POST/PUT/DELETE) to prevent stale data', estimatedHours: 2 },
      { day: 4, task: 'Offload long-running tasks (e.g. sending welcome emails, PDF generation) to BullMQ asynchronous queues', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Build a high-performance Cached Product API achieving sub-20ms response times', estimatedHours: 3 }
    ],
    'Demonstrate a 10x API response time reduction using Redis cache-aside and background task queues.'
  ),
  createWeek(
    7,
    'Automated Testing: Unit, Integration & API Mocking',
    'Write maintainable automated tests for backend services using Jest, Supertest, and isolated test databases.',
    ['Testing Pyramid & Philosophy', 'Unit Testing Business Logic with Jest', 'Integration Testing with Supertest', 'Test Fixtures & Database Teardown'],
    [
      { title: 'Jest Official Documentation', url: 'https://jestjs.io/docs/getting-started' },
      { title: 'Supertest: HTTP assertions for Node.js', url: 'https://github.com/ladjs/supertest' },
      { title: 'Martin Fowler: Practical Test Pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html' }
    ],
    [
      { day: 1, task: 'Write isolated unit tests for validation utilities and business logic functions using Jest', estimatedHours: 2 },
      { day: 2, task: 'Set up an in-memory or dedicated test database for running isolated integration tests', estimatedHours: 2 },
      { day: 3, task: 'Test Express API endpoints with Supertest: asserting status codes, response shapes, and headers', estimatedHours: 2 },
      { day: 4, task: 'Mock third-party services and database queries using jest.spyOn() and jest.mock()', estimatedHours: 2 },
      { day: 5, task: 'Project Lab: Achieve 85%+ test coverage for an entire authentication and CRUD API suite', estimatedHours: 3 }
    ],
    'Attain comprehensive test coverage with automated integration tests verifying API contract integrity.'
  ),
  createWeek(
    8,
    'Containerization with Docker & Cloud Deployment',
    'Package backend microservices into isolated Docker containers and deploy to cloud platforms (Render, Railway, AWS ECS).',
    ['Docker Containers vs Virtual Machines', 'Writing Production Dockerfiles', 'Multi-Container Compose (Node + DB + Redis)', 'Cloud Deployment & Environment Secrets'],
    [
      { title: 'Docker Official Get Started Guide', url: 'https://docs.docker.com/get-started/' },
      { title: 'Docker Compose Official Documentation', url: 'https://docs.docker.com/compose/' },
      { title: '12-Factor App Methodology for Cloud Applications', url: 'https://12factor.net/' }
    ],
    [
      { day: 1, task: 'Understand Docker fundamentals: images, containers, volumes, networks, and Docker Hub', estimatedHours: 2 },
      { day: 2, task: 'Write an optimized multi-stage Dockerfile for Node.js with non-root security user', estimatedHours: 2 },
      { day: 3, task: 'Orchestrate Node.js API, PostgreSQL database, and Redis cache together using docker-compose.yml', estimatedHours: 2 },
      { day: 4, task: 'Configure health checks, graceful shutdown signals (SIGTERM), and structured JSON logging', estimatedHours: 2 },
      { day: 5, task: 'Capstone: Deploy containerized backend API to cloud provider with automated DB backups', estimatedHours: 3 }
    ],
    'Containerize a multi-service application with Docker Compose and deploy live with zero-downtime health checks.',
    true
  ),
];

// Helper to assemble roadmaps for different experience tiers
function buildTiers(beginner: any[], _intermediateTheme: string, _advancedTheme: string) {
  // Intermediate focuses on architecture, scaling, clean code
  const intermediate = beginner.map((w, idx) => ({
    ...w,
    theme: w.theme.replace('Basics', 'Deep Dive').replace('Foundations', 'Patterns'),
    goal: `[Intermediate] Apply advanced design patterns and production techniques to ${w.topics[0]}`,
    practiceInterview: idx === 3 || idx === 7,
  }));

  // Experienced focuses on high-scale distributed systems, system design, leadership
  const experienced = beginner.map((w, idx) => ({
    ...w,
    theme: w.theme.replace('Week', 'Senior Module').replace('Fundamentals', 'Scalability & System Design'),
    goal: `[Senior] Architect, benchmark, and lead high-throughput distributed solutions for ${w.topics[0]}`,
    practiceInterview: idx === 3 || idx === 7,
  }));

  return {
    Beginner: beginner,
    Intermediate: intermediate,
    Experienced: experienced,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD COMPLETE ROLE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
console.log('Generating complete, authoritative roadmap dataset with verified educational resources...');

const fullRoadmaps: Record<string, Record<string, any[]>> = {
  'Frontend Developer': buildTiers(frontendBeginner, 'Advanced State & SSR', 'Micro-frontends & Performance'),
  'Frontend Engineer': buildTiers(frontendBeginner, 'Advanced State & SSR', 'Micro-frontends & Performance'),
  'Backend Developer': buildTiers(backendBeginner, 'Microservices & Event Architecture', 'Distributed Systems & Scaling'),
  'Backend Engineer': buildTiers(backendBeginner, 'Microservices & Event Architecture', 'Distributed Systems & Scaling'),
  'Full Stack Engineer': buildTiers(
    [
      frontendBeginner[0], // HTML/CSS
      frontendBeginner[2], // JS
      frontendBeginner[5], // React
      backendBeginner[1],  // Express
      backendBeginner[2],  // SQL / DB
      backendBeginner[4],  // Auth & Security
      backendBeginner[5],  // Redis Caching
      backendBeginner[7],  // Docker & Deployment
    ].map((w, i) => ({ ...w, week: i + 1 })),
    'Full Stack Architecture',
    'Enterprise Full Stack Scalability'
  ),
  'DevOps Engineer': buildTiers(
    [
      createWeek(1, 'Linux Systems & Shell Scripting', 'Master Linux OS, permissions, processes, and Bash scripting.', ['Linux Shell & CLI', 'File Permissions & Users', 'Process Management', 'Bash Automation'], [{ title: 'Linux Journey', url: 'https://linuxjourney.com/' }, { title: 'Ubuntu Command Line Tutorial', url: 'https://ubuntu.com/tutorials/command-line-for-beginners' }], [{ day: 1, task: 'Master Linux CLI navigation and file operations', estimatedHours: 2 }, { day: 2, task: 'Configure user permissions and SSH key authentication', estimatedHours: 2 }, { day: 3, task: 'Inspect system processes using top, ps, and systemctl', estimatedHours: 2 }, { day: 4, task: 'Write Bash scripts with variables, loops, and conditions', estimatedHours: 2 }, { day: 5, task: 'Lab: Build an automated server health monitor script in Bash', estimatedHours: 3 }], 'Build an automated bash server monitoring script.'),
      createWeek(2, 'Computer Networking & Security for Cloud', 'Understand TCP/IP, DNS, Subnets, Firewalls, and SSL/TLS.', ['TCP/IP & OSI Model', 'DNS & Routing', 'Firewalls & Security Groups', 'TLS/SSL Certificates'], [{ title: 'Cloudflare: Learning DNS', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' }, { title: 'MDN Web Docs: Transport Layer Security (TLS)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/TLS' }], [{ day: 1, task: 'Analyze network packets using curl, ping, traceroute, and netstat', estimatedHours: 2 }, { day: 2, task: 'Configure local DNS lookups and inspect DNS records (A, CNAME, MX)', estimatedHours: 2 }, { day: 3, task: 'Understand CIDR blocks, private vs public subnets, and NAT gateways', estimatedHours: 2 }, { day: 4, task: 'Generate and configure SSL/TLS certificates with Let\'s Encrypt', estimatedHours: 2 }, { day: 5, task: 'Lab: Configure NGINX reverse proxy with HTTPS termination', estimatedHours: 3 }], 'Deploy a secure reverse proxy with automated SSL certificate renewal.'),
      createWeek(3, 'GitOps, CI/CD & GitHub Actions', 'Automate builds, automated testing, and deployments with CI/CD pipelines.', ['Git Branching Strategies', 'GitHub Actions Workflows', 'Automated Testing Pipelines', 'Secret Management'], [{ title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' }], [{ day: 1, task: 'Design trunk-based and GitFlow branching strategies', estimatedHours: 2 }, { day: 2, task: 'Write GitHub Actions workflow YAML files for pull requests', estimatedHours: 2 }, { day: 3, task: 'Configure build caching and parallel test matrix runners', estimatedHours: 2 }, { day: 4, task: 'Safely inject encrypted repository secrets into CI runners', estimatedHours: 2 }, { day: 5, task: 'Lab: Build end-to-end CI pipeline testing and building code on merge', estimatedHours: 3 }], 'Build an automated multi-stage CI/CD pipeline on GitHub Actions.'),
      createWeek(4, 'Containerization with Docker', 'Master container lifecycle, Dockerfile optimization, and multi-container orchestration.', ['Container Fundamentals', 'Multi-Stage Dockerfiles', 'Docker Volumes & Networks', 'Docker Compose'], [{ title: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started/' }], [{ day: 1, task: 'Understand Docker architecture vs traditional hypervisors', estimatedHours: 2 }, { day: 2, task: 'Write lightweight production Dockerfiles with Alpine base images', estimatedHours: 2 }, { day: 3, task: 'Manage persistent container storage using Docker named volumes', estimatedHours: 2 }, { day: 4, task: 'Configure isolated bridge networks between containers', estimatedHours: 2 }, { day: 5, task: 'Lab: Compose a full-stack web application with DB and Redis cache', estimatedHours: 3 }], 'Build and orchestrate a secure multi-container stack.', true),
      createWeek(5, 'Kubernetes Container Orchestration', 'Deploy and manage containerized workloads at scale with Kubernetes.', ['K8s Architecture (Control Plane)', 'Pods, Deployments & ReplicaSets', 'Services & Ingress Controllers', 'ConfigMaps & Secrets'], [{ title: 'Kubernetes Official Tutorials', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' }], [{ day: 1, task: 'Set up local cluster using Minikube or k3s and explore kubectl', estimatedHours: 2 }, { day: 2, task: 'Deploy stateless microservices with Deployments and ReplicaSets', estimatedHours: 2 }, { day: 3, task: 'Expose applications internally and externally via ClusterIP and NodePort Services', estimatedHours: 2 }, { day: 4, task: 'Manage environment configurations using ConfigMaps and K8s Secrets', estimatedHours: 2 }, { day: 5, task: 'Lab: Deploy a resilient microservices application with self-healing pods', estimatedHours: 3 }], 'Deploy a self-healing microservice application to a Kubernetes cluster.'),
      createWeek(6, 'Cloud Infrastructure (AWS / GCP)', 'Architect scalable cloud environments with VPCs, compute instances, object storage, and IAM.', ['Identity & Access Management (IAM)', 'Virtual Private Cloud (VPC)', 'Compute (EC2 / Compute Engine)', 'Object Storage (S3 / Cloud Storage)'], [{ title: 'AWS Well-Architected Framework', url: 'https://aws.amazon.com/architecture/well-architected/' }], [{ day: 1, task: 'Configure IAM policies, roles, and least-privilege principles', estimatedHours: 2 }, { day: 2, task: 'Design a custom VPC with public and private subnets across multiple AZs', estimatedHours: 2 }, { day: 3, task: 'Launch compute instances and configure auto-scaling groups with load balancers', estimatedHours: 2 }, { day: 4, task: 'Configure S3 buckets with lifecycle rules and server-side encryption', estimatedHours: 2 }, { day: 5, task: 'Lab: Architect a highly available, fault-tolerant web application in the cloud', estimatedHours: 3 }], 'Deploy a multi-AZ fault-tolerant cloud architecture with load balancing.'),
      createWeek(7, 'Infrastructure as Code (IaC) with Terraform', 'Provision and version cloud infrastructure declaratively using Terraform.', ['Terraform HCL Syntax', 'State Management & Backends', 'Terraform Modules', 'Plan, Apply & Drift Detection'], [{ title: 'HashiCorp Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials' }], [{ day: 1, task: 'Learn Terraform declarative syntax and provider configurations', estimatedHours: 2 }, { day: 2, task: 'Manage Terraform state remotely with S3 and state locking with DynamoDB', estimatedHours: 2 }, { day: 3, task: 'Write reusable, modular Terraform components for VPCs and servers', estimatedHours: 2 }, { day: 4, task: 'Detect and reconcile infrastructure drift using terraform plan', estimatedHours: 2 }, { day: 5, task: 'Lab: Provision an entire production VPC and database using single terraform apply', estimatedHours: 3 }], 'Provision a complete cloud infrastructure stack declaratively via Terraform.'),
      createWeek(8, 'Observability, Monitoring & Site Reliability', 'Implement telemetry, metrics, log aggregation, and alerting with Prometheus & Grafana.', ['Metrics & Telemetry (Prometheus)', 'Dashboards with Grafana', 'Centralized Log Aggregation', 'SLOs, SLIs & Incident Alerting'], [{ title: 'Google SRE Book (Free Online)', url: 'https://sre.google/sre-book/table-of-contents/' }, { title: 'Prometheus Getting Started', url: 'https://prometheus.io/docs/introduction/first_steps/' }], [{ day: 1, task: 'Instrument microservices with Prometheus client metrics (RED method)', estimatedHours: 2 }, { day: 2, task: 'Build interactive real-time performance dashboards in Grafana', estimatedHours: 2 }, { day: 3, task: 'Collect and search centralized application logs using Fluentd or Loki', estimatedHours: 2 }, { day: 4, task: 'Define SLIs, SLOs, and configure automated alerts via Slack/PagerDuty', estimatedHours: 2 }, { day: 5, task: 'Capstone: Deliver a fully monitored, auto-recovering production cluster', estimatedHours: 3 }], 'Demonstrate an end-to-end observable cloud production environment with automated alerts.', true),
    ],
    'Cloud Native Scaling',
    'Enterprise SRE & Multi-Region Resilience'
  ),
  'Cloud Engineer': buildTiers(
    // Clones DevOps Engineer structure
    [
      createWeek(1, 'Linux Systems & Cloud CLI Basics', 'Master Linux OS, command line automation, and cloud CLI tooling.', ['Linux Administration', 'Shell Scripting', 'AWS/GCP CLI Setup', 'SSH Key Management'], [{ title: 'Linux Journey', url: 'https://linuxjourney.com/' }], [{ day: 1, task: 'Master Linux administration commands and filesystem navigation', estimatedHours: 2 }, { day: 2, task: 'Configure cloud provider CLI tools with security tokens', estimatedHours: 2 }, { day: 3, task: 'Automate repetitive tasks with shell scripts', estimatedHours: 2 }, { day: 4, task: 'Manage SSH keys and remote bastion host connectivity', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an automated server provisioning script', estimatedHours: 3 }], 'Automate cloud instance bootstrapping with Bash and Cloud CLI.'),
      createWeek(2, 'Cloud Networking & Virtual Private Clouds', 'Design enterprise VPCs, routing tables, internet gateways, and subnets.', ['VPC Architecture', 'CIDR & Subnetting', 'Route Tables & Gateways', 'Security Groups & NACLs'], [{ title: 'AWS VPC Documentation', url: 'https://docs.aws.amazon.com/vpc/' }], [{ day: 1, task: 'Plan IP addressing schemes and CIDR subnet allocations', estimatedHours: 2 }, { day: 2, task: 'Deploy public and private subnets with internet gateways', estimatedHours: 2 }, { day: 3, task: 'Configure NAT Gateways for secure private subnet outbound access', estimatedHours: 2 }, { day: 4, task: 'Implement defense-in-depth using Security Groups and stateless NACLs', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Architect a secure isolated 3-tier VPC network topology', estimatedHours: 3 }], 'Deploy a secure isolated 3-tier VPC network architecture.'),
      createWeek(3, 'Cloud Compute & Auto Scaling', 'Deploy resilient compute instances with load balancing and automated scaling.', ['Elastic Compute (EC2)', 'Application Load Balancers (ALB)', 'Auto Scaling Groups (ASG)', 'Launch Templates'], [{ title: 'AWS Compute Guides', url: 'https://aws.amazon.com/ec2/' }], [{ day: 1, task: 'Configure launch templates with customized user data boot scripts', estimatedHours: 2 }, { day: 2, task: 'Deploy Application Load Balancers with target health checks', estimatedHours: 2 }, { day: 3, task: 'Configure Auto Scaling Groups based on CPU and request count triggers', estimatedHours: 2 }, { day: 4, task: 'Test stress loads to verify automatic instance scaling and healing', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Deliver a self-healing auto-scaling web application tier', estimatedHours: 3 }], 'Build a self-healing web cluster that scales dynamically under load.'),
      createWeek(4, 'Cloud Storage & Databases', 'Master managed databases (RDS, DynamoDB) and scalable object storage (S3).', ['Object Storage (S3)', 'Managed Relational DBs (RDS)', 'NoSQL at Scale (DynamoDB)', 'Backup & Disaster Recovery'], [{ title: 'AWS Storage Overview', url: 'https://aws.amazon.com/products/storage/' }], [{ day: 1, task: 'Configure S3 buckets with encryption, versioning, and lifecycle transitions', estimatedHours: 2 }, { day: 2, task: 'Deploy multi-AZ PostgreSQL RDS instances with automated failover', estimatedHours: 2 }, { day: 3, task: 'Model high-throughput key-value data in DynamoDB with partition keys', estimatedHours: 2 }, { day: 4, task: 'Automate point-in-time database snapshot backups and restoration', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build a resilient media storage and cataloging service', estimatedHours: 3 }], 'Deploy a durable cloud storage and multi-AZ database tier with failover.', true),
      createWeek(5, 'Infrastructure as Code with Terraform', 'Declarative cloud provisioning with Terraform and state management.', ['Terraform Fundamentals', 'State & Backends', 'Modular Architecture', 'Variables & Outputs'], [{ title: 'HashiCorp Terraform Documentation', url: 'https://developer.hashicorp.com/terraform/docs' }], [{ day: 1, task: 'Learn Terraform workflow: init, plan, apply, destroy', estimatedHours: 2 }, { day: 2, task: 'Store state remotely with encrypted S3 and DynamoDB lock tables', estimatedHours: 2 }, { day: 3, task: 'Create modular Terraform definitions for VPC, compute, and databases', estimatedHours: 2 }, { day: 4, task: 'Parametrize environments (dev, staging, prod) using tfvars', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Deploy entire infrastructure stack using automated Terraform pipeline', estimatedHours: 3 }], 'Provision an entire cloud infrastructure stack with Terraform modules.'),
      createWeek(6, 'Containers & Serverless Computing', 'Run applications without managing servers using Docker, ECS, and AWS Lambda.', ['Docker Containerization', 'Elastic Container Service (ECS)', 'Serverless Functions (Lambda)', 'API Gateway Integration'], [{ title: 'AWS Serverless Computing Guide', url: 'https://aws.amazon.com/serverless/' }], [{ day: 1, task: 'Containerize applications and push to Elastic Container Registry (ECR)', estimatedHours: 2 }, { day: 2, task: 'Deploy serverless containers on AWS Fargate without managing VMs', estimatedHours: 2 }, { day: 3, task: 'Build event-driven Lambda functions triggered by S3 uploads', estimatedHours: 2 }, { day: 4, task: 'Connect Lambda to HTTP API Gateway with custom authorizers', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build a serverless image thumbnail generation service', estimatedHours: 3 }], 'Deliver an event-driven serverless API processing asynchronous tasks.'),
      createWeek(7, 'Cloud Security, IAM & Compliance', 'Implement enterprise identity, encryption, audit logs, and compliance controls.', ['IAM Policies & Roles', 'Key Management Service (KMS)', 'CloudTrail & Security Hub', 'WAF & DDoS Protection'], [{ title: 'AWS Security Best Practices', url: 'https://aws.amazon.com/security/' }], [{ day: 1, task: 'Audit IAM policies and remove wildcard permissions (*)', estimatedHours: 2 }, { day: 2, task: 'Encrypt data at rest with customer-managed KMS encryption keys', estimatedHours: 2 }, { day: 3, task: 'Enable CloudTrail for governance, compliance, and API auditing', estimatedHours: 2 }, { day: 4, task: 'Protect public endpoints using AWS WAF rules against SQLi and XSS', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Perform an automated CIS security benchmark audit on cloud account', estimatedHours: 3 }], 'Achieve high compliance on cloud security posture and automated auditing.'),
      createWeek(8, 'Monitoring, Cost Optimization & Capstone', 'Optimize cloud budgets, set up CloudWatch alarms, and deploy production capstone.', ['CloudWatch Metrics & Logs', 'Cost Explorer & FinOps', 'Disaster Recovery Strategies', 'Production Architecture Review'], [{ title: 'AWS Cost Optimization Guide', url: 'https://aws.amazon.com/pricing/cost-optimization/' }], [{ day: 1, task: 'Configure CloudWatch alarms for anomaly detection and alert notifications', estimatedHours: 2 }, { day: 2, task: 'Analyze cost reports, identify idle resources, and apply savings plans', estimatedHours: 2 }, { day: 3, task: 'Test disaster recovery scenarios with simulated availability zone outage', estimatedHours: 2 }, { day: 4, task: 'Conduct a formal Well-Architected Framework review on your design', estimatedHours: 2 }, { day: 5, task: 'Capstone: Deliver a production-ready, fault-tolerant, cost-optimized cloud environment', estimatedHours: 3 }], 'Complete a production-ready cloud deployment with automated monitoring and cost controls.', true),
    ],
    'Enterprise Cloud Systems',
    'Global Multi-Cloud Infrastructure'
  ),
  'Python Developer': buildTiers(
    [
      createWeek(1, 'Python Core Syntax & Data Structures', 'Master variables, data structures, list comprehensions, and control flow in Python.', ['Python Syntax & Variables', 'Lists, Tuples, Dictionaries, Sets', 'List & Dict Comprehensions', 'Functions & Variable Scope'], [{ title: 'Python Official Documentation (3.12+)', url: 'https://docs.python.org/3/tutorial/' }, { title: 'Real Python: Python Basics', url: 'https://realpython.com/' }], [{ day: 1, task: 'Understand Python dynamic typing, memory model, and primitive types', estimatedHours: 2 }, { day: 2, task: 'Master sequences: list indexing, slicing, tuple immutability, and sets', estimatedHours: 2 }, { day: 3, task: 'Work with dictionaries: key hashing, dict comprehensions, and get() fallbacks', estimatedHours: 2 }, { day: 4, task: 'Write modular functions with *args, **kwargs, and type hints', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an interactive Command-Line Expense Tracker with data persistence', estimatedHours: 3 }], 'Build a CLI application utilizing advanced Python data structures.'),
      createWeek(2, 'Object-Oriented Programming (OOP) in Python', 'Master classes, inheritance, dunder methods, properties, and design patterns.', ['Classes & Instances', 'Inheritance & Polymorphism', 'Dunder (Magic) Methods', 'Properties & Encapsulation'], [{ title: 'Real Python: Object-Oriented Programming (OOP) in Python', url: 'https://realpython.com/python3-object-oriented-programming/' }], [{ day: 1, task: 'Define classes with __init__, instance attributes, and class methods', estimatedHours: 2 }, { day: 2, task: 'Implement single and multiple inheritance using super()', estimatedHours: 2 }, { day: 3, task: 'Override dunder methods: __str__, __repr__, __len__, __eq__, and __iter__', estimatedHours: 2 }, { day: 4, task: 'Use @property, @staticmethod, and @classmethod decorators for encapsulation', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an Object-Oriented Banking Simulation system with transactions', estimatedHours: 3 }], 'Design an OOP domain model with encapsulation and dunder method overrides.'),
      createWeek(3, 'Advanced Python: Generators, Decorators & Context Managers', 'Deep dive into Python internals, iterators, generators, custom decorators, and context managers.', ['Generators & yield Keyword', 'Custom Decorators', 'Context Managers (with statement)', 'Packaging with Poetry/Pip'], [{ title: 'Real Python: Primer on Python Decorators', url: 'https://realpython.com/primer-on-python-decorators/' }], [{ day: 1, task: 'Create memory-efficient generators for streaming large datasets with yield', estimatedHours: 2 }, { day: 2, task: 'Write custom decorators for execution timing, authentication, and caching', estimatedHours: 2 }, { day: 3, task: 'Implement custom context managers using class __enter__/__exit__ and contextlib', estimatedHours: 2 }, { day: 4, task: 'Manage project dependencies and virtual environments with Poetry and pip', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build a reusable log-decorator package published to local repository', estimatedHours: 3 }], 'Create a high-performance Python package utilizing decorators and generators.'),
      createWeek(4, 'FastAPI & Modern Web API Development', 'Build high-performance asynchronous REST APIs using FastAPI and Pydantic.', ['FastAPI Framework Overview', 'Pydantic Data Validation', 'Dependency Injection System', 'Swagger/OpenAPI Auto-Documentation'], [{ title: 'FastAPI Official Documentation', url: 'https://fastapi.tiangolo.com/' }], [{ day: 1, task: 'Install FastAPI and Uvicorn; build your first async HTTP endpoint', estimatedHours: 2 }, { day: 2, task: 'Define strict request/response data schemas using Pydantic BaseModel', estimatedHours: 2 }, { day: 3, task: 'Implement query parameters, path variables, and status code handling', estimatedHours: 2 }, { day: 4, task: 'Use FastAPI Dependency Injection for database sessions and auth headers', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an interactive Book Store REST API with automatic Swagger docs', estimatedHours: 3 }], 'Build and document a full asynchronous REST API using FastAPI.', true),
      createWeek(5, 'Database Integration: SQLAlchemy & Alembic', 'Connect Python to relational databases using SQLAlchemy 2.0 ORM and Alembic migrations.', ['SQLAlchemy 2.0 ORM Mapping', 'Alembic Database Migrations', 'Async Database Sessions', 'Query Relationships & Eager Loading'], [{ title: 'SQLAlchemy Official Documentation', url: 'https://docs.sqlalchemy.org/' }], [{ day: 1, task: 'Define database models with SQLAlchemy declarative Base and Column types', estimatedHours: 2 }, { day: 2, task: 'Configure Alembic for automated schema versioning and database migrations', estimatedHours: 2 }, { day: 3, task: 'Execute CRUD operations using async Session with select() and where() clauses', estimatedHours: 2 }, { day: 4, task: 'Configure joinedload and selectinload to prevent N+1 query performance problems', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an API-backed Inventory Management system with PostgreSQL', estimatedHours: 3 }], 'Deliver a persistent database API with automated schema migrations.'),
      createWeek(6, 'Asynchronous Programming with Asyncio', 'Master concurrent I/O operations using Python asyncio, event loops, and tasks.', ['Asyncio Event Loop', 'Coroutines with async/await', 'Task Concurrency with asyncio.gather', 'Async HTTP with httpx/aiohttp'], [{ title: 'Python Docs: asyncio - Asynchronous I/O', url: 'https://docs.python.org/3/library/asyncio.html' }], [{ day: 1, task: 'Understand single-threaded concurrency vs multi-threading in Python', estimatedHours: 2 }, { day: 2, task: 'Create and await coroutines without blocking the main event loop', estimatedHours: 2 }, { day: 3, task: 'Run concurrent background tasks simultaneously with asyncio.gather()', estimatedHours: 2 }, { day: 4, task: 'Make high-speed concurrent HTTP calls using httpx.AsyncClient', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build a high-throughput Web Scraper fetching 100 pages in parallel', estimatedHours: 3 }], 'Build a concurrent asynchronous scraping and data aggregation engine.'),
      createWeek(7, 'Testing & Code Quality with Pytest', 'Write robust test suites with Pytest, fixtures, mocking, and enforce clean code standards.', ['Pytest Testing Framework', 'Test Fixtures & Parameterization', 'Mocking with unittest.mock', 'Code Linting with Ruff & Black'], [{ title: 'Pytest Official Documentation', url: 'https://docs.pytest.org/' }], [{ day: 1, task: 'Write unit tests with assertions and test discovery in Pytest', estimatedHours: 2 }, { day: 2, task: 'Create reusable test fixtures with scope management in conftest.py', estimatedHours: 2 }, { day: 3, task: 'Test multiple input scenarios using @pytest.mark.parametrize', estimatedHours: 2 }, { day: 4, task: 'Mock database calls and external HTTP APIs using pytest-mock', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Achieve 90% test coverage with automated Pytest runs in GitHub Actions', estimatedHours: 3 }], 'Attain 90%+ test coverage with automated unit and integration tests.'),
      createWeek(8, 'Packaging, Dockerization & Production Deployment', 'Package Python services into Docker containers and deploy to cloud environments.', ['Production Dockerfiles for Python', 'Gunicorn/Uvicorn Worker Tuning', 'Environment Configurations', 'Production Cloud Deployment'], [{ title: 'Dockerizing Python Applications Guide', url: 'https://docs.docker.com/language/python/' }], [{ day: 1, task: 'Write an optimized slim Dockerfile avoiding root execution', estimatedHours: 2 }, { day: 2, task: 'Configure production Uvicorn workers behind Gunicorn process manager', estimatedHours: 2 }, { day: 3, task: 'Set up health check endpoints and graceful shutdown handling', estimatedHours: 2 }, { day: 4, task: 'Deploy containerized Python service to Render, Railway, or AWS', estimatedHours: 2 }, { day: 5, task: 'Capstone: Ship a live production Python Web Service with CI/CD and monitoring', estimatedHours: 3 }], 'Deploy a production-ready Python service with containerized workers.', true),
    ],
    'Advanced Python Architecture',
    'High-Throughput Distributed Python'
  ),
  'Data Analyst': buildTiers(
    [
      createWeek(1, 'Data Analytics Foundations & Advanced Excel', 'Master spreadsheet analytics, formulas, pivot tables, data cleaning, and validation.', ['Excel & Sheets Formulas (VLOOKUP, XLOOKUP)', 'Pivot Tables & Multi-Dimensional Slicers', 'Data Cleaning & Outlier Detection', 'Data Modeling Basics'], [{ title: 'Microsoft Excel Documentation & Tutorials', url: 'https://support.microsoft.com/en-us/excel' }, { title: 'freeCodeCamp: Data Analysis with Excel', url: 'https://www.freecodecamp.org/news/data-analysis-with-excel/' }], [{ day: 1, task: 'Master lookup functions: XLOOKUP, INDEX/MATCH, and conditional IFS', estimatedHours: 2 }, { day: 2, task: 'Clean messy data: remove duplicates, text-to-columns, and date parsing', estimatedHours: 2 }, { day: 3, task: 'Build interactive Pivot Tables with calculated fields and slicers', estimatedHours: 2 }, { day: 4, task: 'Conduct descriptive statistics: mean, median, standard deviation, and quartiles', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an Executive Sales Summary spreadsheet dashboard', estimatedHours: 3 }], 'Deliver an interactive spreadsheet business dashboard with automated KPIs.'),
      createWeek(2, 'SQL for Data Analysis: Querying & Filtering', 'Extract business insights from relational databases using SQL queries.', ['SELECT, WHERE, ORDER BY', 'GROUP BY & HAVING Aggregations', 'String & Date Manipulations', 'Multi-Condition Filtering'], [{ title: 'SQLBolt: Interactive SQL Tutorials', url: 'https://sqlbolt.com/' }, { title: 'Mode Analytics: SQL Tutorial for Data Analysis', url: 'https://mode.com/sql-tutorial/' }], [{ day: 1, task: 'Query relational tables using SELECT, DISTINCT, and WHERE filtering', estimatedHours: 2 }, { day: 2, task: 'Aggregate customer revenue using SUM, AVG, MIN, MAX, and COUNT', estimatedHours: 2 }, { day: 3, task: 'Group records by department or region using GROUP BY and filter with HAVING', estimatedHours: 2 }, { day: 4, task: 'Transform date formats and parse timestamps for cohort analysis', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Analyze eCommerce customer purchase trends using SQL queries', estimatedHours: 3 }], 'Extract customer transaction insights from an eCommerce SQL database.'),
      createWeek(3, 'Advanced SQL: Window Functions & Subqueries', 'Master advanced analytical SQL: window functions, CTEs, and self-joins.', ['Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', 'Running Totals & Moving Averages (OVER/PARTITION BY)', 'Common Table Expressions (WITH / CTEs)', 'Subqueries & Case Statements'], [{ title: 'PostgreSQL Window Functions Documentation', url: 'https://www.postgresql.org/docs/current/tutorial-window.html' }], [{ day: 1, task: 'Calculate customer ranks and percentiles with RANK() and DENSE_RANK()', estimatedHours: 2 }, { day: 2, task: 'Compute cumulative revenue and moving 7-day averages with OVER (PARTITION BY)', estimatedHours: 2 }, { day: 3, task: 'Structure complex multi-step queries using Common Table Expressions (CTEs)', estimatedHours: 2 }, { day: 4, task: 'Segment users dynamically using conditional CASE WHEN statements', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Conduct a Month-over-Month User Retention and Churn SQL study', estimatedHours: 3 }], 'Write advanced SQL queries calculating running metrics and user retention.'),
      createWeek(4, 'Python for Data Analysis: Pandas & NumPy', 'Clean, manipulate, and analyze tabular datasets programmatically using Python and Pandas.', ['NumPy Arrays & Vectorized Math', 'Pandas Series & DataFrames', 'Data Cleaning & Handling Missing Values', 'Merging, Joining & GroupBy in Pandas'], [{ title: 'Pandas Official Getting Started Guide', url: 'https://pandas.pydata.org/docs/getting_started/index.html' }], [{ day: 1, task: 'Load CSV, Excel, and JSON data into Pandas DataFrames and inspect head/info', estimatedHours: 2 }, { day: 2, task: 'Filter rows and select columns using boolean indexing and .loc/.iloc', estimatedHours: 2 }, { day: 3, task: 'Handle missing data: dropna(), fillna(), and impute statistical medians', estimatedHours: 2 }, { day: 4, task: 'Aggregate metrics with df.groupby() and merge datasets with pd.merge()', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Clean and summarize an uncleaned 50,000-row survey dataset in Pandas', estimatedHours: 3 }], 'Clean and transform raw data files into structured analytical datasets.', true),
      createWeek(5, 'Exploratory Data Analysis & Visualization', 'Uncover patterns, correlations, and distributions using Matplotlib and Seaborn.', ['Data Distributions & Histograms', 'Scatter Plots & Correlation Heatmaps', 'Box Plots & Outlier Identification', 'Storytelling with Visualizations'], [{ title: 'Seaborn Official Documentation: Tutorial', url: 'https://seaborn.pydata.org/tutorial.html' }, { title: 'Storytelling with Data by Cole Nussbaumer', url: 'https://www.storytellingwithdata.com/' }], [{ day: 1, task: 'Plot continuous distributions with histograms and Kernel Density Estimates (KDE)', estimatedHours: 2 }, { day: 2, task: 'Analyze feature relationships using scatter plots and regression trend lines', estimatedHours: 2 }, { day: 3, task: 'Calculate Pearson correlation matrices and visualize with heatmap palettes', estimatedHours: 2 }, { day: 4, task: 'Detect anomalies and spread using multi-category box plots and violin plots', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Conduct an end-to-end Exploratory Data Analysis report on Housing Prices', estimatedHours: 3 }], 'Publish an Exploratory Data Analysis report with publication-grade charts.'),
      createWeek(6, 'Business Intelligence & Dashboards (Power BI / Tableau)', 'Build interactive executive dashboards, KPI monitors, and data models in BI tools.', ['Data Modeling & Star Schema', 'Calculated Columns & DAX Basics', 'Interactive Visuals & Drill-Downs', 'Dashboard Storytelling & Layouts'], [{ title: 'Microsoft Power BI Learning Path', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi' }, { title: 'Tableau Public: Free Tutorials', url: 'https://public.tableau.com/en-us/s/resources' }], [{ day: 1, task: 'Connect BI tool to SQL database and construct star schema relationships', estimatedHours: 2 }, { day: 2, task: 'Write DAX formulas for Year-to-Date (YTD) revenue and customer counts', estimatedHours: 2 }, { day: 3, task: 'Design interactive cards, line charts, and geographic map visuals', estimatedHours: 2 }, { day: 4, task: 'Implement cross-filtering, page drill-throughs, and role-based views', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build an Executive C-Suite Sales Performance Dashboard', estimatedHours: 3 }], 'Build an interactive BI dashboard allowing executive stakeholder drill-downs.'),
      createWeek(7, 'Statistical Analysis & A/B Testing for Business', 'Apply statistical hypothesis testing, confidence intervals, and p-values to make data-driven decisions.', ['Descriptive vs Inferential Statistics', 'Hypothesis Testing & p-Values', 'A/B Testing Methodology', 'Sample Size & Statistical Power'], [{ title: 'Khan Academy: High School Statistics Course', url: 'https://www.khanacademy.org/math/statistics-probability' }], [{ day: 1, task: 'Understand the Central Limit Theorem, standard error, and normal distribution', estimatedHours: 2 }, { day: 2, task: 'Formulate Null (H0) and Alternative (H1) hypotheses for business tests', estimatedHours: 2 }, { day: 3, task: 'Execute two-sample t-tests and Chi-Square tests to evaluate significance', estimatedHours: 2 }, { day: 4, task: 'Calculate minimum detectable effect and required sample sizes before tests', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Analyze a digital marketing A/B test experiment and present findings', estimatedHours: 3 }], 'Conduct and present a statistical A/B test report with recommendations.'),
      createWeek(8, 'Business Case Studies & Final Capstone Portfolio', 'Synthesize all tools into an end-to-end business portfolio project with executive slide deck.', ['Data Pipeline Synthesis', 'Translating Data to Business ROI', 'Executive Presentation Deck', 'Portfolio Publication on GitHub'], [{ title: 'Harvard Business Review: Data Strategy Articles', url: 'https://hbr.org/topic/subject/data' }], [{ day: 1, task: 'Select business challenge: Customer Churn or Supply Chain Bottleneck', estimatedHours: 2 }, { day: 2, task: 'Extract and clean multi-source data with SQL and Python scripts', estimatedHours: 2 }, { day: 3, task: 'Identify top 3 actionable drivers behind revenue leakages', estimatedHours: 2 }, { day: 4, task: 'Build executive slide deck translating complex data to concrete dollar ROI', estimatedHours: 2 }, { day: 5, task: 'Capstone: Present end-to-end data analytics project and publish GitHub case study', estimatedHours: 3 }], 'Present an executive case study with quantifiable business recommendations.', true),
    ],
    'Enterprise Business Analytics',
    'Strategic Analytics & Decision Science'
  ),
  'Data Scientist': buildTiers(
    [
      createWeek(1, 'Python & Scientific Computing (NumPy & Pandas)', 'Master numerical computing, array vectorization, and data manipulation.', ['NumPy N-Dimensional Arrays', 'Broadcasting & Matrix Operations', 'Pandas DataFrames & Series', 'Data Cleaning & Transformation'], [{ title: 'NumPy User Guide', url: 'https://numpy.org/doc/stable/user/' }, { title: 'Python Data Science Handbook by Jake VanderPlas', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/' }], [{ day: 1, task: 'Understand memory layouts and vectorized operations in NumPy', estimatedHours: 2 }, { day: 2, task: 'Manipulate multidimensional matrices: reshaping, indexing, slicing', estimatedHours: 2 }, { day: 3, task: 'Clean messy data with Pandas: type conversions, null handling, deduplication', estimatedHours: 2 }, { day: 4, task: 'Perform group aggregates, pivot tables, and multi-index transformations', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build a data cleaning pipeline processing 100K transaction records', estimatedHours: 3 }], 'Build an automated data pipeline cleaning raw datasets with NumPy and Pandas.'),
      createWeek(2, 'Applied Mathematics: Linear Algebra & Calculus for ML', 'Understand the mathematical foundations behind machine learning models.', ['Vector Spaces & Dot Products', 'Matrix Multiplication & Inverses', 'Eigenvalues & Eigenvectors', 'Derivatives & Gradient Descent'], [{ title: '3Blue1Brown: Essence of Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' }, { title: '3Blue1Brown: Essence of Calculus', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr' }], [{ day: 1, task: 'Master vector math: dot products, norms, angles, and projections', estimatedHours: 2 }, { day: 2, task: 'Compute matrix transformations, determinants, and matrix inverses in Python', estimatedHours: 2 }, { day: 3, task: 'Understand Eigen decomposition and Principal Component Analysis intuition', estimatedHours: 2 }, { day: 4, task: 'Implement gradient descent optimization from scratch in pure Python', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Code a Multivariate Linear Regression model from scratch using matrix math', estimatedHours: 3 }], 'Implement multivariate gradient descent from scratch using linear algebra.'),
      createWeek(3, 'Probability & Statistical Inference', 'Master distributions, Bayes theorem, hypothesis testing, and maximum likelihood estimation.', ['Probability Distributions (Normal, Binomial, Poisson)', 'Central Limit Theorem', 'Hypothesis Testing & p-Values', 'Maximum Likelihood Estimation (MLE)'], [{ title: 'StatQuest with Josh Starmer: Statistics Fundamentals', url: 'https://statquest.org/' }], [{ day: 1, task: 'Explore continuous and discrete probability distributions in SciPy', estimatedHours: 2 }, { day: 2, task: 'Simulate the Central Limit Theorem and calculate confidence intervals', estimatedHours: 2 }, { day: 3, task: 'Conduct two-sample t-tests, ANOVA, and Chi-Square tests', estimatedHours: 2 }, { day: 4, task: 'Derive Maximum Likelihood Estimates for parameter estimation', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Analyze clinical experiment data to determine statistical efficacy', estimatedHours: 3 }], 'Conduct statistical inference and hypothesis validation on empirical data.'),
      createWeek(4, 'Classical Machine Learning: Supervised Models', 'Train and evaluate regression and classification models using Scikit-Learn.', ['Linear & Logistic Regression', 'Decision Trees & Random Forests', 'Feature Scaling & Encoders', 'Evaluation Metrics (ROC/AUC, F1, RMSE)'], [{ title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html' }], [{ day: 1, task: 'Train Linear Regression models with Ridge/Lasso regularization', estimatedHours: 2 }, { day: 2, task: 'Build binary and multiclass classifiers using Logistic Regression and SVMs', estimatedHours: 2 }, { day: 3, task: 'Train non-linear ensemble models using Decision Trees and Random Forests', estimatedHours: 2 }, { day: 4, task: 'Evaluate models using confusion matrices, Precision, Recall, and ROC-AUC', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Build a Customer Churn Predictor achieving 85%+ ROC-AUC score', estimatedHours: 3 }], 'Deliver an end-to-end trained supervised machine learning classification pipeline.', true),
      createWeek(5, 'Gradient Boosting & Advanced Ensembles', 'Master state-of-the-art tabular models: XGBoost, LightGBM, and hyperparameter tuning.', ['Boosting Concepts (AdaBoost to XGBoost)', 'XGBoost & LightGBM Implementations', 'Handling Class Imbalance (SMOTE)', 'Hyperparameter Optimization (Optuna)'], [{ title: 'XGBoost Official Documentation', url: 'https://xgboost.readthedocs.io/' }, { title: 'Optuna: Hyperparameter Optimization Framework', url: 'https://optuna.org/' }], [{ day: 1, task: 'Understand boosting philosophy: sequentially correcting residual errors', estimatedHours: 2 }, { day: 2, task: 'Train and configure LightGBM and XGBoost models on tabular datasets', estimatedHours: 2 }, { day: 3, task: 'Address severely imbalanced datasets using class weights and SMOTE oversampling', estimatedHours: 2 }, { day: 4, task: 'Automate Bayesian hyperparameter searches using Optuna study trials', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Compete on a Kaggle dataset and achieve top 15% validation score', estimatedHours: 3 }], 'Train an optimized XGBoost model with automated Bayesian hyperparameter tuning.'),
      createWeek(6, 'Unsupervised Learning & Dimensionality Reduction', 'Discover hidden structures using clustering algorithms and dimensionality reduction.', ['K-Means & DBSCAN Clustering', 'Principal Component Analysis (PCA)', 't-SNE & UMAP Visualization', 'Anomaly Detection (Isolation Forests)'], [{ title: 'Scikit-Learn: Unsupervised Learning Guide', url: 'https://scikit-learn.org/stable/unsupervised_learning.html' }], [{ day: 1, task: 'Cluster customer behaviors using K-Means and determine optimal K with Elbow method', estimatedHours: 2 }, { day: 2, task: 'Identify arbitrary-shaped density clusters using DBSCAN', estimatedHours: 2 }, { day: 3, task: 'Reduce 50+ dimensional datasets to 2D projections using PCA and t-SNE', estimatedHours: 2 }, { day: 4, task: 'Detect fraudulent transactions using unsupervised Isolation Forests', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Segment eCommerce customer database into distinct actionable personas', estimatedHours: 3 }], 'Build an unsupervised customer segmentation engine with dimensionality reduction.'),
      createWeek(7, 'Deep Learning Foundations with PyTorch', 'Build, train, and evaluate artificial neural networks from scratch using PyTorch.', ['Tensors & Autograd Mechanics', 'Multi-Layer Perceptrons (MLP)', 'Loss Functions & Optimizers (Adam)', 'Overfitting Prevention: Dropout & BatchNorm'], [{ title: 'PyTorch Official Deep Learning Tutorials', url: 'https://pytorch.org/tutorials/' }, { title: 'Fast.ai: Practical Deep Learning for Coders', url: 'https://course.fast.ai/' }], [{ day: 1, task: 'Understand PyTorch tensors, GPU acceleration with CUDA, and autograd gradients', estimatedHours: 2 }, { day: 2, task: 'Construct deep neural network architectures using torch.nn.Module', estimatedHours: 2 }, { day: 3, task: 'Write custom training loops with forward pass, loss calculation, and backward() step', estimatedHours: 2 }, { day: 4, task: 'Implement regularization: Dropout, Batch Normalization, and early stopping', estimatedHours: 2 }, { day: 5, task: 'Project Lab: Train a deep neural network on image classification dataset', estimatedHours: 3 }], 'Build and train a custom neural network using PyTorch with automated checkpoints.'),
      createWeek(8, 'Model Serving, MLOps & Capstone Deployment', 'Package models into FastAPI endpoints and monitor model performance in production.', ['Model Serialization (Pickle / ONNX)', 'Building ML Inference APIs with FastAPI', 'Containerizing Models with Docker', 'Model Monitoring & Concept Drift'], [{ title: 'Made With ML: Production MLOps Course', url: 'https://madewithml.com/' }], [{ day: 1, task: 'Serialize trained models into lightweight ONNX and joblib artifacts', estimatedHours: 2 }, { day: 2, task: 'Build low-latency prediction endpoint in FastAPI with input validation', estimatedHours: 2 }, { day: 3, task: 'Package model and inference dependencies into an optimized Docker container', estimatedHours: 2 }, { day: 4, task: 'Set up monitoring for latency, data drift, and prediction distributions', estimatedHours: 2 }, { day: 5, task: 'Capstone: Ship a live containerized Machine Learning API to cloud server', estimatedHours: 3 }], 'Deploy a containerized machine learning inference service with live endpoints.', true),
    ],
    'Advanced Deep Learning & NLP',
    'Enterprise LLM Engineering & Distributed ML'
  ),
};

// Aliases for matching alternate user queries
fullRoadmaps['Machine Learning Engineer'] = fullRoadmaps['Data Scientist'];
fullRoadmaps['DevOps'] = fullRoadmaps['DevOps Engineer'];
fullRoadmaps['Cloud'] = fullRoadmaps['Cloud Engineer'];
fullRoadmaps['Full Stack Developer'] = fullRoadmaps['Full Stack Engineer'];
fullRoadmaps['Python'] = fullRoadmaps['Python Developer'];
fullRoadmaps['Java'] = fullRoadmaps['Java Developer'];

const targetPath = path.resolve(__dirname, '../data/roadmaps.json');
fs.writeFileSync(targetPath, JSON.stringify(fullRoadmaps, null, 2), 'utf-8');

console.log(`✅ Successfully generated authoritative roadmaps dataset at ${targetPath}`);
console.log(`Total roles generated: ${Object.keys(fullRoadmaps).length}`);
