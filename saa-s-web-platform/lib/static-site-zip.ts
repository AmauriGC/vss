import JSZip from "jszip"

const ALLOWED_EXTENSIONS = new Set([
  "html",
  "css",
  "js",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "ico",
])

type ParsedZip = {
  indexPath: string
  htmlByPath: Map<string, string>
  cssByPath: Map<string, string>
  blobByPath: Map<string, Blob>
}

function normalizeZipPath(p: string) {
  return p.replace(/^\/+/, "").replace(/^\.\/+/, "").trim()
}

function isExternalUrl(u: string) {
  return /^(https?:|data:|blob:|mailto:|tel:|\/\/)/i.test(u)
}

function normalizeExternalUrl(u: string) {
  const trimmed = u.trim()
  if (trimmed.startsWith("//")) return `https:${trimmed}`
  return trimmed
}

function getExt(path: string) {
  const clean = path.split("?")[0].split("#")[0]
  const idx = clean.lastIndexOf(".")
  return idx >= 0 ? clean.slice(idx + 1).toLowerCase() : ""
}

function resolveRelative(baseIndexPath: string, rel: string) {
  const relClean = rel.trim()
  if (!relClean) return ""
  if (relClean.startsWith("/")) return normalizeZipPath(relClean.slice(1))

  const baseDir = baseIndexPath.includes("/")
    ? baseIndexPath.slice(0, baseIndexPath.lastIndexOf("/") + 1)
    : ""

  try {
    const resolved = new URL(relClean, `https://vss.local/${baseDir}`).pathname
    return normalizeZipPath(resolved.replace(/^\//, ""))
  } catch {
    return normalizeZipPath(baseDir + relClean)
  }
}

function rootCandidateFrom(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("/")) return normalizeZipPath(trimmed.slice(1))
  return normalizeZipPath(trimmed)
}

function getMappedAssetUrl(urlByPath: Map<string, string>, basePath: string, rawUrl: string) {
  const uRaw = String(rawUrl || "").trim()
  if (!uRaw || uRaw.startsWith("#")) return null

  if (isExternalUrl(uRaw)) {
    return normalizeExternalUrl(uRaw)
  }

  const candidates = [resolveRelative(basePath, uRaw), rootCandidateFrom(uRaw)].filter(Boolean)
  for (const c of candidates) {
    const mapped = urlByPath.get(c)
    if (mapped) return mapped
  }

  return null
}

async function parseZip(file: File): Promise<ParsedZip> {
  const zip = await JSZip.loadAsync(file)

  const paths = Object.keys(zip.files)
    .map(normalizeZipPath)
    .filter(Boolean)

  const disallowed: string[] = []
  for (const p of paths) {
    const entry = zip.file(p)
    if (!entry) continue
    if ((zip.files as any)[p]?.dir) continue

    const ext = getExt(p)
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      disallowed.push(p)
    }
  }

  if (disallowed.length > 0) {
    const preview = disallowed.slice(0, 8).join(", ")
    const suffix = disallowed.length > 8 ? ` (+${disallowed.length - 8} más)` : ""
    throw new Error(`El ZIP contiene archivos no permitidos: ${preview}${suffix}`)
  }

  const indexCandidates = paths.filter((p) => p.toLowerCase().endsWith("index.html"))
  if (indexCandidates.length === 0) {
    throw new Error("Falta index.html dentro del ZIP")
  }

  // Preferir el index más cercano a la raíz.
  const indexPath = indexCandidates.sort((a, b) => a.split("/").length - b.split("/").length)[0]

  const htmlByPath = new Map<string, string>()
  const cssByPath = new Map<string, string>()
  const blobByPath = new Map<string, Blob>()

  for (const p of paths) {
    const entry = zip.file(p)
    if (!entry) continue
    if ((zip.files as any)[p]?.dir) continue

    const ext = getExt(p)
    if (ext === "html") {
      htmlByPath.set(p, await entry.async("string"))
      continue
    }

    if (ext === "css") {
      cssByPath.set(p, await entry.async("string"))
      continue
    }

    blobByPath.set(p, await entry.async("blob"))
  }

  return { indexPath, htmlByPath, cssByPath, blobByPath }
}

