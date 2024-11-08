"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload and parse JSON
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    alert("File uploaded successfully");
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setJsonData(json);
        } catch (error) {
          setError("Invalid JSON file. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Extract unique phone numbers
  const extractUniquePhoneNumbers = (data: any[]): string[] => {
    const phoneNumbers = new Set<string>();
    const extractPhones = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(extractPhones);
      } else if (typeof obj === "object" && obj !== null) {
        if (obj.type === "phone" && obj.text) {
          phoneNumbers.add(obj.text);
        }
        Object.values(obj).forEach(extractPhones);
      }
    };
    extractPhones(data);
    return Array.from(phoneNumbers);
  };

  // Convert JSON data to Excel file and trigger automatic download
  const convertToExcel = () => {
    setIsLoading(true);
    setError(null);
    try {
      const uniquePhoneNumbers = extractUniquePhoneNumbers(jsonData).map(
        (phone) => ({
          PhoneNumber: phone,
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(uniquePhoneNumbers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Phone Numbers");

      const excelData = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelData], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      // Trigger automatic download
      const link = document.createElement("a");
      link.href = url;
      link.download = "UniquePhoneNumbers.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL after download
      URL.revokeObjectURL(url);
    } catch (error) {
      setError("An error occurred while converting data to Excel.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-2xl font-bold mb-4">JSON to Excel Converter</h1>
      <input
        type="file"
        onChange={handleFileUpload}
        accept=".json"
        className="p-2 border rounded-md text-sm"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={convertToExcel}
        className={`px-6 py-3 mt-4 rounded-3xl border text-sm font-semibold 
          ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } 
          text-white transition duration-200`}
      >
        {isLoading ? "Converting..." : "Convert to Excel"}
      </button>
    </div>
  );
}
