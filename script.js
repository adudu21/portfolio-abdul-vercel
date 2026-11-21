/* ============================================================
   NAV MENU (mobile)
============================================================ */
const contactEmail = document.querySelector(".contact-mail");
const isTouchDevice =
  window.matchMedia("(pointer: coarse)").matches ||
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

if (contactEmail && isTouchDevice) {
  contactEmail.href =
    "mailto:abdul.rahman220707@gmail.com?subject=Portfolio%20Inquiry%20%E2%80%94%20Abdul%20Rahman";
  contactEmail.removeAttribute("target");
}

const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");
menu?.addEventListener("click", () => nav.classList.toggle("open"));
document
  .querySelectorAll("nav a")
  .forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open")),
  );
document.addEventListener("click", (event) => {
  if (!nav.classList.contains("open")) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (nav.contains(target) || menu?.contains(target)) return;
  nav.classList.remove("open");
});

/* ============================================================
   GALLERY DATA
============================================================ */
const HERO_CATEGORIES = [
  "portrait",
  "community",
  "street",
  "urban",
  "architecture",
  "automotive",
  "design-graphic",
  "product",
];

const CATEGORY_ORDER = [
  "portrait",
  "community",
  "street",
  "urban",
  "architecture",
  "automotive",
  "product",
  "design-graphic",
];
const CATEGORIES = [
  ...CATEGORY_ORDER.map((key) => GALLERY_DATA.find((item) => item.key === key))
    .filter(Boolean)
    .map(({ key, label }) => ({ key, label })),
  ...GALLERY_DATA.filter((item) => !CATEGORY_ORDER.includes(item.key)).map(
    ({ key, label }) => ({ key, label }),
  ),
];

function isVideoCategory(category) {
  return [category?.key, category?.label].some(
    (value) =>
      String(value || "")
        .trim()
        .toLowerCase() === "video",
  );
}

function updateAboutStatistics() {
  const today = new Date();
  const years = Math.max(
    0,
    today.getFullYear() - 2023 - (today.getMonth() < 10 ? 1 : 0),
  );
  const yearsStat = document.getElementById("yearsExploringStat");
  const categoriesStat = document.getElementById("photographyCategoriesStat");

  if (yearsStat) yearsStat.textContent = `${String(years).padStart(2, "0")}+`;
  if (categoriesStat) {
    const categoryCount = CATEGORIES.filter(
      (category) => !isVideoCategory(category),
    ).length;
    categoriesStat.textContent = String(categoryCount).padStart(2, "0");
  }
}

const CLOUD_NAME = "jpf3dlss";
const UPLOAD_PRESET = "Portofolio";
const CLOUDINARY_ASSETS_API = "/api/cloudinary/assets";
const CLOUDINARY_DELETE_API = "/api/cloudinary/delete";
const CLOUDINARY_CONTEXT_API = "/api/cloudinary/assets/context";
const GALLERY_STATE_API = "/api/gallery-state";
const PROFILE_PHOTO_API = CLOUDINARY_DELETE_API.replace(
  /\/cloudinary\/delete\/?$/,
  "/profile-photo",
);
const PROFILE_PHOTO_API_BASE =
  window.location.protocol === "file:"
    ? "http://localhost:3000/"
    : window.location.href;
const CLOUDINARY_DELETE_ENDPOINT = new URL(
  CLOUDINARY_DELETE_API,
  PROFILE_PHOTO_API_BASE,
).href;
const CATEGORIES_API = "/api/categories";
const firebaseConfig = {
  apiKey: "AIzaSyDriHZJ6GLePaOTOWKXjWaaSUI05rw-A_8",
  authDomain: "abdul-portfolio-643c2.firebaseapp.com",
  projectId: "abdul-portfolio-643c2",
  messagingSenderId: "165480524451",
  appId: "1:165480524451:web:4fe9321da541b104caed16",
  measurementId: "G-EP6HCJMS30",
};
const FIREBASE_ADMIN_UID = "WRuEWyHU6mhiwX1hEz1Jm5h0M7N2";
const FIREBASE_VERSION = "11.10.0";
const CLOUDINARY_UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

let firebaseServices = null;
let firebaseReady = null;

/* ============================================================
   HERO CAROUSEL
   ---------------------------------------------------------
   Uses optimized thumbnails rather than the original 2–3 MB
   files. This keeps the hero responsive while scrolling.
============================================================ */
const HERO_AUTOPLAY_MS = 4500;

function initHeroCarousel() {
  const carousel = document.getElementById("heroCarousel");
  const frontCard = document.getElementById("heroFront");
  const frontImg = document.getElementById("heroImgFront");
  const backImg = document.getElementById("heroImgBack");
  const labelCat = document.getElementById("heroLabelCat");
  const labelIndex = document.getElementById("heroLabelIndex");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  if (!carousel || !frontImg) return;

  const slides = HERO_CATEGORIES.map((key) => {
    const cat = GALLERY_DATA.find((item) => item.key === key);
    const file = cat?.files?.[0];
    return file ? { key, label: cat.label, src: file.src } : null;
  }).filter(Boolean);

  if (!slides.length) return;

  let index = 0;
  let animating = false;
  let timer = null;

  function labelFor(i) {
    labelCat.textContent = slides[i].label.toUpperCase();
    labelIndex.textContent = `${String(i + 1).padStart(2, "0")} / ${String(
      slides.length,
    ).padStart(2, "0")}`;
  }

  function render() {
    frontImg.src = slides[index].src;
    frontImg.decoding = "async";
    labelFor(index);
    backImg.src = slides[(index + 1) % slides.length].src;
  }

  function go(direction) {
    if (animating || slides.length < 2) return;
    animating = true;
    const exitClass = direction > 0 ? "fly-left" : "fly-right";
    const enterClass = direction > 0 ? "fly-right" : "fly-left";

    frontCard.classList.add(exitClass);
    setTimeout(() => {
      index = (index + direction + slides.length) % slides.length;
      frontCard.style.transition = "none";
      frontCard.classList.remove(exitClass);
      frontCard.classList.add(enterClass);
      frontImg.src = slides[index].src;
      labelFor(index);
      backImg.src = slides[(index + 1) % slides.length].src;
      void frontCard.offsetWidth;
      frontCard.style.transition = "";
      frontCard.classList.remove(enterClass);
      animating = false;
    }, 550);
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    if (slides.length > 1) timer = setInterval(() => go(1), HERO_AUTOPLAY_MS);
  }

  prevBtn?.addEventListener("click", () => {
    go(-1);
    restartAutoplay();
  });
  nextBtn?.addEventListener("click", () => {
    go(1);
    restartAutoplay();
  });
  carousel.addEventListener("mouseenter", () => timer && clearInterval(timer));
  carousel.addEventListener("mouseleave", restartAutoplay);

  render();
  restartAutoplay();
}

/* ============================================================
   GALLERY — CLOUDINARY / PAGINATED DOM
   ---------------------------------------------------------
   Cloudinary is the source of gallery assets and metadata.
   Only the current page is inserted into the DOM.
============================================================ */
const GALLERY_PAGE_SIZE = 9;
const GALLERY_PEEK_SIZE = 3;
const MAX_COMPRESSED_IMAGE_BYTES = 500_000;

function normalizedMedia(item) {
  if (Array.isArray(item.media) && item.media.length) return item.media;
  if (Array.isArray(item.images) && item.images.length) return item.images;
  const full = item.full || item.src;
  return [
    {
      type:
        item.type || (/\.(mp4|webm|mov)(\?|$)/i.test(full) ? "video" : "image"),
      src: item.src || full,
      full,
    },
  ];
}

function localGalleryItemId(assetPath) {
  return `asset:${assetPath}`;
}

async function compressImageFile(file) {
  if (!file.type.startsWith("image/") || file.size < MAX_COMPRESSED_IMAGE_BYTES)
    return file;
  const maxDimension = file.size > MAX_COMPRESSED_IMAGE_BYTES ? 2560 : 4096;
  let source;
  let sourceUrl = "";
  let bitmap = false;
  try {
    if (typeof createImageBitmap === "function") {
      try {
        source = await createImageBitmap(file);
        bitmap = true;
      } catch {
        source = null;
      }
    }
    if (!source) {
      sourceUrl = URL.createObjectURL(file);
      source = new Image();
      source.src = sourceUrl;
      await source.decode();
    }

    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    if (!sourceWidth || !sourceHeight)
      throw new Error("File gambar tidak dapat dibaca.");
    const outputMime =
      file.type === "image/jpeg" || file.type === "image/jpg"
        ? "image/jpeg"
        : "image/webp";
    let longestSide = Math.min(
      maxDimension,
      Math.max(sourceWidth, sourceHeight),
    );
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      alpha: outputMime !== "image/jpeg",
    });
    if (!context) throw new Error("Browser tidak dapat mengompres gambar.");

    for (let sizeAttempt = 0; sizeAttempt < 16; sizeAttempt += 1) {
      const scale = Math.min(
        1,
        longestSide / Math.max(sourceWidth, sourceHeight),
      );
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      if (outputMime === "image/jpeg") {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(source, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.8, 0.75, 0.7]) {
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (result) =>
              result
                ? resolve(result)
                : reject(new Error("Gagal membuat gambar terkompresi.")),
            outputMime,
            quality,
          );
        });
        if (blob.size < MAX_COMPRESSED_IMAGE_BYTES) {
          const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
          const extension = blob.type === "image/jpeg" ? ".jpg" : ".webp";
          return new File([blob], `${baseName}${extension}`, {
            type: blob.type,
            lastModified: file.lastModified,
          });
        }
      }

      longestSide = Math.max(1, Math.floor(longestSide * 0.8));
    }
  } finally {
    if (bitmap) source.close();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }
  throw new Error("Gambar tidak dapat dikompres hingga di bawah 500 KB.");
}

function getCloudinaryContext(asset) {
  const context = asset.context || {};
  return context.custom || context;
}

