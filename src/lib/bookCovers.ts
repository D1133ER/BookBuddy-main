type CoverPalette = {
  background: string;
  panel: string;
  accent: string;
  text: string;
  muted: string;
};

const coverPalettes: CoverPalette[] = [
  {
    background: "#171B3A",
    panel: "#F8FAFC",
    accent: "#6D6AF8",
    text: "#111827",
    muted: "#CBD5E1",
  },
  {
    background: "#0F3D3E",
    panel: "#F0FDFA",
    accent: "#14B8A6",
    text: "#0F172A",
    muted: "#99F6E4",
  },
  {
    background: "#4C1D95",
    panel: "#F5F3FF",
    accent: "#8B5CF6",
    text: "#1F2937",
    muted: "#DDD6FE",
  },
  {
    background: "#7C2D12",
    panel: "#FFF7ED",
    accent: "#F97316",
    text: "#111827",
    muted: "#FED7AA",
  },
  {
    background: "#0F172A",
    panel: "#F8FAFC",
    accent: "#38BDF8",
    text: "#0F172A",
    muted: "#BFDBFE",
  },
  {
    background: "#3F1D2E",
    panel: "#FFF1F2",
    accent: "#F43F5E",
    text: "#1F2937",
    muted: "#FECDD3",
  },
  {
    background: "#1F2937",
    panel: "#F9FAFB",
    accent: "#F59E0B",
    text: "#111827",
    muted: "#FDE68A",
  },
  {
    background: "#1C1917",
    panel: "#FAFAF9",
    accent: "#22C55E",
    text: "#111827",
    muted: "#BBF7D0",
  },
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const splitTitleLines = (title: string, maxCharacters = 16) => {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharacters || currentLine.length === 0) {
      currentLine = candidate;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
};

const toDataUri = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

export const createBookCoverDataUri = ({
  title,
  author,
  category,
  paletteIndex,
}: {
  title: string;
  author: string;
  category: string;
  paletteIndex: number;
}) => {
  const palette = coverPalettes[paletteIndex % coverPalettes.length];
  const titleLines = splitTitleLines(title);
  const escapedAuthor = escapeXml(author);
  const escapedCategory = escapeXml(category.toUpperCase());
  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<text x="48" y="${176 + index * 42}" font-family="Verdana,Arial,sans-serif" font-size="30" font-weight="700" fill="${palette.text}">${escapeXml(line)}</text>`,
    )
    .join("");

  return toDataUri(`
    <svg width="320" height="480" viewBox="0 0 320 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="480" rx="28" fill="${palette.background}"/>
      <rect x="22" y="22" width="18" height="436" rx="9" fill="${palette.accent}" fill-opacity="0.88"/>
      <rect x="56" y="44" width="228" height="392" rx="24" fill="${palette.panel}"/>
      <circle cx="248" cy="98" r="36" fill="${palette.muted}"/>
      <path d="M220 98C220 83.6406 231.641 72 246 72H268V160H242C229.85 160 220 150.15 220 138V98Z" fill="${palette.accent}"/>
      <path d="M96 116H188" stroke="${palette.text}" stroke-opacity="0.15" stroke-width="10" stroke-linecap="round"/>
      ${titleMarkup}
      <rect x="48" y="324" width="150" height="32" rx="16" fill="${palette.muted}"/>
      <text x="63" y="345" font-family="Verdana,Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="${palette.text}" fill-opacity="0.76">${escapedCategory}</text>
      <text x="48" y="396" font-family="Verdana,Arial,sans-serif" font-size="16" font-weight="600" fill="${palette.text}" fill-opacity="0.84">${escapedAuthor}</text>
      <path d="M48 412H214" stroke="${palette.text}" stroke-opacity="0.18" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `);
};