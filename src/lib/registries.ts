export const TECH_STACK_REGISTRY: string[] = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "Kotlin", 
  "Swift", "Dart", "PHP", "Ruby", "Scala", "R", "MATLAB", "Lua", "Perl", "Haskell", 
  "Elixir", "Erlang", "Objective-C", "Bash", "PowerShell", "SQL", "Solidity", "Assembly", 
  "COBOL", "Fortran", "Groovy",
  
  // Frontend / Web
  "HTML", "CSS", "Sass", "Less", "React", "Next.js", "Remix", "React Router", "Vue", "Nuxt", 
  "Angular", "Svelte", "SvelteKit", "Astro", "SolidJS", "Qwik", "Gatsby", "jQuery", "Redux", 
  "Redux Toolkit", "Zustand", "MobX", "TanStack Query", "TanStack Router", "HTMX", "Alpine.js", 
  "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "shadcn/ui", "Ant Design", 
  "Framer Motion", "Three.js", "D3.js", "WebGL", "WebAssembly",
  
  // Backend / APIs
  "Node.js", "Express", "NestJS", "Fastify", "Hono", "Django", "Django REST Framework", 
  "Flask", "FastAPI", "Spring", "Spring Boot", "Spring Security", "ASP.NET", ".NET", 
  "Laravel", "Symfony", "Ruby on Rails", "Gin", "Fiber", "Actix", "Axum", "Phoenix", 
  "GraphQL", "Apollo", "tRPC", "gRPC", "REST", "WebSockets", "Socket.IO", "Prisma", 
  "Drizzle", "SQLAlchemy", "Mongoose", "Entity Framework", "Hibernate",
  
  // Databases / Storage
  "PostgreSQL", "MySQL", "MariaDB", "SQLite", "MongoDB", "Redis", "Cassandra", "CouchDB", 
  "DynamoDB", "Firebase", "Firestore", "Supabase", "Neo4j", "CockroachDB", "PlanetScale", 
  "Elasticsearch", "OpenSearch", "Pinecone", "Weaviate", "Qdrant", "Chroma", "Milvus", 
  "Amazon S3", "Cloudflare R2",
  
  // Cloud / Hosting
  "AWS", "Amazon EC2", "Amazon ECS", "Amazon EKS", "AWS Lambda", "Amazon RDS", "Amazon DynamoDB", 
  "Azure", "Azure Functions", "Azure App Service", "Google Cloud", "Google Cloud Run", 
  "Google Compute Engine", "Google Cloud Functions", "Google Cloud Storage", "Cloudflare", 
  "Cloudflare Workers", "Vercel", "Netlify", "Render", "Railway", "Fly.io", "Heroku", 
  "DigitalOcean",
  
  // DevOps / Infrastructure
  "Docker", "Kubernetes", "Terraform", "Pulumi", "Ansible", "Chef", "Puppet", "Nginx", 
  "Apache", "Caddy", "GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "Argo CD", 
  "Helm", "Prometheus", "Grafana", "Datadog", "OpenTelemetry", "Linux", "Ubuntu",
  
  // AI / Machine Learning
  "PyTorch", "TensorFlow", "Keras", "scikit-learn", "XGBoost", "LightGBM", "Hugging Face", 
  "Transformers", "LangChain", "LangGraph", "LlamaIndex", "OpenAI", "Gemini", "Anthropic", 
  "Claude", "Mistral", "Ollama", "CUDA", "Jupyter", "MLflow", "Weights & Biases", "ONNX",
  
  // Data / Analytics
  "NumPy", "Pandas", "Polars", "Matplotlib", "Plotly", "Seaborn", "Apache Spark", "Apache Kafka", 
  "Apache Flink", "Apache Airflow", "dbt", "Databricks", "Snowflake", "BigQuery", "Tableau", 
  "Power BI", "Looker",
  
  // Mobile
  "Android", "iOS", "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Kotlin Multiplatform", 
  "Ionic", "Expo", "Xamarin", ".NET MAUI",
  
  // Testing
  "Jest", "Vitest", "Mocha", "Chai", "Cypress", "Playwright", "Selenium", "Puppeteer", 
  "Testing Library", "JUnit", "TestNG", "PyTest", "RSpec", "Postman", "Newman",
  
  // Authentication / Security
  "OAuth", "OAuth 2.0", "OpenID Connect", "JWT", "SAML", "Passkeys", "WebAuthn", "Clerk", 
  "Auth0", "Firebase Authentication", "AWS Cognito", "Supabase Auth", "NextAuth",
  
  // Developer Tools / Platforms
  "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "IntelliJ IDEA", "Insomnia", "Figma", 
  "Storybook", "Swagger", "OpenAPI", "Jira", "Notion", "Linear",
  
  // Game Development
  "Unity", "Unreal Engine", "Godot", "GameMaker", "MonoGame", "Phaser",
  
  // Embedded / Hardware / Robotics
  "Arduino", "Raspberry Pi", "ESP32", "STM32", "Arduino IDE", "PlatformIO", "ROS", "ROS 2", 
  "Verilog", "VHDL", "FPGA", "FreeRTOS",
  
  // Blockchain / Web3
  "Ethereum", "Solana", "Polygon", "Hardhat", "Foundry", "Truffle", "Web3.js", "Ethers.js", 
  "Wagmi", "Viem", "IPFS",
  
  // Other Useful Technologies
  "Electron", "Tauri", "Chrome Extensions", "Browser APIs", "OpenGL", "DirectX", "Vulkan", 
  "Qt", "GTK", "RabbitMQ", "Apache ActiveMQ", "NATS"
];

