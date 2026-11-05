// ─────────────────────────────────────────────
// Article data
// ─────────────────────────────────────────────
const ARTICLES = [
  {
    id: 1,
    title: "The Rise of MySpace: How a Social Network Changed Everything",
    excerpt: "In the early 2000s, MySpace became the defining platform for a generation. Users could embed music, wallpapers, and glitter GIFs onto their pages — an explosion of digital self-expression unlike anything the web had seen. It reshaped how people thought about identity online, peaking at over 100 million users and briefly overtaking Google in page views.",
    date: "June 3, 2025",
    category: "essays",
    url: "/articles/1"
  },
  {
    id: 2,
    title: "Tom Anderson: The Accidental Billionaire",
    excerpt: "Tom was the default friend of every MySpace user, but the story behind the man is far more interesting than most people realize. Before MySpace, he had hacked into ARPANET as a teenager. His relaxed, user-first instincts stood in sharp contrast to the corporate overseers who would eventually take the keys.",
    date: "May 18, 2025",
    category: "essays",
    url: "/articles/2"
  },
  {
    id: 3,
    title: "Custom Profiles: The DIY Web Before No-Code",
    excerpt: "Long before Squarespace and Webflow, teenagers were learning CSS and HTML to make their profiles stand out. Millions of kids taught themselves marquee tags, background tiling, and z-index hacks just to get a glittery cursor trail working. An entire ecosystem of profile-editing fansites sprang up to share code snippets — an accidental curriculum that shaped a generation of web developers.",
    date: "April 29, 2025",
    category: "tutorials",
    url: "/articles/3"
  },
  {
    id: 4,
    title: "Music Discovery in the Pre-Spotify Era",
    excerpt: "Before streaming, bands used MySpace pages to reach fans directly. Arctic Monkeys distributed their first demos exclusively through MySpace before breaking UK sales records. Lily Allen, Panic! at the Disco, and Kate Nash built their early fanbases the same way. It was a genuinely democratic music discovery machine — messy, loud, and alive in a way streaming platforms rarely replicate.",
    date: "April 10, 2025",
    category: "videos",
    url: "/articles/4"
  },
  {
    id: 5,
    title: "Why MySpace Lost to Facebook: A Post-Mortem",
    excerpt: "It wasn't just Zuckerberg's product instincts. MySpace's sale to News Corp introduced layers of corporate bureaucracy that slowed every decision to a crawl. A culture of spam had made the platform feel hostile, and the mobile pivot came years too late. It's a masterclass in what happens when a platform optimises for monetisation over user experience.",
    date: "March 22, 2025",
    category: "essays",
    url: "/articles/5"
  },
  {
    id: 6,
    title: "The Top 8: Friendship, Hierarchy, and Social Anxiety",
    excerpt: "Nothing caused more drama in 2006 than where you ranked on someone's Top 8. Demotions were read as breakups. Promotions were read as confessions. It was an early prototype for the algorithmic social sorting we now take for granted — the idea that your worth in a network could be quantified, ranked, and made publicly visible to everyone you knew.",
    date: "March 5, 2025",
    category: "videos",
    url: "/articles/6"
  },
  {
    id: 7,
    title: "Autoplay Culture and the MIDI Wars",
    excerpt: "Every MySpace profile had a song, and it played the moment anyone loaded your page, whether they wanted it to or not. Opening multiple profiles in tabs was an act of sonic chaos. The autoplay era shaped how a generation associated songs with people, and set the stage for the personal branding logic that now drives TikTok and Instagram Reels.",
    date: "February 14, 2025",
    category: "projects",
    url: "/articles/7"
  },
  {
    id: 8,
    title: "News Corp and the $580 Million Mistake",
    excerpt: "Rupert Murdoch's $580 million acquisition of MySpace in 2005 was hailed as a masterstroke. Within five years it was a cautionary tale taught in business schools. The culture clash between Fox Interactive Media and MySpace's freewheeling team proved irreparable — product decisions that should have taken days took months, engineers left, and Facebook quietly lapped them.",
    date: "January 30, 2025",
    category: "videos",
    url: "/articles/8"
  },
  {
    id: 9,
    title: "The Spam Problem That Killed a Platform",
    excerpt: "By 2007, MySpace was drowning in fake profiles, phishing links, and spam comments. Bots masquerading as attractive strangers flooded inboxes, and malicious profile CSS could redirect users to scam sites without a single click. Users began migrating to Facebook not just for its cleaner UI, but for the simple relief of not feeling like a target.",
    date: "January 12, 2025",
    category: "essays",
    url: "/articles/9"
  },
  {
    id: 10,
    title: "MySpace's Second Life as a Music Platform",
    excerpt: "After its social network collapse, MySpace reinvented itself as a music-focused platform. The pivot preserved an enormous archive of early-2000s indie, emo, and pop-punk recordings. Tracks that never made it to Spotify, demos recorded in bedrooms, early sets from artists who went on to stadium tours — it's all still there, if you know where to look.",
    date: "December 20, 2024",
    category: "essays",
    url: "/articles/10"
  }
];

