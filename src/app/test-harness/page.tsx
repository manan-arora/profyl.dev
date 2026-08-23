"use client";

import { useState } from "react";

interface Evidence {
  source: string;
  ecosystem?: string;
  identifier: string;
  path: string;
}

interface DetectedTechnology {
  technologyId: string;
  name: string;
  signals: string[];
  evidence: Evidence[];
}

interface ParsedManifest {
  manifest: {
    path: string;
    type: string;
  };
  dependencies: string[];
}

interface DiscoveredArtifact {
  path: string;
  type: string;
}

interface AnalysisResult {
  repositoryId: string;
  owner: string;
  repo: string;
  branch: string;
  parsedManifests: ParsedManifest[];
  artifacts: DiscoveredArtifact[];
  technologies: DetectedTechnology[];
  technicalRange?: {
    score: number;
    signals: string[];
  };
}

export default function TestHarness() {
  const [repoInput, setRepoInput] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    let owner = "";
    let repo = "";

    const cleanedInput = repoInput.trim();
    if (cleanedInput.includes("github.com/")) {
      const parts = cleanedInput.split("github.com/")[1].split("/");
      owner = parts[0];
      repo = parts[1];
    } else if (cleanedInput.includes("/")) {
      const parts = cleanedInput.split("/");
      owner = parts[0];
      repo = parts[1];
    } else {
      setError("Invalid input. Please enter 'owner/repo' or a full GitHub repository URL.");
      setLoading(false);
      return;
    }

    if (repo && repo.endsWith(".git")) {
      repo = repo.substring(0, repo.length - 4);
    }

    try {
      const response = await fetch("/api/test/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner, repo, branch }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze repository.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", fontFamily: "sans-serif", color: "#f3f4f6" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #374151", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "0 0 0.5rem 0", color: "#c7ff41" }}>
          Profyl Repository Analysis Test Harness
        </h1>
        <p style={{ margin: 0, color: "#9ca3af" }}>
          Minimal engineering tool. Composes: scanner → analyzeRepository() → detectTechnologies().
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ backgroundColor: "#1f2937", padding: "1.5rem", borderRadius: "6px", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#d1d5db" }}>
              GitHub Repo (owner/repo or URL)
            </label>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g. facebook/react"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #4b5563",
                backgroundColor: "#374151",
                color: "#f3f4f6",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#d1d5db" }}>
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              style={{
                width: "120px",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #4b5563",
                backgroundColor: "#374151",
                color: "#f3f4f6",
                boxSizing: "border-box"
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: loading ? "#4b5563" : "#c7ff41",
              color: loading ? "#9ca3af" : "#111827",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              height: "38px"
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "1rem", borderRadius: "6px", marginBottom: "2rem", border: "1px solid #b91c1c" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "2rem 0", color: "#9ca3af" }}>
          <div style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "0.25rem" }}>Running analysis...</div>
          <div>Querying GitHub API and performing detection pipeline...</div>
        </div>
      )}

      {result && (
        <div>
          <div style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
            <div style={{ backgroundColor: "#1f2937", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Repo</div>
              <div style={{ fontWeight: "bold" }}>{result.owner}/{result.repo}</div>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Branch</div>
              <div style={{ fontWeight: "bold" }}>{result.branch}</div>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Manifests</div>
              <div style={{ fontWeight: "bold", color: "#c7ff41" }}>{result.parsedManifests.length}</div>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Artifacts</div>
              <div style={{ fontWeight: "bold", color: "#c7ff41" }}>{result.artifacts.length}</div>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "0.75rem", borderRadius: "6px", textAlign: "center", border: "1px solid #374151" }}>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.25rem" }}>Technical Range</div>
              <div style={{ fontWeight: "bold", color: "#c7ff41", fontSize: "1.125rem" }}>{result.technicalRange?.score ?? 0}</div>
            </div>
          </div>

          {result.technicalRange?.signals && result.technicalRange.signals.length > 0 && (
            <div style={{ backgroundColor: "#1f2937", padding: "1rem", borderRadius: "6px", marginBottom: "2rem", border: "1px solid #374151" }}>
              <div style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Technical Range Signals ({result.technicalRange.signals.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {result.technicalRange.signals.map((sig) => (
                  <span key={sig} style={{ backgroundColor: "#374151", color: "#c7ff41", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "500" }}>
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#c7ff41", marginBottom: "0.75rem", borderBottom: "1px solid #374151", paddingBottom: "0.25rem" }}>
              Technologies ({result.technologies.length})
            </h2>
            {result.technologies.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No registered technologies detected.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {result.technologies.map((tech) => (
                  <div key={tech.technologyId} style={{ backgroundColor: "#1f2937", padding: "0.75rem 1rem", borderRadius: "6px" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.125rem", fontWeight: "bold" }}>{tech.name}</span>
                      {tech.signals.map((sig) => (
                        <span key={sig} style={{ backgroundColor: "#374151", color: "#c7ff41", padding: "0.125rem 0.375rem", borderRadius: "4px", fontSize: "0.75rem" }}>
                          {sig}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                      <strong>Evidence:</strong>
                      <ul style={{ margin: "0.25rem 0 0 0", paddingLeft: "1rem" }}>
                        {tech.evidence.map((ev, i) => (
                          <li key={i}>
                            Matched <code>{ev.identifier}</code> ({ev.source}) at <code>{ev.path}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#c7ff41", marginBottom: "0.75rem", borderBottom: "1px solid #374151", paddingBottom: "0.25rem" }}>
              Manifests ({result.parsedManifests.length})
            </h2>
            {result.parsedManifests.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No parsed manifests found.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {result.parsedManifests.map((m, idx) => (
                  <div key={idx} style={{ backgroundColor: "#1f2937", padding: "0.75rem 1rem", borderRadius: "6px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                      <code>{m.manifest.path}</code> ({m.manifest.type})
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                      <strong>Dependencies:</strong>{" "}
                      {m.dependencies.length === 0 ? (
                        <span>None</span>
                      ) : (
                        m.dependencies.map((dep) => (
                          <code key={dep} style={{ display: "inline-block", backgroundColor: "#374151", padding: "0.125rem 0.25rem", borderRadius: "2px", color: "#f3f4f6", marginRight: "0.25rem", marginBottom: "0.25rem" }}>
                            {dep}
                          </code>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#c7ff41", marginBottom: "0.75rem", borderBottom: "1px solid #374151", paddingBottom: "0.25rem" }}>
              Artifacts ({result.artifacts.length})
            </h2>
            {result.artifacts.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No discovered artifacts found.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {result.artifacts.map((a, idx) => (
                  <div key={idx} style={{ backgroundColor: "#1f2937", padding: "0.5rem 1rem", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                    <code>{a.path}</code>
                    <span style={{ color: "#9ca3af" }}>{a.type}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#c7ff41", marginBottom: "0.75rem", borderBottom: "1px solid #374151", paddingBottom: "0.25rem" }}>
              Raw JSON Output
            </h2>
            <pre style={{ backgroundColor: "#111827", padding: "1rem", borderRadius: "6px", overflowX: "auto", fontSize: "0.875rem", border: "1px solid #374151" }}>
              <code>{JSON.stringify(result, null, 2)}</code>
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}
