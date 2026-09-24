import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useModalStore } from "@/store/business-modal-store";
import { useCreateFollowUp } from "@/hooks/use-business-add-follow-ups";
import { X, Calendar } from "lucide-react";

// 1. Define your form structure
type FollowUpFormValues = {
  date: string;
  assignedTo: string;
  reminder: string;
};

export function AddFollowUpModal() {
  // Zustand Store
  const { isFollowUpModalOpen, closeFollowUpModal, activeBusinessId } = useModalStore();
  
  // TanStack Mutation
  const createFollowUpMutation = useCreateFollowUp();

  // React-Hook-Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FollowUpFormValues>({
    mode: "onSubmit",
  });

  // 2. Clean Submit Handler
  const onSubmit: SubmitHandler<FollowUpFormValues> = async (values) => {
    if (!activeBusinessId) return;

    try {
      // Use mutateAsync to wait for the API to finish
      await createFollowUpMutation.mutateAsync({
        businessId: activeBusinessId,
        assignedTo: values.assignedTo,
        type: "CALL",
        scheduledAt: new Date(values.date).toISOString(),
        status: "SCHEDULED",
        notes: values.reminder, // Using your reminder field as notes for now
      });
      
      reset(); // Clear the form
      closeFollowUpModal(); // Close the modal
    } catch {
      // We don't need to do anything here because the hook handles the error toast!
    }
  };

  if (!isFollowUpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">New Follow Up</h2>
          <button onClick={closeFollowUpModal} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
        </div>

        {/* 3. Wrap inputs in a form tag and connect handleSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Date Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Follow Up Date</label>
            <div className="relative mt-1.5">
              <input 
                type="date" 
                className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 bg-transparent relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:right-0 ${errors.date ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"}`} 
                {...register("date", { required: "Please select a date" })}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-0" />
            </div>
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          {/* Assigned To */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</label>
            <select 
              className={`w-full mt-1.5 p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 bg-white ${errors.assignedTo ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"}`}
              {...register("assignedTo", { required: "Please select an assignee" })}
            >
              <option value="">Select Assignee...</option>
              <option value="6aa2c03fcc6d18130f9c2f1c">Amit Sharma</option>
            </select>
            {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo.message}</p>}
          </div>

          {/* Reminder */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reminder</label>
            <select 
              className={`w-full mt-1.5 p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 bg-white ${errors.reminder ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"}`}
              {...register("reminder", { required: "Please select a reminder" })}
            >
              <option value="">Select Reminder...</option>
              <option value="Before 15 Minutes">Before 15 Minutes</option>
            </select>
            {errors.reminder && <p className="text-xs text-red-500 mt-1">{errors.reminder.message}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3 mt-8">
            <button type="button" onClick={closeFollowUpModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button 
              type="submit" 
              disabled={createFollowUpMutation.isPending}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
            >
              {createFollowUpMutation.isPending ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}