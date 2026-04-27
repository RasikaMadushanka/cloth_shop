import React, { useState } from 'react';

interface Variant {
  size: string;
  color: string;
  stockQuantity: number;
  priceOverride: number;
  barcodeId?: string;
}

interface Product {
  productId: number;
  productName: string;
  category: string;
  basePrice: number;
  discountPercentage: number;
  variants: Variant[];
}

const ProductManagement: React.FC = () => {
  // --- Static Inventory State ---
  const [products, setProducts] = useState<Product[]>([
    {
      productId: 1,
      productName: "Slim Fit Linen Shirt",
      category: "Men's Casual",
      basePrice: 3500.0,
      discountPercentage: 0.0,
      variants: [
        { size: "M", color: "White", stockQuantity: 20, priceOverride: 3500.0, barcodeId: "BC-001" },
        { size: "L", color: "Blue", stockQuantity: 15, priceOverride: 3500.0, barcodeId: "BC-002" }
      ]
    }
  ]);

  // --- Form States ---
  const [activeTab, setActiveTab] = useState<'ADD' | 'UPDATE_VARIANT'>('ADD');
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");

  // Product Add State (JSON 1)
  const [productForm, setProductForm] = useState({
    productName: '',
    category: '',
    basePrice: 3500.0,
    discountPercentage: 0.0
  });

  // Variant Add State (JSON 2)
  const [variantForm, setVariantForm] = useState<Variant>({
    size: '', color: '', stockQuantity: 0, priceOverride: 3500.0
  });

  // --- Logic 1: Initial Product Registration ---
  const handleInitialProductAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      ...productForm,
      productId: products.length + 1,
      variants: [] // Starts with empty variants or current form variants
    };
    setProducts([...products, newProduct]);
    alert("Phase 1: Product Registered Successfully!");
    setProductForm({ productName: '', category: '', basePrice: 3500.0, discountPercentage: 0.0 });
  };

  // --- Logic 2: Adding Variants to Existing Product ---
  const handleAddVariantToExisting = () => {
    if (!selectedProductId) return;

    setProducts(prev => prev.map(p => {
      if (p.productId === selectedProductId) {
        return {
          ...p,
          variants: [...p.variants, { ...variantForm, barcodeId: `BC-${Math.floor(Math.random() * 1000)}` }]
        };
      }
      return p;
    }));
    
    alert(`Phase 2: New Variant Added to Product ID: ${selectedProductId}`);
    setVariantForm({ size: '', color: '', stockQuantity: 0, priceOverride: 3500.0 });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-6 lg:p-12 text-slate-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 p-1 bg-white/5 w-fit rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('ADD')}
            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'ADD' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
          >
            1. REGISTER PRODUCT
          </button>
          <button 
            onClick={() => setActiveTab('UPDATE_VARIANT')}
            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'UPDATE_VARIANT' ? 'bg-amber-600 text-white' : 'hover:bg-white/5'}`}
          >
            2. APPEND VARIANTS
          </button>
        </div>

        {/* --- PHASE 1: PRODUCT ADD --- */}
        {activeTab === 'ADD' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in duration-500">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">New Product Entry</h2>
            <form onSubmit={handleInitialProductAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                placeholder="Product Name" className="form-input-style"
                value={productForm.productName} onChange={e => setProductForm({...productForm, productName: e.target.value})} 
              />
              <input 
                placeholder="Category" className="form-input-style"
                value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} 
              />
              <input 
                type="number" placeholder="Base Price" className="form-input-style"
                value={productForm.basePrice} onChange={e => setProductForm({...productForm, basePrice: +e.target.value})} 
              />
              <button type="submit" className="bg-blue-600 py-4 rounded-xl font-black text-white hover:bg-blue-500 transition-all">
                CREATE MASTER RECORD
              </button>
            </form>
          </section>
        )}

        {/* --- PHASE 2: VARIANT ADD --- */}
        {activeTab === 'UPDATE_VARIANT' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in duration-500">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Append Item Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select 
                className="form-input-style md:col-span-3"
                value={selectedProductId} onChange={e => setSelectedProductId(+e.target.value)}
              >
                <option value="">Select Product to Update...</option>
                {products.map(p => <option key={p.productId} value={p.productId}>{p.productName} (ID: {p.productId})</option>)}
              </select>

              <input placeholder="Size (e.g. 32)" className="form-input-style" value={variantForm.size} onChange={e => setVariantForm({...variantForm, size: e.target.value})} />
              <input placeholder="Color (e.g. Green)" className="form-input-style" value={variantForm.color} onChange={e => setVariantForm({...variantForm, color: e.target.value})} />
              <input type="number" placeholder="Stock Qty" className="form-input-style" value={variantForm.stockQuantity || ''} onChange={e => setVariantForm({...variantForm, stockQuantity: +e.target.value})} />
              
              <button 
                onClick={handleAddVariantToExisting}
                className="md:col-span-3 bg-amber-600 py-4 rounded-xl font-black text-white hover:bg-amber-500 transition-all"
              >
                ADD VARIANT TO SELECTION
              </button>
            </div>
          </section>
        )}

        {/* --- INVENTORY VIEW --- */}
        <div className="grid grid-cols-1 gap-6">
          {products.map(product => (
            <div key={product.productId} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-bold text-white">{product.productName}</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{product.category}</p>
                </div>
                <div className="text-right text-xs">
                  <p>Product ID: <span className="text-white font-mono">{product.productId}</span></p>
                  <p>Discount: <span className="text-green-400">{product.discountPercentage}%</span></p>
                </div>
              </div>

              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-500 font-bold uppercase">
                  <tr className="border-b border-white/5">
                    <th className="p-4">Variant</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Price Override</th>
                    <th className="p-4">Barcode</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {product.variants.map((v, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 text-white font-medium">{v.size} / {v.color}</td>
                      <td className="p-4">{v.stockQuantity} Units</td>
                      <td className="p-4 text-white">Rs. {v.priceOverride}</td>
                      <td className="p-4 font-mono text-xs text-slate-500">{v.barcodeId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;