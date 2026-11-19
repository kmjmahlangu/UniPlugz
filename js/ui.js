

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isPhone() {
  return window.matchMedia("(max-width: 719px)").matches;
}


function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function formatDate(iso) {
  const date = new Date(iso);
  if (!iso || isNaN(date)) return "";
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}


function getBadges(article) {
  const badges = [];
  const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / 3600000;
  if (hoursOld < 24) badges.push("New");

  const deadlineWords = /deadline|closing|closes|close in|apply now|applications? (open|close)|results (are |will be )?(out|released|announced)|registration (opens|closes|deadline)|opens? (on|in|today)/i;
  if (deadlineWords.test(article.title)) badges.push("Time-sensitive");

  return badges;
}

// ----- story card -----

function makeCard(article) {
  const card = el("li", "Card");

  const media = el("div", "CardMedia");
  const img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  img.width = 400;
  img.height = 225;
  img.src = article.image || "assets/images/news-placeholder.svg";


  img.addEventListener("error", function () {
    if (!img.src.endsWith("news-placeholder.svg")) img.src = "assets/images/news-placeholder.svg";
  });
  media.appendChild(img);
  card.appendChild(media);

  const body = el("div", "CardBody");

  const badges = getBadges(article);
  if (badges.length) {
    const badgeRow = el("p", "CardBadges");
    badges.forEach(function (name) {
      badgeRow.appendChild(el("span", name === "Time-sensitive" ? "Badge BadgeAlert" : "Badge", name));
    });
    body.appendChild(badgeRow);
  }

  const title = el("h3", "CardTitle");
  const link = el("a", "", article.title);
  link.href = article.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  title.appendChild(link);
  body.appendChild(title);

  const meta = el("p", "CardMeta");
  const dateText = formatDate(article.publishedAt);
  if (dateText) {
    const time = el("time", "", dateText);
    time.setAttribute("datetime", article.publishedAt);
    meta.appendChild(time);
  }
  if (article.source && article.source.name) meta.appendChild(el("span", "", article.source.name));
  body.appendChild(meta);

  if (article.description) body.appendChild(el("p", "CardDesc", article.description));

  body.appendChild(makeSaveButton(article));
  card.appendChild(body);
  return card;
}

function makeSaveButton(article) {
  const button = el("button", "Btn BtnSave");
  button.type = "button";
  button.dataset.url = article.url;
  button.dataset.title = article.title;
  setSaveButtonLook(button, isSaved(article.url));

  button.addEventListener("click", function () {
    toggleSaved(article);
    savePop(button);
  });
  return button;
}

function setSaveButtonLook(button, saved) {
  button.textContent = saved ? "Saved" : "Save";
  button.setAttribute("aria-pressed", saved ? "true" : "false");
  button.setAttribute("aria-label", (saved ? "Remove from saved: " : "Save story: ") + button.dataset.title);
}



function pickDeadline() {
  const list = deadlines.map(function (d) {
    return Object.assign({ time: new Date(d.closes).getTime() }, d);
  });
  const upcoming = list.filter(function (d) { return d.time > Date.now(); })
    .sort(function (a, b) { return a.time - b.time; });
  if (upcoming.length) return upcoming[0];
  return list.sort(function (a, b) { return b.time - a.time; })[0];
}

function twoDigits(n) {
  return n < 10 ? "0" + n : "" + n;
}

function makeCountdownCard() {
  const deadline = pickDeadline();
  if (!deadline) return null;

  const card = el("li", "Card CardCountdown");
  const isOpen = deadline.time > Date.now();

  const panel = el("div", "CardMedia Countdown");
  panel.appendChild(el("p", "CountdownKicker", isOpen ? "Deadline" : "Applications closed"));
  panel.appendChild(el("p", "CountdownTitle", deadline.title));

  const digits = el("div", "CountdownDigits");
  digits.setAttribute("aria-hidden", "true");
  const numbers = []; 
  ["days", "hrs", "min", "sec"].forEach(function (label, i) {
    if (i > 0) digits.appendChild(el("span", "CountdownSep", ":"));
    const cell = el("div", "CountdownCell");
    const number = el("span", "CountdownNum", "00");
    cell.appendChild(number);
    cell.appendChild(el("span", "CountdownLabel", label));
    digits.appendChild(cell);
    numbers.push(number);
  });
  panel.appendChild(digits);
  card.appendChild(panel);

  const body = el("div", "CardBody");
  const title = el("h3", "CardTitle");
  const link = el("a");
  link.href = deadline.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  title.appendChild(link);
  body.appendChild(title);

  const meta = el("p", "CardMeta");
  const time = el("time", "", formatDate(deadline.closes));
  time.setAttribute("datetime", deadline.closes);
  meta.appendChild(time);
  body.appendChild(meta);
  if (deadline.note) body.appendChild(el("p", "CardDesc", deadline.note));
  card.appendChild(body);

  
  function update() {
    let seconds = Math.floor((deadline.time - Date.now()) / 1000);
    if (seconds <= 0) {
      numbers.forEach(function (n) { n.textContent = "00"; });
      link.textContent = deadline.title + " closed";
      return false;
    }
    const days = Math.floor(seconds / 86400);
    seconds -= days * 86400;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    [days, hours, minutes, seconds].forEach(function (value, i) {
      numbers[i].textContent = twoDigits(value);
    });
    link.textContent = deadline.title + " close in " + days + (days === 1 ? " day" : " days");
    return true;
  }

  if (update()) {
    const timer = setInterval(function () {
      
      if (!document.body.contains(card) || !update()) clearInterval(timer);
    }, 1000);
  }
  return card;
}



