import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Loader2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GRIEVANCE_CATEGORIES, PRIORITIES, TELANGANA_DISTRICTS } from "@/lib/constants";
import { getFormOptions, submitGrievance } from "@/lib/public.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/grievance")({
  head: () => ({
    meta: [
      { title: "Submit a Grievance — Aadhaar Training Support" },
      {
        name: "description",
        content:
          "Single-page grievance form for Aadhaar training operators: operator details, training details and grievance details.",
      },
      { property: "og:title", content: "Submit a Grievance — Aadhaar Training Support" },
      {
        property: "og:description",
        content: "Submit a training grievance on one page and receive a grievance ID instantly.",
      },
    ],
  }),
  component: GrievancePage,
});

type FormState = {
  operator_name: string;
  operator_id: string;
  mobile_number: string;
  centre_name: string;
  district: string;
  training_location: string;
  trainer_id: string;
  training_date: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
};

const EMPTY: FormState = {
  operator_name: "",
  operator_id: "",
  mobile_number: "",
  centre_name: "",
  district: "",
  training_location: "",
  trainer_id: "",
  training_date: "",
  category: "",
  subject: "",
  description: "",
  priority: "Medium",
};

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <header className="mb-4 border-b border-border pb-3">
        <h2 className="font-display text-base font-semibold tracking-wide uppercase">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const selectClass =
  "h-12 w-full rounded-lg border border-input bg-surface px-3 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function GrievancePage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const optionsFn = useServerFn(getFormOptions);
  const { data: options } = useQuery({ queryKey: ["form-options"], queryFn: () => optionsFn() });

  const submitFn = useServerFn(submitGrievance);
  const mutation = useMutation({
    mutationFn: async () => {
      let attachment: { name: string; type: string; dataBase64: string } | null = null;
      if (file) {
        const buffer = await file.arrayBuffer();
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
        attachment = { name: file.name, type: file.type, dataBase64: btoa(binary) };
      }
      return submitFn({ data: { ...form, priority: form.priority as "Low", attachment } });
    },
    onSuccess: (result) => setCreatedId(result.grievance_id),
    onError: (error: Error) =>
      toast.error(error.message || "Could not submit the grievance. Please try again."),
  });

  const locations = useMemo(
    () => (options?.locations ?? []).filter((l) => l.district === form.district),
    [options, form.district],
  );
  const trainers = options?.trainers ?? [];

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const req = (key: keyof FormState, label: string) => {
      if (!form[key]?.trim()) next[key] = `${label} is required`;
    };
    req("operator_name", "Operator name");
    req("operator_id", "Operator ID");
    req("mobile_number", "Mobile number");
    req("centre_name", "Enrolment centre / agency");
    req("district", "District");
    req("training_location", "Training location");
    req("trainer_id", "Trainer name");
    req("training_date", "Training date");
    req("category", "Category");
    req("subject", "Subject");
    req("description", "Description");
    if (form.mobile_number && !/^[6-9]\d{9}$/.test(form.mobile_number.trim()))
      next["mobile_number"] = "Enter a valid 10-digit mobile number";
    if (form.subject.trim().length > 0 && form.subject.trim().length < 4)
      next["subject"] = "Subject is too short";
    if (form.description.trim().length > 0 && form.description.trim().length < 10)
      next["description"] = "Please describe the issue in at least 10 characters";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    mutation.mutate();
  };

  if (createdId) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-xl text-center">
          <CheckCircle2 className="mx-auto size-14 text-success" />
          <h1 className="mt-4 font-display text-2xl font-semibold">
            Grievance Submitted Successfully
          </h1>
          <p className="mt-6 text-sm text-muted-foreground">Your Grievance ID</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-wide text-primary">
            {createdId}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Please save this ID to track your grievance.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/track" search={{ id: createdId }}>
                Track Grievance
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setForm(EMPTY);
                setFile(null);
                setCreatedId(null);
              }}
            >
              Submit Another Grievance
            </Button>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl">
        <Link
          to="/operator"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 size-4" /> Back
        </Link>

        <h1 className="mt-4 font-display text-2xl font-semibold">Submit Grievance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete all sections below and submit. You will receive a grievance ID immediately.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          <Section title="Operator Details" description="Who is raising this grievance.">
            <Field label="Operator Name" required error={errors["operator_name"]}>
              <Input
                className="h-12 text-base"
                value={form.operator_name}
                onChange={(e) => set("operator_name", e.target.value)}
                placeholder="Full name"
              />
            </Field>
            <Field label="Operator ID" required error={errors["operator_id"]}>
              <Input
                className="h-12 text-base"
                value={form.operator_id}
                onChange={(e) => set("operator_id", e.target.value)}
                placeholder="Your operator / supervisor ID"
              />
            </Field>
            <Field label="Mobile Number" required error={errors["mobile_number"]}>
              <Input
                className="h-12 text-base"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile_number}
                onChange={(e) => set("mobile_number", e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile number"
              />
            </Field>
            <Field label="Enrolment Centre / Agency" required error={errors["centre_name"]}>
              <Input
                className="h-12 text-base"
                value={form.centre_name}
                onChange={(e) => set("centre_name", e.target.value)}
                placeholder="Centre or agency name"
              />
            </Field>
          </Section>

          <Section title="Training Details" description="Where and with whom the training happened.">
            <Field label="Telangana District" required error={errors["district"]}>
              <select
                className={selectClass}
                value={form.district}
                onChange={(e) => {
                  set("district", e.target.value);
                  set("training_location", "");
                }}
              >
                <option value="">Select district</option>
                {TELANGANA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Training Location" required error={errors["training_location"]}>
              <select
                className={selectClass}
                value={form.training_location}
                disabled={!form.district}
                onChange={(e) => set("training_location", e.target.value)}
              >
                <option value="">
                  {form.district ? "Select training location" : "Select a district first"}
                </option>
                {locations.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trainer Name" required error={errors["trainer_id"]}>
              <select
                className={selectClass}
                value={form.trainer_id}
                onChange={(e) => set("trainer_id", e.target.value)}
              >
                <option value="">Select trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Your grievance goes only to the trainer you select here.
              </p>
            </Field>
            <Field label="Training Date" required error={errors["training_date"]}>
              <Input
                type="date"
                className="h-12 text-base"
                max={new Date().toISOString().slice(0, 10)}
                value={form.training_date}
                onChange={(e) => set("training_date", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Grievance Details" description="Describe the issue you faced.">
            <Field label="Category" required error={errors["category"]}>
              <select
                className={selectClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Select category</option>
                {GRIEVANCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject" required error={errors["subject"]}>
              <Input
                className="h-12 text-base"
                maxLength={160}
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="Short summary of the issue"
              />
            </Field>
            <Field
              label="Description"
              required
              error={errors["description"]}
              className="sm:col-span-2"
            >
              <Textarea
                rows={6}
                maxLength={4000}
                className="text-base"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the issue with dates and details"
              />
            </Field>
            <Field label="Priority">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("priority", p)}
                    className={cn(
                      "h-12 rounded-lg border text-sm font-medium transition-colors",
                      form.priority === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-surface hover:bg-muted",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Attachment (optional)">
              <label className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">
                <Upload className="size-4 shrink-0" />
                <span className="truncate">{file ? file.name : "Attach a photo or document"}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const picked = e.target.files?.[0] ?? null;
                    if (picked && picked.size > 4 * 1024 * 1024) {
                      toast.error("Please attach a file smaller than 4 MB.");
                      return;
                    }
                    setFile(picked);
                  }}
                />
              </label>
            </Field>
          </Section>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto sm:min-w-56"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Submit Grievance
            </Button>
          </div>
        </form>
      </div>
    </PublicShell>
  );
}
