import DesignerUpload from "./DesignerUpload";
import DesignerResults from "./DesignerResults";

export const metadata = {
  title: "Designer Validator | AI-BOS",
  description: "Validate Figma designs against AI-BOS design system rules",
};

export default function DesignerPanelPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-bg)] p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--text-fg)] mb-2">
            🎨 AI-BOS Designer Validator
          </h1>
          <p className="text-[var(--text-fg-muted)]">
            Upload Figma exports and validate against design system rules.
            Supports multi-tenant themes.
          </p>
        </header>

        <DesignerUpload />
        <DesignerResults />
      </div>
    </div>
  );
}

