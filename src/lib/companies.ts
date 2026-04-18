export interface CompanyProfile {
  id: string;
  name: string;
  interviewFocus: string[]; // 3-4 focus areas
  cultureValues: string;    // what they look for culturally
  technicalEmphasis: string; // technical bar description
  uniquePattern: string;    // what makes their interviews unique
  difficulty: "High" | "Very High" | "Extreme";
  interviewRounds: number;
  sampleQuestions: {
    behavioral: string[];    // 3 real behavioral questions this company asks
    system_design: string[]; // 3 real system design questions
    technical: string[];     // 3 technical/ML/coding questions
  };
  whatTheyLookFor: string[]; // 4-5 specific things (beyond generic)
  redFlags: string[];        // 3 things that get candidates rejected at this company
}

export const COMPANIES: CompanyProfile[] = [
  {
    id: "google",
    name: "Google",
    interviewFocus: ["Algorithms & data structures", "System design at planet scale", "Googleyness & leadership", "Role-specific depth"],
    cultureValues:
      "Google looks for intellectual humility, comfort with ambiguity, and a bias toward impact at scale. Candidates must demonstrate that they make those around them better — not just individual brilliance.",
    technicalEmphasis:
      "The coding bar is the highest in the industry. Expect LeetCode hard-level problems with an emphasis on optimal time/space complexity, clean code, and the ability to recognize edge cases without prompting. System design problems focus on Google-scale products: billions of users, globally distributed data, and read/write latency at the 99th percentile.",
    uniquePattern:
      "Google uses a structured hiring committee — no single interviewer makes the call. Each round is scored independently. Interviewers probe breadth and depth simultaneously: they may start a question simple and escalate complexity mid-interview. Behavioral questions map directly to Google's four attributes: general cognitive ability, leadership, Googleyness, and role-related knowledge.",
    difficulty: "Extreme",
    interviewRounds: 5,
    sampleQuestions: {
      behavioral: [
        "You led a project that failed. Walk me through the failure and what you'd do differently.",
        "Tell me about a time you had to push back on a decision made by your manager or a senior stakeholder — and how it turned out.",
        "Describe a situation where you had to deliver a technically complex solution to a non-technical audience. What was your approach and what would you change?",
      ],
      system_design: [
        "Design Google Maps with real-time traffic updates for 1 billion daily active users — cover data ingestion, routing, and consistency.",
        "Design YouTube's video upload and transcoding pipeline that handles 500 hours of video uploaded every minute.",
        "Design a globally distributed key-value store like Bigtable that guarantees strong consistency in any single region while tolerating cross-region partitions.",
      ],
      technical: [
        "Given a stream of integers, design a data structure that returns the median in O(log n) after each insertion.",
        "Implement a distributed rate limiter that works across multiple servers without a shared database and handles clock drift.",
        "You are given a 2D matrix where each cell is either 0 or 1. Find the largest rectangle containing only 1s — optimize for both time and space complexity.",
      ],
    },
    whatTheyLookFor: [
      "Structured thinking over raw cleverness — candidates who state assumptions, define constraints, and walk through trade-offs before writing a single line of code.",
      "Comfort with ambiguity: interviewers deliberately omit requirements to see if you ask the right clarifying questions rather than making silent assumptions.",
      "Scalability instinct — the ability to reason about billions of users and exabyte-scale data as a natural baseline, not an afterthought.",
      "Evidence that you raise the bar for your team — mentorship, code review culture, documentation, and cross-team collaboration are all evaluated.",
      "Intellectual curiosity: interviewers reward candidates who find the question genuinely interesting and explore it beyond what's strictly required.",
    ],
    redFlags: [
      "Jumping straight to code without defining the problem scope — Google interviewers will mark you down for not clarifying requirements and constraints upfront.",
      "Providing O(n²) solutions without proactively attempting to optimize, or claiming a solution is optimal without being able to prove it.",
      "Behavioral answers that use 'we' throughout without ever establishing your specific contribution — the hiring committee needs evidence of individual impact.",
    ],
  },
  {
    id: "meta",
    name: "Meta",
    interviewFocus: ["Product sense & user impact", "Execution & cross-functional influence", "Coding with a focus on speed", "System design with emphasis on real-time at scale"],
    cultureValues:
      "Meta hires for people who move fast, take ownership, and are comfortable with chaos. 'Move fast and break things' is no longer the motto but the instinct remains — they want builders who ship, iterate on data, and are relentlessly focused on impact over process.",
    technicalEmphasis:
      "Coding interviews are conducted on a whiteboard or shared editor and expect candidates to reach a working solution quickly — then optimize. System design at Meta is heavily oriented toward social graph problems, news feed ranking, and real-time messaging infrastructure. Candidates are expected to proactively discuss data modeling, cache invalidation, and consistency trade-offs.",
    uniquePattern:
      "Meta behavioral interviews are almost exclusively about 'Why Meta?' and evidence of past impact stated in quantitative terms. They use a role-play style for product sense — they act as your PM and ask you to make trade-offs live. Interviewers push hard on follow-ups to test whether impact claims are genuine or inflated.",
    difficulty: "Extreme",
    interviewRounds: 5,
    sampleQuestions: {
      behavioral: [
        "Tell me about the most impactful thing you shipped in the last 18 months. What was the measurable outcome?",
        "Describe a time you disagreed with your team's technical direction and what you did about it — specifically what data you used to make your case.",
        "Give me an example of a time you had to move fast and got something wrong. How did you catch it and what did you change in your process?",
      ],
      system_design: [
        "Design Facebook's news feed ranking system that serves 2 billion daily users with personalized content under 200ms.",
        "Design Instagram Stories — cover the upload pipeline, storage at petabyte scale, expiration logic, and global CDN distribution.",
        "Design a real-time group messaging system like Messenger that handles 100M concurrent users with message delivery guarantees.",
      ],
      technical: [
        "Given a social graph represented as an adjacency list, find the shortest path between two users using only connections of mutual friends.",
        "Implement a LRU cache that is thread-safe and handles concurrent reads and writes with minimal lock contention.",
        "Design an algorithm to detect near-duplicate content in a feed of 10 million posts per day — define your similarity threshold and explain the trade-offs.",
      ],
    },
    whatTheyLookFor: [
      "Quantified impact: Meta expects every behavioral answer to include a specific metric — DAU lift, latency reduction, revenue impact. Vague answers about 'improving user experience' are immediately probed.",
      "Speed of execution — they want evidence that you have shipped things quickly, even imperfectly, and then iterated based on data rather than waiting for perfection.",
      "Social graph and feed-ranking intuition — candidates who have never thought about ranking, relevance, or personalization at scale are at a disadvantage regardless of raw coding ability.",
      "Comfort with ambiguity and trade-offs: Meta interviewers explicitly want to see you make a decision with incomplete information rather than asking for more data to avoid commitment.",
      "Cross-functional leadership: evidence that you have driven projects across PM, design, data science, and legal without formal authority.",
    ],
    redFlags: [
      "Behavioral stories that lack numbers — saying 'we improved performance' without specifying how much, for how many users, over what time period is a near-automatic downgrade.",
      "Showing no genuine curiosity about Meta's products during the 'Why Meta?' phase — interviewers can tell within minutes if you haven't used or studied the products.",
      "System design answers that ignore the social graph structure or model Meta's use cases as generic CRUD apps — missing the fanout-on-write vs. fanout-on-read trade-off discussion is a red flag.",
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    interviewFocus: ["Leadership Principles alignment", "Customer obsession", "Operational excellence", "Data-driven decision making"],
    cultureValues:
      "Amazon's 16 Leadership Principles are not decorative — every interview question maps to one or more of them. They hire for Ownership, Bias for Action, Dive Deep, and Deliver Results above all. Candidates who think 'good enough' or defer accountability are filtered out quickly.",
    technicalEmphasis:
      "The coding bar is solid but not as extreme as Google. Amazon focuses on practical engineering: API design, distributed systems reliability, and operational trade-offs such as retries, idempotency, and monitoring. For SDE roles expect two coding rounds. For senior roles expect system design with heavy emphasis on failure modes and operational runbooks.",
    uniquePattern:
      "Amazon uses the STAR format strictly and bar-raisers (senior employees unrelated to the team) sit in every loop. The bar-raiser's vote can veto any other interviewer's positive signal. Expect to provide three or more distinct behavioral examples per principle cited — interviewers are trained to probe until the candidate runs out of stories. Recency and scope of impact matter: 'I led' beats 'we did'.",
    difficulty: "High",
    interviewRounds: 6,
    sampleQuestions: {
      behavioral: [
        "Tell me about a time you took ownership of a problem that wasn't technically your responsibility. What did you do and what was the outcome?",
        "Describe a time you had to make a significant decision with incomplete data. How did you decide and how did it turn out?",
        "Give me an example where you dove deep into data to challenge an assumption your team was making — what did you find?",
      ],
      system_design: [
        "Design Amazon's order management system that handles flash sale events with 10x normal traffic while maintaining idempotency for all financial transactions.",
        "Design a distributed notification system that delivers 500 million push notifications per day with per-user delivery guarantees and deduplication.",
        "Design an inventory reservation system for a marketplace with thousands of third-party sellers — handle race conditions, partial fulfillment, and rollbacks.",
      ],
      technical: [
        "Design an API for a delivery tracking system. Define the endpoints, data models, error handling strategy, and idempotency guarantees.",
        "Implement a retry mechanism with exponential backoff and jitter for a distributed service call — handle partial failures and circuit-breaking.",
        "Given a log file with millions of customer session events, find the top 10 most-visited product pages per customer in a streaming fashion without loading all data into memory.",
      ],
    },
    whatTheyLookFor: [
      "Leadership Principle coverage breadth — interviewers want to see genuine examples for at least 8–10 principles, not recycled stories. Running out of examples is the most common failure mode.",
      "Customer obsession that goes beyond surface-level UX — the ability to connect technical decisions (latency, reliability, error messages) directly to customer impact.",
      "Ownership without authority: evidence that you have fixed problems outside your job description, escalated proactively, and held yourself accountable for outcomes you didn't fully control.",
      "Dive Deep instinct — the ability to discuss the metrics, data, and implementation details of your past work, not just the high-level outcome.",
      "Bar-raiser standard: Amazon evaluates candidates against all current and past employees at the same level — you must be better than at least half of the people already doing that job.",
    ],
    redFlags: [
      "Using the same behavioral story for multiple Leadership Principles — bar-raisers specifically track which examples you reuse and mark it as a signal of limited experience scope.",
      "Behavioral answers that describe what 'the team' did without specifying your individual role — Amazon's LP model requires personal ownership of the outcome.",
      "System design answers that ignore failure modes — if you design a distributed system without addressing retries, idempotency, dead-letter queues, and observability, you are signaling inexperience with production systems.",
    ],
  },
  {
    id: "apple",
    name: "Apple",
    interviewFocus: ["Craftsmanship & attention to detail", "Deep technical expertise in domain", "Collaboration under confidentiality constraints", "Passion for consumer products"],
    cultureValues:
      "Apple values people who care obsessively about quality and are comfortable working in secrecy. The culture rewards craftspeople who push back on 'good enough' and who can collaborate cross-functionally without formal authority. Ego is a disqualifier.",
    technicalEmphasis:
      "Apple's bar is domain-specific. For hardware-adjacent roles, depth in low-level systems, power management, and silicon integration is tested. For software roles, code quality matters more than raw algorithmic speed — expect design-pattern and architecture questions. ML roles focus heavily on on-device inference, CoreML, and model efficiency rather than cloud-scale training.",
    uniquePattern:
      "Apple interviews are famous for being secretive even to candidates — you often don't know the team until late in the process. Interviewers conduct highly detailed technical dives on past projects: they will ask you to draw architecture diagrams of things you built and then probe every design decision. The 'what would you do differently' question is a staple. Cultural fit questions focus on navigating ambiguity without public validation.",
    difficulty: "Very High",
    interviewRounds: 6,
    sampleQuestions: {
      behavioral: [
        "Walk me through the most technically complex project you've built — then tell me specifically what you'd change about the architecture if you were starting today.",
        "Tell me about a time you disagreed with a product decision on quality grounds. How did you raise it and what was the outcome?",
        "Describe a project where you had to maintain strict confidentiality even with team members. How did you manage coordination without disclosing specifics?",
      ],
      system_design: [
        "Design the on-device ML inference pipeline for Apple's real-time photo scene recognition — cover model quantization, memory constraints, thermal management, and fallback behavior.",
        "Design iCloud Photo Library's sync system that handles conflict resolution when the same photo is edited on two devices offline simultaneously.",
        "Design a privacy-preserving differential privacy system for collecting iOS crash analytics at scale without exposing individual user device data.",
      ],
      technical: [
        "Implement a memory-efficient data structure for storing 100 million image embeddings on a device with 4GB RAM — optimize for nearest-neighbor search latency under 50ms.",
        "Design a CoreML model pipeline that switches between a heavy model on AC power and a lightweight quantized model on battery — define the switching logic and state management.",
        "Explain how you would profile and reduce the energy consumption of a Swift background task that performs image analysis — name the specific Instruments profilers and what each measures.",
      ],
    },
    whatTheyLookFor: [
      "Deep ownership of past work — interviewers expect you to know every architectural decision, trade-off, and failure mode of projects you list on your resume, not just the headline outcome.",
      "Quality instinct: the ability to recognize and articulate what 'good enough' would have been and why you chose to go beyond it — Apple filters out candidates who can't distinguish craft from over-engineering.",
      "Domain depth over breadth — Apple values people who are genuinely expert in one area, not generalists who know a little about everything.",
      "Comfort with ambiguity without public validation — Apple's culture requires making decisions and shipping work that you can't discuss externally, and interviewers probe whether you find this energizing or frustrating.",
      "Collaborative ego-free behavior: evidence that you elevate others' work, give credit generously, and receive critical feedback without defensiveness.",
    ],
    redFlags: [
      "Resume items you can't defend in depth — Apple interviewers will spend 15–20 minutes on a single bullet point, and candidates who can only speak to the high-level narrative are quickly identified as having inflated their role.",
      "Showing impatience with the confidential, slow-moving nature of the interview process — Apple reads frustration about 'not knowing the team' as a culture mismatch.",
      "Proposing generic cloud-scale architectures for on-device or hardware-adjacent roles — it signals you haven't understood the specific constraints Apple engineers work within.",
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    interviewFocus: ["Growth mindset demonstration", "Collaborative problem solving", "Engineering fundamentals", "Cross-product impact"],
    cultureValues:
      "Satya Nadella's cultural transformation made growth mindset the central hiring criterion. Microsoft looks for people who learn from failure, seek feedback, and improve incrementally rather than 'know-it-alls'. Empathy and inclusive communication are explicitly valued alongside technical skill.",
    technicalEmphasis:
      "Coding questions are mid-level — LeetCode medium is typical. System design questions focus on Azure-scale services, reliability engineering, and integration across the Microsoft ecosystem. For PM roles, the bar is high on metrics definition and backward-from-customer product thinking. Senior engineering roles include design-for-testability and accessibility considerations.",
    uniquePattern:
      "Microsoft uses an 'as appropriate hire' (AAH) model where one interviewer can designate a candidate as strong enough to hire regardless of others' votes, and one can designate them as a definite no. Behavioral questions always probe for growth mindset: interviewers look for 'what did you learn?' not just 'what did you do?'. Final rounds often include a hiring manager interview focused on career trajectory and team fit.",
    difficulty: "High",
    interviewRounds: 4,
    sampleQuestions: {
      behavioral: [
        "Tell me about a time you received critical feedback that changed how you approach your work. What was the feedback and what specifically did you change?",
        "Describe a project where you had to collaborate across multiple teams with different priorities. How did you align everyone without formal authority?",
        "Tell me about a technical decision you made that turned out to be wrong. How did you identify it, and what did you do to course-correct?",
      ],
      system_design: [
        "Design Microsoft Teams' real-time collaborative document editing system that handles concurrent edits from 50 users with conflict resolution and offline sync.",
        "Design Azure's auto-scaling infrastructure that provisions VM instances in under 60 seconds in response to traffic spikes across 100+ global regions.",
        "Design a multi-tenant data platform on Azure that enforces strict per-tenant data isolation while sharing compute resources efficiently.",
      ],
      technical: [
        "Implement a thread-safe bounded blocking queue in C# or Java without using built-in concurrent collections — explain your synchronization strategy.",
        "Design the schema and query strategy for a multi-tenant SaaS application on Azure SQL Database — handle tenant isolation, performance isolation, and schema migrations.",
        "Given a distributed system where nodes can fail, implement a leader election algorithm using Azure Service Bus — handle split-brain and re-election scenarios.",
      ],
    },
    whatTheyLookFor: [
      "Growth mindset evidence that is specific and recent — interviewers want a concrete example of a time you changed your mind or your method based on new information, not a philosophical statement about valuing learning.",
      "Inclusive collaboration: Microsoft explicitly evaluates whether you make space for others' ideas, credit teammates, and adapt your communication style to your audience.",
      "Azure ecosystem fluency for infrastructure roles — candidates who cannot contextualize their designs within Azure primitives (Service Bus, Cosmos DB, AKS) are at a disadvantage.",
      "Design-for-testability and accessibility as first-class concerns — Microsoft ships to hundreds of millions of users including those with disabilities, and candidates who treat these as afterthoughts are marked down.",
      "Career trajectory clarity — hiring managers want to understand why Microsoft and why this team specifically, not a generic 'I want to work on impactful products' answer.",
    ],
    redFlags: [
      "Behavioral answers that focus on what you did right without discussing what you learned — Microsoft interviewers interpret this as a fixed mindset signal, which is the single biggest culture mismatch.",
      "Technical solutions that ignore testability, observability, or accessibility — these are first-class requirements at Microsoft and omitting them signals inexperience with enterprise-scale software.",
      "Generic 'I love Microsoft Office' answers to 'Why Microsoft?' — interviewers expect you to have a specific opinion on the team's product direction, a recent engineering blog post you found interesting, or a gap in the product you want to solve.",
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    interviewFocus: ["API design & developer experience", "Systems thinking & correctness", "Writing & communication clarity", "Business context awareness"],
    cultureValues:
      "Stripe hires people who care about the quality of the internet's economic infrastructure. They value intellectual rigor, directness, and a deep respect for developers as end users. Candidates must demonstrate both technical depth and the ability to reason about business and user impact simultaneously.",
    technicalEmphasis:
      "Stripe's coding bar emphasizes correctness over speed — they care deeply about edge cases, error handling, and API contracts. Expect questions about idempotency, financial transaction consistency, and distributed systems correctness. System design rounds focus on payment infrastructure: fraud detection, webhook reliability, and multi-currency reconciliation.",
    uniquePattern:
      "Stripe is one of the few companies with a written component — candidates often complete a take-home or async written exercise before the technical loop. Interviewers ask candidates to review and critique code, not just write it. The 'stripe.com/docs' quality standard is real: communication clarity is evaluated as a first-class skill. Interviewers expect candidates to proactively ask about business context before designing a system.",
    difficulty: "Very High",
    interviewRounds: 5,
    sampleQuestions: {
      behavioral: [
        "Tell me about a technical design decision you made that had a significant impact on developer experience — internal or external. What trade-offs did you make?",
        "Describe a time you had to communicate a complex technical failure or limitation to a non-technical stakeholder. What was your approach and what did you learn?",
        "Tell me about a time you pushed for a higher quality standard on a project when there was pressure to ship faster. How did you make the case?",
      ],
      system_design: [
        "Design the payment retry system that handles partial failures across distributed services — cover idempotency keys, exponential backoff, and merchant notification.",
        "Design Stripe's webhook delivery system that guarantees at-least-once delivery to merchant endpoints with variable reliability, handles retries for failed endpoints, and provides delivery status visibility.",
        "Design a real-time fraud detection system that scores each payment transaction in under 50ms using historical user behavior, device fingerprinting, and velocity signals.",
      ],
      technical: [
        "Given a list of financial transactions with potential duplicates (same amount, same merchant, within 5 minutes), implement a deduplication algorithm that is safe to use in a payment processing context.",
        "Review this API endpoint implementation — identify all correctness issues, missing error cases, and API design problems (Stripe gives you actual code to critique).",
        "Design the data model for a multi-currency subscription billing system that handles proration, mid-cycle upgrades, and tax calculation across 30+ jurisdictions.",
      ],
    },
    whatTheyLookFor: [
      "API design sensibility — the ability to design developer-facing interfaces that are intuitive, consistent, and fail gracefully, not just functional. Stripe evaluates this as rigorously as system design.",
      "Financial correctness instinct: candidates who naturally reason about idempotency, double-charge prevention, and eventual consistency in financial contexts rather than treating these as constraints imposed on them.",
      "Written communication that matches stripe.com/docs quality — clear, precise, and structured. The written exercise is a real filter, not a formality.",
      "Business context curiosity: proactively asking 'what type of business is the merchant?' or 'what's the failure cost for a missed payment?' before designing a system is strongly rewarded.",
      "Code review rigor — the ability to identify not just bugs but API contract violations, missing edge cases, and correctness issues that would create subtle financial errors in production.",
    ],
    redFlags: [
      "Designing financial systems without mentioning idempotency — Stripe considers this a fundamental requirement, and omitting it in a payment system design immediately signals inexperience with fintech.",
      "Treating the written exercise as a formality — candidates who submit writing that is vague, unstructured, or shorter than the problem demands are filtered before the technical loop.",
      "Rushing to a solution without asking about business context — Stripe interviewers explicitly want to see you ask 'what does this merchant care most about — speed or guaranteed delivery?' before proposing an architecture.",
    ],
  },
  {
    id: "flipkart",
    name: "Flipkart",
    interviewFocus: ["E-commerce systems at India-scale", "Low-latency, high-throughput backend design", "Ownership and entrepreneurial thinking", "Data structures & algorithms fundamentals"],
    cultureValues:
      "Flipkart values a startup mindset within a large organization. They look for candidates who take full ownership of their problem space, operate with a bias toward speed, and are comfortable making decisions with incomplete information. Humility and team-first behavior are strongly preferred over individual heroics.",
    technicalEmphasis:
      "The coding bar is rigorous — LeetCode medium to hard, with attention to optimal complexity. System design focuses on Flipkart's core domains: catalog management at millions of SKUs, order management at peak sale events (Big Billion Days), and last-mile logistics optimization. Backend candidates are expected to understand eventual consistency trade-offs in high-write systems.",
    uniquePattern:
      "Flipkart interviews include a 'design for Indian market conditions' dimension — intermittent connectivity, feature phones, and Tier-2/3 city users are real constraints. Senior roles include a business impact round where candidates must quantify the value of their past engineering decisions. The interview process is notably fast — often completed within a week — and interviewers reward candidates who think out loud and structure problems collaboratively.",
    difficulty: "High",
    interviewRounds: 4,
    sampleQuestions: {
      behavioral: [
        "Tell me about an engineering decision you made that directly improved a business metric — not just system performance. How did you measure it?",
        "Describe a time you had to deliver a project under a hard deadline (like Big Billion Days). What trade-offs did you make and would you make them again?",
        "Tell me about a time your team disagreed on a technical approach. How did you drive consensus and what was the outcome?",
      ],
      system_design: [
        "Design Flipkart's product catalog system that handles 100 million SKUs with dynamic pricing, real-time inventory updates, and sub-100ms search across Tier-2 city networks.",
        "Design the Big Billion Days order management system that must handle 10x normal order volume in 24 hours with zero data loss and graceful degradation for payment failures.",
        "Design a last-mile delivery optimization system that assigns delivery agents to orders in real time, handles delivery agent unavailability, and adjusts for India's address disambiguation challenges.",
      ],
      technical: [
        "Given a list of 10 million product IDs with their category hierarchy, implement an efficient in-memory data structure that returns all products in a given category subtree in under 10ms.",
        "Design the rate limiting strategy for Flipkart's external seller API that allows burst traffic during sale events while protecting the catalog ingestion pipeline from overload.",
        "Implement a distributed counter for real-time inventory tracking that is eventually consistent across 5 data centers and prevents overselling during flash sales.",
      ],
    },
    whatTheyLookFor: [
      "India-market product instinct — candidates who understand the constraints of Tier-2/3 connectivity, feature-phone users, cash-on-delivery workflows, and low-bandwidth image loading are differentiated.",
      "Quantified business impact: Flipkart senior interviews require you to state the revenue or operational impact of your past engineering work in rupees or percentage terms, not just engineering metrics.",
      "Startup-within-a-company ownership: evidence that you have operated as if the system was yours — on-call ownership, proactive capacity planning, and cross-team coordination without being asked.",
      "Sale-event readiness thinking — the ability to design systems with explicit capacity planning for 10x traffic spikes and graceful degradation is a core competency for Flipkart engineers.",
      "Collaborative problem-solving under pressure: interviewers value candidates who narrate their thinking, invite feedback mid-solution, and adjust gracefully when the interviewer introduces a new constraint.",
    ],
    redFlags: [
      "Designing systems without considering the Indian internet infrastructure context — proposing solutions that assume reliable 4G connectivity, international payment methods, or Western address formats shows lack of product context.",
      "Behavioral answers that can't be quantified — 'we improved the system' without stating the traffic volume, latency improvement, or business outcome is a consistent downgrade signal.",
      "Treating Big Billion Days–style scaling as a generic traffic spike — candidates who don't distinguish predictable peak events (requiring pre-provisioning) from unpredictable spikes show limited operational maturity.",
    ],
  },
  {
    id: "swiggy",
    name: "Swiggy",
    interviewFocus: ["Real-time logistics & marketplace systems", "Data-driven product thinking", "Handling operational chaos at scale", "Engineering for low-bandwidth environments"],
    cultureValues:
      "Swiggy looks for candidates who thrive in ambiguity and can balance speed with reliability. The company values people who are customer-obsessed in a very literal, ground-level sense — understanding the delivery partner experience is as important as understanding the app user. Agility and learning velocity matter more than pedigree.",
    technicalEmphasis:
      "Engineering interviews focus on real-time systems: dispatch algorithms, ETA prediction under uncertainty, and geo-spatial data management. Expect system design questions about surge pricing engines, order batching logic, and catalog synchronization across thousands of restaurant partners. Coding questions are practical — graph problems (shortest path, routing) and data manipulation are common.",
    uniquePattern:
      "Swiggy's interviewers frequently use live Swiggy app scenarios as the basis for design questions — 'how would you redesign the search experience for Swiggy Instamart?' is a real example. Product and engineering interviews are tightly coupled: engineers are expected to discuss product trade-offs and engineers who only think in terms of technical elegance without business impact are filtered. The hiring bar has risen sharply post-2022 as the company scaled.",
    difficulty: "High",
    interviewRounds: 4,
    sampleQuestions: {
      behavioral: [
        "Tell me about a time you improved a system that was causing operational pain for delivery partners or restaurant partners — not just for end users.",
        "Describe a situation where data you were monitoring revealed an operational problem before customers reported it. What did you do with that signal?",
        "Tell me about a time you had to make a product trade-off between delivery partner experience and customer experience. How did you decide?",
      ],
      system_design: [
        "Design Swiggy's real-time order dispatch system that matches delivery partners to orders within 30 seconds, handles partner unavailability mid-delivery, and optimizes for on-time delivery percentage.",
        "Design the surge pricing engine for Swiggy that adjusts delivery fees in real time based on demand-supply ratios per zone, with explainability for the customer-facing UI.",
        "Design the Swiggy Instamart dark store inventory management system that keeps catalog availability accurate within 2 minutes across 500 dark stores with high-velocity stock movements.",
      ],
      technical: [
        "Given a list of delivery partner GPS coordinates updated every 30 seconds and a set of pending orders with geo-coordinates, implement the optimal assignment algorithm minimizing total delivery time.",
        "Design the data pipeline that ingests restaurant menu updates from 200,000 restaurant partners, validates them, and propagates changes to the search index within 5 minutes.",
        "Implement a geohash-based spatial index for finding the nearest available delivery partner within a configurable radius — handle the edge cases at geohash cell boundaries.",
      ],
    },
    whatTheyLookFor: [
      "Three-sided marketplace empathy — Swiggy's product serves customers, restaurant partners, and delivery partners simultaneously. Candidates who can reason about all three stakeholders' incentives in one system design are strongly preferred.",
      "Real-time systems fluency: comfort with event-driven architecture, geo-spatial data, ETA estimation under uncertainty, and the operational realities of a physical logistics network.",
      "Operational chaos tolerance — evidence that you have designed systems that degrade gracefully when a delivery partner goes offline, a restaurant cancels an order mid-preparation, or a payment gateway goes down.",
      "Data-driven iteration: Swiggy values candidates who have used A/B testing, funnel analysis, or driver behavior analytics to make product decisions — not just intuition.",
      "India-internet awareness: designing for low-bandwidth restaurant partner apps, feature-phone delivery partner apps, and spotty GPS signal in dense urban areas is a real constraint.",
    ],
    redFlags: [
      "System designs that treat Swiggy as a simple two-sided marketplace — ignoring the delivery partner as a first-class citizen in the model (capacity, earnings, routing constraints) signals shallow product understanding.",
      "Proposing batch-processing solutions for problems that are explicitly real-time — recommending a nightly job to update restaurant availability or recalculate ETAs is an immediate signal of inexperience with logistics systems.",
      "Inability to discuss the product trade-offs of a technical decision — Swiggy engineers are expected to say 'if we reduce the dispatch timeout from 30s to 20s, we increase cancellations by X%' not just 'it makes the system faster'.",
    ],
  },
  {
    id: "razorpay",
    name: "Razorpay",
    interviewFocus: ["Payments infrastructure & fintech systems", "API design for developer-first products", "Security and compliance awareness", "Scaling transactional systems"],
    cultureValues:
      "Razorpay looks for 'Pirates' — people who challenge the status quo, have a builder's DNA, and care deeply about making financial infrastructure more accessible for Indian businesses. They value radical transparency, high ownership, and a willingness to go deep into unglamorous problem spaces like reconciliation and chargebacks.",
    technicalEmphasis:
      "The technical bar centers on payment system internals: idempotency in financial APIs, distributed transaction management, and settlement workflows. System design questions will often involve building a payment gateway, UPI switch, or subscription billing engine. Security is not optional — expect questions about PCI-DSS implications, token vaults, and fraud signal engineering.",
    uniquePattern:
      "Razorpay's interviews are unusually problem-scenario driven: they describe a real incident (e.g., a settlement discrepancy affecting thousands of merchants) and ask the candidate to debug, resolve, and prevent it. The loop includes a 'build vs. buy' trade-off round for senior candidates. Culture interviews explicitly probe for 'Pirate vs. Navy' personality and whether the candidate has read the company's published engineering blog posts.",
    difficulty: "High",
    interviewRounds: 4,
    sampleQuestions: {
      behavioral: [
        "Tell me about a time you identified a correctness bug in a financial system — not a performance bug. How did you find it, and how did you ensure it was fully resolved and prevented in future?",
        "Describe a time you challenged an existing process or technical approach that was 'working but wrong'. What was the outcome?",
        "Tell me about a 'build vs. buy' decision you faced. How did you evaluate it and what criteria drove the final decision?",
      ],
      system_design: [
        "Design Razorpay's UPI payment switch that processes 10,000 transactions per second with end-to-end idempotency, handles NPCI timeouts gracefully, and produces a zero-discrepancy settlement report.",
        "Design the merchant dashboard's real-time transaction analytics system that shows payment success rates, failure reasons, and refund status updated within 10 seconds of transaction completion.",
        "Design a PCI-DSS compliant card tokenization vault that stores raw card data securely, issues tokens for recurring payments, and supports key rotation without merchant disruption.",
      ],
      technical: [
        "A merchant reports that 3 of their customers were charged twice for the same order during a server restart. Walk through the root cause analysis and the code-level fix that prevents this permanently.",
        "Design the database schema for a multi-currency payment reconciliation system — handle exchange rate snapshots, partial settlements, chargeback deductions, and daily ledger close.",
        "Implement a UPI deep link generator that encodes merchant VPA, amount, and transaction reference — validate inputs against NPCI spec constraints and handle special character encoding safely.",
      ],
    },
    whatTheyLookFor: [
      "Financial correctness obsession — Razorpay's core product is money movement, and candidates who treat idempotency, double-charge prevention, and settlement accuracy as optional edge cases are filtered immediately.",
      "PCI-DSS and security fluency: not just awareness that compliance exists, but the ability to design systems that achieve compliance without creating a developer experience disaster.",
      "Incident debugging mindset — the ability to work backwards from a symptom (settlement discrepancy, duplicate charge, webhook not firing) to a root cause using logs, metrics, and distributed tracing.",
      "Pirate energy without chaos: Razorpay wants builders who move fast and challenge conventions, but within the constraints of financial regulation — candidates who treat compliance as an obstacle rather than a constraint to design within are filtered.",
      "Razorpay product knowledge: interviewers expect candidates to have used the dashboard, read the API docs, and formed genuine opinions on what could be improved — 'I haven't used it much' is a red flag.",
    ],
    redFlags: [
      "Proposing eventually consistent data models for financial transactions — Razorpay requires strong consistency for money movement, and candidates who use 'eventual consistency' for payment records without justification are marked down.",
      "Inability to discuss PCI-DSS at even a surface level — not knowing the difference between tokenization and encryption, or what a cardholder data environment is, signals inexperience with the payments domain.",
      "Behavioral answers that show 'ship and fix later' instincts in a financial context — Razorpay's culture is fast-moving, but not at the cost of financial correctness, and candidates who can't distinguish the two are a culture mismatch.",
    ],
  },
  {
    id: "zepto",
    name: "Zepto",
    interviewFocus: ["Quick-commerce and dark store operations", "Hypergrowth systems engineering", "Speed of execution under pressure", "First-principles product thinking"],
    cultureValues:
      "Zepto is built by and for people who are intensely ambitious and comfortable with extreme pace. They look for candidates who can build 0-to-1 features in days, are not attached to 'best practices' when speed is the constraint, and who fundamentally enjoy solving hard logistical puzzles. The culture is young, intense, and meritocratic.",
    technicalEmphasis:
      "Engineering interviews focus on inventory management systems, dark store layout optimization, and real-time demand forecasting. The technical bar rewards candidates who can propose pragmatic solutions quickly — over-engineering is penalized. Expect questions about cache-first architecture, event-driven inventory updates, and SLA engineering for 10-minute delivery promises.",
    uniquePattern:
      "Zepto moves extremely fast in its hiring process — the entire loop can complete in 2-3 days. Interviewers deliberately throw incomplete problem statements at candidates to test first-principles thinking under ambiguity. For product and senior engineering roles, candidates are asked to propose a new Zepto feature end-to-end, including go-to-market and success metrics, within the interview itself. The ability to reason about unit economics (dark store profitability, per-order contribution margin) is a differentiator.",
    difficulty: "High",
    interviewRounds: 3,
    sampleQuestions: {
      behavioral: [
        "Tell me about the fastest you have ever shipped a meaningful feature end-to-end. What corners did you cut and were they the right corners to cut?",
        "Describe a time you used first-principles thinking to reject an industry best practice. What was your reasoning and what was the outcome?",
        "Tell me about a time you had to make a decision with no time for analysis. What was your heuristic and how did it work out?",
      ],
      system_design: [
        "Design Zepto's real-time inventory allocation system for a 10-minute delivery promise — handle concurrent orders for the same SKU, dark store stock updates, and substitution logic when stock runs out mid-order.",
        "Design the demand forecasting system for Zepto's dark stores that predicts hourly SKU demand 24 hours ahead, using historical sales, weather, and local event signals to minimize both stockouts and waste.",
        "Design the slot booking and dispatch system that guarantees 10-minute delivery SLAs across 300 dark stores — cover delivery partner availability, zone capacity limits, and SLA breach alerting.",
      ],
      technical: [
        "Implement a concurrent inventory reservation system in Go or Java that handles 10,000 requests per second for the same SKU without overselling, using optimistic locking — show the retry logic.",
        "Design the caching strategy for Zepto's product catalog where prices and availability change every 30 seconds — define TTLs, cache invalidation triggers, and the fallback behavior on cache miss.",
        "Given dark store sales data for 50,000 SKUs over 90 days, design a feature pipeline for a demand forecasting ML model — define the features, explain the lag handling strategy, and identify the data leakage risks.",
      ],
    },
    whatTheyLookFor: [
      "Extreme speed bias that still produces working systems — Zepto wants candidates who can ship in days, but they also need those systems to handle the 10-minute delivery SLA under load. Candidates who are fast but sloppy or cautious but thorough are both less interesting than candidates who are fast and correct.",
      "First-principles thinking under time pressure: the ability to decompose a novel problem (e.g., optimizing dark store layout for picking speed) from scratch rather than pattern-matching to a textbook solution.",
      "Unit economics fluency — Zepto's investors and leadership obsess over contribution margin per order, dark store utilization, and waste rates. Engineering candidates who understand how their technical decisions affect these numbers are differentiated.",
      "Ambiguity tolerance: interviewers deliberately give incomplete problem statements and want to see confident, structured thinking rather than paralysis or excessive clarification-seeking.",
      "Hypergrowth systems instinct: the ability to design a system that works now for 300 dark stores but can scale to 3,000 with configuration changes rather than rewrites.",
    ],
    redFlags: [
      "Over-engineering in the interview — proposing microservices, event sourcing, and distributed sagas for a feature that Zepto needs shipped this week signals a mismatch with the company's execution culture.",
      "Inability to reason about unit economics — Zepto interviewers will ask 'does this feature improve contribution margin?' and candidates who have never thought about the business math of a quick-commerce dark store will struggle.",
      "Asking for too much information before attempting a solution — Zepto values candidates who make stated assumptions and move forward, not candidates who wait for a perfect problem statement before thinking.",
    ],
  },
];

export const COMPANY_MAP: Record<string, CompanyProfile> = Object.fromEntries(
  COMPANIES.map((c) => [c.id, c])
);
