var currentPage = 'home';
var navStack = [];

var PAGE_LABELS = {
  home:'INDEX', vcr:'VCR ON-SCREEN DISPLAYS', disk:'DOS DISK RECOVERY TOOLS',
  s4ad:'SOFTWARE FOR ARTISTS DAY', 'osd-talk':'TALK: OSD CONVENTIONS',
  cgchip:'CHARACTER-GENERATOR CHIPS', '83filenames':'8.3 FILENAME CONVENTION',
  pioneerworks:'PIONEER WORKS', search:'SEARCH RESULTS'
};

var SEARCH_INDEX = [
  {id:'vcr', title:'VCR On‑Screen Displays', snippet:'Menu grammar, character‑generator chips, SELECT/SET/END convention.'},
  {id:'disk', title:'DOS Disk Recovery Tools', snippet:'Dual‑pane drive browser, 8.3 filenames, attribute flags.'},
  {id:'s4ad', title:'Software for Artists Day', snippet:'Pioneer Works event, schedule, speaker list.'},
  {id:'osd-talk', title:'Talk: OSD Conventions', snippet:'Discussion and revision log for the OSD grammar article.'},
  {id:'cgchip', title:'Character‑Generator Chips', snippet:'The ROM hardware that drew blocky on‑screen text.'},
  {id:'83filenames', title:'8.3 Filename Convention', snippet:'The 8‑character name plus 3‑character extension limit.'},
  {id:'pioneerworks', title:'Pioneer Works', snippet:'Brooklyn venue that hosts Software for Artists Day.'}
];

function nav(id, isBack){
  if(!PAGE_LABELS.hasOwnProperty(id)) return false;

  if(!isBack && id !== currentPage){
    navStack.push(currentPage);
  }
  currentPage = id;

  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  var target = document.getElementById('page-'+id);
  if(target){ target.classList.add('active'); }

  document.getElementById('crumbCurrent').textContent = PAGE_LABELS[id];

  document.querySelectorAll('.sidebar a[data-page]').forEach(function(a){
    a.classList.toggle('current', a.getAttribute('data-page') === id);
  });

  var backBtn = document.getElementById('backBtn');
  backBtn.classList.toggle('is-disabled', navStack.length === 0);

  window.scrollTo(0,0);
  toggleMenu(false);

  // Land the keyboard selection on something meaningful right away:
  // the matching sidebar entry if this page has one, otherwise the
  // first link inside the article itself (every stub/results page
  // has at least one). This also keeps arrow-key position continuous
  // instead of resetting to the top of the list on every page switch.
  var landing = document.querySelector('.sidebar a[data-page="'+id+'"]');
  if(!landing && target){ landing = target.querySelector('a'); }
  if(landing){ landing.focus({preventScroll:true}); }

  return false;
}

function goBack(){
  if(!navStack.length) return false;
  var prev = navStack.pop();
  nav(prev, true);
  return false;
}

