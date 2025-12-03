import React, { useState, useEffect } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import * as HomeProfileService from "./HomeProfileService";
import type { HomeProfile as HomeProfileData } from "./HomeProfileService";

export default function HomeProfilePage() {
  const [profile, setProfile] = useState<HomeProfileData>({
    address: "",
    city: "",
    state: "",
    zip_code: "",
    square_feet: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    ac: false,
    ac_type: "",
    heat: true,
    heat_type: "",
    heating_source: "",
    is_septic: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await HomeProfileService.getHomeProfile();
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load home profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === ""
            ? undefined
            : parseInt(value, 10)
          : value,
    }));

    // Clear error message on change
    setError(null);
  };

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : parseFloat(value),
    }));

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.address.trim()) {
      setError("Address is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await HomeProfileService.createOrUpdateHomeProfile(profile);
      toast.success("Home profile saved successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save home profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 p-4 lg:p-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary p-3 rounded-lg">
            <HomeIcon className="h-8 w-8 text-primary-content" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Home Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your home's general information
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6"
        >
          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Address <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              placeholder="Enter your home address"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* City, State, Zip Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">City</span>
              </label>
              <input
                type="text"
                name="city"
                value={profile.city || ""}
                onChange={handleChange}
                placeholder="New York"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">State</span>
              </label>
              <input
                type="text"
                name="state"
                value={profile.state || ""}
                onChange={handleChange}
                placeholder="NY"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Zip Code</span>
              </label>
              <input
                type="text"
                name="zip_code"
                value={profile.zip_code || ""}
                onChange={handleChange}
                placeholder="10001"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Square Feet */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Square Feet</span>
            </label>
            <input
              type="number"
              name="square_feet"
              value={profile.square_feet || ""}
              onChange={handleChange}
              placeholder="2500"
              className="input input-bordered w-full"
              min="0"
            />
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Bedrooms</span>
              </label>
              <input
                type="number"
                name="bedrooms"
                value={profile.bedrooms || ""}
                onChange={handleChange}
                placeholder="3"
                className="input input-bordered w-full"
                min="0"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Bathrooms</span>
              </label>
              <input
                type="number"
                name="bathrooms"
                value={profile.bathrooms || ""}
                onChange={handleDecimalChange}
                placeholder="2.5"
                className="input input-bordered w-full"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* A/C Section */}
          <div className="divider">Air Conditioning</div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-semibold">
                Do you have air conditioning?
              </span>
              <input
                type="checkbox"
                name="ac"
                checked={profile.ac}
                onChange={handleChange}
                className="checkbox checkbox-primary"
              />
            </label>
          </div>

          {profile.ac && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Type of A/C</span>
              </label>
              <select
                name="ac_type"
                value={profile.ac_type}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Select A/C type...</option>
                <option value="central">Central</option>
                <option value="window">Window</option>
                <option value="portable">Portable</option>
                <option value="split">Split</option>
              </select>
            </div>
          )}

          {/* Heat Section */}
          <div className="divider">Heating</div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-semibold">
                Do you have heating?
              </span>
              <input
                type="checkbox"
                name="heat"
                checked={profile.heat}
                onChange={handleChange}
                className="checkbox checkbox-primary"
              />
            </label>
          </div>

          {profile.heat && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Type of Heat</span>
                </label>
                <select
                  name="heat_type"
                  value={profile.heat_type}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Select heating type...</option>
                  <option value="forced_air">Forced Air</option>
                  <option value="radiant">Radiant</option>
                  <option value="baseboard">Baseboard</option>
                  <option value="stove">Stove</option>
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">
                    Heating Source
                  </span>
                </label>
                <select
                  name="heating_source"
                  value={profile.heating_source}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Select heating source...</option>
                  <option value="natural_gas">Natural Gas</option>
                  <option value="oil">Oil</option>
                  <option value="electric">Electric</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Sewer or Septic */}
          <div className="divider">Waste System</div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-semibold">
                Do you have a Septic System? (Uncheck for Sewer)
              </span>
              <input
                type="checkbox"
                name="is_septic"
                checked={profile.is_septic}
                onChange={handleChange}
                className="checkbox checkbox-primary"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Home Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
