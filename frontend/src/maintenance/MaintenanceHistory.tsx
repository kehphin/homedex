import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import * as MaintenanceService from "./MaintenanceHistoryService";
import * as ComponentsService from "../components/ComponentsService";
import * as ContractorService from "../contractors/ContractorService";
import type {
  MaintenanceHistory as APIMaintenanceHistory,
  MaintenanceAttachment,
} from "./MaintenanceHistoryService";
import type { HomeComponent } from "../components/ComponentsService";
import type { Contractor } from "../contractors/ContractorService";

interface MaintenanceHistoryRecord {
  id: string;
  name: string;
  date: string;
  category: string;
  homeComponentId: string;
  componentName: string;
  contractorId: string;
  contractorName: string;
  price: string;
  notes: string;
  createdAt: string;
  attachments: MaintenanceAttachment[];
}

/**
 * Convert API response to frontend format
 */
function convertAPIToFrontend(
  apiRecord: APIMaintenanceHistory,
): MaintenanceHistoryRecord {
  return {
    id: apiRecord.id,
    name: apiRecord.name,
    date: apiRecord.date,
    category: apiRecord.category || "",
    homeComponentId: apiRecord.home_component || "",
    componentName: apiRecord.component_name || "No component",
    contractorId: apiRecord.contractor || "",
    contractorName: apiRecord.contractor_name || "No contractor",
    price: apiRecord.price.toString(),
    notes: apiRecord.notes || "",
    createdAt: apiRecord.created_at,
    attachments: apiRecord.attachments || [],
  };
}

