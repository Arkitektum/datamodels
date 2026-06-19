import AuthGate from '@/components/AuthGate';
import WorkspaceClient from '@/components/workspace/WorkspaceClient';

export default function Home() {
  return (
    <AuthGate>
      <WorkspaceClient />
    </AuthGate>
  );
}
