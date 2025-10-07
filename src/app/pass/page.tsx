"use client";

import { useState, useEffect, useCallback } from "react";
import { request } from "@/utils/requestHandler";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "react-hot-toast";

interface VaultItem {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const [form, setForm] = useState({
    id: "",
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]); // track expanded items

  const fetchVault = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await request("/pass", {}, "GET");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVault();
  }, [user, fetchVault]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const endpoint = form.id ? `/pass/${form.id}` : "/pass";
      const method = form.id ? "PATCH" : "POST";
      const res = await request(endpoint, form, method);
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setForm({ id: "", title: "", username: "", password: "", url: "", notes: "" });
        setModalOpen(false);
        fetchVault();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (item: VaultItem) => {
    setForm({
      id: item.id,
      title: item.title,
      username: item.username,
      password: item.password,
      url: item.url ?? "",
      notes: item.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const res = await request(`/pass/${deleteId}`, {}, "DELETE");
      const data = await res.json();
      if (data.success) {
        toast.success("Deleted successfully");
        fetchVault();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId("");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
    setTimeout(() => navigator.clipboard.writeText(""), 20000);
  };

  const toggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((i) => i !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );



  const [showGenerator, setShowGenerator] = useState(false);
  const [genOptions, setGenOptions] = useState({
    length: 16,
    letters: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // exclude look-alikes
    const numbers = "23456789";
    const symbols = "!@#$%^&*()-_=+[]{}<>?";

    let charset = "";
    if (genOptions.letters) charset += letters;
    if (genOptions.numbers) charset += numbers;
    if (genOptions.symbols) charset += symbols;

    if (!charset) return;

    let password = "";
    for (let i = 0; i < genOptions.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setForm({ ...form, password });
  };




  return (
    <div className="w-full flex flex-col items-center bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-6">Password Vault</h1>

      {/* Add New Button */}
      <button
        className="mb-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
        onClick={() => setModalOpen(true)}
      >
        Add New Password
      </button>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm mb-4 p-2 bg-black border border-gray-700 rounded"
      />

      {loading ? (
        <p>Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="w-full max-w-md space-y-2">
          {filteredItems.map((item) => {
            const isExpanded = expandedIds.includes(item.id);
            return (
              <div key={item.id} className="bg-gray-900 rounded border border-gray-700 overflow-hidden">
                {/* Title header */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-800"
                >
                  <span className="font-semibold">{item.title}</span>
                  <span>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 py-3 border-t border-gray-700 space-y-2">
                    <p><strong>Username:</strong> {item.username}</p>
                    <p className="flex items-center">
                      <strong>Password:</strong> {item.password}
                      <button onClick={() => handleCopy(item.password)} className="ml-2 px-2 py-1 bg-gray-700 rounded text-sm">Copy</button>
                    </p>
                    {item.url && <p><strong>URL:</strong> {item.url}</p>}
                    {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-yellow-600 rounded text-sm">Edit</button>
                      <button onClick={() => { setDeleteId(item.id); setDeleteModalOpen(true); }} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Update Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{form.id ? "Edit Password" : "Add New Password"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="flex-1 p-2 bg-black border border-gray-700 rounded"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowGenerator(!showGenerator)}
                    className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                  >
                    Generate
                  </button>
                </div>

                {/* Generator controls */}
                {showGenerator && (
                  <div className="mt-2 p-2 border border-gray-700 rounded bg-gray-800 space-y-2">
                    <div>
                      <label>Length: {genOptions.length}</label>
                      <input
                        type="range"
                        min={8}
                        max={32}
                        value={genOptions.length}
                        onChange={(e) => setGenOptions({ ...genOptions, length: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={genOptions.letters}
                          onChange={(e) => setGenOptions({ ...genOptions, letters: e.target.checked })}
                        /> Letters
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={genOptions.numbers}
                          onChange={(e) => setGenOptions({ ...genOptions, numbers: e.target.checked })}
                        /> Numbers
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={genOptions.symbols}
                          onChange={(e) => setGenOptions({ ...genOptions, symbols: e.target.checked })}
                        /> Symbols
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-1 bg-green-600 rounded hover:bg-green-500"
                    >
                      Generate Password
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1">URL (optional)</label>
                <input
                  type="text"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded">{form.id ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-sm text-center">
            <p className="mb-4">Are you sure you want to delete this password?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
