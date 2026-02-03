import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export function ShadcnTest() {
  const { toast } = useToast()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>shadcn/ui Component Test</CardTitle>
        <CardDescription>All 11 components installed successfully</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-input">Input</Label>
          <Input id="test-input" placeholder="Test input" />
        </div>

        <div>
          <Label htmlFor="test-textarea">Textarea</Label>
          <Textarea id="test-textarea" placeholder="Test textarea" />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="test-checkbox" />
          <Label htmlFor="test-checkbox">Test checkbox</Label>
        </div>

        <RadioGroup defaultValue="option1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="option1" />
            <Label htmlFor="option1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="option2" />
            <Label htmlFor="option2">Option 2</Label>
          </div>
        </RadioGroup>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>

        <div>
          <Label>Progress</Label>
          <Progress value={66} />
        </div>

        <Button onClick={() => toast({ title: "Toast test", description: "Toast component working!" })}>
          Test Toast
        </Button>
      </CardContent>
    </Card>
  )
}
