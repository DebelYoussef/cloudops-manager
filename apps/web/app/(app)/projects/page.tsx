
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderKanban,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type ProjectStatus = "ACTIVE" | "ARCHIVED";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: string;
}

interface ProjectResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

const emptyForm = {
  name: "",
  description: "",
  status: "ACTIVE" as ProjectStatus,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Fetch projects without modifying React state.
  const fetchProjects = useCallback(async (): Promise<ProjectResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    return apiFetch<ProjectResponse>(
      `/projects?${params.toString()}`
    );
  }, [page, search, status]);

  // Automatic loading when page, search or status changes.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchProjects();

        if (cancelled) return;

        setProjects(result.data ?? []);
        setTotal(result.total ?? 0);
        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load projects."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchProjects]);

  // Manual refresh after user actions.
  async function refreshProjects() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchProjects();

      setProjects(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProject(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);

    setForm({
      name: project.name,
      description: project.description ?? "",
      status: project.status,
    });

    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        ...(editingProject
          ? { status: form.status }
          : {}),
      };

      if (editingProject) {
        await apiFetch(`/projects/${editingProject.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      setForm(emptyForm);
      setEditingProject(null);

      await refreshProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Save failed."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(project.id);
    setError("");

    try {
      await apiFetch(`/projects/${project.id}`, {
        method: "DELETE",
      });

      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refreshProjects();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Projects
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your projects, teams and environments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total projects
              </p>

              <p className="mt-2 text-3xl font-bold">
                {total}
              </p>
            </div>

            <FolderKanban className="text-primary" size={28} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Current page
          </p>

          <p className="mt-2 text-3xl font-bold">
            {page} / {totalPages}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search projects..."
            className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={status}
          onChange={(e) => handleStatus(e.target.value)}
          className="h-11 rounded-lg border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <button
          onClick={() => void refreshProjects()}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Projects table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="font-semibold">All Projects</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and organize your projects.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Description</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Created</th>
                <th className="px-5 py-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <RefreshCw
                      className="mx-auto animate-spin text-primary"
                      size={24}
                    />

                    <p className="mt-3 text-muted-foreground">
                      Loading projects...
                    </p>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <FolderKanban
                      className="mx-auto text-muted-foreground"
                      size={32}
                    />

                    <p className="mt-3 font-medium">
                      No projects found
                    </p>

                    <p className="mt-1 text-muted-foreground">
                      Create your first project to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {project.name}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {project.id.slice(0, 8)}
                      </div>
                    </td>

                    <td className="max-w-xs truncate px-5 py-4 text-muted-foreground">
                      {project.description || "No description"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          project.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {new Date(
                        project.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(project)}
                          title="Edit project"
                          aria-label={`Edit ${project.name}`}
                          className="rounded-md p-2 hover:bg-muted"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => void handleDelete(project)}
                          disabled={deletingId === project.id}
                          title="Delete project"
                          aria-label={`Delete ${project.name}`}
                          className="rounded-md p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t p-4">
          <p className="text-sm text-muted-foreground">
            {total} project(s)
          </p>

          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              aria-label="Previous page"
              className="rounded-md border p-2 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm">
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Next page"
              className="rounded-md border p-2 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your project information.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-md p-2 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="project-name"
                  className="text-sm font-medium"
                >
                  Project name *
                </label>

                <input
                  id="project-name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. CloudOps Platform"
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="project-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  rows={4}
                  maxLength={500}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your project..."
                  className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {editingProject && (
                <div className="space-y-2">
                  <label
                    htmlFor="project-status"
                    className="text-sm font-medium"
                  >
                    Status
                  </label>

                  <select
                    id="project-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Save changes"
                      : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
