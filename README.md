# Principles of Management — GitHub Pages

This package converts the supplied PowerPoint lectures into a responsive, slide-based website.

## Included lectures

- `PoM1.1.pptx`
- `PoM1.2.pptx`
- `PoM1.3.pptx`
- `PoM2.1.pptx`

Each presentation is rendered into slide images while the slide text is extracted into the site data for search/accessibility. The original PPTX files are also retained under `assets/pptx/`.

## Publish on GitHub Pages

Repository target:

`https://github.com/learnwithrk/Principles-of-Management`

### Option 1 — Upload through GitHub

1. Open the repository.
2. Upload the **contents of this folder** to the repository root.
3. Commit the files to `main`.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`.
7. Save.
8. Wait for GitHub Pages to publish.

The expected site URL is:

`https://learnwithrk.github.io/Principles-of-Management/`

### Option 2 — Git command line

Clone your repository, copy the generated website files into it, then:

```bash
git add .
git commit -m "Convert Principles of Management PPTs to GitHub Pages"
git push origin main
```

Then enable GitHub Pages from **Settings → Pages** using `main` and the repository root.

## Features

- Responsive desktop/mobile layout
- Table of contents
- Slide-by-slide navigation
- Full-screen slide viewing
- Slide-text search
- Show/hide extracted text
- Print support
- Original PPTX download files
- No external JavaScript libraries required
