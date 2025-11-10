// ===============================
// Antinote Extension: date
// Version 1.0.0
// ===============================

(function() {
  // Wrap in IIFE to avoid variable conflicts
  const extensionName = "date";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [], // No external API endpoints
    [],  // No API keys required
    "johnsonfung",  // Author (GitHub username)
    "Date & Time",  // Category
    "none"  // Data scope: "none", "line", or "full" - doesn't need note content
  );

  // Register extension preferences
  const formatPref = new Preference(
    "format",
    "Date Format",
    "selectOne",
    "local_long_date",
    ["local_long_date", "local_short_date", "us_mdy", "yyyy-mm-dd"],
    "Choose the default date format for all date commands"
  );
  extensionRoot.register_preference(formatPref);

  const localePref = new Preference(
    "locale",
    "Locale",
    "string",
    "",
    null,
    "Optional locale code (e.g., 'en-CA', 'fr-FR'). Leave empty for system default."
  );
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
  const today = new Command(
    "today",
    [
      // Optional days offset - can be positive or negative
      new Parameter("int", "daysOffset", "Days to add/subtract from today", 0)
    ],
    "insert",
    "Insert today's date, optionally offset by days.",
    [
      new TutorialCommand("today", "Insert today's date"),
      new TutorialCommand("today(7)", "Insert date 7 days from today"),
      new TutorialCommand("today(-5)", "Insert date 5 days ago")
    ],
    extensionRoot
  );

  today.execute = function (payload) {
    const [daysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";
    const targetDate = getDateWithOffset(new Date(), daysOffset);
    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject("success", "Inserted date.", out);
  };

  // --- command: tomorrow ---
  const tomorrow = new Command(
    "tomorrow",
    [
      // Optional additional days offset (added to base +1)
      new Parameter("int", "daysOffset", "Additional days to add/subtract", 0)
    ],
    "insert",
    "Insert tomorrow's date, optionally offset by additional days.",
    [
      new TutorialCommand("tomorrow", "Insert tomorrow's date"),
      new TutorialCommand("tomorrow(7)", "Insert date 8 days from today (tomorrow + 7)"),
      new TutorialCommand("tomorrow(-1)", "Insert today's date (tomorrow - 1)")
    ],
    extensionRoot
  );

  tomorrow.execute = function (payload) {
    const [daysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";
    const targetDate = getDateWithOffset(new Date(), 1 + daysOffset);
    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject("success", "Inserted date.", out);
  };

  // --- command: yesterday ---
  const yesterday = new Command(
    "yesterday",
    [
      // Optional additional days offset (added to base -1)
      new Parameter("int", "daysOffset", "Additional days to add/subtract", 0)
    ],
    "insert",
    "Insert yesterday's date, optionally offset by additional days.",
    [
      new TutorialCommand("yesterday", "Insert yesterday's date"),
      new TutorialCommand("yesterday(-7)", "Insert date 8 days ago (yesterday - 7)"),
      new TutorialCommand("yesterday(1)", "Insert today's date (yesterday + 1)")
    ],
    extensionRoot
  );

  yesterday.execute = function (payload) {
    const [daysOffset] = this.getParsedParams(payload);
    const format = getExtensionPreference(extensionName, "format") || "local_long_date";
    const locale = getExtensionPreference(extensionName, "locale") || "";
    const targetDate = getDateWithOffset(new Date(), -1 + daysOffset);
    const out = formatDateOnly(targetDate, format, locale);
    return new ReturnObject("success", "Inserted date.", out);
  };

  // --- command: business_day ---
  const business_day = new Command(
    "business_day",
    [
      // Business days offset (positive = future, negative = past, 0 = today if weekday or next Monday)
      new Parameter("int", "businessDaysOffset", "Business days to add/subtract", 0)
    ],
    "insert",
    "Insert a date offset by business days (excludes weekends).",
    [
      new TutorialCommand("business_day", "Insert today if weekday, or next Monday if weekend"),
      new TutorialCommand("business_day(1)", "Insert next business day (tomorrow if weekday)"),
      new TutorialCommand("business_day(5)", "Insert date 5 business days from now"),
      new TutorialCommand("business_day(-3)", "Insert date 3 business days ago")
    ],
    extensionRoot
  );

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
    return new ReturnObject("success", "Inserted business day.", out);
  };
})();
