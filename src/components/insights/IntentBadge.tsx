import { intentLabel } from './labels';

interface Props {
  intent: string | null;
}

export function IntentBadge({ intent }: Props) {
  if (!intent) return null;
  return (
    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-tertiary/10 text-tertiary">
      {intentLabel(intent).toUpperCase()}
    </span>
  );
}
