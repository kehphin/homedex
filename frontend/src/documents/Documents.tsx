import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import * as DocumentsService from "./DocumentsService";
import type { Document as APIDocument } from "./DocumentsService";

interface Document {
  id: string;
  name: string;
  category: string;
  description: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  documentDate: string;
  tags: string[];
  fileUrl: string;
  year: string;
}

const CATEGORIES = [
  "Property Tax",
  "Utilities",
  "Insurance",
  "Mortgage",
  "HOA Documents",
  "Permits",
  "Inspection Reports",
  "Appraisals",
  "Title & Deed",
  "Warranties",
  "Contracts",
  "Receipts",
  "Other",
];

const COMMON_TAGS = [
  "Annual",
  "Monthly",
  "Quarterly",
  "Important",
  "Paid",
  "Pending",
  "Archived",
];

/**
 * Convert API response to frontend format
 */
function convertAPIToFrontend(apiDocument: APIDocument): Document {
  return {
    id: apiDocument.id,
    name: apiDocument.name,
    category: apiDocument.category,
    description: apiDocument.description || "",
    fileType: apiDocument.file_type,
    fileSize: apiDocument.file_size,
    uploadDate: apiDocument.upload_date,
    documentDate: apiDocument.document_date || "",
    tags: apiDocument.tags || [],
    fileUrl: apiDocument.file_url,
    year: apiDocument.year || "",
  };
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Other",
    description: "",
    documentDate: "",
    year: new Date().getFullYear().toString(),
  });

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DocumentsService.getDocuments();
      setDocuments(data.map(convertAPIToFrontend));
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (document?: Document) => {
    if (document) {
      setEditingDocument(document);
      setFormData({
        name: document.name,
        category: document.category,
        description: document.description,
        documentDate: document.documentDate,
        year: document.year,
      });
      setSelectedTags(document.tags);
      setSelectedFile(null);
    } else {
      setEditingDocument(null);
      setFormData({
        name: "",
        category: "Other",
        description: "",
        documentDate: "",
        year: new Date().getFullYear().toString(),
      });
      setSelectedTags([]);
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate name if empty
      if (!formData.name) {
        setFormData({ ...formData, name: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documentData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        document_date: formData.documentDate || undefined,
        year: formData.year,
        tags: selectedTags,
      };

      if (editingDocument) {
        // Update existing document
        const updated = await DocumentsService.updateDocument(
          editingDocument.id,
          documentData,
          selectedFile || undefined
        );
        setDocuments(
          documents.map((doc) =>
            doc.id === editingDocument.id ? convertAPIToFrontend(updated) : doc
          )
        );
      } else {
        // Create new document
        if (!selectedFile) {
          alert("Please select a file to upload");
          setLoading(false);
          return;
        }

        const created = await DocumentsService.createDocument(
          documentData,
          selectedFile
        );
        setDocuments([convertAPIToFrontend(created), ...documents]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save document:", err);
      alert("Failed to save document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await DocumentsService.deleteDocument(id);
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleDownload = (doc: Document) => {
    // Open the file URL in a new tab to trigger download
    const link = window.document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleView = (doc: Document) => {
    // Open the file in a new tab
    window.open(doc.fileUrl, "_blank");
  };

  // Filter and search documents
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      filterCategory === "all" || document.category === filterCategory;

    const matchesYear = filterYear === "all" || document.year === filterYear;

    return matchesSearch && matchesCategory && matchesYear;
  });

  // Sort documents: newest first
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  // Get unique years from documents
  const availableYears = Array.from(
    new Set(documents.map((doc) => doc.year))
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    return "📎";
  };

  const stats = {
    total: documents.length,
    thisYear: documents.filter(
      (d) => d.year === new Date().getFullYear().toString()
    ).length,
    categories: Array.from(new Set(documents.map((d) => d.category))).length,
    totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
  };

  return <div>TODO</div>;

  // return (
  //   <div className="min-h-screen bg-base-100 p-6">
  //     <div className="max-w-7xl mx-auto">
  //       {/* Header */}
  //       <div className="mb-8">
  //         <div className="flex items-center justify-between mb-2">
  //           <div className="flex items-center gap-3">
  //             <DocumentTextIcon className="h-8 w-8 text-primary" />
  //             <h1 className="text-3xl font-bold">Documents</h1>
  //           </div>
  //           <button
  //             onClick={() => handleOpenModal()}
  //             className="btn btn-primary gap-2"
  //           >
  //             <PlusIcon className="h-5 w-5" />
  //             Upload Document
  //           </button>
  //         </div>
  //         <p className="text-base-content/70">
  //           Store and organize all your home-related documents in one place
  //         </p>
  //       </div>

  //       {/* Error Alert */}
  //       {error && (
  //         <div className="alert alert-error mb-6">
  //           <span>{error}</span>
  //           <button
  //             onClick={() => setError(null)}
  //             className="btn btn-ghost btn-sm"
  //           >
  //             <XMarkIcon className="h-5 w-5" />
  //           </button>
  //         </div>
  //       )}

  //       {/* Loading Spinner */}
  //       {loading && documents.length === 0 ? (
  //         <div className="flex justify-center items-center py-20">
  //           <span className="loading loading-spinner loading-lg"></span>
  //         </div>
  //       ) : (
  //         <>
  //           {/* Stats Cards */}
  //           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  //             <div className="card bg-base-100 shadow-lg">
  //               <div className="card-body">
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <p className="text-sm text-base-content/60">
  //                       Total Documents
  //                     </p>
  //                     <p className="text-3xl font-bold">{stats.total}</p>
  //                   </div>
  //                   <DocumentTextIcon className="h-10 w-10 text-base-content/30" />
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="card bg-base-100 shadow-lg">
  //               <div className="card-body">
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <p className="text-sm text-base-content/60">This Year</p>
  //                     <p className="text-3xl font-bold text-primary">
  //                       {stats.thisYear}
  //                     </p>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="card bg-base-100 shadow-lg">
  //               <div className="card-body">
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <p className="text-sm text-base-content/60">Categories</p>
  //                     <p className="text-3xl font-bold">{stats.categories}</p>
  //                   </div>
  //                   <FolderIcon className="h-10 w-10 text-base-content/30" />
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="card bg-base-100 shadow-lg">
  //               <div className="card-body">
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <p className="text-sm text-base-content/60">Total Size</p>
  //                     <p className="text-3xl font-bold">
  //                       {formatBytes(stats.totalSize)}
  //                     </p>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Search and Filter */}
  //           <div className="card bg-base-100 shadow-lg mb-6">
  //             <div className="card-body">
  //               <div className="flex flex-col md:flex-row gap-4">
  //                 {/* Search */}
  //                 <div className="flex-1 relative">
  //                   <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
  //                   <input
  //                     type="text"
  //                     placeholder="Search documents..."
  //                     className="input input-bordered w-full pl-10"
  //                     value={searchQuery}
  //                     onChange={(e) => setSearchQuery(e.target.value)}
  //                   />
  //                 </div>

  //                 {/* Filter Toggle */}
  //                 <button
  //                   className="btn btn-outline gap-2"
  //                   onClick={() => setIsFilterOpen(!isFilterOpen)}
  //                 >
  //                   <FunnelIcon className="h-5 w-5" />
  //                   Filters
  //                   {(filterCategory !== "all" || filterYear !== "all") && (
  //                     <span className="badge badge-primary badge-sm">
  //                       Active
  //                     </span>
  //                   )}
  //                 </button>
  //               </div>

  //               {/* Filter Options */}
  //               {isFilterOpen && (
  //                 <div className="mt-4 pt-4 border-t border-base-300">
  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                     <div>
  //                       <label className="label">
  //                         <span className="label-text font-semibold">
  //                           Category
  //                         </span>
  //                       </label>
  //                       <select
  //                         className="select select-bordered w-full"
  //                         value={filterCategory}
  //                         onChange={(e) => setFilterCategory(e.target.value)}
  //                       >
  //                         <option value="all">All Categories</option>
  //                         {CATEGORIES.map((cat) => (
  //                           <option key={cat} value={cat}>
  //                             {cat}
  //                           </option>
  //                         ))}
  //                       </select>
  //                     </div>

  //                     <div>
  //                       <label className="label">
  //                         <span className="label-text font-semibold">Year</span>
  //                       </label>
  //                       <select
  //                         className="select select-bordered w-full"
  //                         value={filterYear}
  //                         onChange={(e) => setFilterYear(e.target.value)}
  //                       >
  //                         <option value="all">All Years</option>
  //                         {availableYears.map((year) => (
  //                           <option key={year} value={year}>
  //                             {year}
  //                           </option>
  //                         ))}
  //                       </select>
  //                     </div>
  //                   </div>

  //                   {(filterCategory !== "all" || filterYear !== "all") && (
  //                     <button
  //                       className="btn btn-ghost btn-sm mt-4"
  //                       onClick={() => {
  //                         setFilterCategory("all");
  //                         setFilterYear("all");
  //                       }}
  //                     >
  //                       Clear Filters
  //                     </button>
  //                   )}
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           {/* Documents List */}
  //           {sortedDocuments.length === 0 ? (
  //             <div className="card bg-base-100 shadow-lg">
  //               <div className="card-body text-center py-12">
  //                 <DocumentTextIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
  //                 <h3 className="text-xl font-semibold mb-2">
  //                   No documents found
  //                 </h3>
  //                 <p className="text-base-content/60 mb-4">
  //                   {searchQuery ||
  //                   filterCategory !== "all" ||
  //                   filterYear !== "all"
  //                     ? "Try adjusting your search or filters"
  //                     : "Get started by uploading your first document"}
  //                 </p>
  //                 {!searchQuery &&
  //                   filterCategory === "all" &&
  //                   filterYear === "all" && (
  //                     <button
  //                       onClick={() => handleOpenModal()}
  //                       className="btn btn-primary gap-2 mx-auto"
  //                     >
  //                       <PlusIcon className="h-5 w-5" />
  //                       Upload Document
  //                     </button>
  //                   )}
  //               </div>
  //             </div>
  //           ) : (
  //             <div className="space-y-3">
  //               {sortedDocuments.map((document) => (
  //                 <div
  //                   key={document.id}
  //                   className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
  //                 >
  //                   <div className="card-body">
  //                     <div className="flex items-start gap-4">
  //                       {/* File Icon */}
  //                       <div className="text-4xl flex-shrink-0">
  //                         {getFileIcon(document.fileType)}
  //                       </div>

  //                       {/* Content */}
  //                       <div className="flex-1 min-w-0">
  //                         <div className="flex items-start justify-between gap-4 mb-2">
  //                           <div className="flex-1 min-w-0">
  //                             <h3 className="text-lg font-semibold truncate">
  //                               {document.name}
  //                             </h3>
  //                             <p className="text-sm text-base-content/70 truncate">
  //                               {document.description}
  //                             </p>
  //                           </div>
  //                           <div className="flex gap-2 flex-shrink-0">
  //                             <button
  //                               onClick={() => handleView(document)}
  //                               className="btn btn-ghost btn-sm btn-circle"
  //                               title="View"
  //                             >
  //                               <EyeIcon className="h-4 w-4" />
  //                             </button>
  //                             <button
  //                               onClick={() => handleDownload(document)}
  //                               className="btn btn-ghost btn-sm btn-circle"
  //                               title="Download"
  //                             >
  //                               <ArrowDownTrayIcon className="h-4 w-4" />
  //                             </button>
  //                             <button
  //                               onClick={() => handleOpenModal(document)}
  //                               className="btn btn-ghost btn-sm btn-circle"
  //                               title="Edit"
  //                             >
  //                               <PencilIcon className="h-4 w-4" />
  //                             </button>
  //                             <button
  //                               onClick={() => handleDelete(document.id)}
  //                               className="btn btn-ghost btn-sm btn-circle text-error"
  //                               title="Delete"
  //                             >
  //                               <TrashIcon className="h-4 w-4" />
  //                             </button>
  //                           </div>
  //                         </div>

  //                         <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60 mb-2">
  //                           <span className="badge badge-outline">
  //                             {document.category}
  //                           </span>
  //                           <span>•</span>
  //                           <span>{formatBytes(document.fileSize)}</span>
  //                           <span>•</span>
  //                           <span>
  //                             Uploaded:{" "}
  //                             {new Date(
  //                               document.uploadDate
  //                             ).toLocaleDateString()}
  //                           </span>
  //                           {document.documentDate && (
  //                             <>
  //                               <span>•</span>
  //                               <span>
  //                                 Date:{" "}
  //                                 {new Date(
  //                                   document.documentDate
  //                                 ).toLocaleDateString()}
  //                               </span>
  //                             </>
  //                           )}
  //                         </div>

  //                         {document.tags.length > 0 && (
  //                           <div className="flex flex-wrap gap-1">
  //                             {document.tags.map((tag) => (
  //                               <span
  //                                 key={tag}
  //                                 className="badge badge-ghost badge-sm"
  //                               >
  //                                 {tag}
  //                               </span>
  //                             ))}
  //                           </div>
  //                         )}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           )}

  //           {/* Modal */}
  //           {isModalOpen && (
  //             <div className="modal modal-open">
  //               <div className="modal-box max-w-2xl">
  //                 <div className="flex items-center justify-between mb-4">
  //                   <h3 className="font-bold text-lg">
  //                     {editingDocument ? "Edit Document" : "Upload Document"}
  //                   </h3>
  //                   <button
  //                     onClick={handleCloseModal}
  //                     className="btn btn-ghost btn-sm btn-circle"
  //                   >
  //                     <XMarkIcon className="h-5 w-5" />
  //                   </button>
  //                 </div>

  //                 <form onSubmit={handleSubmit} className="space-y-4">
  //                   {/* File Upload */}
  //                   {!editingDocument && (
  //                     <div>
  //                       <label className="label">
  //                         <span className="label-text font-semibold">
  //                           Select File *
  //                         </span>
  //                       </label>
  //                       <input
  //                         type="file"
  //                         className="file-input file-input-bordered w-full"
  //                         onChange={handleFileSelect}
  //                         required
  //                       />
  //                       {selectedFile && (
  //                         <div className="mt-2 text-sm text-base-content/70">
  //                           Selected: {selectedFile.name} (
  //                           {formatBytes(selectedFile.size)})
  //                         </div>
  //                       )}
  //                     </div>
  //                   )}

  //                   {editingDocument && (
  //                     <div className="alert alert-info">
  //                       <DocumentIcon className="h-5 w-5" />
  //                       <span className="text-sm">
  //                         Currently: {editingDocument.name}.{" "}
  //                         <label className="link cursor-pointer">
  //                           Replace file
  //                           <input
  //                             type="file"
  //                             className="hidden"
  //                             onChange={handleFileSelect}
  //                           />
  //                         </label>
  //                       </span>
  //                     </div>
  //                   )}

  //                   {/* Document Name */}
  //                   <div>
  //                     <label className="label">
  //                       <span className="label-text font-semibold">
  //                         Document Name *
  //                       </span>
  //                     </label>
  //                     <input
  //                       type="text"
  //                       placeholder="e.g., 2024 Property Tax Bill"
  //                       className="input input-bordered w-full"
  //                       value={formData.name}
  //                       onChange={(e) =>
  //                         setFormData({ ...formData, name: e.target.value })
  //                       }
  //                       required
  //                     />
  //                   </div>

  //                   {/* Category and Year */}
  //                   <div className="grid grid-cols-2 gap-4">
  //                     <div>
  //                       <label className="label">
  //                         <span className="label-text font-semibold">
  //                           Category *
  //                         </span>
  //                       </label>
  //                       <select
  //                         className="select select-bordered w-full"
  //                         value={formData.category}
  //                         onChange={(e) =>
  //                           setFormData({
  //                             ...formData,
  //                             category: e.target.value,
  //                           })
  //                         }
  //                         required
  //                       >
  //                         {CATEGORIES.map((cat) => (
  //                           <option key={cat} value={cat}>
  //                             {cat}
  //                           </option>
  //                         ))}
  //                       </select>
  //                     </div>

  //                     <div>
  //                       <label className="label">
  //                         <span className="label-text font-semibold">Year</span>
  //                       </label>
  //                       <input
  //                         type="text"
  //                         placeholder="e.g., 2024"
  //                         className="input input-bordered w-full"
  //                         value={formData.year}
  //                         onChange={(e) =>
  //                           setFormData({ ...formData, year: e.target.value })
  //                         }
  //                       />
  //                     </div>
  //                   </div>

  //                   {/* Document Date */}
  //                   <div>
  //                     <label className="label">
  //                       <span className="label-text font-semibold">
  //                         Document Date
  //                       </span>
  //                     </label>
  //                     <input
  //                       type="date"
  //                       className="input input-bordered w-full"
  //                       value={formData.documentDate}
  //                       onChange={(e) =>
  //                         setFormData({
  //                           ...formData,
  //                           documentDate: e.target.value,
  //                         })
  //                       }
  //                     />
  //                     <label className="label">
  //                       <span className="label-text-alt text-base-content/60">
  //                         The date shown on the document (e.g., bill date,
  //                         statement date)
  //                       </span>
  //                     </label>
  //                   </div>

  //                   {/* Description */}
  //                   <div>
  //                     <label className="label">
  //                       <span className="label-text font-semibold">
  //                         Description
  //                       </span>
  //                     </label>
  //                     <textarea
  //                       placeholder="Add any notes or description..."
  //                       className="textarea textarea-bordered w-full h-20"
  //                       value={formData.description}
  //                       onChange={(e) =>
  //                         setFormData({
  //                           ...formData,
  //                           description: e.target.value,
  //                         })
  //                       }
  //                     />
  //                   </div>

  //                   {/* Tags */}
  //                   <div>
  //                     <label className="label">
  //                       <span className="label-text font-semibold">Tags</span>
  //                     </label>
  //                     <div className="flex flex-wrap gap-2">
  //                       {COMMON_TAGS.map((tag) => (
  //                         <button
  //                           key={tag}
  //                           type="button"
  //                           onClick={() => handleToggleTag(tag)}
  //                           className={`badge badge-lg cursor-pointer ${
  //                             selectedTags.includes(tag)
  //                               ? "badge-primary"
  //                               : "badge-outline"
  //                           }`}
  //                         >
  //                           {tag}
  //                         </button>
  //                       ))}
  //                     </div>
  //                   </div>

  //                   {/* Actions */}
  //                   <div className="modal-action">
  //                     <button
  //                       type="button"
  //                       onClick={handleCloseModal}
  //                       className="btn btn-ghost"
  //                     >
  //                       Cancel
  //                     </button>
  //                     <button type="submit" className="btn btn-primary">
  //                       {editingDocument
  //                         ? "Update Document"
  //                         : "Upload Document"}
  //                     </button>
  //                   </div>
  //                 </form>
  //               </div>
  //               <div
  //                 className="modal-backdrop"
  //                 onClick={handleCloseModal}
  //               ></div>
  //             </div>
  //           )}
  //         </>
  //       )}
  //     </div>
  //   </div>
  // );
}
