# SkyTrain Connect

## The Problem

Every day, thousands of professionals ride the SkyTrain side by side — developers, designers, founders, recruiters — and never talk to each other. We sit in silence, headphones in, missing connections that could change our careers.

Networking events feel forced. LinkedIn is noisy. Coffee chats take scheduling. But what if you could meet the right person just by showing up to your daily commute?

## The Solution

**SkyTrain Connect** turns your commute into a networking opportunity.

Open the app when you board. Tell us your role and what you're open to — mentorship, co-founders, hiring, side projects. We instantly match you with the most relevant person in your train car, in real time.

No swiping. No scheduling. No awkward small talk starters. Just: "Hey, we're both here, and we should meet."

## How It Works

1. **30-second onboarding** — name, role, what you're open to.
2. **Board the train** — opening the app signals you're present and open to connecting.
3. **Instant match** — our algorithm finds the person most relevant to you among active riders.
4. **A real conversation** — you get a card with their name, role, and shared interests. Walk over and say hi.

That's it. Real connections, zero friction.

## The Tech

- **Real-time presence** via Firestore snapshot listeners — matches update live as people board and exit.
- **Jaccard similarity matching** on professional profiles — simple, fast, and surprisingly effective.
- **PWA** — no app store, no install barrier. Works on any phone with a browser.
- **30-second keepalive** — ensures only active, present users are shown. Close the app and you disappear.

Built in under 24 hours with React, TypeScript, Tailwind, and Firebase.

## Why It Wins

- **Zero friction** — no accounts, no downloads, no invites. Open a URL and you're in.
- **Solves a real problem** — professionals want to network but hate the current options.
- **Built for scale** — Firestore handles thousands of concurrent riders out of the box.
- **Clear v2 path** — BLE for true proximity detection, ML-powered matching, transit API integration for route-based communities.

## The Vision

SkyTrain Connect isn't just an app — it's a movement. Imagine every transit system in every city turning commuters into collaborators. Vancouver's SkyTrain is just the start.

**Your commute is wasted time. Let's fix that.**
