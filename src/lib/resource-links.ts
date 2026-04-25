/**
 * Curated resource links per skill/gap category.
 * All links are free, high-quality, and stable.
 *
 * Used in two places:
 *  1. Gap report resourceLinks (via enrichGapsWithLinks)
 *  2. Roadmap task resourceUrls (via enrichTaskResources — REPLACES AI-hallucinated URLs)
 */

type ResourceEntry = { url: string; label: string };

const RESOURCE_MAP: Record<string, ResourceEntry[]> = {
  // ── Core Engineering ─────────────────────────────────────────────────────
  "system design": [
    { url: "https://github.com/donnemartin/system-design-primer", label: "System Design Primer (GitHub)" },
    { url: "https://www.youtube.com/@SDFC", label: "System Design Fight Club (YouTube)" },
    { url: "https://highscalability.com", label: "High Scalability — real-world case studies" },
  ],
  "data structures": [
    { url: "https://neetcode.io", label: "NeetCode — structured DSA roadmap" },
    { url: "https://leetcode.com/explore/", label: "LeetCode Explore" },
    { url: "https://www.youtube.com/@NeetCode", label: "NeetCode YouTube" },
  ],
  "algorithms": [
    { url: "https://neetcode.io", label: "NeetCode — structured DSA roadmap" },
    { url: "https://www.youtube.com/@NeetCode", label: "NeetCode YouTube" },
    { url: "https://leetcode.com/explore/", label: "LeetCode Explore" },
  ],
  "dsa": [
    { url: "https://neetcode.io", label: "NeetCode — structured DSA roadmap" },
    { url: "https://leetcode.com/explore/", label: "LeetCode Explore" },
    { url: "https://www.youtube.com/@NeetCode", label: "NeetCode YouTube" },
  ],
  "leetcode": [
    { url: "https://neetcode.io", label: "NeetCode — curated 150 problems" },
    { url: "https://leetcode.com/study-plan/", label: "LeetCode Study Plans" },
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
  "unit testing": [
    { url: "https://martinfowler.com/articles/practical-test-pyramid.html", label: "Practical Test Pyramid — Martin Fowler" },
    { url: "https://jestjs.io/docs/getting-started", label: "Jest Documentation" },
  ],
  "performance optimization": [
    { url: "https://web.dev/performance/", label: "Web.dev Performance Guide" },
    { url: "https://brendangregg.com/perf.html", label: "Linux Performance — Brendan Gregg" },
  ],
  "concurrency": [
    { url: "https://go.dev/tour/concurrency/1", label: "Go Concurrency Tour" },
    { url: "https://www.youtube.com/watch?v=LvgVSSpwND8", label: "Concurrency in Go (YouTube)" },
  ],
  "design patterns": [
    { url: "https://refactoring.guru/design-patterns", label: "Refactoring Guru — Design Patterns" },
    { url: "https://sourcemaking.com/design_patterns", label: "SourceMaking Design Patterns" },
  ],
  "git": [
    { url: "https://git-scm.com/book/en/v2", label: "Pro Git — free book" },
    { url: "https://learngitbranching.js.org", label: "Learn Git Branching — interactive" },
    { url: "https://ohshitgit.com", label: "Oh Shit, Git! — common fixes" },
  ],
  "ci/cd": [
    { url: "https://docs.github.com/en/actions/quickstart", label: "GitHub Actions Quickstart" },
    { url: "https://www.youtube.com/watch?v=R8_veQiYBjI", label: "GitHub Actions Tutorial (YouTube)" },
    { url: "https://docs.gitlab.com/ee/ci/quick_start/", label: "GitLab CI/CD Quickstart" },
  ],
  "monitoring": [
    { url: "https://sre.google/sre-book/monitoring-distributed-systems/", label: "Google SRE — Monitoring Distributed Systems" },
    { url: "https://grafana.com/docs/grafana/latest/getting-started/", label: "Grafana Getting Started" },
  ],
  "security": [
    { url: "https://owasp.org/www-project-top-ten/", label: "OWASP Top 10" },
    { url: "https://portswigger.net/web-security", label: "PortSwigger Web Security Academy (free)" },
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
  "rust": [
    { url: "https://doc.rust-lang.org/book/", label: "The Rust Programming Language (free book)" },
    { url: "https://rustlings.cool", label: "Rustlings — small exercises" },
  ],
  "c++": [
    { url: "https://learncpp.com", label: "LearnCpp.com — free C++ tutorial" },
    { url: "https://cppreference.com", label: "cppreference.com — reference" },
  ],

  // ── Frameworks ───────────────────────────────────────────────────────────
  "fastapi": [
    { url: "https://fastapi.tiangolo.com/tutorial/", label: "FastAPI Official Tutorial" },
    { url: "https://www.youtube.com/watch?v=0sOvCWFmrtA", label: "FastAPI Full Course (YouTube)" },
  ],
  "django": [
    { url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/", label: "Django Tutorial (official)" },
    { url: "https://www.youtube.com/watch?v=rHux0gMZ3Eg", label: "Django Crash Course (YouTube)" },
  ],
  "flask": [
    { url: "https://flask.palletsprojects.com/en/latest/tutorial/", label: "Flask Tutorial (official)" },
  ],
  "express": [
    { url: "https://expressjs.com/en/starter/installing.html", label: "Express.js Getting Started" },
    { url: "https://www.youtube.com/watch?v=Oe421EPjeBE", label: "Express.js Full Course (YouTube)" },
  ],
  "spring boot": [
    { url: "https://spring.io/guides/gs/spring-boot/", label: "Spring Boot Getting Started (official)" },
    { url: "https://www.baeldung.com/spring-boot", label: "Baeldung — Spring Boot Guides" },
  ],
  "graphql": [
    { url: "https://graphql.org/learn/", label: "GraphQL Official Learn Guide" },
    { url: "https://www.howtographql.com", label: "How to GraphQL — full-stack tutorial" },
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
  "gcp": [
    { url: "https://cloud.google.com/training/free-labs", label: "Google Cloud Free Labs" },
    { url: "https://www.cloudskillsboost.google", label: "Google Cloud Skills Boost" },
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
  "serverless": [
    { url: "https://www.serverless.com/framework/docs/getting-started", label: "Serverless Framework Docs" },
    { url: "https://aws.amazon.com/lambda/getting-started/", label: "AWS Lambda Getting Started" },
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
  "neural network": [
    { url: "https://www.youtube.com/watch?v=VMj-3S1tku0", label: "Neural Nets: Zero to Hero — Karpathy" },
    { url: "https://d2l.ai", label: "Dive into Deep Learning (free book)" },
  ],
  "nlp": [
    { url: "https://huggingface.co/learn/nlp-course/chapter1/1", label: "HuggingFace NLP Course (free)" },
    { url: "https://web.stanford.edu/class/cs224n/", label: "Stanford CS224N — NLP with Deep Learning" },
  ],
  "transformers": [
    { url: "https://huggingface.co/learn/nlp-course/chapter1/1", label: "HuggingFace NLP Course" },
    { url: "https://www.youtube.com/watch?v=4Bdc55j80l8", label: "Attention is All You Need — illustrated (YouTube)" },
    { url: "https://jalammar.github.io/illustrated-transformer/", label: "The Illustrated Transformer (Jay Alammar)" },
  ],
  "pytorch": [
    { url: "https://pytorch.org/tutorials/beginner/basics/intro.html", label: "PyTorch Basics — official tutorial" },
    { url: "https://www.youtube.com/@PythonEngineer", label: "Python Engineer — PyTorch Tutorials (YouTube)" },
    { url: "https://www.fast.ai", label: "fast.ai — practical deep learning with PyTorch" },
  ],
  "tensorflow": [
    { url: "https://www.tensorflow.org/tutorials", label: "TensorFlow Tutorials (official)" },
    { url: "https://www.deeplearning.ai/courses/tensorflow-developer-professional-certificate/", label: "TensorFlow Developer Certificate — DeepLearning.AI" },
  ],
  "mlops": [
    { url: "https://ml-ops.org", label: "ml-ops.org — principles and practices" },
    { url: "https://madewithml.com", label: "Made With ML — MLOps course" },
    { url: "https://mlflow.org/docs/latest/index.html", label: "MLflow Documentation" },
  ],
  "model deployment": [
    { url: "https://madewithml.com", label: "Made With ML — MLOps and deployment" },
    { url: "https://docs.bentoml.com/en/latest/get-started/quickstart.html", label: "BentoML Quickstart" },
    { url: "https://www.youtube.com/watch?v=h5wLuVDr0oc", label: "Deploy ML Models to Production (YouTube)" },
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
  "vector database": [
    { url: "https://docs.pinecone.io/guides/getting-started/quickstart", label: "Pinecone Quickstart" },
    { url: "https://www.trychroma.com/getting-started", label: "Chroma Getting Started (open-source)" },
  ],
  "feature engineering": [
    { url: "https://www.kaggle.com/learn/feature-engineering", label: "Kaggle Feature Engineering Course (free)" },
  ],
  "model evaluation": [
    { url: "https://scikit-learn.org/stable/modules/model_evaluation.html", label: "scikit-learn Model Evaluation Guide" },
  ],
  "statistics": [
    { url: "https://www.khanacademy.org/math/statistics-probability", label: "Khan Academy Statistics (free)" },
    { url: "https://seeing-theory.brown.edu", label: "Seeing Theory — visual probability & stats" },
  ],
  "probability": [
    { url: "https://seeing-theory.brown.edu", label: "Seeing Theory — visual probability" },
    { url: "https://www.khanacademy.org/math/statistics-probability/probability-library", label: "Khan Academy Probability (free)" },
  ],
  "linear algebra": [
    { url: "https://www.3blue1brown.com/topics/linear-algebra", label: "3Blue1Brown — Essence of Linear Algebra (YouTube)" },
    { url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", label: "MIT 18.06 Linear Algebra (free)" },
  ],
  "computer vision": [
    { url: "https://cs231n.github.io", label: "Stanford CS231n — Convolutional Neural Networks" },
    { url: "https://docs.ultralytics.com", label: "Ultralytics YOLO Docs (object detection)" },
  ],
  "data analysis": [
    { url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", label: "Pandas Getting Started Tutorial" },
    { url: "https://www.kaggle.com/learn/pandas", label: "Kaggle Pandas Course (free)" },
    { url: "https://realpython.com/pandas-dataframe/", label: "Real Python — Pandas DataFrames" },
  ],
  "numpy": [
    { url: "https://numpy.org/doc/stable/user/quickstart.html", label: "NumPy Quickstart Tutorial" },
    { url: "https://www.kaggle.com/learn/numpy", label: "Kaggle NumPy Course (free)" },
  ],
  "pandas": [
    { url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", label: "Pandas Getting Started Tutorial" },
    { url: "https://www.kaggle.com/learn/pandas", label: "Kaggle Pandas Course (free)" },
  ],
  "time series": [
    { url: "https://www.kaggle.com/learn/time-series", label: "Kaggle Time Series Course (free)" },
    { url: "https://otexts.com/fpp3/", label: "Forecasting: Principles and Practice (free book)" },
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
  "database design": [
    { url: "https://www.vertabelo.com/blog/vertabelo-academy-blog/", label: "Vertabelo — Database Design Articles" },
    { url: "https://use-the-index-luke.com", label: "Use The Index, Luke — SQL Performance Explained" },
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
  "tailwind": [
    { url: "https://tailwindcss.com/docs/installation", label: "Tailwind CSS Documentation" },
    { url: "https://www.youtube.com/watch?v=pfaSUYaSgRo", label: "Tailwind CSS Crash Course (YouTube)" },
  ],
  "web performance": [
    { url: "https://web.dev/performance/", label: "Web.dev Performance Guide" },
    { url: "https://developer.chrome.com/docs/devtools/performance/", label: "Chrome DevTools Performance" },
  ],

  // ── Product / Career ─────────────────────────────────────────────────────
  "product sense": [
    { url: "https://www.lennysnewsletter.com", label: "Lenny's Newsletter — product strategy" },
    { url: "https://www.producttalk.org/2021/08/product-discovery/", label: "Continuous Discovery Habits (Teresa Torres)" },
    { url: "https://www.youtube.com/@LennysPodcast", label: "Lenny's Podcast (YouTube)" },
  ],
  "metrics": [
    { url: "https://www.lennysnewsletter.com/p/what-is-a-north-star-metric", label: "North Star Metric — Lenny's Newsletter" },
    { url: "https://mixpanel.com/blog/key-product-metrics/", label: "Key Product Metrics — Mixpanel" },
  ],
  "a/b testing": [
    { url: "https://www.exp-platform.com/Documents/GuideControlledExperiments.pdf", label: "Guide to Controlled Experiments (Microsoft)" },
    { url: "https://hookedondata.org/posts/2019-10-31_ab-testing-resources/", label: "A/B Testing Resource List" },
  ],
  "star stories": [
    { url: "https://www.techinterviewhandbook.org/behavioral-interview/", label: "Tech Interview Handbook — Behavioral" },
    { url: "https://www.youtube.com/watch?v=0nN7Q7DrI6Q", label: "STAR Method Interview Answers (YouTube)" },
  ],
  "behavioral interview": [
    { url: "https://www.techinterviewhandbook.org/behavioral-interview/", label: "Tech Interview Handbook — Behavioral" },
    { url: "https://www.levels.fyi/blog/behavioral-interview-guide.html", label: "Levels.fyi Behavioral Interview Guide" },
  ],
  "mock interview": [
    { url: "https://www.techinterviewhandbook.org/coding-interview-prep/", label: "Tech Interview Handbook — Coding Prep" },
    { url: "https://interviewing.io", label: "interviewing.io — free mock interviews" },
    { url: "https://www.pramp.com", label: "Pramp — free peer mock interviews" },
  ],
  "system design interview": [
    { url: "https://github.com/donnemartin/system-design-primer", label: "System Design Primer" },
    { url: "https://www.youtube.com/@SDFC", label: "System Design Fight Club (YouTube)" },
    { url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", label: "Hello Interview — System Design" },
  ],
  "open source": [
    { url: "https://opensource.guide/how-to-contribute/", label: "How to Contribute to Open Source" },
    { url: "https://goodfirstissue.dev", label: "Good First Issue — beginner-friendly issues" },
  ],
  "portfolio": [
    { url: "https://github.com/practical-tutorials/project-based-learning", label: "Project-Based Learning (GitHub)" },
    { url: "https://www.freecodecamp.org/news/portfolio-app-ideas/", label: "Portfolio Project Ideas — freeCodeCamp" },
  ],
  "resume": [
    { url: "https://www.techinterviewhandbook.org/resume/", label: "Tech Interview Handbook — Resume Guide" },
    { url: "https://www.levels.fyi/blog/resume-writing-guide.html", label: "Levels.fyi Resume Writing Guide" },
  ],
  "ownership language": [
    { url: "https://www.techinterviewhandbook.org/resume/", label: "Tech Interview Handbook — Resume Guide" },
    { url: "https://thetechresume.com", label: "The Tech Resume Inside Out (free online)" },
  ],
  "linkedin": [
    { url: "https://www.linkedin.com/business/talent/blog/linkedin-best-practices/linkedin-profile-tips", label: "LinkedIn Profile Tips (official)" },
    { url: "https://www.techinterviewhandbook.org/landscape/", label: "Tech Interview Handbook — Job Search" },
  ],
  "job search": [
    { url: "https://www.techinterviewhandbook.org/landscape/", label: "Tech Interview Handbook — Job Search" },
    { url: "https://www.levels.fyi", label: "Levels.fyi — compensation data" },
    { url: "https://www.ycombinator.com/jobs", label: "YC Jobs — startup job board" },
  ],
  "networking": [
    { url: "https://www.techinterviewhandbook.org/networking/", label: "Tech Interview Handbook — Networking" },
    { url: "https://www.lennysnewsletter.com/p/how-to-get-into-product-management", label: "How to Get Into Product — Lenny" },
  ],
  "salary negotiation": [
    { url: "https://www.levels.fyi", label: "Levels.fyi — comp benchmarks" },
    { url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/", label: "Salary Negotiation — Patrick McKenzie" },
  ],

  // ── Distributed Systems ──────────────────────────────────────────────────
  "distributed systems": [
    { url: "https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB", label: "Distributed Systems Lectures (Martin Kleppmann)" },
    { url: "https://github.com/theanalyst/awesome-distributed-systems", label: "Awesome Distributed Systems (GitHub)" },
    { url: "https://dataintensive.net", label: "Designing Data-Intensive Applications (DDIA)" },
  ],
  "microservices": [
    { url: "https://martinfowler.com/articles/microservices.html", label: "Microservices — Martin Fowler" },
    { url: "https://microservices.io", label: "microservices.io — patterns and guidance" },
  ],
  "kafka": [
    { url: "https://kafka.apache.org/quickstart", label: "Apache Kafka Quickstart" },
    { url: "https://www.youtube.com/watch?v=R873BlNVUB4", label: "Apache Kafka Crash Course (YouTube)" },
  ],
  "message queue": [
    { url: "https://www.rabbitmq.com/tutorials/tutorial-one-python", label: "RabbitMQ Tutorial" },
    { url: "https://kafka.apache.org/quickstart", label: "Apache Kafka Quickstart" },
  ],
  "caching": [
    { url: "https://redis.io/docs/", label: "Redis Documentation" },
    { url: "https://aws.amazon.com/caching/best-practices/", label: "AWS Caching Best Practices" },
  ],
  "load balancing": [
    { url: "https://nginx.org/en/docs/beginners_guide.html", label: "NGINX Beginner's Guide" },
    { url: "https://aws.amazon.com/elasticloadbalancing/getting-started/", label: "AWS Load Balancing Getting Started" },
  ],
};

// ── Lookup helpers ────────────────────────────────────────────────────────────

function findMatch(query: string): ResourceEntry[] | null {
  const lower = query.toLowerCase().trim();
  if (!lower) return null;

  // 1. Exact match
  if (RESOURCE_MAP[lower]) return RESOURCE_MAP[lower];

  // 2. Key contained in query or query contained in key
  for (const [key, resources] of Object.entries(RESOURCE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return resources;
  }

  // 3. Any word from query matches any word in a key
  const queryWords = lower.split(/\W+/).filter((w) => w.length > 3);
  for (const qw of queryWords) {
    for (const [key, resources] of Object.entries(RESOURCE_MAP)) {
      const keyWords = key.split(/\W+/);
      if (keyWords.some((kw) => kw === qw || kw.includes(qw) || qw.includes(kw))) {
        return resources;
      }
    }
  }

  return null;
}

/**
 * Returns curated URLs for a given gap/skill label.
 * Used by gap reports.
 */
export function getResourceLinks(gapLabel: string): string[] {
  return findMatch(gapLabel)?.map((r) => r.url) ?? [];
}

/**
 * Produces final resourceUrls for a roadmap task.
 *
 * Strategy (in priority order):
 *  1. Curated match on gapLabel
 *  2. Curated match on task label
 *  3. Curated match on individual words from the label
 *  4. Guaranteed-working search fallbacks (YouTube + GitHub search)
 *
 * NEVER returns AI-hallucinated URLs — caller should ignore the AI's resourceUrls entirely.
 */
export function enrichTaskResources(
  taskLabel: string,
  gapLabel?: string | null
): string[] {
  // 1. Try gapLabel
  if (gapLabel) {
    const m = findMatch(gapLabel);
    if (m) return m.slice(0, 3).map((r) => r.url);
  }

  // 2. Try task label as-is
  const m = findMatch(taskLabel);
  if (m) return m.slice(0, 3).map((r) => r.url);

  // 3. Try each meaningful word in the task label
  const words = taskLabel.split(/\W+/).filter((w) => w.length > 3);
  for (const word of words) {
    const wm = findMatch(word);
    if (wm) return wm.slice(0, 3).map((r) => r.url);
  }

  // 4. Fallback: search URLs — always valid, always relevant
  const q = encodeURIComponent(taskLabel);
  return [
    `https://www.youtube.com/results?search_query=${q}+tutorial`,
    `https://github.com/search?q=${q}&type=repositories&sort=stars`,
  ];
}

/**
 * Enrich gap items with curated resource links.
 * Used by gap reports.
 */
export function enrichGapsWithLinks<T extends { label: string; resourceLinks: string[] }>(
  gaps: T[]
): T[] {
  return gaps.map((gap) => ({
    ...gap,
    resourceLinks: gap.resourceLinks.length > 0 ? gap.resourceLinks : getResourceLinks(gap.label),
  }));
}
