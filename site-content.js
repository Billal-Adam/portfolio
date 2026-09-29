(function () {
  const config = window.PORTFOLIO_SUPABASE || {};
  const ready = config.url && config.publishableKey && !config.publishableKey.includes("ADD_SUPABASE");

  async function load() {
    if (!ready || !window.supabase) return;
    const client = window.supabase.createClient(config.url, config.publishableKey);
    const { data, error } = await client.from("portfolio_content").select("content").eq("id", "main").maybeSingle();
    if (error || !data) return;
    apply(data.content);
  }

  function apply(content) {
    if (content.home) {
      setText("[data-cms='home.eyebrow']", content.home.eyebrow);
      setText("[data-cms='home.title']", content.home.title);
      setText("[data-cms='home.accent']", content.home.accent);
      setText("[data-cms='home.closing']", content.home.closing);
      setText("[data-cms='home.subtitle']", content.home.subtitle);
      if (Array.isArray(content.home.skills)) {
        const skills = document.querySelector("[data-cms-list='skills']");
        if (skills) skills.innerHTML = content.home.skills.map(skill => `<div class="skill-card reveal visible" style="--fill:${number(skill.level, 0, 100)}%"><div class="name">${escapeHtml(skill.name)}</div><div class="bar-track"><div class="bar-fill"></div></div></div>`).join("");
      }
    }
    if (content.about) {
      setText("[data-cms='about.whatIDo']", content.about.whatIDo);
      setText("[data-cms='about.howIWork']", content.about.howIWork);
      const faq = document.querySelector("[data-cms-list='faq']");
      if (faq && Array.isArray(content.about.faq)) faq.innerHTML = content.about.faq.map(item => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("");
    }
    if (Array.isArray(content.projects)) {
      const projects = document.querySelector("[data-cms-list='projects']");
      if (projects) projects.innerHTML = content.projects.map(project => `<article class="project-card reveal visible"><div class="project-head"><h3>${escapeHtml(project.title)}</h3><span class="stack">${escapeHtml(project.stack)}</span></div><div class="project-details"><div><div class="detail-label">Challenge</div><p>${escapeHtml(project.challenge)}</p></div><div><div class="detail-label">Approach</div><p>${escapeHtml(project.approach)}</p></div><div><div class="detail-label">Outcome</div><p>${escapeHtml(project.outcome)}</p></div></div><div class="links"><a href="${safeUrl(project.url)}" target="_blank" rel="noopener">Live site →</a></div></article>`).join("");
    }
    if (content.contact) {
      setText("[data-cms='contact.headline']", content.contact.headline);
      setText("[data-cms='contact.intro']", content.contact.intro);
      setText("[data-cms='contact.email']", content.contact.email);
      setText("[data-cms='contact.whatsappLabel']", content.contact.whatsappLabel);
      setText("[data-cms='contact.tiktokLabel']", content.contact.tiktokLabel);
      setText("[data-cms='contact.instagramLabel']", content.contact.instagramLabel);
      const email = document.querySelector("[data-cms-link='email']");
      if (email) email.href = `mailto:${content.contact.email}`;
      for (const key of ["whatsapp", "tiktok", "instagram"]) {
        const link = document.querySelector(`[data-cms-link='${key}']`);
        if (link) link.href = safeUrl(content.contact[key]);
      }
    }
  }

  function setText(selector, value) { const el = document.querySelector(selector); if (el && typeof value === "string") el.textContent = value; }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function safeUrl(value) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : "#"; } catch { return "#"; } }
  function number(value, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min; }

  document.addEventListener("DOMContentLoaded", load);
})();
