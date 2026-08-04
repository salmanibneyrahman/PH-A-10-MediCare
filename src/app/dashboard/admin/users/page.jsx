"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Avatar,
  TextField,
  Label,
  Input,
  Modal,
} from "@heroui/react";
import { getUsers, deleteUser, updateUserStatus } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function AdminUsersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState("");
  const [activeRole, setActiveRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (activeRole !== "all") {
      result = result.filter((u) => u.role === activeRole);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, users, activeRole]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
      setFiltered(data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const onClose = useCallback(() => setIsOpen(false), []);

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setIsOpen(true);
  };

  const handleSearchChange = useCallback((value) => setSearch(value), []);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(selectedUser._id);
      toast.success("User deleted successfully");
      onClose();
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setActionLoading(true);
    try {
      const newStatus =
        selectedUser.status === "suspended" ? "active" : "suspended";
      await updateUserStatus(selectedUser._id, newStatus);
      toast.success(
        `User ${newStatus === "suspended" ? "suspended" : "activated"} successfully`
      );
      onClose();
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const roleFilters = ["all", "patient", "doctor", "admin"];

  const roleColors = {
    admin: "bg-red-500/15 text-red-400 border-red-500/30",
    doctor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    patient: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manage Users</h1>
          <p className="text-slate-400 text-sm mt-1">
            View, suspend or remove platform users
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-indigo-400 text-sm font-medium">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <TextField
          name="search"
          value={search}
          onChange={handleSearchChange}
          className="w-full"
        >
          <Label className="sr-only">Search users</Label>
          <div className="relative w-full">
            <svg
              className="w-4 h-4 text-slate-500 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search by name or email..."
              className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
            />
          </div>
        </TextField>

        <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 shrink-0">
          {roleFilters.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeRole === role
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="glass-card border border-white/10">
        <Card.Content className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <svg
                className="w-16 h-16 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-slate-400 font-medium">No users found</p>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((u) => (
                  <div key={u._id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" className="shrink-0">
                        <Avatar.Image
                          src={u.photo || u.image || ""}
                          alt={u.name || "User"}
                        />
                        <Avatar.Fallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-sm truncate">
                          {u.name}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${roleColors[u.role] || roleColors.patient
                          }`}
                      >
                        {u.role || "patient"}
                      </span>
                      <StatusBadge status={u.status || "active"} />
                      <span className="text-slate-500 text-xs ml-auto">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onPress={() => openModal(u, "suspend")}
                        className={`flex-1 text-xs h-8 rounded-lg bg-transparent border ${u.status === "suspended"
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          }`}
                      >
                        {u.status === "suspended" ? "Activate" : "Suspend"}
                      </Button>
                      <Button
                        size="sm"
                        onPress={() => openModal(u, "delete")}
                        className="flex-1 text-xs h-8 rounded-lg bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm" className="shrink-0">
                              <Avatar.Image
                                src={u.photo || u.image || ""}
                                alt={u.name || "User"}
                              />
                              <Avatar.Fallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                                {u.name?.[0]?.toUpperCase() || "U"}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate">
                                {u.name}
                              </p>
                              <p className="text-slate-500 text-xs truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${roleColors[u.role] || roleColors.patient
                              }`}
                          >
                            {u.role || "patient"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={u.status || "active"} />
                        </td>
                        <td className="text-slate-400 text-sm">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                            : "—"}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onPress={() => openModal(u, "suspend")}
                              className={`text-xs h-8 px-3 rounded-lg bg-transparent border ${u.status === "suspended"
                                  ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                  : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                }`}
                            >
                              {u.status === "suspended" ? "Activate" : "Suspend"}
                            </Button>
                            <Button
                              size="sm"
                              onPress={() => openModal(u, "delete")}
                              className="text-xs h-8 px-3 rounded-lg bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Delete Modal */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen && modalType === "delete"}
          onOpenChange={setIsOpen}
        >
          <Modal.Container size="sm">
            <Modal.Dialog className="glass-card border border-white/10">
              <Modal.Header className="border-b border-white/10">
                <Modal.Heading className="text-white font-bold">
                  Delete User
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-slate-400 text-sm py-2">
                  Are you sure you want to permanently delete{" "}
                  <span className="text-white font-semibold">
                    {selectedUser?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </Modal.Body>
              <Modal.Footer className="border-t border-white/10">
                <Button
                  onPress={onClose}
                  className="bg-transparent border border-white/15 text-slate-300 h-9 px-4 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleDelete}
                  isPending={actionLoading}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold h-9 px-4 rounded-lg"
                >
                  Delete User
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Suspend Modal */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen && modalType === "suspend"}
          onOpenChange={setIsOpen}
        >
          <Modal.Container size="sm">
            <Modal.Dialog className="glass-card border border-white/10">
              <Modal.Header className="border-b border-white/10">
                <Modal.Heading className="text-white font-bold">
                  {selectedUser?.status === "suspended"
                    ? "Activate User"
                    : "Suspend User"}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-slate-400 text-sm py-2">
                  Are you sure you want to{" "}
                  {selectedUser?.status === "suspended"
                    ? "activate"
                    : "suspend"}{" "}
                  <span className="text-white font-semibold">
                    {selectedUser?.name}
                  </span>
                  ?{" "}
                  {selectedUser?.status !== "suspended" &&
                    "They will not be able to access the platform."}
                </p>
              </Modal.Body>
              <Modal.Footer className="border-t border-white/10">
                <Button
                  onPress={onClose}
                  className="bg-transparent border border-white/15 text-slate-300 h-9 px-4 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleStatusToggle}
                  isPending={actionLoading}
                  className={`text-white font-semibold h-9 px-4 rounded-lg ${selectedUser?.status === "suspended"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                      : "bg-gradient-to-r from-amber-500 to-orange-600"
                    }`}
                >
                  {selectedUser?.status === "suspended"
                    ? "Activate"
                    : "Suspend"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}