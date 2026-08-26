interface ReportContentProps {
  content: string;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ReportContent({ content }: ReportContentProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="list-disc list-outside mr-5 space-y-1.5 my-3 text-gray-200">
        {listItems.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-cyan-300 mt-5 mb-2">
          {trimmed.slice(4)}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={key++}
          className="text-lg font-bold text-white mt-6 mb-3 pb-2 border-b border-gray-600"
        >
          {trimmed.slice(3)}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-xl font-bold text-cyan-400 mb-4 leading-snug">
          {trimmed.slice(2)}
        </h1>,
      );
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    elements.push(
      <p key={key++} className="text-gray-200 leading-relaxed my-2.5 text-[15px]">
        {renderInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return (
    <article dir="rtl" className="report-content text-right">
      {elements}
    </article>
  );
}
