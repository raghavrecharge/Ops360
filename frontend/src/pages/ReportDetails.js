import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsAPI.getOne(id).then(res => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!report) return <div>Report not found</div>;

  /* ===================== EXCEL ===================== */
  const downloadExcel = () => {
    const rows = Object.entries(report).map(([key, value]) => ({
      Field: key.replace(/_/g, ' '),
      Value: typeof value === 'object' ? JSON.stringify(value) : value,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 25 }, { wch: 60 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `report_${report.id}.xlsx`);
  };

  /* ===================== PDF ===================== */
  const downloadPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(`Report #${report.id}`, 14, 15);

    let y = 30;
    pdf.setFontSize(11);

    pdf.text('Field', 14, y);
    pdf.text('Value', 80, y);
    y += 6;
    pdf.line(14, y - 4, 195, y - 4);

    Object.entries(report).forEach(([key, value]) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(key.replace(/_/g, ' '), 14, y);
      pdf.text(
        typeof value === 'object' ? JSON.stringify(value) : String(value),
        80,
        y,
        { maxWidth: 110 }
      );

      y += 8;
    });

    pdf.save(`report_${report.id}.pdf`);
  };

  /* ===================== WORD ===================== */
  const downloadWord = async () => {
    const paragraphs = [
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `Report #${report.id}`,
            bold: true,
            size: 36,
          }),
        ],
      }),
    ];

    Object.entries(report).forEach(([key, value]) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `${key.replace(/_/g, ' ')}: `,
              bold: true,
            }),
            new TextRun(
              typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)
            ),
          ],
        })
      );
    });

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `report_${report.id}.docx`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Report #{report.id}</h1>
        <div className="flex gap-2">
          <Button onClick={downloadExcel}>Excel</Button>
          <Button onClick={downloadPDF}>PDF</Button>
          <Button onClick={downloadWord}>Word</Button>
          <Button onClick={() => navigate(`/reports/${id}/edit`)}>Edit</Button>
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            Back
          </Button>
        </div>
      </div>

      {/* Clean UI */}
      <div className="overflow-hidden rounded border">
        <table className="w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-3 border">Field</th>
              <th className="text-left p-3 border">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report).map(([key, value]) => (
              <tr key={key} className="hover:bg-slate-50">
                <td className="p-3 border font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </td>
                <td className="p-3 border">
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDetails;
