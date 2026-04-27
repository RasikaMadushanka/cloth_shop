import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas'; 
import { productApi } from '../../api/Service/apiService';

// --- INTERFACES ---
interface Variant {
  variantId?: string;
  sku?: string;
  size: string;
  color: string;
  stockQuantity: number;
  priceOverride: number;
  finalPrice?: number | null;
  barcodeId?: string;
}

interface Product {
  productId: number;
  productName: string;
  category: string;
  basePrice: number;
  discountPercentage: number;
  discountedPrice?: number;
  totalQuantity?: number;
  stockStatus?: string;
  availableColors?: string[];
  availableSizes?: string[];
  variants: Variant[];
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ADD' | 'UPDATE_VARIANT' | 'MANAGE'>('ADD');
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [barcodeModal, setBarcodeModal] = useState<{ productName: string, variants: Variant[] } | null>(null);

  // Forms
  const [productForm, setProductForm] = useState({ productName: '', category: '', basePrice: 3500.0, discountPercentage: 0.0 });
  const [variantForm, setVariantForm] = useState<Variant>({ size: '', color: '', stockQuantity: 0, priceOverride: 0 });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- FIXED BARCODE DOWNLOAD LOGIC ---
  const downloadBarcodeTags = async () => {
    const tags = document.querySelectorAll('.barcode-tag-item');
    if (tags.length === 0) {
      alert("No tags found to download.");
      return;
    }

    for (let i = 0; i < tags.length; i++) {
      const element = tags[i] as HTMLElement;
      try {
        const canvas = await html2canvas(element, {
          scale: 4, 
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: true,
          // CRITICAL: Forces standard colors in the clone to bypass oklch parser error
          onclone: (clonedDoc) => {
            const el = clonedDoc.querySelectorAll('.barcode-tag-item')[i] as HTMLElement;
            if (el) {
              el.style.backgroundColor = "#ffffff";
              el.style.color = "#000000";
            }
          }
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        
        const safeName = barcodeModal?.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeName}_tag_${i + 1}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay to prevent browser download blocking
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (err) {
        console.error("Download failed for index", i, err);
      }
    }
  };

  const generateRealBarcode = (pId: number, vCount: number): string => {
    const prefix = "479"; 
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

  const handleInitialProductAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productApi.add({ ...productForm, variants: [] });
      setProductForm({ productName: '', category: '', basePrice: 3500.0, discountPercentage: 0.0 });
      await loadProducts();
      alert("Master Product Registered Successfully!");
    } catch (error) {
      alert("Error adding product.");
    }
  };

  const handleAddVariantToExisting = async () => {
    if (selectedProductId === "" || isNaN(Number(selectedProductId))) {
      alert("Please select a Master Product first.");
      return;
    }

    const targetProduct = products.find(p => p.productId === Number(selectedProductId));
    if (!targetProduct) return;

    const existingVariants = targetProduct.variants || [];
    const realBarcode = generateRealBarcode(targetProduct.productId, existingVariants.length + 1);

    const newVariant: Variant = {
      ...variantForm,
      barcodeId: realBarcode,
      priceOverride: variantForm.priceOverride > 0 ? variantForm.priceOverride : targetProduct.basePrice
    };

    const updatedDto: Product = {
      ...targetProduct,
      variants: [...existingVariants, newVariant]
    };

    try {
      await productApi.update(targetProduct.productId, updatedDto);
      setVariantForm({ size: '', color: '', stockQuantity: 0, priceOverride: 0 });
      setSelectedProductId("");
      await loadProducts();
      alert("Variant added successfully!");
    } catch (error) {
      alert("Failed to append variant.");
    }
  };

  const handleItemPriceChange = async (barcode: string) => {
    if (!barcode) return;
    const newPrice = window.prompt(`Enter new price for barcode: ${barcode}`);
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      try {
        await productApi.updatePrice(barcode, parseFloat(newPrice));
        await loadProducts();
        alert("Price updated!");
      } catch (error) {
        alert("Failed to update price");
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Permanently delete this product and ALL variants?")) {
      try {
        await productApi.delete(id);
        await loadProducts();
      } catch (error) {
        alert("Delete failed.");
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-widest">Initialising Inventory...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-6 lg:p-12 text-slate-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Tab Navigation */}
        <div className="flex gap-4 p-1 bg-white/5 w-fit rounded-2xl border border-white/10">
          {(['ADD', 'UPDATE_VARIANT', 'MANAGE'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {activeTab === 'ADD' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase italic">Register Master Item</h2>
            <form onSubmit={handleInitialProductAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Product Name" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={productForm.productName} onChange={e => setProductForm({ ...productForm, productName: e.target.value })} required />
              <input placeholder="Category" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required />
              <input type="number" placeholder="Base Price" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={productForm.basePrice} onChange={e => setProductForm({ ...productForm, basePrice: +e.target.value })} required />
              <button type="submit" className="bg-blue-600 py-4 rounded-xl font-black text-white uppercase text-[10px]">Initialize Product</button>
            </form>
          </section>
        )}

        {activeTab === 'UPDATE_VARIANT' && (
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase italic">Append New Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none md:col-span-3" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value === "" ? "" : Number(e.target.value))}>
                <option value="">Choose Master Product...</option>
                {products.map(p => <option key={p.productId} value={p.productId}>{p.productName} (ID: {p.productId})</option>)}
              </select>
              <input placeholder="Size" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={variantForm.size} onChange={e => setVariantForm({ ...variantForm, size: e.target.value })} />
              <input placeholder="Color" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={variantForm.color} onChange={e => setVariantForm({ ...variantForm, color: e.target.value })} />
              <input type="number" placeholder="Stock Qty" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={variantForm.stockQuantity || ''} onChange={e => setVariantForm({ ...variantForm, stockQuantity: +e.target.value })} />
              <button onClick={handleAddVariantToExisting} className="md:col-span-3 bg-amber-600 py-4 rounded-xl font-black text-white uppercase text-[11px] tracking-widest">Generate Barcode & Add</button>
            </div>
          </section>
        )}

        <div className="space-y-8">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] italic opacity-50">Global Inventory Master</h2>
          {products.map(product => (
            <div key={product.productId} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 bg-white/[0.02] flex flex-wrap justify-between items-start border-b border-white/5 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{product.category}</p>
                  <h3 className="text-2xl font-black text-white uppercase italic">{product.productName}</h3>
                </div>
                <button onClick={() => handleDeleteProduct(product.productId)} className="px-4 py-2 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">DELETE PRODUCT</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-[9px] text-slate-500 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-8 py-4">SKU / ID</th>
                      <th className="px-8 py-4">Attributes</th>
                      <th className="px-8 py-4">Stock</th>
                      <th className="px-8 py-4">Barcode</th>
                      <th className="px-8 py-4 text-right">Price Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-white/5">
                    {product.variants?.map((v, i) => (
                      <tr key={i} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-5 text-white uppercase font-bold">{v.sku || `V-${i+1}`}</td>
                        <td className="px-8 py-5"><span className="text-slate-300 font-black">{v.size}</span><span className="mx-2 text-slate-600">|</span><span className="text-slate-400 uppercase">{v.color}</span></td>
                        <td className="px-8 py-5 text-slate-300">{v.stockQuantity}</td>
                        <td className="px-8 py-5 font-mono text-[10px] text-blue-400/60">{v.barcodeId || 'GEN-ERR'}</td>
                        <td className="px-8 py-5 text-right">
                            <button onClick={() => handleItemPriceChange(v.barcodeId!)} className="text-white font-black italic bg-white/5 px-3 py-1 rounded border border-white/10 hover:border-blue-500">
                              Rs. {v.priceOverride?.toLocaleString()} ✎
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'MANAGE' && (
            <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-xl font-black text-white mb-6 uppercase italic text-center">Barcode Tag Manager</h2>
              <div className="grid grid-cols-1 gap-4">
                {products.map(p => (
                  <div key={p.productId} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="font-bold text-white uppercase text-xs">{p.productName}</span>
                    <button onClick={() => setBarcodeModal({ productName: p.productName, variants: p.variants || [] })} className="text-[10px] font-black text-cyan-400 border border-cyan-400/30 px-6 py-2 rounded-xl hover:bg-cyan-400 hover:text-white transition-all tracking-widest">OPEN TAG MODAL</button>
                  </div>
                ))}
              </div>
            </section>
        )}

        {barcodeModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
            <div className="bg-[#111827] border border-white/10 rounded-[3rem] w-full max-w-lg p-10">
                <h2 className="text-white font-black uppercase text-center mb-6 tracking-tighter text-xl italic">Downloadable Tags</h2>
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                 {barcodeModal.variants.map((v, idx) => (
                   /* FIXED STYLING FOR DOWNLOAD COMPATIBILITY */
                   <div 
                    key={idx} 
                    className="barcode-tag-item p-6 rounded-[1.5rem] flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                   >
                     <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', color: '#000000' }}>
                        {barcodeModal.productName}
                     </p>
                     <p style={{ fontSize: '9px', fontWeight: 700, marginBottom: '16px', color: '#4b5563' }}>
                        {v.size} - {v.color} | Rs. {v.priceOverride}
                     </p>
                     <Barcode 
                        value={v.barcodeId || "0"} 
                        format="CODE128" 
                        width={1.2} 
                        height={50} 
                        displayValue={true} 
                        renderer="canvas" 
                        background="#ffffff"
                        lineColor="#000000"
                     />
                   </div>
                 ))}
               </div>
               <div className="mt-8 flex flex-col gap-3">
                 <button 
                   onClick={downloadBarcodeTags} 
                   className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[10px] font-black text-white uppercase transition-colors tracking-[0.2em]"
                 >
                   Download PNG Tags
                 </button>
                 <button onClick={() => setBarcodeModal(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase transition-all">Close</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;