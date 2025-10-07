import React, { useState } from "react";
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

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
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
  images: string[];
  attachments: Attachment[];
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

// Sample data
const SAMPLE_COMPONENTS: HomeComponent[] = [
  {
    id: "1",
    name: "Central Air Conditioner",
    category: "HVAC",
    brand: "Carrier",
    model: "24ACC6",
    sku: "24ACC636A003",
    yearInstalled: "2020",
    purchaseDate: "2020-05-15",
    purchasePrice: "4500",
    warrantyExpiration: "2030-05-15",
    location: "Backyard",
    condition: "excellent",
    notes: "3-ton unit, serviced annually in spring",
    images: [],
    attachments: [],
    lastMaintenance: "2025-04-15",
    nextMaintenance: "2026-04-15",
    createdAt: "2020-05-15",
  },
  {
    id: "2",
    name: "Kitchen Refrigerator",
    category: "Appliances",
    brand: "Samsung",
    model: "RF28R7351SR",
    sku: "RF28R7351SR/AA",
    yearInstalled: "2021",
    purchaseDate: "2021-08-10",
    purchasePrice: "2299",
    warrantyExpiration: "2022-08-10",
    location: "Kitchen",
    condition: "good",
    notes: "French door refrigerator with ice maker",
    images: [],
    attachments: [],
    lastMaintenance: "2024-12-01",
    nextMaintenance: "2025-12-01",
    createdAt: "2021-08-10",
  },
  {
    id: "3",
    name: "Asphalt Shingle Roof",
    category: "Roofing",
    brand: "GAF",
    model: "Timberline HDZ",
    sku: "TIMBERLINE-HDZ-CHAR",
    yearInstalled: "2018",
    purchaseDate: "2018-06-20",
    purchasePrice: "12000",
    warrantyExpiration: "2048-06-20",
    location: "Entire House",
    condition: "good",
    notes: "30-year architectural shingles, charcoal color",
    images: [],
    attachments: [],
    lastMaintenance: "2024-10-01",
    nextMaintenance: "2026-10-01",
    createdAt: "2018-06-20",
  },
];

export default function HomeComponents() {
  const [components, setComponents] =
    useState<HomeComponent[]>(SAMPLE_COMPONENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] =
    useState<HomeComponent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
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
      setSelectedImages(component.images);
      setSelectedAttachments(component.attachments);
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
      setSelectedImages([]);
      setSelectedAttachments([]);
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
      // In production, upload to server and get URLs
      const imageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setSelectedImages([...selectedImages, ...imageUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In production, upload to server
      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      }));
      setSelectedAttachments([...selectedAttachments, ...newAttachments]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setSelectedAttachments(selectedAttachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingComponent) {
      // Update existing component
      setComponents(
        components.map((comp) =>
          comp.id === editingComponent.id
            ? {
                ...comp,
                ...formData,
                images: selectedImages,
                attachments: selectedAttachments,
              }
            : comp
        )
      );
    } else {
      // Create new component
      const newComponent: HomeComponent = {
        id: Date.now().toString(),
        ...formData,
        images: selectedImages,
        attachments: selectedAttachments,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setComponents([newComponent, ...components]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this component?")) {
      setComponents(components.filter((comp) => comp.id !== id));
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
                  <p className="text-sm text-base-content/60">Under Warranty</p>
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
                  className={`btn ${viewMode === "grid" ? "btn-active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  className={`btn ${viewMode === "list" ? "btn-active" : ""}`}
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
                {(filterCategory !== "all" || filterCondition !== "all") && (
                  <span className="badge badge-primary badge-sm">Active</span>
                )}
              </button>
            </div>

            {/* Filter Options */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-base-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Category</span>
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

                {(filterCategory !== "all" || filterCondition !== "all") && (
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
                      src={component.images[0]}
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
                      <span className="font-semibold">{component.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Model:</span>
                      <span className="font-semibold">{component.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Location:</span>
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
                          src={component.images[0]}
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
                          <p className="font-semibold">{component.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">
                            Location
                          </p>
                          <p className="font-semibold">{component.location}</p>
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
                  {editingComponent ? "Edit Component" : "Add New Component"}
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
                          setFormData({ ...formData, category: e.target.value })
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
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Brand</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Carrier, Samsung"
                        className="input input-bordered w-full"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Model</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 24ACC6"
                        className="input input-bordered w-full"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
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
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchaseDate: e.target.value,
                          })
                        }
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
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={formData.warrantyExpiration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            warrantyExpiration: e.target.value,
                          })
                        }
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
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={formData.lastMaintenance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastMaintenance: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Next Maintenance
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={formData.nextMaintenance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nextMaintenance: e.target.value,
                          })
                        }
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
                  <h4 className="font-semibold text-base-content/80">Images</h4>

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

                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="btn btn-ghost btn-sm btn-circle absolute top-1 right-1 bg-base-100/80"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
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

                  {selectedAttachments.length > 0 && (
                    <div className="space-y-2">
                      {selectedAttachments.map((attachment) => (
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
                                {formatBytes(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveAttachment(attachment.id)
                            }
                            className="btn btn-ghost btn-sm btn-circle"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
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
                    {editingComponent ? "Update Component" : "Add Component"}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop" onClick={handleCloseModal}></div>
          </div>
        )}
      </div>
    </div>
  );
}