function categoryLabelFromKey(key) {
  return String(key || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeCloudinaryPosts(assets) {
  const postsById = new Map();
  for (const asset of assets) {
    const context = getCloudinaryContext(asset);
    if (context.asset_role === "original") continue;
    const postId = String(context.post_id || asset.public_id || "");
    if (!postId || !asset.secure_url) continue;

    const category = String(context.category || "uncategorized");
    const label = String(
      context.category_label || categoryLabelFromKey(category),
    );
    let post = postsById.get(postId);
    if (!post) {
      post = {
        id: `cloudinary-${postId}`,
        caption: String(context.caption || ""),
        category,
        categoryKey: category,
        categoryLabel: label,
        label,
        collaborator: String(context.collaborator || ""),
        media: [],
        createdAt: 0,
      };
      postsById.set(postId, post);
    }

    const createdAt = Date.parse(asset.created_at) || 0;
    post.createdAt = Math.max(post.createdAt, createdAt);
    const slideIndex = Number(context.slide_index);
    const originalUrl = String(context.full_url || "");
    let embedUrl = "";
    if (context.type === "video" && context.video_url) {
      try {
        embedUrl = parseVideoEmbedUrl(String(context.video_url)).embedUrl;
      } catch {
        embedUrl = "";
      }
    }
    post.media.push({
      type: embedUrl
        ? "embed"
        : asset.resource_type === "video"
          ? "video"
          : "image",
      src: asset.secure_url,
      full: /^https:\/\/res\.cloudinary\.com\//i.test(originalUrl)
        ? originalUrl
        : asset.secure_url,
      embedUrl,
      public_id: asset.public_id,
      resource_type: asset.resource_type || "image",
      original_public_id: String(context.original_public_id || ""),
      original_resource_type: "image",
      slideIndex: Number.isFinite(slideIndex) ? slideIndex : post.media.length,
    });
  }

  const posts = [...postsById.values()];
  posts.forEach((post) =>
    post.media.sort((left, right) => left.slideIndex - right.slideIndex),
  );
  posts.sort(
    (left, right) =>
      right.createdAt - left.createdAt || right.id.localeCompare(left.id),
  );

  return posts;
}

function orderGalleryItems(items) {
  const isDesignGraphic = (item) =>
    [item.category, item.categoryKey, item.categoryLabel, item.label].some(
      (value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[\s_]+/g, "-") === "design-graphic",
    );
  const cloudinaryItems = items.filter((item) =>
    String(item.id || "").startsWith("cloudinary-"),
  );
  const localItems = items.filter(
    (item) => !String(item.id || "").startsWith("cloudinary-"),
  );
  const designItems = localItems.filter(isDesignGraphic);
  const otherItems = localItems.filter((item) => !isDesignGraphic(item));
  return [...cloudinaryItems, ...otherItems, ...designItems];
}

function createLocalPosts() {
  return GALLERY_DATA.flatMap((cat) => {
    if (cat.key !== "portrait") {
      return cat.files.map((file, index) => ({
        id: localGalleryItemId(file.full),
        assetKey: file.full,
        ...file,
        media: [{ type: "image", src: file.src, full: file.full }],
        caption: file.caption || "",
        collaborator: file.collaborator || "",
        category: cat.key,
        categoryKey: cat.key,
        categoryLabel: cat.label,
        label: cat.label,
        index: index + 1,
      }));
    }

    const portraitSet = cat.files.slice(0, 3);
    const groupedPortrait = {
      id: `${cat.key}-01-03`,
      ...portraitSet[0],
      images: portraitSet.map((file) => ({
        type: "image",
        src: file.src,
        full: file.full,
      })),
      caption: portraitSet[0].caption || "",
      collaborator: portraitSet[0].collaborator || "",
      category: cat.key,
      label: cat.label,
      index: 1,
    };
    const nextPortraitSet = cat.files.slice(3, 6);
    const groupedNextPortraits = {
      id: `${cat.key}-04-06`,
      ...nextPortraitSet[0],
      images: nextPortraitSet.map((file) => ({
        type: "image",
        src: file.src,
        full: file.full,
      })),
      caption: nextPortraitSet[0].caption || "",
      collaborator: nextPortraitSet[0].collaborator || "",
      category: cat.key,
      label: cat.label,
      index: 4,
    };
    const thirdPortraitSet = cat.files.slice(6, 9);
    const groupedThirdPortraits = {
      id: `${cat.key}-07-09`,
      ...thirdPortraitSet[0],
      images: thirdPortraitSet.map((file) => ({
        type: "image",
        src: file.src,
        full: file.full,
      })),
      caption: thirdPortraitSet[0].caption || "",
      collaborator: thirdPortraitSet[0].collaborator || "",
      category: cat.key,
      label: cat.label,
      index: 7,
    };
    const remainingPortraits = cat.files.slice(9).flatMap((file, index) => {
      if (file.number === "13") return [];

      const post = {
        id: `${cat.key}-${file.number || index + 10}`,
        ...file,
        caption: file.caption || "",
        collaborator: file.collaborator || "",
        category: cat.key,
        label: cat.label,
        index: index + 10,
      };
      if (file.number === "12") {
        const markedPortraits = cat.files.filter((portrait) =>
          ["12", "13"].includes(portrait.number),
        );
        post.id = `${cat.key}-12-13-img-4906-img-4898`;
        post.images = [
          ...markedPortraits.map((portrait) => ({
            type: "image",
            src: portrait.src,
            full: portrait.full,
          })),
          {
            type: "image",
            src: "assets/portrait/IMG_4906.jpg",
            full: "assets/portrait/IMG_4906.jpg",
          },
          {
            type: "image",
            src: "assets/portrait/IMG_4898.jpg",
            full: "assets/portrait/IMG_4898.jpg",
          },
        ];
        return [post];
      }
      if (file.number === "11") {
        post.id = `${cat.key}-11-img-4774-img-4777`;
        post.images = [
          { type: "image", src: file.src, full: file.full },
          {
            type: "image",
            src: "assets/portrait/IMG_4774.jpg",
            full: "assets/portrait/IMG_4774.jpg",
          },
          {
            type: "image",
            src: "assets/portrait/IMG_4777.jpg",
            full: "assets/portrait/IMG_4777.jpg",
          },
        ];
        return [post];
      }
      post.media = [{ type: "image", src: file.src, full: file.full }];
      if (file.number === "34") {
        post.src = "assets/portrait/IMG_1635.jpg";
        post.full = "assets/portrait/IMG_1635.jpg";
        post.width = 3456;
        post.height = 4320;
        post.media = [
          {
            type: "image",
            src: "assets/portrait/IMG_1635.jpg",
            full: "assets/portrait/IMG_1635.jpg",
          },
        ];
      }
      return [post];
    });
    const relocatedPortrait = cat.files
      .filter((file) => file.number === "34")
      .map((file) => ({
        id: `${cat.key}-${file.number}-moved-to-bottom`,
        ...file,
        media: [{ type: "image", src: file.src, full: file.full }],
        caption: file.caption || "",
        collaborator: file.collaborator || "",
        category: cat.key,
        label: cat.label,
        index: cat.files.length + 1,
      }));

    return [
      groupedPortrait,
      groupedNextPortraits,
      groupedThirdPortraits,
      ...remainingPortraits,
      ...relocatedPortrait,
    ].map((post) => {
      const assetPath = normalizedMedia(post)[0]?.full || post.full;
      return {
        ...post,
        id: localGalleryItemId(assetPath),
        assetKey: assetPath,
        categoryKey: cat.key,
        categoryLabel: cat.label,
      };
    });
  });
}

function initGallery() {
  const galleryEl = document.getElementById("gallery");
  const emptyEl = document.getElementById("galleryEmpty");
  const loadMoreWrap = document.getElementById("loadMoreWrap");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const peekEl = document.getElementById("loadMorePeek");
  const filterEl = document.querySelector(".filters");
  if (!galleryEl) return;

  let activeFilter = "all";
  let visibleCount = GALLERY_PAGE_SIZE;
  let allItems = orderGalleryItems(createLocalPosts());
  let photoOverrides = {};
  let dragState = null;
  let pendingCardOpen = null;
  let suppressGalleryClickUntil = 0;
  let autoScrollFrame = 0;
  let pointerPosition = null;
  let loading = true;
  let loadError = "";
  let persistedCategories = CATEGORIES.map((category) => ({ ...category }));
  let pendingCategoryDelete = null;
  let categoryPressTimer = null;
  let suppressCategoryClickUntil = 0;
  const deleteCategoryConfirm = document.getElementById(
    "deleteCategoryConfirm",
  );
  const confirmDeleteCategory = document.getElementById(
    "confirmDeleteCategory",
  );

  function getMatched() {
    if (activeFilter === "all") {
      return allItems.filter((item) => !isVideoPost(item));
    }

    const selectedCategory = CATEGORIES.find(
      (category) =>
        String(category.key).trim().toLowerCase() ===
        String(activeFilter).trim().toLowerCase(),
    );
    if (
      String(activeFilter).trim().toLowerCase() === "video" ||
      isVideoCategory(selectedCategory)
    ) {
      return allItems.filter(isVideoPost);
    }

    return allItems.filter((item) => item.category === activeFilter);
  }

  function isVideoPost(item) {
    const categoryKey = String(item.categoryKey || item.category || "")
      .trim()
      .toLowerCase();
    const categoryLabel = String(item.categoryLabel || item.label || "")
      .trim()
      .toLowerCase();
    return (
      categoryKey === "video" ||
      categoryLabel === "video" ||
      CATEGORIES.some(
        (category) =>
          String(category.key).trim().toLowerCase() === categoryKey &&
          isVideoCategory(category),
      )
    );
  }

  function syncCategories() {
    const categories = new Map(
      persistedCategories.map((category) => [category.key, category]),
    );
    const ordered = CATEGORY_ORDER.map((key) => categories.get(key)).filter(
      Boolean,
    );
    const additional = [...categories.values()]
      .filter((category) => !CATEGORY_ORDER.includes(category.key))
      .sort((left, right) => left.label.localeCompare(right.label));
    CATEGORIES.splice(0, CATEGORIES.length, ...ordered, ...additional);
    updateAboutStatistics();
  }

  window.getMatchedPortfolioItems = getMatched;

  function makeCard(item, index) {
    const media = normalizedMedia(item);
    const article = document.createElement("article");
    article.className = "work-card";
    article.dataset.postIndex = String(index);
    article.dataset.itemId = item.id;
    article.tabIndex = 0;
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `Buka karya ${item.label}`);

    const preview =
      media[0].type === "video"
        ? document.createElement("video")
        : document.createElement("img");
    preview.src = media[0].src;
    preview.alt = media[0].type === "video" ? "" : `${item.label} photography`;
    preview.loading = "lazy";
    if (preview instanceof HTMLVideoElement) {
      preview.muted = true;
      preview.playsInline = true;
      preview.preload = "metadata";
    } else {
      preview.decoding = "async";
      preview.fetchPriority = "low";
    }
    article.appendChild(preview);

    if (media[0].type === "embed" || media[0].type === "video") {
      const playMark = document.createElement("span");
      playMark.className = "video-play-mark";
      playMark.setAttribute("aria-hidden", "true");
      playMark.textContent = "▶";
      article.appendChild(playMark);
    }

    if (media.length > 1) {
      const stack = document.createElement("span");
      stack.className = "multi-media-mark";
      stack.setAttribute("aria-label", `${media.length} media`);
      stack.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="7" width="13" height="13" rx="2"/><path d="M9 4h9a2 2 0 0 1 2 2v9"/></svg>';
      article.appendChild(stack);
    }

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const name = document.createElement("span");
    name.textContent = item.label;
    const number = document.createElement("b");
    number.textContent = String(index + 1).padStart(2, "0");
    meta.append(name, number);
    article.appendChild(meta);
    return article;
  }

  function renderPeek(matched) {
    if (!peekEl) return;
    peekEl.replaceChildren();
    matched
      .slice(visibleCount, visibleCount + GALLERY_PEEK_SIZE)
      .forEach((item) => {
        const firstMedia = normalizedMedia(item)[0];
        const preview = document.createElement(
          firstMedia.type === "video" ? "video" : "img",
        );
        preview.src = firstMedia.src;
        if (preview instanceof HTMLVideoElement) {
          preview.muted = true;
          preview.playsInline = true;
          preview.preload = "metadata";
        } else {
          preview.alt = "";
          preview.decoding = "async";
        }
        preview.loading = "lazy";
        preview.setAttribute("aria-hidden", "true");
        peekEl.appendChild(preview);
      });
  }

  function render() {
    const matched = getMatched();
    galleryEl.replaceChildren();
    const renderCount = dragState ? matched.length : visibleCount;
    matched.slice(0, renderCount).forEach((item, index) => {
      galleryEl.appendChild(makeCard(item, index));
    });
    if (loadMoreWrap)
      loadMoreWrap.hidden = dragState || matched.length <= visibleCount;
    if (emptyEl) {
      emptyEl.hidden = loading || matched.length !== 0;
      emptyEl.textContent = loadError
        ? loadError
        : "Belum ada postingan di Cloudinary.";
    }
    if (dragState && peekEl) peekEl.replaceChildren();
    else renderPeek(matched);
  }

  function reorderMatchedItems(items) {
    const matchedIds = new Set(items.map((item) => item.id));
    const slots = [];
    allItems.forEach((item, index) => {
      if (matchedIds.has(item.id)) slots.push(index);
    });
    slots.forEach((slot, index) => {
      allItems[slot] = items[index];
    });
  }

  function animateCardOrder(items) {
    const before = new Map(
      [...galleryEl.querySelectorAll(".work-card")].map((card) => [
        card.dataset.itemId,
        card.getBoundingClientRect(),
      ]),
    );
    const cards = new Map(
      [...galleryEl.querySelectorAll(".work-card")].map((card) => [
        card.dataset.itemId,
        card,
      ]),
    );
    items.forEach((item, index) => {
      const card = cards.get(item.id);
      if (!card) return;
      card.dataset.postIndex = String(index);
      galleryEl.appendChild(card);
    });
    cards.forEach((card, id) => {
      const previous = before.get(id);
      const next = card.getBoundingClientRect();
      if (!previous) return;
      const dx = previous.left - next.left;
      const dy = previous.top - next.top;
      if (!dx && !dy) return;
      card.style.transition = "none";
      card.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        card.style.transition = "";
        card.style.transform = "";
      });
    });
  }

  function updateDraggedOrder(targetId) {
    const currentItems = getMatched();
    const sourceIndex = currentItems.findIndex(
      (item) => item.id === dragState.sourceId,
    );
    const targetIndex = currentItems.findIndex((item) => item.id === targetId);
    updateDraggedOrderToIndex(currentItems, sourceIndex, targetIndex);
  }

  function updateDraggedOrderToIndex(currentItems, sourceIndex, targetIndex) {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex)
      return;
    const nextItems = [...currentItems];
    const [source] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, source);
    reorderMatchedItems(nextItems);
    animateCardOrder(nextItems);
  }

  function moveDragGhost(x, y) {
    if (!dragState) return;
    pointerPosition = { x, y };
    dragState.ghost.style.left = `${x - dragState.offsetX}px`;
    dragState.ghost.style.top = `${y - dragState.offsetY}px`;
    const ghostRect = dragState.ghost.getBoundingClientRect();
    const originRect = {
      left: dragState.originRect.left,
      top: dragState.originRect.top + dragState.startScrollY - window.scrollY,
      width: dragState.originRect.width,
      height: dragState.originRect.height,
    };
    const originWidth = Math.max(
      0,
      Math.min(ghostRect.right, originRect.left + originRect.width) -
        Math.max(ghostRect.left, originRect.left),
    );
    const originHeight = Math.max(
      0,
      Math.min(ghostRect.bottom, originRect.top + originRect.height) -
        Math.max(ghostRect.top, originRect.top),
    );
    const originOverlap =
      (originWidth * originHeight) /
      Math.max(1, originRect.width * originRect.height);
    if (originOverlap >= 0.22) {
      const currentItems = getMatched();
      const sourceIndex = currentItems.findIndex(
        (item) => item.id === dragState.sourceId,
      );
      updateDraggedOrderToIndex(
        currentItems,
        sourceIndex,
        dragState.originalIndex,
      );
      return;
    }
    let bestTarget = null;
    let bestOverlap = 0.22;
    galleryEl.querySelectorAll(".work-card").forEach((card) => {
      if (
        card.dataset.itemId === dragState.sourceId ||
        card.classList.contains("is-drag-placeholder")
      )
        return;
      const rect = card.getBoundingClientRect();
      const width = Math.max(
        0,
        Math.min(ghostRect.right, rect.right) -
          Math.max(ghostRect.left, rect.left),
      );
      const height = Math.max(
        0,
        Math.min(ghostRect.bottom, rect.bottom) -
          Math.max(ghostRect.top, rect.top),
      );
      const overlap = (width * height) / Math.max(1, rect.width * rect.height);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestTarget = card;
      }
    });
    if (bestTarget) updateDraggedOrder(bestTarget.dataset.itemId);
  }

  function animateAutoScroll() {
    if (!dragState || !pointerPosition) return;
    const edgeSize = Math.min(120, window.innerHeight * 0.18);
    let scrollDelta = 0;
    if (pointerPosition.y < edgeSize) {
      scrollDelta = -Math.ceil(
        ((edgeSize - pointerPosition.y) / edgeSize) * 14,
      );
    } else if (pointerPosition.y > window.innerHeight - edgeSize) {
      scrollDelta = Math.ceil(
        ((pointerPosition.y - (window.innerHeight - edgeSize)) / edgeSize) * 14,
      );
    }
    if (scrollDelta) {
      window.scrollBy({ top: scrollDelta, behavior: "auto" });
      moveDragGhost(pointerPosition.x, pointerPosition.y);
    }
    autoScrollFrame = requestAnimationFrame(animateAutoScroll);
  }

  function beginGalleryDrag(card, event) {
    const item = getMatched()[Number(card.dataset.postIndex)];
    if (
      !item ||
      !isAdminSession() ||
      normalizedMedia(item)[0]?.type !== "image" ||
      dragState
    )
      return false;
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.classList.remove("is-drag-placeholder");
    ghost.classList.add("gallery-drag-ghost");
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.left = `${event.clientX - (event.clientX - rect.left)}px`;
    ghost.style.top = `${event.clientY - (event.clientY - rect.top)}px`;
    document.body.appendChild(ghost);
    dragState = {
      pointerId: event.pointerId,
      sourceId: item.id,
      originalItems: [...getMatched()],
      originalVisibleCount: visibleCount,
      originalIndex: Number(card.dataset.postIndex),
      originRect: rect,
      startScrollY: window.scrollY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      ghost,
    };
    card.classList.add("is-drag-placeholder");
    galleryEl.classList.add("is-gallery-dragging");
    document.body.classList.add("is-gallery-dragging");
    visibleCount = getMatched().length;
    render();
    const placeholder = galleryEl.querySelector(
      `.work-card[data-item-id="${CSS.escape(item.id)}"]`,
    );
    placeholder?.classList.add("is-drag-placeholder");
    dragState.ghost.style.left = `${event.clientX - dragState.offsetX}px`;
    dragState.ghost.style.top = `${event.clientY - dragState.offsetY}px`;
    pointerPosition = { x: event.clientX, y: event.clientY };
    autoScrollFrame = requestAnimationFrame(animateAutoScroll);
    return true;
  }

  async function finishGalleryDrag(cancelled) {
    if (!dragState) return;
    cancelAnimationFrame(autoScrollFrame);
    const state = dragState;
    dragState = null;
    pointerPosition = null;
    state.ghost.remove();
    galleryEl.classList.remove("is-gallery-dragging");
    document.body.classList.remove("is-gallery-dragging");
    visibleCount = state.originalVisibleCount;
    if (!cancelled && !state.moved) {
      render();
      return;
    }
    suppressGalleryClickUntil = Date.now() + 350;
    if (cancelled) {
      reorderMatchedItems(state.originalItems);
      render();
      return;
    }
    render();
    try {
      await saveGalleryState({ order: allItems.map((item) => item.id) });
      window.showPortfolioNotice?.("Urutan galeri berhasil disimpan.");
    } catch (error) {
      reorderMatchedItems(state.originalItems);
      render();
      console.error("Gallery order save failed:", error);
      window.showPortfolioNotice?.(
        error.message || "Urutan galeri gagal disimpan.",
      );
    }
  }

  galleryEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    const card = event.target.closest(".work-card");
    if (!card) return;
    const hasPendingClick = Boolean(pendingCardOpen);
    if (event.pointerType === "mouse" && hasPendingClick) {
      clearTimeout(pendingCardOpen.timer);
      pendingCardOpen = null;
      beginGalleryDrag(card, event);
      return;
    }
    if (pendingCardOpen) {
      clearTimeout(pendingCardOpen.timer);
      pendingCardOpen = null;
    }
    if (event.pointerType === "touch") {
      const timeout = setTimeout(() => {
        dragState = null;
        if (beginGalleryDrag(card, event)) {
          suppressGalleryClickUntil = Date.now() + 1000;
        }
      }, 520);
      dragState = {
        longPressTimer: timeout,
        startX: event.clientX,
        startY: event.clientY,
      };
    }
  });

  document.addEventListener(
    "pointermove",
    (event) => {
      if (!dragState) return;
      if (dragState.longPressTimer) {
        if (
          Math.hypot(
            event.clientX - dragState.startX,
            event.clientY - dragState.startY,
          ) > 10
        ) {
          clearTimeout(dragState.longPressTimer);
          dragState = null;
        }
        return;
      }
      if (event.pointerId !== dragState.pointerId) return;
      if (
        !dragState.moved &&
        Math.hypot(
          event.clientX - dragState.startX,
          event.clientY - dragState.startY,
        ) < 4
      )
        return;
      dragState.moved = true;
      event.preventDefault();
      moveDragGhost(event.clientX, event.clientY);
    },
    { passive: false },
  );
  document.addEventListener(
    "touchmove",
    (event) => {
      if (dragState && !dragState.longPressTimer) event.preventDefault();
    },
    { passive: false },
  );
  document.addEventListener("pointerup", (event) => {
    if (!dragState) return;
    if (dragState.longPressTimer) {
      clearTimeout(dragState.longPressTimer);
      dragState = null;
      return;
    }
    if (event.pointerId === dragState.pointerId) void finishGalleryDrag(false);
  });
  document.addEventListener("pointercancel", () => {
    if (!dragState) return;
    if (dragState.longPressTimer) {
      clearTimeout(dragState.longPressTimer);
      dragState = null;
    } else {
      void finishGalleryDrag(true);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dragState && !dragState.longPressTimer)
      void finishGalleryDrag(true);
  });

  function applyGalleryState(items, state) {
    const overrides =
      state.photoOverrides &&
      typeof state.photoOverrides === "object" &&
      !Array.isArray(state.photoOverrides)
        ? state.photoOverrides
        : {};
    const orderedItems = orderGalleryItems(items).map((item) => {
      const override = item.assetKey && overrides[item.assetKey];
      if (!override) return item;
      const category = override.categoryKey;
      return {
        ...item,
        caption: override.caption,
        category,
        categoryKey: category,
        categoryLabel: override.categoryLabel,
        label: override.categoryLabel,
        collaborator: override.collaborator,
        media: override.media,
      };
    });
    const itemById = new Map(orderedItems.map((item) => [item.id, item]));
    const rank = new Map((state.order || []).map((id, index) => [id, index]));
    return orderedItems
      .sort((left, right) => {
        const leftRank = rank.get(left.id);
        const rightRank = rank.get(right.id);
        const leftIsNewCloudinary =
          leftRank === undefined &&
          String(left.id || "").startsWith("cloudinary-");
        const rightIsNewCloudinary =
          rightRank === undefined &&
          String(right.id || "").startsWith("cloudinary-");
        if (leftIsNewCloudinary && !rightIsNewCloudinary) return -1;
        if (rightIsNewCloudinary && !leftIsNewCloudinary) return 1;
        if (leftRank === undefined && rightRank === undefined) return 0;
        if (leftRank === undefined) return 1;
        if (rightRank === undefined) return -1;
        return leftRank - rightRank;
      })
      .filter((item) => itemById.has(item.id));
  }

  async function saveGalleryState(update) {
    const currentUser = firebaseServices?.auth.currentUser;
    if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
      throw new Error("Sesi admin tidak valid. Masuk kembali.");
    const idToken = await currentUser.getIdToken();
    const response = await fetch(GALLERY_STATE_API, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Perubahan galeri gagal disimpan.");
    if (
      !result ||
      !result.photoOverrides ||
      typeof result.photoOverrides !== "object" ||
      Array.isArray(result.photoOverrides) ||
      !Array.isArray(result.order)
    )
      throw new Error("Respons penyimpanan galeri tidak valid.");
    photoOverrides = result.photoOverrides;
    return result;
  }

  window.savePortfolioGalleryOrder = async () => {
    if (!isAdminSession()) return false;
    try {
      await saveGalleryState({ order: allItems.map((item) => item.id) });
      return true;
    } catch (error) {
      console.error("New post gallery order save failed:", error);
      window.showPortfolioNotice?.(
        error.message || "Urutan postingan baru gagal disimpan.",
      );
      return false;
    }
  };

  window.saveBuiltInPhotoEdit = async (item, override) => {
    if (!item?.assetKey || !isAdminSession())
      throw new Error("Foto bawaan tidak dapat diedit.");
    const state = await saveGalleryState({
      photoOverrides: { [item.assetKey]: override },
    });
    const index = allItems.findIndex((entry) => entry.id === item.id);
    if (index >= 0) {
      const category = override.categoryKey;
      allItems[index] = {
        ...allItems[index],
        caption: override.caption,
        category,
        categoryKey: category,
        categoryLabel: override.categoryLabel,
        label: override.categoryLabel,
        collaborator: override.collaborator,
        media: override.media,
      };
      allItems = applyGalleryState(allItems, state);
    }
    syncCategories();
    renderFilters();
    render();
  };

  window.resetBuiltInPhotoEdit = async (item) => {
    if (!item?.assetKey || !isAdminSession())
      throw new Error("Foto bawaan tidak dapat direset.");
    const state = await saveGalleryState({
      photoOverrides: { [item.assetKey]: null },
    });
    const original = createLocalPosts().find(
      (entry) => entry.assetKey === item.assetKey,
    );
    const index = allItems.findIndex((entry) => entry.id === item.id);
    if (original && index >= 0) allItems[index] = original;
    allItems = applyGalleryState(allItems, state);
    syncCategories();
    renderFilters();
    render();
  };

  function renderFilters() {
    if (!filterEl) return;
    filterEl.replaceChildren();
    const categories = [{ key: "all", label: "All" }, ...CATEGORIES];
    categories.forEach(({ key, label }) => {
      const button = document.createElement("button");
      button.className = `filter${key === activeFilter ? " active" : ""}`;
      button.type = "button";
      button.dataset.filter = key;
      button.textContent = label;
      if (key !== "all") button.dataset.categoryKey = key;
      filterEl.appendChild(button);
    });
  }

  filterEl?.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    if (Date.now() < suppressCategoryClickUntil) {
      event.preventDefault();
      return;
    }
    activeFilter = button.dataset.filter;
    visibleCount = GALLERY_PAGE_SIZE;
    renderFilters();
    render();
  });
  function requestDeleteCategory(category) {
    if (!isAdminSession() || !category) return;
    pendingCategoryDelete = category;
    deleteCategoryConfirm.classList.add("open");
    deleteCategoryConfirm.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function cancelDeleteCategory() {
    pendingCategoryDelete = null;
    deleteCategoryConfirm.classList.remove("open");
    deleteCategoryConfirm.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".dialog-backdrop.open, .work-viewer.open"))
      document.body.style.overflow = "";
  }

  async function deleteCategory() {
    const category = pendingCategoryDelete;
    if (!category || !isAdminSession()) {
      cancelDeleteCategory();
      return;
    }
    confirmDeleteCategory.disabled = true;
    try {
      const currentUser = firebaseServices?.auth.currentUser;
      if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
        throw new Error("Sesi admin tidak valid. Masuk kembali.");
      const idToken = await currentUser.getIdToken();
      const response = await fetch(
        `${CATEGORIES_API}/${encodeURIComponent(category.key)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Kategori gagal dihapus.");
      persistedCategories = result.categories;
      syncCategories();
      if (activeFilter === category.key) activeFilter = "all";
      renderFilters();
      render();
      renderCategorySelect();
      cancelDeleteCategory();
    } catch (error) {
      cancelDeleteCategory();
      console.error("Category deletion failed:", error);
      window.alert(error.message || "Kategori gagal dihapus.");
    } finally {
      confirmDeleteCategory.disabled = false;
    }
  }

  filterEl?.addEventListener("contextmenu", (event) => {
    const button = event.target.closest(".filter[data-category-key]");
    if (!button || !isAdminSession()) return;
    event.preventDefault();
    requestDeleteCategory(
      CATEGORIES.find(
        (category) => category.key === button.dataset.categoryKey,
      ),
    );
  });
  filterEl?.addEventListener(
    "touchstart",
    (event) => {
      const button = event.target.closest(".filter[data-category-key]");
      if (!button || !isAdminSession()) return;
      const category = CATEGORIES.find(
        (item) => item.key === button.dataset.categoryKey,
      );
      if (!category) return;
      clearTimeout(categoryPressTimer);
      categoryPressTimer = setTimeout(() => {
        if (!isAdminSession()) return;
        suppressCategoryClickUntil = Date.now() + 800;
        requestDeleteCategory(category);
      }, 600);
    },
    { passive: true },
  );
  ["touchend", "touchcancel", "touchmove"].forEach((eventName) => {
    filterEl?.addEventListener(eventName, () => {
      clearTimeout(categoryPressTimer);
    });
  });
  confirmDeleteCategory.addEventListener("click", deleteCategory);
  document
    .getElementById("cancelDeleteCategory")
    .addEventListener("click", cancelDeleteCategory);
  deleteCategoryConfirm.addEventListener("click", (event) => {
    if (event.target === deleteCategoryConfirm) cancelDeleteCategory();
  });
  window.cancelDeleteCategory = cancelDeleteCategory;
  window.updatePortfolioCategories = (categories) => {
    persistedCategories = categories;
    syncCategories();
    renderFilters();
    renderCategorySelect();
  };
  loadMoreBtn?.addEventListener("click", () => {
    visibleCount += GALLERY_PAGE_SIZE;
    render();
  });
  galleryEl.addEventListener("click", (event) => {
    if (Date.now() < suppressGalleryClickUntil) {
      event.preventDefault();
      return;
    }
    const card = event.target.closest(".work-card");
    if (!card) return;
    if (pendingCardOpen) clearTimeout(pendingCardOpen.timer);
    pendingCardOpen = {
      timer: setTimeout(() => {
        pendingCardOpen = null;
        if (!dragState) openViewer(Number(card.dataset.postIndex));
      }, 420),
    };
  });
  galleryEl.addEventListener("keydown", (event) => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.matches(".work-card")
    ) {
      event.preventDefault();
      openViewer(Number(event.target.dataset.postIndex));
    }
  });
  window.addPortfolioPost = (post) => {
    if (!post?.id || !Array.isArray(post.media) || !post.media.length)
      throw new Error("Data media postingan tidak valid.");
    const categoryKey = post.categoryKey || post.category;
    const categoryLabel = post.categoryLabel || post.label || categoryKey;
    if (!categoryKey) throw new Error("Kategori postingan tidak valid.");
    activeFilter = "all";
    const item = {
      ...post,
      id: `cloudinary-${post.id}`,
      category: categoryKey,
      categoryKey,
      categoryLabel,
      label: categoryLabel,
    };
    const existingIndex = allItems.findIndex(
      (existing) => existing.id === item.id,
    );
    if (existingIndex >= 0) allItems[existingIndex] = item;
    else allItems = [item, ...allItems];
    syncCategories();
    visibleCount = GALLERY_PAGE_SIZE;
    renderFilters();
    render();
  };
  window.removePortfolioPost = (postId) => {
    allItems = allItems.filter((item) => item.id !== `cloudinary-${postId}`);
    syncCategories();
    if (
      activeFilter !== "all" &&
      !CATEGORIES.some((category) => category.key === activeFilter)
    ) {
      activeFilter = "all";
      renderFilters();
    }
    render();
  };
  window.updatePortfolioPostMedia = (postId, media) => {
    const itemIndex = allItems.findIndex(
      (item) => item.id === `cloudinary-${postId}`,
    );
    if (itemIndex < 0) return;
    if (!media.length) {
      window.removePortfolioPost(postId);
      return;
    }
    allItems[itemIndex] = {
      ...allItems[itemIndex],
      media,
      mediaUrl: media[0].full || media[0].src,
      mediaUrls: media.map((item) => item.full || item.src),
    };
    render();
  };

  window.reloadPortfolioAssets = async () => {
    loading = true;
    loadError = "";
    render();
    try {
      try {
        const categoryResponse = await fetch(CATEGORIES_API);
        const categoryResult = await categoryResponse.json();
        if (!categoryResponse.ok || !Array.isArray(categoryResult.categories))
          throw new Error(
            categoryResult.error || "Respons kategori server tidak valid.",
          );
        persistedCategories = categoryResult.categories;
        syncCategories();
      } catch (error) {
        console.error("Category synchronization failed:", error);
      }
      const response = await fetch(CLOUDINARY_ASSETS_API);
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Backend galeri tidak mengembalikan JSON yang valid (HTTP ${response.status}).`,
        );
      }
      if (!response.ok)
        throw new Error(result.error || "Gagal memuat galeri Cloudinary.");
      if (!Array.isArray(result.assets))
        throw new Error("Respons galeri Cloudinary tidak valid.");
      const cloudinaryPosts = normalizeCloudinaryPosts(result.assets);
      let galleryState = { photoOverrides: {}, order: [] };
      try {
        const stateResponse = await fetch(GALLERY_STATE_API);
        const stateResult = await stateResponse.json();
        if (
          !stateResponse.ok ||
          !stateResult ||
          !stateResult.photoOverrides ||
          typeof stateResult.photoOverrides !== "object" ||
          Array.isArray(stateResult.photoOverrides) ||
          !Array.isArray(stateResult.order)
        )
          throw new Error(
            stateResult.error || "Respons penyimpanan galeri tidak valid.",
          );
        galleryState = stateResult;
        photoOverrides = stateResult.photoOverrides;
      } catch (error) {
        console.error("Gallery state loading failed:", error);
      }
      allItems = applyGalleryState(
        [...cloudinaryPosts, ...createLocalPosts()],
        galleryState,
      );
      syncCategories();
      if (
        activeFilter !== "all" &&
        !CATEGORIES.some((category) => category.key === activeFilter)
      )
        activeFilter = "all";
      visibleCount = GALLERY_PAGE_SIZE;
    } catch (error) {
      loadError =
        error.message || "Galeri Cloudinary tidak dapat dimuat saat ini.";
      throw error;
    } finally {
      loading = false;
      renderFilters();
      render();
      renderCategorySelect();
    }
    return allItems;
  };
  renderFilters();
  render();
  window.reloadPortfolioAssets().catch((error) => console.error(error));
  updateAboutStatistics();
}

