import { TechnologyDefinition } from "../technology-types";

export const authenticationTechnologies: TechnologyDefinition[] = [
  {
    id: "clerk",
    name: "Clerk",
    detection: {
      manifest: {
        npm: [
          "@clerk/nextjs",
          "@clerk/express",
          "@clerk/backend",
          "@clerk/react",
          "@clerk/clerk-react",
        ],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "auth-js",
    name: "Auth.js",
    detection: {
      manifest: {
        npm: ["next-auth", "@auth/core"],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "auth0",
    name: "Auth0",
    detection: {
      manifest: {
        npm: ["@auth0/nextjs-auth0", "auth0"],
        python: ["auth0-python"],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "passport",
    name: "Passport.js",
    detection: {
      manifest: {
        npm: ["passport"],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "better-auth",
    name: "Better Auth",
    detection: {
      manifest: {
        npm: ["better-auth"],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "lucia",
    name: "Lucia",
    detection: {
      manifest: {
        npm: ["lucia"],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "spring-security",
    name: "Spring Security",
    detection: {
      manifest: {
        maven: [
          "org.springframework.boot:spring-boot-starter-security",
          "org.springframework.security:spring-security-core",
        ],
        gradle: [
          "org.springframework.boot:spring-boot-starter-security",
          "org.springframework.security:spring-security-core",
        ],
      },
    },
    signals: ["Authentication"],
  },
  {
    id: "firebase-authentication",
    name: "Firebase Authentication",
    detection: {},
    signals: ["Authentication"],
  },
];
