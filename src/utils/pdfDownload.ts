/**
 * Generates a valid, downloadable single-page PDF 1.4 document in client memory
 * for sample school notices, academic circulars, and fee/calendar bulletins.
 */
function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLines(text: string, maxChars = 78): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        lines.push(current.trim());
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) lines.push(current.trim());
  }
  return lines;
}

export function downloadSampleNoticePdf(params: {
  schoolName: string;
  address: string;
  title: string;
  category: string;
  dateLabel: string;
  body: string;
  fileName?: string;
}) {
  const { schoolName, address, title, category, dateLabel, body, fileName } = params;
  const wrappedTitle = wrapLines(title, 60);
  const wrappedBody = wrapLines(body, 78).slice(0, 26);

  const ops: string[] = [
    'BT',
    '/F2 15 Tf',
    '54 745 Td',
    `(${escapePdfText(schoolName)}) Tj`,
    '/F1 9 Tf',
    '0 -16 Td',
    `(${escapePdfText(address)}) Tj`,
    '0 -18 Td',
    `(${escapePdfText(`OFFICIAL SCHOOL NOTICE  |  Category: ${category}  |  Date: ${dateLabel}`)}) Tj`,
    '0 -28 Td',
    '/F2 13 Tf',
  ];

  for (const line of wrappedTitle) {
    ops.push(`(${escapePdfText(line)}) Tj`);
    ops.push('0 -18 Td');
  }

  ops.push('0 -10 Td');
  ops.push('/F1 11 Tf');

  for (const line of wrappedBody) {
    ops.push(`(${escapePdfText(line)}) Tj`);
    ops.push('0 -16 Td');
  }

  ops.push('0 -24 Td');
  ops.push('/F1 9 Tf');
  ops.push('(Generated locally as a sample demonstration document. Not an official signed record.) Tj');
  ops.push('ET');

  const streamContent = ops.join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