function tambahkanKeGaleri(post) {
  if (typeof window.addPortfolioPost !== "function")
    throw new Error("Galeri belum siap menerima postingan.");
  window.addPortfolioPost(post);
}

let viewerItems = [];
let viewerItemIndex = 0;
let viewerMediaIndex = 0;
let viewerTouchStart = 0;

function initLightbox() {
  const viewer = document.getElementById("workViewer");
  const viewerMedia = document.getElementById("viewerMedia");
  const image = document.getElementById("viewerImage");
  const video = document.getElementById("viewerVideo");
  const frame = document.getElementById("viewerFrame");
  const dots = document.getElementById("mediaDots");
  const adminActions = document.getElementById("viewerAdminActions");
  const adminTrigger = document.getElementById("viewerAdminTrigger");
  const adminMenu = document.getElementById("viewerAdminMenu");
  const adminStatus = document.getElementById("viewerAdminStatus");
  let imageLoadToken = 0;
  let pendingFullImage = null;

  function cancelPendingFullImage() {
    imageLoadToken += 1;
    if (!pendingFullImage) return;
    pendingFullImage.onload = null;
    pendingFullImage.onerror = null;
    pendingFullImage.src = "";
    pendingFullImage = null;
  }

  function refreshAdminControls() {
    const item = viewerItems[viewerItemIndex];
    const isAdmin = isAdminSession();
    const canEdit =
      Boolean(item?.assetKey) ||
      String(item?.id || "").startsWith("cloudinary-");
    const canDelete = String(item?.id || "").startsWith("cloudinary-");
    adminActions.hidden = !isAdmin;
    adminMenu.querySelector('[data-post-action="edit"]').disabled = !canEdit;
    adminMenu.querySelector('[data-post-action="delete"]').disabled =
      !canDelete;
    if (!isAdmin || (!canEdit && !canDelete)) {
      adminMenu.hidden = true;
      adminTrigger.setAttribute("aria-expanded", "false");
    }
  }

  const close = () => {
    cancelPendingFullImage();
    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    adminMenu.hidden = true;
    adminTrigger.setAttribute("aria-expanded", "false");
    adminStatus.textContent = "";
    image.removeAttribute("src");
    video.pause();
    video.removeAttribute("src");
    frame.removeAttribute("src");
    document.body.style.overflow = "";
  };

  function renderMedia() {
    cancelPendingFullImage();
    const renderToken = imageLoadToken;
    const item = viewerItems[viewerItemIndex];
    if (!item) return;
    const itemIndex = viewerItemIndex;
    const media = normalizedMedia(item);
    viewerMediaIndex = (viewerMediaIndex + media.length) % media.length;
    const mediaIndex = viewerMediaIndex;
    const current = media[viewerMediaIndex];
    video.pause();
    video.removeAttribute("src");
    frame.removeAttribute("src");
    if (current.type === "embed") {
      image.hidden = true;
      video.hidden = true;
      frame.hidden = false;
      frame.src = current.embedUrl;
    } else if (current.type === "video") {
      image.hidden = true;
      video.hidden = false;
      frame.hidden = true;
      video.src = current.full || current.src;
    } else {
      video.hidden = true;
      frame.hidden = true;
      image.hidden = false;
      const previewUrl = current.src || current.full;
      const fullUrl = current.full || current.src;
      image.src = previewUrl;
      image.alt = `${item.label} photography`;
      if (fullUrl && fullUrl !== previewUrl) {
        const preloader = new Image();
        preloader.decoding = "async";
        pendingFullImage = preloader;
        const releasePreloader = () => {
          if (pendingFullImage === preloader) pendingFullImage = null;
          preloader.onload = null;
          preloader.onerror = null;
        };
        preloader.onload = () => {
          releasePreloader();
          if (
            renderToken !== imageLoadToken ||
            !viewer.classList.contains("open") ||
            viewerItemIndex !== itemIndex ||
            viewerMediaIndex !== mediaIndex
          )
            return;
          const activeItem = viewerItems[viewerItemIndex];
          if (!activeItem) return;
          const activeMedia = normalizedMedia(activeItem)[viewerMediaIndex];
          if (
            !activeMedia ||
            (activeMedia !== current &&
              (activeMedia.src !== current.src ||
                activeMedia.full !== current.full ||
                activeMedia.public_id !== current.public_id ||
                activeMedia.embedUrl !== current.embedUrl))
          )
            return;
          image.src = fullUrl;
        };
        preloader.onerror = releasePreloader;
        preloader.src = fullUrl;
      }
    }
    dots.replaceChildren();
    media.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = index === viewerMediaIndex ? "active" : "";
      dot.setAttribute("aria-label", `Tampilkan media ${index + 1}`);
      dot.addEventListener("click", () => {
        viewerMediaIndex = index;
        renderMedia();
      });
      dots.appendChild(dot);
    });
    dots.hidden = media.length < 2;
    document.getElementById("mediaPrev").hidden = media.length < 2;
    document.getElementById("mediaNext").hidden = media.length < 2;
  }

  function renderPost(index) {
    viewerItems = window.getMatchedPortfolioItems?.() || [];
    if (!viewerItems.length) return;
    viewerItemIndex = (index + viewerItems.length) % viewerItems.length;
    viewerMediaIndex = 0;
    const item = viewerItems[viewerItemIndex];
    document.getElementById("viewerCaption").textContent = item.caption || "";
    const category = document.getElementById("viewerCategory");
    category.textContent = item.label;
    category.onclick = () => {
      document
        .querySelector(`.filter[data-filter="${CSS.escape(item.category)}"]`)
        ?.click();
      close();
      document.getElementById("work").scrollIntoView({ behavior: "smooth" });
    };
    const collaborator = String(item.collaborator || "")
      .replace(/^@/, "")
      .trim();
    const collaboratorWrap = document.getElementById("viewerCollaborator");
    const collaboratorLink = document.getElementById("collaboratorLink");
    const collaboratorTip = document.getElementById("collaboratorTip");
    const validUsername = /^[a-zA-Z0-9._]{1,30}$/.test(collaborator);
    collaboratorWrap.hidden = !validUsername;
    if (validUsername) {
      collaboratorLink.href = `https://instagram.com/${encodeURIComponent(collaborator)}`;
      collaboratorLink.textContent = "@";
      collaboratorTip.textContent = `@${collaborator}`;
    }
    adminStatus.textContent = "";
    refreshAdminControls();
    renderMedia();
  }

  window.openViewer = (index) => {
    const items = window.getMatchedPortfolioItems?.() || [];
    if (!items[index]) return;
    viewerItems = items;
    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderPost(index);
  };
  window.closeWorkViewer = close;
  window.refreshViewerAdminControls = refreshAdminControls;
  window.getCurrentViewerPost = () => viewerItems[viewerItemIndex] || null;

  adminTrigger.addEventListener("click", () => {
    if (adminActions.hidden || !isAdminSession()) return;
    adminMenu.hidden = !adminMenu.hidden;
    adminTrigger.setAttribute("aria-expanded", String(!adminMenu.hidden));
  });
  adminMenu.addEventListener("click", (event) => {
    const action =
      event.target.closest("[data-post-action]")?.dataset.postAction;
    if (!action) return;
    adminMenu.hidden = true;
    adminTrigger.setAttribute("aria-expanded", "false");
    if (action === "close") return;
    if (!isAdminSession()) return;
    const item = viewerItems[viewerItemIndex];
    if (!item) return;
    if (action === "edit") window.openPortfolioEditor?.(item);
    if (action === "delete" && String(item.id).startsWith("cloudinary-"))
      window.requestDeletePortfolioPost?.(item);
  });

  const stepMedia = (direction) => {
    const count = normalizedMedia(viewerItems[viewerItemIndex] || {}).length;
    viewerMediaIndex = (viewerMediaIndex + direction + count) % count;
    renderMedia();
  };
  document.getElementById("viewerClose").addEventListener("click", close);
  document
    .getElementById("viewerPrev")
    .addEventListener("click", () => renderPost(viewerItemIndex - 1));
  document
    .getElementById("viewerNext")
    .addEventListener("click", () => renderPost(viewerItemIndex + 1));
  document
    .getElementById("mediaPrev")
    .addEventListener("click", () => stepMedia(-1));
  document
    .getElementById("mediaNext")
    .addEventListener("click", () => stepMedia(1));
  document
    .getElementById("viewerMedia")
    .addEventListener("pointerdown", (event) => {
      viewerTouchStart = event.clientX;
    });
  document
    .getElementById("viewerMedia")
    .addEventListener("pointerup", (event) => {
      const distance = event.clientX - viewerTouchStart;
      if (Math.abs(distance) > 45) stepMedia(distance > 0 ? -1 : 1);
    });
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) close();
    if (!event.target.closest("#viewerAdminActions")) {
      adminMenu.hidden = true;
      adminTrigger.setAttribute("aria-expanded", "false");
    }
  });
  document
    .getElementById("viewerCollaborator")
    .addEventListener("click", (event) => {
      if (event.target.matches(".collaborator-link")) event.stopPropagation();
    });
  document.addEventListener("keydown", (event) => {
    if (!viewer.classList.contains("open")) return;
    if (event.key === "Escape" && !adminMenu.hidden) {
      adminMenu.hidden = true;
      adminTrigger.setAttribute("aria-expanded", "false");
      return;
    }
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") renderPost(viewerItemIndex - 1);
    if (event.key === "ArrowRight") renderPost(viewerItemIndex + 1);
  });
}

