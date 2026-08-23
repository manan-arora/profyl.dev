import { describe, expect, it } from "vitest";
import { GithubTreeEntry } from "@/types/github";
import { discoverArtifacts } from "../artifact-discovery";

function blob(path: string, sha = path): GithubTreeEntry {
  return { path, type: "blob", sha, url: `https://example.test/${sha}` };
}

describe("discoverArtifacts", () => {
  it("discovers Dockerfile and all supported Compose variants", () => {
    expect(
      discoverArtifacts([
        blob("Dockerfile"),
        blob("docker-compose.yml"),
        blob("docker-compose.yaml"),
        blob("compose.yml"),
        blob("compose.yaml"),
      ]),
    ).toEqual([
      { path: "Dockerfile", type: "dockerfile" },
      { path: "docker-compose.yml", type: "docker-compose" },
      { path: "docker-compose.yaml", type: "docker-compose" },
      { path: "compose.yml", type: "docker-compose" },
      { path: "compose.yaml", type: "docker-compose" },
    ]);
  });

  it("discovers GitHub Actions workflow files", () => {
    expect(discoverArtifacts([blob(".github/workflows/ci.yml")])).toEqual([
      { path: ".github/workflows/ci.yml", type: "github-actions" },
    ]);
  });

  it("discovers deployment configurations", () => {
    expect(
      discoverArtifacts([
        blob("vercel.json"),
        blob("render.yaml"),
        blob("netlify.toml"),
        blob("firebase.json"),
      ]),
    ).toEqual([
      { path: "vercel.json", type: "vercel" },
      { path: "render.yaml", type: "render" },
      { path: "netlify.toml", type: "netlify" },
      { path: "firebase.json", type: "firebase" },
    ]);
  });

  it("discovers Terraform files", () => {
    expect(
      discoverArtifacts([blob("infra/main.tf"), blob("variables.tf")]),
    ).toEqual([
      { path: "infra/main.tf", type: "terraform" },
      { path: "variables.tf", type: "terraform" },
    ]);
  });

  it("does not classify generic or Kubernetes-looking YAML as an artifact", () => {
    expect(
      discoverArtifacts([
        blob("config.yaml"),
        blob("deployment.yaml"),
        blob("service.yml"),
        blob("k8s/deployment.yaml"),
      ]),
    ).toEqual([]);
  });

  it("ignores unrelated files and directory entries", () => {
    expect(
      discoverArtifacts([
        blob("README.md"),
        blob("src/index.ts"),
        { path: "infra", type: "tree", sha: "tree", url: "tree-url" },
        { path: "Dockerfile", type: "tree", sha: "tree-file", url: "tree-url" },
      ]),
    ).toEqual([]);
  });

  it("respects maximum directory depth", () => {
    const tree = [
      blob("Dockerfile"),
      blob("services/api/Dockerfile"),
      blob("services/api/infra/main.tf"),
    ];

    expect(discoverArtifacts(tree, 0)).toEqual([
      { path: "Dockerfile", type: "dockerfile" },
    ]);
    expect(discoverArtifacts(tree, 2)).toEqual([
      { path: "Dockerfile", type: "dockerfile" },
      { path: "services/api/Dockerfile", type: "dockerfile" },
    ]);
  });

  it("preserves deterministic input ordering and removes duplicates", () => {
    const tree = [
      blob("terraform/main.tf", "first"),
      blob("Dockerfile"),
      blob("terraform/main.tf", "duplicate"),
      blob(".github/workflows/test.yml"),
    ];

    expect(discoverArtifacts(tree)).toEqual([
      { path: "terraform/main.tf", type: "terraform" },
      { path: "Dockerfile", type: "dockerfile" },
      { path: ".github/workflows/test.yml", type: "github-actions" },
    ]);
  });

  it("discovers multiple artifact types together", () => {
    expect(
      discoverArtifacts([
        blob("compose.yaml"),
        blob("deploy.tf"),
        blob(".github/workflows/deploy.yml"),
        blob("vercel.json"),
      ]),
    ).toEqual([
      { path: "compose.yaml", type: "docker-compose" },
      { path: "deploy.tf", type: "terraform" },
      { path: ".github/workflows/deploy.yml", type: "github-actions" },
      { path: "vercel.json", type: "vercel" },
    ]);
  });

  it("validates maxDepth and handles an empty tree", () => {
    expect(discoverArtifacts([])).toEqual([]);
    expect(() => discoverArtifacts([], -1)).toThrow(
      "maxDepth must be a non-negative integer",
    );
    expect(() => discoverArtifacts([], 1.5)).toThrow(
      "maxDepth must be a non-negative integer",
    );
  });
});
