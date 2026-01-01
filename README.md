# Personal Site

Your day‑to‑day: pulling upstream safely

When the template updates:

1) refresh your upstream snapshot
```bash
git checkout upstream-main
git fetch upstream
git reset --hard upstream/main
```

2) merge into your site
```bash
git checkout main
git merge --no-ff upstream-main
```

3) resolve any conflicts (your personal files should auto-keep via `.gitattributes`

4) run the site, fix small breakages if API changed

```bash
npm ci
npm run dev
```

5) push
```
git push origin main
```

If you prefer a tidy history, you can rebase instead of merge:

```
git checkout main
git fetch upstream
git rebase upstream/main
# resolve; then:
git push --force-with-lease
```

(Use rebase only if you’re comfortable force‑pushing your fork’s main.)

When you only want some upstream changes

You can cherry‑pick just the commits you want:

```
git fetch upstream
git log --oneline upstream/main   # find the commit(s)
git checkout -b apply-upstream-feature
git cherry-pick <sha> [<sha2> ...]
# test, then:
git checkout main
git merge --no-ff apply-upstream-feature
git branch -d apply-upstream-feature
```

Reduce future merge pain (small structural tweaks)

“Personalization” hotspots:

- `src/settings.ts` – your name, socials, base URL, etc.
- `src/data/cv.ts` – your CV sections
- `src/content/**` – your blog posts
- `src/assets/profile_pictures.jpg` – your avatar



## How to Create a CV Using the `cv.ts` File

The `cv.ts` file located in the `src/data/` directory is used to define the structure and content of your CV. This file exports an object containing various sections of your CV, such as education, experience, publications, and more.

### Example Structure of `cv.ts`

```typescript
export const cv = {
  education: [
    {
      degree: "Ph.D. in Computer Science",
      institution: "University of Example",
      year: "2020",
    },
    {
      degree: "M.Sc. in Computer Science",
      institution: "University of Example",
      year: "2016",
    },
  ],
  experience: [
    {
      title: "Research Scientist",
      company: "Example Research Lab",
      year: "2021-Present",
    },
    {
      title: "Software Engineer",
      company: "Tech Company",
      year: "2016-2021",
    },
  ],
  // Add more sections as needed
};
```

To create or update your CV, modify the `cv.ts` file with your personal information and achievements. The CV will be automatically rendered on the CV page of your website.

## How to Use the `settings.ts` File

The `settings.ts` file located in the `src/` directory is used to configure various settings for your Astro Academia website. This file exports an object containing settings such as site title, description, social media links, and more.

### Example Structure of `settings.ts`

```typescript
export const settings = {
  siteTitle: "Astro Academia",
  siteDescription: "A personal academic website built with Astro.",
  socialLinks: {
    twitter: "https://twitter.com/yourusername",
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
  },
  // Add more settings as needed
};
```

To customize your website settings, modify the `settings.ts` file with your desired values. These settings will be used throughout your website to display the appropriate information.

## Where to Find the Blog Collection and Where to Add New Blog Posts

The blog collection is located in the `src/content/BlogPosts/` directory. Each blog post is a Markdown file with a `.md` extension. The blog posts are named sequentially (e.g., `post1.md`, `post2.md`, etc.).

### Adding a New Blog Post

1. Navigate to the `src/content/BlogPosts/` directory.
2. Create a new Markdown file for your blog post (e.g., `post1.md`).
3. Add the content of your blog post using Markdown syntax. Include frontmatter at the top of the file to define metadata such as title, date, and tags.

### Example Blog Post (`post11.md`)

```markdown
---
title: "New Blog Post"
date: "2023-10-01"
tags: ["research", "astro"]
excerpt: "Some short paragraphs"
---

# New Blog Post

This is the content of the new blog post. Write your article here using Markdown syntax.
```

Once you have added the new blog post, it will be automatically included in the blog collection and displayed on the blog page of your website.


