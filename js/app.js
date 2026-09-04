(function () {
  "use strict";

  var data = (window.WORLD_SERIES_DATA || []).slice().sort(function (a, b) {
    return a.year - b.year;
  });

  var timelineEl = document.getElementById("timeline");
  var eraFilterEl = document.getElementById("eraFilter");
  var searchInput = document.getElementById("searchInput");
  var emptyStateEl = document.getElementById("emptyState");
  var overlayEl = document.getElementById("detailOverlay");
  var detailContentEl = document.getElementById("detailContent");
  var detailCloseBtn = document.getElementById("detailClose");

  var activeDecade = "all";
  var searchTerm = "";

  function decadeOf(year) {
    return Math.floor(year / 10) * 10;
  }

  function decadeLabel(decade) {
    return decade + "s";
  }

  function matchesSearch(entry, term) {
    if (!term) return true;
    var haystack = [
      String(entry.year),
      entry.winner || "",
      entry.loser || "",
      entry.mvp || ""
    ].join(" ").toLowerCase();
    return haystack.indexOf(term) !== -1;
  }

  function buildEraFilter() {
    var decades = [];
    data.forEach(function (entry) {
      var d = decadeOf(entry.year);
      if (decades.indexOf(d) === -1) decades.push(d);
    });
    decades.sort(function (a, b) { return a - b; });

    var allChip = document.createElement("button");
    allChip.className = "era-chip active";
    allChip.textContent = "All Eras";
    allChip.dataset.decade = "all";
    eraFilterEl.appendChild(allChip);

    decades.forEach(function (d) {
      var chip = document.createElement("button");
      chip.className = "era-chip";
      chip.textContent = decadeLabel(d);
      chip.dataset.decade = String(d);
      eraFilterEl.appendChild(chip);
    });

    eraFilterEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".era-chip");
      if (!btn) return;
      activeDecade = btn.dataset.decade;
      Array.prototype.forEach.call(eraFilterEl.querySelectorAll(".era-chip"), function (c) {
        c.classList.toggle("active", c === btn);
      });
      render();
    });
  }

  function render() {
    timelineEl.innerHTML = "";

    var filtered = data.filter(function (entry) {
      var decadeOk = activeDecade === "all" || decadeOf(entry.year) === Number(activeDecade);
      return decadeOk && matchesSearch(entry, searchTerm);
    });

    if (filtered.length === 0) {
      emptyStateEl.hidden = false;
      return;
    }
    emptyStateEl.hidden = true;

    var groups = {};
    var order = [];
    filtered.forEach(function (entry) {
      var d = decadeOf(entry.year);
      if (!groups[d]) {
        groups[d] = [];
        order.push(d);
      }
      groups[d].push(entry);
    });
    order.sort(function (a, b) { return a - b; });

    order.forEach(function (d) {
      var section = document.createElement("section");
      section.className = "decade-section";

      var heading = document.createElement("div");
      heading.className = "decade-heading";
      heading.innerHTML =
        "<h2>" + decadeLabel(d) + "</h2>" +
        '<span class="decade-count">' + groups[d].length + " series</span>";
      section.appendChild(heading);

      var grid = document.createElement("div");
      grid.className = "year-grid";

      groups[d].forEach(function (entry) {
        grid.appendChild(buildYearCard(entry));
      });

      section.appendChild(grid);
      timelineEl.appendChild(section);
    });
  }

  function buildYearCard(entry) {
    var card = document.createElement("button");
    card.className = "year-card" + (entry.played === false ? " no-series" : "");
    card.type = "button";

    if (entry.played === false) {
      card.innerHTML =
        '<span class="card-year">' + entry.year + '</span>' +
        '<span class="card-winner">No World Series played</span>' +
        '<span class="card-meta">' + escapeHtml(entry.note || "") + '</span>';
    } else {
      var meta = "def. " + escapeHtml(entry.loser || "?") + " (" + escapeHtml(entry.result || "?") + ")";
      card.innerHTML =
        '<span class="card-year">' + entry.year + '</span>' +
        '<span class="card-winner">' + escapeHtml(entry.winner || "Unknown") + '</span>' +
        '<span class="card-meta">' + meta + '</span>' +
        (entry.mvp ? '<span class="card-meta">MVP: ' + escapeHtml(entry.mvp) + '</span>' : '');
    }

    card.addEventListener("click", function () {
      openDetail(entry);
    });
    return card;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function openDetail(entry) {
    var html = "";
    html += '<p class="detail-year">' + entry.year + " World Series</p>";

    if (entry.played === false) {
      html += '<h2 class="detail-title" id="detailTitle">Not Played</h2>';
      html += '<div class="detail-note">' + escapeHtml(entry.note || "No series was played this year.") + "</div>";
    } else {
      html += '<h2 class="detail-title" id="detailTitle">' + escapeHtml(entry.winner || "Unknown") + "</h2>";
      html += '<p class="detail-sub">defeated ' + escapeHtml(entry.loser || "?") + ", " + escapeHtml(entry.result || "?") + "</p>";
      if (entry.mvp) {
        html += '<span class="detail-mvp">World Series MVP: ' + escapeHtml(entry.mvp) + "</span>";
      } else {
        html += '<span class="detail-mvp">World Series MVP: award not given until 1955</span>';
      }
      if (entry.note) {
        html += '<div class="detail-note">' + escapeHtml(entry.note) + "</div>";
      }

      if (entry.games && entry.games.length) {
        html += '<table class="games-table"><thead><tr>' +
          "<th>Game</th><th>Matchup</th><th>Score</th><th>Venue</th>" +
          "</tr></thead><tbody>";
        entry.games.forEach(function (g) {
          var isTie = !g.winner;
          var winnerCell = isTie
            ? '<span class="game-winner-name">Tie</span>'
            : '<span class="game-winner-name' + (g.winner === entry.winner ? " is-champ" : "") + '">' + escapeHtml(g.winner) + "</span> def. " + escapeHtml(g.loser || "");
          var scoreCell = isTie
            ? (g.winnerScore != null ? g.winnerScore + "&ndash;" + g.loserScore : "&mdash;")
            : (g.winnerScore != null ? g.winnerScore + "&ndash;" + g.loserScore : "&mdash;");
          html += "<tr><td>" + g.game + "</td><td>" + winnerCell +
            (g.note ? '<br><span class="game-note">' + escapeHtml(g.note) + "</span>" : "") +
            '</td><td class="game-score">' + scoreCell + "</td><td>" + escapeHtml(g.venue || "") + "</td></tr>";
        });
        html += "</tbody></table>";
      }
    }

    detailContentEl.innerHTML = html;
    overlayEl.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeDetail() {
    overlayEl.hidden = true;
    document.body.style.overflow = "";
  }

  detailCloseBtn.addEventListener("click", closeDetail);
  overlayEl.addEventListener("click", function (e) {
    if (e.target === overlayEl) closeDetail();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlayEl.hidden) closeDetail();
  });

  searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value.trim().toLowerCase();
    render();
  });

  buildEraFilter();
  render();
})();
