import { TechnologyDefinition } from "../technology-types";

export const integrationsTechnologies: TechnologyDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    detection: {
      manifest: {
        npm: ["openai"],
        python: ["openai"],
        maven: ["com.openai:openai-java"],
        go: ["github.com/openai/openai-go"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "google-gemini",
    name: "Google Gemini",
    detection: {
      manifest: {
        npm: ["@google/genai", "@google/generative-ai"],
        python: ["google-genai", "google-generativeai"],
        maven: ["com.google.genai:google-genai"],
        go: ["github.com/google/generative-ai-go"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    detection: {
      manifest: {
        npm: ["@anthropic-ai/sdk"],
        python: ["anthropic"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "groq",
    name: "Groq",
    detection: {
      manifest: {
        npm: ["groq-sdk"],
        python: ["groq"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "mistral",
    name: "Mistral",
    detection: {
      manifest: {
        npm: ["@mistralai/mistralai"],
        python: ["mistralai"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "cohere",
    name: "Cohere",
    detection: {
      manifest: {
        npm: ["cohere-ai"],
        python: ["cohere"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "together-ai",
    name: "Together AI",
    detection: {
      manifest: {
        npm: ["together-ai"],
        python: ["together"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    detection: {
      manifest: {
        npm: ["@ai-sdk/deepseek"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    detection: {
      manifest: {
        npm: ["@perplexity-ai/perplexity_ai", "@ai-sdk/perplexity"],
        python: ["perplexityai"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "stripe",
    name: "Stripe",
    detection: {
      manifest: {
        npm: ["stripe"],
        python: ["stripe"],
        maven: ["com.stripe:stripe-java"],
        gradle: ["com.stripe:stripe-java"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "razorpay",
    name: "Razorpay",
    detection: {
      manifest: {
        npm: ["razorpay"],
        python: ["razorpay"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "paypal",
    name: "PayPal",
    detection: {
      manifest: {
        npm: [
          "@paypal/checkout-server-sdk",
          "@paypal/paypal-server-sdk",
        ],
        python: ["paypalrestsdk"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "nodemailer",
    name: "Nodemailer",
    detection: {
      manifest: {
        npm: ["nodemailer"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "resend",
    name: "Resend",
    detection: {
      manifest: {
        npm: ["resend"],
        python: ["resend"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    detection: {
      manifest: {
        npm: ["@sendgrid/mail"],
        python: ["sendgrid"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "brevo",
    name: "Brevo",
    detection: {
      manifest: {
        npm: ["@getbrevo/brevo"],
        python: ["sib-api-v3-sdk"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "twilio",
    name: "Twilio",
    detection: {
      manifest: {
        npm: ["twilio"],
        python: ["twilio"],
        maven: ["com.twilio.sdk:twilio"],
        gradle: ["com.twilio.sdk:twilio"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    detection: {
      manifest: {
        npm: ["cloudinary"],
        python: ["cloudinary"],
      },
    },
    signals: ["External Integrations"],
  },
  {
    id: "sentry",
    name: "Sentry",
    detection: {
      manifest: {
        npm: ["@sentry/node", "@sentry/nextjs", "@sentry/react"],
        python: ["sentry-sdk"],
      },
    },
    signals: ["External Integrations"],
  },
];
