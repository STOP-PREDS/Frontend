import React, { useEffect, useState } from "react";

// API base + key
const API = process.env.REACT_APP_API;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch all reports
  async function fetchReports() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reports?limit=50`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // fetch all cases
  async function fetchCases() {
    try {
      const res = await fetch(`${API}/cases`);
      const data = await res.json();
      setCases(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // link report → case
  async function linkReport(reportId, caseId) {
    try {
      const formData = new FormData();
      formData.append("case_id", caseId);

      const res = await fetch(`${API}/reports/${reportId}/link_case`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed: ${res.status} ${text}`);
      }

      const updatedReport = await res.json();

      // update UI with new case_id
      setReports((prev) =>
        prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchReports();
    fetchCases();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Reports</h2>
      {reports.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <p><b>{r.title}</b> (ID: {r.id})</p>
          <p>Case: {r.case_id ? `CASE-${r.case_id}` : "None"}</p>
          <p>{r.content}</p>

          <select
            onChange={(e) => linkReport(r.id, e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Link to Case…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} – {c.title}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
