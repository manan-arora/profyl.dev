import { describe, it, expect } from "vitest";
import { PomXmlParser } from "../pom-xml-parser";
import { getParser } from "../../parser-registry";

describe("PomXmlParser", () => {
  const parser = new PomXmlParser();

  it("1. should extract basic dependencies as groupId:artifactId", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <version>3.4.0</version>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <version>42.7.0</version>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-web",
      "org.postgresql:postgresql",
    ]);
  });

  it("2. should ignore version values and include default, compile, runtime, and provided scopes", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>no-scope</artifactId>
      <version>\${example.version}</version>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>compile-scope</artifactId>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>runtime-scope</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>jakarta.servlet</groupId>
      <artifactId>jakarta.servlet-api</artifactId>
      <scope>provided</scope>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual([
      "com.example:no-scope",
      "com.example:compile-scope",
      "com.example:runtime-scope",
      "jakarta.servlet:jakarta.servlet-api",
    ]);
  });

  it("3. should exclude test and system scoped dependencies", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>com.oracle</groupId>
      <artifactId>ojdbc8</artifactId>
      <scope>system</scope>
    </dependency>
    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-api</artifactId>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual(["org.slf4j:slf4j-api"]);
  });

  it("4. should ignore exclusions, dependencyManagement, parent, and build plugins", () => {
    const content = `
<project>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
  </parent>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.fasterxml.jackson</groupId>
        <artifactId>jackson-bom</artifactId>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
      <exclusions>
        <exclusion>
          <groupId>com.example</groupId>
          <artifactId>excluded-lib</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <dependencies>
          <dependency>
            <groupId>com.example</groupId>
            <artifactId>plugin-dependency</artifactId>
          </dependency>
        </dependencies>
      </plugin>
    </plugins>
  </build>
</project>
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-data-jpa",
    ]);
  });

  it("5. should skip dependencies missing groupId or artifactId", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <artifactId>missing-group</artifactId>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>valid</artifactId>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual(["com.example:valid"]);
  });

  it("6. should skip property-based groupId or artifactId values", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>\${dynamic.group}</groupId>
      <artifactId>artifact-one</artifactId>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>\${dynamic.artifact}</artifactId>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>static-artifact</artifactId>
      <version>\${dynamic.version}</version>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual(["com.example:static-artifact"]);
  });

  it("7. should deduplicate dependencies while preserving first-seen order", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual([
      "org.springframework.boot:spring-boot-starter-web",
      "org.postgresql:postgresql",
    ]);
  });

  it("8. should handle a single dependency object", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-core</artifactId>
    </dependency>
  </dependencies>
</project>
`;

    expect(parser.parse(content)).toEqual(["org.flywaydb:flyway-core"]);
  });

  it("9. should return an empty array when no direct dependencies section exists", () => {
    const content = `
<project>
  <modelVersion>4.0.0</modelVersion>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`;

    expect(parser.parse(content)).toEqual([]);
  });

  it("10. should support namespace-prefixed tags by removing prefixes during parsing", () => {
    const content = `
<m:project xmlns:m="http://maven.apache.org/POM/4.0.0">
  <m:dependencies>
    <m:dependency>
      <m:groupId>org.example</m:groupId>
      <m:artifactId>demo</m:artifactId>
    </m:dependency>
  </m:dependencies>
</m:project>
`;

    expect(parser.parse(content)).toEqual(["org.example:demo"]);
  });

  it("11. should fail clearly on malformed XML", () => {
    const content = `
<project>
  <dependencies>
    <dependency>
      <groupId>org.example</groupId>
      <artifactId>demo</artifactId>
  </dependencies>
</project>
`;

    expect(() => parser.parse(content)).toThrow("Failed to parse pom.xml:");
  });

  it("12. should be available through getParser('pom.xml')", () => {
    const registeredParser = getParser("pom.xml");
    expect(registeredParser).toBeDefined();
    expect(registeredParser).toBeInstanceOf(PomXmlParser);
  });
});
