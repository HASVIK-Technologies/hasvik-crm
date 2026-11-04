# HASVIK brand assets

The official HASVIK logo and icon as sharp, scalable files. Use these instead of screenshots or the older low-resolution
images. All files have a transparent background.

| File | What it is | Use it for |
|---|---|---|
| `hasvik-logo.svg` | Full logo (H, wordmark, swoosh, arrow) as a vector | Websites and apps. Stays sharp at any size. **Preferred.** |
| `hasvik-logo-512.png` … `-4096.png` | Same logo as PNG, 512 / 1024 / 2048 / 4096 px wide | Documents, slides, e-mail, social, print |
| `hasvik-icon.svg` | The "H" mark alone, square, as a vector | App icons, favicons, avatars, small spaces |
| `hasvik-icon-256.png` … `-2048.png` | Same icon as PNG, 256 / 512 / 1024 / 2048 px | Anywhere a PNG is needed |

## How to use

- **Web (HTML):** `<img src="/brand/hasvik-logo.svg" alt="HASVIK" height="40">`
- **Next.js:** `<Image src="/brand/hasvik-logo.svg" alt="HASVIK" width={160} height={50} />`
- **Pick the PNG size at least as wide as it will be shown, doubled for sharp phone screens.** A logo shown 300 px wide
  needs the 1024 px file.
- The logo has its own colours (blue letters, green VIK, cyan-to-green swoosh). Keep them: do not recolour, stretch, rotate
  or add effects. The blue letters do not read on a blue background, so put the logo on white or a light surface (or a
  white tile on a blue one).
- Leave clear space around the logo of at least the height of the "H".

Each SVG is self-contained, so it is safe to paste inline into a page; its gradient names are unique to the file.
