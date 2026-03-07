import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/20 bg-surface">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={20} height={20} />
              <span className="font-display font-bold text-lg text-foreground">Siza</span>
            </div>
            <p className="mt-2 text-sm text-subtle">The open full-stack AI workspace.</p>
            <div className="flex items-center gap-4 mt-4">
              <Link
                href="https://github.com/Forge-Space"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Siza on GitHub"
                className="text-subtle hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/devlucassantana/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lucas Santana on LinkedIn"
                className="text-subtle hover:text-foreground transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Product</h3>
            <Link
              href="/"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Platform
            </Link>
            <Link
              href="/pricing"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/templates"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/roadmap"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Resources</h3>
            <Link
              href="/docs"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://github.com/Forge-Space/ui-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              MCP Tools
            </Link>
            <Link
              href="/docs"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              API Reference
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Company</h3>
            <Link
              href="/about"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/roadmap"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="https://github.com/orgs/Forge-Space/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Community
            </Link>
            <Link
              href="https://github.com/Forge-Space/siza/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Legal</h3>
            <Link
              href="/legal/privacy"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="https://github.com/Forge-Space/siza/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              License
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border/20 pt-8">
          <p className="text-center text-xs text-subtle">&copy; 2026 Siza. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
