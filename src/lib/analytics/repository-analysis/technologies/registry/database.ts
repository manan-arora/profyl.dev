import { TechnologyDefinition } from "../technology-types";

export const databaseTechnologies: TechnologyDefinition[] = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    detection: {
      manifest: {
        npm: ["pg", "postgres"],
        python: ["psycopg", "psycopg2", "psycopg2-binary", "asyncpg"],
        maven: ["org.postgresql:postgresql"],
        gradle: ["org.postgresql:postgresql"],
        go: [
          "github.com/jackc/pgx",
          "github.com/jackc/pgx/v5",
          "github.com/lib/pq",
        ],
      },
    },
    signals: ["Database"],
  },
  {
    id: "mysql",
    name: "MySQL",
    detection: {
      manifest: {
        npm: ["mysql", "mysql2"],
        python: ["mysql-connector-python", "PyMySQL", "mysqlclient"],
        maven: ["com.mysql:mysql-connector-j"],
        gradle: ["com.mysql:mysql-connector-j"],
        go: ["github.com/go-sql-driver/mysql"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "sqlite",
    name: "SQLite",
    detection: {
      manifest: {
        npm: ["better-sqlite3", "sqlite3"],
        python: ["pysqlite3", "pysqlite3-binary"],
        maven: ["org.xerial:sqlite-jdbc"],
        gradle: ["org.xerial:sqlite-jdbc"],
        go: ["modernc.org/sqlite", "github.com/mattn/go-sqlite3"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    detection: {
      manifest: {
        npm: ["mongodb"],
        python: ["pymongo"],
        maven: [
          "org.mongodb:mongodb-driver-sync",
          "org.mongodb:mongodb-driver-reactivestreams",
        ],
        gradle: [
          "org.mongodb:mongodb-driver-sync",
          "org.mongodb:mongodb-driver-reactivestreams",
        ],
        go: ["go.mongodb.org/mongo-driver"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "supabase",
    name: "Supabase",
    detection: {
      manifest: {
        npm: ["@supabase/supabase-js"],
        python: ["supabase"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "prisma",
    name: "Prisma",
    detection: {
      manifest: {
        npm: ["prisma", "@prisma/client"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "drizzle",
    name: "Drizzle",
    detection: {
      manifest: {
        npm: ["drizzle-orm"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "mongoose",
    name: "Mongoose",
    detection: {
      manifest: {
        npm: ["mongoose"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "sequelize",
    name: "Sequelize",
    detection: {
      manifest: {
        npm: ["sequelize"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "typeorm",
    name: "TypeORM",
    detection: {
      manifest: {
        npm: ["typeorm"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "sqlalchemy",
    name: "SQLAlchemy",
    detection: {
      manifest: {
        python: ["SQLAlchemy", "sqlalchemy"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "django-orm",
    name: "Django ORM",
    detection: {},
    signals: ["Database"],
  },
  {
    id: "hibernate",
    name: "Hibernate",
    detection: {
      manifest: {
        maven: ["org.hibernate.orm:hibernate-core"],
        gradle: ["org.hibernate.orm:hibernate-core"],
      },
    },
    signals: ["Database"],
  },
  {
    id: "gorm",
    name: "GORM",
    detection: {
      manifest: {
        go: ["gorm.io/gorm"],
      },
    },
    signals: ["Database"],
  },
];