function makeSkeletonCards(count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const card = el("li", "Card card--skeleton");
    card.setAttribute("aria-hidden", "true");
    card.appendChild(el("div", "CardMedia Skeleton"));
    const body = el("div", "CardBody");
    body.appendChild(el("div", "Skeleton SkeletonLine"));
    body.appendChild(el("div", "Skeleton skeleton--line SkeletonShort"));
    card.appendChild(body);
    cards.push(card);
  }
  return cards;
}


function makeStateBox(type, options) {
  const box = el("div", "State State" + type.charAt(0).toUpperCase() + type.slice(1));
  box.setAttribute("role", type === "error" ? "alert" : "status");
  box.appendChild(el("h3", "StateTitle", options.title || (type === "error" ? "We could not load stories" : "Nothing here yet")));
  box.appendChild(el("p", "StateText", options.message || ""));

  if (options.onRetry) {
    const button = el("button", "Btn BtnPrimary", options.retryLabel || "Try again");
    button.type = "button";
    button.addEventListener("click", options.onRetry);
    box.appendChild(button);
  }
  return box;
}


function showFeed(container, articles, layout, options) {
  options = options || {};
  container.innerHTML = "";
  container.setAttribute("aria-busy", "false");

  const layoutName = layout || "grid";
  const list = el("ul", "Grid Grid" + layoutName.charAt(0).toUpperCase() + layoutName.slice(1));
  if (options.lead) list.appendChild(options.lead);
  articles.forEach(function (article) { list.appendChild(makeCard(article)); });
  if (list.children.length) container.appendChild(list);

  if (options.state) container.appendChild(makeStateBox(options.state, options.stateOptions || {}));
}

function showLoading(container, lead, count) {
  container.innerHTML = "";
  container.setAttribute("aria-busy", "true");

  const list = el("ul", "Grid");
  if (lead) list.appendChild(lead);
  makeSkeletonCards(count || 4).forEach(function (card) { list.appendChild(card); });
  container.appendChild(list);

  const message = el("p", "SrOnly", "Loading stories");
  message.setAttribute("role", "status");
  container.appendChild(message);
}


function showMessage(container, type, options, lead) {
  showFeed(container, [], "Grid", { lead: lead, state: type, stateOptions: options });
}



function showGuide(container, topic) {
  container.innerHTML = "";
  const guide = topic.guide;
  if (!guide) return;

  const box = el("Section", "Guide");
  box.setAttribute("aria-labelledby", "guide-title");

  const main = el("div", "guide__main");
  const heading = el("h2", "GuideTitle", guide.title);
  heading.id = "guide-title";
  main.appendChild(heading);
  const tips = el("ul", "Ticks");
  guide.tips.forEach(function (tip) { tips.appendChild(el("li", "", tip)); });
  main.appendChild(tips);
  box.appendChild(main);

  const side = el("div", "guide__side");
  if (guide.links.length) {
    side.appendChild(el("h3", "GuideLinksTitle", "Official links"));
    const links = el("ul", "GuideLinks");
    guide.links.forEach(function (item) {
      const li = el("li");
      const a = el("a", "", item.label);
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      li.appendChild(a);
      links.appendChild(li);
    });
    side.appendChild(links);
  }
  side.appendChild(el("p", "GuideNote", "Dates and rules change. Always confirm on the official site."));
  box.appendChild(side);

  container.appendChild(box);
}



function setupHeader() {
  document.getElementById("Year").textContent = new Date().getFullYear();


  const searchText = new URLSearchParams(window.location.search).get("q");
  if (searchText) document.getElementById("SiteSearch").value = searchText;

 
  const accountDialog = document.getElementById("AccountDialog");
  document.querySelectorAll("[data-account]").forEach(function (button) {
    button.addEventListener("click", function () { accountDialog.showModal(); });
  });
  accountDialog.querySelector("[data-close]").addEventListener("click", function () { accountDialog.close(); });
  accountDialog.addEventListener("click", function (e) { if (e.target === accountDialog) accountDialog.close(); });


  const drawer = document.getElementById("SavedDrawer");
  const openButton = document.getElementById("SavedOpen");
  const list = document.getElementById("SavedList");
  const count = document.getElementById("SavedCount");

  function showSavedList() {
    const saved = getSaved();
    count.textContent = saved.length;
    count.hidden = saved.length === 0;
    openButton.setAttribute("aria-label", "Saved stories, " + saved.length + " saved");
    list.innerHTML = "";

    if (!saved.length) {
      list.appendChild(el("li", "DrawerEmpty", "No saved stories yet. Press Save on any story to keep it here."));
      return;
    }

    saved.forEach(function (story) {
      const item = el("li", "DrawerItem");
      const link = el("a", "", story.title);
      link.href = story.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.appendChild(link);

      const details = [];
      if (story.source && story.source.name) details.push(story.source.name);
      if (formatDate(story.publishedAt)) details.push(formatDate(story.publishedAt));
      if (details.length) item.appendChild(el("span", "DrawerMeta", details.join(" · ")));

      const remove = el("button", "Btn BtnGhost", "Remove");
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove from saved: " + story.title);
      remove.addEventListener("click", function () { toggleSaved(story); });
      item.appendChild(remove);

      list.appendChild(item);
    });
  }

  openButton.addEventListener("click", function () {
    showSavedList();
    drawer.showModal();
  });
  document.getElementById("SavedClose").addEventListener("click", function () { drawer.close(); });
  drawer.addEventListener("click", function (e) { if (e.target === drawer) drawer.close(); });

  document.addEventListener("saved-changed", function () {
    showSavedList();
    document.querySelectorAll(".btn--save").forEach(function (button) {
      setSaveButtonLook(button, isSaved(button.dataset.url));
    });
  });

  showSavedList();
}
