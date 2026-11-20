"use strict";

const path = require("node:path");
const fs = require("node:fs/promises");
const express = require("express");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");
const {
  applicationDefault,
  getApp,
  getApps,
  initializeApp,
} = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

require("dotenv").config({ path: path.join(__dirname, ".env") });

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const firebaseProjectId = requiredEnv("FIREBASE_PROJECT_ID");
const adminUid = requiredEnv("FIREBASE_ADMIN_UID");
const cloudinaryCloudName = requiredEnv("CLOUDINARY_CLOUD_NAME");
const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: applicationDefault(),
      projectId: firebaseProjectId,
    });
const firebaseAuth = getAuth(app);

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: requiredEnv("CLOUDINARY_API_KEY"),
  api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
  secure: true,
});

const server = express();
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();
const allowedOrigins = new Set(
  (allowedOrigin || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const siteRoot = path.resolve(__dirname, "..");
const categoryStorePath = path.join(__dirname, "categories.json");
const profilePhotoStorePath = path.join(__dirname, "profile-photo.json");
const galleryStateStorePath = path.join(__dirname, "gallery-state.json");
server.disable("x-powered-by");
server.use(express.json({ limit: "2mb" }));

server.use(
  cors({
    origin(origin, callback) {
      const localDevelopmentOrigin =
        process.env.NODE_ENV !== "production" &&
        (origin === "null" ||
          /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin));
      callback(
        null,
        !origin || allowedOrigins.has(origin) || localDevelopmentOrigin,
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

async function readCategories() {
  const contents = await fs.readFile(categoryStorePath, "utf8");
  const categories = JSON.parse(contents);
  if (
    !Array.isArray(categories) ||
    categories.some(
      (category) =>
        !category ||
        typeof category.key !== "string" ||
        typeof category.label !== "string",
    )
  ) {
    throw new Error("Category storage is invalid.");
  }
  return categories;
}

async function writeCategories(categories) {
  const temporaryPath = `${categoryStorePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(
    temporaryPath,
    `${JSON.stringify(categories, null, 2)}\n`,
    {
      encoding: "utf8",
      flag: "wx",
    },
  );
  await fs.rename(temporaryPath, categoryStorePath);
}

async function readProfilePhoto() {
  const contents = await fs.readFile(profilePhotoStorePath, "utf8");
  const photo = JSON.parse(contents);
  if (photo === null) return null;
  if (
    !photo ||
    typeof photo.public_id !== "string" ||
    !photo.public_id ||
    photo.public_id.length > 255 ||
    typeof photo.secure_url !== "string" ||
    !photo.secure_url.startsWith(
      `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/`,
    )
  ) {
    throw new Error("Profile photo storage is invalid.");
  }
  return photo;
}

async function writeProfilePhoto(photo) {
  const temporaryPath = `${profilePhotoStorePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(photo, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  await fs.rename(temporaryPath, profilePhotoStorePath);
}

async function readGalleryState() {
  try {
    const contents = await fs.readFile(galleryStateStorePath, "utf8");
    const state = JSON.parse(contents);
    if (
      !state ||
      typeof state !== "object" ||
      Array.isArray(state) ||
      !state.photoOverrides ||
      typeof state.photoOverrides !== "object" ||
      Array.isArray(state.photoOverrides) ||
      !Array.isArray(state.order)
    ) {
      throw new Error("Gallery storage is invalid.");
    }
    return state;
  } catch (error) {
    if (error.code === "ENOENT") return { photoOverrides: {}, order: [] };
    throw error;
  }
}

async function writeGalleryState(state) {
  const temporaryPath = `${galleryStateStorePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  await fs.rename(temporaryPath, galleryStateStorePath);
}

function isGalleryAssetPath(value) {
  return (
    typeof value === "string" &&
    value.length <= 512 &&
    /^assets\/(?:_thumbs\/)?[a-z0-9-]+\/[^/\\]+$/i.test(value) &&
    !value.includes("..") &&
    !/[\u0000-\u001f]/.test(value)
  );
}

function parseGalleryStateUpdate(body) {
  const update = {};
  if (Object.hasOwn(body || {}, "photoOverrides")) {
    const submitted = body.photoOverrides;
    if (
      !submitted ||
      typeof submitted !== "object" ||
      Array.isArray(submitted) ||
      Object.keys(submitted).length > 500
    ) {
      throw new Error("Photo overrides are invalid.");
    }
    update.photoOverrides = {};
    for (const [assetPath, value] of Object.entries(submitted)) {
      if (!isGalleryAssetPath(assetPath)) {
        throw new Error("A gallery asset path is invalid.");
      }
      if (value === null) {
        update.photoOverrides[assetPath] = null;
        continue;
      }
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        typeof value.caption !== "string" ||
        value.caption.length > 2200 ||
        typeof value.categoryKey !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.categoryKey) ||
        value.categoryKey.length > 64 ||
        typeof value.categoryLabel !== "string" ||
        !value.categoryLabel.trim() ||
        value.categoryLabel.length > 40 ||
        typeof value.collaborator !== "string" ||
        value.collaborator.length > 30 ||
        !/^[a-zA-Z0-9._]*$/.test(value.collaborator) ||
        !Array.isArray(value.media) ||
        value.media.length < 1 ||
        value.media.length > 10
      ) {
        throw new Error("A photo override is invalid.");
      }
      const media = value.media.map((item) => {
        if (
          !item ||
          item.type !== "image" ||
          typeof item.src !== "string" ||
          typeof item.full !== "string" ||
          item.src.length > 2048 ||
          item.full.length > 2048
        ) {
          throw new Error("Override photo media is invalid.");
        }
        for (const url of [item.src, item.full]) {
          if (
            !isGalleryAssetPath(url) &&
            !url.startsWith(
              `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/`,
            )
          ) {
            throw new Error("Override photo URL is invalid.");
          }
        }
        return { type: "image", src: item.src, full: item.full };
      });
      update.photoOverrides[assetPath] = {
        caption: value.caption,
        categoryKey: value.categoryKey,
        categoryLabel: value.categoryLabel.trim(),
        collaborator: value.collaborator,
        media,
      };
    }
  }
  if (Object.hasOwn(body || {}, "order")) {
    if (
      !Array.isArray(body.order) ||
      body.order.length > 5000 ||
      body.order.some(
        (id) =>
          typeof id !== "string" ||
          !id ||
          id.length > 1024 ||
          /[\u0000-\u001f]/.test(id),
      ) ||
      new Set(body.order).size !== body.order.length
    ) {
      throw new Error("Gallery order is invalid.");
    }
    update.order = body.order;
  }
  if (!Object.keys(update).length) {
    throw new Error("Gallery state update is empty.");
  }
  return update;
}

function parseCategory(body) {
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) ||
    key.length > 64 ||
    key === "all" ||
    key === "__new__" ||
    !label ||
    label.length > 40 ||
    /[\u0000-\u001f]/.test(label)
  ) {
    throw new Error("Category key or label is invalid.");
  }
  return { key, label };
}

async function requireAdmin(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) {
    return res.status(401).json({ error: "Firebase ID token is required." });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token, true);
    if (decodedToken.uid !== adminUid) {
      return res.status(403).json({ error: "Admin access is required." });
    }
    return next();
  } catch {
    return res
      .status(401)
      .json({ error: "Firebase ID token is invalid or expired." });
  }
}

server.get("/api/categories", async (_req, res) => {
  try {
    return res.json({ categories: await readCategories() });
  } catch (error) {
    console.error("Category listing failed:", error.message);
    return res.status(500).json({ error: "Categories could not be loaded." });
  }
});

server.get("/api/profile-photo", async (_req, res) => {
  try {
    return res.json({ photo: await readProfilePhoto() });
  } catch (error) {
    console.error("Profile photo listing failed:", error.message);
    return res
      .status(500)
      .json({ error: "Profile photo could not be loaded." });
  }
});

server.get("/api/gallery-state", async (_req, res) => {
  try {
    return res.json(await readGalleryState());
  } catch (error) {
    console.error("Gallery state listing failed:", error.message);
    return res
      .status(500)
      .json({ error: "Gallery state could not be loaded." });
  }
});

server.put("/api/gallery-state", requireAdmin, async (req, res) => {
  let update;
  try {
    update = parseGalleryStateUpdate(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const state = await readGalleryState();
    if (update.photoOverrides) {
      for (const [assetPath, value] of Object.entries(update.photoOverrides)) {
        if (value === null) delete state.photoOverrides[assetPath];
        else state.photoOverrides[assetPath] = value;
      }
    }
    if (update.order) state.order = update.order;
    await writeGalleryState(state);
    return res.json(state);
  } catch (error) {
    console.error("Gallery state update failed:", error.message);
    return res.status(500).json({ error: "Gallery state could not be saved." });
  }
});

server.post("/api/profile-photo", requireAdmin, async (req, res) => {
  const publicId =
    typeof req.body?.public_id === "string" ? req.body.public_id.trim() : "";
  const secureUrl =
    typeof req.body?.secure_url === "string" ? req.body.secure_url.trim() : "";
  if (
    !publicId ||
    publicId.length > 255 ||
    /[\u0000-\u001f]/.test(publicId) ||
    !secureUrl.startsWith(
      `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/`,
    ) ||
    secureUrl.length > 2048
  ) {
    return res
      .status(400)
      .json({ error: "A valid Cloudinary profile photo is required." });
  }

  try {
    const photo = {
      public_id: publicId,
      secure_url: secureUrl,
    };
    await writeProfilePhoto(photo);
    return res.json({ photo });
  } catch (error) {
    console.error("Profile photo update failed:", error.message);
    return res.status(502).json({ error: "Profile photo could not be saved." });
  }
});

server.delete("/api/profile-photo", requireAdmin, async (_req, res) => {
  try {
    await writeProfilePhoto(null);
    return res.json({ photo: null });
  } catch (error) {
    console.error("Profile photo removal failed:", error.message);
    return res
      .status(500)
      .json({ error: "Profile photo could not be removed." });
  }
});

server.post("/api/categories", requireAdmin, async (req, res) => {
  let category;
  try {
    category = parseCategory(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const categories = await readCategories();
    const existing = categories.find((item) => item.key === category.key);
    if (existing) {
      if (existing.label !== category.label) {
        return res.status(409).json({ error: "Category key already exists." });
      }
      return res.json({ categories });
    }
    categories.push(category);
    await writeCategories(categories);
    return res.status(201).json({ categories });
  } catch (error) {
    console.error("Category creation failed:", error.message);
    return res.status(500).json({ error: "Category could not be saved." });
  }
});

server.delete("/api/categories/:key", requireAdmin, async (req, res) => {
  const key = req.params.key;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) || key.length > 64) {
    return res.status(400).json({ error: "Category key is invalid." });
  }

  try {
    const categories = await readCategories();
    const nextCategories = categories.filter(
      (category) => category.key !== key,
    );
    if (nextCategories.length === categories.length) {
      return res.status(404).json({ error: "Category was not found." });
    }
    await writeCategories(nextCategories);
    return res.json({ categories: nextCategories });
  } catch (error) {
    console.error("Category deletion failed:", error.message);
    return res.status(500).json({ error: "Category could not be deleted." });
  }
});

function parseAssets(body) {
  const submittedAssets = Array.isArray(body?.assets)
    ? body.assets
    : [body || {}];
  if (!submittedAssets.length || submittedAssets.length > 10) {
    throw new Error("Provide between 1 and 10 Cloudinary assets.");
  }

  const assets = submittedAssets.map((asset) => {
    const publicId =
      typeof asset?.public_id === "string" ? asset.public_id.trim() : "";
    const resourceType = asset?.resource_type || "image";
    if (
      !publicId ||
      publicId.length > 255 ||
      /[\u0000-\u001f]/.test(publicId)
    ) {
      throw new Error("Each asset must have a valid public_id.");
    }
    if (resourceType !== "image" && resourceType !== "video") {
      throw new Error("resource_type must be image or video.");
    }
    return { public_id: publicId, resource_type: resourceType };
  });

  const uniqueIds = new Set(
    assets.map((asset) => `${asset.resource_type}:${asset.public_id}`),
  );
  if (uniqueIds.size !== assets.length) {
    throw new Error("Duplicate Cloudinary assets are not allowed.");
  }
  return assets;
}

function parseContextUpdates(body) {
  const submittedAssets = Array.isArray(body?.assets) ? body.assets : [];
  if (!submittedAssets.length || submittedAssets.length > 10) {
    throw new Error("Provide between 1 and 10 Cloudinary assets.");
  }

  const allowedFields = new Set([
    "type",
    "video_url",
    "caption",
    "category",
    "category_label",
    "collaborator",
    "post_id",
    "slide_index",
  ]);
  const updates = submittedAssets.map((asset) => {
    const publicId =
      typeof asset?.public_id === "string" ? asset.public_id.trim() : "";
    const resourceType = asset?.resource_type;
    const context = asset?.context;
    if (
      !publicId ||
      publicId.length > 255 ||
      /[\u0000-\u001f]/.test(publicId) ||
      !["image", "video"].includes(resourceType)
    ) {
      throw new Error(
        "Each asset must have a valid public_id and resource_type.",
      );
    }
    if (!context || typeof context !== "object" || Array.isArray(context)) {
      throw new Error("Each asset must have valid context metadata.");
    }

    const fields = Object.entries(context);
    if (
      fields.some(
        ([key, value]) =>
          !allowedFields.has(key) ||
          !["string", "number"].includes(typeof value) ||
          String(value).length > 2200,
      ) ||
      typeof context.post_id !== "string" ||
      !context.post_id.trim() ||
      context.post_id.length > 128 ||
      typeof context.category !== "string" ||
      !context.category.trim() ||
      (context.type === "video" &&
        (typeof context.video_url !== "string" || !context.video_url.trim())) ||
      !["image", "video"].includes(context.type)
    ) {
      throw new Error("Cloudinary context metadata is invalid.");
    }
    const encodedContext = fields
      .map(
        ([key, value]) =>
          `${key}=${String(value).replace(/\\/g, "\\\\").replace(/[|=]/g, "\\$&")}`,
      )
      .join("|");
    return {
      public_id: publicId,
      resource_type: resourceType,
      context: encodedContext,
    };
  });
  const uniqueIds = new Set(
    updates.map((asset) => `${asset.resource_type}:${asset.public_id}`),
  );
  if (uniqueIds.size !== updates.length) {
    throw new Error("Duplicate Cloudinary assets are not allowed.");
  }
  return updates;
}

server.get("/api/cloudinary/assets", async (_req, res) => {
  try {
    const assets = [];
    let nextCursor;
    do {
      const page = await cloudinary.api.resources_by_tag("portfolio_item", {
        context: true,
        max_results: 100,
        ...(nextCursor ? { next_cursor: nextCursor } : {}),
      });
      assets.push(...(page.resources || []));
      nextCursor = page.next_cursor;
    } while (nextCursor);
    return res.json({ assets });
  } catch (error) {
    console.error("Cloudinary asset listing failed:", error.message);
    return res
      .status(502)
      .json({ error: "Cloudinary assets could not be loaded." });
  }
});

server.post(
  "/api/cloudinary/assets/context",
  requireAdmin,
  async (req, res) => {
    let updates;
    try {
      updates = parseContextUpdates(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const results = await Promise.all(
      updates.map(async ({ public_id, resource_type, context }) => {
        try {
          await cloudinary.uploader.add_context(context, [public_id], {
            resource_type,
            type: "upload",
          });
          return { public_id, result: "ok" };
        } catch (error) {
          console.error(
            `Cloudinary context update failed for ${public_id}: ${error.message}`,
          );
          return { public_id, result: "error" };
        }
      }),
    );
    if (results.some((result) => result.result !== "ok")) {
      return res.status(502).json({
        error: "Cloudinary did not confirm every metadata update.",
        results,
      });
    }
    return res.json({ results });
  },
);

server.post("/api/cloudinary/delete", requireAdmin, async (req, res) => {
  let assets;
  try {
    assets = parseAssets(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const results = await Promise.all(
    assets.map(async ({ public_id, resource_type }) => {
      try {
        const result = await cloudinary.uploader.destroy(public_id, {
          resource_type,
          type: "upload",
          invalidate: true,
        });
        return { public_id, resource_type, result: result.result };
      } catch (error) {
        console.error(
          `Cloudinary destroy failed for ${public_id}: ${error.message}`,
        );
        return { public_id, resource_type, result: "error" };
      }
    }),
  );

  if (results.some((result) => result.result !== "ok")) {
    return res.status(502).json({
      error: "Cloudinary did not confirm deletion of every asset.",
      results,
    });
  }
  return res.json({ results });
});

server.get("/healthz", (_req, res) => res.json({ status: "ok" }));

server.use("/api", (req, res) => {
  return res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}.`,
  });
});

server.use((req, res, next) => {
  if (req.path === "/backend" || req.path.startsWith("/backend/")) {
    return res.sendStatus(404);
  }
  return next();
});
server.use(express.static(siteRoot, { dotfiles: "deny" }));

server.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }
  console.error("Unhandled backend error:", error);
  return res.status(500).json({ error: "Internal server error." });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`Portfolio server listening on port ${port}.`);
});
