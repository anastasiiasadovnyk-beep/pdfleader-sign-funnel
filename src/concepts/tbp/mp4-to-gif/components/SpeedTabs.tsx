import { TabsList, TabsRoot, TabsTrigger } from '@universe-forma/ui-pes';
import type { Option } from '../types';

type SpeedTabsProps = {
  options: Option[];
  value: string;
  onValueChange: (id: string) => void;
};

/** Segmented control for playback speed — ui-pes Tabs (grey, md). Each trigger
 * flexes to an equal share so the row fills the field width like the reference. */
export default function SpeedTabs({ options, value, onValueChange }: SpeedTabsProps) {
  return (
    <TabsRoot
      value={value}
      onValueChange={onValueChange}
      color="grey"
      size="sm"
      transparent={false}
      scrollable={false}
    >
      <TabsList data-ff="speed-tabs" className="w-full">
        {options.map((o) => (
          <TabsTrigger key={o.id} value={o.id} className="min-w-0 flex-1 px-0">
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </TabsRoot>
  );
}
