"use client";

import { useState } from "react";
import { ORGANIZATIONS, type OrganizationKey } from "./config/organizations";

interface Input {
  owner: string;
  repo: string;
  username: string;
  permission: "pull" | "triage" | "push" | "maintain" | "admin";
}

interface Invitation {
  id: number;
  invitee?: {
    login?: string;
  };
}

interface InviteResult {
  status: number;
  message: string;
  invitationId?: number;
}

type Result = {
  ok: boolean;
  error?: string;
  input?: Input;
  foundInvitations?: Invitation[];
  deletedInvitations?: { id: number }[];
  invite?: InviteResult | null;
  dryRun?: boolean;
};

export default function Page() {
  const [organization, setOrganization] = useState<OrganizationKey>("IT3049C-Spring26");
  const [assignment, setAssignment] = useState<string>(() => {
    // Ensure we have a valid assignment on first load
    const firstAssignment = Object.keys(ORGANIZATIONS["IT3049C-Spring26"].assignments)[0];
    return firstAssignment || "🧑‍💻 Campus Portal (JS Exercises)";
  });
  const [username, setUsername] = useState("");
  const [permission, setPermission] = useState<"pull"|"triage"|"push"|"maintain"|"admin">("admin");
  const [dryRun, setDryRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Calculate repo name based on assignment and username
  const assignmentPrefix = ORGANIZATIONS[organization].assignments[assignment as keyof typeof ORGANIZATIONS[typeof organization]["assignments"]];
  const repoName = username && assignmentPrefix ? `${assignmentPrefix}-${username}` : "";
  const owner = ORGANIZATIONS[organization].owner;

  // Handle organization change - reset assignment to first available
  const handleOrganizationChange = (newOrg: OrganizationKey) => {
    setOrganization(newOrg);
    const firstAssignment = Object.keys(ORGANIZATIONS[newOrg].assignments)[0];
    setAssignment(firstAssignment);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setResult({ ok: false, error: "Username is required" });
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/reinvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: repoName, username, permission, dryRun }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Request failed";
      setResult({ ok: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #8B0000 0%, #000000 100%)",
      padding: "0.75rem"
    }}>
      <main style={{ 
        maxWidth: 680, 
        margin: "0 auto", 
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        padding: "1rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "700", 
            color: "#1a1a1a", 
            margin: "0 0 0.5rem 0",
            background: "linear-gradient(135deg, #8B0000 0%, #000000 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            GitHub Re-invite Tool
          </h1>
          <p style={{ 
            fontSize: "1.1rem", 
            color: "#6b7280", 
            margin: "0",
            lineHeight: "1.6"
          }}>
            Remove any stale repo invitation and send a fresh one
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label style={{ 
              fontSize: "0.875rem", 
              fontWeight: "600", 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Organization
            </label>
            <select 
              value={organization} 
              onChange={e => handleOrganizationChange(e.target.value as OrganizationKey)}
              style={{
                padding: "0.875rem 1rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                outline: "none",
                background: "white",
                cursor: "pointer"
              }}
              onFocus={(e) => e.target.style.borderColor = "#8B0000"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              {Object.entries(ORGANIZATIONS).map(([key, org]) => (
                <option key={key} value={key}>🏫 {org.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label style={{ 
              fontSize: "0.875rem", 
              fontWeight: "600", 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Assignment
            </label>
            <select 
              value={assignment} 
              onChange={e => setAssignment(e.target.value)}
              style={{
                padding: "0.875rem 1rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                outline: "none",
                background: "white",
                cursor: "pointer"
              }}
              onFocus={(e) => e.target.style.borderColor = "#8B0000"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              {Object.entries(ORGANIZATIONS[organization].assignments).map(([key]) => (
                <option key={key} value={key}>📝 {key}</option>
              ))}
            </select>
          </div>


          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label style={{ 
              fontSize: "0.875rem", 
              fontWeight: "600", 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Username
            </label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. octocat" 
              required 
              style={{
                padding: "0.875rem 1rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#8B0000"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          <div style={{ 
            display: "grid", 
            gap: "0.5rem",
            padding: "1rem",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <label style={{ 
              fontSize: "0.875rem", 
              fontWeight: "600", 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Generated Repository Name
            </label>
            <div style={{
              padding: "0.875rem 1rem",
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
              color: repoName ? "#374151" : "#9ca3af",
              fontFamily: "monospace"
            }}>
              {repoName || "Enter username to see generated repo name"}
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label style={{ 
              fontSize: "0.875rem", 
              fontWeight: "600", 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Permission Level
            </label>
            <select 
              value={permission} 
              onChange={e => setPermission(e.target.value as "pull"|"triage"|"push"|"maintain"|"admin")}
              style={{
                padding: "0.875rem 1rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                outline: "none",
                background: "white",
                cursor: "pointer"
              }}
              onFocus={(e) => e.target.style.borderColor = "#8B0000"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="pull">📖 Pull (Read)</option>
              <option value="triage">🔍 Triage</option>
              <option value="push">✏️ Push (Write)</option>
              <option value="maintain">🔧 Maintain</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>

          <div style={{ 
            display: "flex", 
            gap: "0.75rem", 
            alignItems: "center",
            padding: "1rem",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <input 
              type="checkbox" 
              checked={dryRun} 
              onChange={e => setDryRun(e.target.checked)}
              style={{
                width: "18px",
                height: "18px",
                accentColor: "#8B0000"
              }}
            />
            <label style={{ 
              fontSize: "0.95rem", 
              color: "#4b5563",
              cursor: "pointer",
              fontWeight: "500"
            }}>
              🧪 Dry run mode (simulate without making changes)
            </label>
          </div>

          <button 
            disabled={loading} 
            type="submit"
            style={{
              padding: "1rem 2rem",
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #8B0000 0%, #000000 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: loading ? "none" : "0 4px 12px rgba(139, 0, 0, 0.4)",
              transform: loading ? "none" : "translateY(0)",
              marginTop: "0.5rem"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(139, 0, 0, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 0, 0, 0.4)";
              }
            }}
          >
            {loading ? "⏳ Working..." : dryRun ? "🧪 Simulate" : "🚀 Re-invite"}
          </button>
        </form>

        {result && (
          <section style={{ marginTop: "1rem" }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "600", 
              color: "#1a1a1a", 
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              {result.ok ? "✅ Result" : "❌ Error"}
            </h2>
            {!result.ok && (
              <div style={{ 
                background: "#fef2f2", 
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "1rem",
                color: "#dc2626"
              }}>
                <pre style={{ 
                  whiteSpace: "pre-wrap", 
                  margin: "0",
                  fontFamily: "inherit"
                }}>
                  {result.error}
                </pre>
              </div>
            )}
            {result.ok && (
              <div style={{ 
                background: "#f0f9ff", 
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                padding: "1.5rem",
                overflow: "hidden"
              }}>
                {result.invite && (result.invite.status === 201 || result.invite.status === 204) && (
                  <div style={{
                    background: "#dcfce7",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    padding: "1rem",
                    marginBottom: "1rem"
                  }}>
                    <h3 style={{ 
                      margin: "0 0 0.5rem 0", 
                      fontSize: "1rem", 
                      fontWeight: "600", 
                      color: "#166534" 
                    }}>
                      🎉 Repository Link
                    </h3>
                    <a 
                      href={`https://github.com/${owner}/${repoName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1d4ed8",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontFamily: "monospace",
                        background: "white",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "4px",
                        border: "1px solid #d1d5db",
                        display: "inline-block",
                        wordBreak: "break-all"
                      }}
                      onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "underline"}
                      onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = "none"}
                    >
                      https://github.com/{owner}/{repoName}
                    </a>
                  </div>
                )}
                <pre style={{ 
                  background: "white",
                  padding: "1rem",
                  borderRadius: "6px",
                  overflowX: "auto",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  margin: "0"
                }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </section>
        )}
      </main>
      
      <footer style={{
        textAlign: "center",
        marginTop: "1rem",
        padding: "0.5rem",
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "0.85rem",
        lineHeight: "1.5"
      }}>
        <p style={{ margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0.2em" }}>
          <a href="https://github-reinvite.vercel.app/" style={{ color: "rgba(255, 255, 255, 0.9)", textDecoration: "none" }}>GitHub Re-invite</a> © 2025 by <a href="https://yahyagilany.io" style={{ color: "rgba(255, 255, 255, 0.9)", textDecoration: "none" }}>Yahya Gilany</a> is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" style={{ color: "rgba(255, 255, 255, 0.9)", textDecoration: "none" }}>CC BY-NC-SA 4.0</a>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2em" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="CC" style={{ maxWidth: "1em", maxHeight: "1em", display: "inline-block" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="BY" style={{ maxWidth: "1em", maxHeight: "1em", display: "inline-block" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="NC" style={{ maxWidth: "1em", maxHeight: "1em", display: "inline-block" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="SA" style={{ maxWidth: "1em", maxHeight: "1em", display: "inline-block" }} />
          </span>
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a 
            href="https://yahyagilany.io" 
            style={{ 
              color: "rgba(255, 255, 255, 0.9)", 
              textDecoration: "none",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3em"
            }}
          >
            🌐 Website
          </a>
          <a 
            href="https://www.buymeacoffee.com/ygilany" 
            style={{ 
              color: "rgba(255, 255, 255, 0.9)", 
              textDecoration: "none",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3em"
            }}
          >
            ☕ Buy Me a Coffee
          </a>
          <a 
            href="https://github.com/ygilany/github-reinvite" 
            style={{ 
              color: "rgba(255, 255, 255, 0.9)", 
              textDecoration: "none",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3em"
            }}
          >
            📁 Repository
          </a>
        </div>
      </footer>
    </div>
  );
}