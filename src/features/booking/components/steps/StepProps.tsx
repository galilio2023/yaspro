import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { WizardStepProps } from "../../types";

export function StepProps({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm leading-relaxed mb-2">
        Let us know if you need custom set styling, backdrop colors, brand logos printed on set, or specialized furniture.
      </p>

      <FormField label="Props & Set Design Instructions">
        <Textarea
          rows={4}
          value={state.propsNotes}
          onChange={(e) => update({ propsNotes: e.target.value })}
          placeholder="E.g., Leather armchairs, RGB neon tube backlights, wooden table, corporate banner display..."
        />
      </FormField>
    </div>
  );
}
