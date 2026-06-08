import AuthGate from '@/components/AuthGate';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  return (
    <AuthGate>
      <HomeClient />
    </AuthGate>
  );
}
