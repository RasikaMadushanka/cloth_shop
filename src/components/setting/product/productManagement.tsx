import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { productApi } from '../../api/Service/apiService';

// --- UPDATED INTERFACES TO MATCH YOUR API DATA ---
interface Variant {
  variantId?: string; // New from API
  sku?: string;       // New from API
  size: string;
  color: string;
  stockQuantity: number;
  priceOverride: number;
  finalPrice?: number | null; // New from API
  barcodeId?: string;
}

interface Product {
  productId: number;
  productName: string;
  category: string;
  basePrice: number;
  discountPercentage: number;
  discountedPrice?: number;   // New from API
  totalQuantity?: number;     // New from API
  stockStatus?: string;       // New from API
  availableColors?: string[]; // New from API
  availableSizes?: string[];  // New from API
  createdAt?: string;         // New from API
  variants: Variant[];
}

const ProductManagement: React.FC = () => {
  // --- YOUR ORIGINAL EAN-13 GENERATOR ---
  const generateRealBarcode = (pId: number, vCount: number): string => {
    const prefix = "479"; // Sri Lanka
    const companyCode = "8000";
    const productPart = `${pId}${vCount}`.slice(-5).padStart(5, '0');
    const base = prefix + companyCode + productPart;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(base[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return base + checkDigit.toString();
  };

  const [products, setProducts] = useState<Product[]>([
    {
      productId: 1,
      productName: "Slim Fit Linen Shirt",
      category: "Men's Casual",
      basePrice: 3500.0,
      discountPercentage: 0.0,
      discountedPrice: 3500.0,
      totalQuantity: 35,
      stockStatus: "AVAILABLE",
      availableColors: ["White", "Blue"],
      availableSizes: ["M", "L"],
      variants: [
        { variantId: "8d1f6dd2-f94d-4338-a0dc-8154eb84079f", sku: "MEN-SLI-M", size: "M", color: "White", stockQuantity: 20, priceOverride: 3500.0, barcodeId: "4798000136077" },
        { variantId: "82aed2f7-848e-4403-8f75-73af1169ab3f", sku: "MEN-SLI-L", size: "L", color: "Blue", stockQuantity: 15, priceOverride: 3500.0, barcodeId: "4798000498526" }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<'ADD' | 'UPDATE_VARIANT' | 'MANAGE'>('ADD');
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [barcodeModal, setBarcodeModal] = useState<{ productName: string, variants: Variant[] } | null>(null);

  const [productForm, setProductForm] = useState({ productName: '', category: '', basePrice: 3500.0, discountPercentage: 0.0 });
  const [variantForm, setVariantForm] = useState<Variant>({ size: '', color: '', stockQuantity: 0, priceOverride: 3500.0 });

  // --- YOUR ORIGINAL FUNCTIONS ---
  const handleInitialProductAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = { ...productForm, productId: products.length + 1, variants: [] };
    setProducts([...products, newProduct]);
    setProductForm({ productName: '', category: '', basePrice: 3500.0, discountPercentage: 0.0 });
  };

  const handleAddVariantToExisting = () => {
    if (!selectedProductId) return;
    setProducts(prev => prev.map(p => {
      if (p.productId === selectedProductId) {
        const nextVariantIndex = p.variants.length + 1;
        const realBarcode = generateRealBarcode(p.productId, nextVariantIndex);
        return { ...p, variants: [...p.variants, { ...variantForm, barcodeId: realBarcode }] };
      }
      return p;
    }));
    setVariantForm({ size: '', color: '', stockQuantity: 0, priceOverride: 3500.0 });
  };

  const handleItemPriceChange = (barcode: string) => {
    const newPrice = window.prompt(`Update price for Barcode: ${barcode}`);
    if (newPrice) {
      setProducts(prev => prev.map(p => ({
        ...p,
        variants: p.variants.map(v => v.barcodeId === barcode ? { ...v, priceOverride: parseFloat(newPrice) } : v)
      })));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-6 lg:p-12 text-slate-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 p-1 bg-white/5 w-fit rounded-2xl border border-white/10">
          <button onClick={() => setActiveTab('ADD')} className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === 'ADD' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}>1. NEW PRODUCT</button>
          <button onClick={() => setActiveTab('UPDATE_VARIANT')} className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === 'UPDATE_VARIANT' ? 'bg-amber-600 text-white' : 'hover:bg-white/5'}`}>2. ADD VARIANTS</button>
          <button onClick={() => setActiveTab('MANAGE')} className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === 'MANAGE' ? 'bg-cyan-600 text-white' : 'hover:bg-white/5'}`}>3. SYSTEM CONTROL</button>
        </div>

        {/* Add Product Section */}
        {activeTab === 'ADD' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest italic">Register Master Item</h2>
            <form onSubmit={handleInitialProductAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Product Name" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" value={productForm.productName} onChange={e => setProductForm({ ...productForm, productName: e.target.value })} required />
              <input placeholder="Category" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required />
              <input type="number" placeholder="Base Price" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" value={productForm.basePrice} onChange={e => setProductForm({ ...productForm, basePrice: +e.target.value })} required />
              <button type="submit" className="bg-blue-600 py-4 rounded-xl font-black text-white hover:bg-blue-700 transition-colors uppercase text-[10px]">Initialize Product</button>
            </form>
          </section>
        )}

        {/* Update Variant Section */}
        {activeTab === 'UPDATE_VARIANT' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest italic">Append New Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none md:col-span-3 text-slate-400" value={selectedProductId} onChange={e => setSelectedProductId(+e.target.value)}>
                <option value="">Choose Master Product...</option>
                {products.map(p => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
              </select>
              <input placeholder="Size" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={variantForm.size} onChange={e => setVariantForm({ ...variantForm, size: e.target.value })} />
              <input placeholder="Color" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={variantForm.color} onChange={e => setVariantForm({ ...variantForm, color: e.target.value })} />
              <input type="number" placeholder="Stock Qty" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={variantForm.stockQuantity || ''} onChange={e => setVariantForm({ ...variantForm, stockQuantity: +e.target.value })} />
              <button onClick={handleAddVariantToExisting} className="md:col-span-3 bg-amber-600 py-4 rounded-xl font-black text-white uppercase hover:bg-amber-700 transition-colors">Generate Barcode & Add</button>
            </div>
          </section>
        )}

        {/* --- NEW: MASTER PRODUCT VIEW TABLE --- */}
        <div className="space-y-8">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] italic opacity-50">Global Inventory Master</h2>
          {products.map(product => (
            <div key={product.productId} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-white/20">
              {/* Product Header Card */}
              <div className="p-8 bg-white/[0.02] flex flex-wrap justify-between items-start border-b border-white/5 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{product.category}</p>
                  <h3 className="text-2xl font-black text-white uppercase italic">{product.productName}</h3>
                  <div className="flex gap-2">
                    {product.availableColors?.map(c => <span key={c} className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-slate-400 border border-white/5 uppercase">{c}</span>)}
                    {product.availableSizes?.map(s => <span key={s} className="px-2 py-0.5 bg-blue-500/10 rounded text-[8px] font-bold text-blue-400 border border-blue-500/20 uppercase">{s}</span>)}
                  </div>
                </div>
                
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Total Qty</p>
                    <p className="text-xl font-black text-white">{product.totalQuantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Status</p>
                    <p className={`text-[10px] font-black uppercase ${product.stockStatus === 'AVAILABLE' ? 'text-green-500' : 'text-red-500'}`}>{product.stockStatus || 'UNKNOWN'}</p>
                  </div>
                </div>
              </div>

              {/* Variant Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-[9px] text-slate-500 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-8 py-4">SKU / ID</th>
                      <th className="px-8 py-4">Attributes</th>
                      <th className="px-8 py-4">Stock</th>
                      <th className="px-8 py-4">Barcode</th>
                      <th className="px-8 py-4 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-white/5">
                    {product.variants.map((v, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-white uppercase">{v.sku || 'N/A'}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[120px]">{v.variantId}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-slate-300 font-black">{v.size}</span>
                          <span className="mx-2 text-slate-600">|</span>
                          <span className="text-slate-400 uppercase">{v.color}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`font-mono font-bold ${v.stockQuantity < 5 ? 'text-red-500' : 'text-slate-300'}`}>{v.stockQuantity}</span>
                        </td>
                        <td className="px-8 py-5 font-mono text-[10px] text-blue-400/60">{v.barcodeId}</td>
                        <td className="px-8 py-5 text-right font-black text-white italic">Rs. {v.priceOverride.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Original Action Sections */}
        {activeTab === 'MANAGE' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest italic text-center">Printable Barcode Labels</h2>
            <div className="grid grid-cols-1 gap-4">
              {products.map(p => (
                <div key={p.productId} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="font-bold text-white uppercase text-xs">{p.productName}</span>
                  <button onClick={() => setBarcodeModal({ productName: p.productName, variants: p.variants })} className="text-[10px] font-black text-cyan-400 border border-cyan-400/30 px-6 py-2 rounded-xl hover:bg-cyan-400 hover:text-white transition-all">GENERATE TAGS</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Barcode Modal */}
        {barcodeModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
            <div className="bg-[#111827] border border-white/10 rounded-[3rem] w-full max-w-lg p-10 overflow-hidden">
              <h3 className="text-xl font-black text-white mb-2 uppercase italic text-center">{barcodeModal.productName}</h3>
              <p className="text-[10px] text-slate-500 text-center mb-8 font-bold uppercase tracking-widest">Scanning Ready</p>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {barcodeModal.variants.map((v, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] flex flex-col items-center justify-center shadow-xl">
                    <p className="text-[10px] text-black font-black uppercase mb-1">{barcodeModal.productName}</p>
                    <p className="text-[9px] text-slate-600 font-bold mb-4">{v.size} - {v.color} | Rs. {v.priceOverride}</p>

                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <Barcode
                        value={v.barcodeId || "0000000000000"}
                        format="CODE128"
                        lineColor="#000000"
                        background="#FFFFFF"
                        displayValue={true}
                        width={1.2}
                        height={50}
                        fontSize={12}
                        margin={0}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={() => window.print()} className="flex-1 py-4 bg-cyan-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-tighter">Print Labels</button>
                <button onClick={() => setBarcodeModal(null)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-tighter">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;