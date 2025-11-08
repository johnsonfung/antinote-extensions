# LLM Extension

General-purpose AI command for getting AI-generated responses in your Antinote notes.

## Overview

This extension provides a simple `ai` command that uses the **AI Providers** service for all AI functionality. It supports multiple providers (OpenAI, Anthropic, Google AI, OpenRouter, Ollama) through a shared configuration.

**Dependencies:** This extension requires the `ai_providers` extension to be installed and enabled.

## Setup Instructions

All AI configuration is done through the **AI Providers** extension:

1. Go to **Preferences > Extensions > AI Providers**
2. Configure your AI provider, model, and preferences
3. See the AI Providers extension README for detailed setup instructions

That's it! This extension will automatically use those settings.

## Commands

### `ai`

Insert an AI-generated response to your prompt.

**Parameters:**
- `prompt` (string): The prompt to send to the LLM
- `max_tokens` (int, optional): Maximum tokens in the response (0 = use default from preferences). Default: 0
- `temperature` (float, optional): Randomness of the response (0.0-2.0). Default: 0.7

**Examples:**

```
::ai(What is the capital of France?)
```
Get an AI response to a simple question using default token limit.

```
::ai(Explain quantum computing in simple terms, 300)
```
Get a longer explanation with 300 tokens.

```
::ai(Write a haiku about coding, 100, 1.2)
```
Get a more creative response with 100 tokens and higher temperature.

---

## Configuration

All configuration is handled by the **AI Providers** extension. See its README for:
- Supported providers (OpenAI, Anthropic, Google AI, OpenRouter, Ollama)
- Available models
- Provider setup instructions
- System prompt customization
- Default token limits

---

## Version

3.0.0

## Author

johnsonfung
