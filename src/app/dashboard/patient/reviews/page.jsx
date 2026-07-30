"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  TextField,
  Label,
  TextArea,
  FieldError,
  Modal,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import {
  getPatientReviews,
  createReview,
  updateReview,
  deleteReview,
  getPatientAppointments,
} from "@/lib/api";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function PatientReviewsPage() {
  const { dbUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [completedDoctors, setCompletedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    doctorName: "",
    appointmentId: "",
    rating: 0,
    reviewText: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const onClose = useCallback(() => setIsOpen(false), []);

  const fetchData = useCallback(async () => {
    if (!dbUser?._id) return;
    setLoading(true);
    try {
      const patientId = dbUser._id.toString();
      const [reviewData, aptData] = await Promise.all([
        getPatientReviews(patientId),
        getPatientAppointments(patientId),
      ]);
      setReviews(reviewData || []);

      const completedApts = (aptData || []).filter(
        (a) => a.appointmentStatus === "completed"
      );

      const uniqueDoctorMap = new Map();
      completedApts.forEach((apt) => {
        if (apt.doctorId && !uniqueDoctorMap.has(apt.doctorId)) {
          uniqueDoctorMap.set(apt.doctorId, {
            doctorId: apt.doctorId,
            doctorName: apt.doctorName || "Doctor",
            specialization: apt.specialization || "",
            appointmentId: apt._id,
          });
        }
      });
      setCompletedDoctors(Array.from(uniqueDoctorMap.values()));
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [dbUser?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    const errs = {};
    if (!formData.doctorId) errs.doctorId = "Please select a doctor";
    if (!formData.rating || formData.rating === 0)
      errs.rating = "Please select a rating";
    if (!formData.reviewText.trim())
      errs.reviewText = "Review text is required";
    else if (formData.reviewText.trim().length < 10)
      errs.reviewText = "Review must be at least 10 characters";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // v3 TextArea hands back a plain string, not an event.
  const handleReviewTextChange = useCallback((value) => {
    setFormData((p) => ({ ...p, reviewText: value }));
    setFormErrors((p) => (p.reviewText ? { ...p, reviewText: "" } : p));
  }, []);

  const handleRate = useCallback((r) => {
    setFormData((p) => ({ ...p, rating: r }));
    setFormErrors((p) => (p.rating ? { ...p, rating: "" } : p));
  }, []);

  const openAddModal = () => {
    setModalType("add");
    setFormData({
      doctorId: "",
      doctorName: "",
      appointmentId: "",
      rating: 0,
      reviewText: "",
    });
    setFormErrors({});
    setIsOpen(true);
  };

  const openEditModal = (review) => {
    setSelectedReview(review);
    setModalType("edit");
    setFormData({
      doctorId: review.doctorId,
      doctorName: review.doctorName || "",
      appointmentId: review.appointmentId || "",
      rating: review.rating,
      reviewText: review.reviewText,
    });
    setFormErrors({});
    setIsOpen(true);
  };

  const openDeleteModal = (review) => {
    setSelectedReview(review);
    setModalType("delete");
    setIsOpen(true);
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setActionLoading(true);
    try {
      await createReview({
        patientId: dbUser._id.toString(),
        patientName: dbUser.name || "",
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        rating: formData.rating,
        reviewText: formData.reviewText.trim(),
      });
      toast.success("Review added successfully!");
      onClose();
      fetchData();
    } catch {
      toast.error("Failed to add review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!validate()) return;
    setActionLoading(true);
    try {
      await updateReview(selectedReview._id, {
        rating: formData.rating,
        reviewText: formData.reviewText.trim(),
      });
      toast.success("Review updated successfully!");
      onClose();
      fetchData();
    } catch {
      toast.error("Failed to update review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    setActionLoading(true);
    try {
      await deleteReview(selectedReview._id);
      toast.success("Review deleted successfully!");
      onClose();
      fetchData();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your reviews..." />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">My Reviews</h1>
          <p className="text-slate-400 text-sm mt-1">
            Share your experience with doctors you have visited
          </p>
        </div>
        {completedDoctors.length > 0 && (
          <Button
            onPress={openAddModal}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/20 h-10 px-4 rounded-xl flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Review
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card className="glass-card border border-white/10">
          <Card.Content className="p-16 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg">No Reviews Yet</p>
              <p className="text-slate-400 text-sm mt-1">
                {completedDoctors.length > 0
                  ? "Share your experience with doctors you have visited."
                  : "Complete an appointment first before leaving a review."}
              </p>
            </div>
            {completedDoctors.length > 0 && (
              <Button
                onPress={openAddModal}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold h-10 px-5 rounded-xl"
              >
                Write a Review
              </Button>
            )}
          </Card.Content>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Card
              key={review._id}
              className="glass-card border border-white/10 hover:border-white/15 transition-all"
            >
              <Card.Content className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">
                      {(review.doctorName || "D")[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-bold">
                          {review.doctorName || "Doctor"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onPress={() => openEditModal(review)}
                          className="bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs h-8 px-3 rounded-lg"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onPress={() => openDeleteModal(review)}
                          className="bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 px-3 rounded-lg"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-amber-400 font-bold text-sm">
                        {review.rating}/5
                      </span>
                      <span className="text-slate-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      {review.reviewText}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen && (modalType === "add" || modalType === "edit")}
          onOpenChange={setIsOpen}
        >
          <Modal.Container size="md">
            <Modal.Dialog className="bg-[#0d1b2a] border border-white/15">
              <Modal.Header className="border-b border-white/10">
                <Modal.Heading className="text-white font-bold">
                  {modalType === "add" ? "Write a Review" : "Edit Review"}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-5 py-1">
                  {modalType === "add" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-400 text-sm font-medium">
                        Select Doctor
                      </label>
                      {completedDoctors.length === 0 ? (
                        <p className="text-slate-500 text-sm p-3 rounded-xl bg-white/5 border border-white/5">
                          No completed appointments found.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {completedDoctors.map((doc) => (
                            <button
                              key={doc.doctorId}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  doctorId: doc.doctorId,
                                  doctorName: doc.doctorName,
                                  appointmentId: doc.appointmentId,
                                }))
                              }
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                formData.doctorId === doc.doctorId
                                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                                  : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center shrink-0">
                                <span className="text-cyan-400 font-bold text-sm">
                                  {(doc.doctorName || "D")[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {doc.doctorName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {doc.specialization}
                                </p>
                              </div>
                              {formData.doctorId === doc.doctorId && (
                                <svg
                                  className="w-5 h-5 text-cyan-400 ml-auto"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {formErrors.doctorId && (
                        <p className="text-red-400 text-xs">
                          {formErrors.doctorId}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-400 text-sm font-medium">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                      <StarRating
                        rating={formData.rating}
                        size="lg"
                        interactive
                        onRate={handleRate}
                      />
                      <span className="text-slate-300 text-sm font-medium">
                        {formData.rating > 0
                          ? `${formData.rating}/5 — ${
                              [
                                "",
                                "Poor",
                                "Fair",
                                "Good",
                                "Very Good",
                                "Excellent",
                              ][formData.rating]
                            }`
                          : "Click to rate"}
                      </span>
                    </div>
                    {formErrors.rating && (
                      <p className="text-red-400 text-xs">
                        {formErrors.rating}
                      </p>
                    )}
                  </div>

                  <TextField
                    name="reviewText"
                    value={formData.reviewText}
                    onChange={handleReviewTextChange}
                    isInvalid={!!formErrors.reviewText}
                    className="w-full"
                  >
                    <Label className="text-slate-400 text-sm mb-1.5 block">
                      Your Review
                    </Label>
                    <TextArea
                      placeholder="Share your experience with this doctor..."
                      rows={4}
                      className="w-full p-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none resize-none"
                    />
                    {formErrors.reviewText && (
                      <FieldError className="text-red-400 text-xs mt-1">
                        {formErrors.reviewText}
                      </FieldError>
                    )}
                  </TextField>
                </div>
              </Modal.Body>
              <Modal.Footer className="border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 text-sm font-semibold transition-all hover:bg-white/5 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={modalType === "add" ? handleAdd : handleEdit}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Submitting..."
                    : modalType === "add"
                      ? "Submit Review"
                      : "Update Review"}
                </button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Delete Modal */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen && modalType === "delete"}
          onOpenChange={setIsOpen}
        >
          <Modal.Container size="sm">
            <Modal.Dialog className="bg-[#0d1b2a] border border-white/15">
              <Modal.Header className="border-b border-white/10">
                <Modal.Heading className="text-white font-bold">
                  Delete Review
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-slate-400 text-sm py-2">
                  Are you sure you want to delete your review for{" "}
                  <span className="text-white font-semibold">
                    {selectedReview?.doctorName}
                  </span>
                  ? This action cannot be undone.
                </p>
              </Modal.Body>
              <Modal.Footer className="border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 text-sm font-semibold transition-all hover:bg-white/5 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Delete Review"}
                </button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}