export async function validateStaticSiteZip(file: File) {
  await parseZip(file)
  return true
}

export async function createStaticSitePreviewSessionFromZip(file: File) {
  const { indexPath, htmlByPath, cssByPath, blobByPath } = await parseZip(file)

  const objectUrls: string[] = []
  const urlByPath = new Map<string, string>()

  // 1) Crear URLs para blobs binarios (imágenes y JS).
  for (const [path, blob] of blobByPath.entries()) {
    const url = URL.createObjectURL(blob)
    objectUrls.push(url)
    urlByPath.set(path, url)
  }

  // 2) Reescribir CSS para que url(...) apunte a blob URLs.
  for (const [path, css] of cssByPath.entries()) {
    const rewritten = css.replace(/url\((['"]?)([^'"\)]+)\1\)/g, (match, quote, rawUrl) => {
      const mapped = getMappedAssetUrl(urlByPath, path, String(rawUrl || ""))
      if (!mapped) return match
      return `url(${quote || ""}${mapped}${quote || ""})`
    })

    const cssBlob = new Blob([rewritten], { type: "text/css" })
    const cssUrl = URL.createObjectURL(cssBlob)
    objectUrls.push(cssUrl)
    urlByPath.set(path, cssUrl)
  }

  const knownPages = new Set(Array.from(htmlByPath.keys()))

  const render = (pagePath: string) => {
    const html = htmlByPath.get(pagePath)
    if (!html) throw new Error(`No existe la página ${pagePath} en el ZIP`)

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    doc.querySelectorAll("link[href]").forEach((el) => {
      const hrefRaw = el.getAttribute("href") || ""
      const mapped = getMappedAssetUrl(urlByPath, pagePath, hrefRaw)
      if (mapped) el.setAttribute("href", mapped)
    })

    doc.querySelectorAll("script[src]").forEach((el) => {
      const srcRaw = el.getAttribute("src") || ""
      const mapped = getMappedAssetUrl(urlByPath, pagePath, srcRaw)
      if (mapped) el.setAttribute("src", mapped)
    })

    doc.querySelectorAll("img[src]").forEach((el) => {
      const srcRaw = el.getAttribute("src") || ""
      const mapped = getMappedAssetUrl(urlByPath, pagePath, srcRaw)
      if (mapped) el.setAttribute("src", mapped)
    })

    // Reescribir navegación interna entre HTML.
    doc.querySelectorAll("a[href]").forEach((el) => {
      const hrefRaw = el.getAttribute("href") || ""
      if (!hrefRaw || hrefRaw.startsWith("#") || isExternalUrl(hrefRaw)) return
      const resolved = resolveRelative(pagePath, hrefRaw)
      const rootCandidate = rootCandidateFrom(hrefRaw)
      const target = knownPages.has(resolved) ? resolved : knownPages.has(rootCandidate) ? rootCandidate : null
      if (target) {
        el.setAttribute("href", "#")
        el.setAttribute("data-vss-page", target)
      }
    })

    const script = doc.createElement("script")
    script.text = `
      document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[data-vss-page]') : null;
        if (!a) return;
        e.preventDefault();
        const page = a.getAttribute('data-vss-page');
        if (!page) return;
        try {
          parent.postMessage({ type: 'VSS_PREVIEW_NAV', page }, '*');
        } catch {}
      });
    `.trim()
    doc.body.appendChild(script)

    return "<!doctype html>\n" + doc.documentElement.outerHTML
  }

  return {
    indexPath,
    pages: Array.from(knownPages),
    render,
    objectUrls,
    revoke: () => revokeObjectUrls(objectUrls),
  }
}

export async function buildStaticSitePreviewFromZip(file: File): Promise<{
  srcDoc: string
  objectUrls: string[]
}> {
  const session = await createStaticSitePreviewSessionFromZip(file)
  const srcDoc = session.render(session.indexPath)
  // Mantener compatibilidad: el caller revoca objectUrls.
  return { srcDoc, objectUrls: session.objectUrls }
}

export function revokeObjectUrls(urls: string[]) {
  urls.forEach((u) => {
    try {
      URL.revokeObjectURL(u)
    } catch {
      // ignore
    }
  })
}
