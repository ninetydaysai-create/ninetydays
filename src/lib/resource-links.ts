/**
 * Curated resource links per skill/gap category.
 * All links are free, high-quality, and stable.
 * Used to populate gap report resourceLinks instead of leaving them empty.
 */

type ResourceEntry = { url: string; label: string };

const RESOURCE_MAP: Record<string, ResourceEntry[]> = {
  // ── Core Engineering ─────────────────────────────────────────────────────
  "system design": [
    { url: "https://github.com/donnemartin/system-design-primer", label: "System Design Primer (GitHub)" },
    { url: "https://www.youtube.com/@SDFC", label: "System Design Fight Club (YouTube)" },
    { url: "https://highscalability.com", label: "High Scalability — real-world case studies" },
  ],
  "data structures & algorithms": [
    { url: "https://neetcode.io", label: "NeetCode — structured DSA roadmap" },
    { url: "https://leetcode.com/explore/", label: "LeetCode Explore" },
    { url: "https://www.youtube.com/@NeetCode", label: "NeetCode YouTube" },
  ],
  "api design": [
    { url: "https://restfulapi.net", label: "RESTful API Design Guide" },
    { url: "https://google.aip.dev", label: "Google API Improvement Proposals" },
    { url: "https://github.com/microsoft/api-guidelines", label: "Microsoft REST API Guidelines" },
  ],
  "testing": [
    { url: "https://martinfowler.com/articles/practical-test-pyramid.html", label: "Practical Test Pyramid — Martin Fowler" },
    { url: "https://jestjs.io/docs/getting-started", label: "Jest Documentation" },
    { url: "https://testingjavascript.com", label: "Testing JavaScript — Kent C. Dodds" },
  ],
  "performance optimization": [
    { url: "https://web.dev/performance/", label: "Web.dev Performance Guide" },
    { url: "https://brendangregg.com/perf.html", label: "Linux Performance — Brendan Gregg" },
  ],

  // ── Languages ────────────────────────────────────────────────────────────
  "python": [
    { url: "https://docs.python.org/3/tutorial/", label: "Official Python Tutorial" },
    { url: "https://realpython.com", label: "Real Python — practical tutorials" },
    { url: "https://www.youtube.com/@coreyms", label: "Corey Schafer Python (YouTube)" },
  ],
  "typescript": [
    { url: "https://www.typescriptlang.org/docs/handbook/intro.html", label: "TypeScript Handbook" },
    { url: "https://www.totaltypescript.com", label: "Total TypeScript — Matt Pocock" },
  ],
  "javascript": [
    { url: "https://javascript.info", label: "javascript.info — modern JS tutorial" },
    { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", label: "MDN JavaScript Guide" },
  ],
  "go": [
    { url: "https://go.dev/tour/", label: "A Tour of Go" },
    { url: "https://gobyexample.com", label: "Go by Example" },
  ],
  "java": [
    { url: "https://dev.java/learn/", label: "Official Java Learning Path" },
    { url: "https://www.baeldung.com", label: "Baeldung — Java tutorials" },
  ],

  // ── Cloud & Infrastructure ───────────────────────────────────────────────
  "cloud": [
    { url: "https://aws.amazon.com/training/digital/", label: "AWS Digital Training (free)" },
    { url: "https://cloud.google.com/training/free-labs", label: "Google Cloud Free Labs" },
    { url: "https://learn.microsoft.com/en-us/training/azure/", label: "Microsoft Azure Learn" },
  ],
  "aws": [
    { url: "https://aws.amazon.com/training/digital/", label: "AWS Digital Training (free)" },
    { url: "https://www.youtube.com/@awsdevelopers", label: "AWS Developers YouTube" },
  ],
  "docker": [
    { url: "https://docs.docker.com/get-started/", label: "Docker Get Started Guide" },
    { url: "https://www.youtube.com/watch?v=pTFZFxd5uri", label: "Docker in 1 Hour (YouTube)" },
  ],
  "kubernetes": [
    { url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", label: "Kubernetes Basics Tutorial" },
    { url: "https://www.youtube.com/@TechWorldwithNana", label: "TechWorld with Nana (YouTube)" },
  ],
  "terraform": [
    { url: "https://developer.hashicorp.com/terraform/tutorials", label: "HashiCorp Terraform Tutorials" },
  ],

  // ── ML / AI ──────────────────────────────────────────────────────────────
  "machine learning": [
    { url: "https://www.deeplearning.ai", label: "DeepLearning.AI — Andrew Ng courses" },
    { url: "https://scikit-learn.org/stable/getting_started.html", label: "scikit-learn Getting Started" },
    { url: "https://www.youtube.com/@AndrejKarpathy", label: "Andrej Karpathy (YouTube)" },
  ],
  "deep learning": [
    { url: "https://www.fast.ai", label: "fast.ai — practical deep learning" },
    { url: "https://www.youtube.com/@AndrejKarpathy", label: "Andrej Karpathy — Neural Nets Zero to Hero" },
    { url: "https://d2l.ai", label: "Dive into Deep Learning (free book)" },
  ],
  "mlops": [
    { url: "https://ml-ops.org", label: "ml-ops.org — principles and practices" },
    { url: "https://madewithml.com", label: "Made With ML — MLOps course" },
    { url: "https://mlflow.org/docs/latest/index.html", label: "MLflow Documentation" },
  ],
  "llm": [
    { url: "https://www.youtube.com/@AndrejKarpathy", label: "Andrej Karpathy — Build GPT from scratch" },
    { url: "https://python.langchain.com/docs/get_started/introduction", label: "LangChain Documentation" },
    { url: "https://huggingface.co/learn", label: "Hugging Face Courses (free)" },
  ],
  "rag": [
    { url: "https://python.langchain.com/docs/use_cases/question_answering/", label: "LangChain RAG Guide" },
    { url: "https://docs.llamaindex.ai/en/stable/", label: "LlamaIndex Documentation" },
    { url: "https://huggingface.co/learn/cookbook/rag_with_hugging_face_gemma_mongodb", label: "HuggingFace RAG Cookbook" },
  ],
  "feature engineering": [
    { url: "https://www.kaggle.com/learn/feature-engineering", label: "Kaggle Feature Engineering Course (free)" },
    { url: "https://featurestore.org", label: "Feature Store — open source guide" },
  ],
  "model evaluation": [
    { url: "https://scikit-learn.org/stable/modules/model_evaluation.html", label: "scikit-learn Model Evaluation Guide" },
    { url: "https://www.youtube.com/watch?v=85dtiMz9tSo", label: "Model Evaluation Metrics Explained (YouTube)" },
  ],

  // ── Databases ────────────────────────────────────────────────────────────
  "sql": [
    { url: "https://mode.com/sql-tutorial/", label: "Mode SQL Tutorial — analytics focused" },
    { url: "https://sqlzoo.net", label: "SQLZoo — interactive SQL" },
    { url: "https://www.pgexercises.com", label: "PostgreSQL Exercises" },
  ],
  "postgresql": [
    { url: "https://www.postgresql.org/docs/current/tutorial.html", label: "PostgreSQL Official Tutorial" },
    { url: "https://www.pgexercises.com", label: "PostgreSQL Exercises" },
  ],
  "mongodb": [
    { url: "https://learn.mongodb.com", label: "MongoDB University (free)" },
  ],
  "redis": [
    { url: "https://redis.io/docs/", label: "Redis Documentation" },
    { url: "https://try.redis.io", label: "Try Redis — interactive tutorial" },
  ],

  // ── Frontend ─────────────────────────────────────────────────────────────
  "react": [
    { url: "https://react.dev/learn", label: "React Official Docs — Learn React" },
    { url: "https://www.youtube.com/@cosdensolutions", label: "Cosden Solutions React (YouTube)" },
  ],
  "next.js": [
    { url: "https://nextjs.org/docs", label: "Next.js Documentation" },
    { url: "https://nextjs.org/learn", label: "Next.js Learn Course (official)" },
  ],

  // ── Product / Career ─────────────────────────────────────────────────────
  "product sense": [
    { url: "https://www.lennysnewsletter.com", label: "Lenny's Newsletter — product strategy" },
    { url: "https://www.producttalk.org/2021/08/product-discovery/", label: "Continuous Discovery Habits (Teresa Torres)" },
    { url: "https://www.youtube.com/@LennysPodcast", label: "Lenny's Podcast (YouTube)" },
  ],
  "a/b testing": [
    { url: "https://www.exp-platform.com/Documents/GuideControlledExperiments.pdf", label: "Guide to Controlled Experiments (Microsoft)" },
    { url: "https://hookedondata.org/posts/2019-10-31_ab-testing-resources/", label: "A/B Testing Resource List" },
  ],
  "star stories": [
    { url: "https://www.youtube.com/watch?v=0nN7Q7DrI6Q", label: "STAR Method Interview Answers (YouTube)" },
    { url: "https://www.levels.fyi/blog/behavioral-interview-guide.html", label: "Levels.fyi Behavioral Interview Guide" },
  ],
  "behavioral interview": [
    { url: "https://www.techinterviewhandbook.org/behavioral-interview/", label: "Tech Interview Handbook — Behavioral" },
    { url: "https://www.youtube.com/watch?v=0nN7Q7DrI6Q", label: "STAR Method Interview Answers (YouTube)" },
  ],
  "system design interview": [
    { url: "https://github.com/donnemartin/system-design-primer", label: "System Design Primer" },
    { url: "https://www.youtube.com/@SDFC", label: "System Design Fight Club (YouTube)" },
  ],
  "open source contribution": [
    { url: "https://opensource.guide/how-to-contribute/", label: "How to Contribute to Open Source" },
    { url: "https://goodfirstissue.dev", label: "Good First Issue — beginner-friendly issues" },
  ],
  "portfolio project": [
    { url: "https://github.com/practical-tutorials/project-based-learning", label: "Project-Based Learning (GitHub)" },
    { url: "https://www.freecodecamp.org/news/portfolio-app-ideas/", label: "Portfolio Project Ideas — freeCodeCamp" },
  ],
  "resume": [
    { url: "https://www.techinterviewhandbook.org/resume/", label: "Tech Interview Handbook — Resume Guide" },
    { url: "https://www.levels.fyi/blog/resume-writing-guide.html", label: "Levels.fyi Resume Writing Guide" },
  ],
  "ownership language": [
    { url: "https://www.techinterviewhandbook.org/resume/", label: "Tech Interview Handbook — Resume Guide" },
    { url: "https://www.linkedin.com/pulse/how-rewrite-your-resume-product-company-gaurav-malviya/", label: "How to Rewrite Your Resume for Product Companies" },
  ],

  // ── Networking ───────────────────────────────────────────────────────────
  "distributed systems": [
    { url: "https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB", label: "Distributed Systems Lectures (Martin Kleppmann)" },
    { url: "https://github.com/theanalyst/awesome-distributed-systems", label: "Awesome Distributed Systems (GitHub)" },
  ],
  "microservices": [
    { url: "https://martinfowler.com/articles/microservices.html", label: "Microservices — Martin Fowler" },
    { url: "https://microservices.io", label: "microservices.io — patterns and guidance" },
  ],
};

/**
 * Fuzzy lookup: find resource links for a gap label.
 * Checks exact match, then partial match, then keyword match.
 */
export function getResourceLinks(gapLabel: string): string[] {
  const lower = gapLabel.toLowerCase().trim();

  // Exact match
  if (RESOURCE_MAP[lower]) {
    return RESOURCE_MAP[lower].map((r) => r.url);
  }

  // Check if any key is contained in the label or vice versa
  for (const [key, resources] of Object.entries(RESOURCE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return resources.map((r) => r.url);
    }
  }

  // Keyword match — check first word of label
  const firstWord = lower.split(/\s+/)[0];
  for (const [key, resources] of Object.entries(RESOURCE_MAP)) {
    if (key.includes(firstWord) || firstWord.length > 4 && key.split(/\s+/).some((k) => k.includes(firstWord))) {
      return resources.map((r) => r.url);
    }
  }

  return [];
}

/**
 * Enrich a list of gap items with resource links from the curated map.
 */
export function enrichGapsWithLinks<T extends { label: string; resourceLinks: string[] }>(
  gaps: T[]
): T[] {
  return gaps.map((gap) => ({
    ...gap,
    resourceLinks: gap.resourceLinks.length > 0 ? gap.resourceLinks : getResourceLinks(gap.label),
  }));
}
