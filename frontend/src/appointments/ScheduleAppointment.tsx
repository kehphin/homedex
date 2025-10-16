import React, { useState, useRef, useEffect } from "react";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import * as AppointmentsService from "./AppointmentsService";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  description: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const SERVICES: Service[] = [
  {
    id: "hvac-tuneup",
    name: "HVAC Tune-up",
    category: "HVAC",
    duration: 90,
    description: "Complete system inspection and maintenance",
  },
  {
    id: "hvac-repair",
    name: "HVAC Repair",
    category: "HVAC",
    duration: 120,
    description: "Diagnostic and repair service",
  },
  {
    id: "hvac-install",
    name: "HVAC Installation",
    category: "HVAC",
    duration: 240,
    description: "New system installation",
  },
  {
    id: "lawn-mowing",
    name: "Lawn Mowing",
    category: "Lawn Care",
    duration: 60,
    description: "Professional lawn mowing service",
  },
  {
    id: "lawn-fertilizing",
    name: "Lawn Fertilizing",
    category: "Lawn Care",
    duration: 45,
    description: "Seasonal fertilizer application",
  },
  {
    id: "landscaping-design",
    name: "Landscaping Design",
    category: "Landscaping",
    duration: 120,
    description: "Custom landscape design consultation",
  },
  {
    id: "landscaping-install",
    name: "Landscaping Installation",
    category: "Landscaping",
    duration: 480,
    description: "Full landscaping installation service",
  },
  {
    id: "tree-trimming",
    name: "Tree Trimming",
    category: "Landscaping",
    duration: 180,
    description: "Professional tree trimming and pruning",
  },
  {
    id: "plumbing-repair",
    name: "Plumbing Repair",
    category: "Plumbing",
    duration: 90,
    description: "General plumbing repairs",
  },
  {
    id: "drain-cleaning",
    name: "Drain Cleaning",
    category: "Plumbing",
    duration: 60,
    description: "Professional drain cleaning service",
  },
  {
    id: "electrical-repair",
    name: "Electrical Repair",
    category: "Electrical",
    duration: 90,
    description: "Electrical system repairs",
  },
  {
    id: "painting-interior",
    name: "Interior Painting",
    category: "Painting",
    duration: 240,
    description: "Professional interior painting",
  },
  {
    id: "painting-exterior",
    name: "Exterior Painting",
    category: "Painting",
    duration: 480,
    description: "Professional exterior painting",
  },
  {
    id: "roof-inspection",
    name: "Roof Inspection",
    category: "Roofing",
    duration: 90,
    description: "Comprehensive roof inspection",
  },
  {
    id: "gutter-cleaning",
    name: "Gutter Cleaning",
    category: "Exterior",
    duration: 60,
    description: "Complete gutter cleaning service",
  },
];

// Generate time slots from 8 AM to 6 PM
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      // Randomly mark some slots as unavailable for demo purposes
      const available = Math.random() > 0.3;
      slots.push({ time, available });
    }
  }
  return slots;
};

