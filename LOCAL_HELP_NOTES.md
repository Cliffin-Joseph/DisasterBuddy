# Singapore Local Help and hazard details

## Routes
- Learn → Local help in Singapore.
- Alerts → Local help in Singapore.
- Alerts → select event → in-app snapshot → official report, learning topic, or Singapore Local Help.
- Learning links switch to the Learn tab so existing guide and quiz navigation is preserved.

## Content maintenance
Curated entries live in `src/data/localHelpData.js`, with their official source and a fixed verification date (2026-09-28). This is not a dynamically verified directory. Review sources before a public release and periodically thereafter. Source labels alone are not certification by those agencies.

SCDF publishes the withdrawal of the 1777 service from 1 January 2027. The app links to its non-emergency provider guidance instead of providing a soon-obsolete dial button. Police emergency SMS is 70999; SCDF emergency SMS 70995 is specifically described for the deaf, hard-of-hearing and speech-impaired community. MSF's ComCare entry links to its official page rather than presenting conflicting hotline details found in search results.

Directories are bundled and readable offline; websites need connectivity. Phone/SMS buttons require confirmation and launch the device handler. They do not send messages automatically. No live shelter status, medical diagnosis, safe-route calculation, or backend push delivery is implemented by this change.

Hazard details show the selected feed snapshot, not a live subscription. Return to Alerts to refresh. Only flood events map to the existing flood learning category; wildfire is deliberately not mapped to household fire guidance. Other hazards explicitly state that no dedicated guide is available. Evacuation planning is labelled general planning, not an instruction to evacuate.

## Verification
Run `npm test`. Tests mock all contact actions: never make a real emergency call for testing.

On a physical device verify:
1. Both Local Help entry points and back navigation.
2. A hazard card opens details without launching a browser immediately.
3. Event fields, missing dates/distance, and offline snapshots remain understandable.
4. Guidance opens the Learn tab and its existing quiz flow still works.
5. Cancel the call/SMS confirmation; do not place test calls to emergency services.
6. An official website opens and a failed handler presents readable feedback.
7. Large text, TalkBack/VoiceOver reading order, scrolling and bottom safe areas.

All pre-existing unrelated project edits were preserved.
