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
    "::todo",
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
    "::bullet",
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
    "::sorry",
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
    "::reflect",
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
    "::standup",
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
    "::one_on_one",
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

})();
