import { PluginsClient } from './plugins-client';

export const metadata = {
  title: 'Governance Plugins — Siza',
  description:
    'Install governance, quality, and architecture plugins to enforce engineering discipline.',
};

export default function PluginsPage() {
  return <PluginsClient />;
}
