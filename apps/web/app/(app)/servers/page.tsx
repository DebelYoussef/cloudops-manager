
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";

type ServerStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

type Project = {
  id: string;
  name: string;
};

type Environment = {
  id: string;
  name: string;
  projectId: string;
};

type Server = {
  id: string;
  name: string;
  provider: string;
  region: string;
  cpuCores: number;
  ramGb: number;
  storageGb: number;
  ipAddress: string;
  status: ServerStatus;
  environmentId: string;
  environment?: Environment & {
    project?: Project;
  };
  createdAt?: string;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

type ServerForm = {
  name: string;
  provider: string;
  region: string;
  cpuCores: string;
  ramGb: string;
  storageGb: string;
  ipAddress: string;
  status: ServerStatus;
  environmentId: string;
};

const emptyForm: ServerForm = {
  name: "",
  provider: "",
  region: "",
  cpuCores: "2",
  ramGb: "4",
  storageGb: "50",
  ipAddress: "",
  status: "ONLINE",
  environmentId: "",
};

const statusLabels: Record<ServerStatus, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  MAINTENANCE: "Maintenance",
};

const statusStyles: Record<ServerStatus, string> = {
  ONLINE: "bg-green-100 text-green-700",
  OFFLINE: "bg-red-100 text-red-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
};

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [form, setForm] = useState<ServerForm>(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState<Server | null>(null);

  // Load projects and their environments.
  useEffect(() => {
    async function loadEnvironments() {
      try {
        const response = await apiFetch<PaginatedResponse<Project>>(
          "/projects?page=1&limit=100"
        );

        const projectList = response.data ?? [];
        setProjects(projectList);

        const environmentLists = await Promise.all(
          projectList.map((project) =>
            apiFetch<Environment[]>(
              `/projects/${project.id}/environments`
            )
          )
        );

        setEnvironments(
          environmentLists.flat().map((environment) => ({
            ...environment,
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les environnements."
        );
      }
    }

    loadEnvironments();
  }, []);

  // Load servers with backend filters and pagination.
  const loadServers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) params.set("q", search.trim());
      if (provider.trim()) params.set("provider", provider.trim());
      if (region.trim()) params.set("region", region.trim());
      if (status) params.set("status", status);
      if (environmentId) params.set("environmentId", environmentId);

      const response = await apiFetch<PaginatedResponse<Server>>(
        `/servers?${params.toString()}`
      );

      setServers(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les serveurs."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, provider, region, status, environmentId]);


  useEffect(() => {
  let cancelled = false;

  async function fetchServers() {
    if (cancelled) return;
    await loadServers();
  }

  void fetchServers();

  return () => {
    cancelled = true;
  };
}, [loadServers]);


  const totalPages = Math.max(1, Math.ceil(total / limit));

  const onlineCount = useMemo(
    () => servers.filter((server) => server.status === "ONLINE").length,
    [servers]
  );

  function openCreateModal() {
    setEditingServer(null);
    setForm({
      ...emptyForm,
      environmentId: environments[0]?.id ?? "",
    });
    setModalOpen(true);
  }

  function openEditModal(server: Server) {
    setEditingServer(server);
    setForm({
      name: server.name,
      provider: server.provider,
      region: server.region,
      cpuCores: String(server.cpuCores),
      ramGb: String(server.ramGb),
      storageGb: String(server.storageGb),
      ipAddress: server.ipAddress,
      status: server.status,
      environmentId: server.environmentId,
    });
    setModalOpen(true);
  }

  function updateForm<K extends keyof ServerForm>(
    field: K,
    value: ServerForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      provider: form.provider.trim(),
      region: form.region.trim(),
      cpuCores: Number(form.cpuCores),
      ramGb: Number(form.ramGb),
      storageGb: Number(form.storageGb),
      ipAddress: form.ipAddress.trim(),
      status: form.status,
      environmentId: form.environmentId,
    };

    try {
      if (editingServer) {
        await apiFetch<Server>(`/servers/${editingServer.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<Server>("/servers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      setEditingServer(null);
      setForm(emptyForm);
      await loadServers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Enregistrement impossible."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setSaving(true);
    setError("");

    try {
      await apiFetch(`/servers/${deleteTarget.id}`, {
        method: "DELETE",
      });

      setDeleteTarget(null);

      if (servers.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadServers();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Suppression impossible."
      );
    } finally {
      setSaving(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setProvider("");
    setRegion("");
    setStatus("");
    setEnvironmentId("");
    setPage(1);
  }

  const projectName = (id: string) =>
    projects.find((project) => project.id === id)?.name ?? "Projet";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servers"
        description="Manage your infrastructure servers and monitor their status."
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-3 font-semibold underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total servers</p>
          <p className="mt-2 text-3xl font-bold">{total}</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Online servers on this page
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {onlineCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">
              Search
            </label>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Server name or IP address..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Provider
            </label>
            <input
              value={provider}
              onChange={(event) => {
                setProvider(event.target.value);
                setPage(1);
              }}
              placeholder="AWS, Azure..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Region
            </label>
            <input
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                setPage(1);
              }}
              placeholder="eu-west-1..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Environment
            </label>
            <select
              value={environmentId}
              onChange={(event) => {
                setEnvironmentId(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All environments</option>
              {environments.map((environment) => (
                <option key={environment.id} value={environment.id}>
                  {projectName(environment.projectId)} / {environment.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Reset filters
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            disabled={environments.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add server
          </button>
        </div>

        {environments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Create a project and at least one environment before adding a server.
          </p>
        )}
      </div>

      {/* Servers table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">Server inventory</h2>
            <p className="text-sm text-muted-foreground">
              {total} server(s) found
            </p>
          </div>

          <button
            type="button"
            onClick={loadServers}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading servers...
          </div>
        ) : servers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium">No servers found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a server or change your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Server</th>
                  <th className="px-4 py-3 font-medium">Provider / Region</th>
                  <th className="px-4 py-3 font-medium">Resources</th>
                  <th className="px-4 py-3 font-medium">Environment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <p className="font-medium">{server.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {server.ipAddress}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p>{server.provider}</p>
                      <p className="text-xs text-muted-foreground">
                        {server.region}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p>{server.cpuCores} CPU cores</p>
                      <p className="text-xs text-muted-foreground">
                        {server.ramGb} GB RAM · {server.storageGb} GB storage
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p>{server.environment?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {projectName(server.environmentId ? (
                          environments.find((env) => env.id === server.environmentId)?.projectId ?? ""
                        ) : "")}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[server.status]}`}
                      >
                        {statusLabels[server.status]}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(server)}
                          className="rounded-md border px-3 py-1.5 hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(server)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((previous) => previous + 1)}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-background p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingServer ? "Edit server" : "Add server"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the server configuration.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md px-3 py-1 hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Server name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                    placeholder="Production Server"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Provider
                  </label>
                  <input
                    required
                    value={form.provider}
                    onChange={(event) => updateForm("provider", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                    placeholder="AWS, Azure, GCP..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Region
                  </label>
                  <input
                    required
                    value={form.region}
                    onChange={(event) => updateForm("region", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                    placeholder="eu-west-1"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    IP address
                  </label>
                  <input
                    required
                    value={form.ipAddress}
                    onChange={(event) => updateForm("ipAddress", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                    placeholder="192.168.1.10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    CPU cores
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.cpuCores}
                    onChange={(event) => updateForm("cpuCores", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    RAM (GB)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.ramGb}
                    onChange={(event) => updateForm("ramGb", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Storage (GB)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.storageGb}
                    onChange={(event) => updateForm("storageGb", event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value as ServerStatus)
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Project environment
                  </label>
                  <select
                    required
                    value={form.environmentId}
                    onChange={(event) =>
                      updateForm("environmentId", event.target.value)
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  >
                    <option value="">Select an environment</option>
                    {environments.map((environment) => (
                      <option key={environment.id} value={environment.id}>
                        {projectName(environment.projectId)} / {environment.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.environmentId}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingServer
                      ? "Save changes"
                      : "Create server"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete server?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