export const TOPICS_REGISTRY: string[] = [
  // Development / Engineering Type
  "Full Stack", "Frontend", "Backend", "Web Development", "Mobile Development", 
  "Desktop Development", "Software Engineering", "Systems Programming", "Application Development", 
  "API Development", "Game Development", "Embedded Systems", "Firmware", "Hardware", 
  "Robotics", "Automation", "Developer Tools", "Developer Experience", "Open Source",
  
  // Application Types
  "Web App", "Mobile App", "Desktop App", "SaaS", "PWA", "CLI", "Browser Extension", 
  "Chrome Extension", "API", "REST API", "GraphQL API", "Microservice", "Library", "SDK", 
  "Framework", "Plugin", "Command Line Tool", "Dashboard", "Admin Panel", "Portfolio", 
  "Landing Page", "E-commerce Platform", "Marketplace", "Social Platform", "Community Platform",
  
  // Core Engineering Concepts
  "Authentication", "Authorization", "User Management", "Role-Based Access Control", 
  "Real-Time", "WebSockets", "API Integration", "Third-Party APIs", "Caching", "Search", 
  "Filtering", "Pagination", "File Uploads", "Image Processing", "Video Processing", 
  "Notifications", "Email", "Payments", "Subscriptions", "Billing", "Analytics", "Logging", 
  "Monitoring", "Background Jobs", "Task Queues", "Scheduling", "Webhooks", "Rate Limiting", 
  "Data Validation", "Error Handling",
  
  // Architecture
  "Monolith", "Microservices", "Serverless", "Distributed Systems", "Event-Driven Architecture", 
  "Service-Oriented Architecture", "Client-Server", "Multi-Tenant", "Scalable Systems", 
  "High Availability", "Fault Tolerance", "Concurrency", "Parallel Computing", "Real-Time Systems", 
  "Edge Computing", "Cloud Computing", "Infrastructure as Code", "CI/CD", "Continuous Deployment",
  
  // Data
  "Data Engineering", "Data Pipelines", "ETL", "ELT", "Data Processing", "Data Analysis", 
  "Data Visualization", "Business Intelligence", "Data Warehousing", "Data Modeling", 
  "Data Streaming", "Real-Time Data", "Data Management", "Recommendation Systems", 
  "Information Retrieval", "Search Engines",
  
  // AI / ML
  "Artificial Intelligence", "Machine Learning", "Deep Learning", "Generative AI", 
  "AI Agents", "AI Automation", "Large Language Models", "Natural Language Processing", 
  "Computer Vision", "Speech Recognition", "Speech Synthesis", "Image Generation", 
  "Text Generation", "RAG", "Retrieval Augmented Generation", "Semantic Search", 
  "Vector Search", "Embeddings", "Fine-Tuning", "Prompt Engineering", "Predictive Analytics", 
  "Anomaly Detection", "Classification", "Regression", "Clustering", "Reinforcement Learning",
  
  // Security
  "Cybersecurity", "Application Security", "Network Security", "Identity Management", 
  "Access Control", "Encryption", "Privacy", "Secure APIs", "Vulnerability Detection", 
  "Security Monitoring",
  
  // Product / Domain
  "E-commerce", "FinTech", "EdTech", "HealthTech", "Social Media", "Social Network", 
  "Productivity", "Education", "Finance", "Healthcare", "Fitness", "Travel", "Food", 
  "Food Delivery", "Transportation", "Logistics", "Real Estate", "News", "Entertainment", 
  "Music", "Sports", "Gaming", "Recruitment", "Career", "Community", "Communication", 
  "Product Management", "Customer Support", "Marketing", "Advertising",
  
  // Common Student / Portfolio Project Themes
  "Task Management", "Project Management", "Expense Tracking", "Budgeting", "Habit Tracking", 
  "Fitness Tracking", "Study Planner", "Learning Platform", "Course Platform", "Quiz Platform", 
  "Online Judge", "Coding Platform", "Job Board", "Resume Builder", "Portfolio Builder", 
  "Blog", "Content Management", "Chat Application", "Messaging", "Video Calling", 
  "URL Shortener", "Password Manager", "Weather App", "News Aggregator", "Movie Database", 
  "Book Management", "Event Management", "Appointment Booking", "Inventory Management", 
  "Order Management", "Food Ordering", "Online Store", "Gateway", "File Sharing", 
  "Cloud Storage", "Image Gallery", "Note Taking", "Calendar", "Collaboration",
  
  // Infrastructure / Engineering Projects
  "Operating Systems", "Networking", "Distributed Computing", "Databases", "Database Systems", 
  "Compilers", "Interpreters", "Programming Languages", "File Systems", "Networking Protocols", 
  "Operating System Concepts", "Virtualization", "Containers", "Container Orchestration", 
  "Cloud Infrastructure", "DevOps", "Observability", "Performance Optimization", 
  "Load Balancing", "Message Queues",
  
  // Other Technical Domains
  "Blockchain", "Web3", "Smart Contracts", "Cryptocurrency", "IoT", "Internet of Things", 
  "Computer Graphics", "3D", "AR", "VR", "Simulation", "Geospatial", "GIS", 
  "Scientific Computing", "Quantum Computing", "Embedded Systems", "Edge AI"
];
