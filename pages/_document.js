import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <header>
         <Link href="/"><h1>Mongo Presenter</h1></Link>
        </header>
        <main>
          <Main />
          <NextScript />
        </main>
      </body>
    </Html>
  );
}
