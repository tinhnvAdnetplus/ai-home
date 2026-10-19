import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { FormField } from '@/shared/ui/FormField';
import { Checkbox } from '@/shared/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/RadioGroup';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/shared/ui/Select';
import { Badge } from '@/shared/ui/Badge';
import { Label } from '@/shared/ui/Label';

export function ShowcaseControls(): React.JSX.Element {
    const [isChecked, setIsChecked] = useState(true);
    const [selectedRadio, setSelectedRadio] = useState('a');
    const [selectedSelect, setSelectedSelect] = useState('opt1');

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Buttons</h3>
                <div className="flex flex-wrap gap-2 items-center">
                    <Button variant="default">Default</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Badges</h3>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">
                    Form Inputs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        id="demo-name"
                        label="Full Name"
                        hint="As shown on ID"
                    >
                        <Input placeholder="Taro Yamada" />
                    </FormField>
                    <FormField
                        id="demo-err"
                        label="Email"
                        error="Invalid email address"
                    >
                        <Input defaultValue="invalid@" />
                    </FormField>
                    <FormField
                        id="demo-textarea"
                        label="Notes"
                        hint="Optional notes"
                    >
                        <Textarea placeholder="Type message..." />
                    </FormField>
                    <div className="space-y-2">
                        <Label htmlFor="demo-select">Select Option</Label>
                        <Select
                            value={selectedSelect}
                            onValueChange={setSelectedSelect}
                        >
                            <SelectTrigger id="demo-select">
                                <SelectValue placeholder="Choose option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="opt1">Option 1</SelectItem>
                                <SelectItem value="opt2">Option 2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">
                    Checkboxes & Radios
                </h3>
                <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="demo-check"
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                                setIsChecked(Boolean(checked));
                            }}
                        />
                        <Label htmlFor="demo-check">Remember me</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="demo-check-dis"
                            disabled
                            checked={false}
                        />
                        <Label htmlFor="demo-check-dis">Disabled</Label>
                    </div>
                    <RadioGroup
                        value={selectedRadio}
                        onValueChange={setSelectedRadio}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="a" id="ra" />
                            <Label htmlFor="ra">Choice A</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="b" id="rb" />
                            <Label htmlFor="rb">Choice B</Label>
                        </div>
                    </RadioGroup>
                </div>
            </section>
        </div>
    );
}
