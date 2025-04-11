import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <header>
          <div>
          <Link href="/"><h1>Mongo Presenter</h1></Link>
          </div>
          <div>
            <Link href="/"><h2>Home</h2></Link>
          </div>
        </header>
        <main>
          <Main />
          <NextScript />
        </main>
        <footer>
          <p>mrdarip</p>
        </footer>
      </body>
    </Html>
  );
}
