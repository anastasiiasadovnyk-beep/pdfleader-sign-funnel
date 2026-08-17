/**
 * Real file downloads, so the browser runs its own download indicator (Chrome's
 * toolbar animation and download bubble) instead of us faking one — that chrome
 * belongs to the browser and only appears for an actual download.
 *
 * The prototype has no signing service, so the bytes are a minimal one-page PDF
 * built here. It is a valid document with a real xref table, so it opens in a
 * viewer rather than erroring — a broken file would derail a usability test.
 * On integration, point `href` at the signed file from the signing service and
 * delete `buildPdf`.
 */

const ESCAPE = /[()\\]/g;

function buildPdf(lines: string[]): Blob {
  const text = lines
    .map((line, index) => `BT /F1 ${index === 0 ? 20 : 12} Tf 64 ${720 - index * 28} Td (${line.replace(ESCAPE, '\\$&')}) Tj ET`)
    .join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefAt = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;

  return new Blob([pdf], { type: 'application/pdf' });
}

/** Hands the browser a file to save, which is what starts its download UI. */
export function downloadPdf(fileName: string, lines: string[]): void {
  const url = URL.createObjectURL(buildPdf(lines));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  // Let the download start before the blob URL goes away.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
