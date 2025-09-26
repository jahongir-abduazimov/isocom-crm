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

  // Helper function to translate product type
  const translateProductType = (type: string | undefined) => {
    if (type === "FINISHED_PRODUCT") {
      return t("products.FINISHED_PRODUCT");
    } else if (type === "SEMI_FINISHED_PRODUCT") {
      return t("products.SEMI_FINISHED_PRODUCT");
    }
    return type || "-";
  };

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

      {/* Products Table - Desktop */}
      {!loading && !error && (
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.productName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.slug")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.code")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.type")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.price")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.slug || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.code || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {translateProductType(product.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price ? Number(product.price).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {product.is_active ? t("products.active") : t("products.inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3"
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                        >
                          <Edit size={14} className="mr-1" />
                          {t("products.editButton")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3 text-red-600 hover:text-red-700"
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

      {/* Products Cards - Mobile */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
          {filteredProducts?.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="space-y-3">
                {/* Product Name */}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{t("products.productName")}</h3>
                  <p className="text-sm text-gray-600 truncate">{product.name}</p>
                </div>

                {/* Code and Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("products.code")}</h4>
                    <p className="text-sm text-gray-600">{product.code || "-"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("products.type")}</h4>
                    <p className="text-sm text-gray-600">{translateProductType(product.type)}</p>
                  </div>
                </div>

                {/* Price and Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("products.price")}</h4>
                    <p className="text-sm text-gray-600">
                      {product.price ? Number(product.price).toLocaleString() : "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("products.status")}</h4>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {product.is_active ? t("products.active") : t("products.inactive")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                  >
                    <Edit size={12} className="mr-1" />
                    {t("products.editButton")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => {
                      setDeleteId(product.id || null);
                      setModalOpen(true);
                    }}
                  >
                    <Trash2 size={12} className="mr-1" />
                    {t("products.deleteButtonAction")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
