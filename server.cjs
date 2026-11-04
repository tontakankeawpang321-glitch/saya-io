var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTItiReSbPwa0Fz_Afzmi8BrcUdpzdOINQiV7xFkiKWvl_x1KzmEKItpJjQNjtz1SgheZYdL3s4cSiy/pub?output=csv";
var cachedDocs = [];
var lastFetchedTime = 0;
var CACHE_TTL_MS = 60 * 1e3;
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}
function detectFileType(url, name) {
  const combined = (url + " " + name).toLowerCase();
  if (combined.includes("sheet") || combined.includes("excel") || combined.includes(".csv") || combined.includes(".xlsx") || combined.includes("spreadsheets")) {
    return { type: "Spreadsheet", icon: "FileSpreadsheet", bgClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
  } else if (combined.includes("pdf") || url.includes(".pdf")) {
    return { type: "PDF Document", icon: "FileText", bgClass: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  } else if (combined.includes("doc") || combined.includes("word") || combined.includes(".docx") || combined.includes("document")) {
    return { type: "Word Document", icon: "FileCode2", bgClass: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
  } else if (combined.includes("slide") || combined.includes("presentation") || combined.includes(".pptx")) {
    return { type: "Presentation", icon: "Presentation", bgClass: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  } else if (combined.includes("forms") || combined.includes("\u0E41\u0E1A\u0E1A\u0E1F\u0E2D\u0E23\u0E4C\u0E21")) {
    return { type: "Online Form", icon: "CheckSquare", bgClass: "text-purple-500 bg-purple-500/10 border-purple-500/20" };
  }
  return { type: "Link / Archive", icon: "File", bgClass: "text-slate-500 bg-slate-500/10 border-slate-500/20" };
}
var fallbackData = [
  {
    id: "doc-001",
    name: "\u0E02\u0E49\u0E2D\u0E15\u0E01\u0E25\u0E07\u0E15\u0E48\u0E2D\u0E17\u0E49\u0E32\u0E22\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E08\u0E33\u0E19\u0E2D\u0E07 \u0E40\u0E1B\u0E47\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E2A\u0E48\u0E27\u0E19.doc",
    url: "https://drive.google.com/file/d/17eFPKfNV9Kj66ZXx0FB47x1Wwnk480W6/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-002",
    name: "\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E43\u0E2B\u0E49\u0E04\u0E27\u0E32\u0E21\u0E22\u0E34\u0E19\u0E22\u0E2D\u0E21\u0E43\u0E19\u0E01\u0E32\u0E23\u0E17\u0E33\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E20\u0E31\u0E22.doc",
    url: "https://drive.google.com/file/d/1SGuh-CKZ9shKH3uJUOG3bwuYU2WLq-Yi/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-003",
    name: "\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E15\u0E31\u0E49\u0E07\u0E15\u0E31\u0E27\u0E41\u0E17\u0E19\u0E17\u0E33\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E2A\u0E23\u0E23\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19.doc",
    url: "https://drive.google.com/file/d/1YP1zI-7NcyyzgcyWo-ddI1UHju1VkBr7/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-004",
    name: "\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E43\u0E2B\u0E49\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E2D\u0E32\u0E28\u0E31\u0E22\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E01\u0E47\u0E1A\u0E01\u0E34\u0E191.doc",
    url: "https://drive.google.com/file/d/1L7ZPb9df-4XsT00rSIagzL43k738tNbi/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-005",
    name: "\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E0B\u0E37\u0E49\u0E2D\u0E02\u0E32\u0E22\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 \u0E23\u0E31\u0E1A\u0E42\u0E2D\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32.doc",
    url: "https://drive.google.com/file/d/12hPbt_fNYN1WGroPo_0fohnbYrW0ZBo1/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-006",
    name: "\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E48\u0E32\u0E2D\u0E2A\u0E31\u0E07\u0E2B\u0E32\u0E23\u0E34\u0E21\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E4C.doc",
    url: "https://drive.google.com/file/d/1bW1cjOyJnTZj-Y6_OZNKQnL9jI937EGj/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-007",
    name: "\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E08\u0E49\u0E32\u0E07\u0E41\u0E23\u0E07\u0E07\u0E32\u0E19.doc",
    url: "https://drive.google.com/file/d/1V2_OYI5u9Ozm_dQSwJghKLZv7yusOdga/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "doc-008",
    name: "\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E01\u0E39\u0E49\u0E40\u0E07\u0E34\u0E19.doc",
    url: "https://drive.google.com/file/d/1rBTN24q2wx6aUMi4x8eCj0pHIHfodjzd/view",
    category: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E15\u0E48\u0E32\u0E07\u0E46 \u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48 1 (125 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)",
    fileType: "Word Document",
    iconClass: "FileCode2",
    typeClass: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  }
];
async function fetchGoogleSheetData() {
  const now = Date.now();
  if (cachedDocs.length > 0 && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedDocs;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8e3);
    const res = await fetch(CSV_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Google Sheets responded with status ${res.status}`);
    }
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length <= 1) {
      if (cachedDocs.length > 0) return cachedDocs;
      return fallbackData;
    }
    const header = rows[0].map((h) => h.toLowerCase());
    let nameIdx = header.findIndex((h) => h.includes("name") || h.includes("\u0E0A\u0E37\u0E48\u0E2D") || h.includes("title") || h.includes("\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07") || h.includes("\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"));
    let urlIdx = header.findIndex((h) => h.includes("url") || h.includes("link") || h.includes("\u0E25\u0E34\u0E07\u0E01\u0E4C") || h.includes("href") || h.includes("\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48"));
    let catIdx = header.findIndex((h) => h.includes("category") || h.includes("\u0E2B\u0E21\u0E27\u0E14") || h.includes("group") || h.includes("\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17"));
    if (nameIdx === -1) nameIdx = 0;
    if (urlIdx === -1) urlIdx = header.length > 1 ? 1 : 0;
    const parsed = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (cols.length < 1 || !cols.some((c) => c.trim().length > 0)) continue;
      const name = cols[nameIdx] || `\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 ${i}`;
      const rawUrl = urlIdx !== -1 && cols[urlIdx] ? cols[urlIdx] : "#";
      let cat = catIdx !== -1 && cols[catIdx] ? cols[catIdx].trim() : "\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B";
      if (!cat) cat = "\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B";
      const fileMeta = detectFileType(rawUrl, name);
      const safeId = `doc-${i}-${Buffer.from(name + rawUrl).toString("base64").replace(/[/+=]/g, "").substring(0, 16)}`;
      parsed.push({
        id: safeId,
        name,
        url: rawUrl,
        category: cat,
        fileType: fileMeta.type,
        iconClass: fileMeta.icon,
        typeClass: fileMeta.bgClass
      });
    }
    if (parsed.length > 0) {
      cachedDocs = parsed;
      lastFetchedTime = now;
      return parsed;
    }
  } catch (error) {
    console.error("Error fetching Google Sheet CSV:", error);
  }
  if (cachedDocs.length > 0) return cachedDocs;
  return fallbackData;
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/documents", async (req, res) => {
  try {
    const force = req.query.force === "true";
    if (force) lastFetchedTime = 0;
    const docs = await fetchGoogleSheetData();
    const categoriesMap = {};
    docs.forEach((d) => {
      categoriesMap[d.category] = (categoriesMap[d.category] || 0) + 1;
    });
    res.json({
      success: true,
      count: docs.length,
      documents: docs,
      categories: Object.entries(categoriesMap).map(([name, count]) => ({ name, count })),
      lastUpdated: new Date(lastFetchedTime || Date.now()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
});
app.post("/api/ai/draft", async (req, res) => {
  try {
    const { templateType, title, recipient, department, notes, keywords } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const thaiDate = new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(/* @__PURE__ */ new Date());
      return res.json({
        success: true,
        isAiGenerated: false,
        draft: {
          docNumber: "\u0E01\u0E2B \u0E50\u0E52\u0E50\u0E51/\u0E27 \u0E51\u0E52\u0E55",
          department: department || "\u0E1D\u0E48\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E07\u0E32\u0E19\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B\u0E41\u0E25\u0E30\u0E22\u0E38\u0E17\u0E18\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23",
          date: thaiDate,
          subject: title || "\u0E02\u0E2D\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E15\u0E32\u0E21\u0E41\u0E1C\u0E19\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32",
          to: recipient || "\u0E1C\u0E39\u0E49\u0E2D\u0E33\u0E19\u0E27\u0E22\u0E01\u0E32\u0E23\u0E1D\u0E48\u0E32\u0E22 / \u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E2A\u0E39\u0E07",
          content: `\u0E14\u0E49\u0E27\u0E22 ${department || "\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19"} \u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C\u0E08\u0E30\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23 ${title || "\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E23\u0E30\u0E1A\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E40\u0E01\u0E47\u0E1A\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23"}

\u0E42\u0E14\u0E22\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E41\u0E25\u0E30\u0E27\u0E31\u0E15\u0E16\u0E38\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E22\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E0F\u0E34\u0E1A\u0E31\u0E15\u0E34\u0E07\u0E32\u0E19\u0E43\u0E2B\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E1B\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E21\u0E35\u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E \u0E42\u0E1B\u0E23\u0E48\u0E07\u0E43\u0E2A \u0E41\u0E25\u0E30\u0E40\u0E01\u0E34\u0E14\u0E1B\u0E23\u0E30\u0E42\u0E22\u0E0A\u0E19\u0E4C\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14\u0E15\u0E48\u0E2D\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23

\u0E08\u0E36\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19\u0E21\u0E32\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E42\u0E1B\u0E23\u0E14\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34`,
          signName: "( \u0E19\u0E32\u0E22\u0E2A\u0E21\u0E28\u0E31\u0E01\u0E14\u0E34\u0E4C \u0E19\u0E33\u0E1E\u0E32\u0E04\u0E27\u0E32\u0E21\u0E01\u0E49\u0E32\u0E27\u0E2B\u0E19\u0E49\u0E32 )",
          signPosition: "\u0E2B\u0E31\u0E27\u0E2B\u0E19\u0E49\u0E32\u0E01\u0E25\u0E38\u0E48\u0E21\u0E07\u0E32\u0E19\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E41\u0E25\u0E30\u0E27\u0E34\u0E40\u0E17\u0E28\u0E2A\u0E31\u0E21\u0E1E\u0E31\u0E19\u0E18\u0E4C"
        }
      });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const prompt = `\u0E04\u0E38\u0E13\u0E04\u0E37\u0E2D\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E32\u0E23\u0E23\u0E48\u0E32\u0E07\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23\u0E41\u0E25\u0E30\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23
\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E48\u0E32\u0E07\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17 "${templateType || "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21"}" 
- \u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07/\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D: "${title || "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E02\u0E2D\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34"}"
- \u0E40\u0E23\u0E35\u0E22\u0E19: "${recipient || "\u0E1C\u0E39\u0E49\u0E2D\u0E33\u0E19\u0E27\u0E22\u0E01\u0E32\u0E23"}"
- \u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19\u0E40\u0E08\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07: "${department || "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E07\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07"}"
- \u0E27\u0E31\u0E15\u0E16\u0E38\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C\u0E41\u0E25\u0E30\u0E43\u0E08\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E33\u0E04\u0E31\u0E0D: "${notes || "\u0E02\u0E2D\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E07\u0E32\u0E19\u0E15\u0E32\u0E21\u0E41\u0E1C\u0E19\u0E22\u0E38\u0E17\u0E18\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C"}"
- \u0E04\u0E35\u0E22\u0E4C\u0E40\u0E27\u0E34\u0E23\u0E4C\u0E14\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A: "${keywords || "\u0E21\u0E35\u0E1B\u0E23\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E20\u0E32\u0E1E, \u0E23\u0E27\u0E14\u0E40\u0E23\u0E47\u0E27, \u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07"}"

\u0E42\u0E1B\u0E23\u0E14\u0E2A\u0E48\u0E07\u0E04\u0E37\u0E19\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E40\u0E1B\u0E47\u0E19 JSON \u0E25\u0E49\u0E27\u0E19 (\u0E44\u0E21\u0E48\u0E21\u0E35 markdown code block \u0E2B\u0E23\u0E37\u0E2D\u0E04\u0E33\u0E19\u0E33) \u0E15\u0E32\u0E21\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07:
{
  "docNumber": "\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D \u0E40\u0E0A\u0E48\u0E19 \u0E28\u0E18 \u0E50\u0E52\u0E51\u0E50/\u0E52\u0E55\u0E56\u0E58",
  "department": "\u0E0A\u0E37\u0E48\u0E2D\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19",
  "date": "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22 \u0E40\u0E0A\u0E48\u0E19 \u0E58 \u0E2A\u0E34\u0E07\u0E2B\u0E32\u0E04\u0E21 \u0E52\u0E55\u0E56\u0E58",
  "subject": "\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07",
  "to": "\u0E40\u0E23\u0E35\u0E22\u0E19",
  "content": "\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 2-3 \u0E22\u0E48\u0E2D\u0E2B\u0E19\u0E49\u0E32 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19 \u0E41\u0E25\u0E30\u0E04\u0E33\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23",
  "signName": "( \u0E0A\u0E37\u0E48\u0E2D-\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25 \u0E1C\u0E39\u0E49\u0E25\u0E07\u0E19\u0E32\u0E21 )",
  "signPosition": "\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E1C\u0E39\u0E49\u0E25\u0E07\u0E19\u0E32\u0E21"
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const rawText = response.text || "";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.json({
      success: true,
      isAiGenerated: true,
      draft: parsed
    });
  } catch (err) {
    console.error("AI Draft Generation error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "AI generation failed"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Corporate Hub Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
