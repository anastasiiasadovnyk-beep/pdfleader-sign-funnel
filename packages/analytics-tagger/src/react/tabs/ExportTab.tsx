import { useContext, useState } from 'react';
import { TaggerContext } from '../AnalyticsTagger';
import { downloadSpec, copyText } from '../../core/client';
import { renderAmplitudeCall, renderTrackingPlan } from '../../core/naming';

export function ExportTab() {
  const ctx = useContext(TaggerContext)!;
  const [copied, setCopied] = useState<'calls' | 'plan' | null>(null);

  const flash = (which: 'calls' | 'plan') => {
    setCopied(which);
    setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
  };

  const copyCalls = async () => {
    await copyText(ctx.spec.events.map(renderAmplitudeCall).join('\n'));
    flash('calls');
  };
  const copyPlan = async () => {
    await copyText(renderTrackingPlan(ctx.spec));
    flash('plan');
  };

  return (
    <div className="aftag-tab-body">
      <button type="button" className="aftag-btn aftag-btn-primary" onClick={() => downloadSpec(ctx.spec)}>Download JSON</button>
      <button type="button" className="aftag-btn" onClick={copyCalls}>{copied === 'calls' ? 'Copied' : 'Copy Amplitude calls'}</button>
      <button type="button" className="aftag-btn" onClick={copyPlan}>{copied === 'plan' ? 'Copied' : 'Copy tracking plan'}</button>
    </div>
  );
}
