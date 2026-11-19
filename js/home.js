
setupHeader();
heroAnimation();

const feed = document.getElementById("Feed");


const tileList = document.getElementById("TopicTiles");
topics.forEach(function (topic) {
  const tile = el("li", "tile");
  const link = el("a", "TileLink");
  link.href = "topics.html?topic=" + topic.id;

  const frame = el("span", "TileFrame");
  const img = document.createElement("img");
  img.src = topic.image;
  img.alt = "";
  img.width = 400;
  img.height = 300;
  img.loading = "lazy";
  frame.appendChild(img);

  link.appendChild(frame);
  link.appendChild(el("span", "TileLabel", topic.short));
  tile.appendChild(link);
  tileList.appendChild(tile);
});

revealOnScroll(tileList.querySelectorAll(".tile"), tileList);
revealOnScroll(document.querySelectorAll(".ToolkitCard"), document.querySelector(".toolkit"));


function loadNews(forceRefresh) {
  const countdown = makeCountdownCard();
  showLoading(feed, countdown, 3);

  getNews(welcomeTopic, forceRefresh)
    .then(function (articles) {
      if (!articles.length) {
        showMessage(feed, "empty", {
          title: "No student stories right now",
          message: "Nothing relevant came back today. Browse a topic for guides and official links, or refresh later.",
          retryLabel: "Browse topics",
          onRetry: function () { window.location.href = "topics.html"; }
        }, countdown);
        return;
      }

      
      articles.sort(function (a, b) {
        const aUrgent = getBadges(a).includes("TimeSensitive") ? 1 : 0;
        const bUrgent = getBadges(b).includes("TimeSensitive") ? 1 : 0;
        return bUrgent - aUrgent;
      });

      showFeed(feed, articles.slice(0, 10), "Grid", { lead: countdown });
      staggerIn(feed.querySelectorAll(".card"));
    })
    .catch(function (err) {
      showMessage(feed, "error", {
        message: errorText(err),
        onRetry: function () { loadNews(true); }
      }, countdown);
    });
}

document.getElementById("Refresh").addEventListener("click", function () { loadNews(true); });
loadNews(false);
