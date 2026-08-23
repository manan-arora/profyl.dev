import { TechnologyDefinition } from "../technology-types";

export const backgroundJobsTechnologies: TechnologyDefinition[] = [
  {
    id: "bullmq",
    name: "BullMQ",
    detection: {
      manifest: {
        npm: ["bullmq"],
      },
    },
    signals: ["Background Jobs"],
  },
  {
    id: "celery",
    name: "Celery",
    detection: {
      manifest: {
        python: ["celery"],
      },
    },
    signals: ["Background Jobs"],
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    detection: {
      manifest: {
        npm: ["amqplib"],
        python: ["pika"],
        maven: ["com.rabbitmq:amqp-client"],
        gradle: ["com.rabbitmq:amqp-client"],
        go: ["github.com/rabbitmq/amqp091-go"],
      },
    },
    signals: ["Background Jobs"],
  },
  {
    id: "kafka",
    name: "Kafka",
    detection: {
      manifest: {
        npm: ["kafkajs"],
        python: ["kafka-python", "confluent-kafka"],
        maven: ["org.apache.kafka:kafka-clients"],
        gradle: ["org.apache.kafka:kafka-clients"],
        go: [
          "github.com/segmentio/kafka-go",
          "github.com/confluentinc/confluent-kafka-go",
        ],
      },
    },
    signals: ["Background Jobs"],
  },
];
