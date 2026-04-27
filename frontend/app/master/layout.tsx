import MasterLayoutClient from './MasterLayoutClient';

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <MasterLayoutClient>{children}</MasterLayoutClient>;
}