// ─────────────────────────────────────────────
// Ad rotation
// ─────────────────────────────────────────────

const AD_INTERVAL = 90000; // 90 seconds

document.querySelectorAll(".ad-slot").forEach((slot, index) => {
  const images = JSON.parse(slot.dataset.images);
  if (images.length < 2) return;

  let current = 0;
  const img = slot.querySelector("img");

  // Stagger start times so all ads don't flip simultaneously
  const offset = (index * (AD_INTERVAL / 8)) % AD_INTERVAL;

  setTimeout(() => {
    setInterval(() => {
      img.style.opacity = "0";
      setTimeout(() => {
        current = (current + 1) % images.length;
        img.src = images[current];
        img.style.opacity = "1";
      }, 400);
    }, AD_INTERVAL);
  }, offset);
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp("(" + escapeRegex(query) + ")", "gi");
  return text.replace(re, '<span class="highlight">$1</span>');
}

function showView(name) {
  document.getElementById("view-main").style.display   = name === "main"   ? "" : "none";
  document.getElementById("view-search").style.display = name === "search" ? "" : "none";
}

function buildCard(a, highlightQuery) {
  const title   = highlightQuery ? highlight(a.title,   highlightQuery) : a.title;
  const excerpt = highlightQuery ? highlight(a.excerpt, highlightQuery) : a.excerpt;
  return `
    <div class="result-card">
      <div class="result-card-top">
        <span class="result-tag">${a.category}</span>
        <span class="result-date">${a.date}</span>
      </div>
      <a class="result-title" href="${a.url}">${title}</a>
      <p class="result-excerpt">${excerpt}</p>
    </div>
  `;
}

// ─────────────────────────────────────────────
// Render search results
// ─────────────────────────────────────────────

function renderResults(query) {
  const q = query.trim().toLowerCase();
  const metaEl = document.getElementById("results-meta");
  const listEl = document.getElementById("results-list");

  if (!q) {
    showView("main");
    return;
  }

  const matches = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q)
  );

  metaEl.innerHTML = matches.length > 0
    ? "Showing <strong>" + matches.length + " result" + (matches.length !== 1 ? "s" : "") +
      "</strong> for <strong>&ldquo;" + query + "&rdquo;</strong>"
    : "No results for <strong>&ldquo;" + query + "&rdquo;</strong> &mdash; try a different keyword.";

  listEl.innerHTML = matches.length === 0
    ? '<div class="no-results"><p>No articles matched your search.</p></div>'
    : matches.map(a => buildCard(a, query)).join("");

  showView("search");
  document.getElementById("search-input").value = query;
}

// ─────────────────────────────────────────────
// Render category results (navbar)
// ─────────────────────────────────────────────

function renderCategory(category) {
  const metaEl = document.getElementById("results-meta");
  const listEl = document.getElementById("results-list");

  const matches = ARTICLES.filter(a => a.category === category);

  metaEl.innerHTML = matches.length > 0
    ? "Showing <strong>" + matches.length + " article" + (matches.length !== 1 ? "s" : "") +
      "</strong> in <strong>&ldquo;" + category + "&rdquo;</strong>"
    : "No articles found in <strong>&ldquo;" + category + "&rdquo;</strong>.";

  listEl.innerHTML = matches.length === 0
    ? '<div class="no-results"><p>No articles in this category yet.</p></div>'
    : matches.map(a => buildCard(a, null)).join("");

  document.getElementById("search-input").value = "";
  showView("search");
}

// ─────────────────────────────────────────────
// Event listeners
// ─────────────────────────────────────────────

const isArticlePage = document.body.classList.contains('article-page');

if (!isArticlePage) {

  // Search form submit
  document.getElementById("search-form").addEventListener("submit", function(e) {
    e.preventDefault();
    renderResults(document.getElementById("search-input").value);
  });

  // Auto-search after 2 characters
  document.getElementById("search-input").addEventListener("input", function() {
    if (this.value.length >= 2) {
      renderResults(this.value);
    } else if (this.value.length === 0) {
      showView("main");
    }
  });

  // Back button
  document.getElementById("back-btn").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("search-input").value = "";
    showView("main");
  });

  // Header "Home" link
  document.querySelector(".topnav").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("search-input").value = "";
    showView("main");
  });

  // Navbar links — category filter or home
  document.querySelector(".navbar").addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;
    e.preventDefault();

    if (link.classList.contains("nav-home-link")) {
      document.getElementById("search-input").value = "";
      showView("main");
      return;
    }

    const category = link.dataset.category;
    if (category) renderCategory(category);
  });

}

