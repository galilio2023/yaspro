import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { WizardStepProps } from "../../types";

export function StepContact({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="First Name" required>
          <Input
            required
            value={state.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="John"
          />
        </FormField>
        <FormField label="Last Name" required>
          <Input
            required
            value={state.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            placeholder="Doe"
          />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Email" required>
          <Input
            required
            type="email"
            value={state.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="john@company.com"
          />
        </FormField>
        <FormField label="Phone / WhatsApp" required>
          <Input
            required
            type="tel"
            value={state.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+971 50 000 0000"
          />
        </FormField>
      </div>

      <FormField label="Company / Production Name">
        <Input
          value={state.company}
          onChange={(e) => update({ company: e.target.value })}
          placeholder="Optional company or production name"
        />
      </FormField>

      <FormField label="Special Requests">
        <Textarea
          rows={3}
          value={state.specialRequests}
          onChange={(e) => update({ specialRequests: e.target.value })}
          placeholder="Any dietary restrictions for crew, green room needs, or VIP access requirements..."
        />
      </FormField>
    </div>
  );
}
