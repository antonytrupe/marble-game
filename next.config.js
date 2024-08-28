/** @type {import('next').NextConfig} */
module.exports = {
  output: "standalone",
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Cross-Origin-Opener-Policy",
  //           value: "same-origin-allow-popups",
  //         },
  //       ],
  //     },
  //   ]
  // },
}