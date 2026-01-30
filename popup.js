document.addEventListener('DOMContentLoaded', () => {
  const runBtn = document.getElementById('runBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const targetList = document.getElementById('targetList');
  const refList = document.getElementById('refList');
  const fileTypeSel = document.getElementById('fileType');
  const viewModeSel = document.getElementById('viewMode');
  const statusText = document.getElementById('statusText');
  const tableBody = document.querySelector('#resultsTable tbody');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');

  let globalResults = [];

  runBtn.addEventListener('click', async () => {
    const targets = targetList.value.split('\n').map(l => l.trim()).filter(l => l);
    const rawRefs = refList.value.split('\n').map(l => l.trim()).filter(l => l);

    if (targets.length === 0 || rawRefs.length === 0) {
      statusText.innerText = "Fill all fields.";
      return;
    }

    const references = rawRefs.map(r => {
      const parts = r.split(',').map(p => p.trim().replace(/[\u200B-\u200D\uFEFF]/g, ""));
      if (parts.length >= 2) {
        return { domain: parts[0].toLowerCase(), id: parts[1].toLowerCase(), type: parts[2] ? parts[2].toUpperCase() : null, original: r };
      }
      return null;
    }).filter(Boolean);

    runBtn.disabled = true;
    progressContainer.style.display = 'block';
    tableBody.innerHTML = '';
    globalResults = [];
    
    const BATCH_SIZE = 2;
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(t => processDomain(t, fileTypeSel.value, references)));
      const percent = Math.round(((i + batch.length) / targets.length) * 100);
      progressBar.style.width = `${percent}%`;
      statusText.innerText = `Processed: ${i + batch.length} / ${targets.length}`;
    }

    renderTable();
    runBtn.disabled = false;
    downloadBtn.style.display = 'block';
  });

  async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (response.ok) return await response.text();
      } catch (e) {
        if (i === retries - 1) throw e;
      }
    }
  }

  async function processDomain(domain, filename, references) {
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').split('/')[0];
    let content = null;
    let error = "Unreachable";

    try {
      content = await fetchWithRetry(`https://${cleanDomain}/${filename}`);
    } catch (e) {
      try {
        content = await fetchWithRetry(`http://${cleanDomain}/${filename}`);
      } catch (e2) {
        error = "Connection Error";
      }
    }

    if (content && (content.trim().toLowerCase().startsWith('<html') || content.toLowerCase().includes('<!doctype'))) {
      content = null;
      error = "Soft 404";
    }

    if (!content) {
      references.forEach(ref => {
        globalResults.push({ target: cleanDomain, reference: ref.original, status: "Error", details: error, isError: true });
      });
      return;
    }

    const ownerMatch = content.match(/OWNERDOMAIN\s*=\s*([^\s#]+)/i);
    const managerMatch = content.match(/MANAGERDOMAIN\s*=\s*([^\s#]+)/i);
    const owner = ownerMatch ? ownerMatch[1].toLowerCase() : (managerMatch ? managerMatch[1].toLowerCase() : null);

    const lines = content.split('\n').map(l => {
      const c = l.split('#')[0].trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
      const p = c.split(',').map(s => s.trim());
      return p.length >= 2 ? { d: p[0].toLowerCase(), i: p[1].toLowerCase(), t: p[2] ? p[2].toUpperCase().replace(/[^A-Z]/g, '') : null } : null;
    }).filter(Boolean);

    references.forEach(ref => {
      const match = lines.find(l => l.d === ref.domain && l.i === ref.id);
      let res = { target: cleanDomain, reference: ref.original, status: "Not Found", details: "Missing", isError: true };
      
      if (match) {
        if (!ref.type || match.t === ref.type) {
          res.status = "Valid";
          res.details = owner ? `Matched | Owner: ${owner}` : "Matched";
          res.isError = false;
        } else {
          res.status = "Partial";
          res.details = `Type Mismatch: ${match.t}`;
        }
      }
      globalResults.push(res);
    });
  }

  function renderTable() {
    tableBody.innerHTML = '';
    const onlyErrors = viewModeSel.value === 'errors';
    globalResults.forEach(row => {
      if (onlyErrors && !row.isError) return;
      const tr = document.createElement('tr');
      const cls = row.status === "Valid" ? "status-valid" : row.status === "Partial" ? "status-partial" : "status-error";
      tr.innerHTML = `<td>${row.target}</td><td>${row.reference}</td><td class="${cls}">${row.status}</td><td>${row.details}</td>`;
      tableBody.appendChild(tr);
    });
  }

  downloadBtn.addEventListener('click', () => {
    let csv = "\uFEFFTarget,Reference,Status,Details\n";
    globalResults.forEach(r => csv += `${r.target},"${r.reference}",${r.status},"${r.details}"\n`);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${Date.now()}.csv`;
    a.click();
  });

  viewModeSel.addEventListener('change', renderTable);
});