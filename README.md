# dongyuanjushi.github.io

Personal site built with Jekyll; GitHub Pages builds it automatically on push.
All content is Markdown — you should never need to touch HTML/CSS for routine updates.

## Where things live

| To change…                       | Edit                                   |
|----------------------------------|----------------------------------------|
| Bio on the home page             | `index.md` (body)                      |
| News                             | `_includes/news.md` — one bullet each: `- **Mon YYYY** text` |
| A paper                          | `_publications/<anything>.md`          |
| Internships (home page + Experience page) | `_includes/internships.md` — logos in `files/logos/` |
| Awards etc.                      | `experience.md`                        |
| Blog page                        | `blog.md`                              |
| Repos counted for the GitHub star total | `_config.yml` → `stats:`         |
| Name, role, email, social links  | `_config.yml` → `author:`              |
| Colors / fonts / widths          | `assets/css/style.css` (tokens at top) |

## Add a paper

Create `_publications/2026-my-paper.md`:

```markdown
---
title: "My Paper Title"
authors: "Kai Mei, Coauthor One*, Coauthor Two"   # your name is bolded automatically
venue: NeurIPS 2026
venue_short: "NeurIPS '26"   # optional: left column on the Publications page
venue_note: "(Oral)"          # optional: second line under it
date: 2026-09-20          # sorts the list and sets the year group
selected: true            # also show on the home page
award: Oral               # optional badge
links:                    # any labels, shown in this order; first one is the title link
  paper: https://arxiv.org/abs/xxxx.xxxxx
  code: https://github.com/...
bibtex: |
  @inproceedings{...}
---
Optional one-line note shown under the entry (Markdown).
```

## Add a page / nav tab

Create e.g. `blog.md`:

```markdown
---
layout: page
title: Blog
nav_order: 4          # position in the top nav; omit to keep the page out of the nav
permalink: /blog/
---
Any Markdown here.
```

### Dated lists

Any Markdown list whose items start with a bold date gets the two-column look when tagged:

```markdown
- **2026** Something
- **2025** Something else
{: .dated .wide}
```

(Use `{: .dated}` for a narrow date column.)

## Preview locally

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

(Needs Ruby ≥ 3.0, e.g. `brew install ruby`; macOS's built-in Ruby 2.6 is too old.)

## Citation and star counts

`_data/stats.json` holds the numbers shown next to "Google Scholar" and "GitHub".
`.github/workflows/stats.yml` refreshes it daily (run it by hand from the Actions tab).
GitHub stars always work. For Scholar, Google often blocks GitHub's servers, so add a free
[SerpApi](https://serpapi.com) key as the `SERPAPI_KEY` repository secret for reliable updates;
without it the last known number stays.
