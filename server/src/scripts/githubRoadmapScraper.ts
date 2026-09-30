import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target roles we want to scrape
const TARGET_ROLES = [
  { id: 'frontend', name: 'Frontend Developer' },
  { id: 'backend', name: 'Backend Developer' },
  { id: 'devops', name: 'Cloud Engineer' }, 
  { id: 'python', name: 'Python Developer' },
  { id: 'java', name: 'Java Developer' },
  { id: 'ai-data-scientist', name: 'Data Analyst' }, 
];

const GITHUB_API_BASE = 'https://api.github.com/repos/nilbuild/developer-roadmap/contents/roadmaps';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/roadmaps';

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Node.js Scraper' }
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Node.js Scraper' }
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.text();
}

/**
 * Parses the raw markdown from roadmap.sh into our topic structure
 */
function parseMarkdownContent(markdown: string) {
  const lines = markdown.split('\n');
  let title = 'Unknown Topic';
  let description = '';
  const resources: { title: string, url: string }[] = [];

  let inResourcesSection = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Parse Title
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
      continue;
    }

    // Parse Description (stop collecting when we hit resources or other headers)
    if (line.toLowerCase().includes('visit the following resources') || line.toLowerCase().includes('learn more')) {
      inResourcesSection = true;
      continue;
    }

    if (!inResourcesSection && !line.startsWith('-') && !line.startsWith('#')) {
      description += line + ' ';
    }

    // Parse Links: - [@type@Title](url) or - [Title](url)
    if (inResourcesSection && line.startsWith('- [')) {
      const match = line.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        let resTitle = match[1];
        const resUrl = match[2];
        
        // Remove the @type@ tags like @roadmap@ or @official@
        if (resTitle.startsWith('@') && resTitle.includes('@', 1)) {
          const secondAt = resTitle.indexOf('@', 1);
          resTitle = resTitle.substring(secondAt + 1);
        }
        resources.push({ title: resTitle.trim(), url: resUrl.trim() });
      }
    }
  }

  return {
    topic: title,
    description: description.trim(),
    resources
  };
}

/**
 * Groups a flat list of topics into weekly structures
 */
function distributeIntoWeeks(topics: any[], itemsPerWeek: number) {
  const weeks = [];
  let currentWeek = [];
  let weekNum = 1;

  for (const topic of topics) {
    currentWeek.push(topic);
    if (currentWeek.length >= itemsPerWeek) {
      weeks.push({
        week: weekNum,
        theme: `Week ${weekNum} — ${currentWeek[0].topic}`,
        goal: `Master ${currentWeek.map(t => t.topic).join(', ')}`,
        topics: currentWeek.map(t => t.topic),
        resources: currentWeek.flatMap(t => t.resources),
        dailyBreakdown: currentWeek.flatMap((t, idx) => 
          t.resources.slice(0, 2).map((r: any, rIdx: number) => ({
            day: Math.min((idx * 2) + rIdx + 1, 7),
            task: `Study: ${r.title}`,
            estimatedHours: 2
          }))
        ),
        milestone: `Complete resources for Week ${weekNum}`,
        practiceInterview: weekNum % 4 === 0
      });
      currentWeek = [];
      weekNum++;
    }
  }

  // Handle leftovers
  if (currentWeek.length > 0) {
    weeks.push({
      week: weekNum,
      theme: `Week ${weekNum} — Advanced Topics`,
      goal: `Master ${currentWeek.map(t => t.topic).join(', ')}`,
      topics: currentWeek.map(t => t.topic),
      resources: currentWeek.flatMap(t => t.resources),
      dailyBreakdown: currentWeek.flatMap((t, idx) => 
        t.resources.slice(0, 2).map((r: any, rIdx: number) => ({
          day: Math.min((idx * 2) + rIdx + 1, 7),
          task: `Study: ${r.title}`,
          estimatedHours: 2
        }))
      ),
      milestone: `Complete resources for Week ${weekNum}`,
      practiceInterview: true
    });
  }

  return weeks;
}

async function run() {
  console.log('🚀 Starting GitHub Markdown Scraper for roadmap.sh dataset...');
  const dataset: Record<string, Record<string, any[]>> = {};

  for (const role of TARGET_ROLES) {
    console.log(`\nAnalyzing role: ${role.name} (from ${role.id})`);
    
    try {
      const contentsUrl = `${GITHUB_API_BASE}/${role.id}/content`;
      const files = await fetchJson(contentsUrl);
      
      const topicsData = [];
      // To avoid rate limits, we'll process a maximum of 15 markdown files per role
      const targetFiles = Array.isArray(files) ? files.filter(f => f.name.endsWith('.md')).slice(0, 15) : [];
      
      for (const file of targetFiles) {
        console.log(`  -> Fetching: ${file.name}`);
        const rawUrl = `${GITHUB_RAW_BASE}/${role.id}/content/${encodeURIComponent(file.name)}`;
        const markdown = await fetchText(rawUrl);
        const parsed = parseMarkdownContent(markdown);
        
        // Only include topics with resources
        if (parsed.resources.length > 0) {
          topicsData.push(parsed);
        }
      }

      // We partition the topics into Beginner / Intermediate / Experienced tracks
      // By simply slicing the fetched topics. E.g., first 5 = beginner, next 5 = intermediate.
      const beginnerTopics = topicsData.slice(0, 5);
      const intermediateTopics = topicsData.slice(5, 10);
      const experiencedTopics = topicsData.slice(10, 15);

      dataset[role.name] = {
        'Beginner': distributeIntoWeeks(beginnerTopics, 2),
        'Intermediate': distributeIntoWeeks(intermediateTopics, 2),
        'Experienced': distributeIntoWeeks(experiencedTopics, 2)
      };

      console.log(`  ✓ Successfully scraped and formatted ${topicsData.length} topics for ${role.name}`);

    } catch (error: any) {
      console.warn(`  ⚠️ Failed to scrape ${role.name}: ${error.message}`);
    }
  }

  // Ensure output directory exists
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write the massive JSON dataset
  const outputPath = path.join(dataDir, 'roadmaps.json');
  fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2), 'utf-8');
  console.log(`\n✅ Dataset generated at: ${outputPath}`);
}

run().catch(console.error);
