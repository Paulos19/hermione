import { NextResponse } from 'next/server';
import HTMLtoDOCX from 'html-to-docx';

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Prepare HTML content for DOCX (wrap in body to ensure valid structure)
    const docxHtml = `<!DOCTYPE html><html><body>${html}</body></html>`;

    // Generate DOCX buffer
    const fileBuffer = await HTMLtoDOCX(docxHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // Return the response as a downloadable file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="document.docx"',
      },
    });

  } catch (error: any) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate DOCX' }, { status: 500 });
  }
}
