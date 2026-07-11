(() => {
  'use strict';
  const config = window.ARK_CONFIG;
  const output = document.querySelector('#output');
  const form = document.querySelector('#terminal-form');
  const input = document.querySelector('#terminal-input');
  const terminal = document.querySelector('#terminal');
  const mobileHelp = document.querySelector('#mobile-help');
  const clock = document.querySelector('#clock');

  const history = [];
  let historyIndex = 0;
  let booted = false;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const link = (label, href, external = true) => {
    const target = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapeHtml(href)}"${target}>${escapeHtml(label)}</a>`;
  };

  const banner = String.raw`
     ___         __      _____                           
    /   |  _____/ /__   / ___/___  _______  __________  
   / /| | / ___/ //_/   \__ \/ _ \/ ___/ / / / ___/ _ \ 
  / ___ |/ /  / ,<     ___/ /  __/ /__/ /_/ / /  /  __/ 
 /_/  |_/_/  /_/|_|   /____/\___/\___/\__,_/_/   \___/  

                 YOUR DIGITAL REFUGE`;

  const commands = {
    help: () => `
<div class="command-grid">
  <span>whois</span><span>Who I am and what I am building</span>
  <span>interests</span><span>Technical interests and focus areas</span>
  <span>socials</span><span>GitHub, LinkedIn, and contact links</span>
  <span>projects</span><span>Browse featured technical projects</span>
  <span>email</span><span>Open your email client to contact me</span>
  <span>history</span><span>Show commands entered this session</span>
  <span>banner</span><span>Display the Ark Secure banner</span>
  <span>clear</span><span>Clear the terminal (Ctrl+L)</span>
  <span>about</span><span>Open the full profile page</span>
  <span>theme</span><span>Toggle between dark and light terminal themes</span>
</div>
<p class="muted">Tip: use ↑ and ↓ to recall commands. Press Tab to autocomplete.</p>`,

    whois: () => `
<p><strong>${escapeHtml(config.owner)}</strong> is an Army officer transitioning into network systems engineering and a builder focused on cybersecurity, Linux, software, infrastructure, and resilient communications.</p>
<p>Ark Secure is evolving from a conventional business site into a place to document projects, exchange ideas, and connect with people working on similar problems.</p>
<p>${link('Read the full profile →', 'about.html', false)}</p>`,

    interests: () => `<ul class="terminal-list">${config.interests.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`,

    socials: () => {
      const items = [
        `<span>GitHub</span><span>${link('github.com/JCilenti', config.github)}</span>`,
        `<span>LinkedIn</span><span>${link('linkedin.com/in/joseph-cilenti', config.linkedin)}</span>`,
        `<span>Email</span><span>${link(config.email, `mailto:${config.email}`, false)}</span>`
      ];
      return `<div class="command-grid">${items.join('')}</div>`;
    },

    projects: (args) => {
      if (args[0]) {
        const query = args.join(' ').toLowerCase();
        const project = config.projects.find(p => p.id === query || p.name.toLowerCase().includes(query));
        if (!project) return `<p class="error">Project not found. Run <code>projects</code> to list available projects.</p>`;
        return `<article class="project-detail"><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.summary)}</p><p><span class="muted">Stack:</span> ${escapeHtml(project.stack)}</p>${project.url ? `<p>${link('Open repository →', project.url)}</p>` : '<p class="muted">Repository or write-up coming soon.</p>'}</article>`;
      }
      return `<div class="project-list">${config.projects.map((p, i) => `
        <article><span class="project-number">0${i + 1}</span><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.summary)}</p><button class="inline-command" data-command="projects ${escapeHtml(p.id)}">projects ${escapeHtml(p.id)}</button></div></article>`).join('')}</div>
        <p>${link('Open the full projects page →', 'projects.html', false)}</p>`;
    },

    email: () => {
      const subject = encodeURIComponent('Connecting through Ark Secure');
      window.location.href = `mailto:${config.email}?subject=${subject}`;
      return `<p>Opening your default email client… If nothing happens, email ${link(config.email, `mailto:${config.email}`, false)}.</p>`;
    },

    history: () => history.length
      ? `<ol class="history-list">${history.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`
      : '<p class="muted">No commands in this session yet.</p>',

    banner: () => `<pre class="ascii-banner" aria-label="Ark Secure ASCII banner">${escapeHtml(banner)}</pre>`,
    clear: () => { output.innerHTML = ''; return ''; },
    about: () => { window.location.href = 'about.html'; return '<p>Opening profile…</p>'; },
    theme: () => {
      document.documentElement.classList.toggle('light-theme');
      const mode = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('ark-theme', mode);
      return `<p>Theme changed to <strong>${mode}</strong>.</p>`;
    },
    pwd: () => '<p>/home/guest/network</p>',
    ls: () => '<p>about/ &nbsp; projects/ &nbsp; socials/ &nbsp; contact.txt</p>',
    date: () => `<p>${escapeHtml(new Date().toString())}</p>`,
    sudo: () => '<p class="error">guest is not in the sudoers file. This incident will be reported to the ark.</p>',
    neofetch: () => `<pre class="mini-fetch">ARK@SECURE\n----------\nOS: Human + Linux\nHost: Your Digital Refuge\nShell: arksh\nFocus: Build. Learn. Connect.</pre>`
  };

  const print = (html, className = '') => {
    if (!html) return;
    const block = document.createElement('div');
    block.className = `output-block ${className}`.trim();
    block.innerHTML = html;
    output.appendChild(block);
    terminal.scrollTop = terminal.scrollHeight;
  };

  const printPrompt = (command) => print(`<div class="echo"><span class="prompt-user">guest@arksecure</span><span class="prompt-separator">:</span><span class="prompt-path">~</span><span class="prompt-symbol">$</span> ${escapeHtml(command)}</div>`);

  const execute = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    history.push(trimmed);
    historyIndex = history.length;
    printPrompt(trimmed);
    const [name, ...args] = trimmed.split(/\s+/);
    const key = name.toLowerCase();
    if (commands[key]) print(commands[key](args));
    else print(`<p class="error">arksh: command not found: ${escapeHtml(name)}</p><p class="muted">Run <code>help</code> to see available commands.</p>`);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    execute(value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (historyIndex > 0) historyIndex -= 1;
      input.value = history[historyIndex] || '';
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex < history.length) historyIndex += 1;
      input.value = history[historyIndex] || '';
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const partial = input.value.trim().toLowerCase();
      const matches = Object.keys(commands).filter(command => command.startsWith(partial));
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1) print(`<p>${matches.map(escapeHtml).join(' &nbsp; ')}</p>`);
    } else if (event.key.toLowerCase() === 'l' && event.ctrlKey) {
      event.preventDefault();
      commands.clear();
    }
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-command]');
    if (button) {
      input.value = button.dataset.command;
      input.focus();
    } else if (!event.target.closest('a,button')) input.focus();
  });

  mobileHelp.addEventListener('click', () => execute('help'));

  const updateClock = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  updateClock(); setInterval(updateClock, 30000);

  if (localStorage.getItem('ark-theme') === 'light') document.documentElement.classList.add('light-theme');

  const boot = () => {
    if (booted) return;
    booted = true;
    print(`<pre class="ascii-banner" aria-label="Ark Secure ASCII banner">${escapeHtml(banner)}</pre>`);
    print(`<p>Welcome to <strong>Ark Secure</strong>, a technical networking hub.</p><p>Type <button class="inline-command" data-command="help">help</button> to view commands or <button class="inline-command" data-command="whois">whois</button> to begin.</p>`, 'welcome');
    input.focus();
  };
  boot();
})();
