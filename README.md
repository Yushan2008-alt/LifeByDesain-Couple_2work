This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy ke Vercel

Project ini sudah siap deploy ke Vercel dengan konfigurasi:

- `vercel.json` (framework Next.js, install dan build command)
- Build command: `npm run build`
- Install command: `npm ci`

Langkah deploy:

1. Push branch ini ke GitHub.
2. Buka Vercel lalu pilih **Add New Project**.
3. Import repository ini.
4. Framework akan terdeteksi sebagai **Next.js**.
5. Klik **Deploy**.

Untuk redeploy berikutnya, cukup push commit baru ke branch yang terhubung.
