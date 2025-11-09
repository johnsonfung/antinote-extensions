// ===============================
// Antinote Extension: templates
// Version 1.0.0
// ===============================

(function() {
  // Wrap in IIFE to avoid variable conflicts
  var extensionName = "templates";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [], // No external API endpoints
    [], // No API keys required
    "johnsonfung",
    "Productivity",
    "none" // Does not need note content
  );

  // Register preferences for custom templates
  var customTemplate1Pref = new Preference(
    "custom_template_1",
    "Custom Template 1",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate1Pref);

  var customTemplate2Pref = new Preference(
    "custom_template_2",
    "Custom Template 2",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate2Pref);

  var customTemplate3Pref = new Preference(
    "custom_template_3",
    "Custom Template 3",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate3Pref);

  var customTemplate4Pref = new Preference(
    "custom_template_4",
    "Custom Template 4",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate4Pref);

  var customTemplate5Pref = new Preference(
    "custom_template_5",
    "Custom Template 5",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate5Pref);

  var customTemplate6Pref = new Preference(
    "custom_template_6",
    "Custom Template 6",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate6Pref);

  var customTemplate7Pref = new Preference(
    "custom_template_7",
    "Custom Template 7",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate7Pref);

  var customTemplate8Pref = new Preference(
    "custom_template_8",
    "Custom Template 8",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate8Pref);

  var customTemplate9Pref = new Preference(
    "custom_template_9",
    "Custom Template 9",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate9Pref);

  var customTemplate10Pref = new Preference(
    "custom_template_10",
    "Custom Template 10",
    "string",
    "",
    null,
    "User-defined template text. Use \\n for line breaks."
  );
  extensionRoot.register_preference(customTemplate10Pref);

  // Helper function to get current date in readable format
  function getCurrentDate() {
    var today = new Date();
    var months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var dayName = days[today.getDay()];
    var monthName = months[today.getMonth()];
    var date = today.getDate();
    var year = today.getFullYear();

    return dayName + ", " + monthName + " " + date + ", " + year;
  }

  // Helper function to get short date (e.g., "Jan 15, 2025")
  function getShortDate() {
    var today = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var monthName = months[today.getMonth()];
    var date = today.getDate();
    var year = today.getFullYear();

    return monthName + " " + date + ", " + year;
  }

  // ===========================
  // ::TODO COMMAND (GSD Framework)
  // ===========================

  var todo = new Command(
    "todo",
    [],
    "insert",
    "Insert daily to-do list template with GSD (Get Stuff Done) framework",
    [
      new TutorialCommand("::todo()", "Insert GSD-based daily to-do template")
    ],
    extensionRoot
  );

  todo.execute = function(payload) {
    var template = "list:To-Do - " + getCurrentDate() + "\n\n" +
      "# Goals\n" +
      "What do I want to accomplish today?\n\n" +
      "# Schedule\n" +
      "Time-blocked tasks and meetings\n\n" +
      "# Do\n" +
      "Tasks to complete today\n" +
      "Review quarterly goals\n\n";

    return new ReturnObject("success", "Daily to-do template inserted", template);
  };

  // ===========================
  // ::BULLET COMMAND
  // ===========================

  var bullet = new Command(
    "bullet",
    [],
    "insert",
    "Insert bullet journal template",
    [
      new TutorialCommand("::bullet()", "Insert bullet journal template")
    ],
    extensionRoot
  );

  bullet.execute = function(payload) {
    var template = "# " + getCurrentDate() + "\n\n" +
      "## Tasks\n" +
      "• \n\n" +
      "## Events\n" +
      "○ \n\n" +
      "## Notes\n" +
      "- \n\n" +
      "## Priorities\n" +
      "! \n\n" +
      "## Migrated\n" +
      "> \n";

    return new ReturnObject("success", "Bullet journal template inserted", template);
  };

  // ===========================
  // ::SORRY COMMAND
  // ===========================

  var sorry = new Command(
    "sorry",
    [],
    "insert",
    "Insert apology template",
    [
      new TutorialCommand("::sorry()", "Insert apology template")
    ],
    extensionRoot
  );

  sorry.execute = function(payload) {
    var template = "Hi [Name],\n\n" +
      "I want to apologize for [specific situation/action]. I realize that [acknowledge impact], and I take full responsibility for my part in this.\n\n" +
      "What I should have done differently: [specific alternative action]\n\n" +
      "Moving forward, I will [commitment to change/improvement].\n\n" +
      "I value [our relationship/working together/etc.] and appreciate your understanding.\n\n" +
      "Best,\n" +
      "[Your name]";

    return new ReturnObject("success", "Apology template inserted", template);
  };

  // ===========================
  // ::REFLECT COMMAND
  // ===========================

  var reflect = new Command(
    "reflect",
    [],
    "insert",
    "Insert daily reflection template",
    [
      new TutorialCommand("::reflect()", "Insert daily reflection template")
    ],
    extensionRoot
  );

  reflect.execute = function(payload) {
    var template = "# Daily Reflection - " + getCurrentDate() + "\n\n" +
      "## What went well today?\n" +
      "\n\n" +
      "## What could have gone better?\n" +
      "\n\n" +
      "## What did I learn?\n" +
      "\n\n" +
      "## What am I grateful for?\n" +
      "\n\n" +
      "## Tomorrow's focus:\n" +
      "\n";

    return new ReturnObject("success", "Daily reflection template inserted", template);
  };

  // ===========================
  // ::STANDUP COMMAND
  // ===========================

  var standup = new Command(
    "standup",
    [],
    "insert",
    "Insert standup meeting template",
    [
      new TutorialCommand("::standup()", "Insert standup meeting template")
    ],
    extensionRoot
  );

  standup.execute = function(payload) {
    var template = "# Standup - " + getShortDate() + "\n\n" +
      "## Yesterday\n" +
      "What I completed:\n" +
      "\n\n" +
      "## Today\n" +
      "What I'm working on:\n" +
      "\n\n" +
      "## Blockers\n" +
      "Challenges or help needed:\n" +
      "\n";

    return new ReturnObject("success", "Standup template inserted", template);
  };

  // ===========================
  // ::ONE_ON_ONE COMMAND
  // ===========================

  var one_on_one = new Command(
    "one_on_one",
    [],
    "insert",
    "Insert 1:1 meeting template with manager",
    [
      new TutorialCommand("::one_on_one()", "Insert 1:1 meeting template")
    ],
    extensionRoot
  );

  one_on_one.execute = function(payload) {
    var template = "# 1:1 Meeting - " + getShortDate() + "\n\n" +
      "## My Updates\n" +
      "Progress on current projects:\n" +
      "\n\n" +
      "## Discussion Topics\n" +
      "Items I want to discuss:\n" +
      "\n\n" +
      "## Feedback Requested\n" +
      "Areas where I'd like input:\n" +
      "\n\n" +
      "## Blockers & Support Needed\n" +
      "Challenges I'm facing:\n" +
      "\n\n" +
      "## Career Development\n" +
      "Growth opportunities or skills to develop:\n" +
      "\n\n" +
      "## Action Items\n" +
      "\n";

    return new ReturnObject("success", "1:1 meeting template inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_1 COMMAND
  // ===========================

  var custom_template_1 = new Command(
    "custom_template_1",
    [],
    "insert",
    "Insert custom template 1 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_1()", "Insert your custom template 1")
    ],
    extensionRoot
  );

  custom_template_1.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_1") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 1 is not configured. Please set it in extension preferences.");
    }

    // Replace \n with actual newlines
    template = template.replace(/\\n/g, "\n");

    return new ReturnObject("success", "Custom template 1 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_2 COMMAND
  // ===========================

  var custom_template_2 = new Command(
    "custom_template_2",
    [],
    "insert",
    "Insert custom template 2 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_2()", "Insert your custom template 2")
    ],
    extensionRoot
  );

  custom_template_2.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_2") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 2 is not configured. Please set it in extension preferences.");
    }

    // Replace \n with actual newlines
    template = template.replace(/\\n/g, "\n");

    return new ReturnObject("success", "Custom template 2 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_3 COMMAND
  // ===========================

  var custom_template_3 = new Command(
    "custom_template_3",
    [],
    "insert",
    "Insert custom template 3 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_3()", "Insert your custom template 3")
    ],
    extensionRoot
  );

  custom_template_3.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_3") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 3 is not configured. Please set it in extension preferences.");
    }

    // Replace \n with actual newlines
    template = template.replace(/\\n/g, "\n");

    return new ReturnObject("success", "Custom template 3 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_4 COMMAND
  // ===========================

  var custom_template_4 = new Command(
    "custom_template_4",
    [],
    "insert",
    "Insert custom template 4 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_4()", "Insert your custom template 4")
    ],
    extensionRoot
  );

  custom_template_4.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_4") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 4 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 4 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_5 COMMAND
  // ===========================

  var custom_template_5 = new Command(
    "custom_template_5",
    [],
    "insert",
    "Insert custom template 5 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_5()", "Insert your custom template 5")
    ],
    extensionRoot
  );

  custom_template_5.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_5") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 5 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 5 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_6 COMMAND
  // ===========================

  var custom_template_6 = new Command(
    "custom_template_6",
    [],
    "insert",
    "Insert custom template 6 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_6()", "Insert your custom template 6")
    ],
    extensionRoot
  );

  custom_template_6.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_6") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 6 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 6 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_7 COMMAND
  // ===========================

  var custom_template_7 = new Command(
    "custom_template_7",
    [],
    "insert",
    "Insert custom template 7 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_7()", "Insert your custom template 7")
    ],
    extensionRoot
  );

  custom_template_7.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_7") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 7 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 7 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_8 COMMAND
  // ===========================

  var custom_template_8 = new Command(
    "custom_template_8",
    [],
    "insert",
    "Insert custom template 8 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_8()", "Insert your custom template 8")
    ],
    extensionRoot
  );

  custom_template_8.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_8") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 8 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 8 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_9 COMMAND
  // ===========================

  var custom_template_9 = new Command(
    "custom_template_9",
    [],
    "insert",
    "Insert custom template 9 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_9()", "Insert your custom template 9")
    ],
    extensionRoot
  );

  custom_template_9.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_9") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 9 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 9 inserted", template);
  };

  // ===========================
  // CUSTOM_TEMPLATE_10 COMMAND
  // ===========================

  var custom_template_10 = new Command(
    "custom_template_10",
    [],
    "insert",
    "Insert custom template 10 (user-configurable in preferences)",
    [
      new TutorialCommand("custom_template_10()", "Insert your custom template 10")
    ],
    extensionRoot
  );

  custom_template_10.execute = function(payload) {
    var template = getExtensionPreference(extensionName, "custom_template_10") || "";

    if (!template || template.trim() === "") {
      return new ReturnObject("error", "Custom template 10 is not configured. Please set it in extension preferences.");
    }

    template = template.replace(/\\n/g, "\n");
    return new ReturnObject("success", "Custom template 10 inserted", template);
  };

})();
