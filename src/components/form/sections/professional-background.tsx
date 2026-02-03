"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfessionalBackgroundProps {
  form: UseFormReturn<AnonymousFormData>;
}

const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-Level (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "lead", label: "Lead (10+ years)" },
  { value: "executive", label: "Executive / C-Level" },
];

export function ProfessionalBackground({ form }: ProfessionalBackgroundProps) {
  const { register, setValue, watch } = form;
  const experienceLevel = watch("professional_background.experience_level");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Professional Background</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help us understand your professional context. All fields are optional.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="professional_role">Current Role</Label>
          <Input
            id="professional_role"
            placeholder="e.g. Software Engineer, Product Manager"
            {...register("professional_background.professional_role")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience Level</Label>
          <Select
            value={experienceLevel || ""}
            onValueChange={(value) =>
              setValue(
                "professional_background.experience_level",
                value as AnonymousFormData["professional_background"] extends { experience_level?: infer T } ? T : never,
                { shouldDirty: true }
              )
            }
          >
            <SelectTrigger id="experience_level">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g. Tech, Finance, Healthcare"
            {...register("professional_background.industry")}
          />
        </div>
      </div>
    </div>
  );
}
