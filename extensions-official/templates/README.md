# Templates Extension

Quick access to commonly used text templates for productivity, meetings, and personal development.

## Features

This extension provides 6 ready-to-use templates that can be instantly inserted into your notes:

- **::todo** - Daily to-do list with GSD (Get Stuff Done) framework
- **::bullet** - Bullet journal template
- **::sorry** - Professional apology template
- **::reflect** - Daily reflection prompts
- **::standup** - Standup meeting notes
- **::one_on_one** - 1:1 meeting with manager template

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
