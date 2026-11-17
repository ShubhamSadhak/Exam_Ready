import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthProvider } from './lib/auth-context.tsx';
import { RouterProvider, useRouter } from './lib/router.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { CheckPage } from './pages/CheckPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { ResultsPage } from './pages/ResultsPage.tsx';
import { ReviewPage } from './pages/ReviewPage.tsx';

function AppShell() {
  const { route } = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#0F172A]">
      <Navbar />
      <main className="flex-1">
        {route.page === 'landing' && <LandingPage />}
        {route.page === 'check' && <CheckPage attemptIdParam={route.attemptIdParam} />}
        {route.page === 'results' && <ResultsPage attemptId={route.attemptId} />}
        {route.page === 'review' && <ReviewPage attemptId={route.attemptId} />}
        {route.page === 'about' && <AboutPage />}
        {route.page === 'login' && <AuthPage initialMode="login" />}
        {route.page === 'signup' && <AuthPage initialMode="signup" />}
        {route.page === 'account' && <AccountPage />}
      </main>
      {route.page !== 'check' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </RouterProvider>
  );
}
