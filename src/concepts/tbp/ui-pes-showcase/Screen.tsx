import { Button, Badge, Input, Switch } from '@universe-forma/ui-pes';
import type { ShowcaseProps } from './types';

export default function Screen({ title }: ShowcaseProps) {
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-10 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-desktop-title-4">{title}</h1>
        <p className="text-body text-text-secondary">
          ui-pes components rendered in this product's brand.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-subtitle-emph">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="filled">Filled</Button>
          <Button variant="filled-tonal">Tonal</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="upsale">Upsale</Button>
          <Button variant="filled" disabled>
            Disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="filled" size="sm">
            Small
          </Button>
          <Button variant="filled" size="md">
            Medium
          </Button>
          <Button variant="filled" size="lg">
            Large
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-subtitle-emph">Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge type="badge" color="primary">
            Primary
          </Badge>
          <Badge type="badge" color="success">
            Success
          </Badge>
          <Badge type="badge" color="warning">
            Warning
          </Badge>
          <Badge type="badge" color="error">
            Error
          </Badge>
          <Badge type="badge" color="grey">
            Neutral
          </Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-subtitle-emph">Inputs</h2>
        <div className="flex max-w-[360px] flex-col gap-3">
          <Input size="lg" bg="default" label="Email" placeholder="you@example.com" />
          <Input
            size="lg"
            bg="default"
            placeholder="With error"
            isError
            errorMessage="Required field"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-subtitle-emph">Switches</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Switch color="primary" size="md" labelRight="Primary" defaultChecked />
          <Switch color="action" size="sm" labelRight="Action" />
        </div>
      </section>
    </div>
  );
}
