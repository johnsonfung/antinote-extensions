# FX Converter Extension

A simple currency conversion extension that fetches real-time exchange rates and converts between currencies.

## Features
- Convert between currencies (USD, INR, EUR, GBP, etc.)
- Uses live exchange rates from the free Frankfurter API
- Fast and lightweight

## How It Works
The extension takes:
- an amount  
- a source currency (`from`)  
- a target currency (`to`)  

It fetches the latest exchange rate and returns the converted value.

---

## Usage

### Setting up API key
You do not need an API key to use this plugin, but antinote throws an error when an empty key is passed in an API call.

Go to the Extensions and scroll down to API keys.
Click Add API Key, give the key any name you want.
Keychain key SHOULD be "dummy" (without the quotes) or the extension won't work.
Enter any value in the API Key Value.
Give the extension permission to use this API key on the same page.
Save and exit.

### Command
::fx( amount, from_currency, to_currency)

### Example

#### Input
::fx(100,usd,eur)
#### Output
86.4 EUR 
(value depends on live forex rates)

## API Used
Frankfurter Exchange Rate API

## Notes
- Currency must be valid 3 character ISO codes (USD, INR, EUR, CNY, etc.)
- An error is thrown when the from_currency and to_currency are the same.
- Result is rounded to two decimal places.

## Author
- Aditya Gaurkar