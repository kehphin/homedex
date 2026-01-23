import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import * as ContractorService from "./ContractorService";
import type { ContractorDetail } from "./ContractorService";

interface ContractorLocal {
  id: string;
  name: string;
  company_name?: string;
  category?: string;
  email?: string;
  website?: string;
  phone?: string;
  notes?: string;
  maintenance_count: number;
  total_spent: number;
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<ContractorLocal[]>([]);
  const [selectedContractor, setSelectedContractor] =
    useState<ContractorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] =
    useState<ContractorLocal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    total_spent: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    category: "",
    email: "",
    website: "",
    phone: "",
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
      const [contractorsData, statsData] = await Promise.all([
        ContractorService.getContractors(),
        ContractorService.getContractorStats(),
      ]);

      setContractors(contractorsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load contractors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (contractor?: ContractorLocal) => {
    if (contractor) {
      setEditingContractor(contractor);
      setFormData({
        name: contractor.name,
        company_name: contractor.company_name || "",
        category: contractor.category || "",
        email: contractor.email || "",
        website: contractor.website || "",
        phone: contractor.phone || "",
        notes: contractor.notes || "",
      });
    } else {
      setEditingContractor(null);
      setFormData({
        name: "",
        company_name: "",
        category: "",
        email: "",
        website: "",
        phone: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContractor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractorData = {
        name: formData.name,
        company_name: formData.company_name || undefined,
        category: formData.category || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
      };

      if (editingContractor) {
        // Update existing contractor
        const updated = await ContractorService.updateContractor(
          editingContractor.id,
          contractorData,
        );
        setContractors(
          contractors.map((contractor) =>
            contractor.id === editingContractor.id
              ? (updated as ContractorLocal)
              : contractor,
          ),
        );
        toast.success("Contractor updated successfully!");
      } else {
        // Create new contractor
        const created =
          await ContractorService.createContractor(contractorData);
        setContractors([created as ContractorLocal, ...contractors]);
        toast.success("Contractor added successfully!");
      }

      // Reload stats
      const updatedStats = await ContractorService.getContractorStats();
      setStats(updatedStats);

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save contractor:", err);
      toast.error("Failed to save contractor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contractor?")) {
      return;
    }

    try {
      await ContractorService.deleteContractor(id);
      setContractors(contractors.filter((contractor) => contractor.id !== id));
      setSelectedContractor(null);

      // Reload stats
      const updatedStats = await ContractorService.getContractorStats();
      setStats(updatedStats);
      toast.success("Contractor deleted successfully!");
    } catch (err) {
      console.error("Failed to delete contractor:", err);
      toast.error("Failed to delete contractor. Please try again.");
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const details = await ContractorService.getContractor(id);
      setSelectedContractor(details);
    } catch (err) {
      console.error("Failed to fetch contractor details:", err);
      alert("Failed to load contractor details. Please try again.");
    }
  };

  const handleRefreshDetails = async () => {
    if (!selectedContractor) return;
    try {
      const details = await ContractorService.getContractor(
        selectedContractor.id,
      );
      setSelectedContractor(details);
    } catch (err) {
      console.error("Failed to refresh contractor details:", err);
      alert("Failed to refresh contractor details. Please try again.");
    }
  };

  // Filter contractors
  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contractor.company_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false) ||
      (contractor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (contractor.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Contractors</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Contractor
            </button>
          </div>
          <p className="text-base-content/70">
            Manage your contractor contacts and track their work history
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
        {loading && contractors.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card bg-base-100 rounded-box border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Total Contractors
                      </p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <UserGroupIcon className="h-10 w-10 text-base-content/30" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 rounded-box border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Total Spent
                      </p>
                      <p className="text-3xl font-bold">
                        ${stats.total_spent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contractors List */}
              <div className="lg:col-span-1">
                {/* Search */}
                <div className="mb-4 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search contractors..."
                    className="input input-bordered w-full pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Contractors List */}
                <div className="space-y-2">
                  {filteredContractors.length === 0 ? (
                    <div className="card bg-base-100 rounded-box border border-gray-200">
                      <div className="card-body text-center py-8">
                        <UserGroupIcon className="h-12 w-12 mx-auto text-base-content/30 mb-2" />
                        <p className="text-base-content/60">
                          {searchQuery
                            ? "No contractors found"
                            : "No contractors yet"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredContractors.map((contractor) => (
                      <div
                        key={contractor.id}
                        className={`card shadow cursor-pointer transition-all ${
                          selectedContractor?.id === contractor.id
                            ? "bg-primary text-primary-content"
                            : "bg-base-100 hover:shadow-lg"
                        }`}
                        onClick={() => handleViewDetails(contractor.id)}
                      >
                        <div className="card-body p-4">
                          <h3 className="font-semibold text-sm">
                            {contractor.name || contractor.company_name}
                          </h3>
                          {contractor.company_name && (
                            <p className="text-xs opacity-75">
                              {contractor.company_name}
                            </p>
                          )}
                          {contractor.category && (
                            <p className="text-xs opacity-75">
                              {contractor.category}
                            </p>
                          )}
                          <div className="text-xs mt-2 opacity-75">
                            <p>{contractor.maintenance_count} job(s)</p>
                            <p>${contractor.total_spent.toFixed(2)} total</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Contractor Details */}
              <div className="lg:col-span-2">
                {selectedContractor ? (
                  <div className="card bg-base-100 rounded-box border border-gray-200">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold">
                            {selectedContractor.name ||
                              selectedContractor.company_name}
                          </h2>
                          {selectedContractor.company_name && (
                            <p className="text-base-content/70">
                              {selectedContractor.company_name}
                            </p>
                          )}
                          {selectedContractor.category && (
                            <p className="text-base-content/60 text-sm mt-1">
                              <span className="badge badge-primary badge-light">
                                {selectedContractor.category}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRefreshDetails}
                            className="btn btn-ghost btn-sm btn-circle"
                            title="Refresh details"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(selectedContractor)}
                            className="btn btn-ghost btn-sm btn-circle"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(selectedContractor.id)}
                            className="btn btn-ghost btn-sm btn-circle text-error"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="divider my-2"></div>
                      <div className="space-y-3 mb-6">
                        <h3 className="font-semibold">Contact Information</h3>
                        {selectedContractor.email && (
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/60 min-w-20">
                              Email:
                            </span>
                            <a
                              href={`mailto:${selectedContractor.email}`}
                              className="text-primary hover:underline"
                            >
                              {selectedContractor.email}
                            </a>
                          </div>
                        )}
                        {selectedContractor.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/60 min-w-20">
                              Phone:
                            </span>
                            <a
                              href={`tel:${selectedContractor.phone}`}
                              className="text-primary hover:underline"
                            >
                              {selectedContractor.phone}
                            </a>
                          </div>
                        )}
                        {selectedContractor.website && (
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/60 min-w-20">
                              Website:
                            </span>
                            <a
                              href={selectedContractor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {selectedContractor.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {selectedContractor.notes && (
                        <>
                          <div className="divider my-2"></div>
                          <div className="mb-6">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-base-content/70 whitespace-pre-wrap">
                              {selectedContractor.notes}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Maintenance History */}
                      <div className="divider my-2"></div>
                      <div>
                        <h3 className="font-semibold mb-4">Work History</h3>
                        {selectedContractor.maintenance_histories.length ===
                        0 ? (
                          <p className="text-base-content/60">
                            No maintenance records yet
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {selectedContractor.maintenance_histories.map(
                              (maintenance) => (
                                <div
                                  key={maintenance.id}
                                  className="bg-base-200 p-3 rounded-lg"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-semibold">
                                        {maintenance.name}
                                      </p>
                                      <p className="text-sm text-base-content/70">
                                        {maintenance.component_name}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-primary">
                                        ${maintenance.price.toFixed(2)}
                                      </p>
                                      <p className="text-sm text-base-content/70">
                                        {new Date(
                                          maintenance.date,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-base-100 rounded-box border border-gray-200">
                    <div className="card-body text-center py-12">
                      <UserGroupIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                      <p className="text-base-content/60">
                        Select a contractor to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {editingContractor
                        ? "Edit Contractor"
                        : "Add New Contractor"}
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
                        <span className="label-text font-semibold">Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Smith"
                        className="input input-bordered w-full"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Company Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="ABC Plumbing Co."
                        className="input input-bordered w-full"
                        value={formData.company_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company_name: e.target.value,
                          })
                        }
                        required
                      />
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
                        <option value="HVAC">HVAC</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="General Maintenance">
                          General Maintenance
                        </option>
                        <option value="Landscaping">Landscaping</option>
                        <option value="Roofing">Roofing</option>
                        <option value="Painting">Painting</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Flooring">Flooring</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Email
                          </span>
                        </label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          className="input input-bordered w-full"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Phone
                          </span>
                        </label>
                        <input
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="input input-bordered w-full"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Website
                        </span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className="input input-bordered w-full"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Notes</span>
                      </label>
                      <textarea
                        placeholder="Add any notes about this contractor..."
                        className="textarea textarea-bordered w-full h-20"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
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
                        {editingContractor
                          ? "Update Contractor"
                          : "Add Contractor"}
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
