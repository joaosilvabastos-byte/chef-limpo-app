import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import jsPDF from "jspdf";
import "./index.css";



// ── i18n ────────────────────────────────────────────────────────────────────
type Lang = "PT" | "ES" | "FR" | "EN";
const LANG_FLAGS: Record<Lang, string> = { 
  PT: "🇵🇹", 
  ES: "🇪🇸", 
  FR: "🇫🇷", 
  EN: "ᴇɴ"  // <── Copia este "ᴇɴ" daqui
};

const TR: Record<Lang, Record<string, string>> = {
  PT: {
    appName: "CHEF MARGIN PRO", appSub: "Gestão de custos e margens",
    dashboard: "Dashboard", recipes: "Receitas", create: "Criar", warehouse: "Armazém", options: "Opções",
    semGreen: "✅ Margem dentro do objetivo",
    semOrange: "⚠️ ATENÇÃO: Margem a cair abaixo do objetivo!",
    semRed: "🚨 ALERTA VERMELHO: Lucro em Risco! Verifique os Custos.",
    globalChart: "LUCRO vs CUSTO — RECEITAS ATIVAS",
    allRecipes: "Todas", ranking: "Ranking",
    noRecipes: "Nenhuma receita guardada.", noWarehouse: "Armazém vazio.",
    addIngredient: "+ Adicionar Ingrediente",
    saveRecipe: "💾 GUARDAR RECEITA", saveWarehouse: "💾 GUARDAR ARMAZÉM",
    newItem: "+ NOVO",
    ingredient: "Ingrediente", unit: "Unid.", qty: "Qtd.",
    extras: "Extras", marginPct: "Minha Margem %",
    totalCost: "Custo Total", objetivo: "Objetivo",
    myPrice: "Meu Preço/Dose", lossBreak: "Quebra %",
    realProfit: "Lucro Real", doses: "Doses",
    fryerToggle: "🔥 FRITADEIRA",
    fryerWatts: "Watts", fryerTime: "min", fryerOilQty: "Óleo (L)", fryerUses: "Uso",
    costAlertMsg: "🚨 Custo subiu no Armazém!", costAlertAdjust: "Ajustar", costAlertKeep: "Manter", semNeg: "Negativo", semBelowTarget: "Abaixo do objetivo", semDesc: "A descer",
    energySource: "Fonte de Energia", energyMin: "Minutos", energyWatts: "Watts", energyKg: "Kg Usados",
    ivaEnergiaLabel: "IVA Energia", burners: "Nº Bicos",
    deliveryPlatforms: "DELIVERY", nominalProfit: "Lucro Nominal / Dose",
    ivaIngredients: "IVA Ingredientes", ivaEnergy: "IVA Energia", ivaFryer: "IVA Fritadeira",
    ivaSubtotal: "Sub-Total IVA", ivaTotal: "IVA TOTAL",
    exportPdf: "📄 Exportar Receitas PDF", exportWarehousePdf: "📦 Exportar Armazém PDF", exportIvaPdf: "📊 Exportar Resumo IVA", exportJson: "📤 Exportar Armazém", importJson: "📥 Importar Armazém",
    deleteAll: "🗑️ Apagar todas as receitas",
    deleteAllConfirm: "Apagar TODAS as receitas? Esta ação não pode ser desfeita.", cancelBtn: "Cancelar", apagar: "Apagar",
    deleteRecipeConfirm: "Apagar esta receita?",
    recipeName: "Nome da Receita",
    oilNotFound: "⚠️ Sem 'Óleo' no Armazém", oilFoundAt: "Óleo do Armazém:",
    proModal_title: "⭐ VERSÃO PRO", proModal_desc: "Por apenas 7€/mês, guarda receitas ilimitadas e recebe alertas de prejuízo.",
    proModal_cta: "ATIVAR AGORA — 7€/mês", proModal_cancel: "Agora não",
    proSaved: "✨ Modo PRO ativado!", proActive: "PRO ✓",
    toastSaved: "guardada com sucesso!", toastWarehouseSaved: "✨ Armazém guardado!",
    openRecipe: "ABRIR", versionInfo: "Versão 3.0 PRO",
    notInWarehouse: "Não encontrado no Armazém",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ receita",
    rankingProfit: "Lucro Absoluto",
    noActiveRecipes: "Nenhuma receita ativa.",
    data: "Dados",
    
  },
  ES: {
    appName: "CHEF MARGIN PRO", appSub: "Gestión de costes y márgenes",
    dashboard: "Panel", recipes: "Recetas", create: "Crear", warehouse: "Almacén", options: "Opciones",
    semGreen: "✅ Margen dentro del objetivo",
    semOrange: "⚠️ ATENCIÓN: ¡El margen está cayendo por debajo del objetivo!",
    semRed: "🚨 ALERTA ROJA: ¡Beneficio en riesgo! Revisa los costes.",
    globalChart: "BENEFICIO vs COSTE — RECETAS ACTIVAS",
    allRecipes: "Todas", ranking: "Ranking",
    noRecipes: "Ninguna receta guardada.", noWarehouse: "Almacén vacío.",
    addIngredient: "+ Añadir Ingrediente",
    saveRecipe: "💾 GUARDAR RECETA", saveWarehouse: "💾 GUARDAR ALMACÉN",
    newItem: "+ NUEVO",
    ingredient: "Ingrediente", unit: "Unid.", qty: "Cant.",
    extras: "Extras", marginPct: "Mi Margen %",
    totalCost: "Coste Total", objetivo: "Objetivo",
    myPrice: "Mi Precio/Ración", lossBreak: "Merma %",
    realProfit: "Beneficio Real", doses: "Raciones",
    fryerToggle: "🔥 FREIDORA",
    fryerWatts: "Vatios", fryerTime: "min", fryerOilQty: "Aceite (L)", fryerUses: "Uso",
    costAlertMsg: "🚨 ¡Coste subió en Almacén!", costAlertAdjust: "Ajustar", costAlertKeep: "Mantener", semNeg: "Negativo", semBelowTarget: "Bajo objetivo", semDesc: "Bajando",
    energySource: "Fuente Energía", energyMin: "Minutos", energyWatts: "Vatios", energyKg: "Kg Usados",
    ivaEnergiaLabel: "IVA Energía", burners: "Nº Quemadores",
    deliveryPlatforms: "DELIVERY", nominalProfit: "Beneficio Nominal / Ración",
    ivaIngredients: "IVA Ingredientes", ivaEnergy: "IVA Energía", ivaFryer: "IVA Freidora",
    ivaSubtotal: "Sub-Total IVA", ivaTotal: "IVA TOTAL",
    exportPdf: "📄 Exportar Recetas PDF", exportWarehousePdf: "📦 Exportar Almacén PDF", exportIvaPdf: "📊 Exportar Resumen IVA", exportJson: "📤 Exportar Almacén", importJson: "📥 Importar Almacén",
    deleteAll: "🗑️ Borrar todas las recetas",
    deleteAllConfirm: "¿Borrar TODAS las recetas? Esta acción no se puede deshacer.", cancelBtn: "Cancelar", apagar: "Borrar",
    deleteRecipeConfirm: "¿Borrar esta receta?",
    recipeName: "Nombre de la Receta",
    oilNotFound: "⚠️ Sin 'Aceite' en Almacén", oilFoundAt: "Aceite del Almacén:",
    proModal_title: "⭐ VERSIÓN PRO", proModal_desc: "Por solo 7€/mes, guarda recetas ilimitadas.",
    proModal_cta: "ACTIVAR AHORA — 7€/mes", proModal_cancel: "Ahora no",
    proSaved: "✨ ¡Modo PRO activado!", proActive: "PRO ✓",
    toastSaved: "¡guardada con éxito!", toastWarehouseSaved: "✨ ¡Almacén guardado!",
    openRecipe: "ABRIR", versionInfo: "Versión 3.0 PRO",
    notInWarehouse: "No encontrado en Almacén",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ receta",
    rankingProfit: "Beneficio Absoluto",
    noActiveRecipes: "Ninguna receta activa.",
    data: "Datos",
  },
  FR: {
    appName: "CHEF MARGIN PRO", appSub: "Gestion des coûts et marges",
    dashboard: "Tableau", recipes: "Recettes", create: "Créer", warehouse: "Entrepôt", options: "Options",
    semGreen: "✅ Marge dans l'objectif",
    semOrange: "⚠️ ATTENTION: La marge descend sous l'objectif!",
    semRed: "🚨 ALERTE ROUGE: Profit en danger! Vérifiez les coûts.",
    globalChart: "PROFIT vs COÛT — RECETTES ACTIVES",
    allRecipes: "Toutes", ranking: "Classement",
    noRecipes: "Aucune recette sauvegardée.", noWarehouse: "Entrepôt vide.",
    addIngredient: "+ Ajouter Ingrédient",
    saveRecipe: "💾 SAUVEGARDER", saveWarehouse: "💾 SAUVEGARDER ENTREPÔT",
    newItem: "+ NOUVEAU",
    ingredient: "Ingrédient", unit: "Unité", qty: "Qté",
    extras: "Extras", marginPct: "Ma Marge %",
    totalCost: "Coût Total", objetivo: "Objectif",
    myPrice: "Mon Prix/Portion", lossBreak: "Perte %",
    realProfit: "Profit Réel", doses: "Portions",
    fryerToggle: "🔥 FRITEUSE",
    fryerWatts: "Watts", fryerTime: "min", fryerOilQty: "Huile (L)", fryerUses: "Util",
    costAlertMsg: "🚨 Coût en hausse!", costAlertAdjust: "Ajuster", costAlertKeep: "Maintenir", semNeg: "Négatif", semBelowTarget: "Sous objectif", semDesc: "En baisse",
    energySource: "Source Énergie", energyMin: "Minutes", energyWatts: "Watts", energyKg: "Kg Utilisés",
    ivaEnergiaLabel: "TVA Énergie", burners: "Nb Brûleurs",
    deliveryPlatforms: "LIVRAISON", nominalProfit: "Profit Nominal / Portion",
    ivaIngredients: "TVA Ingrédients", ivaEnergy: "TVA Énergie", ivaFryer: "TVA Friteuse",
    ivaSubtotal: "Sous-Total TVA", ivaTotal: "TVA TOTALE",
    exportPdf: "📄 Exporter Recettes PDF", exportWarehousePdf: "📦 Exporter Stock PDF", exportIvaPdf: "📊 Exporter Résumé TVA", exportJson: "📤 Exporter le Stock", importJson: "📥 Importer le Stock",
    deleteAll: "🗑️ Supprimer toutes les recettes",
    deleteAllConfirm: "Supprimer TOUTES les recettes? Action irréversible.", cancelBtn: "Annuler", apagar: "Supprimer",
    deleteRecipeConfirm: "Supprimer cette recette?",
    recipeName: "Nom de la Recette",
    oilNotFound: "⚠️ Pas d'huile dans l'entrepôt", oilFoundAt: "Huile de l'entrepôt:",
    proModal_title: "⭐ VERSION PRO", proModal_desc: "Pour seulement 7€/mois, sauvegardez des recettes illimitées.",
    proModal_cta: "ACTIVER MAINTENANT — 7€/mois", proModal_cancel: "Pas maintenant",
    proSaved: "✨ Mode PRO activé!", proActive: "PRO ✓",
    toastSaved: "sauvegardée avec succès!", toastWarehouseSaved: "✨ Entrepôt sauvegardé!",
    openRecipe: "OUVRIR", versionInfo: "Version 3.0 PRO",
    notInWarehouse: "Introuvable dans l'entrepôt",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ recette",
    rankingProfit: "Profit Absolu",
    noActiveRecipes: "Aucune recette active.",
    data: "Données",
  },
  EN: {
    appName: "CHEF MARGIN PRO", appSub: "Cost & margin management",
    dashboard: "Dashboard", recipes: "Recipes", create: "Create", warehouse: "Warehouse", options: "Options",
    semGreen: "✅ Margin on target",
    semOrange: "⚠️ WARNING: Margin is slipping below target!",
    semRed: "🚨 RED ALERT: Profit at Risk! Check Costs.",
    globalChart: "PROFIT vs COST — ACTIVE RECIPES",
    allRecipes: "All", ranking: "Ranking",
    noRecipes: "No saved recipes.", noWarehouse: "Warehouse empty.",
    addIngredient: "+ Add Ingredient",
    saveRecipe: "💾 SAVE RECIPE", saveWarehouse: "💾 SAVE WAREHOUSE",
    newItem: "+ NEW",
    ingredient: "Ingredient", unit: "Unit", qty: "Qty",
    extras: "Extras", marginPct: "My Margin %",
    totalCost: "Total Cost", objetivo: "Target Price",
    myPrice: "My Price/Serving", lossBreak: "Waste %",
    realProfit: "Real Profit", doses: "Servings",
    fryerToggle: "🔥 FRYER",
    fryerWatts: "Watts", fryerTime: "min", fryerOilQty: "Oil (L)", fryerUses: "Uses",
    costAlertMsg: "🚨 Cost rose in Warehouse!", costAlertAdjust: "Adjust", costAlertKeep: "Keep", semNeg: "Negative", semBelowTarget: "Below target", semDesc: "Declining",
    energySource: "Energy Source", energyMin: "Minutes", energyWatts: "Watts", energyKg: "Kg Used",
    ivaEnergiaLabel: "VAT Energy", burners: "Nr. Burners",
    deliveryPlatforms: "DELIVERY", nominalProfit: "Nominal Profit / Serving",
    ivaIngredients: "VAT Ingredients", ivaEnergy: "VAT Energy", ivaFryer: "VAT Fryer",
    ivaSubtotal: "VAT Sub-Total", ivaTotal: "TOTAL VAT",
    exportPdf: "📄 Export Recipes PDF", exportWarehousePdf: "📦 Export Warehouse PDF", exportIvaPdf: "📊 Export VAT Summary", exportJson: "📤 Export Warehouse", importJson: "📥 Import Warehouse",
    deleteAll: "🗑️ Delete all recipes",
    deleteAllConfirm: "Delete ALL recipes? This cannot be undone.", cancelBtn: "Cancel", apagar: "Delete",
    deleteRecipeConfirm: "Delete this recipe?",
    recipeName: "Recipe Name",
    oilNotFound: "⚠️ No 'Oil' in Warehouse", oilFoundAt: "Oil from Warehouse:",
    proModal_title: "⭐ PRO VERSION", proModal_desc: "For just $7/month, save unlimited recipes and get loss alerts.",
    proModal_cta: "ACTIVATE NOW — $7/month", proModal_cancel: "Not now",
    proSaved: "✨ PRO mode activated!", proActive: "PRO ✓",
    toastSaved: "saved successfully!", toastWarehouseSaved: "✨ Warehouse saved!",
    openRecipe: "OPEN", versionInfo: "Version 3.0 PRO",
    notInWarehouse: "Not found in Warehouse",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ recipe",
    rankingProfit: "Absolute Profit",
    noActiveRecipes: "No active recipes.",
    data: "Data"
  },
};

