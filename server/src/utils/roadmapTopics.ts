import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WeekData {
  week: number;
  theme: string;
  goal: string;
  topics: string[];
  milestone?: string;
}

let cachedRoadmaps: Record<string, Record<string, WeekData[]>> | null = null;

function loadRoadmaps(): Record<string, Record<string, WeekData[]>> {
  if (cachedRoadmaps) return cachedRoadmaps;
  const candidatePaths = [
    path.resolve(__dirname, '../data/roadmaps.json'),
    path.resolve(__dirname, '../../src/data/roadmaps.json'),
    path.resolve(__dirname, '../../dist/data/roadmaps.json'),
    path.resolve(process.cwd(), 'server/src/data/roadmaps.json'),
    path.resolve(process.cwd(), 'src/data/roadmaps.json'),
  ];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      try {
        cachedRoadmaps = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return cachedRoadmaps!;
      } catch (err) {
        console.error('Failed to parse roadmaps.json from ' + filePath, err);
      }
    }
  }
  return {};
}

/**
 * Matches user-specified role against authoritative roadmaps dataset.
 */
export function resolveRoleKey(desiredRole: string): string {
  const roadmaps = loadRoadmaps();
  if (roadmaps[desiredRole]) return desiredRole;

  const roleLower = (desiredRole || '').toLowerCase().trim();

  if (roleLower.includes('front') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('web dev')) {
    return 'Frontend Developer';
  }
  if (roleLower.includes('back') || roleLower.includes('node') || roleLower.includes('express') || roleLower.includes('api')) {
    return 'Backend Developer';
  }
  if (roleLower.includes('full') || roleLower.includes('mern') || roleLower.includes('mean')) {
    return 'Full Stack Engineer';
  }
  if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('reliability')) {
    return 'DevOps Engineer';
  }
  if (roleLower.includes('cloud') || roleLower.includes('aws') || roleLower.includes('azure') || roleLower.includes('gcp')) {
    return 'Cloud Engineer';
  }
  if (roleLower.includes('python') || roleLower.includes('django') || roleLower.includes('fastapi')) {
    return 'Python Developer';
  }
  if (roleLower.includes('data anal') || roleLower.includes('bi') || roleLower.includes('analytics')) {
    return 'Data Analyst';
  }
  if (roleLower.includes('data sci') || roleLower.includes('machine learn') || roleLower.includes('ml') || roleLower.includes('ai')) {
    return 'Machine Learning Engineer';
  }

  const keys = Object.keys(roadmaps);
  const found = keys.find(
    (k) =>
      k.toLowerCase() === roleLower ||
      roleLower.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(roleLower)
  );

  return found || 'Frontend Developer';
}

/**
 * Normalizes experience level to Beginner | Intermediate | Experienced.
 */
export function normalizeExperience(exp: string): 'Beginner' | 'Intermediate' | 'Experienced' {
  const lower = (exp || '').toLowerCase();
  if (lower.includes('3') || lower.includes('4') || lower.includes('mid') || lower.includes('intermediate') || lower === '1-2') {
    return 'Intermediate';
  }
  if (lower.includes('5') || lower.includes('6') || lower.includes('senior') || lower.includes('lead') || lower.includes('experienced') || lower.includes('10')) {
    return 'Experienced';
  }
  return 'Beginner';
}

export interface CurriculumContext {
  role: string;
  experience: 'Beginner' | 'Intermediate' | 'Experienced';
  theme: string;
  goal: string;
  topics: string[];
}

/**
 * Extracts relevant learning curriculum topics from roadmaps.json
 */
export function getCurriculumTopics(
  role: string,
  experience: string,
  week?: number
): CurriculumContext {
  const resolvedRole = resolveRoleKey(role);
  const normalizedExp = normalizeExperience(experience);
  const roadmaps = loadRoadmaps();

  const roleData = roadmaps[resolvedRole]?.[normalizedExp] || roadmaps['Frontend Developer']?.[normalizedExp] || [];

  if (week && week > 0 && roleData.length > 0) {
    const specificWeek = roleData.find((w) => w.week === week) || roleData[0];
    return {
      role: resolvedRole,
      experience: normalizedExp,
      theme: specificWeek.theme,
      goal: specificWeek.goal,
      topics: specificWeek.topics,
    };
  }

  // If no specific week requested, aggregate key topics across the early and middle modules
  const allTopics: string[] = [];
  const themes: string[] = [];
  roleData.slice(0, 5).forEach((w) => {
    themes.push(w.theme);
    allTopics.push(...w.topics);
  });

  return {
    role: resolvedRole,
    experience: normalizedExp,
    theme: themes[0] || `${resolvedRole} Comprehensive Technical Curriculum`,
    goal: `Evaluate hands-on technical proficiency across core ${resolvedRole} architectures and patterns.`,
    topics: allTopics.slice(0, 8),
  };
}

