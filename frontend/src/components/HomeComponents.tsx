import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PuzzlePieceIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  DocumentIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import * as ComponentsService from "./ComponentsService";
import type { HomeComponent as APIHomeComponent } from "./ComponentsService";

interface Attachment {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  url: string;
}

interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  upload_date: string;
  document_date?: string;
  category: string;
}

interface HomeComponent {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  yearInstalled: string;
  purchaseDate: string;
  purchasePrice: string;
  warrantyExpiration: string;
  location: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes: string;
  images: Array<{ id: string; url: string }>;
  attachments: Attachment[];
  documents: Document[];
  lastMaintenance: string;
  nextMaintenance: string;
  createdAt: string;
}

const CATEGORIES = [
  "Appliances",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Windows & Doors",
  "Flooring",
  "Gutters",
  "Water Heater",
  "Security System",
  "Garage Door",
  "Sump Pump",
  "Other",
];

const CONDITION_COLORS = {
  excellent: "badge-success",
  good: "badge-info",
  fair: "badge-warning",
  poor: "badge-error",
};

/**
 * Convert API response to frontend format
 */
function convertAPIToFrontend(apiComponent: APIHomeComponent): HomeComponent {
  return {
    id: apiComponent.id,
    name: apiComponent.name,
    category: apiComponent.category,
    brand: apiComponent.brand || "",
    model: apiComponent.model || "",
    sku: apiComponent.sku || "",
    yearInstalled: apiComponent.year_installed || "",
    purchaseDate: apiComponent.purchase_date || "",
    purchasePrice: apiComponent.purchase_price || "",
    warrantyExpiration: apiComponent.warranty_expiration || "",
    location: apiComponent.location || "",
    condition: apiComponent.condition,
    notes: apiComponent.notes || "",
    images: apiComponent.images || [],
    attachments: apiComponent.attachments || [],
    documents: apiComponent.documents || [],
    lastMaintenance: apiComponent.last_maintenance || "",
    nextMaintenance: apiComponent.next_maintenance || "",
    createdAt: apiComponent.created_at,
  };
}

