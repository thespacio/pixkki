import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";

export default function Page() {
    return(
        <Card className="border rounded-2xl shadow-none">

            <CardHeader>
                <CardTitle>Patient Intake</CardTitle>
                <CardDescription>
                    Basic information recorded when the animal enters the shelter.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

                <div className="grid grid-cols-2 gap-5">

                    <div>
                        <label>Estimated Age</label>

                        <Input placeholder="Example: 2 years" />
                    </div>

                    <div>
                        <label>Origin</label>

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select origin"/>
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="street">Street Rescue</SelectItem>
                                <SelectItem value="owner">Owner Surrender</SelectItem>
                                <SelectItem value="transfer">Transferred</SelectItem>
                                <SelectItem value="authority">Animal Control</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>

                        </Select>

                    </div>

                </div>

                <div>

                    <label>Physical Characteristics</label>

                    <Textarea
                        rows={4}
                        placeholder="Color, size, coat, scars, collar, identifying marks..."
                    />

                </div>

                <div>

                    <label>Initial Condition</label>

                    <Textarea
                        rows={5}
                        placeholder="Describe how the patient arrived..."
                    />

                </div>

                <div className="flex items-center justify-between rounded-xl bg-muted p-4">

                    <div>

                        <p className="font-medium">
                            Quarantine
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Every new patient starts in quarantine.
                        </p>

                    </div>

                    <Switch checked disabled />

                </div>

                <div className="rounded-xl border p-4 bg-muted/30">

                    <p className="text-sm">

                        UUID and Shelter ID are automatically generated after registration.

                    </p>

                </div>

            </CardContent>

        </Card>
    )
}