export default function ScheduleAppointment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes(selectedDate);
      setSelectedTime(null);
    }
  }, [selectedDate]);

  // Load available time slots from backend
  const loadAvailableTimes = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      const dateString = date.toISOString().split("T")[0];
      const response = await AppointmentsService.getAvailableTimes(dateString);

      // Convert available times to TimeSlot format
      const allSlots = generateTimeSlots();
      const availableTimes = new Set(response.available_times);

      const slots = allSlots.map((slot) => ({
        time: slot.time,
        available: availableTimes.has(slot.time),
      }));

      setTimeSlots(slots);
    } catch (err) {
      console.error("Failed to load available times:", err);
      // Fall back to generated slots if API fails
      setTimeSlots(generateTimeSlots());
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = SERVICES.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const appointmentData = {
        service_id: selectedService.id,
        service_name: selectedService.name,
        service_category: selectedService.category,
        service_duration: selectedService.duration,
        appointment_date: selectedDate.toISOString().split("T")[0],
        appointment_time: selectedTime,
      };

      await AppointmentsService.createAppointment(appointmentData);

      setSuccessMessage(
        `Appointment scheduled successfully!\n\nService: ${
          selectedService.name
        }\nDate: ${selectedDate.toLocaleDateString()}\nTime: ${formatTime(
          selectedTime
        )}`
      );

      // Reset form after successful submission
      setTimeout(() => {
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to schedule appointment:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const canSubmit =
    selectedService && selectedDate && selectedTime && !isSubmitting;

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDaysIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Schedule Appointment</h1>
          </div>
          <p className="text-base-content/70">
            Get professional home services in 4 clicks.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success mb-6">
            <CheckIcon className="h-5 w-5" />
            <span className="whitespace-pre-line">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="btn btn-ghost btn-sm"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Service */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <div className="badge badge-primary badge-lg">1</div>
                <h2 className="card-title">Select Service</h2>
              </div>

              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search for a service (e.g., HVAC, Lawn mowing, Plumbing)..."
                    className="input input-bordered w-full pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                </div>

                {/* Dropdown */}
                {isDropdownOpen && searchQuery && (
                  <div className="absolute z-10 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {filteredServices.length > 0 ? (
                      <ul className="menu p-2">
                        {filteredServices.map((service) => (
                          <li key={service.id}>
                            <button
                              type="button"
                              onClick={() => handleServiceSelect(service)}
                              className="flex flex-col items-start"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <WrenchScrewdriverIcon className="h-4 w-4 text-primary flex-shrink-0" />
                                <div className="flex-1 text-left">
                                  <div className="font-semibold">
                                    {service.name}
                                  </div>
                                  <div className="text-xs text-base-content/60">
                                    {service.category} • {service.duration} min
                                  </div>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-base-content/60">
                        No services found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Service Display */}
              {selectedService && (
                <div className="mt-4 p-4 bg-base-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CheckIcon className="h-6 w-6 text-success mt-1" />
                      <div>
                        <div className="font-semibold text-lg">
                          {selectedService.name}
                        </div>
                        <div className="text-sm text-base-content/70 mt-1">
                          {selectedService.description}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-base-content/60">
                          <span>Category: {selectedService.category}</span>
                          <span>
                            Duration: {selectedService.duration} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedService(null)}
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Date */}
          {selectedService && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <div className="badge badge-primary badge-lg">2</div>
                  <h2 className="card-title">Select Date</h2>
                </div>

                {/* Calendar */}
                <div className="w-full">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePreviousMonth}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <div className="text-lg font-semibold">{monthName}</div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-semibold text-base-content/60 py-2"
                        >
                          {day}
                        </div>
                      )
                    )}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map(
                      (_, index) => (
                        <div key={`empty-${index}`} />
                      )
                    )}

                    {/* Calendar days */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const date = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                      );
                      const disabled = isDateDisabled(date);
                      const selected = isSameDay(selectedDate, date);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDateSelect(day)}
                          disabled={disabled}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center text-sm
                            transition-all
                            ${
                              selected
                                ? "bg-primary text-primary-content font-bold scale-105"
                                : disabled
                                ? "text-base-content/30 cursor-not-allowed"
                                : "hover:bg-base-300 hover:scale-105"
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="mt-4 p-3 bg-base-200 rounded-lg flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-success" />
                    <span className="font-semibold">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {selectedService && selectedDate && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <div className="badge badge-primary badge-lg">3</div>
                  <h2 className="card-title">Select Time</h2>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() =>
                            slot.available && setSelectedTime(slot.time)
                          }
                          disabled={!slot.available}
                          className={`
                            btn btn-sm
                            ${
                              isSelected
                                ? "btn-primary"
                                : slot.available
                                ? "btn-outline"
                                : "btn-disabled"
                            }
                          `}
                        >
                          <ClockIcon className="h-4 w-4" />
                          {formatTime(slot.time)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedTime && (
                  <div className="mt-4 p-3 bg-base-200 rounded-lg flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-success" />
                    <span className="font-semibold">
                      {formatTime(selectedTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {canSubmit && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="font-semibold text-lg mb-3">
                  Appointment Summary
                </h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Service:</span>
                    <span className="font-semibold">
                      {selectedService?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Date:</span>
                    <span className="font-semibold">
                      {selectedDate?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Time:</span>
                    <span className="font-semibold">
                      {selectedTime && formatTime(selectedTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Duration:</span>
                    <span className="font-semibold">
                      {selectedService?.duration} minutes
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Scheduling...
                    </>
                  ) : (
                    "Confirm Appointment"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