/**
 * Curated, deeply technical fallback questions derived directly from the roadmap learning curriculum.
 * Ensures that even in fallback mode, questions are 100% technical, zero generic HR questions.
 */
export function getCuratedTechnicalQuestions(
  role: string,
  experience: string,
  _focusArea?: string
): Array<{
  index: number;
  text: string;
  difficulty: 'Easy' | 'Easy-Medium' | 'Medium' | 'Scenario Based' | 'Behavioral';
  type: string;
  category: string;
}> {
  const resolvedRole = resolveRoleKey(role);
  const normalizedExp = normalizeExperience(experience);

  // Frontend technical question bank
  if (resolvedRole.includes('Frontend')) {
    if (normalizedExp === 'Beginner') {
      return [
        {
          index: 1,
          text: "In the browser rendering pipeline, how does the parsing of HTML and CSS construct the Render Tree, and what triggers a reflow versus a repaint?",
          difficulty: "Easy",
          type: "Technical",
          category: "Browser Architecture & Rendering"
        },
        {
          index: 2,
          text: "When working with CSS layout systems, what is the exact functional difference between CSS Grid 2D track sizing and Flexbox 1D distribution?",
          difficulty: "Easy-Medium",
          type: "Technical",
          category: "CSS Layouts & Responsive Design"
        },
        {
          index: 3,
          text: "Walk me through the JavaScript Event Loop: how does the call stack prioritize microtasks like Promise callbacks versus macrotasks like setTimeout?",
          difficulty: "Medium",
          type: "Technical",
          category: "JavaScript Concurrency & Runtime"
        },
        {
          index: 4,
          text: "Suppose a list of 1000 items renders sluggishly and drops frames when scrolling in React. How would you diagnose whether the bottleneck is DOM thrashing, state re-renders, or un-memoized calculations?",
          difficulty: "Scenario Based",
          type: "Scenario",
          category: "React Performance & Virtualization"
        },
        {
          index: 5,
          text: "When managing component state in modern web applications, how do you decide whether to keep state local with hooks, elevate it through Context, or implement an external state store?",
          difficulty: "Medium",
          type: "Technical",
          category: "State Management Architecture"
        }
      ];
    } else {
      return [
        {
          index: 1,
          text: "How does React 19's compiler and reconciliation algorithm optimize virtual DOM diffing compared to legacy manual useMemo and useCallback memoization?",
          difficulty: "Easy-Medium",
          type: "Technical",
          category: "React Internal Architecture"
        },
        {
          index: 2,
          text: "Explain how Server-Side Rendering with Hydration works under the hood, and what exact conditions cause hydration mismatches between server HTML and client DOM.",
          difficulty: "Medium",
          type: "Technical",
          category: "SSR & Hydration Mechanics"
        },
        {
          index: 3,
          text: "How do you optimize modern web applications for Core Web Vitals, specifically reducing Interaction to Next Paint (INP) and Cumulative Layout Shift (CLS)?",
          difficulty: "Medium",
          type: "Technical",
          category: "Web Performance & Vitals"
        },
        {
          index: 4,
          text: "Your team deploys a single-page app that suffers from a progressive memory leak causing browser tabs to crash after 20 minutes of usage. Walk me through your step-by-step memory heap profiling methodology in Chrome DevTools.",
          difficulty: "Scenario Based",
          type: "Scenario",
          category: "Memory Profiling & Debugging"
        },
        {
          index: 5,
          text: "When architecting micro-frontends or large modular React codebases, what strategies do you use for shared dependency versioning, CSS containment, and cross-module state communication?",
          difficulty: "Medium",
          type: "Technical",
          category: "Frontend System Architecture"
        }
      ];
    }
  }

  // Backend technical question bank
  if (resolvedRole.includes('Backend') || resolvedRole.includes('Python')) {
    return [
      {
        index: 1,
        text: "How does the Node.js or Python runtime handle non-blocking asynchronous I/O under high concurrent load, and what is the role of the OS thread pool in handling file systems versus network sockets?",
        difficulty: "Easy-Medium",
        type: "Technical",
        category: "Asynchronous I/O & Concurrency"
      },
      {
        index: 2,
        text: "In database engineering, explain how B-Tree indexes function internally and why query performance degrades when querying high-cardinality non-indexed columns with OR conditions.",
        difficulty: "Medium",
        type: "Technical",
        category: "Database Indexing & Query Plans"
      },
      {
        index: 3,
        text: "When designing idempotent REST or event-driven APIs, how do you handle duplicate request payloads during client retries or network partition drops?",
        difficulty: "Medium",
        type: "Technical",
        category: "API Design & Idempotency"
      },
      {
        index: 4,
        text: "A microservice experiences sudden P99 latency spikes of 5 seconds under a flash sale traffic surge. How would you investigate whether the bottleneck is database connection pooling, garbage collection pauses, or downstream HTTP timeouts?",
        difficulty: "Scenario Based",
        type: "Scenario",
        category: "System Profiling & Bottlenecks"
      },
      {
        index: 5,
        text: "Compare optimistic locking versus pessimistic locking for preventing race conditions in distributed inventory balances, and explain the trade-offs on database throughput.",
        difficulty: "Medium",
        type: "Technical",
        category: "Distributed Transactions & Concurrency"
      }
    ];
  }

  // DevOps & Cloud technical question bank
  if (resolvedRole.includes('DevOps') || resolvedRole.includes('Cloud')) {
    return [
      {
        index: 1,
        text: "How does Linux containerization utilize namespaces and cgroups under the hood to isolate CPU, memory, and networking between Docker containers?",
        difficulty: "Easy-Medium",
        type: "Technical",
        category: "Containerization & Linux Kernel"
      },
      {
        index: 2,
        text: "In Kubernetes architecture, walk me through what happens behind the scenes from the moment you execute 'kubectl apply' to when the pod is scheduled and running on a worker node.",
        difficulty: "Medium",
        type: "Technical",
        category: "Kubernetes Control Plane"
      },
      {
        index: 3,
        text: "How do you implement zero-downtime blue/green or canary deployments with automated rollback triggers based on Prometheus error-rate metrics?",
        difficulty: "Medium",
        type: "Technical",
        category: "CI/CD & Release Engineering"
      },
      {
        index: 4,
        text: "A production Kubernetes cluster reports CrashLoopBackOff across critical payment service pods following an automated deployment. How do you triage logs, describe pod events, and roll back safely?",
        difficulty: "Scenario Based",
        type: "Scenario",
        category: "Production Incident Management"
      },
      {
        index: 5,
        text: "Explain the architectural trade-offs between deploying services in a centralized Service Mesh like Istio versus utilizing an API Gateway with client-side load balancing.",
        difficulty: "Medium",
        type: "Technical",
        category: "Cloud Networking & Service Mesh"
      }
    ];
  }

  // Data Science / AI / Machine Learning technical question bank
  if (resolvedRole.includes('Data') || resolvedRole.includes('Machine Learning')) {
    return [
      {
        index: 1,
        text: "Explain the mathematical intuition behind the vanishing and exploding gradient problem in deep neural networks, and how residual connections and layer normalization mitigate it.",
        difficulty: "Easy-Medium",
        type: "Technical",
        category: "Deep Learning Foundations"
      },
      {
        index: 2,
        text: "In transformer architectures, walk me through how scaled dot-product self-attention calculates Query, Key, and Value matrices, and why positional embeddings are essential.",
        difficulty: "Medium",
        type: "Technical",
        category: "Transformer Architecture & Attention"
      },
      {
        index: 3,
        text: "How do you detect and mitigate data drift and concept drift in production ML models serving real-time inferences, and what statistical tests do you apply?",
        difficulty: "Medium",
        type: "Technical",
        category: "MLOps & Model Monitoring"
      },
      {
        index: 4,
        text: "Your RAG (Retrieval-Augmented Generation) pipeline hallucinates responses and occasionally fails to retrieve relevant technical documents. How do you evaluate and optimize embedding chunking, similarity metrics, and reranking?",
        difficulty: "Scenario Based",
        type: "Scenario",
        category: "RAG & Vector Search Optimization"
      },
      {
        index: 5,
        text: "Compare LoRA (Low-Rank Adaptation) parameter-efficient fine-tuning with full-parameter fine-tuning of large language models, explaining the memory footprint reduction and rank matrix math.",
        difficulty: "Medium",
        type: "Technical",
        category: "LLM Fine-Tuning & Quantization"
      }
    ];
  }

  // Full Stack general technical fallback
  return [
    {
      index: 1,
      text: `In modern fullstack architecture for a ${resolvedRole}, walk me through the lifecycle of an authenticated request from client-side token storage to server validation and database query execution.`,
      difficulty: "Easy-Medium",
      type: "Technical",
      category: "Fullstack Architecture"
    },
    {
      index: 2,
      text: "How do you prevent SQL injection, cross-site scripting (XSS), and CSRF attacks when building full-stack web applications with REST or GraphQL endpoints?",
      difficulty: "Medium",
      type: "Technical",
      category: "Web Security & Authentication"
    },
    {
      index: 3,
      text: "When designing data models, how do you evaluate whether to store relationship data as embedded subdocuments versus normalized references in NoSQL or relational databases?",
      difficulty: "Medium",
      type: "Technical",
      category: "Database Schema Design"
    },
    {
      index: 4,
      text: "A real-time collaborative feature suffers from WebSocket disconnections and state divergence between clients. How would you design conflict resolution and reconnect state synchronization?",
      difficulty: "Scenario Based",
      type: "Scenario",
      category: "Real-time Distributed Systems"
    },
    {
      index: 5,
      text: "Explain how you architect continuous integration, automated unit and end-to-end testing, and automated deployment pipelines for fullstack repositories.",
      difficulty: "Medium",
      type: "Technical",
      category: "DevOps & Quality Engineering"
    }
  ];
}