// ── Types ──────────────────────────────────────────────────────────────────
interface Ingredient {
  id: string;
  name: string;
  unit: "KG" | "L" | "UN" | "DZ";
  price: number;
  qty: number;
  iva: number;
}

interface PriceHistoryEntry { date: string; oldPrice: number; }

interface WarehouseItem {
  id: string;
  name: string;
  unit: "KG" | "L" | "UN" | "DZ";
  price: number;
  iva: number;
  priceHistory?: PriceHistoryEntry[];
}

interface SavedRecipe {
  key: string;
  name: string;
  date: string;
  sellPrice: number;
  margin: number;
  totalCost: number;
  profit: number;
  // A linha 'efficiency: number;' foi removida! ✅
  objetivo?: number;
  doses?: number;
  active?: boolean;
  ingredients: Ingredient[];
  extras: number;
  loss: number;
  fryer: boolean;
  fryerData: FryerData;
  energy: boolean;
  energyData: EnergyData;
  deliveryCount: number;
  deliveryRate: number;
}

interface FryerData { oilLiters: number; watts: number; time: number; uses: number; }

interface EnergyData {
  type: "Eletricidade" | "Gás" | "Carvão";
  cost: number; power: number; time: number; burners: number; iva: number;
}

interface CalcResult {
  totalCost: number; 
  objetivo: number; 
  lucroReal: number; 
  doses: number; 
  effectiveDelivery: number;
  ivaIngredientes: number; 
  ivaEnergy: number; 
  ivaFryer: number;
  nominalProfit: number; 
  // A eficiência foi removida daqui! ✅
  uberPrice: number;
  targetProfit: number; 
  fryerCostTotal: number; 
  energyCostTotal: number;
  roi: number; // Adiciona esta linha aqui!
}

interface ToastItem { id: string; message: string; }

interface CostAlert { recipeKey: string; recipeName: string; oldCost: number; newCost: number; }

type SemaphoreState = "idle" | "green" | "orange" | "red";

// ── Engine ─────────────────────────────────────────────────────────────────
function calcRecipe(
  ingredients: any[], 
  margin: number, 
  loss: number, 
  extras: number, 
  sellPrice: number, 
  deliveryRate: number, 
  deliveryCount: number, 
  fryerCost: number, 
  energyCostVal: number
) {
  // 1. CUSTO LÍQUIDO PURO (Sem IVA aqui para não arredondar errado)
  const totalLiquido = (ingredients || []).reduce((sum, ing) => {
    const p = Number(ing.price) || 0;
    const q = Number(ing.qty) || 0;
    const unitP = ing.unit === "DZ" ? p / 12 : p;
    return sum + (q * unitP);
  }, 0);

  // 2. OUTROS CUSTOS
  const outros = (Number(fryerCost) || 0) + (Number(energyCostVal) || 0) + (Number(extras) || 0);
  const subTotal = totalLiquido + outros;

  // 3. IVA DOS INGREDIENTES (Calculado sobre o total para evitar os 2 cêntimos de erro)
  // Assumindo 23% fixo se quiseres, ou vindo do primeiro ingrediente
  const taxaIva = (Number(ingredients?.[0]?.iva) || 23) / 100;
  const valorIva = subTotal * taxaIva;

  // CUSTO REAL FINAL (Ex: 10€ + 2.30€ = 12.30€)
  const totalCost = subTotal + valorIva;

  // 4. MARGEM (Removida a trava do isSaved para a margem funcionar SEMPRE)
  const marginRate = Math.min((Number(margin) || 0) / 100, 0.99);
  const objetivo = totalCost / Math.max(1 - marginRate, 0.01);

  // 5. LUCRO E QUEBRA
  const dosesTotais = Number(sellPrice) > 0.01 ? objetivo / Number(sellPrice) : 0;
  const faturacaoReal = dosesTotais > 0 
    ? (dosesTotais * (1 - (Number(loss) / 100))) * Number(sellPrice) 
    : objetivo;

  const lucroReal = faturacaoReal - totalCost;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    objetivo: Number(objetivo.toFixed(2)),
    lucroReal: Number(lucroReal.toFixed(2)),
    faturacao: Number(faturacaoReal.toFixed(2)),
    doses: Number(dosesTotais.toFixed(2)),
    ivaIngredientes: Number(valorIva.toFixed(2)),
    roi: totalCost > 0 ? (lucroReal / totalCost) * 100 : 0,
    targetProfit: objetivo - totalCost
  };
}

// ── SEMÁFORO (DASHBOARD) ────────────────────────────────────
function computeSemaphore(r: SavedRecipe): "red" | "orange" | "green" {
  const lucro = r.profit ?? 0;
  const obj = r.objetivo ?? 0;
  const custo = r.totalCost ?? 0;
  const lucroAlvo = obj - custo;
  if (lucro < 0) return "red";
  if (lucro < (lucroAlvo - 0.05)) return "orange";
  return "green";
}

// ── VIGILANTE DO ARMAZÉM ────────────────────────────────────
function recomputeIngredientCostFromWarehouse(ingredients: Ingredient[], warehouse: WarehouseItem[]): number {
  let total = 0;
  for (const ing of ingredients) {
    if (!ing.name) continue;
    const wItem = warehouse.find((w) => w.name.trim().toLowerCase() === ing.name.trim().toLowerCase());
    const price = wItem ? wItem.price : (ing.price || 0);
    const rawIva = wItem ? wItem.iva : (ing.iva || 0);
    const iva = rawIva >= 1 ? rawIva / 100 : rawIva;
    const unitPrice = ing.unit === "DZ" ? price / 12 : price;
    total += (ing.qty || 0) * unitPrice * (1 + iva);
  }
  return total;
}

function computeCostAlerts(activeRecipes: SavedRecipe[], _warehouse: WarehouseItem[], acknowledgedKeys: Set<string>): CostAlert[] {
  const alerts: CostAlert[] = [];
  for (const r of activeRecipes) {
    if (acknowledgedKeys.has(r.key) || !r.ingredients?.length || !r.objetivo) continue;
    if ((r.profit ?? 0) < 0) {
      const marginRate = Math.min((r.margin || 0) / 100, 0.99);
      alerts.push({ recipeKey: r.key, recipeName: r.name, oldCost: r.objetivo * (1 - marginRate), newCost: r.totalCost || 0 });
    }
  }
  return alerts;
}

