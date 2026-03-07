import { METHOD_COLORS, type HttpMethod } from '@/lib/openapi/types';

interface MethodBadgeProps {
  method: HttpMethod;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={`inline-block font-mono text-[10px] uppercase
        px-1.5 py-0.5 rounded border font-semibold
        ${METHOD_COLORS[method]}`}
    >
      {method}
    </span>
  );
}
