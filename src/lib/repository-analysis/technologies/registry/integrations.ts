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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    detection: {
      manifest: {
        npm: ["@ai-sdk/deepseek"],
      },
    },
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
  },
  {
    id: "nodemailer",
    name: "Nodemailer",
    detection: {
      manifest: {
        npm: ["nodemailer"],
      },
    },
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
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
    signals: ["External Integration"],
  },
];
