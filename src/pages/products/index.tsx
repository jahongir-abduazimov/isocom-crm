import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useProductsStore } from "@/store/products.store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const ProductsPage = () => {
  const { products, loading, error, fetchProducts, deleteProduct } =
    useProductsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("products.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/products/add")}
        >
          <Plus size={20} />
          {t("products.newProduct")}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder={t("products.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">{t("products.loadingProducts")}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("products.loadingError")}
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
        title={t("products.deleteProduct")}
        description={t("products.deleteConfirm")}
        confirmText={t("products.deleteButton")}
        cancelText={t("products.cancelButton")}
        onConfirm={handleDelete}
        onCancel={() => {
          setModalOpen(false);
          setDeleteId(null);
        }}
      />

      {/* Products Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.productName")}
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.slug")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.code")}
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.type")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.price")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.status")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {product.name}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.slug || "-"}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.code || "-"}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.type || "-"}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price ? Number(product.price).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {product.is_active ? t("products.active") : t("products.inactive")}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                        >
                          <Edit size={14} className="mr-1" />
                          {t("products.editButton")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setDeleteId(product.id || null);
                            setModalOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          {t("products.deleteButtonAction")}
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

      {!loading && !error && filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("products.noProductsFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
