# Translations

The catalog supports three interface languages:

- Russian (`ru`)
- English (`en`)
- Simplified Chinese (`zh` / `zh-CN`)

## How it works

The UI, profession/task navigator, quick filters, search aliases, status labels and recipes are translated through:

- `locales/ru.json`
- `locales/en.json`
- `locales/zh.json`

Language selection is stored in `localStorage` and can also be shared with a URL parameter:

- `?lang=ru`
- `?lang=en`
- `?lang=zh`

## Catalog content

Technical names, commands, URLs and model/repository names are intentionally not translated.

For descriptions and long notes the catalog uses progressive localization:

1. translated override from the selected locale, when available;
2. otherwise the original curated text is shown;
3. non-Russian interfaces mark Russian fallback text with a small `original RU` / `俄文原文` badge.

This avoids low-quality automatic translations of licenses, hardware requirements and security warnings.

## Contributing translations

Add or improve exact card translations inside the `content` object of the locale file, keyed by card name:

```json
{
  "content": {
    "Example Tool": {
      "desc": "Translated description",
      "requirements": "Translated requirements",
      "note": "Translated note"
    }
  }
}
```

Common labels and taxonomy should be translated by stable IDs rather than by changing source data.
