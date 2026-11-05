export type ActivityNoteType = "CALL" | "WHATSAPP" | "INTERNAL" | "EMAIL";

export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string" || !name.trim()) return "AS";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function parseNoteContent(
  rawContent: string,
  defaultType: ActivityNoteType = "INTERNAL",
): {
  type: ActivityNoteType;
  title: string;
  cleanContent: string;
} {
  if (!rawContent || typeof rawContent !== "string") {
    return {
      type: defaultType,
      title: formatNoteTypeTitle(defaultType),
      cleanContent: "",
    };
  }

  const match = rawContent.match(
    /^\[(Call Note|WhatsApp Note|Internal Note|Email Note)\]\s*([\s\S]*)$/i,
  );
  if (match) {
    const matchedLabel = match[1].toLowerCase();
    const cleanContent = match[2].trim();
    if (matchedLabel.includes("call")) {
      return { type: "CALL", title: "Call Note", cleanContent };
    }
    if (matchedLabel.includes("whatsapp")) {
      return { type: "WHATSAPP", title: "WhatsApp Note", cleanContent };
    }
    if (matchedLabel.includes("email")) {
      return { type: "EMAIL", title: "Email Note", cleanContent };
    }
    return { type: "INTERNAL", title: "Internal Note", cleanContent };
  }

  return {
    type: defaultType,
    title: formatNoteTypeTitle(defaultType),
    cleanContent: rawContent.trim(),
  };
}

export function formatNoteTypeTitle(type: ActivityNoteType): string {
  switch (type) {
    case "CALL":
      return "Call Note";
    case "WHATSAPP":
      return "WhatsApp Note";
    case "EMAIL":
      return "Email Note";
    case "INTERNAL":
    default:
      return "Internal Note";
  }
}

export function formatCardDateHeading(dateString?: string | null): {
  formattedDate: string;
  tag?: string;
} {
  if (!dateString) return { formattedDate: "Date unavailable" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { formattedDate: "Date unavailable" };

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 0) {
    return { formattedDate, tag: "(Upcoming)" };
  }
  if (diffDays === 0) {
    return { formattedDate, tag: "(Today)" };
  }
  return { formattedDate };
}

export function formatActivityTimestamp(dateString?: string | null): string {
  if (!dateString) return "Time unavailable";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const datePart = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();

  return `${datePart}, ${timePart}`;
}

