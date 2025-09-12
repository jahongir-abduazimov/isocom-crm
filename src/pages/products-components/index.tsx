import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ui/confirm-modal";
import AddProductComponentModal from "@/components/ui/add-product-component-modal";
import EditProductComponentModal from "@/components/ui/edit-product-component-modal";
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useProductComponentsStore } from "@/store/product-components.store";
import { useProductsStore } from "@/store/products.store";

const ProductsComponentsPage = () => {
  const {
    productComponents,
    loading,
    error,
    fetchProductComponents,
    deleteProductComponent,
  } = useProductComponentsStore();
  const { products, fetchProducts } = useProductsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Function to get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };

  const filteredProductComponents = productComponents?.filter((pc) => {
    const finishedProductName = getProductName(pc.finished_product);
    const semiFinishedProductName = getProductName(pc.semi_finished_product);
    const searchLower = searchTerm.toLowerCase();

    return (
      finishedProductName.toLowerCase().includes(searchLower) ||
      semiFinishedProductName.toLowerCase().includes(searchLower) ||
      pc.id.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchProductComponents();
    fetchProducts(); // Fetch products to resolve names
    // eslint-disable-next-line
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProductComponent(deleteId);
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Maxsulot komponentlari
          </h1>
          <p className="text-gray-600 mt-1">
            Maxsulot komponentlarini boshqarish va kuzatish
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={20} />
          Yangi Komponent
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
                placeholder="Komponentlarni qidirish..."
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
          <span className="ml-2 text-gray-600">
            Komponentlar yuklanmoqda...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Komponentlarni yuklashda xatolik
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
        title="Komponentni o'chirish"
        description="Ushbu komponentni o'chirishni tasdiqlaysizmi?"
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        onConfirm={handleDelete}
        onCancel={() => {
          setModalOpen(false);
          setDeleteId(null);
        }}
      />

      {/* Add Product Component Modal */}
      <AddProductComponentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Edit Product Component Modal */}
      <EditProductComponentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditId(null);
        }}
        componentId={editId}
      />

      {/* Product Components Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tayyor maxsulot
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yarim tayyor maxsulot
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yaratilgan vaqt
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yangilangan vaqt
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductComponents?.map((component) => (
                  <tr key={component.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {getProductName(component.finished_product)}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {getProductName(component.semi_finished_product)}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(component.created_at)}
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(component.updated_at)}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() => {
                            setEditId(component.id);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit size={14} className="mr-1" />
                          Tahrirlash
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setDeleteId(component.id);
                            setModalOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          O'chirish
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

      {!loading && !error && filteredProductComponents?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Qidiruv mezonlaringizga mos komponentlar topilmadi.
          </p>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && !error && (
        <div className="md:hidden space-y-4">
          {filteredProductComponents?.length > 0 ? (
            filteredProductComponents.map((component) => (
              <div
                key={component.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-mono text-xs text-gray-600">
                        {component.id.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          setEditId(component.id);
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit size={14} className="mr-1" />
                        Tahrirlash
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                        onClick={() => {
                          setDeleteId(component.id);
                          setModalOpen(true);
                        }}
                      >
                        <Trash2 size={14} className="mr-1" />
                        O'chirish
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tayyor maxsulot</p>
                    <p className="font-medium text-gray-900">
                      {getProductName(component.finished_product)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Yarim tayyor maxsulot
                    </p>
                    <p className="font-medium text-gray-900">
                      {getProductName(component.semi_finished_product)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yaratilgan vaqt</p>
                    <p className="text-gray-600">
                      {formatDate(component.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yangilangan vaqt</p>
                    <p className="text-gray-600">
                      {formatDate(component.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">
              Qidiruv mezonlaringizga mos komponentlar topilmadi.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsComponentsPage;
