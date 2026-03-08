import { SkillsMarketplaceClient } from './skills-client';

export const metadata = {
  title: 'Skills Marketplace — Siza',
  description:
    'Browse, import, and manage AI generation skills using the Anthropic Agent Skills standard.',
};

export default function SkillsPage() {
  return <SkillsMarketplaceClient />;
}
