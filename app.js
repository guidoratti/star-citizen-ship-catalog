(function () {
  "use strict";

  const ships = Array.isArray(window.SHIPS_DATA) ? window.SHIPS_DATA : [];
  let activeFilter = "relevant";
  let selectedMfg = "all";
  let sortMode = "relevant";

  // Elements
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const totalBadge = document.getElementById("totalBadge");
  const resultCount = document.getElementById("resultCount");
  const mfgSelect = document.getElementById("mfgSelect");
  const sortSelect = document.getElementById("sortSelect");
  const filterTabs = document.querySelectorAll(".filter-tab");
  const filterBar = document.getElementById("filterBar");
  const brandHome = document.getElementById("brandHome");

  const catalogView = document.getElementById("catalogView");
  const shipGrid = document.getElementById("shipGrid");
  const emptyState = document.getElementById("emptyState");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  const detailView = document.getElementById("detailView");
  const backBtn = document.getElementById("backBtn");
  const rsiLinkBtn = document.getElementById("rsiLinkBtn");
  const heroFrame = document.getElementById("heroFrame");
  const detailImg = document.getElementById("detailImg");
  const detailMfg = document.getElementById("detailMfg");
  const detailName = document.getElementById("detailName");
  const detailStatusBadge = document.getElementById("detailStatusBadge");
  const detailPriceBadge = document.getElementById("detailPriceBadge");
  const detailStoreBadge = document.getElementById("detailStoreBadge");
  const detailProdNote = document.getElementById("detailProdNote");
  const detailIngameBox = document.getElementById("detailIngameBox");
  const detailMetaLine = document.getElementById("detailMetaLine");
  const detailDescription = document.getElementById("detailDescription");
  const detailSpecs = document.getElementById("detailSpecs");
  const componentsCard = document.getElementById("componentsCard");
  const componentsGrid = document.getElementById("componentsGrid");

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function isFlightReady(ship) {
    return (ship.production_status || "").toLowerCase().includes("flight");
  }

  function displayStatus(ship) {
    if (!ship.production_status) return "UNKNOWN";
    return ship.production_status.replace(/-/g, " ").toUpperCase();
  }

  function displayPrice(ship) {
    if (ship.price && Number(ship.price) > 0) {
      return "$" + Number(ship.price).toLocaleString("en-US") + " USD";
    }
    return "Price N/A";
  }

  function formatAuec(val) {
    if (val == null || Number(val) <= 0) return "";
    return Number(val).toLocaleString("en-US") + " aUEC";
  }

  function displayCrew(ship) {
    if (ship.min_crew != null && ship.max_crew != null) {
      return ship.min_crew === ship.max_crew
        ? String(ship.min_crew)
        : ship.min_crew + "-" + ship.max_crew;
    }
    if (ship.max_crew != null) return String(ship.max_crew);
    if (ship.min_crew != null) return String(ship.min_crew);
    return "-";
  }

  function displayCargo(ship) {
    if (ship.cargocapacity != null) {
      return Number(ship.cargocapacity).toLocaleString("en-US") + " SCU";
    }
    return "0 SCU";
  }

  function formatMetric(val, unit) {
    if (val == null || Number(val) <= 0) return "-";
    return Number(val).toLocaleString("en-US") + " " + unit;
  }

  function populateManufacturers() {
    const mfgs = Array.from(
      new Set(ships.map((s) => s.manufacturer).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    mfgs.forEach((mfg) => {
      const opt = document.createElement("option");
      opt.value = mfg;
      opt.textContent = mfg;
      mfgSelect.appendChild(opt);
    });
  }

  function getFilteredShips() {
    const q = searchInput.value.trim().toLowerCase();
    let list = ships.slice();

    if (selectedMfg !== "all") {
      list = list.filter((s) => s.manufacturer === selectedMfg);
    }

    if (q) {
      list = list.filter((s) => {
        const locMatch = Array.isArray(s.ingame_locations) && s.ingame_locations.some((loc) =>
          (loc.shop && loc.shop.toLowerCase().includes(q)) ||
          (loc.location && loc.location.toLowerCase().includes(q))
        );
        return (
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.manufacturer && s.manufacturer.toLowerCase().includes(q)) ||
          (s.manufacturer_code && s.manufacturer_code.toLowerCase().includes(q)) ||
          (s.focus && s.focus.toLowerCase().includes(q)) ||
          (s.type && s.type.toLowerCase().includes(q)) ||
          (s.size && s.size.toLowerCase().includes(q)) ||
          locMatch
        );
      });
    }

    if (activeFilter === "ingame") {
      list = list.filter((s) => Boolean(s.ingame_available));
    } else if (activeFilter === "flight-ready") {
      list = list.filter(isFlightReady);
    } else if (activeFilter === "in-concept") {
      list = list.filter((s) => !isFlightReady(s));
    } else if (activeFilter === "purchasable") {
      list = list.filter((s) => Boolean(s.purchasable));
    }

    // Sorting
    if (sortMode === "relevant") {
      list.sort((a, b) => {
        const ageDiff = (a.age_minutes || 99999999) - (b.age_minutes || 99999999);
        if (ageDiff !== 0) return ageDiff;
        if (Boolean(b.purchasable) !== Boolean(a.purchasable)) {
          return b.purchasable ? 1 : -1;
        }
        return (b.id || 0) - (a.id || 0);
      });
    } else if (sortMode === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortMode === "auec-asc") {
      list.sort((a, b) => (a.ingame_price_auec || 999999999999) - (b.ingame_price_auec || 999999999999));
    } else if (sortMode === "auec-desc") {
      list.sort((a, b) => (b.ingame_price_auec || 0) - (a.ingame_price_auec || 0));
    } else if (sortMode === "price-asc") {
      list.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    } else if (sortMode === "price-desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortMode === "cargo-desc") {
      list.sort((a, b) => (b.cargocapacity || 0) - (a.cargocapacity || 0));
    }

    // Default "Most Relevant" tab shows top 36 when not actively searching
    if (activeFilter === "relevant" && !q) {
      list = list.slice(0, 36);
    }

    return list;
  }

  function renderGrid() {
    const filtered = getFilteredShips();
    const q = searchInput.value.trim();

    if (q) {
      resultCount.textContent = `Found ${filtered.length} ships matching "${q}"`;
    } else if (activeFilter === "relevant") {
      resultCount.textContent = `Top ${filtered.length} most relevant ships (of ${ships.length} total)`;
    } else {
      resultCount.textContent = `Showing ${filtered.length} of ${ships.length} ships`;
    }

    shipGrid.innerHTML = "";
    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    const frag = document.createDocumentFragment();
    filtered.forEach((ship) => {
      const card = document.createElement("article");
      card.className = "ship-card";
      card.tabIndex = 0;

      const ready = isFlightReady(ship);
      const statusClass = ready ? "badge-flight-ready" : "badge-in-concept";
      const priceText = displayPrice(ship);
      const hasPrice = ship.price && Number(ship.price) > 0;
      const imgUrl = ship.image_thumb || ship.image_full || "";

      let ingameHtml = "";
      if (ship.ingame_available && ship.ingame_price_auec) {
        const locs = Array.isArray(ship.ingame_locations) ? ship.ingame_locations : [];
        const locSummary = locs.length > 1
          ? `${locs[0].shop} (+${locs.length - 1} more)`
          : (locs.length === 1 ? locs[0].shop : "In-Game Ship Shop");
        ingameHtml = `
          <div class="card-ingame">
            <span class="card-ingame-price">Available in-game for ${escapeHtml(formatAuec(ship.ingame_price_auec))}</span>
            <span class="card-ingame-loc">📍 ${escapeHtml(locSummary)}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="card-media">
          <img src="${escapeAttr(imgUrl)}" alt="${escapeAttr(ship.name)}" loading="lazy" />
          <span class="badge-status ${statusClass}">${escapeHtml(displayStatus(ship))}</span>
          ${ship.manufacturer_code ? `<span class="badge-mfg">${escapeHtml(ship.manufacturer_code)}</span>` : ""}
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(ship.name)}</h3>
          <div class="card-sub">${escapeHtml(ship.manufacturer || "Unknown")} &nbsp;•&nbsp; ${escapeHtml(ship.focus || ship.type || "Spaceship")}</div>
          <div class="card-footer">
            <span class="card-price ${hasPrice ? "" : "na"}">${escapeHtml(priceText)}</span>
            <span class="card-mini-specs">Crew ${escapeHtml(displayCrew(ship))} &nbsp;•&nbsp; ${escapeHtml(displayCargo(ship))}</span>
          </div>
          ${ingameHtml}
        </div>
      `;

      card.addEventListener("click", () => openShipDetail(ship));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openShipDetail(ship);
        }
      });

      frag.appendChild(card);
    });

    shipGrid.appendChild(frag);
  }

  function openShipDetail(ship) {
    catalogView.classList.add("hidden");
    filterBar.classList.add("hidden");
    detailView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const heroUrl = ship.image_full || ship.image_thumb || "";
    detailImg.src = heroUrl;
    detailImg.alt = ship.name || "Star Citizen Ship";

    detailMfg.textContent =
      (ship.manufacturer || "Unknown") +
      (ship.manufacturer_code ? ` [${ship.manufacturer_code}]` : "");
    detailName.textContent = ship.name || "Unknown Ship";

    const ready = isFlightReady(ship);
    detailStatusBadge.textContent = "STATUS: " + displayStatus(ship);
    detailStatusBadge.className = "pill " + (ready ? "pill-green" : "pill-amber");

    detailPriceBadge.textContent = displayPrice(ship);

    detailStoreBadge.textContent = ship.purchasable
      ? "AVAILABLE IN RSI STORE"
      : "LIMITED / NOT IN STORE";
    detailStoreBadge.className =
      "pill pill-store" + (ship.purchasable ? "" : " limited");

    if (ship.production_note) {
      detailProdNote.textContent = "Production Note: " + ship.production_note;
      detailProdNote.classList.remove("hidden");
    } else {
      detailProdNote.classList.add("hidden");
    }

    // In-Game aUEC Availability & Purchase Locations
    if (ship.ingame_available && ship.ingame_price_auec) {
      detailIngameBox.className = "ingame-box";
      const locs = Array.isArray(ship.ingame_locations) ? ship.ingame_locations : [];
      const verTag = ship.ingame_version ? `<span class="ingame-ver">SC ${escapeHtml(ship.ingame_version)}</span>` : "";
      const locsHtml = locs.length > 0
        ? `
          <div class="ingame-loc-heading">WHERE TO BUY IN-GAME</div>
          <ul class="ingame-loc-list">
            ${locs.map((loc) => `
              <li class="ingame-loc-item">
                <div>
                  <div class="ingame-shop-name">📍 ${escapeHtml(loc.shop)}</div>
                  ${loc.location ? `<div class="ingame-shop-place">${escapeHtml(loc.location)}</div>` : ""}
                </div>
                <span class="ingame-shop-price">${escapeHtml(formatAuec(loc.price))}</span>
              </li>
            `).join("")}
          </ul>
        `
        : "";
      detailIngameBox.innerHTML = `
        <div class="ingame-header">
          <span class="ingame-title">Available in-game for ${escapeHtml(formatAuec(ship.ingame_price_auec))}</span>
          ${verTag}
        </div>
        ${locsHtml}
      `;
    } else {
      detailIngameBox.className = "ingame-box unavailable";
      detailIngameBox.innerHTML = `
        <div class="ingame-header">
          <span class="ingame-title">Not currently available for in-game aUEC purchase</span>
        </div>
      `;
    }

    detailMetaLine.textContent = `Role: ${ship.focus || "N/A"}   •   Type: ${ship.type || "N/A"}   •   Size: ${ship.size || "N/A"}`;
    detailDescription.textContent = ship.description || "No description available.";

    if (ship.rsi_url) {
      rsiLinkBtn.href = ship.rsi_url;
      rsiLinkBtn.classList.remove("hidden");
    } else {
      rsiLinkBtn.classList.add("hidden");
    }

    // Technical Specs
    const specs = [
      ["LENGTH", formatMetric(ship.length, "m")],
      ["BEAM", formatMetric(ship.beam, "m")],
      ["HEIGHT", formatMetric(ship.height, "m")],
      ["MASS", formatMetric(ship.mass, "kg")],
      ["CREW", displayCrew(ship)],
      ["CARGO", displayCargo(ship)],
      ["SCM SPEED", formatMetric(ship.scm_speed, "m/s")],
      ["MAX SPEED", formatMetric(ship.afterburner_speed, "m/s")],
      [
        "PITCH / YAW / ROLL",
        `${ship.pitch_max ?? "-"}/${ship.yaw_max ?? "-"}/${ship.roll_max ?? "-"} °/s`,
      ],
    ];

    detailSpecs.innerHTML = specs
      .map(
        ([label, val]) => `
        <div class="spec-box">
          <div class="spec-label">${escapeHtml(label)}</div>
          <div class="spec-value">${escapeHtml(val)}</div>
        </div>`
      )
      .join("");

    // Components
    if (Array.isArray(ship.components) && ship.components.length > 0) {
      componentsCard.classList.remove("hidden");
      componentsGrid.innerHTML = ship.components
        .map(
          (c) => `
          <div class="comp-box">
            <div class="comp-cat">${escapeHtml(c.category)}</div>
            <div class="comp-items">${escapeHtml(c.items)}</div>
          </div>`
        )
        .join("");
    } else {
      componentsCard.classList.add("hidden");
    }
  }

  function showCatalog() {
    detailView.classList.add("hidden");
    filterBar.classList.remove("hidden");
    catalogView.classList.remove("hidden");
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  // Event Listeners
  searchInput.addEventListener("input", () => {
    const hasText = searchInput.value.length > 0;
    clearSearchBtn.classList.toggle("hidden", !hasText);
    if (!detailView.classList.contains("hidden") && hasText) {
      showCatalog();
    }
    renderGrid();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.classList.add("hidden");
    searchInput.focus();
    renderGrid();
  });

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      renderGrid();
    });
  });

  mfgSelect.addEventListener("change", () => {
    selectedMfg = mfgSelect.value;
    renderGrid();
  });

  sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value;
    renderGrid();
  });

  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.classList.add("hidden");
    selectedMfg = "all";
    mfgSelect.value = "all";
    activeFilter = "all";
    filterTabs.forEach((t) =>
      t.classList.toggle("active", t.dataset.filter === "all")
    );
    renderGrid();
  });

  backBtn.addEventListener("click", showCatalog);
  brandHome.addEventListener("click", () => {
    showCatalog();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  heroFrame.addEventListener("click", () => {
    if (!detailImg.src) return;
    lightboxImg.src = detailImg.src;
    lightboxImg.alt = detailImg.alt;
    lightbox.classList.remove("hidden");
  });

  lightbox.addEventListener("click", () => lightbox.classList.add("hidden"));
  lightboxClose.addEventListener("click", () => lightbox.classList.add("hidden"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!lightbox.classList.contains("hidden")) {
        lightbox.classList.add("hidden");
      } else if (!detailView.classList.contains("hidden")) {
        showCatalog();
      }
    } else if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Init
  totalBadge.textContent = `${ships.length} Ships`;
  populateManufacturers();
  renderGrid();
  initLiberatorArcade();

  function initLiberatorArcade() {
    const canvas = document.getElementById("liberatorCanvas");
    const viewport = document.getElementById("liberatorViewport");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Click viewport to open the Anvil Liberator detail page
    if (viewport) {
      viewport.addEventListener("click", () => {
        const lib = ships.find((s) => (s.name || "").toLowerCase() === "liberator") ||
                    ships.find((s) => (s.name || "").toLowerCase().includes("liberator"));
        if (lib) openShipDetail(lib);
      });
    }

    const sprite = new Image();
    sprite.src = "liberator_pixel.png";

    // 3-layer retro parallax pixel stars
    const starColors = ["#ffffff", "#bae6fd", "#fde68a", "#c4b5fd", "#7dd3fc"];
    const stars = [];
    for (let i = 0; i < 68; i++) {
      const layer = i < 34 ? 0 : (i < 56 ? 1 : 2);
      stars.push({
        x: Math.floor(Math.random() * W),
        y: Math.floor(Math.random() * (H - 12)),
        speed: layer === 0 ? 0.35 : (layer === 1 ? 0.95 : 2.2),
        size: layer === 2 ? 2 : 1,
        color: layer === 0 ? "#475569" : starColors[i % starColors.length],
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    // Distant slow-drifting 32-bit pixel planet
    let planetX = W + 30;
    const planetY = 26;

    // Exhaust particles emitted from twin rear engines
    const particles = [];
    let frame = 0;

    function spawnExhaust(ex, ey) {
      particles.push({
        x: ex,
        y: ey + (Math.random() * 5 - 2.5),
        vx: -(2.4 + Math.random() * 2.2),
        vy: (Math.random() - 0.5) * 0.35,
        life: 14 + Math.floor(Math.random() * 14),
        maxLife: 28,
        size: Math.random() > 0.45 ? 2 : 1,
      });
    }

    function drawPixelPlanet(px, py) {
      const r = 13;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const dist = dx * dx + dy * dy;
          if (dist <= r * r) {
            // Simple 32-bit crescent shading
            if (dx > 4) ctx.fillStyle = "#1e1b4b";
            else if (dx > -2) ctx.fillStyle = "#312e81";
            else if ((dx + dy) % 5 === 0) ctx.fillStyle = "#6366f1";
            else ctx.fillStyle = "#4338ca";
            ctx.fillRect(Math.floor(px + dx), Math.floor(py + dy), 1, 1);
          }
        }
      }
      // Subtle pixel ring
      ctx.fillStyle = "rgba(129, 140, 248, 0.55)";
      ctx.fillRect(Math.floor(px - 19), Math.floor(py + 1), 38, 1);
    }

    function drawThrusterFlame(ex, ey, t) {
      const flicker = Math.floor(Math.sin(t * 28 + ey) * 4 + Math.random() * 5);
      const len = 14 + flicker;
      // Outer electric blue glow
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(ex - len - 4, ey - 3, len + 4, 7);
      // Mid bright cyan jet
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(ex - len, ey - 2, len, 5);
      // White-hot core
      ctx.fillStyle = "#f0f9ff";
      ctx.fillRect(ex - Math.max(5, Math.floor(len * 0.48)), ey - 1, Math.max(5, Math.floor(len * 0.48)), 3);
    }

    function tick() {
      frame++;
      const t = frame / 60;

      // Deep space background
      ctx.fillStyle = "#03050d";
      ctx.fillRect(0, 0, W, H);

      // Subtle 80s retro nebula band
      ctx.fillStyle = "rgba(30, 27, 75, 0.28)";
      ctx.fillRect(0, 24, W, 38);
      ctx.fillStyle = "rgba(14, 116, 144, 0.12)";
      ctx.fillRect(0, 44, W, 24);

      // Slow distant planet
      planetX -= 0.14;
      if (planetX < -30) planetX = W + 45;
      drawPixelPlanet(planetX, planetY);

      // Parallax stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x -= s.speed;
        if (s.x < -2) {
          s.x = W + 2;
          s.y = Math.floor(Math.random() * (H - 14));
        }
        const blink = Math.sin(t * 5 + s.twinkle) > -0.75;
        if (blink) {
          ctx.fillStyle = s.color;
          ctx.fillRect(Math.floor(s.x), s.y, s.size, s.size);
        }
      }

      // Liberator ship position (gentle retro cruise hover)
      const shipW = 144;
      const shipH = 74;
      const shipX = Math.floor(W * 0.5 - shipW * 0.45 + Math.cos(t * 1.1) * 6);
      const shipY = Math.floor(14 + Math.sin(t * 2.3) * 3.5);

      // Twin rear engine nozzles on left side of the Liberator sprite
      const topEngineX = shipX + 2;
      const topEngineY = shipY + 11;
      const botEngineX = shipX + 2;
      const botEngineY = shipY + 50;

      // Spawn & update exhaust pixel particles
      if (frame % 2 === 0) {
        spawnExhaust(topEngineX - 4, topEngineY);
        spawnExhaust(botEngineX - 4, botEngineY);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const ratio = p.life / p.maxLife;
        if (ratio > 0.6) ctx.fillStyle = "#7dd3fc";
        else if (ratio > 0.3) ctx.fillStyle = "#0ea5e9";
        else ctx.fillStyle = "#1d4ed8";
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }

      // Draw twin thruster flames behind engines
      drawThrusterFlame(topEngineX, topEngineY, t);
      drawThrusterFlame(botEngineX, botEngineY, t);

      // Draw crisp pixel-art Anvil Liberator sprite
      if (sprite.complete && sprite.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, shipX, shipY, shipW, shipH);
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }
})();
