

function readCache(topic) {
  try {
    const saved = JSON.parse(sessionStorage.getItem("UniplugzNews" + topic.id));
    if (!saved) return null;
    const minutesOld = (Date.now() - saved.time) / 60000;
    return minutesOld < CACHE_MINUTES ? saved.articles : null;
  } catch (e) {
    return null;
  }
}

function writeCache(topic, articles) {
  try {
    sessionStorage.setItem("UniplugzNews" + topic.id, JSON.stringify({ time: Date.now(), articles: articles }));
  } catch (e) {
    
  }
}

// ----- API Resquest -----


function fitKeywords(terms, maxLength) {
  const kept = [];
  terms.forEach(function (term) {
    if (kept.concat(term).join(" OR ").length <= maxLength) kept.push(term);
  });
  return kept.length ? kept : [terms[0]];
}

// 
function buildUrl(topic, level) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    country: COUNTRY,
    language: LANGUAGE,
    size: "10"
  });

  if (topic.category) params.set("category", topic.category);

  if (level === 0) params.set("q", fitKeywords(topic.terms, 95).join(" OR "));
  else if (level === 1) params.set("q", topic.terms[0]);
  else if (!topic.category) params.set("q", topic.terms[0]);

  return "https://newsdata.io/api/1/latest?" + params.toString();

}




function toArticles(data) {
  if (!data || data.status !== "success" || !Array.isArray(data.results)) throw makeError("SERVER");

  return data.results
   
    .filter(function (r) { return !Array.isArray(r.country) || r.country.length <= 3; })
    .map(function (r) {
      return {
        title: r.title,
        description: r.description || "",
        url: r.link,
        image: r.image_url || "",
       
        publishedAt: r.pubDate ? r.pubDate.replace(" ", "T") + "Z" : "",
        source: { name: r.source_name || "" }
      };
    });
}

function isStudentStory(article) {
  const text = article.title + " " + article.description;
  return studentWords.test(text) || universityNames.test(text);
}


function keepStudentStories(list) {
  const seen = {};
  return list.filter(function (article) {
    if (!article || !article.url || !article.title) return false;
    const key = article.title.toLowerCase().replace(/\W+/g, " ").trim();
    if (seen[key] || seen[article.url]) return false;
    seen[key] = true;
    seen[article.url] = true;
    return isStudentStory(article);
  });
}




function getNews(topic, forceRefresh) {
  if (!forceRefresh) {
    const cached = readCache(topic);
    if (cached) return Promise.resolve(keepStudentStories(cached));
  }

  if (API_KEY.indexOf() === 0) {
    return Promise.reject(makeError());
  }

  function tryLevel(level) {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    return fetch(buildUrl(topic, level), { signal: controller.signal })
      .then(function (response) {
        clearTimeout(timer);
        if (response.status === 401 || response.status === 403) throw makeError("AUTH");
        if (response.status === 429) throw makeError("LIMIT");
        if (response.status === 400 || response.status === 422) {
          


          return response.json().catch(function () { return null; }).then(function (body) {
            console.warn("News API refused the search:", body && body.results ? body.results.message : response.status);
            throw makeError("QUERY");
          });
        }
        if (!response.ok) throw makeError("SERVER");
        return response.json();
      })
      .then(function (data) {
        const articles = toArticles(data);
        writeCache(topic, articles);
        return keepStudentStories(articles);
      })
      .catch(function (err) {
        clearTimeout(timer);
        
        if (err.code === "QUERY" && level < 2) return tryLevel(level + 1);
        if (err.code) throw err;
        if (err.name === "AbortError") throw makeError("TIMEOUT");
        throw makeError("OFFLINE");
      });
  }

  return tryLevel(0);
}



function makeError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function errorText(err) {
  const messages = {
    NO_KEY: "",
    AUTH: "",
    LIMIT: "",
    QUERY: "",
    OFFLINE: "",
    TIMEOUT: "",
    SERVER: ""
  };
  return messages[err.code] || "Something went wrong while loading stories.";
}
