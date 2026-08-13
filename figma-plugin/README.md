# MDesign Figma Import Plugin

Figma me MDesign ke generated designs ko **real, editable nodes** me import karta hai.
Backend export pipeline (`target: "figma"`) ek transfer payload banata hai (`GET /api/exports/:id/figma-payload`) — ye plugin usi payload ko Figma node tree me convert karta hai.

## Install (local development)

1. Figma app kholo → **Plugins → Development → New plugin…**
2. "Link existing plugin" choose karo aur is `figma-plugin/` folder ka `manifest.json` select karo
3. Plugin ab Plugins menu me dikhega — "MDesign Import" run karo

## Usage

1. MDesign Studio me design generate karo aur **Export → Figma file** run karo
2. Export complete hone par **"Copy payload JSON"** button dabao (ya payload URL copy karo)
3. Figma me plugin kholo aur:
   - JSON paste karke **Create design from JSON**, ya
   - Backend URL + access token daal kar **Fetch from URL**
4. Plugin ek nayi page banata hai (section frames + text/button/card/image nodes) — sab editable

> **Note:** Figma ki REST API file content modify nahi kar sakti, isliye node-creation isi plugin se hoti hai. Backend file create karta hai + payload stage karta hai.

## Payload shape (schema v1)

```json
{
  "schemaVersion": 1,
  "name": "MDesign export",
  "type": "CANVAS",
  "children": [
    {
      "type": "FRAME",
      "name": "Hero",
      "layoutMode": "VERTICAL",
      "children": [
        { "type": "TEXT", "characters": "Work smarter, faster", "fontSize": 44 },
        { "type": "FRAME", "name": "comp_cta", "layoutMode": "HORIZONTAL", "children": [...] },
        { "type": "RECTANGLE", "width": 400, "height": 260,
          "pluginData": { "mdesign": { "imageUrl": "https://..." } } }
      ]
    }
  ]
}
```
