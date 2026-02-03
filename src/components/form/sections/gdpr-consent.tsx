"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface GdprConsentProps {
  form: UseFormReturn<AnonymousFormData>;
}

export function GdprConsent({ form }: GdprConsentProps) {
  const { setValue, watch } = form;
  const isAcknowledged = watch("gdpr.data_retention_acknowledged");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Privacy & Data Usage</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We value your privacy. Your responses are completely anonymous and
          help us create better meetup events.
        </p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Your data is stored anonymously</li>
            <li>No personal identifiers are collected</li>
            <li>Data is retained for 12 months</li>
            <li>You can request deletion at any time</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="data_retention_acknowledged"
          checked={isAcknowledged || false}
          onCheckedChange={(checked) =>
            setValue("gdpr.data_retention_acknowledged", checked === true, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="data_retention_acknowledged"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I understand that my anonymous preferences will be stored and used
            to improve event planning
          </Label>
          <p className="text-sm text-muted-foreground">
            By checking this box, you acknowledge that your responses will be
            stored securely and used only for improving meetup events.
          </p>
        </div>
      </div>
    </div>
  );
}
