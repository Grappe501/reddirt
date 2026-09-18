# PawPaw Stories

A standalone illustrated storybook and video-ready storytelling app for Waylon, Weston, and PawPaw.

## Story One
**PawPaw Always Comes Back** — an 18-page first draft designed for an 8–10 minute narrated experience once pauses, page turns, and illustrations are included.

## Product direction
- Online page-turn storybook for TV, tablet, phone, and desktop.
- Consistent AI-illustrated PawPaw, Waylon, and Weston character models.
- Optional PawPaw voice narration with page timing.
- Video-export workflow for YouTube episodes.
- Series architecture for future farm, park, store, and other adventures.
- Story manuscript is data-driven in `src/story.ts` so illustration/audio assets can be added page by page.

## Local
```bash
npm install
npm run dev
npm run check
```

## Netlify
Create a dedicated Netlify project from the Grappe501/reddirt repository using:
- Production branch: feature/pawpaw-stories-foundation during development; move to main when ready.
- Base directory: pawpaw-stories
- Build command: npm run build
- Publish directory: dist
- Node: 22

No database, secrets, or backend are required for V1.

## Next build
1. Story edit pass to reach the final spoken 8–10 minute cadence.
2. Character bible from family reference photos.
3. Generate consistent illustrations and replace placeholders.
4. Record/import PawPaw narration and synchronize page turns.
5. Add cinematic autoplay/fullscreen TV mode and YouTube video export workflow.
