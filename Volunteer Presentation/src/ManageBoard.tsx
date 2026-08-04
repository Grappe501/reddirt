import { FormEvent, useEffect, useMemo, useState } from "react";

type Signup = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  city?: string;
  pathway: string;
  roles: string;
  primaryTeam: string;
  availability: string;
  notes: string;
  eventInterest: string;
  status: string;
  assignee: string;
  staffNotes: string;
  source?: string;
};

const STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "placed", label: "Placed" },
  { id: "follow_up", label: "Follow-up" },
  { id: "declined", label: "Declined" },
  { id: "duplicate", label: "Duplicate" },
] as const;

const TOKEN_KEY = "kickoff-manage-token";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function ManageBoard() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [items, setItems] = useState<Signup[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Signup | null>(null);
  const [saving, setSaving] = useState(false);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/.netlify/functions/manage-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(
          data.error === "not_configured"
            ? "Management password is not configured on Netlify yet."
            : "Incorrect password.",
        );
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword("");
    } catch {
      setLoginError("Could not reach the login service.");
    }
  }

  async function load(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (pathwayFilter) params.set("pathway", pathwayFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/.netlify/functions/manage-signups?${params}`, {
        headers: authHeaders(activeToken),
      });
      const data = await res.json();
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken("");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.message || data.error || "Failed to load signups.");
        return;
      }
      setItems(data.items || []);
      setCounts(data.counts || {});
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load signups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) void load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, pathwayFilter]);

  async function saveSelected() {
    if (!selected || !token) return;
    setSaving(true);
    try {
      const res = await fetch("/.netlify/functions/manage-update", {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          id: selected.id,
          status: selected.status,
          assignee: selected.assignee,
          staffNotes: selected.staffNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError("Could not save volunteer record.");
        return;
      }
      setSelected(data.item);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function syncForms() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/manage-sync-forms", {
        method: "POST",
        headers: authHeaders(token),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Forms sync unavailable. New signups still appear via live capture.");
        return;
      }
      await load();
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const headers = [
      "name",
      "email",
      "phone",
      "county",
      "city",
      "pathway",
      "roles",
      "primaryTeam",
      "status",
      "assignee",
      "availability",
      "eventInterest",
      "notes",
      "staffNotes",
      "createdAt",
    ];
    const rows = items.map((i) => {
      const row: Record<string, string> = {
        name: i.name,
        email: i.email,
        phone: i.phone,
        county: i.county,
        city: i.city || "",
        pathway: i.pathway,
        roles: i.roles,
        primaryTeam: i.primaryTeam,
        status: i.status,
        assignee: i.assignee,
        availability: i.availability,
        eventInterest: i.eventInterest,
        notes: i.notes,
        staffNotes: i.staffNotes,
        createdAt: i.createdAt,
      };
      return headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",");
    });
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kickoff-volunteers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pathways = useMemo(
    () => Array.from(new Set(items.map((i) => i.pathway).filter(Boolean))).sort(),
    [items],
  );

  if (!token) {
    return (
      <div className="manage-page">
        <header className="manage-hero">
          <p className="eyebrow">Operators only</p>
          <h1>Volunteer Management Board</h1>
          <p className="lead">Track kickoff signups: contact status, placement, assignee, and notes.</p>
        </header>
        <form className="manage-login card" onSubmit={login}>
          <div className="field">
            <label htmlFor="manage-pass">Management password</label>
            <input
              id="manage-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {loginError ? <p className="alert">{loginError}</p> : null}
          <button className="btn btn-gold" type="submit">
            Open board
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="manage-page">
      <header className="manage-hero">
        <p className="eyebrow">Kickoff volunteers</p>
        <h1>Volunteer Management Board</h1>
        <p className="lead">{total} total signups in the board store.</p>
        <div className="cta-row">
          <button type="button" className="btn btn-gold" onClick={() => load()} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button type="button" className="btn btn-navy" onClick={exportCsv}>
            Export CSV
          </button>
          <button type="button" className="btn btn-outline" onClick={syncForms}>
            Sync Netlify Forms
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              sessionStorage.removeItem(TOKEN_KEY);
              setToken("");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="manage-stats">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`stat ${statusFilter === s.id ? "active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === s.id ? "" : s.id)}
          >
            <strong>{counts[s.id] || 0}</strong>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="manage-filters">
        <input
          placeholder="Search name, email, county, team…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void load();
          }}
        />
        <select value={pathwayFilter} onChange={(e) => setPathwayFilter(e.target.value)}>
          <option value="">All pathways</option>
          {["local", "campaign", "youth", "match", ...pathways].filter((v, i, a) => a.indexOf(v) === i).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => load()}>
          Apply search
        </button>
      </div>

      {error ? <p className="alert">{error}</p> : null}

      <div className="manage-layout">
        <div className="manage-table-wrap">
          <table className="manage-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>County</th>
                <th>Pathway / team</th>
                <th>Status</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={selected?.id === item.id ? "selected" : undefined}
                  onClick={() => setSelected(item)}
                >
                  <td>
                    <strong>{item.name}</strong>
                    <div className="muted">{item.email}</div>
                    <div className="muted">{item.phone}</div>
                  </td>
                  <td>
                    {item.county}
                    {item.city ? <div className="muted">{item.city}</div> : null}
                  </td>
                  <td>
                    <div>{item.pathway || "—"}</div>
                    <div className="muted">{item.primaryTeam || item.roles || "—"}</div>
                  </td>
                  <td>
                    <span className={`pill status-${item.status}`}>{item.status}</span>
                  </td>
                  <td className="muted">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!items.length && !loading ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No signups yet. New form submissions appear here automatically. Use Sync Netlify Forms to pull any
                    earlier Form submissions.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <aside className="manage-detail card">
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <p className="muted">
                {selected.email} · {selected.phone}
              </p>
              <p>
                <strong>County:</strong> {selected.county}
                {selected.city ? ` · ${selected.city}` : ""}
              </p>
              <p>
                <strong>Pathway:</strong> {selected.pathway || "—"}
              </p>
              <p>
                <strong>Roles / team:</strong> {selected.primaryTeam || selected.roles || "—"}
              </p>
              <p>
                <strong>Availability:</strong> {selected.availability || "—"}
              </p>
              <p>
                <strong>Event interest:</strong> {selected.eventInterest || "—"}
              </p>
              <p>
                <strong>Volunteer notes:</strong> {selected.notes || "—"}
              </p>

              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={selected.status}
                  onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="assignee">Assignee</label>
                <input
                  id="assignee"
                  value={selected.assignee || ""}
                  onChange={(e) => setSelected({ ...selected, assignee: e.target.value })}
                  placeholder="Who is following up?"
                />
              </div>
              <div className="field">
                <label htmlFor="staffNotes">Staff notes</label>
                <textarea
                  id="staffNotes"
                  rows={5}
                  value={selected.staffNotes || ""}
                  onChange={(e) => setSelected({ ...selected, staffNotes: e.target.value })}
                />
              </div>
              <button type="button" className="btn btn-gold" onClick={saveSelected} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : (
            <p className="muted">Select a volunteer to manage status, assignee, and notes.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