// ── Utils ───────────────────────────────────────────────────
function newId() { return "ID_" + Date.now() + Math.floor(Math.random() * 1000); }
function fmtDate(iso: string) {
  try { 
    const d = new Date(iso); 
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; 
  } catch { return iso.slice(0, 10); }
}

const STORAGE_PREFIX = "CHEFV2_";
function saveLS(key: string, data: unknown) { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} }
function loadLS<T>(key: string): T | null { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; } catch { return null; } }

function getAllRecipes(): SavedRecipe[] {
  const result: SavedRecipe[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX + "REC_")) {
      const d = loadLS<SavedRecipe>(k);
      if (d) result.push({ active: false, ...d, key: k });
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}

// ── FIM DAS UTILIDADES (Garanta que a próxima linha é o export default function App() { )

// ── PRO Modal ─────────────────────────────────────────────────────────────
function ProModal({ onActivate, onClose, t }: { onActivate: () => void; onClose: () => void; t: Record<string, string> }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t.proModal_title}</div>
        <div className="modal-price">7<span style={{ fontSize: 20 }}>€</span><span>/mês</span></div>
        <div className="modal-desc">{t.proModal_desc}</div>
        <button className="modal-btn-cta" onClick={onActivate}>{t.proModal_cta}</button>
        <button className="modal-btn-skip" onClick={onClose}>{t.proModal_cancel}</button>
      </div>
    </div>
  );
}

// ── Custom Rate Select ─────────────────────────────────────────────────────
function RateSelect({ value, onChange, options }: { value: number; onChange: (v: number) => void; options: {v: number; l: string}[] }) {
  const [customMode, setCustomMode] = useState(false);
  const isInOptions = options.some(o => Math.abs(o.v - value) < 0.0001);
  const showCustom = customMode || !isInOptions;
  if (showCustom) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        <input className="f-input" type="number" min="0" step="0.1" placeholder="%"
          style={{ flex: 1 }}
          value={value > 0 && value < 1 ? +(value * 100).toFixed(4) : value >= 1 ? value : ""}
          onChange={(e) => onChange((parseFloat(e.target.value) || 0) / 100)}
          autoFocus />
        <button style={{ background: "rgba(196,167,120,0.15)", border: "1px solid rgba(196,167,120,0.3)", color: "var(--gold)", borderRadius: 6, padding: "0 7px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
          onClick={() => { setCustomMode(false); onChange(options[0]?.v ?? 0.23); }}
          title="Voltar às opções">⟵</button>
      </div>
    );
  }
  return (
    <select className="f-input" value={value}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (isNaN(v) || e.target.value === "-1") { setCustomMode(true); }
        else onChange(v);
      }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      <option value={-1}>Outro...</option>
    </select>
  );
}

