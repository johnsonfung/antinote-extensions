// ===============================
// Antinote Extension: date
// Version 1.0.0
// ===============================

(function() {
  // Wrap in IIFE to avoid variable conflicts
  const extensionName = "date";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.6",
    endpoints: [], // No external API endpoints
    requiredAPIKeys: [],  // No API keys required
    author: "johnsonfung",  // Author (GitHub username)
    category: "Date & Time",  // Category
    dataScope: "none"  // Data scope: "none", "line", or "full" - doesn't need note content
  });

  // Register extension preferences
  const formatPref = new Preference({
    key: "format",
    label: "Date Format",
    type: "selectOne",
    defaultValue: "local_long_date",
    options: ["local_long_date", "local_short_date", "us_mdy", "yyyy-mm-dd"],
    helpText: "Choose the default date format for all date commands"
  });
  extensionRoot.register_preference(formatPref);

  const localePref = new Preference({
    key: "locale",
    label: "Locale",
    type: "string",
    defaultValue: "",
    options: null,
    helpText: "Optional locale code (e.g., 'en-CA', 'fr-FR'). Leave empty for system default."
  });
  extensionRoot.register_preference(localePref);

  // --- helpers ---
  const pad2 = (n) => String(n).padStart(2, "0");

  const formatCustom = (d, pattern) => {
    const Y = d.getFullYear();
    const M = d.getMonth() + 1;
    const D = d.getDate();
    return pattern
      .replace(/YYYY/g, String(Y))
      .replace(/MM/g, pad2(M))
      .replace(/DD/g, pad2(D));
  };

  const formatDateOnly = (d, preset, locale) => {
    const loc = (locale || "").trim() || undefined;
    const p = (preset || "local_long_date").toLowerCase();
    switch (p) {
      case "local_long_date":
        return new Intl.DateTimeFormat(loc, { dateStyle: "long" }).format(d);
      case "local_short_date":
        return new Intl.DateTimeFormat(loc, { dateStyle: "short" }).format(d);
      case "us_mdy":
        return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(d);
      case "yyyy-mm-dd":
        return formatCustom(d, "YYYY-MM-DD");
      default:
        // If they passed a custom pattern like "YYYY/MM/DD", honor it
        if (/[YMD]/.test(preset)) return formatCustom(d, preset);
        // Fallback
        return new Intl.DateTimeFormat(loc, { dateStyle: "long" }).format(d);
    }
  };

  const getDateWithOffset = (baseDate, daysOffset) => {
    const result = new Date(baseDate);
    result.setDate(result.getDate() + daysOffset);
    return result;
  };

  const getBusinessDayWithOffset = (baseDate, businessDaysOffset) => {
    const result = new Date(baseDate);
    const daysToAdd = businessDaysOffset;
    const direction = daysToAdd >= 0 ? 1 : -1;
    let daysAdded = 0;

    while (daysAdded !== Math.abs(daysToAdd)) {
      result.setDate(result.getDate() + direction);
      const dayOfWeek = result.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }

    return result;
  };

  // --- command: today ---
  const today = new Command({
    name: "today",
    parameters: [
      // Optional days offset - can be positive or negative
      new Parameter({type: "int", name: "daysOffset", helpText: "Days to add/subtract from today", default: 0, required: false})
    ],
    type: "insert",
    helpText: "Insert today's date, optionally offset by days.",
    tutorials: [
      new TutorialCommand({command: "today", description: "Insert today's date"}),
      new TutorialCommand({command: "today(7)", description: "Insert date 7 days from today"}),
      new TutorialCommand({command: "today(-5)", description: "Insert date 5 days ago"})
    ],
    extension: extensionRoot
  });

  today.execute = function (payload) {
    const [daysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";
    const targetDate = getDateWithOffset(new Date(), daysOffset);
    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject({status: "success", message: "Inserted date.", payload: out});
  };

  // --- command: tomorrow ---
  const tomorrow = new Command({
    name: "tomorrow",
    parameters: [
      // Optional additional days offset (added to base +1)
      new Parameter({type: "int", name: "daysOffset", helpText: "Additional days to add/subtract", default: 0, required: false})
    ],
    type: "insert",
    helpText: "Insert tomorrow's date, optionally offset by additional days.",
    tutorials: [
      new TutorialCommand({command: "tomorrow", description: "Insert tomorrow's date"}),
      new TutorialCommand({command: "tomorrow(7)", description: "Insert date 8 days from today (tomorrow + 7)"}),
      new TutorialCommand({command: "tomorrow(-1)", description: "Insert today's date (tomorrow - 1)"})
    ],
    extension: extensionRoot
  });

  tomorrow.execute = function (payload) {
    const [daysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";
    const targetDate = getDateWithOffset(new Date(), 1 + daysOffset);
    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject({status: "success", message: "Inserted date.", payload: out});
  };

  // --- command: yesterday ---
  const yesterday = new Command({
    name: "yesterday",
    parameters: [
      // Optional additional days offset (added to base -1)
      new Parameter({type: "int", name: "daysOffset", helpText: "Additional days to add/subtract", default: 0, required: false})
    ],
    type: "insert",
    helpText: "Insert yesterday's date, optionally offset by additional days.",
    tutorials: [
      new TutorialCommand({command: "yesterday", description: "Insert yesterday's date"}),
      new TutorialCommand({command: "yesterday(-7)", description: "Insert date 8 days ago (yesterday - 7)"}),
      new TutorialCommand({command: "yesterday(1)", description: "Insert today's date (yesterday + 1)"})
    ],
    extension: extensionRoot
  });

  yesterday.execute = function (payload) {
    const [daysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";
    const targetDate = getDateWithOffset(new Date(), -1 + daysOffset);
    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject({status: "success", message: "Inserted date.", payload: out});
  };

  // --- command: business_day ---
  const business_day = new Command({
    name: "business_day",
    parameters: [
      // Business days offset (positive = future, negative = past, 0 = today if weekday or next Monday)
      new Parameter({type: "int", name: "businessDaysOffset", helpText: "Business days to add/subtract", default: 0, required: false})
    ],
    type: "insert",
    helpText: "Insert a date offset by business days (excludes weekends).",
    tutorials: [
      new TutorialCommand({command: "business_day", description: "Insert today if weekday, or next Monday if weekend"}),
      new TutorialCommand({command: "business_day(1)", description: "Insert next business day (tomorrow if weekday)"}),
      new TutorialCommand({command: "business_day(5)", description: "Insert date 5 business days from now"}),
      new TutorialCommand({command: "business_day(-3)", description: "Insert date 3 business days ago"})
    ],
    extension: extensionRoot
  });

  business_day.execute = function (payload) {
    const [businessDaysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";

    let targetDate;
    if (businessDaysOffset === 0) {
      // If offset is 0, return today if it's a weekday, otherwise next Monday
      targetDate = new Date();
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0) {
        // Sunday -> Monday
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (dayOfWeek === 6) {
        // Saturday -> Monday
        targetDate.setDate(targetDate.getDate() + 2);
      }
    } else {
      targetDate = getBusinessDayWithOffset(new Date(), businessDaysOffset);
    }

    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject({status: "success", message: "Inserted business day.", payload: out});
  };
})();
