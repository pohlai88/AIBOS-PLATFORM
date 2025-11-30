export default function DocsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">AIBOS Design System Documentation</h1>
        <p className="text-lg text-gray-600 mb-8">
          Complete documentation for the AIBOS design system, components, tokens, and integration guides.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Documentation is currently being migrated. The markdown files are available in the <code className="bg-blue-100 px-2 py-1 rounded">pages/</code> directory.
          </p>
        </div>
      </div>
    </div>
  );
}

