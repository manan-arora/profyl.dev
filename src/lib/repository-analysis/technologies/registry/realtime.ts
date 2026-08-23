import { TechnologyDefinition } from "../technology-types";

export const realtimeTechnologies: TechnologyDefinition[] = [
  {
    id: "socket-io",
    name: "Socket.IO",
    detection: {
      manifest: {
        npm: ["socket.io", "socket.io-client"],
      },
    },
    signals: ["Real-time"],
  },
  {
    id: "ws",
    name: "ws",
    detection: {
      manifest: {
        npm: ["ws"],
      },
    },
    signals: ["Real-time"],
  },
  {
    id: "pusher",
    name: "Pusher",
    detection: {
      manifest: {
        npm: ["pusher", "pusher-js"],
        python: ["pusher"],
      },
    },
    signals: ["Real-time"],
  },
];
