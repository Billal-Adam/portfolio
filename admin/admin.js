(() => {
  const cfg = window.PORTFOLIO_SUPABASE || {};
  const allowedEmail = "billybilsky5@gmail.com";
  const loginPanel = document.querySelector("#loginPanel");
  const editorPanel = document.querySelector("#editorPanel");
  const loginMessage = document.querySelector("#loginMessage");
  const saveMessage = document.querySelector("#saveMessage");
  const editorForm = document.querySelector("#editorForm");

  if (!cfg.url || !cfg.publishableKey || cfg.publishableKey.includes("ADD_SUPABASE")) {
    loginMessage.textContent = "Admin setup is incomplete. Add the project's publishable key in supabase-config.js.";
    return;
  }

  const db = window.supabase.createClient(cfg.url, cfg.publishableKey);
  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    if (email !== allowedEmail) { loginMessage.textContent = "This email is not allowed to manage this site."; return; }
    loginMessage.textContent = "Sending a secure sign-in link…";
    const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/admin/` } });
    loginMessage.textContent = error ? error.message : "Check your inbox for the sign-in link.";
  });

  document.querySelector("#save").addEventListener("click", async () => {
    saveMessage.textContent = "";
    let content;
    try { content = readEditor(); }
    catch (error) { saveMessage.textContent = `Invalid JSON: ${error.message}`; return; }
    saveMessage.textContent = "Saving…";
    const { error } = await db.from("portfolio_content").update({ content, updated_at: new Date().toISOString() }).eq("id", "main");
    saveMessage.textContent = error ? `Could not save: ${error.message}` : "Saved. Your site now shows the new content.";
  });

  document.querySelector("#signOut").addEventListener("click", async () => { await db.auth.signOut(); showSignedOut(); });
  db.auth.onAuthStateChange((_event, session) => { void refresh(session); });
  db.auth.getSession().then(({ data }) => refresh(data.session));

  async function refresh(session) {
    if (!session) { showSignedOut(); return; }
    if ((session.user.email || "").toLowerCase() !== allowedEmail) { await db.auth.signOut(); loginMessage.textContent = "This email is not allowed to manage this site."; showSignedOut(); return; }
    const { data, error } = await db.from("portfolio_content").select("content").eq("id", "main").single();
    if (error) { loginMessage.textContent = `Could not load content: ${error.message}`; showSignedOut(); return; }
    renderEditor(data.content);
    loginPanel.classList.add("hidden");
    editorPanel.classList.remove("hidden");
  }
  function showSignedOut() { editorPanel.classList.add("hidden"); loginPanel.classList.remove("hidden"); }

  function renderEditor(content) {
    for (const field of editorForm.querySelectorAll("[data-field]")) {
      const path = field.dataset.field.split(".");
      const value = path.reduce((current, part) => current?.[part], content);
      field.value = field.hasAttribute("data-json") ? JSON.stringify(value ?? [], null, 2) : (value ?? "");
    }
  }
  function readEditor() {
    const content = { home: {}, about: {}, projects: [], contact: {} };
    for (const field of editorForm.querySelectorAll("[data-field]")) {
      const path = field.dataset.field.split(".");
      let value = field.value.trim();
      if (field.hasAttribute("data-json")) value = JSON.parse(value);
      if (path.length === 1) content[path[0]] = value;
      else content[path[0]][path[1]] = value;
    }
    if (!Array.isArray(content.projects) || !Array.isArray(content.home.skills) || !Array.isArray(content.about.faq)) throw new Error("Skills, FAQ, and Projects must each be a JSON list.");
    return content;
  }
})();
