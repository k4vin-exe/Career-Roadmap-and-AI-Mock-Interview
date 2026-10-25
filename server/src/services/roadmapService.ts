import { RoadmapProfile } from '../models/RoadmapProfile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UserProfileInput {
  name: string;
  workExperience: string;
  currentRole: string;
  skills: string[];
  ugField: string;
  pgField: string;
  bio: string;
  desiredRole: string;
}

function resolveRoleKey(desiredRole: string, localData: any): string | null {
  if (localData[desiredRole]) return desiredRole;

  const roleLower = desiredRole.toLowerCase().trim();

  // Intelligent keyword matching
  if (roleLower.includes('front') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('web dev')) {
    return localData['Frontend Developer'] ? 'Frontend Developer' : null;
  }
  if (roleLower.includes('full') || roleLower.includes('mern') || roleLower.includes('mean')) {
    return localData['Full Stack Engineer'] ? 'Full Stack Engineer' : null;
  }
  if (roleLower.includes('back') || roleLower.includes('node') || roleLower.includes('express') || roleLower.includes('api')) {
    return localData['Backend Developer'] ? 'Backend Developer' : null;
  }
  if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('site reliability')) {
    return localData['DevOps Engineer'] ? 'DevOps Engineer' : null;
  }
  if (roleLower.includes('cloud') || roleLower.includes('aws') || roleLower.includes('azure') || roleLower.includes('gcp')) {
    return localData['Cloud Engineer'] ? 'Cloud Engineer' : null;
  }
  if (roleLower.includes('python') || roleLower.includes('django') || roleLower.includes('fastapi')) {
    return localData['Python Developer'] ? 'Python Developer' : null;
  }
  if (roleLower.includes('java') || roleLower.includes('spring')) {
    return localData['Java Developer'] ? 'Java Developer' : null;
  }
  if (roleLower.includes('data anal') || roleLower.includes('bi') || roleLower.includes('analytics') || roleLower.includes('power bi') || roleLower.includes('tableau')) {
    return localData['Data Analyst'] ? 'Data Analyst' : null;
  }
  if (roleLower.includes('data sci') || roleLower.includes('machine learn') || roleLower.includes('ml') || roleLower.includes('artificial intelligence') || roleLower.includes('ai')) {
    return localData['Data Scientist'] ? 'Data Scientist' : null;
  }

  // Exact or partial key match in localData
  const keys = Object.keys(localData);
  const found = keys.find(
    (k) =>
      k.toLowerCase() === roleLower ||
      roleLower.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(roleLower)
  );

  return found || null;
}

