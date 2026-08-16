# VyantraH

An AI-assisted nutrition SaaS MVP. VyantraH calculates calorie and macro targets deterministically, uses Gemini to turn those targets into a practical meal plan, provides a context-aware nutrition coach, and includes a browser-persisted food log.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Add a Gemini API key from Google AI Studio to `.env`
4. Start the app: `npm run dev`
5. Open `http://localhost:3000`

## Architecture

```text
public/             SaaS dashboard and browser state
src/diet.js         Validated BMR, TDEE, and macro calculations
src/gemini.js       Gemini prompts, schema, and coach context
server.js           Express API and static server
```

### API routes

- `POST /api/diet-plan` — validates a profile, calculates targets, and asks Gemini for structured meals.
- `POST /api/chat` — answers coaching questions with the active profile and targets as context.
- `POST /api/food-scan` — placeholder contract for the future OpenCV/OCR service.
- `GET /api/health` — reports server and AI configuration status.

## OpenCV integration path

The future scanner should accept an uploaded food image, perform recognition/OCR, resolve foods against a nutrition database, and return:

```json
{
  "items": [
    { "name": "food", "servingGrams": 100, "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
  ]
}
```

The browser can then add reviewed items through the existing macro-log state. Human review is important because image-based portion estimation is inherently uncertain.

## Important boundaries

- The Gemini API key is only read by the server. Never put it in `public/app.js`.
- Calculations use Mifflin–St Jeor and conservative calorie floors; Gemini does not recalculate targets.
- This is general wellness guidance, not medical advice.
