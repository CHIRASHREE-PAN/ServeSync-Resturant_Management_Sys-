import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";

import {
  createCategory,
  createMenuItem,
  createStaff,
  deleteCategory,
  deleteMenuItem,
  deleteStaff,
  listCategories,
  listMenuItems,
  listStaff,
  updateCategory,
  updateMenuItem,
  updateStaff,
} from "../../api/admin";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Skeleton from "../ui/Skeleton";

const emptyCategoryForm = {
  name: "",
  description: "",
};

const emptyMenuForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  chef_special: false,
  best_seller: false,
  availability: true,
};

const emptyStaffForm = {
  name: "",
  email: "",
  role: "waiter",
};

function AdminSections() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("categories");

  const [categoryForm, setCategoryForm] = useState(
    emptyCategoryForm
  );

  const [menuForm, setMenuForm] = useState(
    emptyMenuForm
  );

  const [staffForm, setStaffForm] = useState(
    emptyStaffForm
  );

  const [editingCategoryId, setEditingCategoryId] =
    useState(null);

  const [editingMenuId, setEditingMenuId] =
    useState(null);

  const [editingStaffId, setEditingStaffId] =
    useState(null);

  const getErrorMessage = (
    err,
    fallback
  ) => {
    const detail = err?.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || "Invalid value")
        .join(", ");
    }

    return fallback;
  };

  const extractItems = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    return data?.items ?? [];
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        categoriesResponse,
        menuResponse,
        staffResponse,
      ] = await Promise.all([
        listCategories({
          page: 1,
          page_size: 50,
        }),
        listMenuItems({
          page: 1,
          page_size: 50,
        }),
        listStaff({
          page: 1,
          page_size: 50,
        }),
      ]);

      setCategories(
        extractItems(categoriesResponse)
      );

      setMenuItems(
        extractItems(menuResponse)
      );

      setStaff(
        extractItems(staffResponse)
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load admin records."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const resetMenuForm = () => {
    setMenuForm(emptyMenuForm);
    setEditingMenuId(null);
  };

  const resetStaffForm = () => {
    setStaffForm(emptyStaffForm);
    setEditingStaffId(null);
  };

  const submitCategory = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      let response;

      if (editingCategoryId !== null) {
        response = await updateCategory(
          editingCategoryId,
          categoryForm
        );

        setCategories((current) =>
          current.map((item) =>
            item.id === editingCategoryId
              ? response.data
              : item
          )
        );
      } else {
        response = await createCategory(
          categoryForm
        );

        setCategories((current) => [
          response.data,
          ...current,
        ]);
      }

      resetCategoryForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save category."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const submitMenu = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: menuForm.name.trim(),
        description:
          menuForm.description.trim(),
        price: Number(menuForm.price),
        category_id: Number(
          menuForm.category_id
        ),
        chef_special:
          Boolean(menuForm.chef_special),
        best_seller:
          Boolean(menuForm.best_seller),
        availability:
          Boolean(menuForm.availability),
      };

      let response;

      if (editingMenuId !== null) {
        response = await updateMenuItem(
          editingMenuId,
          payload
        );

        setMenuItems((current) =>
          current.map((item) =>
            item.id === editingMenuId
              ? response.data
              : item
          )
        );
      } else {
        response = await createMenuItem(
          payload
        );

        setMenuItems((current) => [
          response.data,
          ...current,
        ]);
      }

      resetMenuForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save menu item."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const submitStaff = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        role: staffForm.role,
      };

      let response;

      if (editingStaffId !== null) {
        response = await updateStaff(
          editingStaffId,
          payload
        );

        setStaff((current) =>
          current.map((member) =>
            member.id === editingStaffId
              ? response.data
              : member
          )
        );
      } else {
        response = await createStaff(payload);

        setStaff((current) => [
          response.data,
          ...current,
        ]);
      }

      resetStaffForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save staff member."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id) => {
    if (
      !window.confirm(
        "Delete this category?"
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteCategory(id);

      setCategories((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      if (editingCategoryId === id) {
        resetCategoryForm();
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete category."
        )
      );
    }
  };

  const removeMenuItem = async (id) => {
    if (
      !window.confirm(
        "Delete this menu item?"
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteMenuItem(id);

      setMenuItems((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      if (editingMenuId === id) {
        resetMenuForm();
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete menu item."
        )
      );
    }
  };

  const removeStaff = async (id) => {
    if (
      !window.confirm(
        "Delete this staff member?"
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteStaff(id);

      setStaff((current) =>
        current.filter(
          (member) => member.id !== id
        )
      );

      if (editingStaffId === id) {
        resetStaffForm();
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete staff member."
        )
      );
    }
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);

    setCategoryForm({
      name: category.name ?? "",
      description:
        category.description ?? "",
    });

    setError("");
  };

  const editMenuItem = (item) => {
    setEditingMenuId(item.id);

    setMenuForm({
      name: item.name ?? "",
      description:
        item.description ?? "",
      price: item.price ?? "",
      category_id:
        item.category_id ?? "",
      chef_special:
        Boolean(item.chef_special),
      best_seller:
        Boolean(item.best_seller),
      availability:
        item.availability !== false,
    });

    setError("");
  };

  const editStaff = (member) => {
    setEditingStaffId(member.id);

    setStaffForm({
      name: member.name ?? "",
      email: member.email ?? "",
      role: member.role ?? "waiter",
    });

    setError("");
  };

  const tabs = [
    {
      id: "categories",
      label: "Categories",
    },
    {
      id: "menu",
      label: "Menu",
    },
    {
      id: "staff",
      label: "Staff",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={
              activeTab === tab.id
                ? "default"
                : "secondary"
            }
            onClick={() => {
              setActiveTab(tab.id);
              setError("");
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="border-error/30 p-4 text-sm text-error">
          {error}
        </Card>
      )}

      {/* =========================
          CATEGORIES
      ========================== */}
      {activeTab === "categories" && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text">
                {editingCategoryId !== null
                  ? "Edit category"
                  : "Create category"}
              </h3>

              {editingCategoryId !== null && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-full p-2 text-secondary-text hover:bg-muted"
                  aria-label="Cancel editing"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <form
              onSubmit={submitCategory}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Name
                </label>

                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={
                    categoryForm.description
                  }
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      description:
                        event.target.value,
                    })
                  }
                  className="min-h-24 w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {editingCategoryId !== null
                    ? "Save changes"
                    : "Create category"}
                </Button>

                {editingCategoryId !== null && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={
                      resetCategoryForm
                    }
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-text">
                Categories
              </h3>

              <span className="text-sm text-secondary-text">
                {categories.length} items
              </span>
            </div>

            {loading ? (
              <Skeleton className="h-44 rounded-[20px]" />
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-secondary-text">
                  No categories found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-muted p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-text">
                        {category.name}
                      </p>

                      <p className="truncate text-sm text-secondary-text">
                        {category.description ||
                          "No description"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          editCategory(
                            category
                          )
                        }
                        className="rounded-full p-2 text-primary hover:bg-card"
                        aria-label="Edit category"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeCategory(
                            category.id
                          )
                        }
                        className="rounded-full p-2 text-error hover:bg-card"
                        aria-label="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================
          MENU
      ========================== */}
      {activeTab === "menu" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text">
                {editingMenuId !== null
                  ? "Edit menu item"
                  : "Create menu item"}
              </h3>

              {editingMenuId !== null && (
                <button
                  type="button"
                  onClick={resetMenuForm}
                  className="rounded-full p-2 text-secondary-text hover:bg-muted"
                  aria-label="Cancel editing"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <form
              onSubmit={submitMenu}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="menu-name"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Name
                </label>

                <Input
                  id="menu-name"
                  value={menuForm.name}
                  onChange={(event) =>
                    setMenuForm({
                      ...menuForm,
                      name: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="menu-description"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Description
                </label>

                <textarea
                  id="menu-description"
                  value={
                    menuForm.description
                  }
                  onChange={(event) =>
                    setMenuForm({
                      ...menuForm,
                      description:
                        event.target.value,
                    })
                  }
                  className="min-h-24 w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="menu-price"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Price
                  </label>

                  <Input
                    id="menu-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(event) =>
                      setMenuForm({
                        ...menuForm,
                        price: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="menu-category"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Category
                  </label>

                  <select
                    id="menu-category"
                    value={
                      menuForm.category_id
                    }
                    onChange={(event) =>
                      setMenuForm({
                        ...menuForm,
                        category_id:
                          event.target.value,
                      })
                    }
                    required
                    className="w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={
                      menuForm.chef_special
                    }
                    onChange={(event) =>
                      setMenuForm({
                        ...menuForm,
                        chef_special:
                          event.target.checked,
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />

                  Chef special
                </label>

                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={
                      menuForm.best_seller
                    }
                    onChange={(event) =>
                      setMenuForm({
                        ...menuForm,
                        best_seller:
                          event.target.checked,
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />

                  Best seller
                </label>

                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={
                      menuForm.availability
                    }
                    onChange={(event) =>
                      setMenuForm({
                        ...menuForm,
                        availability:
                          event.target.checked,
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />

                  Available
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {editingMenuId !== null
                    ? "Save changes"
                    : "Create menu item"}
                </Button>

                {editingMenuId !== null && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetMenuForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-text">
                Menu items
              </h3>

              <span className="text-sm text-secondary-text">
                {menuItems.length} items
              </span>
            </div>

            {loading ? (
              <Skeleton className="h-44 rounded-[20px]" />
            ) : menuItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-secondary-text">
                  No menu items found.
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] space-y-3 overflow-auto pr-1">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[16px] border border-border bg-muted p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-text">
                          {item.name}
                        </p>

                        <p className="text-sm text-secondary-text">
                          ${Number(
                            item.price ?? 0
                          ).toFixed(2)}
                          {" • "}
                          {categories.find(
                            (category) =>
                              category.id ===
                              item.category_id
                          )?.name ||
                            `Category ${item.category_id}`}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {item.chef_special && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                              Chef special
                            </span>
                          )}

                          {item.best_seller && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                              Best seller
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2 py-1 ${
                              item.availability
                                ? "bg-success/10 text-success"
                                : "bg-error/10 text-error"
                            }`}
                          >
                            {item.availability
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            editMenuItem(item)
                          }
                          className="rounded-full p-2 text-primary hover:bg-card"
                          aria-label="Edit menu item"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeMenuItem(
                              item.id
                            )
                          }
                          className="rounded-full p-2 text-error hover:bg-card"
                          aria-label="Delete menu item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================
          STAFF
      ========================== */}
      {activeTab === "staff" && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text">
                {editingStaffId !== null
                  ? "Edit staff member"
                  : "Create staff member"}
              </h3>

              {editingStaffId !== null && (
                <button
                  type="button"
                  onClick={resetStaffForm}
                  className="rounded-full p-2 text-secondary-text hover:bg-muted"
                  aria-label="Cancel editing"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <form
              onSubmit={submitStaff}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="staff-name"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Name
                </label>

                <Input
                  id="staff-name"
                  value={staffForm.name}
                  onChange={(event) =>
                    setStaffForm({
                      ...staffForm,
                      name: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="staff-email"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Email
                </label>

                <Input
                  id="staff-email"
                  type="email"
                  value={staffForm.email}
                  onChange={(event) =>
                    setStaffForm({
                      ...staffForm,
                      email:
                        event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="staff-role"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Role
                </label>

                <select
                  id="staff-role"
                  value={staffForm.role}
                  onChange={(event) =>
                    setStaffForm({
                      ...staffForm,
                      role: event.target.value,
                    })
                  }
                  className="w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="waiter">
                    Waiter
                  </option>

                  <option value="kitchen">
                    Kitchen
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {editingStaffId !== null
                    ? "Save changes"
                    : "Create staff member"}
                </Button>

                {editingStaffId !== null && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetStaffForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-text">
                Staff
              </h3>

              <span className="text-sm text-secondary-text">
                {staff.length} members
              </span>
            </div>

            {loading ? (
              <Skeleton className="h-44 rounded-[20px]" />
            ) : staff.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-secondary-text">
                  No staff members found.
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] space-y-3 overflow-auto pr-1">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-muted p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-text">
                        {member.name}
                      </p>

                      <p className="truncate text-sm text-secondary-text">
                        {member.email}
                      </p>

                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs capitalize text-primary">
                        {member.role}
                      </span>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          editStaff(member)
                        }
                        className="rounded-full p-2 text-primary hover:bg-card"
                        aria-label="Edit staff member"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeStaff(member.id)
                        }
                        className="rounded-full p-2 text-error hover:bg-card"
                        aria-label="Delete staff member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminSections;