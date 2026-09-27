import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useSession } from "@/lib/auth-client";
import { ShieldCheck, UserCheck } from "lucide-react";
import type { WizardStepProps } from "../../types";

export function StepContact({ state, update }: WizardStepProps) {
  const { data: session } = useSession();

  // Auto-fill from authenticated Better Auth session
  useEffect(() => {
    if (session?.user) {
      const names = (session.user.name || "").split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      if (!state.email && session.user.email) {
        update({
          email: session.user.email,
          firstName: state.firstName || firstName,
          lastName: state.lastName || lastName,
        });
      }
    }
  }, [session, state.email, state.firstName, state.lastName, update]);
  return (
    <div className="space-y-4">
      {session?.user ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck size={16} className="text-emerald-400 shrink-0" />
            <span>
              Booking as <strong>{session.user.name}</strong> ({session.user.email})
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
            Profile Auto-Filled
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-400 shrink-0" />
            <span>Have an account? Log in for 1-click booking and saved invoicing.</span>
          </div>
          <a href="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline text-[11px]">
            Sign in
          </a>
        </div>
      )}

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