// ── Ingredient Row ─────────────────────────────────────────────────────────
function IngredientRow({
  ing, warehouse, onChange, onDelete, t,
}: {
  ing: Ingredient; warehouse: WarehouseItem[];
  onChange: (u: Ingredient) => void; onDelete: () => void;
  t: Record<string, string>;
}) {
  const wItem = warehouse.find((w) => w.name.toLowerCase() === ing.name.toLowerCase());
  const [showDrop, setShowDrop] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = ing.name
    ? warehouse.filter((w) => w.name.toLowerCase().includes(ing.name.toLowerCase()))
    : warehouse;

  const handleName = (name: string) => {
    const found = warehouse.find((w) => w.name.toLowerCase() === name.toLowerCase());
    if (found) onChange({ ...ing, name, price: found.price, unit: found.unit, iva: found.iva });
    else onChange({ ...ing, name });
  };

  const openDrop = () => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setDropStyle({ position: "fixed", top: r.bottom + 2, left: r.left, width: r.width, zIndex: 9999 });
    setShowDrop(true);
  };

  return (
    <div className="ingredient-row">
      <div style={{ position: "relative" }}>
        <input ref={inputRef} className="f-input f-name" type="text" placeholder={t.ingredient}
          value={ing.name}
          onChange={(e) => { handleName(e.target.value); openDrop(); }}
          onFocus={openDrop}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)} />
        {ing.name && !wItem && <div className="ing-warning" title={t.notInWarehouse}>⚠️</div>}
        {showDrop && filtered.length > 0 && (
          <div style={{ ...dropStyle, background: "#1e1433", border: "1px solid rgba(196,167,120,0.35)", borderRadius: 8, maxHeight: 180, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
            {filtered.map((w) => (
              <div key={w.id}
                onMouseDown={() => { handleName(w.name); setShowDrop(false); }}
                style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {w.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="f-input-static">{ing.unit}</div>
      <input className="f-input" type="number" step="0.001" min="0" placeholder="0"
        value={ing.qty || ""} onChange={(e) => onChange({ ...ing, qty: parseFloat(e.target.value) || 0 })} />
      <button className="btn-del-row" onClick={onDelete}>✕</button>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function DashboardSection({
  activeRecipes, semaphore, t, fmt, costAlerts, onAjustar, onManter,
}: {
  activeRecipes: SavedRecipe[]; semaphore: SemaphoreState;
  t: Record<string, string>; fmt: (n: number) => string;
  costAlerts: CostAlert[]; onAjustar: (key: string) => void; onManter: (key: string) => void;
}) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<{ destroy?: () => void } | null>(null);

 const isIdle = activeRecipes.length === 0;

// ✅ REMOVIDO O Math.max(0, ...) para permitir que o prejuízo apareça!
const totalProfit = activeRecipes.reduce((a, r) => a + (r.profit || 0), 0);

const totalCost = activeRecipes.reduce((a, r) => a + (r.totalCost || 0), 0);

  const activeColor = semaphore === "green" ? "#22c55e" : semaphore === "orange" ? "#f97316" : semaphore === "red" ? "#ef4444" : "#22c55e";
  const bannerText = semaphore === "green" ? t.semGreen : semaphore === "orange" ? t.semOrange : semaphore === "red" ? t.semRed : "";
  const bannerClass = semaphore === "green" ? "sem-green" : semaphore === "orange" ? "sem-orange" : semaphore === "red" ? "sem-red" : "";

  useEffect(() => {
    const render = () => {
      const Chart = (window as unknown as Record<string, unknown>).Chart as {
        new (ctx: unknown, config: unknown): { destroy?: () => void };
      };
      if (!Chart) return;
      chartInst.current?.destroy?.();
      if (!chartRef.current) return;

      // 🟢 DETETAR SE É PREJUÍZO
      const isNegative = totalProfit < 0;

      chartInst.current = new Chart(chartRef.current, {
        type: "doughnut",
        data: {
          // Muda o nome para "Prejuízo" na legenda se o valor for negativo
          labels: [isNegative ? "Prejuízo" : t.realProfit, t.totalCost],
          datasets: [{
            // ✅ Math.abs() permite ao gráfico desenhar a fatia do prejuízo
            data: isIdle ? [1, 1] : [Math.abs(totalProfit) || 0.01, totalCost || 0.01],
            
            // ✅ Se for negativo, pinta de Vermelho (#ef4444). Se for lucro, usa a tua activeColor
            backgroundColor: isIdle 
              ? ["#6b7280", "#4b5563"] 
              : [isNegative ? "#ef4444" : activeColor, "#c4a778"],
            
            borderColor: "#1a0b2e",
            borderWidth: 5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "74%",
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: !isIdle,
              callbacks: { 
                // ✅ Ajuste no Tooltip para mostrar o sinal de menos se for prejuízo
                label: (ctx: { label: string; raw: unknown }) => {
                  const val = isNegative && ctx.label === "Prejuízo" ? -Number(ctx.raw) : Number(ctx.raw);
                  return ` ${ctx.label}: ${fmt(val)}`;
                } 
              },
            },
          },
        },
      });
    };

    if (!(window as unknown as Record<string, unknown>).Chart) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
      s.onload = render; 
      document.head.appendChild(s);
    } else { 
      render(); 
    }

    return () => { chartInst.current?.destroy?.(); };
  }, [activeRecipes, semaphore, totalProfit, totalCost, t, fmt, activeColor, isIdle]);

  return (
    <div className="dashboard-root">
      {/* LOGO GRANDE DO AMIGO */}
      <div className="dash-logo-wrap" style={{ textAlign: 'center', marginBottom: '25px' }}>
        <img 
          src="./LOGO.png" 
          alt="Chef Margin Pro" 
          style={{ 
            width: '750px', 
            height: 'auto', 
            display: 'block', 
            margin: '0 auto 10px' 
          }} 
        />
        
      </div>

      {/* ── Priority alert hierarchy: ONE alert at a time ──────────────────── */}
      {/* 1st: RED critical — cost alerts (highest priority, hides rest) */}
      {costAlerts.length > 0 ? (
        <div className="sem-banner sem-red" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🚨 {costAlerts[0].recipeName} — {t.costAlertMsg.replace("🚨 ", "")}</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>{fmt(costAlerts[0].oldCost)} → {fmt(costAlerts[0].newCost)}</div>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value === "ajustar") onAjustar(costAlerts[0].recipeKey);
              else if (e.target.value === "manter") onManter(costAlerts[0].recipeKey);
              e.target.value = "";
            }}
            style={{ background: "rgba(0,0,0,0.4)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "8px 10px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 2 }}
          >
            <option value="" disabled>{t.costAlertMsg.replace("🚨 ", "")}</option>
            <option value="ajustar">{t.costAlertAdjust}</option>
            <option value="manter">{t.costAlertKeep}</option>
          </select>
          {costAlerts.length > 1 && <div style={{ fontSize: 12, opacity: 0.7 }}>+{costAlerts.length - 1} {t.costAlertMsg.includes("alert") ? "more alerts" : "mais alertas"}</div>}
        </div>
      ) : semaphore !== "idle" ? (
        /* 2nd: Semaphore banner (orange or green) only when no cost alert */
        <div className={`sem-banner ${bannerClass}`} style={{ fontSize: 16, padding: "12px 16px" }}>{bannerText}</div>
      ) : null}

      {/* Doughnut */}
      <div className="chart-card chart-card-main">
        <div className="chart-label" style={{ fontSize: isIdle ? 18 : 13, color: "#ffffff", fontWeight: 700, textAlign: "center", padding: "4px 0", letterSpacing: 0.5 }}>
          {isIdle ? t.noActiveRecipes : t.globalChart}
        </div>
        <>
          {/* Manual legend — always visible with real program colors */}
          <div className="chart-totals">
            <div className="chart-total-item">
              <span style={{ color: "#22c55e" }}>●</span>
              <span style={{ color: "#ffffff" }}>{t.realProfit}{!isIdle && `: `}<strong>{!isIdle && fmt(totalProfit)}</strong></span>
            </div>
            <div className="chart-total-item">
              <span style={{ color: "#c4a778" }}>●</span>
              <span style={{ color: "#ffffff" }}>{t.totalCost}{!isIdle && `: `}<strong>{!isIdle && fmt(totalCost)}</strong></span>
            </div>
            <div className="chart-total-item">
              <span style={{ color: "#f97316" }}>●</span>
              <span style={{ color: semaphore === "orange" ? "#fdba74" : "#ffffff" }}>{t.semDesc}</span>
            </div>
            <div className="chart-total-item">
              <span style={{ color: "#ef4444" }}>●</span>
              <span style={{ color: semaphore === "red" ? "#fca5a5" : "#ffffff" }}>{t.semNeg}</span>
            </div>
          </div>
          <div className="canvas-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Lang>(() => loadLS<Lang>(STORAGE_PREFIX + "LANG") || "PT");
  const t = TR[lang];
  const setLangSave = (l: Lang) => { setLang(l); saveLS(STORAGE_PREFIX + "LANG", l); };

  // Currency: $ for EN, € for others
  const currency = lang === "EN" ? "$" : "€";
  const fmt = useCallback((n: number) => lang === "EN" ? `$${n.toFixed(2)}` : `${n.toFixed(2)}€`, [lang]);

  const [activeSection, setActiveSection] = useState<"dashboard" | "recipes" | "create" | "warehouse" | "settings">("dashboard");
  const [isPro, setIsPro] = useState<boolean>(() => loadLS<boolean>(STORAGE_PREFIX + "PRO") || false);
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteRecipeKey, setDeleteRecipeKey] = useState<string | null>(null);
  const [proModalCallback, setProModalCallback] = useState<(() => void) | null>(null);

  // Toast
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback((msg: string) => {
    const id = newId();
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // Recipe form state
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: newId(), name: "", unit: "KG", price: 0, qty: 0, iva: 0.23 },
  ]);
  const [extras, setExtras] = useState(0);
  const [margin, setMargin] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [loss, setLoss] = useState(0);

  // Fryer
  const [fryerOn, setFryerOn] = useState(false);
  const [fryerData, setFryerData] = useState<FryerData>({ oilLiters: 2, watts: 2500, time: 5, uses: 10 });

  // Energy
  const [energyOn, setEnergyOn] = useState(false);
  const [energyData, setEnergyData] = useState<EnergyData>({ type: "Eletricidade", cost: 0.22, power: 2000, time: 0, burners: 1, iva: 0.23 });

  // Delivery
  const [deliveryEntity, setDeliveryEntity] = useState("uber");
  const [deliveryRate, setDeliveryRate] = useState(0.2);
  const [deliveryCount, setDeliveryCount] = useState(0);

  // Warehouse
  const [warehouseSaved, setWarehouseSaved] = useState<WarehouseItem[]>(() =>
    (loadLS<WarehouseItem[]>(STORAGE_PREFIX + "WAREHOUSE") || []).sort((a, b) => a.name.localeCompare(b.name))
  );
  const [warehouseDraft, setWarehouseDraft] = useState<WarehouseItem[]>(() =>
    (loadLS<WarehouseItem[]>(STORAGE_PREFIX + "WAREHOUSE") || []).sort((a, b) => a.name.localeCompare(b.name))
  );
  const [warehouseChanged, setWarehouseChanged] = useState(false);

  // Saved recipes
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => getAllRecipes());
  const [recipesTab, setRecipesTab] = useState<"all" | "ranking">("all");

 const fryerOilItem = useMemo(() => {
  // Procura especificamente pelo nome exato que deste no armazém
  return warehouseSaved.find((w) => w.name.toLowerCase() === "óleo");
}, [warehouseSaved]);

  // Active recipes (default true if field missing)
  const activeRecipes = useMemo(() =>
    savedRecipes.filter((r) => r.active !== false),
    [savedRecipes]
  );

  // Vigilante: acknowledged cost-alert keys persisted in localStorage
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(
    () => new Set(loadLS<string[]>(STORAGE_PREFIX + "ACK_ALERTS") || [])
  );

  // Vigilante: compute cost alerts vs current warehouse prices
  const costAlerts = useMemo(
    () => computeCostAlerts(activeRecipes, warehouseSaved, acknowledgedAlerts),
    [activeRecipes, warehouseSaved, acknowledgedAlerts]
  );

  // Semaphore state — based on real profit, not cost alerts
  const semaphore = useMemo(() => computeSemaphore(activeRecipes), [activeRecipes]);

 // Ranking: top 5 pelo lucro real absoluto (já calculado na receita)
 const rankingRecipes = useMemo(() =>
   [...savedRecipes]
     // Filtramos para garantir que só entram receitas com custo e lucro definidos
     .filter((r) => r.totalCost > 0 && typeof r.profit !== 'undefined')
     // Ordenamos do maior lucro para o menor
     .sort((a, b) => b.profit - a.profit)
     .slice(0, 5),
   [savedRecipes]
 );

  // 1. Verifica se a receita que estás a ver já existe na lista
const existing = savedRecipes.find(r => r.name === recipeName);

// 2. Calc live (COM OS TEUS NOMES REAIS)
const calc = calcRecipe(
  ingredients, extras, margin, sellPrice, loss,
  fryerOn, fryerData, fryerOilItem,
  energyOn, energyData, deliveryCount, deliveryRate,
  !!existing,          // 🔴 Se encontrar o nome, passa TRUE
  existing?.objetivo || 0 // 🔴 Passa o objetivo que guardaste antes
);

  // ── Sync form ingredients with current warehouse prices ─────────────────────
  useEffect(() => {
    setIngredients((prev) => prev.map((ing) => {
      const w = warehouseSaved.find((ww) => ww.name.toLowerCase() === ing.name.toLowerCase());
      return w ? { ...ing, price: w.price, unit: w.unit, iva: w.iva } : ing;
    }));
  }, [warehouseSaved]);

  // ── Apply new warehouse to ALL saved recipes (called directly from handleSaveWarehouse)
  // objetivo stays LOCKED at the value set when the recipe was created/saved.
  // Only totalCost changes — which lowers profit and triggers the semaphore/alert.
  // ── Apply new warehouse to ALL saved recipes ─────────────────────
  // CORREÇÃO: O objetivo fica BLOQUEADO. Se o custo sobe, o lucro DESCE.
  const applySyncToRecipes = useCallback((newWarehouse: WarehouseItem[]) => {
    const oilItem = newWarehouse.find(w => w.name === "Óleo" || w.name === "Azeite");

    setSavedRecipes((prev) => {
      const updated = prev.map((r) => {
        if (!r.ingredients?.length) return r;

        // 1. Sincroniza ingredientes
        const syncedIngs = r.ingredients.map((ing) => {
          const w = newWarehouse.find((ww) => ww.name.toLowerCase() === ing.name.toLowerCase());
          return w ? { ...ing, price: w.price, unit: w.unit, iva: w.iva } : ing;
        });

        // 2. RECALCULA COM A TRAVA
        const recomputed = calcRecipe(
          syncedIngs, r.extras, r.margin, r.sellPrice, r.loss,
          r.fryer, r.fryerData, oilItem,
          r.energy, r.energyData,
          r.deliveryCount, r.deliveryRate,
          true,       // 🔴 isSaved
          r.objetivo  // 🔴 storedObjetivo
        );

      return {
    ...r,
    ingredients: syncedIngs,
    totalCost: recomputed.totalCost,
    profit: recomputed.lucroReal,
    objetivo: recomputed.objetivo,
    // A linha "efficiency: recomputed.efficiency" foi removida! ✅
  };
});
      return updated;
    });
  }, []);
  // PRO gate
  const requirePro = (callback: () => void) => {
    if (isPro) { callback(); return; }
    setProModalCallback(() => callback);
    setShowProModal(true);
  };

  const activatePro = () => {
    setIsPro(true);
    saveLS(STORAGE_PREFIX + "PRO", true);
    setShowProModal(false);
    showToast(t.proSaved);
    if (proModalCallback) { proModalCallback(); setProModalCallback(null); }
  };

  // Clear form
  const clearForm = () => {
    setRecipeName("");
    setIngredients([{ id: newId(), name: "", unit: "KG", price: 0, qty: 0, iva: 0.23 }]);
    setExtras(0); setMargin(0); setSellPrice(0); setLoss(0);
    setFryerOn(false);
    setFryerData({ oilLiters: 2, watts: 2500, time: 5, uses: 10 });
    setEnergyOn(false); setDeliveryCount(0); setDeliveryRate(0.2); setDeliveryEntity("uber");
  };

  // Save recipe
  // Save recipe
const handleSaveRecipe = () => {
  requirePro(() => {
    const name = recipeName.trim() || "Receita " + fmtDate(new Date().toISOString());
    const key = STORAGE_PREFIX + "REC_" + name.replace(/[\s\/\\]/g, "_");
    const existingRecipe = savedRecipes.find((r) => r.key === key);

   const data: SavedRecipe = {
        key,
        name,
        date: new Date().toISOString(),
        active: existingRecipe ? (existingRecipe.active !== false) : false,
        sellPrice,
        margin,
        totalCost: calc.totalCost,
        profit: calc.lucroReal,
        // A linha 'efficiency: calc.efficiency' foi removida! ✅
        objetivo: calc.objetivo, 
        ingredients: [...ingredients],
        extras,
        loss,
        fryer: fryerOn,
        fryerData: { ...fryerData },
        energy: energyOn,
        energyData: { ...energyData },
        deliveryCount,
        deliveryRate,
      };

    // ... resto da lógica de gravação (localStorage.setItem, etc)

      saveLS(key, data);
      setSavedRecipes(getAllRecipes());
      showToast(`✨ "${name}" ${t.toastSaved}`);
      clearForm();
    });
  }; // <--- Esta chaveta e ponto e vírgula são cruciais!

  // Toggle recipe active/inactive
  const toggleRecipeActive = (key: string) => {
    const recipe = savedRecipes.find((r) => r.key === key);
    if (!recipe) return;
    const updated = { ...recipe, active: !(recipe.active !== false) };
    saveLS(key, updated);
    setSavedRecipes((prev) => prev.map((r) => r.key === key ? updated : r));
  };

  // Load recipe
  const handleLoad = (recipe: SavedRecipe) => {
    setRecipeName(recipe.name);
    setIngredients(recipe.ingredients?.length ? recipe.ingredients : [{ id: newId(), name: "", unit: "KG", price: 0, qty: 0, iva: 0.23 }]);
    setExtras(recipe.extras || 0);
    setMargin(recipe.margin ?? 0);
    setSellPrice(recipe.sellPrice || 0);
    setLoss(recipe.loss || 0);
    setFryerOn(recipe.fryer || false);
    if (recipe.fryerData) setFryerData(recipe.fryerData);
    setEnergyOn(recipe.energy || false);
    if (recipe.energyData) setEnergyData(recipe.energyData);
    setDeliveryCount(recipe.deliveryCount || 0);
    setDeliveryRate(recipe.deliveryRate || 0.2);
    setActiveSection("create");
  };

  const handleDelete = (key: string) => {
    setDeleteRecipeKey(key);
  };

  // Vigilante callbacks
  const handleAjustar = useCallback((recipeKey: string) => {
    const recipe = savedRecipes.find((r) => r.key === recipeKey);
    if (recipe) handleLoad(recipe);
  }, [savedRecipes]);

  const handleManter = useCallback((recipeKey: string) => {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev); next.add(recipeKey);
      saveLS(STORAGE_PREFIX + "ACK_ALERTS", Array.from(next));
      return next;
    });
  }, []);

  // Warehouse
  const handleSaveWarehouse = () => {
    requirePro(() => {
      const sorted = [...warehouseDraft].sort((a, b) => a.name.localeCompare(b.name));
      saveLS(STORAGE_PREFIX + "WAREHOUSE", sorted);
      setWarehouseSaved(sorted);
      setWarehouseDraft(sorted);
      setWarehouseChanged(false);
      // Apply new prices directly to all saved recipes (up or down — always syncs)
      applySyncToRecipes(sorted);
      // Clear previous alerts so new price changes always show the alert dialog
      setAcknowledgedAlerts(new Set());
      saveLS(STORAGE_PREFIX + "ACK_ALERTS", []);
      showToast(t.toastWarehouseSaved);
    });
  };

  const updateWarehouseDraft = (id: string, field: keyof WarehouseItem, value: string | number) => {
    setWarehouseDraft((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "price" && typeof value === "number" && item.price !== value && item.price > 0) {
          const history: PriceHistoryEntry[] = [...(item.priceHistory || []), { date: new Date().toISOString().slice(0, 10), oldPrice: item.price }];
          return { ...item, [field]: value, priceHistory: history.slice(-5) };
        }
        return { ...item, [field]: value };
      })
    );
    setWarehouseChanged(true);
  };

  const sortedDraft = useMemo(() => [...warehouseDraft].sort((a, b) => a.name.localeCompare(b.name)), [warehouseDraft]);

  // ── PDF helpers ────────────────────────────────────────────────────────────
  const pdfAddPageHeader = (doc: jsPDF, y: number): number => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(196, 167, 120);
    doc.text("CHEF MARGIN PRO", 14, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(130);
    doc.text(`${new Date().toLocaleDateString()} — ${currency}`, 120, y);
    doc.setDrawColor(196, 167, 120); doc.line(14, y + 2, 196, y + 2);
    return y + 8;
  };

  const pdfTableRow = (doc: jsPDF, y: number, cols: [string, string, string], bold = false): number => {
    const [c1, c2, c3] = cols;
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(9);
    doc.setTextColor(bold ? 30 : 60);
    // Truncate ingredient name to avoid overflow
    const name = c1.length > 38 ? c1.slice(0, 36) + "…" : c1;
    doc.text(name, 14, y);
    doc.text(c2, 112, y, { align: "center" });
    doc.text(c3, 196, y, { align: "right" });
    return y + 5;
  };

  // Export PDF — Production Report per Recipe
  const handleExportPdf = () => {
  const doc = new jsPDF();
  const ivaLabel = lang === "EN" ? "VAT" : lang === "FR" ? "TVA" : "IVA";

  savedRecipes.forEach((r, idx) => {
    if (idx > 0) doc.addPage();
    
    // 1. Cabeçalho de Página
    let y = pdfAddPageHeader(doc, 14);
    

    // 2. Título do Relatório (Cor do Pato)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(196, 167, 120); // O teu Dourado/Castanho
    const reportTitle = lang === "EN" ? `Production Report — ${r.name}` :
                        lang === "ES" ? `Informe de Producción — ${r.name}` :
                        lang === "FR" ? `Rapport de Production — ${r.name}` :
                        `Relatório de Produção — ${r.name}`;
    
    const titleStr = reportTitle.length > 60 ? reportTitle.slice(0, 58) + "…" : reportTitle;
    doc.text(titleStr, 14, y); 
    y += 8;

    // 3. Info Bar (Cinza suave, SEM sublinhados)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`${fmtDate(r.date)} | ${t.totalCost}: ${fmt(r.totalCost)} | ${t.objetivo}: ${fmt(r.totalCost / (1 - Math.min((r.margin || 0) / 100, 0.99)))}`, 14, y);
    y += 5;
    doc.text(`${t.realProfit}: ${fmt(r.profit)} | ${lang === "PT" ? "Margem" : lang === "ES" ? "Margen" : lang === "FR" ? "Marge" : "Margin"}: ${r.margin || 0}%`, 14, y);
    y += 10;

    // 4. Tabela de Ingredientes (Design Clean)
    // Fundo do cabeçalho da tabela
    doc.setFillColor(248, 245, 240); 
    doc.rect(13, y - 5, 184, 7, "F");
    
    // Linha de destaque no topo da tabela (A "risca" agora é controlada e elegante)
    doc.setDrawColor(196, 167, 120);
    doc.setLineWidth(0.5);
    doc.line(14, y - 5, 196, y - 5); 

    y = pdfTableRow(doc, y, [t.ingredient, `${t.qty} / ${t.unit}`, `${t.totalCost} (${ivaLabel})`], true);
    y += 2;

    // 5. Linhas de Ingredientes
    doc.setTextColor(40);
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.1);
    doc.setDrawColor(230); // Linhas divisórias muito claras

    r.ingredients?.filter((i) => i.name).forEach((ing) => {
  if (y > 270) { 
    doc.addPage(); 
    y = pdfAddPageHeader(doc, 14); 
  }
  
  const iva = ing.iva >= 1 ? ing.iva / 100 : ing.iva;
  const up = ing.unit === "DZ" ? ing.price / 12 : ing.price;
  const lineCost = (ing.qty || 0) * up * (1 + iva);

  // 🎯 1. CRIAR A "MÁSCARA" VISUAL:
  const displayUnit = ing.unit === "DZ" ? "UN" : (ing.unit || "");

  // 🎯 2. USAR O 'displayUnit' NA LINHA DA TABELA:
  y = pdfTableRow(doc, y, [ing.name, `${ing.qty} ${displayUnit}`, fmt(lineCost)]);
  
  doc.line(14, y - 4, 196, y - 4);
});

    // 6. Rodapé Final (Resumo)
    y += 5;
    if (y > 280) { doc.addPage(); y = 20; }
    
    doc.setDrawColor(196, 167, 120);
    doc.setLineWidth(0.8);
    doc.line(14, y, 196, y); // Linha final grossa
    
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(`${t.totalCost}: ${fmt(r.totalCost)}`, 14, y);
    doc.text(`${t.objetivo}: ${fmt(r.totalCost / (1 - Math.min((r.margin || 0) / 100, 0.99)))}`, 85, y);
    doc.setTextColor(196, 167, 120);
    doc.text(`${t.realProfit}: ${fmt(r.profit)}`, 196, y, { align: "right" });
  });

  doc.save(`ChefMarginPro_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
};

 // Export Warehouse PDF
  const handleExportWarehousePdf = () => {
    const doc = new jsPDF();
    const ivaLabel = lang === "EN" ? "VAT" : lang === "FR" ? "TVA" : "IVA";
    let y = pdfAddPageHeader(doc, 14);
    const title = lang === "EN" ? "Warehouse — Full List" : lang === "ES" ? "Almacén — Lista Completa" : lang === "FR" ? "Stock — Liste Complète" : "Armazém — Lista Completa";
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(30);
    doc.text(title, 14, y); y += 8;

    const wRow = (name: string, unit: string, price: string, iva: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(9);
      doc.setTextColor(bold ? 30 : 55);
      doc.text(name, 14, y);
      doc.text(unit, 110, y, { align: "center" });
      doc.text(price, 155, y, { align: "right" });
      doc.text(iva, 196, y, { align: "right" });
      y += 6;
    };

    doc.setFillColor(245, 240, 230); doc.rect(13, y - 4, 182, 6.5, "F");
    wRow(t.ingredient, t.unit, `${currency}/Base`, `${ivaLabel} %`, true);
    doc.setDrawColor(196, 167, 120); doc.line(14, y - 4, 196, y - 4);

    warehouseSaved.forEach((item) => {
      if (y > 272) { doc.addPage(); y = pdfAddPageHeader(doc, 14); }
      const ivaVal = item.iva >= 1 ? item.iva : item.iva * 100;
      const ivaDisplay = `${ivaVal.toFixed(0)}%`;
      wRow(item.name, item.unit, fmt(item.price), ivaDisplay);
      doc.setDrawColor(230); doc.line(14, y - 4, 196, y - 4);
    });

    y += 2; doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(30);
    doc.text(`${warehouseSaved.length} ${lang === "EN" ? "items" : lang === "FR" ? "articles" : "artigos"}`, 14, y);
    doc.save(`ChefMarginPro_Armazem_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Exportar JSON (Backup)
  const handleExportWarehouseJson = () => {
    const dataStr = JSON.stringify(warehouseSaved, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ChefMargin_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar JSON (Restaurar)
  const handleImportWarehouseJson = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setWarehouseSaved(json);
          setWarehouseDraft(json); // Importante para atualizar a vista de edição
          setWarehouseChanged(true);
          alert("Armazém restaurado com sucesso! 📦");
        }
      } catch (err) {
        alert("Erro ao ler o ficheiro JSON.");
      }
    };
   reader.readAsText(file);
    const target = event.target as HTMLInputElement;
    if (target) {
      target.value = "";
    }
  };

  // Export IVA/TVA Summary PDF — full breakdown per recipe
  const handleExportIvaPdf = () => {
    const doc = new jsPDF();
    const ivaLabel = lang === "EN" ? "VAT" : lang === "FR" ? "TVA" : "IVA";
    let y = pdfAddPageHeader(doc, 14);
    const title = lang === "EN" ? `${ivaLabel} Summary` : lang === "ES" ? `Resumen ${ivaLabel}` : lang === "FR" ? `Résumé ${ivaLabel}` : `Resumo ${ivaLabel}`;
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(30);
    doc.text(title, 14, y); y += 8;
    // Header: Recipe | IVA Ingr. | IVA Energia | IVA Fryer | Total
    const iRow = (c1: string, c2: string, c3: string, c4: string, c5: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(8);
      doc.setTextColor(bold ? 30 : 55);
      doc.text(c1, 14, y); doc.text(c2, 85, y, { align: "right" }); doc.text(c3, 120, y, { align: "right" });
      doc.text(c4, 155, y, { align: "right" }); doc.text(c5, 196, y, { align: "right" });
      y += 5;
    };
    doc.setFillColor(245, 240, 230); doc.rect(13, y - 4, 182, 6.5, "F");
    const ingLbl = lang === "EN" ? "Ingredientes" : t.ivaIngredients.split(" ").slice(-1)[0];
    const enLbl = lang === "EN" ? "Energy" : lang === "FR" ? "Énergie" : "Energia";
    const frLbl = lang === "EN" ? "Fryer" : lang === "FR" ? "Friteuse" : "Fritadeira";
    iRow(t.recipes, `${ivaLabel} ${ingLbl}`, `${ivaLabel} ${enLbl}`, `${ivaLabel} ${frLbl}`, `${ivaLabel} Total`, true);
    doc.setDrawColor(196, 167, 120); doc.line(14, y - 3, 196, y - 3);
    let grandTotal = 0;
    const oilItem = warehouseSaved.find((w) => /óleo|oleo|oil|aceite|huile|azeite/i.test(w.name));
    savedRecipes.forEach((r) => {
      if (y > 272) { doc.addPage(); y = pdfAddPageHeader(doc, 14); }
      const ivaIngr = r.ingredients?.reduce((sum, ing) => {
        const iva = ing.iva >= 1 ? ing.iva / 100 : ing.iva;
        const up = ing.unit === "DZ" ? ing.price / 12 : ing.price;
        return sum + (ing.qty || 0) * up * iva;
      }, 0) || 0;
      let ivaEn = 0;
      if (r.energy && r.energyData) {
        const { cost, power, time, burners, type, iva } = r.energyData;
        let eBase = 0;
        if (type === "Eletricidade") eBase = ((power * time) / 60 / 1000) * cost;
        else if (type === "Gás") eBase = ((power * (burners || 1) * time) / 60) * cost;
        else eBase = power * cost;
        ivaEn = eBase * (iva >= 1 ? iva / 100 : iva);
      }
      let ivaFr = 0;
      if (r.fryer && r.fryerData) {
        const oilPricePerL = oilItem ? oilItem.price : 1.25;
        const oilIva = oilItem ? (oilItem.iva >= 1 ? oilItem.iva / 100 : oilItem.iva) : 0.23;
        const uses = Math.max(r.fryerData.uses || 1, 1);
        const elec = ((r.fryerData.watts || 0) / 1000) * ((r.fryerData.time || 0) / 60) * 0.22;
        const oilBase = (oilPricePerL * (r.fryerData.oilLiters || 0)) / uses;
        ivaFr = (elec + oilBase) * oilIva;
      }
      const total = ivaIngr + ivaEn + ivaFr;
      grandTotal += total;
      iRow(r.name, fmt(ivaIngr), fmt(ivaEn), fmt(ivaFr), fmt(total));
      doc.setDrawColor(230); doc.line(14, y - 4, 196, y - 4);
    });
    y += 3; doc.setDrawColor(180); doc.line(14, y, 196, y); y += 5;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30);
    doc.text(`${ivaLabel} Total: ${fmt(grandTotal)}`, 196, y, { align: "right" });
    doc.save(`ChefMarginPro_${ivaLabel}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Export JSON
  const handleExportJson = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) data[k] = loadLS(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `ChefMarginPro_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        
        // Guarda os dados no armazenamento do telemóvel/PC
        Object.keys(data).forEach((k) => { 
          localStorage.setItem(k, JSON.stringify(data[k])); 
        });

        showToast("✨ Backup restaurado!");

        // Aguarda 1.2 segundos para o user ver a mensagem e depois faz o refresh
        setTimeout(() => {
          window.location.reload();
        }, 1200);

      } catch (err) {
        showToast("❌ Ficheiro inválido.");
      }
    };
    reader.readAsText(file); e.target.value = "";
  };

  // Delivery
  const handleDeliveryPlus = () => {
    setDeliveryCount((prev) => {
      const r = sellPrice > 0.01 ? (calc.objetivo / sellPrice) * (1 - loss / 100) : 0;
      return Math.min(prev + 1, Math.floor(r));
    });
  };

  const ivaTotal = calc.ivaIngredientes + calc.ivaEnergy + calc.ivaFryer;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      <ToastContainer toasts={toasts} />
      {showProModal && <ProModal onActivate={activatePro} onClose={() => { setShowProModal(false); setProModalCallback(null); }} t={t} />}

      {showDeleteAllModal && (
        <div className="pro-modal-overlay" onClick={() => setShowDeleteAllModal(false)}>
          <div className="pro-modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>⚠️</div>
            <h2 style={{ textAlign: "center", color: "#ef4444", marginBottom: 8, fontSize: 18 }}>{t.deleteAll}</h2>
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>{t.deleteAllConfirm}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="settings-action" style={{ flex: 1 }} onClick={() => setShowDeleteAllModal(false)}>{t.cancelBtn || "Cancelar"}</button>
              <button className="settings-action settings-action-danger" style={{ flex: 1 }} onClick={() => {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                  const k = localStorage.key(i);
                  if (k && k.startsWith(STORAGE_PREFIX + "REC_")) localStorage.removeItem(k);
                }
                setSavedRecipes([]);
                setShowDeleteAllModal(false);
                showToast("🗑️ " + (t.deleteAll || "Receitas apagadas"));
              }}>{t.deleteAll}</button>
            </div>
          </div>
        </div>
      )}

      {deleteRecipeKey && (
        <div className="pro-modal-overlay" onClick={() => setDeleteRecipeKey(null)}>
          <div className="pro-modal" style={{ maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>🗑️</div>
            <h2 style={{ textAlign: "center", color: "#ef4444", marginBottom: 8, fontSize: 17 }}>{t.deleteRecipeConfirm}</h2>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="settings-action" style={{ flex: 1 }} onClick={() => setDeleteRecipeKey(null)}>{t.cancelBtn || "Cancelar"}</button>
              <button className="settings-action settings-action-danger" style={{ flex: 1 }} onClick={() => {
                localStorage.removeItem(deleteRecipeKey);
                setSavedRecipes(getAllRecipes());
                setDeleteRecipeKey(null);
                showToast("🗑️ " + t.deleteRecipeConfirm);
              }}>{t.apagar || "Apagar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER LIMPO COM SELECT DE IDIOMAS */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 15px', height: '60px' }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          
          {/* O SELECT DE IDIOMA */}
         <select 
            value={lang} 
            onChange={(e) => setLangSave(e.target.value as Lang)}
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
              width: '55px', // Janela bem pequena agora
              textAlign: 'center'
            }}
          >
            {(["PT", "ES", "FR", "EN"] as Lang[]).map((l) => (
              <option key={l} value={l} style={{ backgroundColor: '#fff', color: '#333' }}>
                {/* Aqui tiramos o LANG_FLAGS para não repetir */}
                {l}
              </option>
            ))}
          </select>

          {isPro && (
            <span className="pro-badge" style={{ fontSize: '10px', padding: '4px 8px' }}>
              {t.proActive}
            </span>
          )}
        </div>
      </header>

      {/* ── DASHBOARD ── */}
      <main className={`app-main ${activeSection === "dashboard" ? "active" : ""}`}>
        <DashboardSection activeRecipes={activeRecipes} semaphore={semaphore} t={t} fmt={fmt} costAlerts={costAlerts} onAjustar={handleAjustar} onManter={handleManter} />
      </main>

      {/* ── RECIPES ── */}
      <main className={`app-main ${activeSection === "recipes" ? "active" : ""}`}>
        <div className="section-toolbar">
          <div className="recipes-tabs">
            <button className={`recipes-tab ${recipesTab === "all" ? "active" : ""}`} onClick={() => setRecipesTab("all")}>{t.allRecipes}</button>
            <button className={`recipes-tab ${recipesTab === "ranking" ? "active" : ""}`} onClick={() => setRecipesTab("ranking")}>🏆 {t.ranking}</button>
          </div>
          <button className="btn-small btn-load" onClick={() => { clearForm(); setActiveSection("create"); }}>{t.newItem}</button>
        </div>

        {recipesTab === "all" && (
          <div className="recipe-list">
            {savedRecipes.length === 0 && <div className="empty-state"><div style={{ fontSize: 40, marginBottom: 12 }}>📂</div><div>{t.noRecipes}</div></div>}
            {savedRecipes.map((r) => {
              const isActive = r.active !== false;
              const rMarginRate = Math.min((r.margin ?? 0) / 100, 0.99);
              const rObjetivo = r.totalCost > 0 ? r.totalCost / (1 - rMarginRate) : 0;
              const insufficientMargin = isActive && rObjetivo > 0 && r.sellPrice < rObjetivo;
              return (
                <div key={r.key} className={`recipe-item ${!isActive ? "recipe-item-inactive" : ""}`}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="recipe-item-name" style={insufficientMargin ? { color: "#ef4444", fontWeight: 700 } : {}}>{r.name}</div>
                    <div className="recipe-item-meta">
                      {fmtDate(r.date)} · {t.totalCost}: {fmt(r.totalCost)} · {t.realProfit}: {fmt(r.profit)}
                    </div>
                  </div>
                  <div className="recipe-item-actions">
                    <button
                      className={`toggle-btn ${isActive ? "toggle-on" : "toggle-off"}`}
                      onClick={() => toggleRecipeActive(r.key)}
                      title={isActive ? t.activeOn : t.activeOff}
                    >
                      {isActive ? t.activeOn : t.activeOff}
                    </button>
                    <button className="btn-small btn-load" onClick={() => handleLoad(r)}>{t.openRecipe}</button>
                    <button className="btn-small btn-delete" onClick={() => handleDelete(r.key)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recipesTab === "ranking" && (
          <div className="recipe-list">
            <div className="ranking-header">{t.rankingProfit} {t.perDose}</div>
            {rankingRecipes.length === 0 && <div className="empty-state"><div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div><div>{t.noRecipes}</div></div>}
            {rankingRecipes.map((r, i) => {
  // ✅ Usamos o lucro real que já calculámos (total do projeto)
  const displayProfit = r.profit || 0; 
  
  return (
    <div key={r.key} className="recipe-item ranking-item">
      <div className="ranking-position">{["1º","2º","3º","4º","5º"][i] ?? `${i+1}º`}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="recipe-item-name">{r.name}</div>
        <div className="recipe-item-meta">{fmtDate(r.date)}</div>
      </div>
      <div className="ranking-score">
        {/* Mostra o lucro total com o sinal de + se for positivo */}
        {displayProfit >= 0 ? "+" : ""}{fmt(displayProfit)}
        {/* Mudamos o texto para indicar que é o lucro total do projeto */}
        <span className="ranking-per-dose">Total</span> 
      </div>
    </div>
  );
})}
          </div>
        )}
      </main>

   {/* ── CREATE ── */}
<main className={`app-main section-create ${activeSection === "create" ? "active" : ""}`} 
      style={{ display: activeSection === "create" ? "flex" : "none", flexDirection: 'column' }}>
  
  {/* 🚧 O "ESPAÇADOR" INDESTRUTÍVEL 🚧 */}
  <div style={{ 
    height: '0px', 
    minHeight: '0px', 
    width: '100%', 
    flexShrink: 0, 
    backgroundColor: 'transparent' 
  }}></div>

  <input 
    className="recipe-title-input" 
    type="text" 
    placeholder={t.recipeName}
    value={recipeName} 
    onChange={(e) => setRecipeName(e.target.value)} 
    style={{ position: 'relative', zIndex: 20 }} 
  />

  <div className="ingredients-header-simple" style={{ position: 'relative', zIndex: 20 }}>
    <span>{t.ingredient}</span>
            <span style={{ textAlign: "center" }}>{t.unit}</span>
            <span style={{ textAlign: "center" }}>{t.qty}</span>
            <span></span>
          </div>

          {ingredients.map((ing) => (
            <IngredientRow key={ing.id} ing={ing} warehouse={warehouseSaved}
              onChange={(u) => setIngredients((prev) => prev.map((i) => i.id === ing.id ? u : i))}
              onDelete={() => setIngredients((prev) => prev.filter((i) => i.id !== ing.id))}
              t={t} />
          ))}

        <button className="btn-add-ingredient"
          onClick={() => setIngredients((prev) => [...prev, { id: newId(), name: "", unit: "KG", price: 0, qty: 0, iva: 0.23 }])}>
          {t.addIngredient}
        </button>

        {/* FRYER — compact single toggle */}
        <div className="fryer-section">
          <button
            className={`fryer-single-btn ${fryerOn ? "fryer-active" : ""}`}
            onClick={() => setFryerOn(!fryerOn)}
          >
            {t.fryerToggle}
            <span className={`fryer-state-badge ${fryerOn ? "on" : "off"}`}>
              {fryerOn ? "ON ▾" : "OFF ▸"}
            </span>
          </button>
          {fryerOn && (
            <div className="fryer-compact">
              <div className="fryer-oil-info">
                {fryerOilItem
                  ? <span style={{ color: "var(--green)" }}>🫙 {t.oilFoundAt} <strong>{fmt(fryerOilItem.price)}/L</strong></span>
                  : <span style={{ color: "var(--red)" }}>{t.oilNotFound}</span>}
              </div>
              <div className="fryer-4col">
                <div>
                  <label className="f-label">{t.fryerWatts}</label>
                  <input className="f-input" type="number" step="100" value={fryerData.watts || ""}
                    onChange={(e) => setFryerData((p) => ({ ...p, watts: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="f-label">{t.fryerTime}</label>
                  <input className="f-input" type="number" step="1" value={fryerData.time || ""}
                    onChange={(e) => setFryerData((p) => ({ ...p, time: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="f-label">{t.fryerOilQty}</label>
                  <input className="f-input" type="number" step="0.1" value={fryerData.oilLiters || ""}
                    onChange={(e) => setFryerData((p) => ({ ...p, oilLiters: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="f-label">{t.fryerUses}</label>
                  <input className="f-input" type="number" step="1" min="1" value={fryerData.uses || 10}
                    onChange={(e) => setFryerData((p) => ({ ...p, uses: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ENERGY */}
        <div className="energy-section">
          <button
            className={`energy-single-btn ${energyOn ? "energy-active" : ""}`}
            onClick={() => setEnergyOn(!energyOn)}
          >
            ⚡ {t.energySource}
            <span className={`fryer-state-badge ${energyOn ? "on" : "off"}`} style={energyOn ? { background: "rgba(96,165,250,0.2)", color: "#60a5fa" } : {}}>
              {energyOn ? "ON ▾" : "OFF ▸"}
            </span>
          </button>
          {energyOn && (
            <div className="energy-compact">
            <div className="energy-grid">
              <div>
                <label className="f-label">{t.energySource}</label>
                <select className="f-input" value={energyData.type}
                  onChange={(e) => setEnergyData((p) => ({ ...p, type: e.target.value as EnergyData["type"], cost: e.target.value === "Eletricidade" ? 0.22 : e.target.value === "Gás" ? 1.5 : 2.0 }))}>
                  <option value="Eletricidade">Eletricidade</option>
                  <option value="Gás">Gás</option>
                  <option value="Carvão">Carvão</option>
                </select>
              </div>
              <div>
                <label className="f-label">{energyData.type === "Eletricidade" ? "€/kWh" : energyData.type === "Gás" ? "€/m³" : "€/Kg"}</label>
                <input className="f-input" type="number" step="0.01" value={energyData.cost || ""}
                  onChange={(e) => setEnergyData((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))} />
              </div>
              {energyData.type !== "Carvão" && <>
                <div>
                  <label className="f-label">{energyData.type === "Eletricidade" ? t.energyWatts : "Cons./Bico"}</label>
                  <input className="f-input" type="number" step="100" value={energyData.power || ""}
                    onChange={(e) => setEnergyData((p) => ({ ...p, power: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="f-label">{t.energyMin}</label>
                  <input className="f-input" type="number" step="1" value={energyData.time || ""}
                    onChange={(e) => setEnergyData((p) => ({ ...p, time: parseFloat(e.target.value) || 0 }))} />
                </div>
              </>}
              {energyData.type === "Carvão" && <div>
                <label className="f-label">{t.energyKg}</label>
                <input className="f-input" type="number" step="0.1" value={energyData.power || ""}
                  onChange={(e) => setEnergyData((p) => ({ ...p, power: parseFloat(e.target.value) || 0 }))} />
              </div>}
              {energyData.type === "Gás" && <div>
                <label className="f-label">{t.burners}</label>
                <select className="f-input" value={energyData.burners}
                  onChange={(e) => setEnergyData((p) => ({ ...p, burners: parseInt(e.target.value) || 1 }))}>
                  {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>}
              <div>
                <label className="f-label">{t.ivaEnergiaLabel}</label>
                <RateSelect value={energyData.iva} onChange={(v) => setEnergyData((p) => ({ ...p, iva: v }))}
                  options={[{v:0.23,l:"23%"},{v:0.13,l:"13%"},{v:0.06,l:"6%"},{v:0,l:"0%"}]} />
              </div>
            </div>
            </div>
          )}
        </div>

        {/* ENGINE */}
        <div className="engine-grid">
         <div className="engine-box input-box">
  <div className="engine-box-label">{t.extras} ({currency})</div>
  <input 
    className="engine-box-input" 
    type="number" 
    step="0.01" 
    min="0" 
    value={extras || ""} 
    placeholder="0.00"
    onChange={(e) => setExtras(parseFloat(e.target.value) || 0)} 
  />
</div>
          <div className="engine-box input-box">
            <div className="engine-box-label">{t.marginPct}</div>
            <input className="engine-box-input" type="number" step="1" min="0" max="99" value={margin || ""} placeholder="0"
              onChange={(e) => setMargin(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="engine-box output-box">
            <div className="engine-box-label">{t.totalCost}</div>
            <div className="engine-box-value">{fmt(calc.totalCost)}</div>
            {(fryerOn || energyOn) && (
              <div style={{ fontSize: 8, color: "#94a3b8", textAlign: "center", marginTop: 3, lineHeight: 1.5 }}>
                {fryerOn && <span>🍟 {fmt(calc.fryerCostTotal)}</span>}
                {fryerOn && energyOn && " + "}
                {energyOn && <span>⚡ {fmt(calc.energyCostTotal)}</span>}
              </div>
            )}
          </div>
          <div className="engine-box output-box">
            <div className="engine-box-label">{t.objetivo}</div>
            <div className="engine-box-value">{fmt(calc.objetivo)}</div>
          </div>
          <div className="engine-box input-box">
            <div className="engine-box-label">{t.myPrice}</div>
            <input className="engine-box-input" type="number" step="0.01" min="0" value={sellPrice || ""} placeholder="0.00"
              onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="engine-box input-box">
            <div className="engine-box-label">{t.lossBreak}</div>
            <input className="engine-box-input" type="number" step="1" min="0" max="100" value={loss || ""} placeholder="0"
              onChange={(e) => setLoss(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="engine-box highlight-box">
  <div className="engine-box-label">{t.realProfit}</div>
  <div className="engine-box-value" style={{ 
    color: calc.lucroReal >= 0 ? "white" : "#ff4d4d", 
    fontSize: 26, // Aumentei para 26 para leres bem no telemóvel
    fontWeight: "bold" 
  }}>
    {fmt(calc.lucroReal)}
  </div>
  {/* A Eficiência foi removida daqui para limpar o espaço */}
</div>

<div className="engine-box highlight-box">
  <div className="engine-box-label">{t.doses}</div>
  <div className="engine-box-value" style={{ fontSize: 26, fontWeight: "bold" }}>
    {calc.doses > 0 ? (calc.doses - calc.effectiveDelivery).toFixed(2) : "0.00"}
  </div>
            {calc.effectiveDelivery > 0 && (
              <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2, textAlign: "center" }}>
                🛵 {calc.effectiveDelivery.toFixed(1)} Uber
              </div>
            )}
          </div>
        </div>

        {sellPrice > 0 && calc.totalCost > 0 && (
          <div className="nominal-profit-bar">
            <span style={{ color: "var(--txt-secondary)", fontSize: 11 }}>{t.nominalProfit}</span>
            <span style={{ color: "var(--green)", fontWeight: 800, fontSize: 15, fontFamily: "monospace" }}>{fmt(calc.nominalProfit)}</span>
          </div>
        )}

        {/* DELIVERY */}
        <div className="delivery-panel">
          <span className="uber-sim-label">{t.deliveryPlatforms}</span>
          <div className="delivery-controls">
            <select className="f-input" style={{ flex: 1.5 }} value={deliveryEntity} onChange={(e) => setDeliveryEntity(e.target.value)}>
              <option value="uber">UBER EATS</option>
              <option value="glovo">GLOVO</option>
              <option value="outra">OUTRA APP</option>
            </select>
            <div style={{ flex: 1 }}>
              <RateSelect value={deliveryRate} onChange={setDeliveryRate}
                options={[{v:0.3,l:"30%"},{v:0.25,l:"25%"},{v:0.2,l:"20%"},{v:0.15,l:"15%"},{v:0.1,l:"10%"},{v:0.05,l:"5%"}]} />
            </div>
          </div>
          <div className="delivery-counter">
            <button className="counter-btn" onClick={() => setDeliveryCount((p) => Math.max(0, p - 1))}>−</button>
            <span className="counter-value">{deliveryCount}</span>
            <button className="counter-btn" onClick={handleDeliveryPlus}>+</button>
          </div>
          {deliveryCount > 0 && sellPrice > 0 && (
            <div className="delivery-summary">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--txt-secondary)" }}>Comissão ({deliveryCount}x):</span>
                <span style={{ color: "var(--red)", fontWeight: 700 }}>-{fmt(deliveryCount * sellPrice * deliveryRate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "var(--txt-secondary)" }}>Preço sugerido:</span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>{fmt(calc.uberPrice)}</span>
              </div>
            </div>
          )}
        </div>

        <button className="btn-save-recipe" onClick={handleSaveRecipe}>{t.saveRecipe}</button>
      </main>

      {/* ── WAREHOUSE ── */}
      <main className={`app-main ${activeSection === "warehouse" ? "active" : ""}`}>
        <div className="section-toolbar">
          <div className="section-toolbar-label">🏗️ {t.warehouse}</div>
          <button className="btn-small btn-load" onClick={() => {
            setWarehouseDraft((p) => [...p, { id: newId(), name: "", unit: "KG", price: 0, iva: 0.23 }]);
            setWarehouseChanged(true);
          }}>{t.newItem}</button>
        </div>

        <div className="warehouse-header">
          <span>{t.ingredient}</span>
          <span style={{ textAlign: "center" }}>{t.unit}</span>
          <span style={{ textAlign: "right" }}>{currency}/Base</span>
          <span style={{ textAlign: "center" }}>{lang === "EN" ? "VAT" : lang === "FR" ? "TVA" : "IVA"}</span>
          <span></span>
        </div>

        {warehouseDraft.length === 0 && (
          <div className="empty-state"><div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div><div>{t.noWarehouse}</div></div>
        )}

        {sortedDraft.map((item) => (
          <div key={item.id} className="warehouse-item">
            <input className="f-input" type="text" placeholder={t.ingredient} value={item.name}
              onChange={(e) => updateWarehouseDraft(item.id, "name", e.target.value)} />
            <select className="f-input" value={item.unit}
              onChange={(e) => updateWarehouseDraft(item.id, "unit", e.target.value)}>
              <option value="KG">KG</option><option value="L">L</option>
              <option value="UN">UN</option><option value="DZ">DZ</option>
            </select>
            <input className="f-input" type="number" step="0.01" min="0" placeholder={currency} value={item.price || ""}
              style={{ textAlign: "right" }}
              onChange={(e) => updateWarehouseDraft(item.id, "price", parseFloat(e.target.value) || 0)} />
            <select
  className="f-input"
  value={item.iva}
  style={{ fontSize: "17px", minWidth: "60px" }}
  onChange={(e) => {
    if (e.target.value === "custom") {
      const p = prompt("IVA %:", "23");
      if (p) {
        const val = parseFloat(p.replace(',', '.')) || 0;
        updateWarehouseDraft(item.id, "iva", val / 100);
      }
    } else {
      updateWarehouseDraft(item.id, "iva", parseFloat(e.target.value));
    }
  }}
>
  <option value={0.23}>23%</option>
  <option value={0.13}>13%</option>
  <option value={0.06}>6%</option>
  <option value={0}>0%</option>

  {/* Esta linha faz o valor personalizado (ex: 5%) aparecer dentro da caixa */}
  {![0.23, 0.13, 0.06, 0].some(v => Math.abs(v - item.iva) < 0.001) && (
    <option value={item.iva}>{(item.iva * 100).toFixed(0)}%</option>
  )}

  <option value="custom" style={{ color: "var(--gold)" }}>+ Outro...</option>
</select>
            <button className="btn-del-row" onClick={() => {
              setWarehouseDraft((p) => p.filter((i) => i.id !== item.id));
              setWarehouseChanged(true);
            }}>✕</button>
            {item.priceHistory && item.priceHistory.length > 0 && (
              <div className="wh-history" style={{ gridColumn: "1 / -1" }}>
                📜 {item.priceHistory.slice(-2).map((h) => `${h.date}: ${h.oldPrice.toFixed(2)}${currency}`).join(" → ")}
              </div>
            )}
          </div>
        ))}

        {warehouseChanged && (
          <div className="warehouse-unsaved-banner">
            ⚠️ {lang === "PT" ? "Alterações não guardadas" : lang === "ES" ? "Cambios no guardados" : lang === "FR" ? "Modifications non sauvegardées" : "Unsaved changes"}
          </div>
        )}

        <button className="btn-save-recipe" onClick={handleSaveWarehouse}>{t.saveWarehouse}</button>
      </main>

      {/* ── OPTIONS (clean, no language/target) ── */}
      <main className={`app-main ${activeSection === "settings" ? "active" : ""}`}>

        {/* IVA SUMMARY */}
        <div className="settings-group">
          <div className="settings-title">📊 {t.ivaTotal}</div>
          <div className="settings-row">
            <span>{t.ivaIngredients}</span><span className="settings-value">{fmt(calc.ivaIngredientes)}</span>
          </div>
          <div className="settings-row">
            <span>{t.ivaEnergy}</span><span className="settings-value">{fmt(calc.ivaEnergy)}</span>
          </div>
          <div className="settings-row">
            <span>{t.ivaFryer}</span><span className="settings-value">{fmt(calc.ivaFryer)}</span>
          </div>
          <div className="settings-row" style={{ borderTop: "1px solid rgba(196,167,120,0.3)", padding: "9px 16px" }}>
            <span style={{ fontWeight: 800 }}>{t.ivaTotal}</span>
            <span className="settings-value" style={{ fontSize: 15 }}>{fmt(ivaTotal)}</span>
          </div>
        </div>

        {/* 1. O Contentor Mestre (Igual à página Criar) */}
<div className="flex-1 overflow-y-auto px-4 pb-24">
  <div className="space-y-4 py-4">

    {/* --- GRUPO EXPORTAR / BACKUP (Fica no topo) --- */}
   <div className="settings-group">
  <div className="settings-title">📁 EXPORTAR / BACKUP</div>
  
  <button className="settings-action" onClick={handleExportPdf}>{t.exportPdf}</button>
  <button className="settings-action" onClick={handleExportWarehousePdf}>{t.exportWarehousePdf}</button>
  <button className="settings-action" onClick={handleExportIvaPdf}>{t.exportIvaPdf}</button>
  
 {/* Botão de Exportar Dados (JSON) */}
 <button className="settings-action" onClick={handleExportWarehouseJson}>
  {t.exportJson}
 </button>
  
 {/* Botão de Restaurar Dados (JSON) */}
 <button className="settings-action" onClick={() => document.getElementById('file-import-input')?.click()}>
  {t.importJson}
 </button>

  <input 
    id="file-import-input"
    type="file" 
    accept=".json" 
    style={{ display: "none" }} 
    onChange={handleImportWarehouseJson} 
  />
</div>

   {/* --- ESPAÇO MÍNIMO PARA TELEFONE --- */}
    <div style={{ marginTop: '5px' }}></div>

   

    

   {/* --- FOLGA PARA O SCROLL NÃO COLAR --- */}
    <div style={{ height: '20px' }}></div>

  </div> {/* FECHA o space-y-4 */}
</div> {/* FECHA o flex-1 overflow-y-auto */}

{/* --- GRUPO DADOS (FORA DO SCROLL, FIXO NO FUNDO SE QUISERES) --- */}
{/* --- GRUPO DADOS (SÓ APARECE NAS OPÇÕES) --- */}
{activeSection === 'settings' && (
  <div className="settings-group" style={{ margin: '10px 15px', border: '1px solid rgba(255,0,0,0.2)' }}>
    <div className="settings-title" style={{ fontSize: '14px', color: "white" }}>
      ⚠️ {t.data || "Dados"}
    </div>
    <button className="settings-action settings-action-danger" onClick={() => setShowDeleteAllModal(true)}>
      {t.deleteAll}
    </button>
  </div>
)}
      </main>

{/* --- BLOCO DE IMPRESSÃO EM MASSA (Invisível no ecrã) --- */}
      <div className="print-only-area">
        {savedRecipes.map((recipe, index) => (
          <div key={recipe.key || index} className="print-recipe-sheet">
            <div className="print-header">
              <h1>{recipe.name}</h1>
              <span>{new Date(recipe.date).toLocaleDateString()}</span>
            </div>
            <hr />
            <div className="print-grid">
  <div><strong>{t.absProfitTotal}:</strong> {fmt(recipe.profit)}</div>
  <div><strong>{t.absProfitDose}:</strong> {fmt(recipe.profit / Math.max(recipe.doses || 1, 1))}</div>
  <div><strong>Custo Total:</strong> {fmt(recipe.totalCost)}</div>
  <div><strong>Doses:</strong> {(recipe.doses || 0).toFixed(2)}</div>
</div>
            {/* Se quiseres que cada receita comece numa folha nova */}
            <div className="page-break"></div>
          </div>
        ))}
      </div>

      {activeSection === 'settings' && (
  <div className="settings-group" style={{ marginBottom: '8px', padding: '8px 12px' }}>
    <div className="settings-row" style={{ padding: '2px 0', border: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px', marginBottom: '10px', width: '100%' }}>
        <span style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 'bold' }}>⭐ PRO</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>{t.versionInfo}</span>
        <span style={{ 
          color: isPro ? "var(--gold)" : "#aaa", 
          fontWeight: 800,
          fontSize: '11px'
        }}>
          {isPro ? t.proActive : "FREE"}
        </span>
      </div>
    </div>
  </div>
)}

      {/* FOOTER (O teu código original continua aqui abaixo) */}
      <footer className="app-footer">
        {([
          { id: "dashboard", icon: "🏠", label: t.dashboard },
          // ... resto do teu código do footer
          { id: "recipes", icon: "📂", label: t.recipes },
          { id: "create", icon: "➕", label: t.create },
          { id: "warehouse", icon: "🏗️", label: t.warehouse },
          { id: "settings", icon: "⚙️", label: t.options },
        ] as const).map(({ id, icon, label }) => (
          <button key={id} className={`nav-btn ${activeSection === id ? "active" : ""}`} onClick={() => {
            if (id === "create") clearForm();
            setActiveSection(id);
          }}>
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}
         {/* --- GRUPO PRO COMPACTO --- */}
    
      </footer>
    </div>
  );
}

