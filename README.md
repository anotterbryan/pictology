# Pictology: Carole's folk art site

Built the same way as Ray Lane Writes: an Eleventy site that Carole edits through **Pages CMS** with simple forms. Every save rebuilds the live site in about a minute.

**Live at:** https://anotterbryan.github.io/pictology/

**What's inside**
- `src/artworks/`: one file per gallery piece (photo, title, caption, category, availability)
- `src/notes/`: studio notes (blog posts)
- `src/_data/site.json`: banner text, About story, contact links · `src/_data/categories.json`: the four gallery groups
- `src/images/`: photos
- `.pages.yml`: the editor's forms · `.github/workflows/deploy.yml`: publishes to GitHub Pages on every save

## Turn on the editor (5 min)
1. Go to **app.pagescms.org** → **Sign in with GitHub** → install the Pages CMS app on the `pictology` repo.
2. Open it. You'll see **Artwork (gallery), Studio notes (blog), Site settings**.
3. To give Carole her own login: on GitHub, repo **Settings → Collaborators → Add people** with her GitHub username. She signs in to Pages CMS the same way.

## Before you announce it
- [ ] Have Carole rename the pieces (the current titles are placeholders) and check the captions
- [ ] Have her rewrite **Site settings → About — your story** in her own words
- [ ] Add her email and real Facebook page link in **Site settings**
- [ ] Swap in a sharper portrait
- [ ] Optional: a custom domain (e.g. pictology.com). Add it under repo **Settings → Pages**, then change `PATH_PREFIX` in `.github/workflows/deploy.yml` to `/`.

---

# For Carole: how to add things

Go to **app.pagescms.org**, sign in with GitHub, and open **pictology**.

**Add a new piece**
1. Click **Artwork (gallery) → Add an entry**.
2. Give it a title, upload the photo, and write a one- or two-line caption.
3. Pick where it shows: Pysanky, Ornaments, Story & verse eggs, or Fiber art & cards (you can pick more than one).
4. Optional: add a price or "Sold" under **Availability**.
5. Want it as the big photo at the top of the home page? Switch on **Feature at the top**.
6. Click **Save**. The site updates in about a minute.

**Write a studio note:** **Studio notes → Add an entry** → title, date, one-line summary, the post → **Save**.

**Hide something without deleting it:** open it, switch off **Published**, and save.

## Working on it yourself
```
npm install
npm start          # preview at http://localhost:8080
```
