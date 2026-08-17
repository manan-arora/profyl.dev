import { describe, expect, it } from "vitest";
import { GradleParser } from "../gradle-parser";
import { getParser } from "../../parser-registry";

describe("GradleParser", () => {
  const parser = new GradleParser();

  it("1. should extract basic Groovy dependencies", () => {
    const content = `
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web:3.4.0'
  runtimeOnly "org.postgresql:postgresql:42.7.0"
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-web",
      "org.postgresql:postgresql",
    ]);
  });

  it("2. should extract basic Kotlin DSL dependencies", () => {
    const content = `
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-security:3.4.0")
  implementation("org.springframework.kafka:spring-kafka")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-security",
      "org.springframework.kafka:spring-kafka",
    ]);
  });

  it("3. should extract Groovy plugin IDs", () => {
    const content = `
plugins {
  id 'org.springframework.boot' version '3.4.0'
  id "org.jetbrains.kotlin.jvm"
  id 'com.android.application'
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot",
      "org.jetbrains.kotlin.jvm",
      "com.android.application",
    ]);
  });

  it("4. should extract Kotlin plugin IDs", () => {
    const content = `
plugins {
  id("org.springframework.boot") version "3.4.0"
  id("org.jetbrains.kotlin.android")
  id("com.android.application")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot",
      "org.jetbrains.kotlin.android",
      "com.android.application",
    ]);
  });

  it("5. should strip dependency versions from raw identifiers", () => {
    const content = `
dependencies {
  implementation("com.mysql:mysql-connector-j:9.0.0")
  implementation("dev.langchain4j:langchain4j-open-ai:0.36.2")
}
`;

    expect(parser.parse(content)).toEqual([
      "com.mysql:mysql-connector-j",
      "dev.langchain4j:langchain4j-open-ai",
    ]);
  });

  it("6. should preserve dependencies declared without versions", () => {
    const content = `
dependencies {
  implementation("org.postgresql:postgresql")
  runtimeOnly 'io.lettuce:lettuce-core'
}
`;

    expect(parser.parse(content)).toEqual([
      "org.postgresql:postgresql",
      "io.lettuce:lettuce-core",
    ]);
  });

  it("7. should support all allowed dependency configurations", () => {
    const content = `
dependencies {
  implementation("com.google.firebase:firebase-auth:1.0.0")
  api("org.mongodb:mongodb-driver-sync:5.1.0")
  runtimeOnly("redis.clients:jedis:5.2.0")
  compileOnly("jakarta.persistence:jakarta.persistence-api:3.1.0")
  debugImplementation("com.squareup.leakcanary:leakcanary-android:2.14")
  releaseImplementation("com.cloudinary:cloudinary-http44:1.39.0")
  kapt("com.google.dagger:dagger-compiler:2.57")
  ksp("androidx.room:room-compiler:2.7.0")
}
`;

    expect(parser.parse(content)).toEqual([
      "com.google.firebase:firebase-auth",
      "org.mongodb:mongodb-driver-sync",
      "redis.clients:jedis",
      "jakarta.persistence:jakarta.persistence-api",
      "com.squareup.leakcanary:leakcanary-android",
      "com.cloudinary:cloudinary-http44",
      "com.google.dagger:dagger-compiler",
      "androidx.room:room-compiler",
    ]);
  });

  it("8. should ignore test-only dependency configurations", () => {
    const content = `
dependencies {
  testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.11.0")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.6.0")
  testCompile("legacy:test-lib:1.0.0")
  testCompileOnly("legacy:test-only:1.0.0")
  implementation("org.springframework.boot:spring-boot-starter-web:3.4.0")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-web",
    ]);
  });

  it("9. should ignore project dependencies", () => {
    const content = `
dependencies {
  implementation project(':common')
  implementation(project(":feature-auth"))
  api("org.springframework.boot:spring-boot-starter-data-jpa:3.4.0")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-data-jpa",
    ]);
  });

  it("10. should ignore file dependencies", () => {
    const content = `
dependencies {
  implementation files("libs/foo.jar")
  implementation(fileTree("libs"))
  compileOnly("org.jetbrains:annotations:24.1.0")
}
`;

    expect(parser.parse(content)).toEqual(["org.jetbrains:annotations"]);
  });

  it("11. should ignore dynamic and function-based dependencies", () => {
    const content = `
val springBootStarter = "org.springframework.boot:spring-boot-starter-web:3.4.0"

dependencies {
  implementation(springBootStarter)
  implementation(getDependency())
  implementation("org.springframework.boot:spring-boot-starter-\${project.name}")
  implementation("org.springframework.boot:spring-boot-starter-web:3.4.0")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-web",
    ]);
  });

  it("12. should ignore commented plugins and dependencies", () => {
    const content = `
plugins {
  // id("com.google.gms.google-services")
  id("org.jetbrains.kotlin.android")
  /* id("com.android.library") */
}

dependencies {
  // implementation("com.google.firebase:firebase-analytics:22.0.2")
  implementation("androidx.core:core-ktx:1.15.0")
  /*
  implementation("org.apache.kafka:kafka-clients:3.9.0")
  */
}
`;

    expect(parser.parse(content)).toEqual([
      "org.jetbrains.kotlin.android",
      "androidx.core:core-ktx",
    ]);
  });

  it("13. should deduplicate identifiers while preserving first-seen order", () => {
    const content = `
plugins {
  id("org.springframework.boot")
  id("org.springframework.boot")
}

dependencies {
  implementation("org.postgresql:postgresql:42.7.0")
  implementation("org.springframework.boot:spring-boot-starter-web:3.4.0")
  runtimeOnly("org.postgresql:postgresql")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot",
      "org.postgresql:postgresql",
      "org.springframework.boot:spring-boot-starter-web",
    ]);
  });

  it("14. should resolve version-catalog library aliases", () => {
    const content = `
dependencies {
  implementation(libs.postgresql)
  implementation(libs.spring.boot.web)
}
`;

    const versionCatalog = `
[libraries]
postgresql = { module = "org.postgresql:postgresql", version = "42.7.0" }
spring-boot-web = { module = "org.springframework.boot:spring-boot-starter-web", version = "3.4.0" }
`;

    expect(
      parser.parseWithContext(content, {
        manifestPath: "build.gradle.kts",
        gradleVersionCatalogContent: versionCatalog,
      })
    ).toEqual([
      "org.postgresql:postgresql",
      "org.springframework.boot:spring-boot-starter-web",
    ]);
  });

  it("15. should resolve version-catalog plugin aliases", () => {
    const content = `
plugins {
  alias(libs.plugins.spring.boot)
  alias(libs.plugins.kotlin.android)
}
`;

    const versionCatalog = `
[plugins]
spring-boot = { id = "org.springframework.boot", version = "3.4.0" }
kotlin_android = { id = "org.jetbrains.kotlin.android", version = "2.1.0" }
`;

    expect(
      parser.parseWithContext(content, {
        manifestPath: "android/app/build.gradle.kts",
        gradleVersionCatalogContent: versionCatalog,
      })
    ).toEqual([
      "org.springframework.boot",
      "org.jetbrains.kotlin.android",
    ]);
  });

  it("16. should ignore unresolved catalog aliases", () => {
    const content = `
plugins {
  alias(libs.plugins.unknown.plugin)
}

dependencies {
  implementation(libs.unknown.library)
}
`;

    const versionCatalog = `
[libraries]
postgresql = { module = "org.postgresql:postgresql", version = "42.7.0" }
`;

    expect(
      parser.parseWithContext(content, {
        manifestPath: "build.gradle",
        gradleVersionCatalogContent: versionCatalog,
      })
    ).toEqual([]);
  });

  it("17. should parse a realistic Spring Boot project", () => {
    const content = `
plugins {
  id 'org.springframework.boot' version '3.4.0'
  id 'io.spring.dependency-management' version '1.1.7'
  id 'org.jetbrains.kotlin.jvm' version '2.1.0'
  id 'org.jetbrains.kotlin.plugin.spring' version '2.1.0'
}

dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web'
  implementation 'org.springframework.boot:spring-boot-starter-security'
  implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
  implementation 'org.springframework.boot:spring-boot-starter-data-redis'
  implementation 'org.springframework.kafka:spring-kafka'
  implementation 'org.springframework.boot:spring-boot-starter-websocket'
  implementation 'dev.langchain4j:langchain4j-open-ai:0.36.2'
  runtimeOnly 'org.postgresql:postgresql:42.7.0'
  testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot",
      "io.spring.dependency-management",
      "org.jetbrains.kotlin.jvm",
      "org.jetbrains.kotlin.plugin.spring",
      "org.springframework.boot:spring-boot-starter-web",
      "org.springframework.boot:spring-boot-starter-security",
      "org.springframework.boot:spring-boot-starter-data-jpa",
      "org.springframework.boot:spring-boot-starter-data-redis",
      "org.springframework.kafka:spring-kafka",
      "org.springframework.boot:spring-boot-starter-websocket",
      "dev.langchain4j:langchain4j-open-ai",
      "org.postgresql:postgresql",
    ]);
  });

  it("18. should parse a realistic Kotlin Android project", () => {
    const content = `
plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  alias(libs.plugins.google.services)
}

android {
  namespace = "com.example.profyl"
}

dependencies {
  implementation("androidx.core:core-ktx:1.15.0")
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
  implementation(libs.firebase.analytics)
  implementation("com.google.firebase:firebase-auth-ktx:23.1.0")
  debugImplementation("androidx.compose.ui:ui-tooling:1.7.6")
  testImplementation("junit:junit:4.13.2")
}
`;

    const versionCatalog = `
[libraries]
firebase-analytics = { group = "com.google.firebase", name = "firebase-analytics-ktx", version = "22.1.2" }

[plugins]
google-services = { id = "com.google.gms.google-services", version = "4.4.2" }
`;

    expect(
      parser.parseWithContext(content, {
        manifestPath: "android/app/build.gradle.kts",
        gradleVersionCatalogContent: versionCatalog,
      })
    ).toEqual([
      "com.android.application",
      "org.jetbrains.kotlin.android",
      "com.google.gms.google-services",
      "androidx.core:core-ktx",
      "androidx.lifecycle:lifecycle-runtime-ktx",
      "com.google.firebase:firebase-analytics-ktx",
      "com.google.firebase:firebase-auth-ktx",
      "androidx.compose.ui:ui-tooling",
    ]);
  });

  it("19. should extract mixed plugins and dependencies in file order", () => {
    const content = `
dependencies {
  implementation("org.mongodb:mongodb-driver-sync:5.1.0")
}

plugins {
  id("org.jetbrains.kotlin.jvm")
}

dependencies {
  runtimeOnly("com.rabbitmq:amqp-client:5.23.0")
}
`;

    expect(parser.parse(content)).toEqual([
      "org.mongodb:mongodb-driver-sync",
      "org.jetbrains.kotlin.jvm",
      "com.rabbitmq:amqp-client",
    ]);
  });

  it("20. should return an empty array for empty or minimal Gradle files", () => {
    expect(parser.parse("")).toEqual([]);
    expect(parser.parse("plugins {}\ndependencies {}")).toEqual([]);
  });

  it("21. should be available through getParser for both Gradle manifest types", () => {
    expect(getParser("build.gradle")).toBeInstanceOf(GradleParser);
    expect(getParser("build.gradle.kts")).toBeInstanceOf(GradleParser);
  });
});
