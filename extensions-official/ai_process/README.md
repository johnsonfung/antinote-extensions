# AI Process Extension

AI-powered text processing extension that provides intelligent text transformation capabilities.

## Features

This extension depends on the **ai_providers** extension to provide three powerful commands for processing your notes:

### Commands

1. **polish** - Improve text professionalism and clarity
2. **translate** - Translate text to different languages
3. **create_list** - Convert text into structured lists

## Commands

### polish(level)

Polish your text with AI to improve professionalism and clarity.

**Parameters:**
- `level` (int, default: 2) - Professionalism level:
  - `1` = Casual/friendly tone
  - `2` = Professional tone
  - `3` = Formal/sophisticated tone

**Examples:**
```
polish(1)  # Polish with casual, friendly tone
polish(2)  # Polish with professional tone (default)
polish(3)  # Polish with formal, sophisticated tone
```

**Behavior:** Replaces entire note content with polished version

### translate(language)

Translate your text to another language using AI.

**Parameters:**
- `language` (string, optional) - Target language for translation. If not specified, uses the default language from preferences.

**Examples:**
```
translate(French)      # Translate to French
translate(Japanese)    # Translate to Japanese
translate()            # Translate to default language (from preferences)
```

**Behavior:** Replaces entire note content with translated version

### create_list()

Generate a structured list from your text using AI.

**Parameters:** None

**Examples:**
```
create_list()  # Convert text into a structured list
```

**Output Format:**
```
list:Title of List
Item 1
Item 2
Item 3
```

The output starts with `list:` followed by a title, then each item on its own line with no bullets or dashes.

**Behavior:** Replaces entire note content with structured list

## Preferences

### Polish Preferences

- **Polish Level 1 Prompt (Casual)** - Custom system prompt for casual polish
  - Default: "Polish this text to be clear and casual while maintaining the author's voice. Keep the tone friendly and approachable."

- **Polish Level 2 Prompt (Professional)** - Custom system prompt for professional polish
  - Default: "Polish this text to be professional and clear. Improve grammar, structure, and clarity while maintaining a business-appropriate tone."

- **Polish Level 3 Prompt (Formal)** - Custom system prompt for formal polish
  - Default: "Polish this text to be highly formal and sophisticated. Use precise language, formal structure, and elevated vocabulary appropriate for academic or executive communication."

- **Voice Print (Optional)** - Optional description of your writing voice
  - Default: (empty)
  - Example: "concise and direct" or "warm and conversational"
  - When set, this is added to polish prompts to maintain consistency

### Translation Preferences

- **Default Translation Language** - Default target language when not specified
  - Default: "Spanish"

### General Preferences

- **Max Tokens Override** - Override maximum tokens for AI responses
  - Default: (empty - uses ai_providers default)
  - When set, overrides the default max tokens from ai_providers extension

## Requirements

- **Dependencies:** ai_providers extension
- **Data Scope:** full (requires access to entire note content)
- **API Keys:** Inherited from ai_providers (OpenAI, Anthropic, Google, or OpenRouter depending on provider selection)

## Configuration

Since this extension depends on ai_providers, you can configure the AI provider and model in the ai_providers extension preferences. The ai_process extension will use those settings for all commands.

## Use Cases

### Polish
- Clean up rough notes before sharing
- Make casual writing more professional for business communications
- Elevate writing quality for important documents

### Translate
- Quickly translate notes to different languages
- Collaborate with international teams
- Learn languages by comparing original and translated text

### Create List
- Extract action items from meeting notes
- Convert paragraphs into bullet points
- Organize brainstorming sessions into structured lists

## License

MIT