function isAdminSession() {
  return Boolean(
    FIREBASE_ADMIN_UID &&
    firebaseServices?.auth.currentUser?.uid === FIREBASE_ADMIN_UID,
  );
}

function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(
    (value) => value && !value.includes("YOUR_"),
  );
}

function loadFirebase() {
  if (firebaseReady) return firebaseReady;
  firebaseReady = (async () => {
    if (!isFirebaseConfigured())
      throw new Error("Isi firebaseConfig di script.js terlebih dahulu.");
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [appSdk, authSdk] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
    ]);
    const app = appSdk.initializeApp(firebaseConfig);
    firebaseServices = {
      ...authSdk,
      auth: authSdk.getAuth(app),
    };
    authSdk.onAuthStateChanged(firebaseServices.auth, () => {
      window.refreshViewerAdminControls?.();
      window.refreshProfilePhotoControls?.();
    });
    return firebaseServices;
  })();
  return firebaseReady;
}

function renderCategorySelect() {
  const select = document.getElementById("postCategory");
  if (!select) return;
  const selected = select.value;
  select.replaceChildren();
  CATEGORIES.forEach(({ key, label }) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    select.appendChild(option);
  });
  const createOption = document.createElement("option");
  createOption.value = "__new__";
  createOption.textContent = "+ Tambah Kategori Baru...";
  select.appendChild(createOption);
  if ([...select.options].some((option) => option.value === selected))
    select.value = selected;
}

