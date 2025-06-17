
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToImage = async (elementId: string, fileName: string = 'great7-export.png'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for export');
    alert('Error: Could not find content to export.');
    return;
  }

  try {
    const canvas = await html2canvas(element, { 
      useCORS: true,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1a202c' : '#f7fafc', // Match dark/light bg
      scale: 2 // Increase scale for better resolution
    });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to image:', error);
    alert('An error occurred while exporting the image.');
  }
};

export const exportToPDF = async (elementId: string, fileName: string = 'great7-export.pdf', title?: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export');
    alert('Error: Could not find content to export.');
    return;
  }

  try {
    const canvas = await html2canvas(element, { 
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1a202c' : '#ffffff', // white for PDF often better
        scale: 2 
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p', // portrait
      unit: 'px',
      format: [canvas.width, canvas.height] // Use canvas dimensions for PDF page size
    });
    
    // Add a title if provided
    if (title) {
        pdf.setFontSize(20);
        // pdf.text(title, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' }); // this needs adjustment based on element size
    }

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('An error occurred while exporting the PDF.');
  }
};

export const exportToCSV = (data: any[][], fileName: string = 'great7-export.csv'): void => {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  const csvContent = "data:text/csv;charset=utf-8," 
    + data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = (text: string, successMessage: string = "Copied to clipboard!"): void => {
  navigator.clipboard.writeText(text).then(() => {
    alert(successMessage);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    alert('Failed to copy text. Please try again or copy manually.');
  });
};
