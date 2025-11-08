# OpenAI Extension

Use OpenAI's GPT to generate text based on prompts directly in your Antinote notes.

## Setup Instructions

1. Go to **Preferences > API Keys** in Antinote
2. Add a new API key with:
   - **Name**: "OpenAI"
   - **Keychain Key**: "apikey_openai"
   - **API Key Value**: Your OpenAI API key (starts with `sk-...`)
3. Restart Antinote
4. Configure preferences (optional):
   - Choose your preferred GPT model
   - Customize the system prompt

## Commands

### `gpt`

Generate text using OpenAI's GPT model.

**Parameters:**
- `prompt` (string): The prompt to send to GPT
- `max_tokens` (int, optional): Maximum tokens in the response. Default: 150
- `temperature` (float, optional): Randomness of the response (0.0-2.0). Default: 0.7

**Examples:**

```
** gpt(What is the capital of France?)
```
Ask GPT a simple question.

```
** gpt(Explain quantum computing in simple terms, 300)
```
Get a longer explanation with 300 max tokens.

```
** gpt(Write a haiku about coding, 100, 1.2)
```
Get a more creative response with higher temperature.

---

## Preferences

This extension supports the following preferences (configured in Antinote settings):

- **OpenAI Model**: Choose from:
  - `gpt-4o` (default)
  - `gpt-4o-mini`
  - `gpt-4-turbo`
  - `gpt-3.5-turbo`

- **System Prompt**: Customize the system prompt sent to OpenAI. Default: "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct."

## API Usage

This extension makes calls to:
- `https://api.openai.com/v1/chat/completions`

**Required API Keys:**
- OpenAI API key (keychain key: `apikey_openai`)

## Privacy

This extension only sends your prompt to OpenAI's API. It does not send the full note content unless you explicitly include it in your prompt.

## Version

1.0.0

## Author

anthropics
