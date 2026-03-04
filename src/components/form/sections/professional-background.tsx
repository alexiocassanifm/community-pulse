"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import type { ExperienceLevel, ProfessionalBackground } from "@/types/database.types";
import { PROFESSIONAL_ROLES } from "@/constants/professional-roles";
import type { ProfessionalRoleValue } from "@/constants/professional-roles";
import { INDUSTRIES } from "@/constants/industries";
import type { IndustryValue } from "@/constants/industries";
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

const BACKGROUND_TYPES = [
  { value: "tech", label: "Tech / Engineering" },
  { value: "business", label: "Business / Management" },
  { value: "design", label: "Design / Creative" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-Level (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "lead", label: "Lead (10+ years)" },
  { value: "executive", label: "Executive / C-Level" },
];

export function ProfessionalBackground({ form }: ProfessionalBackgroundProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const backgroundType = watch("professional_background.professional_background");
  const experienceLevel = watch("professional_background.experience_level");
  const professionalRole = watch("professional_background.professional_role");
  const industry = watch("professional_background.industry");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Professional Background</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help us understand your professional context.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="professional_role">Current Role <span className="text-destructive">*</span></Label>
          <Select
            value={professionalRole || ""}
            onValueChange={(value) => {
              setValue(
                "professional_background.professional_role",
                value as ProfessionalRoleValue,
                { shouldDirty: true, shouldValidate: true }
              );
              if (value !== "other") {
                setValue("professional_background.professional_role_other", "", {
                  shouldValidate: true,
                });
              }
            }}
          >
            <SelectTrigger id="professional_role">
              <SelectValue placeholder="Select your current role" />
            </SelectTrigger>
            <SelectContent>
              {PROFESSIONAL_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.professional_background?.professional_role && (
            <p className="text-sm text-destructive">{errors.professional_background.professional_role.message}</p>
          )}
        </div>

        {professionalRole === "other" && (
          <div className="space-y-2">
            <Label htmlFor="professional_role_other">Please specify your role <span className="text-destructive">*</span></Label>
            <Input
              id="professional_role_other"
              placeholder="Enter your role"
              {...register("professional_background.professional_role_other")}
            />
            {errors.professional_background?.professional_role_other && (
              <p className="text-sm text-destructive">{errors.professional_background.professional_role_other.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="professional_background_type">Background Type <span className="text-destructive">*</span></Label>
          <Select
            value={backgroundType || ""}
            onValueChange={(value) =>
              setValue(
                "professional_background.professional_background",
                value as ProfessionalBackground,
                { shouldDirty: true, shouldValidate: true }
              )
            }
          >
            <SelectTrigger id="professional_background_type">
              <SelectValue placeholder="Select your background type" />
            </SelectTrigger>
            <SelectContent>
              {BACKGROUND_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.professional_background?.professional_background && (
            <p className="text-sm text-destructive">{errors.professional_background.professional_background.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience Level <span className="text-destructive">*</span></Label>
          <Select
            value={experienceLevel || ""}
            onValueChange={(value) =>
              setValue(
                "professional_background.experience_level",
                value as ExperienceLevel,
                { shouldDirty: true, shouldValidate: true }
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
          {errors.professional_background?.experience_level && (
            <p className="text-sm text-destructive">{errors.professional_background.experience_level.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
          <Select
            value={industry || ""}
            onValueChange={(value) => {
              setValue(
                "professional_background.industry",
                value as IndustryValue,
                { shouldDirty: true, shouldValidate: true }
              );
              if (value !== "other") {
                setValue("professional_background.industry_other", "", {
                  shouldValidate: true,
                });
              }
            }}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.professional_background?.industry && (
            <p className="text-sm text-destructive">{errors.professional_background.industry.message}</p>
          )}
        </div>

        {industry === "other" && (
          <div className="space-y-2">
            <Label htmlFor="industry_other">Please specify your industry <span className="text-destructive">*</span></Label>
            <Input
              id="industry_other"
              placeholder="Enter your industry"
              {...register("professional_background.industry_other")}
            />
            {errors.professional_background?.industry_other && (
              <p className="text-sm text-destructive">{errors.professional_background.industry_other.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
