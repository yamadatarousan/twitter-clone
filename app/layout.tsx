import Nav from './components/Nav';
import SessionWrapper from './components/SessionWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Nav />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}