export default function MaintenanceHistoryPage() {
  const [records, setRecords] = useState<MaintenanceHistoryRecord[]>([]);
  const [components, setComponents] = useState<HomeComponent[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<MaintenanceHistoryRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    total_cost: 0,
    average_cost: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    homeComponentId: "",
    contractorId: "",
    price: "",
    notes: "",
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [maintenanceData, componentsData, contractorsData, statsData] =
        await Promise.all([
          MaintenanceService.getMaintenanceHistory(),
          ComponentsService.getComponents(),
          ContractorService.getContractors(),
          MaintenanceService.getMaintenanceStats(),
        ]);

      setRecords(maintenanceData.map(convertAPIToFrontend));
      setComponents(componentsData);
      setContractors(contractorsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load maintenance history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record?: MaintenanceHistoryRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        name: record.name,
        date: record.date,
        category: record.category,
        homeComponentId: record.homeComponentId,
        contractorId: record.contractorId,
        price: record.price,
        notes: record.notes,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        homeComponentId: "",
        contractorId: "",
        price: "",
        notes: "",
      });
    }
    setAttachmentFiles([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setAttachmentFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recordData = {
        name: formData.name,
        date: formData.date,
        category: formData.category,
        home_component: formData.homeComponentId || null,
        contractor: formData.contractorId || null,
        price: formData.price,
        notes: formData.notes,
      };

      if (editingRecord) {
        // Update existing record
        const updated = await MaintenanceService.updateMaintenanceRecord(
          editingRecord.id,
          recordData,
          attachmentFiles.length > 0 ? attachmentFiles : undefined,
        );
        setRecords(
          records.map((record) =>
            record.id === editingRecord.id
              ? convertAPIToFrontend(updated)
              : record,
          ),
        );
        toast.success("Maintenance record updated successfully!");
      } else {
        // Create new record
        const created = await MaintenanceService.createMaintenanceRecord(
          recordData,
          attachmentFiles.length > 0 ? attachmentFiles : undefined,
        );
        setRecords([convertAPIToFrontend(created), ...records]);
        toast.success("Maintenance record created successfully!");
      }

      // Reload stats
      const updatedStats = await MaintenanceService.getMaintenanceStats();
      setStats(updatedStats);

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save maintenance record:", err);
      toast.error("Failed to save maintenance record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this maintenance record?",
      )
    ) {
      return;
    }

    try {
      await MaintenanceService.deleteMaintenanceRecord(id);
      setRecords(records.filter((record) => record.id !== id));

      // Reload stats
      const updatedStats = await MaintenanceService.getMaintenanceStats();
      setStats(updatedStats);
      toast.success("Maintenance record deleted successfully!");
    } catch (err) {
      console.error("Failed to delete maintenance record:", err);
      toast.error("Failed to delete maintenance record. Please try again.");
    }
  };

  const handleDeleteAttachment = async (
    maintenanceId: string,
    attachmentId: string,
  ) => {
    try {
      await MaintenanceService.deleteAttachment(maintenanceId, attachmentId);
      setRecords(
        records.map((record) =>
          record.id === maintenanceId
            ? {
                ...record,
                attachments: record.attachments.filter(
                  (att) => att.id !== attachmentId,
                ),
              }
            : record,
        ),
      );
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      alert("Failed to delete attachment. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachmentFiles(Array.from(e.target.files));
    }
  };

  // Filter and search records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Sort records by date (newest first)
  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <DocumentArrowDownIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Maintenance History</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Record
            </button>
          </div>
          <p className="text-base-content/70">
            Track your home maintenance expenses and history
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-ghost btn-sm"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && records.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-base-100 rounded-box border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Total Records
                      </p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <DocumentArrowDownIcon className="h-10 w-10 text-base-content/30" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 rounded-box border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">Total Cost</p>
                      <p className="text-3xl font-bold">
                        ${stats.total_cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 rounded-box border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Average Cost
                      </p>
                      <p className="text-3xl font-bold">
                        ${stats.average_cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="card bg-base-100 rounded-box border border-gray-200 mb-6">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <input
                      type="text"
                      placeholder="Search maintenance records..."
                      className="input input-bordered w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Toggle */}
                  <button
                    className="btn btn-outline border-gray-300 hover:bg-gray-100 gap-2"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                  </button>
                </div>

                {/* Filter Options */}
                {isFilterOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-200 shadow-sm">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setSearchQuery("");
                        setIsFilterOpen(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Records List */}
            <div className="space-y-4">
              {sortedRecords.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body text-center py-12">
                    <DocumentArrowDownIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No maintenance records found
                    </h3>
                    <p className="text-base-content/60 mb-4">
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Get started by creating your first maintenance record"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary gap-2 mx-auto"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Create Record
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                sortedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="card bg-base-100 rounded-box border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {record.name}
                              </h3>
                              <p className="text-sm text-base-content/60">
                                {record.componentName}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal(record)}
                                className="btn btn-ghost btn-sm btn-circle"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="btn btn-ghost btn-sm btn-circle text-error"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {record.notes && (
                            <p className="text-base-content/70 mb-3">
                              {record.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="badge badge-outline">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                            <span className="badge badge-primary badge-light">
                              ${parseFloat(record.price).toFixed(2)}
                            </span>
                            {record.category && (
                              <span className="badge badge-secondary badge-light">
                                {record.category}
                              </span>
                            )}
                            {record.contractorName && (
                              <span className="badge badge-info badge-light">
                                {record.contractorName}
                              </span>
                            )}
                          </div>

                          {/* Attachments */}
                          {record.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200 shadow-sm">
                              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <PaperClipIcon className="h-4 w-4" />
                                Attachments ({record.attachments.length})
                              </p>
                              <div className="space-y-1">
                                {record.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center justify-between text-sm bg-base-200 p-2 rounded"
                                  >
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-1"
                                    >
                                      <DocumentArrowDownIcon className="h-4 w-4" />
                                      {attachment.name}
                                    </a>
                                    <button
                                      onClick={() =>
                                        handleDeleteAttachment(
                                          record.id,
                                          attachment.id,
                                        )
                                      }
                                      className="btn btn-ghost btn-xs text-error"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div
                className="modal modal-open"
                key={editingRecord?.id || "new"}
              >
                <div className="modal-box max-w-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {editingRecord
                        ? "Edit Maintenance Record"
                        : "Create New Maintenance Record"}
                    </h3>
                    <button
                      onClick={handleCloseModal}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Maintenance Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., HVAC Service, Roof Inspection"
                        className="input input-bordered w-full"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Date and Price */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Date *
                          </span>
                        </label>
                        <DatePicker
                          selected={
                            formData.date ? new Date(formData.date) : null
                          }
                          onChange={(date) =>
                            setFormData({
                              ...formData,
                              date: date
                                ? date.toISOString().split("T")[0]
                                : "",
                            })
                          }
                          dateFormat="yyyy-MM-dd"
                          className="input input-bordered w-full"
                          placeholderText="Select a date"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Price ($) *
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="input input-bordered w-full"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Category
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a category</option>
                        <option value="Regular maintenance">
                          Regular maintenance
                        </option>
                        <option value="Repair">Repair</option>
                      </select>
                    </div>

                    {/* Home Component */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Home Component
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={formData.homeComponentId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            homeComponentId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a component</option>
                        {components.map((component) => (
                          <option key={component.id} value={component.id}>
                            {component.name} ({component.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contractor */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Contractor
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={formData.contractorId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contractorId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a contractor</option>
                        {contractors.map((contractor) => (
                          <option key={contractor.id} value={contractor.id}>
                            {contractor.name}
                            {contractor.company_name
                              ? ` (${contractor.company_name})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Notes</span>
                      </label>
                      <textarea
                        placeholder="Add any notes about this maintenance..."
                        className="textarea textarea-bordered w-full h-20"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Attachments (optional)
                        </span>
                      </label>
                      <input
                        type="file"
                        multiple
                        className="file-input file-input-bordered w-full"
                        onChange={handleFileChange}
                      />
                      {attachmentFiles.length > 0 && (
                        <div className="mt-2 text-sm">
                          <p className="text-base-content/60">
                            {attachmentFiles.length} file(s) selected
                          </p>
                          {Array.from(attachmentFiles).map((file, idx) => (
                            <p key={idx} className="text-base-content/50">
                              • {file.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="modal-action">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingRecord ? "Update Record" : "Create Record"}
                      </button>
                    </div>
                  </form>
                </div>
                <div
                  className="modal-backdrop"
                  onClick={handleCloseModal}
                ></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
