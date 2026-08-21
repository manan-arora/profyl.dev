import { TechnologyDefinition } from "../technology-types";

export const applicationStackTechnologies: TechnologyDefinition[] = [
  {
    id: "react",
    name: "React",
    detection: {
      manifest: {
        npm: ["react", "react-dom"],
      },
    },
    signals: ["Frontend"],
  },
  {
    id: "vue",
    name: "Vue",
    detection: {
      manifest: {
        npm: ["vue"],
      },
    },
    signals: ["Frontend"],
  },
  {
    id: "angular",
    name: "Angular",
    detection: {
      manifest: {
        npm: ["@angular/core"],
      },
    },
    signals: ["Frontend"],
  },
  {
    id: "svelte",
    name: "Svelte",
    detection: {
      manifest: {
        npm: ["svelte"],
      },
    },
    signals: ["Frontend"],
  },
  {
    id: "nextjs",
    name: "Next.js",
    detection: {
      manifest: {
        npm: ["next"],
      },
    },
    signals: ["Frontend", "Backend"],
  },
  {
    id: "express",
    name: "Express",
    detection: {
      manifest: {
        npm: ["express"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "nestjs",
    name: "NestJS",
    detection: {
      manifest: {
        npm: ["@nestjs/core"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "fastify",
    name: "Fastify",
    detection: {
      manifest: {
        npm: ["fastify"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "django",
    name: "Django",
    detection: {
      manifest: {
        python: ["Django", "django"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "flask",
    name: "Flask",
    detection: {
      manifest: {
        python: ["Flask", "flask"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "fastapi",
    name: "FastAPI",
    detection: {
      manifest: {
        python: ["fastapi"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "spring-boot",
    name: "Spring Boot",
    detection: {
      manifest: {
        maven: [
          "org.springframework.boot:spring-boot-starter",
          "org.springframework.boot:spring-boot-starter-web",
          "org.springframework.boot:spring-boot-starter-webmvc",
        ],
        gradle: [
          "org.springframework.boot:spring-boot-starter",
          "org.springframework.boot:spring-boot-starter-web",
          "org.springframework.boot:spring-boot-starter-webmvc",
        ],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "gin",
    name: "Gin",
    detection: {
      manifest: {
        go: ["github.com/gin-gonic/gin"],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "fiber",
    name: "Fiber",
    detection: {
      manifest: {
        go: [
          "github.com/gofiber/fiber/v2",
          "github.com/gofiber/fiber/v3",
        ],
      },
    },
    signals: ["Backend"],
  },
  {
    id: "echo",
    name: "Echo",
    detection: {
      manifest: {
        go: [
          "github.com/labstack/echo/v4",
          "github.com/labstack/echo/v5",
        ],
      },
    },
    signals: ["Backend"],
  },
];
