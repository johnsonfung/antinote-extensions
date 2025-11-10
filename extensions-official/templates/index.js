// ===============================
// Antinote Extension: templates
// Version 1.0.0
// Auto-version bumping enabled
// ===============================

(function() {
  const extensionName = "templates";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Productivity",
    "none"
  );

  // Register preferences for custom templates using a loop
  for (let i = 1; i <= 10; i++) {
    const pref = new Preference(
      `custom_template_${i}`,
      `Custom Template ${i}`,
      "paragraph",
      "",
      null,
      "User-defined template text. Multi-line text editor supports line breaks."
    );
    extensionRoot.register_preference(pref);
  }

  // Helper functions for date formatting
  const getCurrentDate = () => {
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  };

  const getShortDate = () => {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  };

  // ===========================
  // TODO COMMAND (GSD Framework)
  // ===========================

  const todo = new Command(
    "todo",
    [],
    "insert",
    "Insert daily to-do list template with GSD (Get Stuff Done) framework",
    [new TutorialCommand("todo()", "Insert GSD-based daily to-do template")],
    extensionRoot
  );

  todo.execute = function(payload) {
    const template = `list:To-Do - ${getCurrentDate()}

# Goals
What do I want to accomplish today?

# Schedule
Time-blocked tasks and meetings

# Do
Tasks to complete today
Review quarterly goals

`;
    return new ReturnObject("success", "Daily to-do template inserted", template);
  };

  // ===========================
  // BULLET COMMAND
  // ===========================

  const bullet = new Command(
    "bullet",
    [],
    "insert",
    "Insert bullet journal template",
    [new TutorialCommand("bullet()", "Insert bullet journal template")],
    extensionRoot
  );

  bullet.execute = function(payload) {
    const template = `# ${getCurrentDate()}

## Tasks
•

## Events
○

## Notes
-

## Priorities
!

## Migrated
>
`;
    return new ReturnObject("success", "Bullet journal template inserted", template);
  };

  // ===========================
  // SORRY COMMAND
  // ===========================

  const sorry = new Command(
    "sorry",
    [],
    "insert",
    "Insert apology template",
    [new TutorialCommand("sorry()", "Insert apology template")],
    extensionRoot
  );

  sorry.execute = function(payload) {
    const template = `Hi [Name],

I want to apologize for [specific situation/action]. I realize that [acknowledge impact], and I take full responsibility for my part in this.

What I should have done differently: [specific alternative action]

Moving forward, I will [commitment to change/improvement].

I value [our relationship/working together/etc.] and appreciate your understanding.

Best,
[Your name]`;

    return new ReturnObject("success", "Apology template inserted", template);
  };

  // ===========================
  // REFLECT COMMAND
  // ===========================

  const reflect = new Command(
    "reflect",
    [],
    "insert",
    "Insert daily reflection template",
    [new TutorialCommand("reflect()", "Insert daily reflection template")],
    extensionRoot
  );

  reflect.execute = function(payload) {
    const template = `# Daily Reflection - ${getCurrentDate()}

## What went well today?


## What could have gone better?


## What did I learn?


## What am I grateful for?


## Tomorrow's focus:

`;
    return new ReturnObject("success", "Daily reflection template inserted", template);
  };

  // ===========================
  // STANDUP COMMAND
  // ===========================

  const standup = new Command(
    "standup",
    [],
    "insert",
    "Insert standup meeting template",
    [new TutorialCommand("standup()", "Insert standup meeting template")],
    extensionRoot
  );

  standup.execute = function(payload) {
    const template = `# Standup - ${getShortDate()}

## Yesterday
What I completed:


## Today
What I'm working on:


## Blockers
Challenges or help needed:

`;
    return new ReturnObject("success", "Standup template inserted", template);
  };

  // ===========================
  // ONE_ON_ONE COMMAND
  // ===========================

  const one_on_one = new Command(
    "one_on_one",
    [],
    "insert",
    "Insert 1:1 meeting template with manager",
    [new TutorialCommand("one_on_one()", "Insert 1:1 meeting template")],
    extensionRoot
  );

  one_on_one.execute = function(payload) {
    const template = `# 1:1 Meeting - ${getShortDate()}

## My Updates
Progress on current projects:


## Discussion Topics
Items I want to discuss:


## Feedback Requested
Areas where I'd like input:


## Blockers & Support Needed
Challenges I'm facing:


## Career Development
Growth opportunities or skills to develop:


## Action Items

`;
    return new ReturnObject("success", "1:1 meeting template inserted", template);
  };

  // ===========================
  // CUSTOM TEMPLATES (Generated with loop)
  // ===========================

  // Generate 10 custom template commands dynamically
  for (let i = 1; i <= 10; i++) {
    const cmd = new Command(
      `custom_template_${i}`,
      [],
      "insert",
      `Insert custom template ${i} (user-configurable in preferences)`,
      [new TutorialCommand(`custom_template_${i}()`, `Insert your custom template ${i}`)],
      extensionRoot
    );

    cmd.execute = function(payload) {
      const template = getExtensionPreference(extensionName, `custom_template_${i}`) || "";

      if (!template?.trim()) {
        return new ReturnObject("error", `Custom template ${i} is not configured. Please set it in extension preferences.`);
      }

      return new ReturnObject("success", `Custom template ${i} inserted`, template);
    };
  }
})();