function buildDynamicCustomRoadmap(roleName: string) {
  const encoded = encodeURIComponent(roleName);
  return [
    {
      week: 1,
      theme: `Week 1 — ${roleName} Foundations & Tooling`,
      goal: `Master foundational syntax, development environments, and architecture for ${roleName}.`,
      topics: [`${roleName} Overview & Industry Standards`, 'Core Programming Syntax', 'Environment Setup & CLI', 'Version Control with Git'],
      resources: [
        { title: `Roadmap.sh Developer Guides`, url: `https://roadmap.sh/` },
        { title: `freeCodeCamp: Comprehensive ${roleName} Tutorials`, url: `https://www.freecodecamp.org/` },
        { title: `GitHub Awesome ${roleName} Curated List`, url: `https://github.com/search?q=awesome+${encoded}&type=repositories` },
        { title: `MDN Web Docs: Core Web Architecture`, url: `https://developer.mozilla.org/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Study architectural fundamentals and career roadmap for ${roleName}`, estimatedHours: 2 },
        { day: 2, task: `Set up local development IDE, packages, and environment tools`, estimatedHours: 2 },
        { day: 3, task: `Practice core programming constructs and data structures`, estimatedHours: 2 },
        { day: 4, task: `Configure Git repository, branching, and automated commit conventions`, estimatedHours: 2 },
        { day: 5, task: `Lab: Build your first functional starter project for ${roleName}`, estimatedHours: 3 }
      ],
      milestone: `Establish a verified development environment and repository for ${roleName}.`,
      practiceInterview: false
    },
    {
      week: 2,
      theme: `Week 2 — Core Concepts & Data Modeling`,
      goal: `Deep dive into domain-specific structures, data pipelines, and algorithms.`,
      topics: ['Domain Data Models', 'Core Algorithms & Complexity', 'Object-Oriented & Functional Patterns', 'Error Handling'],
      resources: [
        { title: `GeeksforGeeks: Data Structures & Algorithms`, url: `https://www.geeksforgeeks.org/` },
        { title: `W3Schools: Core Syntax & Practice`, url: `https://www.w3schools.com/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Analyze data structures relevant to ${roleName}`, estimatedHours: 2 },
        { day: 2, task: `Implement algorithmic solutions with Big-O time complexity analysis`, estimatedHours: 2 },
        { day: 3, task: `Structure modular code using standard industry design patterns`, estimatedHours: 2 },
        { day: 4, task: `Write defensive error handling and validation routines`, estimatedHours: 2 },
        { day: 5, task: `Lab: Build a data processing module with comprehensive validation`, estimatedHours: 3 }
      ],
      milestone: `Deliver an algorithmic data processing module with structured error handling.`,
      practiceInterview: false
    },
    {
      week: 3,
      theme: `Week 3 — Frameworks & Ecosystem Libraries`,
      goal: `Learn and apply top industry frameworks and libraries used by professional ${roleName}s.`,
      topics: ['Top Industry Frameworks', 'Dependency Management', 'Component Architecture', 'Configuration Management'],
      resources: [
        { title: `GitHub Trending Repositories for ${roleName}`, url: `https://github.com/trending` },
        { title: `Dev.to Community Tutorials & Case Studies`, url: `https://dev.to/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Install and configure primary framework ecosystem`, estimatedHours: 2 },
        { day: 2, task: `Build modular components adhering to separation of concerns`, estimatedHours: 2 },
        { day: 3, task: `Integrate third-party packages and manage dependencies safely`, estimatedHours: 2 },
        { day: 4, task: `Configure environment variables and external API configs`, estimatedHours: 2 },
        { day: 5, task: `Lab: Deliver a working prototype incorporating the core framework`, estimatedHours: 3 }
      ],
      milestone: `Build a functional prototype leveraging industry standard frameworks.`,
      practiceInterview: false
    },
    {
      week: 4,
      theme: `Week 4 — API Integration, Networking & Mid-Term Review`,
      goal: `Integrate external APIs, handle network requests asynchronously, and test skills.`,
      topics: ['REST & Network Protocols', 'Asynchronous Operations & Concurrency', 'Data Serialization (JSON)', 'Mid-Term Knowledge Check'],
      resources: [
        { title: `Postman Learning Center: API Testing`, url: `https://learning.postman.com/` },
        { title: `HTTP Guidelines & Status Codes`, url: `https://restfulapi.net/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Study networking protocols and asynchronous communication`, estimatedHours: 2 },
        { day: 2, task: `Make asynchronous network requests and parse payloads`, estimatedHours: 2 },
        { day: 3, task: `Implement caching and retry backoff strategies for network resilience`, estimatedHours: 2 },
        { day: 4, task: `Conduct comprehensive mid-term review of weeks 1-3`, estimatedHours: 2 },
        { day: 5, task: `Lab: Complete mid-term milestone and practice mock interview`, estimatedHours: 3 }
      ],
      milestone: `Deliver an API-connected application and complete mid-term practice interview.`,
      practiceInterview: true
    },
    {
      week: 5,
      theme: `Week 5 — Data Persistence & Storage`,
      goal: `Design databases, schema structures, and persistent storage mechanisms.`,
      topics: ['Relational vs NoSQL Storage', 'Schema Design & Indexing', 'CRUD Operations & Transactions', 'Data Security at Rest'],
      resources: [
        { title: `MongoDB University Free Courses`, url: `https://learn.mongodb.com/` },
        { title: `PostgreSQL Official Tutorials`, url: `https://www.postgresqltutorial.com/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Model database schema and define primary/foreign relationships`, estimatedHours: 2 },
        { day: 2, task: `Implement CRUD operations with persistent database connection`, estimatedHours: 2 },
        { day: 3, task: `Write optimized queries and evaluate index performance`, estimatedHours: 2 },
        { day: 4, task: `Secure database connection strings and sensitive credentials`, estimatedHours: 2 },
        { day: 5, task: `Lab: Build a persistent database layer with automated migration scripts`, estimatedHours: 3 }
      ],
      milestone: `Connect persistent database layer with verified CRUD and indexing.`,
      practiceInterview: false
    },
    {
      week: 6,
      theme: `Week 6 — Automated Testing & Quality Assurance`,
      goal: `Implement unit testing, integration tests, and static code quality linting.`,
      topics: ['Unit Testing Frameworks', 'Test Fixtures & Mocks', 'Integration & End-to-End Testing', 'Linting & Static Analysis'],
      resources: [
        { title: `Martin Fowler: Practical Test Pyramid`, url: `https://martinfowler.com/articles/practical-test-pyramid.html` },
        { title: `Jest Testing Framework Guide`, url: `https://jestjs.io/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Write unit tests covering critical business logic paths`, estimatedHours: 2 },
        { day: 2, task: `Set up automated test fixtures and mock external dependencies`, estimatedHours: 2 },
        { day: 3, task: `Execute integration tests validating end-to-end data flow`, estimatedHours: 2 },
        { day: 4, task: `Configure linter and code formatting in pre-commit hooks`, estimatedHours: 2 },
        { day: 5, task: `Lab: Achieve 80%+ test coverage across core application modules`, estimatedHours: 3 }
      ],
      milestone: `Establish automated test suite with 80%+ coverage and automated CI checks.`,
      practiceInterview: false
    },
    {
      week: 7,
      theme: `Week 7 — Security, Optimization & Scalability`,
      goal: `Apply security hardening, caching strategies, and performance benchmarking.`,
      topics: ['Application Security (OWASP Top 10)', 'Performance Profiling & Bottlenecks', 'In-Memory Caching Strategies', 'Concurrency & Load Management'],
      resources: [
        { title: `OWASP Top 10 Security Risks`, url: `https://owasp.org/www-project-top-ten/` },
        { title: `High Performance System Design`, url: `https://github.com/donnemartin/system-design-primer` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Audit codebase against OWASP vulnerabilities and sanitize inputs`, estimatedHours: 2 },
        { day: 2, task: `Profile memory usage, identify bottlenecks, and optimize hotspots`, estimatedHours: 2 },
        { day: 3, task: `Implement caching to reduce redundant computing cycles`, estimatedHours: 2 },
        { day: 4, task: `Stress test application with simulated concurrent users`, estimatedHours: 2 },
        { day: 5, task: `Lab: Demonstrate a measurable performance improvement and secure audit`, estimatedHours: 3 }
      ],
      milestone: `Pass a comprehensive security audit and optimize response benchmarks.`,
      practiceInterview: false
    },
    {
      week: 8,
      theme: `Week 8 — Production Deployment & Final Interview Preparation`,
      goal: `Deploy capstone project live with CI/CD and prepare for technical interviews.`,
      topics: ['Containerization (Docker)', 'CI/CD Automated Deployments', 'Production Monitoring & Health Checks', 'Technical Interview Mastery'],
      resources: [
        { title: `Docker Official Documentation`, url: `https://docs.docker.com/` },
        { title: `Tech Interview Handbook`, url: `https://www.techinterviewhandbook.org/` }
      ],
      dailyBreakdown: [
        { day: 1, task: `Containerize application using production-ready Dockerfile`, estimatedHours: 2 },
        { day: 2, task: `Configure GitHub Actions CI/CD to build and deploy on merge`, estimatedHours: 2 },
        { day: 3, task: `Deploy live to cloud hosting with custom domain and SSL`, estimatedHours: 2 },
        { day: 4, task: `Set up automated health checks and log monitoring`, estimatedHours: 2 },
        { day: 5, task: `Capstone: Deliver live production portfolio project and complete final interview`, estimatedHours: 3 }
      ],
      milestone: `Ship production capstone deployment live and ace the final technical interview.`,
      practiceInterview: true
    }
  ];
}

class RoadmapService {
  /**
   * Generates a personalized roadmap using our authoritative local dataset,
   * stores it in MongoDB, and returns the full roadmap.
   */
  async generateRoadmap(userId: string, profileInput: UserProfileInput) {
    const candidatePaths = [
      path.resolve(__dirname, '../data/roadmaps.json'),
      path.resolve(__dirname, '../../src/data/roadmaps.json'),
      path.resolve(__dirname, '../../dist/data/roadmaps.json'),
      path.resolve(process.cwd(), 'server/src/data/roadmaps.json'),
      path.resolve(process.cwd(), 'src/data/roadmaps.json'),
    ];
    let localData: any = {};
    for (const roadmapsPath of candidatePaths) {
      if (fs.existsSync(roadmapsPath)) {
        try {
          localData = JSON.parse(fs.readFileSync(roadmapsPath, 'utf-8'));
          break;
        } catch (err) {
          console.error('Failed to parse roadmaps.json:', err);
        }
      }
    }

    // Parse experience to Beginner/Intermediate/Experienced
    let expKey = 'Beginner';
    const expLower = String(profileInput.workExperience || '').toLowerCase();
    if (expLower.includes('2') || expLower.includes('3') || expLower.includes('4')) expKey = 'Intermediate';
    if (expLower.includes('5') || expLower.includes('6') || expLower.includes('experienced') || expLower.includes('senior') || expLower.includes('10')) {
      expKey = 'Experienced';
    }

    // Resolve matching role
    const matchedRoleKey = resolveRoleKey(profileInput.desiredRole, localData);
    let rawWeeks: any[] = [];

    if (matchedRoleKey && localData[matchedRoleKey]?.[expKey]) {
      rawWeeks = localData[matchedRoleKey][expKey];
    } else if (matchedRoleKey && localData[matchedRoleKey]?.['Beginner']) {
      rawWeeks = localData[matchedRoleKey]['Beginner'];
    } else {
      // Build bespoke 8-week curriculum for novel or customized roles
      rawWeeks = buildDynamicCustomRoadmap(profileInput.desiredRole);
    }

    // Map into strict WeeklyPlan schema
    const weeklyPlan = rawWeeks.map((item: any, i: number) => {
      return {
        week: item.week || i + 1,
        theme: item.theme || `Week ${i + 1}`,
        goal: item.goal || `Master core competencies for Week ${i + 1}.`,
        topics: Array.isArray(item.topics) ? item.topics : [profileInput.desiredRole],
        resources: Array.isArray(item.resources) ? item.resources : [],
        dailyBreakdown: Array.isArray(item.dailyBreakdown) ? item.dailyBreakdown : [],
        milestone: item.milestone || `Complete Week ${i + 1} practical milestone.`,
        practiceInterview: Boolean(item.practiceInterview),
      };
    });

    const totalWeeks = weeklyPlan.length;

    // Persist to MongoDB
    const doc = await RoadmapProfile.create({
      userId,
      profile: profileInput,
      targetRole: profileInput.desiredRole,
      totalWeeks,
      weeklyPlan,
      keySkillsToLearn: [
        profileInput.desiredRole,
        'System Architecture',
        'Data Modeling & APIs',
        'Automated Testing',
        'Cloud Deployment',
      ],
      estimatedReadinessDate: new Date(Date.now() + totalWeeks * 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      aiSummary: `Tailored ${totalWeeks}-week step-by-step career roadmap for ${profileInput.name} targeting the ${profileInput.desiredRole} role (${expKey} level). Features verified documentation from MDN, official guides, freeCodeCamp, and structured daily engineering milestones.`,
    });

    return this.formatRoadmap(doc);
  }

  /**
   * Retrieves a stored roadmap by MongoDB _id (used as profileId on the client).
   */
  async getRoadmap(profileId: string) {
    const doc = await RoadmapProfile.findById(profileId);
    if (!doc) throw new Error('Roadmap not found');
    return this.formatRoadmap(doc);
  }

  /**
   * Updates the completed tasks map for a roadmap
   */
  async updateProgress(profileId: string, userId: string, completedTasks: Record<string, boolean>) {
    const doc = await RoadmapProfile.findOne({ _id: profileId, userId });
    if (!doc) throw new Error('Roadmap not found or unauthorized');

    doc.completedTasks = new Map(Object.entries(completedTasks));
    await doc.save();

    return this.formatRoadmap(doc);
  }

  private formatRoadmap(doc: any) {
    return {
      profileId: String(doc._id),
      profile: doc.profile,
      targetRole: doc.targetRole,
      totalWeeks: doc.totalWeeks,
      weeklyPlan: doc.weeklyPlan,
      keySkillsToLearn: doc.keySkillsToLearn,
      estimatedReadinessDate: doc.estimatedReadinessDate,
      aiSummary: doc.aiSummary,
      completedTasks: doc.completedTasks ? Object.fromEntries(doc.completedTasks) : {},
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}

export default new RoadmapService();
