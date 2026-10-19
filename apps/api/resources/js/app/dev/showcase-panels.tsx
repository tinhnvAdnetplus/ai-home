import { Button } from '@/shared/ui/Button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/shared/ui/Card';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/shared/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/Tabs';

export function ShowcasePanels(): React.JSX.Element {
    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Tabs</h3>
                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="disabled" disabled>
                            Disabled
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="overview"
                        className="p-4 border rounded-md"
                    >
                        <p className="text-sm text-foreground">
                            Overview tab content panel.
                        </p>
                    </TabsContent>
                    <TabsContent
                        value="analytics"
                        className="p-4 border rounded-md"
                    >
                        <p className="text-sm text-foreground">
                            Analytics tab content panel.
                        </p>
                    </TabsContent>
                </Tabs>
            </section>

            <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">
                    Card & Dialog
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Summary</CardTitle>
                            <CardDescription>
                                Key architecture and configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Token-driven components with full dark mode and
                                accessibility support.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm">Action</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dialog Modal</CardTitle>
                            <CardDescription>
                                Radix Dialog with focus trap
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        Open Dialog
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Example Dialog
                                        </DialogTitle>
                                        <DialogDescription>
                                            This modal traps focus and closes
                                            with Escape or Close button.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-2 text-sm text-foreground">
                                        Accessible dialog content preview.
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="secondary">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button>Confirm</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
