# Templates Extension

Quick access to commonly used text templates for productivity, meetings, and personal development.

## Features

This extension provides 6 ready-to-use templates plus 3 customizable templates that can be instantly inserted into your notes:

### Built-in Templates
- **::todo** - Daily to-do list with GSD (Get Stuff Done) framework
- **::bullet** - Bullet journal template
- **::sorry** - Professional apology template
- **::reflect** - Daily reflection prompts
- **::standup** - Standup meeting notes
- **::one_on_one** - 1:1 meeting with manager template

### Custom Templates
- **custom_template_1** - User-configurable template 1
- **custom_template_2** - User-configurable template 2
- **custom_template_3** - User-configurable template 3

## Commands

### ::todo()

Insert a daily to-do list using the GSD (Get Stuff Done) framework.

**Format:**
```
list:To-Do - [Current Date]

# Goals
What do I want to accomplish today?

# Schedule
Time-blocked tasks and meetings

# Do
Tasks to complete today
Review quarterly goals
```

**Example:**
```
::todo()
```

### ::bullet()

Insert a bullet journal template with standard rapid logging notation.

**Format:**
```
# [Current Date]

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
```

**Example:**
```
::bullet()
```

### ::sorry()

Insert a thoughtful apology template with placeholders to customize.

**Format:**
```
Hi [Name],

I want to apologize for [specific situation/action]. I realize that [acknowledge impact],
and I take full responsibility for my part in this.

What I should have done differently: [specific alternative action]

Moving forward, I will [commitment to change/improvement].

I value [our relationship/working together/etc.] and appreciate your understanding.

Best,
[Your name]
```

**Example:**
```
::sorry()
```

### ::reflect()

Insert daily reflection prompts for personal growth and mindfulness.

**Format:**
```
# Daily Reflection - [Current Date]

## What went well today?


## What could have gone better?


## What did I learn?


## What am I grateful for?


## Tomorrow's focus:

```

**Example:**
```
::reflect()
```

### ::standup()

Insert a standup meeting template for agile/scrum teams.

**Format:**
```
# Standup - [Short Date]

## Yesterday
What I completed:


## Today
What I'm working on:


## Blockers
Challenges or help needed:

```

**Example:**
```
::standup()
```

### ::one_on_one()

Insert a comprehensive 1:1 meeting template for manager check-ins.

**Format:**
```
# 1:1 Meeting - [Short Date]

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

```

**Example:**
```
::one_on_one()
```

### custom_template_1()

Insert your own custom template configured in preferences.

**Configuration:**
Configure this template in the extension preferences. Use `\n` for line breaks in your template text.

**Example Template Configuration:**
```
# My Custom Meeting Notes\n\n## Attendees\n\n\n## Agenda\n\n\n## Notes\n\n\n## Action Items\n
```

**Example:**
```
custom_template_1()
```

**Note:** You can create command aliases in Antinote to give this a more meaningful name (e.g., `::meeting` → `custom_template_1`).

### custom_template_2()

Insert your second custom template configured in preferences.

**Configuration:**
Same as custom_template_1 - configure in extension preferences with `\n` for line breaks.

**Use Case:** Create specialized templates for recurring needs (project kickoffs, code reviews, brainstorming sessions, etc.)

**Example:**
```
custom_template_2()
```

### custom_template_3()

Insert your third custom template configured in preferences.

**Configuration:**
Same as custom_template_1 - configure in extension preferences with `\n` for line breaks.

**Use Case:** Perfect for personal templates unique to your workflow.

**Example:**
```
custom_template_3()
```

## Use Cases

### Daily Planning
- Use `::todo()` to start each day with a clear plan using the GSD framework
- Use `::bullet()` for rapid logging throughout the day

### Team Communication
- Use `::standup()` to prepare for daily standups or async updates
- Use `::one_on_one()` to structure productive conversations with your manager

### Personal Growth
- Use `::reflect()` for evening journaling and self-improvement
- Use `::sorry()` to craft thoughtful, genuine apologies

### Custom Workflows
- Configure `custom_template_1/2/3` with your own templates
- Use Antinote's command alias feature to create memorable shortcuts (e.g., `::retro` → `custom_template_1`)
- Perfect for templates you use frequently but aren't available as built-ins
- Examples: sprint retrospectives, client meeting notes, incident reports, research templates

## Configuration

### Custom Template Preferences

Each custom template has a preference where you can define your template text:

- **Custom Template 1** - Your first user-defined template
- **Custom Template 2** - Your second user-defined template
- **Custom Template 3** - Your third user-defined template

**Formatting:**
- Use `\n` to create line breaks in your template
- Templates can include any text, markdown formatting, or placeholders
- Leave empty if you don't need all three custom templates

**Example:**
```
Meeting Notes Template:\n\n# [Meeting Name]\nDate: [Date]\n\n## Attendees\n\n\n## Key Points\n\n\n## Decisions\n\n\n## Next Steps\n
```

## Requirements

- **Data Scope:** none (doesn't need note content)
- **Network:** No network calls required
- **API Keys:** None required

## Notes

- All date-based templates automatically insert the current date
- Templates use markdown formatting (# for headers)
- The `::todo` template uses the "list:" prefix for compatibility with list-based workflows
- All templates are designed to be customized after insertion

## License

MIT