function parseVideoEmbedUrl(value) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Masukkan link video yang valid.");
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Link video harus menggunakan HTTP atau HTTPS.");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (
    host === "youtu.be" ||
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    const videoId =
      host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : url.searchParams.get("v") ||
          url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
    if (!videoId || !/^[\w-]{11}$/.test(videoId))
      throw new Error("Link YouTube tidak berisi ID video yang valid.");
    return {
      platform: "youtube",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      originalUrl: url.href,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId =
      host === "player.vimeo.com"
        ? pathParts[pathParts.indexOf("video") + 1]
        : pathParts.find((part) => /^\d+$/.test(part));
    if (!videoId || !/^\d+$/.test(videoId))
      throw new Error("Link Vimeo tidak berisi ID video yang valid.");
    const videoIndex = pathParts.indexOf(videoId);
    const pathHash =
      videoIndex >= 0 && /^[a-zA-Z0-9]+$/.test(pathParts[videoIndex + 1] || "")
        ? pathParts[videoIndex + 1]
        : "";
    const hash = url.searchParams.get("h") || pathHash;
    const embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
    if (hash) embedUrl.searchParams.set("h", hash);
    return {
      platform: "vimeo",
      videoId,
      embedUrl: embedUrl.href,
      originalUrl: url.href,
    };
  }

  if (host === "drive.google.com") {
    const videoId =
      url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ||
      url.searchParams.get("id");
    if (!videoId || !/^[\w-]{10,}$/.test(videoId))
      throw new Error("Link Google Drive tidak berisi ID file yang valid.");
    return {
      platform: "drive",
      videoId,
      embedUrl: `https://drive.google.com/file/d/${videoId}/preview`,
      originalUrl: url.href,
    };
  }

  throw new Error("Gunakan link YouTube, Vimeo, atau Google Drive.");
}

function createVideoPlaceholder(platform) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Gagal membuat thumbnail video.");
  context.fillStyle = "#191a1c";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#536dfe";
  context.beginPath();
  context.arc(640, 330, 74, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#fff";
  context.beginPath();
  context.moveTo(620, 290);
  context.lineTo(620, 370);
  context.lineTo(686, 330);
  context.closePath();
  context.fill();
  context.font = "600 26px sans-serif";
  context.textAlign = "center";
  context.fillText(`${platform.toUpperCase()} VIDEO`, 640, 480);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gagal membuat thumbnail video."));
    }, "image/png");
  });
}

function makeCloudinaryContext(values) {
  return Object.entries(values)
    .map(
      ([key, value]) =>
        `${key}=${String(value ?? "")
          .replace(/\\/g, "\\\\")
          .replace(/[|=]/g, "\\$&")}`,
    )
    .join("|");
}

function makePostId() {
  return (
    window.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  );
}