export default function HomeComponents() {
  const [components, setComponents] = useState<HomeComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] =
    useState<HomeComponent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>(
    []
  );
  const [selectedAttachmentFiles, setSelectedAttachmentFiles] = useState<
    File[]
  >([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: string; url: string }>
  >([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    []
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Appliances",
    brand: "",
    model: "",
    sku: "",
    yearInstalled: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyExpiration: "",
    location: "",
    condition: "good" as "excellent" | "good" | "fair" | "poor",
    notes: "",
    lastMaintenance: "",
    nextMaintenance: "",
  });

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ComponentsService.getComponents();
      setComponents(data.map(convertAPIToFrontend));
    } catch (err) {
      console.error("Failed to load components:", err);
      setError("Failed to load components. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (component?: HomeComponent) => {
    if (component) {
      setEditingComponent(component);
      setFormData({
        name: component.name,
        category: component.category,
        brand: component.brand,
        model: component.model,
        sku: component.sku,
        yearInstalled: component.yearInstalled,
        purchaseDate: component.purchaseDate,
        purchasePrice: component.purchasePrice,
        warrantyExpiration: component.warrantyExpiration,
        location: component.location,
        condition: component.condition,
        notes: component.notes,
        lastMaintenance: component.lastMaintenance,
        nextMaintenance: component.nextMaintenance,
      });
      setExistingImages(component.images);
      setExistingAttachments(component.attachments);
      setSelectedImageFiles([]);
      setSelectedImagePreviews([]);
      setSelectedAttachmentFiles([]);
    } else {
      setEditingComponent(null);
      setFormData({
        name: "",
        category: "Appliances",
        brand: "",
        model: "",
        sku: "",
        yearInstalled: "",
        purchaseDate: "",
        purchasePrice: "",
        warrantyExpiration: "",
        location: "",
        condition: "good",
        notes: "",
        lastMaintenance: "",
        nextMaintenance: "",
      });
      setExistingImages([]);
      setExistingAttachments([]);
      setSelectedImageFiles([]);
      setSelectedImagePreviews([]);
      setSelectedAttachmentFiles([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingComponent(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setSelectedImageFiles([...selectedImageFiles, ...newFiles]);
      setSelectedImagePreviews([...selectedImagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(selectedImagePreviews[index]);
    setSelectedImageFiles(selectedImageFiles.filter((_, i) => i !== index));
    setSelectedImagePreviews(
      selectedImagePreviews.filter((_, i) => i !== index)
    );
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!editingComponent) return;

    try {
      await ComponentsService.deleteComponentImage(
        editingComponent.id,
        imageId
      );
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
      // Also update the component in the list
      setComponents(
        components.map((c) =>
          c.id === editingComponent.id
            ? { ...c, images: c.images.filter((img) => img.id !== imageId) }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedAttachmentFiles([...selectedAttachmentFiles, ...newFiles]);
    }
  };

  const handleRemoveNewAttachment = (index: number) => {
    setSelectedAttachmentFiles(
      selectedAttachmentFiles.filter((_, i) => i !== index)
    );
  };

  const handleRemoveExistingAttachment = async (attachmentId: string) => {
    if (!editingComponent) return;

    try {
      await ComponentsService.deleteComponentAttachment(
        editingComponent.id,
        attachmentId
      );
      setExistingAttachments(
        existingAttachments.filter((att) => att.id !== attachmentId)
      );
      // Also update the component in the list
      setComponents(
        components.map((c) =>
          c.id === editingComponent.id
            ? {
                ...c,
                attachments: c.attachments.filter(
                  (att) => att.id !== attachmentId
                ),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      alert("Failed to delete attachment. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const componentData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        sku: formData.sku,
        year_installed: formData.yearInstalled,
        purchase_date: formData.purchaseDate || undefined,
        purchase_price: formData.purchasePrice || undefined,
        warranty_expiration: formData.warrantyExpiration || undefined,
        location: formData.location,
        condition: formData.condition,
        notes: formData.notes,
        last_maintenance: formData.lastMaintenance || undefined,
        next_maintenance: formData.nextMaintenance || undefined,
      };

      if (editingComponent) {
        // Update existing component
        const updated = await ComponentsService.updateComponent(
          editingComponent.id,
          componentData,
          selectedImageFiles.length > 0 ? selectedImageFiles : undefined,
          selectedAttachmentFiles.length > 0
            ? selectedAttachmentFiles
            : undefined
        );
        setComponents(
          components.map((comp) =>
            comp.id === editingComponent.id
              ? convertAPIToFrontend(updated)
              : comp
          )
        );
        toast.success("Component updated successfully!");
      } else {
        // Create new component
        const created = await ComponentsService.createComponent(
          componentData,
          selectedImageFiles.length > 0 ? selectedImageFiles : undefined,
          selectedAttachmentFiles.length > 0
            ? selectedAttachmentFiles
            : undefined
        );
        setComponents([convertAPIToFrontend(created), ...components]);
        toast.success("Component created successfully!");
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save component:", err);
      toast.error("Failed to save component. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this component?")) {
      return;
    }

    try {
      await ComponentsService.deleteComponent(id);
      setComponents(components.filter((comp) => comp.id !== id));
      toast.success("Component deleted successfully!");
    } catch (err) {
      console.error("Failed to delete component:", err);
      toast.error("Failed to delete component. Please try again.");
    }
  };

  // Filter and search components
  const filteredComponents = components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || component.category === filterCategory;

    const matchesCondition =
      filterCondition === "all" || component.condition === filterCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const stats = {
    total: components.length,
    needsMaintenance: components.filter(
      (c) => new Date(c.nextMaintenance) < new Date()
    ).length,
    underWarranty: components.filter(
      (c) => new Date(c.warrantyExpiration) > new Date()
    ).length,
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <PuzzlePieceIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Home Components</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Component
            </button>
          </div>
          <p className="text-base-content/70">
            Keep track of all your home's components, appliances, and systems
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
        {loading && components.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Total Components
                      </p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <PuzzlePieceIcon className="h-10 w-10 text-base-content/30" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Needs Maintenance
                      </p>
                      <p className="text-3xl font-bold text-warning">
                        {stats.needsMaintenance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Under Warranty
                      </p>
                      <p className="text-3xl font-bold text-success">
                        {stats.underWarranty}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="card bg-base-100 shadow-lg mb-6">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <input
                      type="text"
                      placeholder="Search components..."
                      className="input input-bordered w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="btn-group">
                    <button
                      className={`btn ${
                        viewMode === "grid" ? "btn-active" : ""
                      }`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button
                      className={`btn ${
                        viewMode === "list" ? "btn-active" : ""
                      }`}
                      onClick={() => setViewMode("list")}
                    >
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Filter Toggle */}
                  <button
                    className="btn btn-outline gap-2"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                    {(filterCategory !== "all" ||
                      filterCondition !== "all") && (
                      <span className="badge badge-primary badge-sm">
                        Active
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Options */}
                {isFilterOpen && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Category
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Condition
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filterCondition}
                          onChange={(e) => setFilterCondition(e.target.value)}
                        >
                          <option value="all">All Conditions</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>

                    {(filterCategory !== "all" ||
                      filterCondition !== "all") && (
                      <button
                        className="btn btn-ghost btn-sm mt-4"
                        onClick={() => {
                          setFilterCategory("all");
                          setFilterCondition("all");
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Components Display */}
            {filteredComponents.length === 0 ? (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center py-12">
                  <PuzzlePieceIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No components found
                  </h3>
                  <p className="text-base-content/60 mb-4">
                    {searchQuery ||
                    filterCategory !== "all" ||
                    filterCondition !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first home component"}
                  </p>
                  {!searchQuery &&
                    filterCategory === "all" &&
                    filterCondition === "all" && (
                      <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary gap-2 mx-auto"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add Component
                      </button>
                    )}
                </div>
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComponents.map((component) => (
                  <div
                    key={component.id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Image */}
                    <figure className="h-48 bg-base-300 relative">
                      {component.images.length > 0 ? (
                        <img
                          src={component.images[0].url}
                          alt={component.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <PhotoIcon className="h-16 w-16 text-base-content/30" />
                        </div>
                      )}
                      <span
                        className={`badge ${
                          CONDITION_COLORS[component.condition]
                        } absolute top-2 right-2`}
                      >
                        {component.condition}
                      </span>
                    </figure>

                    <div className="card-body">
                      <h3 className="card-title text-lg">{component.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-base-content/70">Brand:</span>
                          <span className="font-semibold">
                            {component.brand}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/70">Model:</span>
                          <span className="font-semibold">
                            {component.model}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/70">
                            Location:
                          </span>
                          <span className="font-semibold">
                            {component.location}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/70">Year:</span>
                          <span className="font-semibold">
                            {component.yearInstalled}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <span className="badge badge-outline">
                          {component.category}
                        </span>
                        {component.attachments.length > 0 && (
                          <span className="badge badge-ghost">
                            <DocumentIcon className="h-3 w-3 mr-1" />
                            {component.attachments.length}
                          </span>
                        )}
                        {component.documents.length > 0 && (
                          <span className="badge badge-primary">
                            <DocumentIcon className="h-3 w-3 mr-1" />
                            Docs: {component.documents.length}
                          </span>
                        )}
                      </div>

                      <div className="card-actions justify-end mt-4">
                        <button
                          onClick={() => handleOpenModal(component)}
                          className="btn btn-ghost btn-sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(component.id)}
                          className="btn btn-ghost btn-sm text-error"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredComponents.map((component) => (
                  <div
                    key={component.id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-24 bg-base-300 rounded-lg flex-shrink-0">
                          {component.images.length > 0 ? (
                            <img
                              src={component.images[0].url}
                              alt={component.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <PhotoIcon className="h-8 w-8 text-base-content/30" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {component.name}
                              </h3>
                              <p className="text-base-content/70">
                                {component.brand} - {component.model}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal(component)}
                                className="btn btn-ghost btn-sm btn-circle"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(component.id)}
                                className="btn btn-ghost btn-sm btn-circle text-error"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-base-content/60">
                                Category
                              </p>
                              <p className="font-semibold">
                                {component.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-base-content/60">
                                Location
                              </p>
                              <p className="font-semibold">
                                {component.location}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-base-content/60">
                                Year Installed
                              </p>
                              <p className="font-semibold">
                                {component.yearInstalled}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-base-content/60">
                                Condition
                              </p>
                              <span
                                className={`badge ${
                                  CONDITION_COLORS[component.condition]
                                } badge-sm`}
                              >
                                {component.condition}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {component.sku && (
                              <span className="badge badge-ghost text-xs">
                                SKU: {component.sku}
                              </span>
                            )}
                            {component.attachments.length > 0 && (
                              <span className="badge badge-ghost text-xs">
                                <DocumentIcon className="h-3 w-3 mr-1" />
                                {component.attachments.length} attachment(s)
                              </span>
                            )}
                            {new Date(component.warrantyExpiration) >
                              new Date() && (
                              <span className="badge badge-success text-xs">
                                Under Warranty
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal */}
            {isModalOpen && (
              <div className="modal modal-open">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {editingComponent
                        ? "Edit Component"
                        : "Add New Component"}
                    </h3>
                    <button
                      onClick={handleCloseModal}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base-content/80">
                        Basic Information
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="label">
                            <span className="label-text font-semibold">
                              Component Name *
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Central Air Conditioner"
                            className="input input-bordered w-full"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Category *
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
                            required
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Location
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Backyard, Kitchen"
                            className="input input-bordered w-full"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Brand
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Carrier, Samsung"
                            className="input input-bordered w-full"
                            value={formData.brand}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brand: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Model
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 24ACC6"
                            className="input input-bordered w-full"
                            value={formData.model}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                model: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              SKU / Serial Number
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 24ACC636A003"
                            className="input input-bordered w-full"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData({ ...formData, sku: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Condition
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={formData.condition}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                condition: e.target.value as
                                  | "excellent"
                                  | "good"
                                  | "fair"
                                  | "poor",
                              })
                            }
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Information */}
                    <div className="divider"></div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base-content/80">
                        Purchase & Installation
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Year Installed
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 2020"
                            className="input input-bordered w-full"
                            value={formData.yearInstalled}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                yearInstalled: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Purchase Date
                            </span>
                          </label>
                          <DatePicker
                            selected={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                purchaseDate: date ? date.toISOString().split('T')[0] : '',
                              })
                            }
                            dateFormat="yyyy-MM-dd"
                            className="input input-bordered w-full"
                            placeholderText="Select a date"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Purchase Price
                            </span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70">
                              $
                            </span>
                            <input
                              type="number"
                              placeholder="0.00"
                              className="input input-bordered w-full pl-8"
                              value={formData.purchasePrice}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  purchasePrice: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label className="label">
                            <span className="label-text font-semibold">
                              Warranty Expiration
                            </span>
                          </label>
                          <DatePicker
                            selected={formData.warrantyExpiration ? new Date(formData.warrantyExpiration) : null}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                warrantyExpiration: date ? date.toISOString().split('T')[0] : '',
                              })
                            }
                            dateFormat="yyyy-MM-dd"
                            className="input input-bordered w-full"
                            placeholderText="Select a date"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Maintenance */}
                    <div className="divider"></div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base-content/80">
                        Maintenance Schedule
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Last Maintenance
                            </span>
                          </label>
                          <DatePicker
                            selected={formData.lastMaintenance ? new Date(formData.lastMaintenance) : null}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                lastMaintenance: date ? date.toISOString().split('T')[0] : '',
                              })
                            }
                            dateFormat="yyyy-MM-dd"
                            className="input input-bordered w-full"
                            placeholderText="Select a date"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Next Maintenance
                            </span>
                          </label>
                          <DatePicker
                            selected={formData.nextMaintenance ? new Date(formData.nextMaintenance) : null}
                            onChange={(date) =>
                              setFormData({
                                ...formData,
                                nextMaintenance: date ? date.toISOString().split('T')[0] : '',
                              })
                            }
                            dateFormat="yyyy-MM-dd"
                            className="input input-bordered w-full"
                            placeholderText="Select a date"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Notes</span>
                      </label>
                      <textarea
                        placeholder="Add any additional notes or details..."
                        className="textarea textarea-bordered w-full h-24"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
                    </div>

                    {/* Images */}
                    <div className="divider"></div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base-content/80">
                        Images
                      </h4>

                      <div>
                        <label className="btn btn-outline gap-2 cursor-pointer">
                          <PhotoIcon className="h-5 w-5" />
                          Upload Images
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>

                      {(existingImages.length > 0 ||
                        selectedImagePreviews.length > 0) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Existing Images */}
                          {existingImages.map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt="Component"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingImage(image.id)
                                }
                                className="btn btn-ghost btn-sm btn-circle absolute top-1 right-1 bg-base-100/80"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {/* New Image Previews */}
                          {selectedImagePreviews.map((preview, index) => (
                            <div key={`new-${index}`} className="relative">
                              <img
                                src={preview}
                                alt={`New ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="btn btn-ghost btn-sm btn-circle absolute top-1 right-1 bg-base-100/80"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                              <span className="badge badge-sm badge-info absolute bottom-1 left-1">
                                New
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Attachments */}
                    <div className="divider"></div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base-content/80">
                        Attachments
                      </h4>
                      <p className="text-sm text-base-content/60">
                        Upload manuals, warranties, receipts, or other documents
                      </p>

                      <div>
                        <label className="btn btn-outline gap-2 cursor-pointer">
                          <DocumentIcon className="h-5 w-5" />
                          Upload Files
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleAttachmentUpload}
                          />
                        </label>
                      </div>

                      {(existingAttachments.length > 0 ||
                        selectedAttachmentFiles.length > 0) && (
                        <div className="space-y-2">
                          {/* Existing Attachments */}
                          {existingAttachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <DocumentIcon className="h-5 w-5 text-base-content/70" />
                                <div>
                                  <p className="font-semibold text-sm">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-base-content/60">
                                    {formatBytes(attachment.file_size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingAttachment(attachment.id)
                                }
                                className="btn btn-ghost btn-sm btn-circle"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {/* New Attachments */}
                          {selectedAttachmentFiles.map((file, index) => (
                            <div
                              key={`new-${index}`}
                              className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <DocumentIcon className="h-5 w-5 text-base-content/70" />
                                <div>
                                  <p className="font-semibold text-sm">
                                    {file.name}
                                    <span className="badge badge-sm badge-info ml-2">
                                      New
                                    </span>
                                  </p>
                                  <p className="text-xs text-base-content/60">
                                    {formatBytes(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewAttachment(index)}
                                className="btn btn-ghost btn-sm btn-circle"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Associated Documents */}
                    {editingComponent &&
                      editingComponent.documents.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-base-content/80">
                            Associated Documents
                          </h4>
                          <div className="space-y-2">
                            {editingComponent.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <DocumentIcon className="h-5 w-5 text-base-content/70 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm truncate">
                                      {doc.name}
                                    </p>
                                    <div className="flex gap-2 text-xs text-base-content/60">
                                      <span>{doc.category}</span>
                                      <span>•</span>
                                      <span>{formatBytes(doc.file_size)}</span>
                                    </div>
                                  </div>
                                </div>
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                                  title="View Document"
                                >
                                  <DocumentIcon className="h-4 w-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                        {editingComponent
                          ? "Update Component"
                          : "Add Component"}
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
