import { Button } from './button';

export function ButtonExample() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Variants */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
            </div>

            {/* Sizes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </div>

            {/* States */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
                <Button fullWidth>Full Width</Button>
            </div>
        </div>
    );
}