function initUploadWorkflow() {
  const authDialog = document.getElementById("authDialog");
  const uploadDialog = document.getElementById("uploadDialog");
  const videoLinkDialog = document.getElementById("videoLinkDialog");
  const videoLinkForm = document.getElementById("videoLinkForm");
  const videoLinkInput = document.getElementById("videoLinkInput");
  const videoLinkMessage = document.getElementById("videoLinkMessage");
  const filesInput = document.getElementById("mediaFiles");
  const dropArea = document.getElementById("dropArea");
  const uploadStageElement = document.getElementById("uploadStage");
  const uploadForm = document.getElementById("uploadForm");
  const publishButton = document.getElementById("publishPost");
  const resetBuiltInButton = document.getElementById("editResetBuiltIn");
  const status = document.getElementById("uploadStatus");
  const feedbackStatus = document.getElementById("uploadFeedbackStatus");
  const uploadFeedback = document.getElementById("uploadFeedback");
  const uploadLoadingState = document.getElementById("uploadLoadingState");
  const uploadSuccessState = document.getElementById("uploadSuccessState");
  const uploadSuccessDone = document.getElementById("uploadSuccessDone");
  const uploadTitle = document.getElementById("uploadTitle");
  const postCaptionInput = document.getElementById("postCaption");
  const categorySelect = document.getElementById("postCategory");
  const newCategoryField = document.getElementById("newCategoryField");
  const newCategoryInput = document.getElementById("newCategory");
  const discardConfirm = document.getElementById("discardConfirm");
  const deletePostConfirm = document.getElementById("deletePostConfirm");
  const appNotice = document.getElementById("appNotice");
  const aboutProfileImage = document.getElementById("aboutProfileImage");
  const profilePhotoEdit = document.getElementById("profilePhotoEdit");
  const profilePhotoInput = document.getElementById("profilePhotoInput");
  const profilePhotoDialog = document.getElementById("profilePhotoDialog");
  const profilePhotoRemove = profilePhotoDialog.querySelector(
    '[data-profile-photo-action="remove"]',
  );
  const defaultProfilePhoto = aboutProfileImage.getAttribute("src").trim();
  let selectedProfilePhoto = null;
  let profilePhotoVersion = 0;
  let selectedMedia = [];
  let editOriginalPost = null;
  let editPostId = "";
  let draftPostId = "";
  let videoDraft = null;
  let pendingCreateType = "photo";
  let uploadPreviewIndex = 0;
  let uploadMode = "create";
  let uploadStage = "select";
  let drawerOpen = false;
  let deleteTarget = null;
  let noticeTimer = null;
  let activeController = null;
  let preparingImages = false;
  let filePreparationToken = 0;

  function syncNewCategoryField() {
    const creatingCategory = categorySelect.value === "__new__";
    newCategoryField.hidden = !creatingCategory;
    newCategoryInput.required = creatingCategory;
    if (!creatingCategory) newCategoryInput.value = "";
  }

  categorySelect.addEventListener("change", syncNewCategoryField);

  function setUploadStatus(message) {
    status.textContent = message;
    feedbackStatus.textContent = message;
  }

  function showDialog(dialog) {
    dialog.classList.add("open");
    dialog.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function hideDialog(dialog) {
    dialog.classList.remove("open");
    dialog.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".dialog-backdrop.open, .work-viewer.open"))
      document.body.style.overflow = "";
  }

  function showNotice(message) {
    appNotice.textContent = message;
    appNotice.classList.add("visible");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => appNotice.classList.remove("visible"), 4500);
  }
  window.showPortfolioNotice = showNotice;

  function renderProfilePhoto(photo) {
    profilePhotoVersion += 1;
    selectedProfilePhoto = photo;
    aboutProfileImage.src = photo?.secure_url || defaultProfilePhoto;
    profilePhotoRemove.hidden = !photo;
    document.querySelectorAll("[data-profile-avatar]").forEach((avatar) => {
      const image = avatar.querySelector("img");
      const fallback = avatar.querySelector(".profile-mark-fallback");
      if (photo?.secure_url) {
        image.src = photo.secure_url;
        image.hidden = false;
        fallback.hidden = true;
      } else {
        image.removeAttribute("src");
        image.hidden = true;
        fallback.hidden = false;
      }
    });
  }

  function refreshProfilePhotoControls() {
    const canEdit = isAdminSession();
    profilePhotoEdit.hidden = !canEdit;
    aboutProfileImage.classList.toggle("is-editable", canEdit);
    if (canEdit) {
      aboutProfileImage.tabIndex = 0;
      aboutProfileImage.setAttribute("role", "button");
      aboutProfileImage.setAttribute("aria-label", "Change profile photo");
    } else {
      aboutProfileImage.removeAttribute("tabindex");
      aboutProfileImage.removeAttribute("role");
      aboutProfileImage.removeAttribute("aria-label");
      if (profilePhotoDialog.classList.contains("open"))
        hideDialog(profilePhotoDialog);
    }
  }
  window.refreshProfilePhotoControls = refreshProfilePhotoControls;

  async function loadProfilePhoto() {
    const requestVersion = profilePhotoVersion;
    try {
      const result = await fetchProfilePhotoResponse("GET");
      if (
        result.photo !== null &&
        (!result.photo ||
          typeof result.photo.secure_url !== "string" ||
          typeof result.photo.public_id !== "string")
      ) {
        throw new Error("Respons foto profil tidak valid.");
      }
      if (requestVersion !== profilePhotoVersion) return;
      renderProfilePhoto(result.photo);
    } catch (error) {
      console.error("Profile photo loading failed:", error);
      showNotice(error.message || "Foto profil gagal dimuat.");
    }
  }

  async function fetchProfilePhotoResponse(method, payload, headers = {}) {
    const requestUrl = new URL(PROFILE_PHOTO_API, PROFILE_PHOTO_API_BASE).href;
    let response;
    try {
      response = await fetch(requestUrl, {
        method,
        headers: {
          ...headers,
          ...(payload ? { "Content-Type": "application/json" } : {}),
        },
        ...(payload ? { body: JSON.stringify(payload) } : {}),
      });
    } catch (error) {
      throw new Error(
        `Request foto profil gagal (${method} ${requestUrl}): ${error.message}`,
      );
    }

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Respons backend foto profil tidak valid (HTTP ${response.status}; ${method} ${requestUrl}).`,
      );
    }
    if (!response.ok) {
      throw new Error(
        `${result.error || "Permintaan foto profil gagal."} (HTTP ${response.status}; ${method} ${requestUrl}).`,
      );
    }
    return result;
  }

  async function requestProfilePhotoAdmin(method, payload) {
    const currentUser = firebaseServices?.auth.currentUser;
    if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
      throw new Error("Sesi admin tidak valid. Masuk kembali.");
    const idToken = await currentUser.getIdToken();
    return fetchProfilePhotoResponse(method, payload, {
      Authorization: `Bearer ${idToken}`,
    });
  }

  async function uploadProfilePhoto(file) {
    let uploadedPhoto = null;
    try {
      if (!isAdminSession())
        throw new Error("Masuk sebagai pemilik terlebih dahulu.");
      if (!file?.type.startsWith("image/"))
        throw new Error("Pilih file gambar yang didukung.");
      if (file.size >= 100 * 1024 * 1024)
        throw new Error("Ukuran file harus di bawah 100 MB.");

      showNotice("Mengunggah foto profil...");
      const compressedFile = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CLOUDINARY_UPLOAD_TIMEOUT_MS,
      );
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData, signal: controller.signal },
        );
        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Cloudinary mengembalikan respons tidak valid (HTTP ${response.status}).`,
          );
        }
        if (!response.ok)
          throw new Error(
            result.error?.message || "Foto profil gagal diunggah.",
          );
        if (
          typeof result.public_id !== "string" ||
          !result.public_id ||
          typeof result.secure_url !== "string"
        ) {
          throw new Error(
            "Respons upload Cloudinary tidak memuat foto profil.",
          );
        }
        uploadedPhoto = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      } finally {
        clearTimeout(timeoutId);
      }

      const saved = await requestProfilePhotoAdmin("POST", {
        public_id: uploadedPhoto.public_id,
        secure_url: uploadedPhoto.secure_url,
      });
      if (
        !saved.photo ||
        saved.photo.public_id !== uploadedPhoto.public_id ||
        saved.photo.secure_url !== uploadedPhoto.secure_url
      ) {
        throw new Error("Backend tidak mengonfirmasi penyimpanan foto profil.");
      }
      renderProfilePhoto(saved.photo);
      showNotice("Foto profil berhasil diperbarui.");
    } catch (error) {
      console.error("Profile photo upload failed:", error);
      showNotice(error.message || "Foto profil gagal diunggah.");
    } finally {
      profilePhotoInput.value = "";
    }
  }

  async function removeProfilePhoto() {
    if (!selectedProfilePhoto || !isAdminSession()) return;
    const removeButton = profilePhotoRemove;
    removeButton.disabled = true;
    try {
      if (!selectedProfilePhoto.public_id)
        throw new Error("Foto profil tidak memiliki Cloudinary public_id.");
      const deletionResults = await deleteCloudinaryAssets([
        {
          public_id: selectedProfilePhoto.public_id,
          resource_type: "image",
        },
      ]);
      if (
        deletionResults.length !== 1 ||
        !["ok", "not found"].includes(deletionResults[0].result)
      ) {
        throw new Error(
          "Cloudinary belum mengonfirmasi penghapusan foto profil.",
        );
      }

      const result = await requestProfilePhotoAdmin("DELETE");
      if (result.photo !== null)
        throw new Error("Backend tidak mengonfirmasi reset foto profil.");
      renderProfilePhoto(result.photo);
      hideDialog(profilePhotoDialog);
      showNotice("Foto profil direset ke foto bawaan.");
    } catch (error) {
      console.error("Profile photo removal failed:", error);
      showNotice(error.message || "Foto profil gagal dihapus.");
    } finally {
      removeButton.disabled = false;
    }
  }

  function openProfilePhotoMenu() {
    if (isAdminSession()) showDialog(profilePhotoDialog);
  }

  profilePhotoEdit.addEventListener("click", openProfilePhotoMenu);
  aboutProfileImage.addEventListener("click", openProfilePhotoMenu);
  aboutProfileImage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProfilePhotoMenu();
    }
  });
  profilePhotoDialog.addEventListener("click", (event) => {
    if (event.target === profilePhotoDialog) {
      hideDialog(profilePhotoDialog);
      return;
    }
    const action = event.target.closest("[data-profile-photo-action]")?.dataset
      .profilePhotoAction;
    if (action === "upload") {
      hideDialog(profilePhotoDialog);
      profilePhotoInput.click();
    } else if (action === "remove") {
      void removeProfilePhoto();
    } else if (action === "cancel") {
      hideDialog(profilePhotoDialog);
    }
  });
  profilePhotoInput.addEventListener("change", () => {
    if (profilePhotoInput.files?.[0])
      void uploadProfilePhoto(profilePhotoInput.files[0]);
  });

  function clearDraft() {
    document.getElementById("uploadPreviewVideo").pause();
    document.getElementById("uploadPreviewFrame").removeAttribute("src");
    filePreparationToken += 1;
    preparingImages = false;
    filesInput.disabled = false;
    selectedMedia.forEach(releasePreparedMedia);
    selectedMedia = [];
    editOriginalPost = null;
    editPostId = "";
    draftPostId = "";
    videoDraft = null;
    uploadPreviewIndex = 0;
    drawerOpen = false;
    filesInput.value = "";
    document.getElementById("uploadPreviewImage").removeAttribute("src");
    document.getElementById("uploadPreviewVideo").removeAttribute("src");
    document.getElementById("uploadMediaDrawer").hidden = true;
  }

  function setUploadStage(stage) {
    uploadStage = stage;
    uploadStageElement.hidden = false;
    uploadFeedback.hidden = true;
    uploadLoadingState.hidden = false;
    uploadSuccessState.hidden = true;
    uploadSuccessDone.hidden = true;
    document.getElementById("uploadClose").hidden = false;
    const isPreview = uploadMode === "create" && stage === "preview";
    const isEditing = uploadMode === "edit";
    dropArea.hidden = stage !== "select";
    uploadForm.hidden = stage === "select";
    uploadForm.classList.toggle("is-preview", isPreview);
    uploadTitle.textContent = isPreview
      ? "Preview Foto"
      : isEditing
        ? "Edit info"
        : uploadMode === "video"
          ? "Postingan Video"
          : "Buat postingan baru";
    document.getElementById("uploadBack").hidden =
      stage === "select" || isEditing;
    document.getElementById("uploadCancel").hidden = stage === "select";
    document.getElementById("uploadNext").hidden = !isPreview;
    publishButton.hidden = isPreview || stage === "select";
    publishButton.textContent = isEditing ? "Selesai" : "Bagikan";
    document.getElementById("editRemoveCurrent").hidden =
      !isEditing || stage === "select";
    resetBuiltInButton.hidden =
      !isEditing || !editOriginalPost?.assetKey || stage === "select";
    drawerOpen = false;
    document.getElementById("uploadMediaDrawer").hidden = true;
  }

  function showUploadLoading() {
    uploadStageElement.hidden = true;
    uploadFeedback.hidden = false;
    uploadLoadingState.hidden = false;
    uploadSuccessState.hidden = true;
    uploadTitle.textContent = "Membagikan";
    document.getElementById("uploadBack").hidden = true;
    document.getElementById("uploadNext").hidden = true;
    publishButton.hidden = true;
    uploadSuccessDone.hidden = true;
    document.getElementById("uploadClose").hidden = false;
  }

  function showUploadSuccess() {
    uploadStageElement.hidden = true;
    uploadFeedback.hidden = false;
    uploadLoadingState.hidden = true;
    uploadSuccessState.hidden = false;
    uploadTitle.textContent = "Buat postingan baru";
    document.getElementById("uploadBack").hidden = true;
    document.getElementById("uploadCancel").hidden = true;
    document.getElementById("uploadNext").hidden = true;
    publishButton.hidden = true;
    document.getElementById("uploadClose").hidden = true;
    uploadSuccessDone.hidden = false;
  }

  function restoreUploadEditor() {
    uploadStageElement.hidden = false;
    uploadFeedback.hidden = true;
    uploadLoadingState.hidden = false;
    uploadSuccessState.hidden = true;
    document.getElementById("uploadClose").hidden = false;
    setUploadStage(uploadStage);
  }

  function resetFormFields() {
    uploadForm.reset();
    postCaptionInput.required = true;
    syncNewCategoryField();
    setUploadStatus("");
    publishButton.disabled = false;
    publishButton.removeAttribute("aria-busy");
  }

  function finishUploadClose(cancelPending = true) {
    if (cancelPending) activeController?.abort();
    discardConfirm.classList.remove("open");
    discardConfirm.setAttribute("aria-hidden", "true");
    hideDialog(uploadDialog);
    clearDraft();
    resetFormFields();
    uploadMode = "create";
    setUploadStage("select");
    categorySelect.value = CATEGORIES[0]?.key || "__new__";
  }

  function confirmDiscard() {
    if (!uploadSuccessDone.hidden) return;
    if (uploadMode === "edit" || selectedMedia.length > 0) {
      discardConfirm.classList.add("open");
      discardConfirm.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      return;
    }
    finishUploadClose();
  }

  function dismissDiscardConfirm() {
    discardConfirm.classList.remove("open");
    discardConfirm.setAttribute("aria-hidden", "true");
    if (!uploadDialog.classList.contains("open"))
      document.body.style.overflow = "";
  }

  function startCreate(openPicker = false) {
    clearDraft();
    resetFormFields();
    uploadMode = "create";
    draftPostId = makePostId();
    renderCategorySelect();
    categorySelect.value = CATEGORIES[0]?.key || "__new__";
    setUploadStage("select");
    showDialog(uploadDialog);
    if (openPicker) filesInput.click();
  }

  function startVideoCreate(video) {
    clearDraft();
    resetFormFields();
    uploadMode = "video";
    draftPostId = makePostId();
    videoDraft = video;
    selectedMedia = [
      {
        key: `embed-${draftPostId}`,
        kind: "embed",
        type: "embed",
        embedUrl: video.embedUrl,
        platform: video.platform,
        thumbnailPreview:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23191a1c'/%3E%3Cpath d='M7 2.5 11 4.5 7 6.5z' fill='white'/%3E%3C/svg%3E",
      },
    ];
    videoLinkInput.value = video.originalUrl;
    videoLinkMessage.textContent = "";
    renderCategorySelect();
    categorySelect.value = CATEGORIES[0]?.key || "__new__";
    setUploadStage("details");
    hideDialog(videoLinkDialog);
    showDialog(uploadDialog);
    showUploadMedia(0);
  }

  function closeVideoLinkDialog() {
    hideDialog(videoLinkDialog);
    videoLinkForm.reset();
    videoLinkMessage.textContent = "";
  }

  function openCreate(type = "photo") {
    pendingCreateType = type;
    document.getElementById("createMenu").hidden = true;
    document
      .getElementById("createPostBtn")
      .setAttribute("aria-expanded", "false");
    if (!isAdminSession()) {
      document.getElementById("authMessage").textContent =
        !isFirebaseConfigured()
          ? "Konfigurasi Firebase belum diisi di script.js."
          : !FIREBASE_ADMIN_UID
            ? "UID admin belum diisi di script.js; fitur posting belum tersedia."
            : "Masuk menggunakan akun admin Firebase Auth.";
      showDialog(authDialog);
      return;
    }
    if (type === "video") {
      videoLinkForm.reset();
      videoLinkMessage.textContent = "";
      showDialog(videoLinkDialog);
    } else startCreate(true);
  }

  const createPostButton = document.getElementById("createPostBtn");
  const createMenu = document.getElementById("createMenu");
  createPostButton?.addEventListener("click", () => {
    const expanded = createPostButton.getAttribute("aria-expanded") === "true";
    createPostButton.setAttribute("aria-expanded", String(!expanded));
    createMenu.hidden = expanded;
  });
  createMenu.addEventListener("click", (event) => {
    const type = event.target.closest("[data-create-type]")?.dataset.createType;
    if (type === "photo" || type === "video") openCreate(type);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".create-menu-wrap")) {
      createMenu.hidden = true;
      createPostButton?.setAttribute("aria-expanded", "false");
    }
  });
  videoLinkForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      startVideoCreate(parseVideoEmbedUrl(videoLinkInput.value));
    } catch (error) {
      videoLinkMessage.textContent = error.message || "Link video tidak valid.";
    }
  });
  document
    .getElementById("videoLinkCancel")
    .addEventListener("click", closeVideoLinkDialog);
  document
    .getElementById("videoLinkClose")
    .addEventListener("click", closeVideoLinkDialog);
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => hideDialog(authDialog));
  });
  authDialog.addEventListener("click", (event) => {
    if (event.target === authDialog) hideDialog(authDialog);
  });
  videoLinkDialog.addEventListener("click", (event) => {
    if (event.target === videoLinkDialog) closeVideoLinkDialog();
  });
  uploadDialog.addEventListener("click", (event) => {
    if (event.target === uploadDialog) confirmDiscard();
  });
  document
    .getElementById("uploadClose")
    .addEventListener("click", confirmDiscard);
  document
    .getElementById("uploadCancel")
    .addEventListener("click", confirmDiscard);
  document
    .getElementById("discardChanges")
    .addEventListener("click", finishUploadClose);
  document
    .getElementById("keepEditing")
    .addEventListener("click", dismissDiscardConfirm);
  uploadSuccessDone.addEventListener("click", () => {
    finishUploadClose(false);
    window.location.hash = "work";
    document.getElementById("work").scrollIntoView({ behavior: "smooth" });
  });
  discardConfirm.addEventListener("click", (event) => {
    if (event.target === discardConfirm) dismissDiscardConfirm();
  });

  document
    .getElementById("authForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.getElementById("authMessage");
      if (!FIREBASE_ADMIN_UID) {
        message.textContent =
          "UID admin belum diisi di script.js; fitur posting belum tersedia.";
        return;
      }
      message.textContent = "Menghubungkan ke Firebase...";
      try {
        const services = await loadFirebase();
        const credential = await services.signInWithEmailAndPassword(
          services.auth,
          document.getElementById("adminEmail").value.trim(),
          document.getElementById("adminPassword").value,
        );
        if (credential.user.uid !== FIREBASE_ADMIN_UID) {
          await services.signOut(services.auth);
          throw new Error("Akun ini tidak memiliki akses pemilik.");
        }
        hideDialog(authDialog);
        openCreate(pendingCreateType);
      } catch (error) {
        message.textContent =
          error.message ||
          "Gagal masuk. Periksa konfigurasi dan akun Firebase Auth.";
      }
    });

  function mediaUrl(item) {
    if (item.kind === "existing") return item.media.src || item.media.full;
    if (item.kind === "embed") return item.thumbnailPreview;
    return item.preview;
  }

  function mediaType(item) {
    if (item.kind === "existing") return item.media.type || "image";
    return item.kind === "embed" ? "embed" : item.type;
  }

  function renderMediaDrawer() {
    const drawer = document.getElementById("uploadMediaDrawer");
    const thumbnails = document.getElementById("uploadThumbnails");
    const toggle = document.getElementById("uploadMultiToggle");
    drawer.hidden = !drawerOpen;
    toggle.hidden =
      uploadStage === "select" ||
      selectedMedia.length === 0 ||
      uploadMode === "video";
    document.getElementById("uploadAddMedia").hidden =
      uploadMode === "video" || selectedMedia.length >= 10;
    toggle.setAttribute("aria-expanded", String(drawerOpen));
    thumbnails.replaceChildren();
    selectedMedia.forEach((item, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "upload-thumb-wrap";
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = `upload-thumb${index === uploadPreviewIndex ? " active" : ""}`;
      thumb.setAttribute("aria-label", `Pilih media ${index + 1}`);
      const source = document.createElement(
        mediaType(item) === "video" ? "video" : "img",
      );
      source.src = mediaUrl(item);
      if (source instanceof HTMLVideoElement) {
        source.muted = true;
        source.playsInline = true;
        source.preload = "metadata";
      } else source.alt = "";
      thumb.appendChild(source);
      thumb.addEventListener("click", () => showUploadMedia(index));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "upload-thumb-remove";
      remove.textContent = "?";
      remove.setAttribute("aria-label", `Hapus media ${index + 1}`);
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        removeSelectedMedia(index);
      });
      wrapper.append(thumb, remove);
      thumbnails.appendChild(wrapper);
    });
  }

  function showUploadMedia(index) {
    if (!selectedMedia.length) {
      renderMediaDrawer();
      return;
    }
    uploadPreviewIndex = (index + selectedMedia.length) % selectedMedia.length;
    const item = selectedMedia[uploadPreviewIndex];
    const image = document.getElementById("uploadPreviewImage");
    const video = document.getElementById("uploadPreviewVideo");
    const frame = document.getElementById("uploadPreviewFrame");
    frame.removeAttribute("src");
    if (mediaType(item) === "embed") {
      image.hidden = true;
      video.pause();
      video.removeAttribute("src");
      video.hidden = true;
      frame.hidden = false;
      frame.src =
        item.kind === "existing" ? item.media.embedUrl : item.embedUrl;
    } else if (mediaType(item) === "video") {
      image.hidden = true;
      video.hidden = false;
      frame.hidden = true;
      video.src = mediaUrl(item);
    } else {
      video.pause();
      video.removeAttribute("src");
      video.hidden = true;
      frame.hidden = true;
      image.hidden = false;
      image.src = mediaUrl(item);
    }
    const dots = document.getElementById("uploadMediaDots");
    dots.replaceChildren();
    selectedMedia.forEach((_, dotIndex) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = dotIndex === uploadPreviewIndex ? "active" : "";
      dot.setAttribute("aria-label", `Pratinjau media ${dotIndex + 1}`);
      dot.addEventListener("click", () => showUploadMedia(dotIndex));
      dots.appendChild(dot);
    });
    dots.hidden = selectedMedia.length < 2;
    document.getElementById("uploadMediaPrev").hidden =
      selectedMedia.length < 2;
    document.getElementById("uploadMediaNext").hidden =
      selectedMedia.length < 2;
    document.getElementById("editRemoveCurrent").hidden =
      uploadMode !== "edit" || uploadStage === "select";
    renderMediaDrawer();
  }

  async function acceptFiles(fileList) {
    if (preparingImages) return;
    const files = [...fileList].filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) {
      setUploadStatus("Pilih file gambar yang didukung.");
      filesInput.value = "";
      return;
    }
    if (files.length + selectedMedia.length > 10) {
      setUploadStatus("Maksimal 10 file per postingan.");
      filesInput.value = "";
      return;
    }
    if (files.some((file) => file.size >= 100 * 1024 * 1024)) {
      setUploadStatus("Ukuran setiap file harus di bawah 100 MB.");
      filesInput.value = "";
      return;
    }
    const wasSelecting = uploadStage === "select";
    const token = filePreparationToken + 1;
    filePreparationToken = token;
    preparingImages = true;
    filesInput.disabled = true;
    const preparedItems = files.map((file, index) => ({
      key: `new-${Date.now()}-${selectedMedia.length + index}`,
      kind: "new",
      file: null,
      type: "image",
      preview: URL.createObjectURL(file),
    }));
    setUploadStatus(`Mengompres ${files.length} gambar...`);
    try {
      const compressedFiles = await Promise.all(
        files.map((file) => compressImageFile(file)),
      );
      if (token !== filePreparationToken) {
        preparedItems.forEach(releasePreparedMedia);
        return;
      }
      compressedFiles.forEach((file, index) => {
        preparedItems[index].file = file;
      });
      selectedMedia.push(...preparedItems);
      if (wasSelecting) setUploadStage("preview");
      const thumbnailKilobytes = Math.round(
        compressedFiles.reduce((total, file) => total + file.size, 0) / 1024,
      );
      setUploadStatus(
        `${files.length} media siap (${thumbnailKilobytes} KB total thumbnail)`,
      );
      filesInput.value = "";
      showUploadMedia(0);
    } catch (error) {
      preparedItems.forEach(releasePreparedMedia);
      if (token === filePreparationToken)
        setUploadStatus(error.message || "Gagal mengompres gambar.");
    } finally {
      if (token === filePreparationToken) {
        preparingImages = false;
        filesInput.disabled = false;
      }
      filesInput.value = "";
    }
  }

  filesInput.addEventListener("change", () => {
    void acceptFiles(filesInput.files);
  });
  document.getElementById("uploadAddMedia").addEventListener("click", () => {
    if (selectedMedia.length < 10) filesInput.click();
    else setUploadStatus("Maksimal 10 file per postingan.");
  });
  document.getElementById("uploadMultiToggle").addEventListener("click", () => {
    drawerOpen = !drawerOpen;
    renderMediaDrawer();
  });

  function removeSelectedMedia(index) {
    if (
      uploadMode === "edit" &&
      selectedMedia.length === 1 &&
      !editOriginalPost?.assetKey
    ) {
      setUploadStatus("Postingan harus memiliki minimal satu media.");
      return;
    }
    const [removed] = selectedMedia.splice(index, 1);
    releasePreparedMedia(removed);
    if (!selectedMedia.length) {
      uploadPreviewIndex = 0;
      drawerOpen = false;
      setUploadStage("select");
      document.getElementById("uploadPreviewVideo").pause();
      document.getElementById("uploadPreviewImage").removeAttribute("src");
      document.getElementById("uploadPreviewVideo").removeAttribute("src");
      return;
    }
    if (uploadPreviewIndex > index) uploadPreviewIndex -= 1;
    else if (uploadPreviewIndex === index)
      uploadPreviewIndex = Math.min(index, selectedMedia.length - 1);
    setUploadStatus(`${selectedMedia.length} media dipilih`);
    showUploadMedia(uploadPreviewIndex);
  }

  ["dragenter", "dragover"].forEach((name) =>
    dropArea.addEventListener(name, (event) => {
      event.preventDefault();
      dropArea.classList.add("dragging");
    }),
  );
  ["dragleave", "drop"].forEach((name) =>
    dropArea.addEventListener(name, (event) => {
      event.preventDefault();
      dropArea.classList.remove("dragging");
    }),
  );
  dropArea.addEventListener("drop", (event) => {
    void acceptFiles(event.dataTransfer.files);
  });
  document.getElementById("uploadBack").addEventListener("click", () => {
    if (uploadMode === "video" && uploadStage === "details") {
      const originalUrl = videoDraft?.originalUrl || "";
      finishUploadClose(false);
      videoLinkInput.value = originalUrl;
      videoLinkMessage.textContent = "";
      showDialog(videoLinkDialog);
      return;
    }
    if (uploadMode === "create" && uploadStage === "details")
      setUploadStage("preview");
    else confirmDiscard();
  });
  document
    .getElementById("uploadClose")
    .addEventListener("click", confirmDiscard);
  document
    .getElementById("uploadCancel")
    .addEventListener("click", confirmDiscard);
  document
    .getElementById("discardChanges")
    .addEventListener("click", finishUploadClose);
  document
    .getElementById("keepEditing")
    .addEventListener("click", dismissDiscardConfirm);
  document.getElementById("uploadNext").addEventListener("click", () => {
    if (!selectedMedia.length) {
      setUploadStatus("Pilih minimal satu foto.");
      return;
    }
    renderCategorySelect();
    setUploadStage("details");
  });
  document
    .getElementById("uploadMediaPrev")
    .addEventListener("click", () => showUploadMedia(uploadPreviewIndex - 1));
  document
    .getElementById("uploadMediaNext")
    .addEventListener("click", () => showUploadMedia(uploadPreviewIndex + 1));
  document
    .getElementById("editRemoveCurrent")
    .addEventListener("click", () => removeSelectedMedia(uploadPreviewIndex));
  resetBuiltInButton.addEventListener("click", async () => {
    if (!editOriginalPost?.assetKey) return;
    resetBuiltInButton.disabled = true;
    try {
      await window.resetBuiltInPhotoEdit(editOriginalPost);
      finishUploadClose(false);
      showNotice("Foto bawaan dikembalikan ke data asli.");
    } catch (error) {
      setUploadStatus(error.message || "Foto bawaan gagal direset.");
      console.error("Built-in photo reset failed:", error);
    } finally {
      resetBuiltInButton.disabled = false;
    }
  });

  function openPortfolioEditor(item) {
    if (
      !isAdminSession() ||
      (!item?.assetKey && !String(item?.id || "").startsWith("cloudinary-"))
    )
      return;
    clearDraft();
    resetFormFields();
    uploadMode = "edit";
    editOriginalPost = item;
    editPostId = String(item.id).replace(/^cloudinary-/, "");
    postCaptionInput.required = !item.assetKey;
    selectedMedia = normalizedMedia(item).map((media, index) => ({
      key: `existing-${index}-${media.full || media.src}`,
      kind: "existing",
      media,
      type: media.type || "image",
    }));
    renderCategorySelect();
    postCaptionInput.value = item.caption || "";
    document.getElementById("postCollaborator").value = item.collaborator || "";
    if (
      ![...categorySelect.options].some(
        (option) => option.value === item.category,
      )
    ) {
      const option = document.createElement("option");
      option.value = item.category;
      option.textContent = item.label || item.category;
      categorySelect.insertBefore(option, categorySelect.lastElementChild);
    }
    categorySelect.value = item.category;
    document.getElementById("newCategory").value = "";
    document.getElementById("newCategory").required = false;
    newCategoryField.hidden = true;
    setUploadStage("details");
    showUploadMedia(0);
    window.closeWorkViewer?.();
    showDialog(uploadDialog);
  }
  window.openPortfolioEditor = openPortfolioEditor;

  function requestDeletePost(item) {
    if (!isAdminSession() || !String(item?.id || "").startsWith("cloudinary-"))
      return;
    deleteTarget = item;
    deletePostConfirm.classList.add("open");
    deletePostConfirm.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function cancelDeletePost() {
    deleteTarget = null;
    deletePostConfirm.classList.remove("open");
    deletePostConfirm.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".dialog-backdrop.open, .work-viewer.open"))
      document.body.style.overflow = "";
  }

  async function deletePortfolioPost() {
    const target = deleteTarget;
    if (!target || !isAdminSession()) {
      cancelDeletePost();
      return;
    }
    const button = document.getElementById("confirmDeletePost");
    const postId = String(target.id).replace(/^cloudinary-/, "");
    let partiallyDeleted = false;
    button.disabled = true;
    try {
      const currentUser = firebaseServices?.auth.currentUser;
      if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
        throw new Error("Sesi admin tidak valid. Masuk kembali.");
      const media = normalizedMedia(target);
      const assets = cloudinaryAssetsForMedia(media);
      if (media.some((item) => !item.public_id))
        throw new Error(
          "Postingan ini tidak memiliki Cloudinary public_id; file tidak dapat dihapus otomatis.",
        );

      const deletionResults = await deleteCloudinaryAssets(assets);
      const confirmedDeletions = deletionResults.filter(
        (item) => item.result === "ok",
      );
      if (confirmedDeletions.length !== assets.length) {
        if (confirmedDeletions.length) {
          const deletedIds = new Set(
            confirmedDeletions.map((item) => item.public_id),
          );
          window.updatePortfolioPostMedia?.(
            postId,
            media
              .filter((item) => !deletedIds.has(item.public_id))
              .map((item) =>
                deletedIds.has(item.original_public_id)
                  ? {
                      ...item,
                      full: item.src,
                      original_public_id: "",
                    }
                  : item,
              ),
          );
          partiallyDeleted = true;
        }
        throw new Error("Cloudinary belum mengonfirmasi semua penghapusan.");
      }

      window.removePortfolioPost?.(postId);
      cancelDeletePost();
      window.closeWorkViewer?.();
      showNotice("Postingan berhasil dihapus.");
    } catch (error) {
      if (partiallyDeleted) window.closeWorkViewer?.();
      const viewerStatus = document.getElementById("viewerAdminStatus");
      viewerStatus.textContent = error.message || "Postingan gagal dihapus.";
      cancelDeletePost();
      showNotice(viewerStatus.textContent);
    } finally {
      button.disabled = false;
      deleteTarget = null;
    }
  }

  window.requestDeletePortfolioPost = requestDeletePost;
  document
    .getElementById("confirmDeletePost")
    .addEventListener("click", deletePortfolioPost);
  document
    .getElementById("cancelDeletePost")
    .addEventListener("click", cancelDeletePost);
  deletePostConfirm.addEventListener("click", (event) => {
    if (event.target === deletePostConfirm) cancelDeletePost();
  });

  function categoryDetails() {
    let categoryKey = categorySelect.value;
    let categoryLabel;
    if (categoryKey === "__new__") {
      categoryLabel = document.getElementById("newCategory").value.trim();
      categoryKey = categoryLabel
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (!categoryKey) throw new Error("Nama kategori tidak valid.");
    } else {
      categoryLabel =
        CATEGORIES.find((item) => item.key === categoryKey)?.label ||
        categoryKey;
    }
    return { categoryKey, categoryLabel };
  }

  async function uploadNewMedia(item, index, total, metadata) {
    const controller = new AbortController();
    activeController = controller;
    const formData = new FormData();
    const isVideoEmbed = item.kind === "embed";
    setUploadStatus(`Mengunggah media ${index + 1}/${total} ke Cloudinary...`);
    const timeoutId = setTimeout(
      () => controller.abort(),
      CLOUDINARY_UPLOAD_TIMEOUT_MS,
    );
    try {
      const file = isVideoEmbed
        ? item.platform === "youtube"
          ? `https://img.youtube.com/vi/${videoDraft.videoId}/hqdefault.jpg`
          : await createVideoPlaceholder(item.platform)
        : item.file;
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append(
        "tags",
        metadata.asset_role === "gallery_override"
          ? "portfolio_override"
          : "portfolio_item",
      );
      formData.append("context", makeCloudinaryContext(metadata));
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData, signal: controller.signal },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || "Cloudinary gagal mengunggah media.",
        );
      if (!result.secure_url)
        throw new Error("Cloudinary tidak mengembalikan secure_url.");
      if (!result.public_id)
        throw new Error("Cloudinary tidak mengembalikan public_id.");
      return {
        type: isVideoEmbed ? "embed" : "image",
        full: result.secure_url,
        src: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type || "image",
        embedUrl: isVideoEmbed ? videoDraft.embedUrl : "",
        slideIndex: index,
      };
    } finally {
      clearTimeout(timeoutId);
      if (activeController === controller) activeController = null;
    }
  }

  async function postCloudinaryAdminRequest(url, payload, method = "POST") {
    const currentUser = firebaseServices?.auth.currentUser;
    if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
      throw new Error("Sesi admin tidak valid. Masuk kembali.");
    const idToken = await currentUser.getIdToken();
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend Cloudinary mengembalikan respons tidak valid (HTTP ${response.status}).`,
      );
    }
    if (!response.ok)
      throw new Error(result.error || "Permintaan Cloudinary gagal.");
    return result;
  }

  async function deleteCloudinaryAssets(assets) {
    const uniqueAssets = [
      ...new Map(
        assets.map((asset) => [
          `${asset.resource_type}:${asset.public_id}`,
          asset,
        ]),
      ).values(),
    ];
    if (!uniqueAssets.length) return [];

    const currentUser = firebaseServices?.auth.currentUser;
    if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
      throw new Error("Sesi admin tidak valid. Masuk kembali.");
    const idToken = await currentUser.getIdToken();
    const results = [];
    for (let offset = 0; offset < uniqueAssets.length; offset += 10) {
      const batch = uniqueAssets.slice(offset, offset + 10);
      const response = await fetch(CLOUDINARY_DELETE_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assets: batch }),
      });
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        const originHint =
          new URL(CLOUDINARY_DELETE_ENDPOINT).origin === window.location.origin
            ? " Pastikan website dibuka melalui backend (misalnya http://localhost:3000), bukan Live Server."
            : "";
        throw new Error(
          `Backend penghapusan tidak mengembalikan JSON yang valid (HTTP ${response.status}).${originHint}`,
        );
      }
      if (!Array.isArray(result.results))
        throw new Error(
          result.error || "Respons penghapusan Cloudinary tidak valid.",
        );
      results.push(...result.results);
    }
    return results;
  }

  function cloudinaryAssetsForMedia(media) {
    const assets = [];
    media.forEach((item) => {
      if (item.public_id) {
        assets.push({
          public_id: item.public_id,
          resource_type: item.resource_type || "image",
        });
      }
      if (item.original_public_id) {
        assets.push({
          public_id: item.original_public_id,
          resource_type: item.original_resource_type || "image",
        });
      }
    });
    return [
      ...new Map(
        assets.map((asset) => [
          `${asset.resource_type}:${asset.public_id}`,
          asset,
        ]),
      ).values(),
    ];
  }

  function releasePreparedMedia(item) {
    if (!item) return;
    if (item.kind === "new" && item.preview) URL.revokeObjectURL(item.preview);
  }

  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (publishButton.disabled) return;
    const newAssetsUploaded = [];
    const isEditing = uploadMode === "edit";
    let editingChangesCommitted = false;
    publishButton.disabled = true;
    publishButton.setAttribute("aria-busy", "true");
    publishButton.textContent =
      uploadMode === "edit" ? "Menyimpan..." : "Mengunggah...";
    setUploadStatus("Menyiapkan postingan...");
    if (uploadMode !== "edit") showUploadLoading();
    try {
      const currentUser = firebaseServices?.auth.currentUser;
      if (!currentUser || currentUser.uid !== FIREBASE_ADMIN_UID)
        throw new Error("Sesi admin tidak valid. Masuk kembali.");
      if (!selectedMedia.length)
        throw new Error("Pilih media untuk postingan.");
      const { categoryKey, categoryLabel } = categoryDetails();
      const collaborator = document
        .getElementById("postCollaborator")
        .value.trim()
        .replace(/^@/, "");
      if (collaborator && !/^[a-zA-Z0-9._]{1,30}$/.test(collaborator))
        throw new Error("Username kolaborator tidak valid.");
      if (categorySelect.value === "__new__") {
        const result = await postCloudinaryAdminRequest(CATEGORIES_API, {
          key: categoryKey,
          label: categoryLabel,
        });
        if (!Array.isArray(result.categories))
          throw new Error("Respons penyimpanan kategori tidak valid.");
        window.updatePortfolioCategories?.(result.categories);
      }

      const postId = isEditing ? editPostId : draftPostId;
      const caption = document.getElementById("postCaption").value.trim();
      const isBuiltInEdit = isEditing && Boolean(editOriginalPost?.assetKey);
      if (isBuiltInEdit) {
        const mediaToPublish = [...selectedMedia];
        const savedMedia = [];
        for (const [index, item] of mediaToPublish.entries()) {
          if (item.kind === "existing") {
            savedMedia.push(item.media);
            continue;
          }
          if (item.kind !== "new")
            throw new Error("Foto bawaan hanya mendukung media gambar.");
          const uploadedItem = await uploadNewMedia(
            item,
            index,
            mediaToPublish.length,
            {
              type: "image",
              caption,
              category: categoryKey,
              category_label: categoryLabel,
              collaborator,
              post_id: makePostId(),
              slide_index: index,
              asset_role: "gallery_override",
            },
          );
          savedMedia.push(uploadedItem);
          newAssetsUploaded.push({
            public_id: uploadedItem.public_id,
            resource_type: uploadedItem.resource_type,
          });
        }
        await window.saveBuiltInPhotoEdit(editOriginalPost, {
          caption,
          categoryKey,
          categoryLabel,
          collaborator,
          media: savedMedia.map((media) => ({
            type: "image",
            src: media.src || media.full,
            full: media.full || media.src,
          })),
        });
        editingChangesCommitted = true;
        finishUploadClose(false);
        showNotice("Foto bawaan berhasil diperbarui.");
        document.getElementById("work").scrollIntoView({ behavior: "smooth" });
        return;
      }
      const uploaded = [];
      const mediaToPublish = [...selectedMedia];
      for (const [index, item] of mediaToPublish.entries()) {
        const isVideo =
          item.kind === "embed" ||
          (item.kind === "existing" && item.media.type === "embed");
        const metadata = {
          type: isVideo ? "video" : "image",
          ...(isVideo
            ? {
                video_url:
                  item.kind === "existing"
                    ? item.media.embedUrl
                    : videoDraft.embedUrl,
              }
            : {}),
          caption,
          category: categoryKey,
          category_label: categoryLabel,
          collaborator,
          post_id: postId,
          slide_index: index,
        };
        if (item.kind === "existing") {
          uploaded.push({ ...item.media, slideIndex: index });
        } else {
          const uploadedItem = await uploadNewMedia(
            item,
            index,
            mediaToPublish.length,
            metadata,
          );
          uploaded.push(uploadedItem);
          newAssetsUploaded.push({
            public_id: uploadedItem.public_id,
            resource_type: uploadedItem.resource_type,
          });
        }
      }

      const assets = uploaded.map((item, index) => {
        const isVideo = item.type === "embed";
        return {
          public_id: item.public_id,
          resource_type: item.resource_type || "image",
          context: {
            type: isVideo ? "video" : "image",
            ...(isVideo ? { video_url: item.embedUrl } : {}),
            caption,
            category: categoryKey,
            category_label: categoryLabel,
            collaborator,
            post_id: postId,
            slide_index: index,
          },
        };
      });

      if (isEditing) {
        editingChangesCommitted = true;
      }

      const result = await postCloudinaryAdminRequest(
        CLOUDINARY_CONTEXT_API,
        { assets },
      );
      if (
        !Array.isArray(result.results) ||
        result.results.length !== assets.length ||
        result.results.some((item) => item.result !== "ok")
      )
        throw new Error(
          "Cloudinary belum mengonfirmasi metadata postingan.",
        );

      if (isEditing) {
        const existingItems = mediaToPublish.filter(
          (item) => item.kind === "existing",
        );
        const retainedIds = new Set(
          existingItems.map((item) => item.media.public_id),
        );
        const removedAssets = normalizedMedia(editOriginalPost)
          .filter((item) => !retainedIds.has(item.public_id))
          .flatMap((item) => cloudinaryAssetsForMedia([item]));
        if (removedAssets.length) {
          const results = await deleteCloudinaryAssets(removedAssets);
          if (
            results.length !== removedAssets.length ||
            results.some((item) => item.result !== "ok")
          )
            throw new Error("Cloudinary belum menghapus semua media lama.");
        }
      }

      const postData = {
        id: postId,
        caption,
        category: categoryKey,
        categoryKey,
        categoryLabel,
        collaborator,
        media: uploaded,
        mediaUrl: uploaded[0]?.full || "",
        mediaUrls: uploaded.map((item) => item.full),
        createdAt: new Date(),
      };
      setUploadStatus("Menampilkan postingan di galeri...");
      tambahkanKeGaleri({ ...postData, label: categoryLabel });
      if (isEditing) {
        finishUploadClose(false);
        showNotice("Postingan berhasil diperbarui.");
        document.getElementById("work").scrollIntoView({ behavior: "smooth" });
      } else {
        await window.savePortfolioGalleryOrder?.();
        setUploadStatus(
          "Upload berhasil. Postingan sudah ditambahkan ke galeri.",
        );
        showUploadSuccess();
      }
    } catch (error) {
      let message = error.message || "Postingan gagal diunggah.";
      if (
        newAssetsUploaded.length &&
        (!isEditing || !editingChangesCommitted)
      ) {
        try {
          const results = await deleteCloudinaryAssets(newAssetsUploaded);
          if (
            results.length !== newAssetsUploaded.length ||
            results.some((item) => item.result !== "ok")
          )
            throw new Error(
              "Cloudinary tidak mengonfirmasi penghapusan media.",
            );
        } catch (cleanupError) {
          console.error("Gagal membersihkan upload parsial:", cleanupError);
          message += " Sebagian file yang sempat terunggah mungkin masih ada.";
        }
      }
      restoreUploadEditor();
      setUploadStatus(message);
      console.error(error);
      window.alert(`Gagal mengunggah: ${message}`);
    } finally {
      activeController = null;
      publishButton.disabled = false;
      publishButton.removeAttribute("aria-busy");
      publishButton.textContent = uploadMode === "edit" ? "Selesai" : "Bagikan";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (
      document
        .getElementById("deleteCategoryConfirm")
        .classList.contains("open")
    )
      window.cancelDeleteCategory?.();
    else if (deletePostConfirm.classList.contains("open")) cancelDeletePost();
    else if (discardConfirm.classList.contains("open")) dismissDiscardConfirm();
    else if (uploadDialog.classList.contains("open")) confirmDiscard();
    else if (videoLinkDialog.classList.contains("open")) closeVideoLinkDialog();
    else if (profilePhotoDialog.classList.contains("open"))
      hideDialog(profilePhotoDialog);
    else if (authDialog.classList.contains("open")) hideDialog(authDialog);
    else if (!createMenu.hidden) {
      createMenu.hidden = true;
      createPostButton?.setAttribute("aria-expanded", "false");
    }
  });
  newCategoryField.hidden = true;
  newCategoryInput.required = false;
  renderCategorySelect();
  syncNewCategoryField();
  refreshProfilePhotoControls();
  void loadProfilePhoto();
}

initGallery();
initLightbox();
initUploadWorkflow();
initHeroCarousel();
loadFirebase().catch((error) =>
  console.error("Firebase auth unavailable:", error),
);
