import React from 'react';
import { ScrollViewProps } from 'react-native';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO */}
        <title>WELLDHAN | Community Wellness & Organic Food</title>
        <meta name="description" content="WELLDHAN provides premium wellness coaching, sports venue management, and organic food delivery specifically for gated communities." />
        <meta name="keywords" content="wellness, sports, organic food, gated community, coaching, badminton, tennis, healthy living" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://welldhan.com/" />
        <meta property="og:title" content="WELLDHAN | Community Wellness & Organic Food" />
        <meta property="og:description" content="Transforming community living with elite coaching and farm-fresh organics." />
        <meta property="og:image" content="https://welldhan.com/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://welldhan.com/" />
        <meta property="twitter:title" content="WELLDHAN | Community Wellness & Organic Food" />
        <meta property="twitter:description" content="Transforming community living with elite coaching and farm-fresh organics." />
        <meta property="twitter:image" content="https://welldhan.com/og-image.png" />

        {/* PWA / Mobile */}
        <meta name="theme-color" content="#1a4d2e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <style dangerouslySetInnerHTML={{ __html: rootStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const rootStyle = `
body {
  background-color: #0d1b13;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0d1b13;
  }
}
`;
