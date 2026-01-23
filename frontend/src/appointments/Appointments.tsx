import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import * as AppointmentsService from "./AppointmentsService";
import type { Appointment } from "./AppointmentsService";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AppointmentsService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <div className="badge badge-warning badge-light">Pending</div>;
      case "confirmed":
        return <div className="badge badge-info badge-light">Confirmed</div>;
      case "completed":
        return <div className="badge badge-success badge-light">Completed</div>;
      case "cancelled":
        return <div className="badge badge-error badge-light">Cancelled</div>;
      default:
        return <div className="badge">{status}</div>;
    }
  };

  const activeAppointments = appointments.filter(
    (apt) => apt.status !== "cancelled" && apt.status !== "completed",
  );

  return <div>TODO</div>;

  // return (
  //   <div className="min-h-screen bg-base-100 p-6">
  //     <div className="max-w-6xl mx-auto">
  //       {/* Header */}
  //       <div className="flex items-center justify-between mb-8">
  //         <div>
  //           <div className="flex items-center gap-3 mb-2">
  //             <CalendarDaysIcon className="h-8 w-8 text-primary" />
  //             <h1 className="text-3xl font-bold">Appointments</h1>
  //           </div>
  //           <p className="text-base-content/70">
  //             View and manage your home service appointments
  //           </p>
  //         </div>
  //         <Link to="/account/appointment" className="btn btn-primary gap-2">
  //           <PlusIcon className="h-5 w-5" />
  //           Make an Appointment
  //         </Link>
  //       </div>

  //       {/* Error Alert */}
  //       {error && (
  //         <div className="alert alert-error mb-6">
  //           <XCircleIcon className="h-5 w-5" />
  //           <span>{error}</span>
  //           <button
  //             onClick={() => setError(null)}
  //             className="btn btn-ghost btn-sm"
  //           >
  //             Dismiss
  //           </button>
  //         </div>
  //       )}

  //       {/* Loading State */}
  //       {loading ? (
  //         <div className="flex justify-center items-center py-20">
  //           <span className="loading loading-spinner loading-lg"></span>
  //         </div>
  //       ) : activeAppointments.length === 0 ? (
  //         /* Empty State */
  //         <div className="card bg-base-100 shadow-xl">
  //           <div className="card-body items-center text-center py-16">
  //             <CalendarDaysIcon className="h-20 w-20 text-base-content/20 mb-4" />
  //             <h2 className="text-2xl font-bold mb-2">
  //               No Active Appointments
  //             </h2>
  //             <p className="text-base-content/60 mb-6 max-w-md">
  //               You don't have any active appointments scheduled. Get started by
  //               booking your first home service appointment.
  //             </p>
  //             <Link to="/account/appointment" className="btn btn-primary gap-2">
  //               <PlusIcon className="h-5 w-5" />
  //               Schedule Your First Appointment
  //             </Link>
  //           </div>
  //         </div>
  //       ) : (
  //         /* Appointments List */
  //         <div className="space-y-4">
  //           {activeAppointments.map((appointment) => (
  //             <div
  //               key={appointment.id}
  //               className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
  //             >
  //               <div className="card-body">
  //                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
  //                   {/* Left Section - Service Info */}
  //                   <div className="flex-1">
  //                     <div className="flex items-start gap-3 mb-3">
  //                       <div className="p-2 bg-primary/10 rounded-lg">
  //                         <CalendarDaysIcon className="h-6 w-6 text-primary" />
  //                       </div>
  //                       <div>
  //                         <h3 className="text-xl font-bold mb-1">
  //                           {appointment.service_name}
  //                         </h3>
  //                         <p className="text-sm text-base-content/60">
  //                           {appointment.service_category}
  //                         </p>
  //                       </div>
  //                     </div>

  //                     {/* Date and Time */}
  //                     <div className="space-y-2 ml-14">
  //                       <div className="flex items-center gap-2 text-base-content/80">
  //                         <CalendarDaysIcon className="h-5 w-5" />
  //                         <span className="font-medium">
  //                           {formatDate(appointment.appointment_date)}
  //                         </span>
  //                       </div>
  //                       <div className="flex items-center gap-2 text-base-content/80">
  //                         <ClockIcon className="h-5 w-5" />
  //                         <span className="font-medium">
  //                           {formatTime(appointment.appointment_time)}
  //                         </span>
  //                         <span className="text-sm text-base-content/60">
  //                           ({appointment.service_duration} minutes)
  //                         </span>
  //                       </div>
  //                     </div>

  //                     {/* Notes */}
  //                     {appointment.notes && (
  //                       <div className="mt-3 ml-14">
  //                         <p className="text-sm text-base-content/70 italic">
  //                           "{appointment.notes}"
  //                         </p>
  //                       </div>
  //                     )}
  //                   </div>

  //                   {/* Right Section - Status */}
  //                   <div className="flex flex-col items-start sm:items-end gap-2">
  //                     {getStatusBadge(appointment.status)}
  //                     <div className="text-xs text-base-content/50">
  //                       ID: {String(appointment.id).slice(0, 8)}
  //                     </div>
  //                   </div>
  //                 </div>

  //                 {/* Action Buttons */}
  //                 <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300">
  //                   <button
  //                     className="btn btn-ghost btn-sm"
  //                     onClick={() => {
  //                       // Handle view details
  //                       console.log("View details:", appointment.id);
  //                     }}
  //                   >
  //                     View Details
  //                   </button>
  //                   {appointment.status === "pending" && (
  //                     <button
  //                       className="btn btn-error btn-sm btn-outline"
  //                       onClick={async () => {
  //                         if (
  //                           window.confirm(
  //                             "Are you sure you want to cancel this appointment?"
  //                           )
  //                         ) {
  //                           try {
  //                             await AppointmentsService.cancelAppointment(
  //                               appointment.id
  //                             );
  //                             loadAppointments();
  //                           } catch (err) {
  //                             console.error(
  //                               "Failed to cancel appointment:",
  //                               err
  //                             );
  //                             setError("Failed to cancel appointment");
  //                           }
  //                         }
  //                       }}
  //                     >
  //                       Cancel
  //                     </button>
  //                   )}
  //                 </div>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       )}

  //       {/* Show completed/cancelled appointments count if any */}
  //       {appointments.length > activeAppointments.length && (
  //         <div className="mt-8 text-center">
  //           <p className="text-sm text-base-content/60">
  //             {appointments.length - activeAppointments.length} completed or
  //             cancelled appointment(s)
  //           </p>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
}
