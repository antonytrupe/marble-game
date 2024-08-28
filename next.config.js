/** @type {import('next').NextConfig} */
module.exports = {
  output: "standalone",
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       // source: "*",
  //       headers: [
  //         {
  //           key: "Cross-Origin-Opener-Policy",
  //           value: "same-origin-allow-popups",
  //         },
  //         {
  //           key: "Cross-Origin-Embedder-Policy",
  //           value: "unsafe-none",
  //         },
  //         {
  //           key: "Access-Control-Allow-Origin",
  //           value: "*", // Set your origin
  //         },
  //       ],
  //     },
  //   ]
  // },
}