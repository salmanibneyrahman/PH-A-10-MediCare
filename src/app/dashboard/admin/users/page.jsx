"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { getUsers, deleteUser, updateUserStatus } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function AdminUsersPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
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

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    onOpen();
  };

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
        <Input
          placeholder="Search by name or email..."
          value={search}
          onValueChange={setSearch}
          classNames={{
            inputWrapper:
              "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
            input: "text-slate-200 placeholder:text-slate-500 text-sm",
          }}
          startContent={
            <svg
              className="w-4 h-4 text-slate-500 shrink-0"
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
          }
        />
        <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 shrink-0">
          {roleFilters.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeRole === role
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
        <CardBody className="p-0">
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
            <div className="overflow-x-auto">
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
                          <Avatar
                            src={u.image || u.photo || ""}
                            name={u.name || "U"}
                            size="sm"
                            classNames={{
                              base: "bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0",
                              name: "text-white font-bold text-xs",
                            }}
                          />
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
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                            roleColors[u.role] || roleColors.patient
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
                          ? new Date(u.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—"}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="bordered"
                            onClick={() => openModal(u, "suspend")}
                            className={`text-xs ${
                              u.status === "suspended"
                                ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            }`}
                          >
                            {u.status === "suspended" ? "Activate" : "Suspend"}
                          </Button>
                          <Button
                            size="sm"
                            variant="bordered"
                            onClick={() => openModal(u, "delete")}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
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
          )}
        </CardBody>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={isOpen && modalType === "delete"}
        onClose={onClose}
        size="sm"
        classNames={{
          base: "glass-card border border-white/10",
          header: "border-b border-white/10",
          footer: "border-t border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-white font-bold">Delete User</h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-400 text-sm py-2">
              Are you sure you want to permanently delete{" "}
              <span className="text-white font-semibold">
                {selectedUser?.name}
              </span>
              ? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={onClose}
              className="border-white/15 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              isLoading={actionLoading}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold"
            >
              Delete User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        isOpen={isOpen && modalType === "suspend"}
        onClose={onClose}
        size="sm"
        classNames={{
          base: "glass-card border border-white/10",
          header: "border-b border-white/10",
          footer: "border-t border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-white font-bold">
              {selectedUser?.status === "suspended"
                ? "Activate User"
                : "Suspend User"}
            </h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-400 text-sm py-2">
              Are you sure you want to{" "}
              {selectedUser?.status === "suspended" ? "activate" : "suspend"}{" "}
              <span className="text-white font-semibold">
                {selectedUser?.name}
              </span>
              ?{" "}
              {selectedUser?.status !== "suspended" &&
                "They will not be able to access the platform."}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={onClose}
              className="border-white/15 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onPress={handleStatusToggle}
              isLoading={actionLoading}
              className={`text-white font-semibold ${
                selectedUser?.status === "suspended"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                  : "bg-gradient-to-r from-amber-500 to-orange-600"
              }`}
            >
              {selectedUser?.status === "suspended"
                ? "Activate"
                : "Suspend"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}