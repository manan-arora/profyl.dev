import { TechnologyDefinition } from "../technology-types";

export const aiMlTechnologies: TechnologyDefinition[] = [
  {
    id: "langchain",
    name: "LangChain",
    detection: {
      manifest: {
        npm: ["langchain", "@langchain/core"],
        python: ["langchain", "langchain-core"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "llamaindex",
    name: "LlamaIndex",
    detection: {
      manifest: {
        npm: ["llamaindex", "@llamaindex/core"],
        python: ["llama-index"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "haystack",
    name: "Haystack",
    detection: {
      manifest: {
        python: ["haystack-ai"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "semantic-kernel",
    name: "Semantic Kernel",
    detection: {
      manifest: {
        npm: ["@microsoft/semantic-kernel"],
        python: ["semantic-kernel"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "dspy",
    name: "DSPy",
    detection: {
      manifest: {
        python: ["dspy"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "crewai",
    name: "CrewAI",
    detection: {
      manifest: {
        python: ["crewai"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "chroma",
    name: "Chroma",
    detection: {
      manifest: {
        npm: ["chromadb"],
        python: ["chromadb"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "faiss",
    name: "FAISS",
    detection: {
      manifest: {
        python: ["faiss-cpu", "faiss-gpu"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "pinecone",
    name: "Pinecone",
    detection: {
      manifest: {
        npm: ["@pinecone-database/pinecone"],
        python: ["pinecone"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "qdrant",
    name: "Qdrant",
    detection: {
      manifest: {
        npm: ["@qdrant/js-client-rest"],
        python: ["qdrant-client"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "weaviate",
    name: "Weaviate",
    detection: {
      manifest: {
        npm: ["weaviate-client"],
        python: ["weaviate-client"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "pgvector",
    name: "pgvector",
    detection: {
      manifest: {
        npm: ["pgvector"],
        python: ["pgvector"],
        maven: ["com.pgvector:pgvector"],
        gradle: ["com.pgvector:pgvector"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "pytorch",
    name: "PyTorch",
    detection: {
      manifest: {
        python: ["torch"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    detection: {
      manifest: {
        npm: ["@tensorflow/tfjs"],
        python: ["tensorflow"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "keras",
    name: "Keras",
    detection: {
      manifest: {
        python: ["keras"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "scikit-learn",
    name: "scikit-learn",
    detection: {
      manifest: {
        python: ["scikit-learn"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "huggingface-transformers",
    name: "Hugging Face Transformers",
    detection: {
      manifest: {
        npm: ["@huggingface/transformers"],
        python: ["transformers"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "sentence-transformers",
    name: "Sentence Transformers",
    detection: {
      manifest: {
        python: ["sentence-transformers"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "spacy",
    name: "spaCy",
    detection: {
      manifest: {
        python: ["spacy"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "ollama",
    name: "Ollama",
    detection: {
      manifest: {
        npm: ["ollama"],
        python: ["ollama"],
      },
    },
    signals: ["AI/ML"],
  },
  {
    id: "vllm",
    name: "vLLM",
    detection: {
      manifest: {
        python: ["vllm"],
      },
    },
    signals: ["AI/ML"],
  },
];
