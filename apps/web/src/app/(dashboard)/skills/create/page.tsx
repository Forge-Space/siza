import { SkillCreatorClient } from './skill-creator-client';

export const metadata = {
  title: 'Create Skill — Siza',
  description:
    'Create a new AI generation skill using the Anthropic Agent Skills standard.',
};

export default function CreateSkillPage() {
  return <SkillCreatorClient />;
}
