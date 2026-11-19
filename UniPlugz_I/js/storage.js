

const SavedKey = "UniplugzSaved";

function getSaved() {
  try {
    const list = JSON.parse(localStorage.getItem(SavedKey) || "[]");
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function setSaved(list) {
  try {
    localStorage.setItem(SavedKey, JSON.stringify(list));
  } catch (e) {
   
  }
  
  document.dispatchEvent(new CustomEvent("SavedChanged"));
}

function isSaved(url) {
  return getSaved().some(function (story) { return story.url === url; });
}


function toggleSaved(article) {
  const list = getSaved();
  const index = list.findIndex(function (story) { return story.url === article.url; });

  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.unshift({
      url: article.url,
      title: article.title,
      description: article.description || "",
      image: article.image || "",
      publishedAt: article.publishedAt || "",
      source: article.source || null
    });
  }
  setSaved(list);
}
