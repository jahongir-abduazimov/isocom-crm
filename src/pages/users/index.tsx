import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ui/confirm-modal";
import {
  Users,
  Edit,
  Plus,
  Search,
  Trash2,
  Loader2,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUsersStore } from "@/store/users.store";
import { useNavigate } from "react-router-dom";
import type { User } from "@/services/users.service";
import { useTranslation } from "@/hooks/useTranslation";

const UsersPage = () => {
  const { users, loading, error, fetchUsers, deleteUser } = useUsersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filteredUsers =
    users?.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  useEffect(() => {
    fetchUsers({ page: currentPage });
    // eslint-disable-next-line
  }, [currentPage]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteUser(deleteId);
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ page: 1, search: searchTerm });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ");
  };

  const getRoleBadge = (user: User) => {
    if (user.is_superuser) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          <Shield size={12} className="mr-1" />
          {t("users.superAdmin")}
        </span>
      );
    } else if (user.is_staff) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          <UserCheck size={12} className="mr-1" />
          {t("users.admin")}
        </span>
      );
    } else if (user.is_operator) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <UserCheck size={12} className="mr-1" />
          {t("users.operator")}
        </span>
      );
    } else if (user.is_supervisor) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          <UserCheck size={12} className="mr-1" />
          {t("users.supervisor")}
        </span>
      );
    } else if (user.is_specialist) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
          <UserCheck size={12} className="mr-1" />
          {t("users.specialist")}
        </span>
      );
    } else if (user.role_display_uz) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          <UserX size={12} className="mr-1" />
          {user.role_display_uz}
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          <UserX size={12} className="mr-1" />
          {t("users.user")}
        </span>
      );
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("users.title")}</h1>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/users/add")}
        >
          <Plus size={20} />
          {t("users.newUser")}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder={t("users.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" variant="outline">
            {t("users.searchButton")}
          </Button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            {t("users.loadingUsers")}
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("users.loadingError")}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={modalOpen}
        title={t("users.deleteUser")}
        description={t("users.deleteConfirm")}
        confirmText={t("users.deleteButton")}
        cancelText={t("users.cancelButton")}
        onConfirm={handleDelete}
        onCancel={() => {
          setModalOpen(false);
          setDeleteId(null);
        }}
      />

      {/* Users Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.user")}
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.email")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.role")}
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.joinedDate")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.status")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={16} className="text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name?.trim() ||
                              `${user.first_name} ${user.last_name}`.trim() ||
                              user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email || "-"}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user)}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.date_joined)}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.is_active ? t("users.active") : t("users.inactive")}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                        >
                          <Edit size={14} className="mr-1" />
                          {t("users.editButton")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setDeleteId(user.id);
                            setModalOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          {t("users.deleteButtonAction")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {t("users.noUsersFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
