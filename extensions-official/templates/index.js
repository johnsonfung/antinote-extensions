// ===============================
// Antinote Extension: templates
// Version 1.0.0
// Auto-version bumping enabled
// ===============================

(function() {
  const extensionName = "templates";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Productivity",
    dataScope: "none"
  });

  // Register preferences for custom templates using a loop
  for (let i = 1; i <= 10; i++) {
    const pref = new Preference({
      key: `custom_template_${i}`,
      label: `Custom Template ${i}`,
      type: "paragraph",
      defaultValue: "",
      options: null,
      helpText: "User-defined template text. Multi-line text editor supports line breaks."
    });
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

  const todo = new Command({
    name: "todo",
    parameters: [],
    type: "insert",
    helpText: "Insert daily to-do list template with GSD (Get Stuff Done) framework",
    tutorials: [new TutorialCommand({command: "todo()", description: "Insert GSD-based daily to-do template"})],
    extension: extensionRoot
  });

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
    return new ReturnObject({status: "success", message: "Daily to-do template inserted", payload: template});
  };

  // ===========================
  // BULLET COMMAND
  // ===========================

  const bullet = new Command({
    name: "bullet",
    parameters: [],
    type: "insert",
    helpText: "Insert bullet journal template",
    tutorials: [new TutorialCommand({command: "bullet()", description: "Insert bullet journal template"})],
    extension: extensionRoot
  });

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
    return new ReturnObject({status: "success", message: "Bullet journal template inserted", payload: template});
  };

  // ===========================
  // SORRY COMMAND
  // ===========================

  const sorry = new Command({
    name: "sorry",
    parameters: [],
    type: "insert",
    helpText: "Insert apology template",
    tutorials: [new TutorialCommand({command: "sorry()", description: "Insert apology template"})],
    extension: extensionRoot
  });

  sorry.execute = function(payload) {
    const template = `Hi [Name],

I want to apologize for [specific situation/action]. I realize that [acknowledge impact], and I take full responsibility for my part in this.

What I should have done differently: [specific alternative action]

Moving forward, I will [commitment to change/improvement].

I value [our relationship/working together/etc.] and appreciate your understanding.

Best,
[Your name]`;

    return new ReturnObject({status: "success", message: "Apology template inserted", payload: template});
  };

  // ===========================
  // REFLECT COMMAND
  // ===========================

  const reflect = new Command({
    name: "reflect",
    parameters: [],
    type: "insert",
    helpText: "Insert daily reflection template",
    tutorials: [new TutorialCommand({command: "reflect()", description: "Insert daily reflection template"})],
    extension: extensionRoot
  });

  reflect.execute = function(payload) {
    const template = `# Daily Reflection - ${getCurrentDate()}

## What went well today?


## What could have gone better?


## What did I learn?


## What am I grateful for?


## Tomorrow's focus:

`;
    return new ReturnObject({status: "success", message: "Daily reflection template inserted", payload: template});
  };

  // ===========================
  // STANDUP COMMAND
  // ===========================

  const standup = new Command({
    name: "standup",
    parameters: [],
    type: "insert",
    helpText: "Insert standup meeting template",
    tutorials: [new TutorialCommand({command: "standup()", description: "Insert standup meeting template"})],
    extension: extensionRoot
  });

  standup.execute = function(payload) {
    const template = `# Standup - ${getShortDate()}

## Yesterday
What I completed:


## Today
What I'm working on:


## Blockers
Challenges or help needed:

`;
    return new ReturnObject({status: "success", message: "Standup template inserted", payload: template});
  };

  // ===========================
  // ONE_ON_ONE COMMAND
  // ===========================

  const one_on_one = new Command({
    name: "one_on_one",
    parameters: [],
    type: "insert",
    helpText: "Insert 1:1 meeting template with manager",
    tutorials: [new TutorialCommand({command: "one_on_one()", description: "Insert 1:1 meeting template"})],
    extension: extensionRoot
  });

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
    return new ReturnObject({status: "success", message: "1:1 meeting template inserted", payload: template});
  };

  // ===========================
  // CUSTOM TEMPLATES (Generated with loop)
  // ===========================

  // Generate 10 custom template commands dynamically
  for (let i = 1; i <= 10; i++) {
    const cmd = new Command({
      name: `custom_template_${i}`,
      parameters: [],
      type: "insert",
      helpText: `Insert custom template ${i} (user-configurable in preferences)`,
      tutorials: [new TutorialCommand({command: `custom_template_${i}()`, description: `Insert your custom template ${i}`})],
      extension: extensionRoot
    });

    cmd.execute = function(payload) {
      const template = getExtensionPreference(extensionName, `custom_template_${i}`) || "";

      if (!template?.trim()) {
        return new ReturnObject({status: "error", message: `Custom template ${i} is not configured. Please set it in extension preferences.`});
      }

      return new ReturnObject({status: "success", message: `Custom template ${i} inserted`, payload: template});
    };
  }
})();