function escapeHtml(s){
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderSearchResults(query, results){
  document.getElementById('searchQueryLabel').textContent = query ? '"' + query + '"' : '(empty)';
  var list = document.getElementById('searchResultsList');
  list.innerHTML = '';

  if(!query){
    list.innerHTML = '<li>Type something into the search field, then press Enter.</li>';
    return;
  }

  var shown = results.length ? results : SEARCH_INDEX;
  if(!results.length){
    var li = document.createElement('li');
    li.innerHTML = '<span class="mark">☐</span>No matches for "' + escapeHtml(query) + '". Try one of these instead:';
    list.appendChild(li);
  }
  shown.forEach(function(r){
    var item = document.createElement('li');
    item.innerHTML = '<span class="mark">▸</span><a href="#" onclick="return nav(\'' + r.id + '\')">' +
      escapeHtml(r.title) + '</a> — ' + escapeHtml(r.snippet);
    list.appendChild(item);
  });
}

function doSearch(){
  var raw = document.getElementById('searchInput').value.trim();
  var q = raw.toLowerCase();
  var results = !q ? [] : SEARCH_INDEX.filter(function(r){
    return r.title.toLowerCase().indexOf(q) !== -1 || r.snippet.toLowerCase().indexOf(q) !== -1;
  });
  renderSearchResults(raw, results);
  nav('search');
}

/* ---------- MENU PANEL ---------- */
function toggleMenu(forceState){
  var panel = document.getElementById('menuPanel');
  var willOpen = (typeof forceState === 'boolean') ? forceState : !panel.classList.contains('open');
  panel.classList.toggle('open', willOpen);
  document.getElementById('menuBtn').setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  if(willOpen){
    var firstLink = panel.querySelector('a');
    if(firstLink){ firstLink.focus({preventScroll:true}); }
  }
}

document.addEventListener('click', function(e){
  var panel = document.getElementById('menuPanel');
  if(panel.classList.contains('open') && !panel.contains(e.target) && e.target.id !== 'menuBtn'){
    toggleMenu(false);
  }
});

/* ---------- KEYBOARD CONTROLS ----------
   Mirrors the VCR OSD grammar from the reference image:
     SELECT/SWITCH = arrow keys move to whichever focusable item is
                      physically nearest in that direction on screen —
                      true spatial navigation, not a fixed list order,
                      so it works through grids, tables, and the sidebar
                      exactly as it looks on screen.
     SET     = Enter (native link/button behavior)
     BACK    = Backspace, steps back through the pages you've visited
     HOME    = Escape, jumps straight to the index
     SEARCH  = "/" focuses the search field
     MENU    = "m" toggles the menu panel
   Topbar and search are reachable by shortcut, not by arrow keys,
   so arrow keys never "get stuck" inside the search field. */
function getNavigable(){
  return Array.from(document.querySelectorAll('.sidebar a, .page.active a'));
}

function focusDirectional(direction){
  var candidates = getNavigable();
  if(!candidates.length) return;

  var current = document.activeElement;
  if(!current || candidates.indexOf(current) === -1){
    var start = document.querySelector('.sidebar a.current') || candidates[0];
    start.focus({preventScroll:true});
    start.scrollIntoView({block:'nearest', inline:'nearest'});
    return;
  }

  var rect = current.getBoundingClientRect();
  // Use the top-left corner, not the center. Centers shift with text
  // width/height (a short label's center sits in a different spot than a
  // long label's even when both are flush-left in the same column), which
  // was occasionally tricking left/right into thinking a link directly
  // above or below was actually off to the side. Edges stay aligned
  // regardless of label length.
  var cx = rect.left;
  var cy = rect.top;

  // Left/right should move strictly along the current row, never drifting
  // down or up the list — that's what the down/up keys are for. So when
  // moving horizontally, the perpendicular (vertical) offset is penalized
  // much more heavily than when moving vertically, where some perpendicular
  // (horizontal) drift across columns of different widths is expected.
  var isHorizontal = (direction === 'left' || direction === 'right');
  var perpWeight = isHorizontal ? 6 : 1.5;

  var best = null, bestScore = Infinity;
  candidates.forEach(function(el){
    if(el === current) return;
    var r = el.getBoundingClientRect();
    var ex = r.left;
    var ey = r.top;
    var dx = ex - cx;
    var dy = ey - cy;
    var primary, perp, ok;

    if(direction === 'right'){ ok = dx > 2; primary = dx; perp = Math.abs(dy); }
    else if(direction === 'left'){ ok = dx < -2; primary = -dx; perp = Math.abs(dy); }
    else if(direction === 'down'){ ok = dy > 2; primary = dy; perp = Math.abs(dx); }
    else /* up */ { ok = dy < -2; primary = -dy; perp = Math.abs(dx); }

    if(!ok) return;
    // weight the perpendicular offset so the nearest item roughly in line
    // with the current one wins, the way your eye would scan a row or
    // column rather than cutting diagonally to a closer-but-misaligned item
    var score = primary + perp * perpWeight;
    if(score < bestScore){ bestScore = score; best = el; }
  });

  if(best){
    best.focus({preventScroll:true});
    best.scrollIntoView({block:'nearest', inline:'nearest'});
  }
}

document.addEventListener('keydown', function(e){
  var active = document.activeElement;
  var isTextInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
  var menuPanel = document.getElementById('menuPanel');
  var menuOpen = menuPanel.classList.contains('open');

  if(e.key === '/' && !isTextInput){
    e.preventDefault();
    var si = document.getElementById('searchInput');
    si.focus();
    si.select();
    return;
  }
  if((e.key === 'm' || e.key === 'M') && !isTextInput){
    e.preventDefault();
    toggleMenu();
    return;
  }

  if(isTextInput){
    if(e.key === 'Escape'){ active.blur(); }
    return; // let normal typing / native text-cursor movement happen otherwise
  }

  // while the menu panel is open, arrows move within it and Escape closes it
  if(menuOpen){
    var panelLinks = Array.from(menuPanel.querySelectorAll('a'));
    var pIdx = panelLinks.indexOf(active);
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      pIdx = (pIdx < 0) ? 0 : (pIdx + 1) % panelLinks.length;
      panelLinks[pIdx].focus();
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      pIdx = (pIdx <= 0) ? panelLinks.length - 1 : pIdx - 1;
      panelLinks[pIdx].focus();
    } else if(e.key === 'Escape'){
      e.preventDefault();
      toggleMenu(false);
      document.getElementById('menuBtn').focus();
    }
    return;
  }

  if(e.key === 'Escape'){
    e.preventDefault();
    nav('home');
    return;
  }
  if(e.key === 'Backspace'){
    e.preventDefault();
    goBack();
    return;
  }

  if(e.key === 'ArrowDown'){ e.preventDefault(); focusDirectional('down'); }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); focusDirectional('up'); }
  else if(e.key === 'ArrowRight'){ e.preventDefault(); focusDirectional('right'); }
  else if(e.key === 'ArrowLeft'){ e.preventDefault(); focusDirectional('left'); }
});

// land on the home page with a visible selection right away —
// no keypress should be needed first
nav('home');