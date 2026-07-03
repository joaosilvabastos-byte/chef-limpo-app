import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//import * as Print from 'expo-print';
//import * as Sharing from 'expo-sharing';
//import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import './index.css';


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
    semRed: " ALERTA VERMELHO: Lucro em Risco! Verifique os Custos.",
    globalChart: "LUCRO vs CUSTO — RECEITAS ATIVAS",
    allRecipes: "Todas", ranking: "Ranking",
    noRecipes: "Nenhuma receita guardada.", noWarehouse: "Armazém vazio.",
    addIngredient: "+ Adicionar Ingrediente",
    saveRecipe: "💾 GUARDAR RECEITA", saveWarehouse: "💾 GUARDAR ARMAZÉM",
    newItem: "+ NOVO",
    ingredient: "Ingrediente", unit: "Unid.", qty: "Qtd.",
    extras: "Extras", marginPct: "Minha Margem %",
    totalCost: "Custo Total", objetivo: "Objetivo",
    loss: "Prejuízo",
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
    deleteAll: "Apagar receitas?",
    deleteAllConfirm: "Apagar TODAS as receitas? Esta ação não pode ser desfeita.", cancelBtn: "Cancelar", apagar: "Apagar",
    deleteRecipeConfirm: "Apagar esta receita?",
    recipeName: "Nome da Receita",
    oilNotFound: "⚠️ Sem 'Óleo' no Armazém", oilFoundAt: "Óleo do Armazém:",
    proModal_title: "⭐ VERSÃO PRO", proModal_desc: "Por apenas 7.5€/mês, guarda receitas ilimitadas e recebe alertas de prejuízo.",
    proModal_cta: "ATIVAR AGORA", proModal_cancel: "Agora não",
    proSaved: "✨ Modo PRO ativado!", proActive: "PRO ✓",
    toastSaved: "guardada com sucesso!", toastWarehouseSaved: "✨ Armazém guardado!",
    openRecipe: "ABRIR", versionInfo: "Versão 3.0 PRO",
    notInWarehouse: "Não encontrado no Armazém",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ receita",
    rankingProfit: "Lucro Absoluto",
    noActiveRecipes: "Nenhuma receita ativa.",
    data: "Dados",
    option: "Opção",
    profitWarning: "AVISO: Lucro abaixo de 10%",
    changeDetected: "Alteração detetada:",
    energyTitle: "Central de Energia",
    luz: "Luz",
    gas: "Gás",
    carvao: "Carvão",
    unitKwh: "€/kWh",
    unitUn: "€/m³",
    unitKg: "€/kg",
    iva: "IVA",
    other: "Outro...",
    placeholderOther: "Ex: 0.10",
    finalCost: "CUSTO FINAL (C/ IVA):",
    saveBtn: "GRAVAR DEFINIÇÕES",
    margin: "Margem",
    subscribe: "Subscrever",
    upgradeMsg1: "A versão free só guarda 2 receitas. É suficiente? Percebo... Estás em crise social... Passa a Pro e celebra com amigos!",
    upgradeMsg2: "Só podes guardar 2 receitas no plano free. Não me digas que estás em dieta... Passa a Pro e não penses mais nisso!",
    upgradeMsg3: "Atenção: Limite de 2 receitas atingido. Sim, foi rápido... O teu talento merece muito mais. Passa a Pro!",
    profit: "Lucro",    
    warnWarehouse: "⚠️ Ingrediente não registado no armazém"
  },
  ES: {
    appName: "CHEF MARGIN PRO", appSub: "Gestión de costes y márgenes",
    dashboard: "Panel", recipes: "Recetas", create: "Crear", warehouse: "Almacén", options: "Opciones",
    semGreen: "✅ Margen dentro del objetivo",
    semOrange: "⚠️ ATENCIÓN: ¡El margen está cayendo por debajo del objetivo!",
    semRed: " ALERTA ROJA: ¡Beneficio en riesgo! Revisa los costes.",
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
    deleteAll: "¿Borrar recetas?",
    deleteAllConfirm: "¿Borrar TODAS las recetas? Esta acción no se puede deshacer.", cancelBtn: "Cancelar", apagar: "Borrar",
    deleteRecipeConfirm: "¿Borrar esta receta?",
    recipeName: "Nombre de la Receta",
    oilNotFound: "⚠️ Sin 'Aceite' en Almacén", oilFoundAt: "Aceite del Almacén:",
    proModal_title: "⭐ VERSIÓN PRO", proModal_desc: "Por solo 7.5€/mes, guarda recetas ilimitadas.",
    proModal_cta: "ACTIVAR AHORA", proModal_cancel: "Ahora no",
    proSaved: "✨ ¡Modo PRO activado!", proActive: "PRO ✓",
    toastSaved: "¡guardada con éxito!", toastWarehouseSaved: "✨ ¡Almacén guardado!",
    openRecipe: "ABRIR", versionInfo: "Versión 3.0 PRO",
    notInWarehouse: "No encontrado en Almacén",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ receta",
    rankingProfit: "Beneficio Absoluto",
    noActiveRecipes: "Ninguna receta activa.",
    data: "Datos",
    option: "Opción",
    profitWarning: "AVISO: Beneficio inferior al 10%",
    changeDetected: "Cambio detectado:",
    energyTitle: "Central de Energía",
    luz: "Luz",
    gas: "Gas",
    carvao: "Carbón",
    unitKwh: "€/kWh",
    unitUn: "€/m³",
    unitKg: "€/kg",
    iva: "IVA",
    other: "Otro...",
    placeholderOther: "Ej: 0.10",
    finalCost: "COSTE FINAL (C/ IVA):",
    saveBtn: "GUARDAR AJUSTES",
    margin: "Margen",
    loss: "Pérdida",
    profit: "Beneficio", 
    subscribe: "Suscribir",
    upgradeMsg1: "¿La versión gratuita solo guarda 2 recetas? ¿Es suficiente? Entiendo... ¿Crisis social? ¡Pásate a Pro y celebra com amigos!",
    upgradeMsg2: "Solo puedes guardar 2 recetas en el plan gratuito. No me digas que estás a dieta... ¡Pásate a Pro y olvídate de eso!",
    upgradeMsg3: "Atención: Límite de 2 recetas alcanzado. Sí, fue rápido... Tu talento merece mucho más. ¡Pásate a Pro!",   
    profitAtRisk: "¡Beneficio en Riesgo!",
    warnWarehouse: "⚠️ Ingrediente no registrado en el almacén"
    
  },
  FR: {
    appName: "CHEF MARGIN PRO", appSub: "Gestion des coûts et marges",
    dashboard: "Tableau", recipes: "Recettes", create: "Créer", warehouse: "Entrepôt", options: "Options",
    semGreen: "✅ Marge dans l'objectif",
    semOrange: "⚠️ ATTENTION: La marge descend sous l'objectif!",
    semRed: " ALERTE ROUGE: Profit en danger! Vérifiez les coûts.",
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
    deleteAll: "Supprimer recettes?",
    deleteAllConfirm: "Supprimer TOUTES les recettes? Action irréversible.", cancelBtn: "Annuler", apagar: "Supprimer",
    deleteRecipeConfirm: "Supprimer cette recette?",
    recipeName: "Nom de la Recette",
    oilNotFound: "⚠️ Pas d'huile dans l'entrepôt", oilFoundAt: "Huile de l'entrepôt:",
    proModal_title: "⭐ VERSION PRO", proModal_desc: "Pour seulement 7.5€/mois, sauvegardez des recettes illimitées.",
    proModal_cta: "ACTIVER MAINTENANT", proModal_cancel: "Pas maintenant",
    proSaved: "✨ Mode PRO activé!", proActive: "PRO ✓",
    toastSaved: "sauvegardée avec succès!", toastWarehouseSaved: "✨ Entrepôt sauvegardé!",
    openRecipe: "OUVRIR", versionInfo: "Version 3.0 PRO",
    notInWarehouse: "Introuvable dans l'entrepôt",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ recette",
    rankingProfit: "Profit Absolu",
    noActiveRecipes: "Aucune recette active.",
    data: "Données",
    option: "Option",
    profitWarning: "AVERTISSEMENT: Marge inférieure à 10%",
    changeDetected: "Changement détecté:",
    energyTitle: "Centre d'Énergie",
    luz: "Électricité",
    gas: "Gaz",
    carvao: "Charbon",
    unitKwh: "€/kWh",
    unitUn: "€/m³",
    unitKg: "€/kg",
    iva: "TVA",
    other: "Autre...",
    placeholderOther: "Ex: 0.10",
    finalCost: "COÛT FINAL (TVA INCL.):",
    saveBtn: "ENREGISTRER",
    margin: "Marge",
    loss: "Perte",
    profit: "Profit",
    subscribe: "S'abonner", 
    upgradeMsg1: "La version gratuite ne sauvegarde que deux recettes. Est-ce suffisant ? Je vois... Crise sociale ? Passez à Pro et fêtez ça entre amis !",
    upgradeMsg2: "Vous ne pouvez sauvegarder que deux recettes avec le plan gratuit. Ne me dites pas que vous êtes au régime... Passez à Pro !",
    upgradeMsg3: "Attention : Limite de deux recettes atteinte. Oui, c'était rapide... Votre talent mérite bien plus. Passez à Pro !",   
    profitAtRisk: "Profit en Risque !",
    warnWarehouse: "⚠️ Ingrédient non enregistré dans l'entrepôt"
    
  },
  EN: {
    appName: "CHEF MARGIN PRO", appSub: "Cost & margin management",
    dashboard: "Dashboard", recipes: "Recipes", create: "Create", warehouse: "Warehouse", options: "Options",
    semGreen: "✅ Margin on target",
    semOrange: "⚠️ WARNING: Margin is slipping below target!",
    semRed: " RED ALERT: Profit at Risk! Check Costs.",
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
    deleteAll: "Delete recipes?",
    deleteAllConfirm: "Delete ALL recipes? This cannot be undone.", cancelBtn: "Cancel", apagar: "Delete",
    deleteRecipeConfirm: "Delete this recipe?",
    recipeName: "Recipe Name",
    oilNotFound: "⚠️ No 'Oil' in Warehouse", oilFoundAt: "Oil from Warehouse:",
    proModal_title: "⭐ PRO VERSION", proModal_desc: "For just $7/month, save unlimited recipes and get loss alerts.",
    proModal_cta: "ACTIVATE NOW", proModal_cancel: "Not now",
    proSaved: "✨ PRO mode activated!", proActive: "PRO ✓",
    toastSaved: "saved successfully!", toastWarehouseSaved: "✨ Warehouse saved!",
    openRecipe: "OPEN", versionInfo: "Version 3.0 PRO",
    notInWarehouse: "Not found in Warehouse",
    activeOn: "ON", activeOff: "OFF",
    perDose: "/ recipe",
    rankingProfit: "Absolute Profit",
    noActiveRecipes: "No active recipes.",
    data: "Data" ,
    option: "Option",
    profitWarning: "WARNING: Profit below 10%",
    changeDetected: "Change detected:",
    energyTitle: "Energy Center",
    luz: "Electricity",
    gas: "Gas",
    carvao: "Charcoal",
    unitKwh: "€/kWh",
    unitUn: "€/m³",
    unitKg: "€/kg",
    iva: "Tax (VAT)",
    other: "Other...",
    placeholderOther: "Ex: 0.10",
    finalCost: "FINAL COST (W/ TAX):",
    saveBtn: "SAVE SETTINGS",
    margin: "Margin",
    loss: "Loss",   
    subscribe: "Subscribe", 
    upgradeMsg1: "The free version only saves 2 recipes. Is that enough? I get it... Social crisis? Go Pro and celebrate with friends!",
    upgradeMsg2: "You can only save 2 recipes in the free plan. Don't tell me you're on a diet... Go Pro and forget about it!",
    upgradeMsg3: "Attention: 2 recipe limit reached. Yes, that was fast... Your talent deserves much more. Go Pro!",
    profitAtRisk: "Profit at Risk!",
    warnWarehouse: "⚠️ Ingredient not registered in the warehouse"   
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

interface FryerData { oilLiters: number; uses: number; watts?: number; time?: number; }

interface EnergyData {
  type: "Eletricidade" | "Gás" | "Carvão";
  cost: number;        // Preço Luz
  gasCost: number;     // Preço Gás
  carvaoCost: number;  // Preço Carvão
  power: number;
  time: number;
  burners: number;
  iva: number;         // IVA Luz
  gasIva: number;      // IVA Gás
  carvaoIva: number;   // IVA Carvão
  isManual?: boolean;  // 🟢 ADICIONA ISTO AQUI
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
  comissaoUberTotal: number;
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
  ingredients: Ingredient[],
  extras: number,
  margin: number,
  sellPrice: number,
  loss: number,
  fryer: boolean,
  fryerData: FryerData,
  fryerOilItem: WarehouseItem | undefined,
  energy: boolean,
  energyData: EnergyData,
  deliveryCount: number,
  deliveryRate: number,
  isSaved: boolean = false,
  storedObjetivo: number = 0
): CalcResult {

  // 1. Definição de Seguranças (Evita NaN em todo o lado)
  const n = (v: any) => (isFinite(Number(v)) ? Number(v) : 0);
  const rate = (v: any) => {
    const val = n(v);
    return val >= 1 ? val / 100 : val;
  };

  const taxaUberLida = rate(deliveryRate);
  const qtdEntregasLida = n(deliveryCount);
  const precoVendaLido = n(sellPrice); // Se estiver vazio, assume 2€ para evitar erros

  // 2. CÁLCULO DA ENERGIA
  let energyCostVal = 0;
  let ivaEnergy = 0;

  if (energy && energyData) {
    const ed = energyData as any;
    const eType = (ed.type ?? "").toLowerCase();
    let eBase = 0;
    let iRate = 0.23; // IVA Padrão

    if (eType.includes("carv")) {
      eBase = n(ed.carvaoQty) * n(ed.carvaoCost);
      iRate = n(ed.carvaoIva || 0.13);
    } else if (eType.includes("gas") || eType.includes("gás")) {
      eBase = (n(ed.time || ed.minutes) / 60) * n(ed.gasConsumo || 1.2) * n(ed.gasCost);
      iRate = n(ed.gasIva || 0.23);
    } else {
      const kw = n(ed.power) / 1000;
      const horas = n(ed.time || ed.minutes) / 60;
      const pBase = n(ed.price || ed.cost);
      const precoReal = pBase > 1 ? pBase / 100 : pBase;
      eBase = kw * horas * precoReal;
      iRate = n(ed.iva || 0.23);
    }

    const cleanRate = iRate > 1 ? iRate / 100 : iRate;
    energyCostVal = eBase * (1 + cleanRate);
    ivaEnergy = energyCostVal - eBase;
  }

  // 3. INGREDIENTES
  let totalBase = 0;
  let ivaIngredientes = 0;

  ingredients.forEach((ing) => {
    const qty = n(ing.qty);
    const price = n(ing.price);
    const unitPrice = ing.unit === "DZ" ? price / 12 : price;
    const itemBase = qty * unitPrice;
    const iva = n(ing.iva) >= 1 ? n(ing.iva) / 100 : n(ing.iva);
    ivaIngredientes += itemBase * iva;
    totalBase += itemBase * (1 + iva);
  });

  // 4. FRITADEIRA (Preço Armazém / Usos)
  let fryerCost = 0;
  let ivaFryerValue = 0;

  if (fryer && fryerData) {
    // Busca automática: Preço e IVA do Armazém
    const oilPriceBase = n(fryerOilItem?.price); 
    const rawIvaValue = String(fryerOilItem?.iva || "0").replace(/[^0-9.]/g, "");
    const parsedIva = parseFloat(rawIvaValue) || 0;
    const oilIvaRate = parsedIva > 1 ? parsedIva / 100 : parsedIva;

    const litrosNaMaquina = n(fryerData.oilLiters);
    const nUtilizacoes = Math.max(1, n(fryerData.uses));

    // O Custo de 1 uso = (Preço * Litros * (1+IVA)) / Usos
    if (litrosNaMaquina > 0 && oilPriceBase > 0) {
      fryerCost = (oilPriceBase * (1 + oilIvaRate) * litrosNaMaquina) / nUtilizacoes;
      ivaFryerValue = (oilPriceBase * oilIvaRate * litrosNaMaquina) / nUtilizacoes;
    }
  }

  // 5. CUSTO TOTAL (Soma tudo!)
  const totalCost = totalBase + energyCostVal + fryerCost + n(extras);

  // 6. TAXAS E MARGENS
  const marginRate = n(margin) / 100;
  const lossRate = n(loss) / 100;

 // 1. O objetivo só é calculado se for uma receita nova (não guardada)
// 2. Se for uma receita guardada, mantém estritamente o que foi gravado (storedObjetivo)
const objetivoBaseCalculado = marginRate < 1 ? (totalCost / (1 - marginRate)) : totalCost * (1 + marginRate);
const objetivo = isSaved ? (storedObjetivo > 0.1 ? storedObjetivo : objetivoBaseCalculado) : objetivoBaseCalculado;
  // 8. RESULTADOS FINAIS (Ajustados para Análise de Sensibilidade)
// Faturação Real: Assume o valor do objetivo planeado
const faturacaoReal = objetivo;

// Lucro Nominal: Diferença direta entre o que vais faturar (objetivo) e o custo total
const lucroNominal = objetivo - totalCost;

// 9. DOSES E LUCRO REAL (Blindados contra o '1' fantasma e NaN)
// Doses: Se o preço for 0, evitamos a divisão por zero
const dosesPotenciais = (precoVendaLido > 0) ? (objetivo / precoVendaLido) : 0;

// Lucro Real Final: Desconta a Comissão Uber (se houver preço) e a Quebra (Loss)
const comissaoUberTotal = (precoVendaLido > 0) ? (qtdEntregasLida * (precoVendaLido * taxaUberLida)) : 0;

const lucroRealFinal = (lucroNominal - comissaoUberTotal) * (1 - lossRate);

  const sugeridoUber = (taxaUberLida > 0 && precoVendaLido > 0) 
    ? precoVendaLido / (1 - taxaUberLida) 
    : precoVendaLido;
  return {
    totalCost,
    objetivo,
    lucroReal: lucroRealFinal,
    doses: dosesPotenciais,
    effectiveDelivery: qtdEntregasLida,
    ivaIngredientes: ivaIngredientes,  // só ingredientes — ivaEnergy e ivaFryer são separados
    ivaEnergy,
    ivaFryer: ivaFryerValue,
    nominalProfit: dosesPotenciais > 0 ? lucroRealFinal / dosesPotenciais : 0,
    uberPrice: sugeridoUber,
    comissaoUberTotal,
    fryerCostTotal: fryerCost,
    energyCostTotal: energyCostVal,
    targetProfit: objetivo - totalCost,
    roi: totalCost > 0 ? (lucroRealFinal / totalCost) * 100 : 0
  } as any;
}

function computeSemaphore(activeRecipes: SavedRecipe[]): SemaphoreState {
  if (!activeRecipes || activeRecipes.length === 0) return "idle";

  // Definimos o estado inicial explicitamente como SemaphoreState
  let worst: SemaphoreState = "green";

  for (const r of activeRecipes) {
    const lucro = Number(r.profit) || 0;
    const custo = Number(r.totalCost) || 0;
    const venda = lucro + custo;

    const margemPercent = venda > 0 ? (lucro / venda) : 0;

    // 1. Se houver prejuízo, é vermelho imediato
    if (margemPercent < 0) {
      return "red"; 
    }

    // 2. Se a margem for 10% ou menos (0.10), passamos a laranja
    if (margemPercent <= 0.10) {
      worst = "orange";
    }
  }

  return worst;
}
// ── Vigilante: re-price ingredients from current warehouse ─────────────────
function recomputeIngredientCostFromWarehouse(ingredients: Ingredient[], warehouse: WarehouseItem[]): number {
  let total = 0;
  for (const ing of ingredients) {
    if (!ing.name) continue;
    const wItem = warehouse.find((w) => w.name.trim().toLowerCase() === ing.name.trim().toLowerCase());
    const price = wItem ? wItem.price : ing.price;
    const iva = wItem ? (wItem.iva >= 1 ? wItem.iva / 100 : wItem.iva) : (ing.iva >= 1 ? ing.iva / 100 : ing.iva);
    const unitPrice = ing.unit === "DZ" ? price / 12 : price;
    total += (ing.qty || 0) * unitPrice * (1 + iva);
  }
  return total;
}

function computeCostAlerts(activeRecipes: SavedRecipe[], _warehouse: WarehouseItem[], acknowledgedKeys: Set<string>): CostAlert[] {
  const alerts: CostAlert[] = [];
  
  for (const r of activeRecipes) {
    if (acknowledgedKeys.has(r.key)) continue;
    if (!r.ingredients?.length || !r.objetivo) continue;

    const marginRate = Math.min((r.margin || 0) / 100, 0.99);
    // Custo original que tínhamos quando gravámos a receita
    const originalTotalCost = r.objetivo * (1 - marginRate);
    // Custo atualizado (o que o armazém diz agora)
    const currentTotalCost = r.totalCost; 

    // 🟢 A MUDANÇA ESTÁ AQUI:
    // Só dispara alerta se:
    // 1. O custo subiu mais de 2% (currentTotalCost > originalTotalCost * 1.02)
    // 2. E SE o lucro atual for negativo (currentTotalCost > r.sellPrice)
    const isLosingMoney = currentTotalCost > (r.sellPrice || 0);

    if (originalTotalCost > 0 && currentTotalCost > originalTotalCost * 1.02 && isLosingMoney) {
      alerts.push({ 
        recipeKey: r.key, 
        recipeName: r.name, 
        oldCost: originalTotalCost, 
        newCost: currentTotalCost 
      });
    }
  }
  return alerts;
}

// ── Utils ──────────────────────────────────────────────────────────────────
function newId() { return "ID_" + Date.now() + Math.floor(Math.random() * 1000); }
function fmtDate(iso: string) {
  try { const d = new Date(iso); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; }
  catch { return iso.slice(0, 10); }
}

const STORAGE_PREFIX = "CHEFV2_";

// FUNÇÃO ATUALIZADA: Agora aceita o 'db' e o 'user' para sincronizar
async function saveLS(key: string, data: any, user?: any) { 
  try { 
    // 1. Guarda sempre no browser (Local)
    localStorage.setItem(key, JSON.stringify(data)); 
    
   // 2. Sincronização com a Nuvem removida temporariamente para estabilidade local
    /*
    if (user && key.startsWith(STORAGE_PREFIX + "REC_")) {
      // @ts-ignore
      const { doc, setDoc } = await import('firebase/firestore');
      // @ts-ignore
      await setDoc(doc(db, "receitas", key), {
        ...data,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
      console.log("☁️ Sincronizado com Firebase");
    }
    */
  } catch (e) {
    console.error("Erro ao guardar:", e);
  } 
}

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

// ── Toast ─────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
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
        <input className="f-input" type="text" min="0" step="0.1" placeholder="%"
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
{/* Substitui a linha 10 por isto: */}
{ing.name && !wItem && (
  <div style={{
    backgroundColor: "#332b1a",
    border: "1px solid #f39c12",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "8px",
    textAlign: "center",
    color: "#f39c12",
    fontWeight: "bold",
    fontSize: "20px"
  }}>
     {t.warnWarehouse}
  </div>
)}        {showDrop && filtered.length > 0 && (
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
     <input 
  className="f-input" 
  type="text" 
  inputMode="decimal" 
  placeholder="0"
  /* Mantemos o valor como está no estado para o ponto não fugir */
  value={ing.qty || ""} 
  onChange={(e) => {
    const val = e.target.value.replace(',', '.');
    // Filtro para aceitar apenas números e UM ponto decimal
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      // O 'as any' resolve aquele erro vermelho do TypeScript que me mostraste
      onChange({ ...ing, qty: val as any });
    }
  }} 
/>
<button className="btn-del-row" onClick={onDelete}>✕</button>
    </div>
  );
}

function DashboardSection({
  activeRecipes, 
  semaphore, 
  t, 
  fmt, 
  costAlerts, 
  onAjustar, 
  onManter, 
  extras, 
  calc 
}: {
  activeRecipes: any[]; 
  semaphore: any;
  t: Record<string, string>; 
  fmt: (n: number) => string;
  costAlerts: any[]; 
  onAjustar: (key: string) => void; 
  onManter: (key: string) => void;
  extras: number;
  calc: any;
}) {
  // 1. Removi os useRefs e o useEffect que causavam erros de "Chart not defined"
  const isIdle = !activeRecipes || activeRecipes.length === 0;

 // 1. Lucro: Se não há receitas ativas, é ZERO.
const totalProfit = (activeRecipes && activeRecipes.length > 0)
  ? activeRecipes.reduce((a, r) => a + (Number(r.profit) || 0), 0) - Number(extras || 0)
  : 0; 

// 2. Custo: Se não há receitas ativas, é ZERO.
const totalCost = (activeRecipes && activeRecipes.length > 0)
  ? activeRecipes.reduce((a, r) => a + (Number(r.totalCost) || 0), 0) + Number(extras || 0)
  : 0;

  const activeColor = semaphore === "orange" ? "#f97316" : semaphore === "red" ? "#ef4444" : "#22c55e";
  const bannerText = semaphore === "orange" ? t.profitWarning : semaphore === "red" ? t.semRed : t.semGreen;
  const bannerClass = semaphore === "orange" ? "sem-orange" : semaphore === "red" ? "sem-red" : "sem-green";

  // Cálculo do arco para o Donut (strokeDasharray com circunferência ~100.5 para r=16)
  const percLucro = (() => {
    if (isIdle) return 0;
    if (totalProfit >= 0) {
      // Lucro positivo: arco proporcional à margem real
      const totalGeral = totalProfit + Math.abs(totalCost);
      return totalGeral > 0 ? (totalProfit / totalGeral) * 100 : 0;
    } else {
      // Prejuízo: arco vermelho sempre visível — mínimo 20, máximo 90
      const totalGeral = Math.abs(totalProfit) + Math.abs(totalCost);
      const raw = totalGeral > 0 ? (Math.abs(totalProfit) / totalGeral) * 100 : 50;
      return Math.max(20, Math.min(raw, 90));
    }
  })();

  return (
    <div className="dashboard-root">

      {/* Banner de Alerta */}
      {semaphore !== "idle" && semaphore !== "green" && (
        <div className={`sem-banner ${bannerClass}`} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>{semaphore === "orange" ? "⚠️" : "🚨"}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px" }}>{bannerText}</div>
              {costAlerts.length > 0 && (
                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                  {costAlerts[0].recipeName} ({fmt(costAlerts[0].oldCost)} → {fmt(costAlerts[0].newCost)})
                </div>
              )}
            </div>
          </div>
          {costAlerts.length > 0 && (
            <select
              key={`alert-select-${t.costAlertAdjust}`} 
              value="" 
              onChange={(e) => {
                if (e.target.value === "ajustar") onAjustar(costAlerts[0].recipeKey);
                else if (e.target.value === "manter") onManter(costAlerts[0].recipeKey);
              }}
              style={{ background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "6px 10px", marginTop: "10px", width: "100%" }}
              ><option value="" disabled>{t?.option || "Opção"}:</option>
              <option value="ajustar">{t.costAlertAdjust}</option>
              <option value="manter">{t.costAlertKeep}</option>
            </select>
          )}
        </div>
      )}

      {/* Doughnut Chart Card - SEM ERROS */}
      <div className="chart-card chart-card-main">
        <div className="chart-label" style={{ fontSize: isIdle ? 18 : 13, color: "#ffffff", fontWeight: 700, textAlign: "center", padding: "4px 0" }}>
          {isIdle ? t.noActiveRecipes : t.globalChart}
        </div>
        <div className="chart-totals">
          <div className="chart-total-item">
            <span style={{ color: totalProfit < 0 ? "#ef4444" : activeColor }}>●</span>
<span style={{ color: "#ffffff" }}>{totalProfit < 0 ? (t?.loss || "Prejuízo") : (t?.realProfit || "Lucro Real")}: <strong>{totalProfit.toFixed(2)}€</strong></span>          </div>
          <div className="chart-total-item">
            <span style={{ color: "#c4a778" }}>●</span>
            <span style={{ color: "#ffffff" }}>{t.totalCost}: <strong>{fmt(totalCost)}</strong></span>
          </div>
        </div>

        <div className="canvas-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', marginTop: '10px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '160px', height: '160px' }}>
  {/* Círculo de Fundo (cinza) */}
  <circle cx="18" cy="18" r="16" fill="none" stroke="#c4a778" strokeWidth="3.5" />
  
  {/* Círculo do Donut (O arco que cresce) */}
  <circle
    cx="18" cy="18" r="16" fill="none" 
    stroke={totalProfit < 0 ? "#ef4444" : activeColor}
    strokeWidth="3.5"
    strokeDasharray={`${Math.abs(percLucro)} 100`}
    strokeLinecap="round"
    // Esta rotação garante que ele começa às 9h (esquerda)
    transform="rotate(-90 18 18)" 
    style={{ transition: 'stroke-dasharray 0.5s ease' }}
  />
</svg>
         <div style={{ position: 'absolute', textAlign: 'center' }}>
            {/* Tradução dinâmica: usa t.margin para Português/Espanhol/Inglês */}
            <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase' }}>
              {t.margin || "MARGEM"}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              {totalCost > 0 ? ((totalProfit / (totalCost + totalProfit)) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
  export default function App() {
    
    // Definimos o user fixo localmente para não quebrar o resto do layout da app
    const [user, setUser] = useState<any>({ displayName: "Chef", email: "local@chef.com" });


    
    // O useEffect fica vazio, já não precisa de ouvir o Firebase para nada!
    useEffect(() => {
      // Autenticação do Firebase removida com sucesso.
    }, []);

    

    // ── PRO Modal ─────────────────────────────────────────────────────────────
function ProModal({ onClose, t, setIsPro, setShowProModal, proModalCallback, setProModalCallback }: any) {
  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPro(true);
    // Chave consistente com o STORAGE_PREFIX usado no loadLS (linha 975)
    localStorage.setItem(STORAGE_PREFIX + "PRO", "true");
    setShowProModal(false);
    // Executar o callback pendente (ex: guardar receita após activar Pro)
    if (typeof proModalCallback === "function") {
      proModalCallback();
      if (setProModalCallback) setProModalCallback(null);
    }
  };

  return (
    <div className="pro-modal-overlay" onClick={onClose}>
      <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t.proModal_title}</div>
        <div className="modal-price">7.5€/mês</div>
        <button className="modal-btn-cta" onClick={handleActivate}>
          {t.proModal_cta}
        </button>
        <button className="modal-btn-skip" onClick={(e) => { e.stopPropagation(); onClose(); }}>
          {t.proModal_cancel}
        </button>
      </div>
    </div>
  );
}

    

    const [precoKwh, setPrecoKwh] = useState(0.22);
    const [precoM3, setPrecoM3] = useState(1.85);
  // Estados para os IVAs
  const [tempPower, setTempPower] = useState("");
  const [ivaLuz, setIvaLuz] = useState(23);
  const [ivaGas, setIvaGas] = useState(23);
  const [customIvaLuz, setCustomIvaLuz] = useState(23);
  const [customIvaGas, setCustomIvaGas] = useState(23);
  const [showEnergyModal, setShowEnergyModal] = useState(false);  
  const [lang, setLang] = useState<Lang>(() => loadLS<Lang>(STORAGE_PREFIX + "LANG") || "PT");
  const t = TR[lang];
  const setLangSave = (l: Lang) => { setLang(l); saveLS(STORAGE_PREFIX + "LANG", l); };
  const iniciarLoginGoogleNativo = () => {
    try {
      // @ts-ignore
      if (window.google && window.google.accounts && window.google.accounts.id) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: "713374828773-v738tt14vmscl3r4n4clre3v0ptb7p25.apps.googleusercontent.com",
          callback: (response: any) => {
            console.log("Login efetuado com sucesso no Google!", response);
            setUser({ displayName: "Chef Margin Pro", email: "joaosilvabastos@gmail.com" });
            setIsPro(true);
            localStorage.setItem(STORAGE_PREFIX + "PRO", "true");
          }
        });
        // @ts-ignore
        window.google.accounts.id.prompt();
      } else {
        const email = prompt("Google Sign-In Direct (PC):\nIntroduza o seu email:", "joaosilvabastos@gmail.com");
        if (email) {
          setUser({ displayName: "Chef Margin Pro", email: email });
          setIsPro(true);
          localStorage.setItem(STORAGE_PREFIX + "PRO", "true");
        }
      }
    } catch (err) {
      console.error("Erro ao chamar o Google Nativo:", err);
    }
  };
  // Currency: $ for EN, € for others
  const currency = lang === "EN" ? "$" : "€";
  const fmt = useCallback((n: number | any) => {
  // Se 'n' não for um número válido, ele assume 0 em vez de crashar
  const val = Number(n) || 0;
  return lang === "EN" ? `$${val.toFixed(2)}` : `${val.toFixed(2)}€`;
}, [lang]);

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
  const [fryerData, setFryerData] = useState<FryerData>({ oilLiters: 0, watts: 2500, time: 0, uses: 0 });

  // Energy
  const [energyOn, setEnergyOn] = useState(false);
 const [energyData, setEnergyData] = useState<EnergyData>({
  type: "Gás",
  cost: 0,
  gasCost: 0,
  carvaoCost: 0,
  power: 0,
  time: 0,
  burners: 1,
  iva: 0.23,
  gasIva: 0.23,
  carvaoIva: 0.13,
  isManual: false // 🟢 INICIALIZA COMO FALSO
});

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
const handleGlobalChange = (val: string, setter: any, field?: string) => {
  const cleanVal = val.replace(',', '.');
  
  // Permite apenas números e um único ponto decimal
  if (cleanVal === '' || /^[0-9]*\.?[0-9]*$/.test(cleanVal)) {
    if (field) {
      setter((prev: any) => ({ ...prev, [field]: cleanVal }));
    } else {
      // Usamos o cast 'as any' para o TS não reclamar da troca de number por string
      setter(cleanVal as any);
    }
  }
};
  const [warehouseChanged, setWarehouseChanged] = useState(false);

  // Saved recipes
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => getAllRecipes());
  const [recipesTab, setRecipesTab] = useState<"all" | "ranking">("all");

 const fryerOilItem = useMemo(() => {
  // Procura especificamente pelo nome exato que deste no armazém
  return warehouseSaved.find((w) => 
  w.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "oleo"
);
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

 const rankingRecipes = useMemo(() => {
    return [...savedRecipes]
      .filter((r) => r.totalCost > 0 && typeof r.profit !== 'undefined')
      .map(r => ({
        ...r,
        // Forçamos a criação de um valor que soma o custo base + extras atuais
        totalComExtras: (Number(r.totalCost) || 0) + (Number(extras) || 0)
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [savedRecipes, extras]); // <--- ESTA VÍRGULA E O EXTRAS SÃO A TUA SALVAÇÃO // ✅ SE ISTO NÃO ESTIVER AQUI, NÃO FUNCIONA.
  // 2. Verifica se a receita atual já existe
  const existing = savedRecipes.find(r => r.name === recipeName);

  // 3. Cálculo em Tempo Real (Dashboard)
  const calc = calcRecipe(
    ingredients, extras, margin, sellPrice, loss,
    fryerOn, fryerData, fryerOilItem,
    energyOn, energyData, deliveryCount, deliveryRate,
    !!existing,           
    existing?.objetivo || 0 
  );

  // 4. Sincronização de preços com Armazém (Dashboard)
  useEffect(() => {
    setIngredients((prev) => prev.map((ing) => {
      const w = warehouseSaved.find((ww) => ww.name.toLowerCase() === ing.name.toLowerCase());
      return w ? { ...ing, price: w.price, unit: w.unit, iva: w.iva } : ing;
    }));
  }, [warehouseSaved, energyData]); // <--- ACRESCENTA O energyData AQUI!

  // 5. Aplicar mudanças de preço a TODAS as receitas guardadas
  const applySyncToRecipes = useCallback((newWarehouse: WarehouseItem[]) => {
    const oilItem = newWarehouse.find(w => w.name === "Óleo" || w.name === "Azeite");

    setSavedRecipes((prev) => {
      return prev.map((r) => {
        if (!r.ingredients?.length) return r;

        const syncedIngs = r.ingredients.map((ing) => {
          const w = newWarehouse.find((ww) => ww.name.toLowerCase() === ing.name.toLowerCase());
          return w ? { ...ing, price: w.price, unit: w.unit, iva: w.iva } : ing;
        });

       const recomputed = calcRecipe(
  syncedIngs, r.extras, r.margin, r.sellPrice, r.loss,
  r.fryer, r.fryerData, oilItem,
  r.energy, energyData,
  r.deliveryCount, r.deliveryRate,
  true, 
  // AQUI É QUE ESTÁ A TRAVA:
  (r.objetivo && r.objetivo > 0) ? r.objetivo : 0 
);

return {
  ...r,
  ingredients: syncedIngs,
  totalCost: recomputed.totalCost,
  // SE O OBJETIVO ORIGINAL FOR VÁLIDO, MANTÉM-NO. NÃO DEIXES O RECOMPUTED SOBRESCREVER.
  objetivo: (r.objetivo && r.objetivo > 0) ? r.objetivo : recomputed.objetivo,
  profit: recomputed.lucroReal
};
      });
    });
  }, [setSavedRecipes, energyData]);

  // --- Funções de Utilidade e Pro ---
  const requirePro = (callback: () => void) => {
    if (isPro) { callback(); return; }
    setProModalCallback(() => callback);
    setShowProModal(true);
  };

 const activatePro = () => {
  setIsPro(true);
  localStorage.setItem(STORAGE_PREFIX + "PRO", "true");
  setShowProModal(false);
  
  // Usando a tua chave de tradução existente
  if (typeof showToast === 'function') {
    showToast(t.proSaved);
  }
  
  console.log("Ativação finalizada.");
};

const clearForm = () => {
    setRecipeName("");
    setIngredients([{ id: newId(), name: "", unit: "KG", price: 0, qty: 0, iva: 0.23 }]);
    setExtras(0); 
    setMargin(0); 
    setSellPrice(0); 
    setLoss(0);

    setFryerOn(false);
    setFryerData({ oilLiters: 0, watts: 2500, time: 0, uses: 10 });

    setEnergyOn(false);
    
    // ESTA É A LIMPEZA QUE FALTA:
    setEnergyData((prev: any) => ({ 
      ...prev, 
      type: "Eletricidade", // Volta ao padrão
      time: 0,              // Zera os minutos (f-input value={energyData.time})
      power: 2000,          // Volta aos 2000W padrão
      cost: 0,              // Zera o custo calculado da Luz
      gasCost: 0,           // Zera o custo calculado do Gás
      carvaoCost: 0,        // Zera o custo calculado do Carvão
      gasQty: 0,            // Zera a quantidade de gás
      carvaoQty: 0          // Zera a quantidade de carvão
    }));

    setDeliveryCount(0);
    setDeliveryRate(20); 
    setDeliveryEntity("uber");
  };

   
 const handleSaveRecipe = () => {
  const name = recipeName.trim() || "Receita " + fmtDate(new Date().toISOString());
  const key = STORAGE_PREFIX + "REC_" + name.replace(/[\s\/\\]/g, "_");

  // Editar uma receita existente (mesmo nome/key) nunca conta para o limite
  const isEditingExisting = savedRecipes.some(r => r.key === key);

  // Limite free: máximo 2 receitas novas — Pro não tem limite
  if (!isPro && !isEditingExisting && savedRecipes.length >= 2) {
    setShowProModal(true); // mostra o modal de upgrade directamente
    return;
  }

  // A partir daqui: ou é free com < 2 receitas, ou é Pro — guardar sempre
  const currentCalc = calcRecipe(
    ingredients, extras, margin, sellPrice, loss,
    fryerOn, fryerData, fryerOilItem,
    energyOn, energyData, deliveryCount, deliveryRate,
    false, 0
  );

  const existingRecipe = savedRecipes.find((r) => r.key === key);

  const data: SavedRecipe = {
    key,
    name,
    date: new Date().toISOString(),
    active: existingRecipe ? (existingRecipe.active !== false) : false,
    sellPrice,
    margin,
    totalCost: currentCalc?.totalCost || 0,
    profit: currentCalc?.lucroReal || 0,
    objetivo: existingRecipe?.objetivo && existingRecipe.objetivo > 0.01
      ? existingRecipe.objetivo
      : (currentCalc.objetivo || 0),
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

  saveLS(key, data, user);
  setSavedRecipes(getAllRecipes());
  showToast(`"${name}" guardada!`);
  if (typeof clearForm === "function") clearForm();
}; // Fecha o handleSaveRecipe

  const toggleRecipeActive = (key: string) => {
    const recipe = savedRecipes.find((r) => r.key === key);
    if (!recipe) return;
    const updated = { ...recipe, active: !(recipe.active !== false) };
    saveLS(key, updated, user);
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
  // 1. Cria uma nova lista sem a receita que queres apagar
  const updatedRecipes = savedRecipes.filter(recipe => recipe.key !== key);
  
  // 2. Atualiza o estado das receitas com a nova lista
  setSavedRecipes(updatedRecipes);
  
  // 3. Guarda no localStorage para a alteração ser permanente
  localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
  
  // Opcional: Se tiveres lógica de "confirmar", podes mantê-la aqui, 
  // mas agora a receita será removida visualmente.
};

  // Vigilante callbacks
  
const handleReajustar = useCallback((recipeKey: string) => {
    const original = savedRecipes.find((r: any) => r.key === recipeKey) as any;
    if (!original) return;

    // A TUA SOLUÇÃO: Usar 'name' que é a chave correta no objeto
    const nomeBase = original.name || original.recipeName || "";
    
    let novoNome = "";
    
    // Este ciclo obriga a escolher um nome válido ou a cancelar
    while (true) {
      const input = window.prompt("Nova versão (escolha um nome diferente):", nomeBase);
      
      // Se clicar em Cancelar, sai da função sem apagar nada
      if (input === null) return;

      // Se o nome for diferente e não estiver vazio, quebramos o ciclo
      if (input.trim() !== "" && input.trim() !== nomeBase.trim()) {
        novoNome = input;
        break; 
      }

      alert("Erro: O nome tem de ser diferente do original e não pode estar vazio!");
    }

    // Só chega aqui se o nome for válido
    setRecipeName(novoNome);
  
    setIngredients(original.ingredients || []);
    setExtras(Number(original.extras) || 0);
    setMargin(Number(original.margin) || 0);
    setSellPrice(Number(original.sellPrice) || 0);
    setLoss(Number(original.loss) || 0);
    
    setFryerOn(!!original.fryerOn);
    if (original.fryerData) setFryerData(original.fryerData);
    setEnergyOn(!!original.energyOn);
    if (original.energyData) setEnergyData(original.energyData);

    setActiveSection("create");
  }, [savedRecipes, setActiveSection, setRecipeName, setIngredients, setExtras, setMargin, setSellPrice, setLoss, setFryerOn, setFryerData, setEnergyOn, setEnergyData]);
  const handleManter = useCallback((recipeKey: string) => {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev); next.add(recipeKey);
      saveLS(STORAGE_PREFIX + "ACK_ALERTS", Array.from(next));
      return next;
    });
  }, []);

  // Warehouse
  const handleSaveWarehouse = () => {
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
 /* const pdfAddPageHeader = (doc: jsPDF, y: number): number => {
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
  };*/

// 1. Export JSON — Receitas
const handleExportRecipesJson = () => {
  const dataStr = JSON.stringify(savedRecipes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ChefMargin_Receitas_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// 2. Export JSON — Armazém
const handleExportWarehouseJson = () => {
  const dataStr = JSON.stringify(warehouseSaved, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ChefMargin_Armazem_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// 3. Export JSON — IVA
const handleExportIvaJson = () => {
  // Vamos usar um objeto simples. 
  // Se o VS Code sublinhar 'ivaIngredientes', 
  // apaga essa linha e escreve 0 por enquanto.
  const ivaData = { 
    info: "Dados de IVA",
    data: new Date().toISOString()
  };

  const dataStr = JSON.stringify(ivaData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ChefMargin_IVA_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// 4. Export JSON — Backup
const handleExportBackupJson = () => {
  const dataStr = JSON.stringify(warehouseSaved, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ChefMargin_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

  const fileInputRef = useRef<HTMLInputElement>(null);
 const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]; 
  if (!file) return;
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
  reader.readAsText(file); 
  e.target.value = "";
};

  // Delivery
  const handleDeliveryPlus = () => {
    setDeliveryCount((prev) => {
      const r = sellPrice > 0.01 ? (calc.objetivo / sellPrice) * (1 - loss / 100) : 0;
      return Math.min(prev + 1, Math.floor(r));
    });
  };

// ivaTotal: soma o IVA de TODAS as receitas guardadas (activas e inactivas)
  // Nota: calcRecipe.ivaIngredientes já inclui ivaFryer+ivaEnergy (é o IVA total da receita)
  // Os campos ivaEnergy e ivaFryer são os sub-totais separados para exibição
  // IVA de TODAS as receitas guardadas (activas e inactivas)
  // calcRecipe.ivaIngredientes = só ingredientes; ivaEnergy e ivaFryer são separados
 const allRecipesIva = useMemo(() => {
  if (!savedRecipes || savedRecipes.length === 0) return null;
  
  return savedRecipes.reduce((acc: { ing: number; energy: number }, r: any) => {
    const rc = calcRecipe(
      r.ingredients || [], r.extras || 0, r.margin || 0,
      r.sellPrice || 0, r.loss || 0,
      r.fryer || false, r.fryerData || {},
      undefined,
      r.energy || false, r.energyData || {},
      r.deliveryCount || 0, r.deliveryRate || 0,
      true, r.objetivo || 0
    );
    
    // Somamos apenas o que faz sentido (Ingredientes + Energia)
    return {
      ing:    acc.ing    + rc.ivaIngredientes,
      energy: acc.energy + rc.ivaEnergy,
    };
  }, { ing: 0, energy: 0 });
}, [savedRecipes, savedRecipes.length]); // <--- Dependência corrigida aqui

// Soma apenas os dois campos relevantes
const ivaTotal = allRecipesIva
  ? allRecipesIva.ing + allRecipesIva.energy
  : (calc.ivaIngredientes || 0) + (calc.ivaEnergy || 0);  
  // ── Render ─────────────────────────────────────────────────────────────
 return (
<div className="app-root" style={{ 
  height: '100vh', 
  width: '100vw', 
  overflow: 'hidden', 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  display: 'flex', 
  flexDirection: 'column', // <--- ISTO garante que o logo fica no topo e centrado
  backgroundColor: '#1a0b2e',
  touchAction: 'none' 
}}>
  {/* LOGO FIXO NO TOPO */}
  <div style={{ 
    flexShrink: 0, 
    width: '100%',            // <--- Ocupa a largura toda para centrar o conteúdo
    textAlign: 'center', 
    paddingTop: '60px', 
    paddingBottom: '20px', 
    backgroundColor: '#1a0b2e',
    display: 'flex',
    justifyContent: 'center', // <--- Centra o logo horizontalmente
    zIndex: 10
  }}>
    <img 
      src="/LOGO.png" 
      alt="Chef Margin Pro" 
      style={{ height: '50px', width: 'auto', transform: 'scale(1.15)' }} 
    />
  </div>

  {/* O RESTO DA APP (Onde o conteúdo vai entrar) */}

    

      <ToastContainer toasts={toasts} />
      
  {showProModal && (
  <ProModal 
    onClose={() => { setShowProModal(false); setProModalCallback(null); }} 
    t={t} 
    setIsPro={setIsPro}
    setShowProModal={setShowProModal}
    proModalCallback={proModalCallback}
    setProModalCallback={setProModalCallback}
  />
)}
      {showDeleteAllModal && (
        <div className="pro-modal-overlay" onClick={() => setShowDeleteAllModal(false)}>
          <div className="pro-modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>⚠️</div>
            <h2 style={{ textAlign: "center", color: "#ef4444", marginBottom: 8, fontSize: 18 }}>{t.deleteAll}</h2>
            <p style={{ textAlign: "center", color: "white", fontSize: 13, marginBottom: 20 }}>{t.deleteAllConfirm}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="settings-action" style={{ flex: 1 }} onClick={() => setShowDeleteAllModal(false)}>{t.cancelBtn || "Cancelar"}</button>
              <button 
                className="settings-action settings-action-danger" 
                style={{ flex: 1 }} 
                onClick={() => {
                  for (let i = localStorage.length - 1; i >= 0; i--) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(STORAGE_PREFIX + "REC_")) localStorage.removeItem(k);
                  }
                  setSavedRecipes([]);
                  setShowDeleteAllModal(false);
                  showToast("🗑️ " + (t.deleteAll || "Receitas apagadas"));
                }}
              >
                {t.deleteAll}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER LIMPO (Apenas idiomas e espaço) */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 15px', height: '60px' }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          
          {/* 1. CONTAINER DO BOTÃO DA ENERGIA - MAIS ESPAÇO */}
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            padding: '20px 0', 
            marginBottom: '-2px', 
            minHeight: '80px', 
            clear: 'both' 
          }}>

            {/* Só mostra o botão se isAddingRecipe for verdadeiro */}
{activeSection === 'create' && (
  <div style={{ 
    display: 'block',          // Mudamos para block para não empurrar para o lado
    textAlign: 'left',         // Comando direto: tudo para a esquerda
    width: '100%', 
    paddingLeft: '15px',       // <--- AQUI: Aumenta/Diminui para mover o BOTÃO
    marginTop: '-15px',        // Puxa para cima para não "comer" espaço
    marginBottom: '0px',
    height: 'auto'
  }}>
   <button
  onClick={() => setShowEnergyModal(true)}
  style={{
    width: '250px',
    padding: '7px',
    backgroundColor: '#1a1a1a',
    color: '#7b2cbf',
    border: '2px solid #7b2cbf',
    borderRadius: '14px',
    fontSize: '20px',
    fontWeight: 'bold',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(123, 44, 191, 0.15)',
    
    // O COMANDO QUE JÁ TINHAS (Mantém-no!):
    transform: 'translateX(-15px)', 

    // O NOVO COMANDO PARA DESCER:
    marginTop: '15px' // <--- Aumenta este número para descer mais
  }}
>
      <span style={{ fontSize: '20px' }}>⚡</span>
      {t?.energyTitle || "CENTRAL DE ENERGIA"}
    </button>
  </div>
)}
</div>

{/* 2. CONTAINER DO SELETOR DE IDIOMAS (FECHADO CORRETAMENTE) */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        padding: '5px 15px' 
      }}>
       
      </div>
{/* JANELA CENTRAL DE ENERGIA */}
{showEnergyModal && (
  <div style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    zIndex: 1000 
  }}>
    <div style={{ 
  backgroundColor: '#1a1a1a',
  padding: '25px 15px',
  borderRadius: '24px',
  width: '88%',           

  // A MARRETA PARA CENTRAR E DESCER:
  position: 'relative',
  margin: '0 auto',       
  left: '0',
  top: '320px',            // <--- ADICIONA ISTO! 50px para descer um pouco.
                          // Se quiseres que desça MAIS, põe '100px' ou '150px'.
  
  border: '1px solid #333',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  zIndex: 1001
}}>
      {/* BOTÃO X */}
<button 
  onClick={() => setShowEnergyModal(false)}
  style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ff4444', fontSize: '24px', cursor: 'pointer' }}
>✕</button>

{/* TÍTULO (Linha ~1563) */}
<h2 style={{ color: '#7b2cbf', marginBottom: '20px', textAlign: 'center', width: '100%' }}>
  {t?.energyTitle || "Central de Energia"}
</h2>

{/* ESTA DIV É A QUE MANDA NO CONTEÚDO (Linha ~1767) */}
<div style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '15px',
  width: '100%',         // <--- OCUPA A LARGURA TODA DA JANELA
  alignItems: 'center',  // <--- CENTRA OS FILHOS (LINHAS DE LUZ/GÁS)
  justifyContent: 'center'
}}>
 {/* LINHA 1: LUZ */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end', marginBottom: '15px' }}>
  <div>
    <label className="f-label">{(t?.luz || "Luz")} ({t?.unitKwh || "€/kWh"})</label>
    <input 
      className="f-input" 
      type="text" 
      inputMode="decimal"
      placeholder="0.0000"
      /* Limpo: usamos o valor direto ou vazio */
      value={energyData.cost || ""} 
      /* Vacinado: ponto e vírgula resolvidos */
      onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, 'cost')} 
    />
  </div>
  <div>
    <label className="f-label">{(t?.iva || "IVA")} {(t?.luz || "Luz")}</label>
    <select 
      className="f-input" 
      value={[0.06, 0.13, 0.23].includes(energyData.iva) ? energyData.iva : 'outro'} 
      onChange={(e) => {
        const val = e.target.value;
        setEnergyData({...energyData, iva: val === 'outro' ? -1 : parseFloat(val)});
      }}
    >
      <option value={0.23}>23%</option>
      <option value={0.13}>13%</option>
      <option value={0.06}>6%</option>
      <option value="outro">{t?.other || "Outro..."}</option>
    </select>

    {/* Input de IVA Personalizado da Luz - VACINADO */}
    {(![0.06, 0.13, 0.23].includes(energyData.iva) || energyData.iva === -1) && (
      <input 
        className="f-input" style={{ marginTop: '5px', borderColor: '#7b2cbf' }} 
        type="text" inputMode="decimal" placeholder="0.00"
        value={energyData.iva === -1 ? "" : energyData.iva} 
        onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, 'iva')} 
      />
    )}
  </div>
</div>
 {/* LINHA 2: GÁS */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end', marginBottom: '15px' }}>
  <div>
    <label className="f-label">{(t?.gas || "Gás")} (€/m³)</label>
    <input 
      className="f-input" 
      type="text" 
      inputMode="decimal" 
      placeholder="0.00"
      value={energyData.gasCost || ""} 
      onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, 'gasCost')} 
    />
  </div>
  <div>
    <label className="f-label">{(t?.iva || "IVA")} {(t?.gas || "Gás")}</label>
    <select 
      className="f-input" 
      value={[0.06, 0.13, 0.23].includes(energyData.gasIva) ? energyData.gasIva : 'outro'} 
      onChange={(e) => {
        const val = e.target.value;
        setEnergyData({...energyData, gasIva: val === 'outro' ? -1 : parseFloat(val)});
      }}
    >
      <option value={0.23}>23%</option>
      <option value={0.13}>13%</option>
      <option value={0.06}>6%</option>
      <option value="outro">{t?.other || "Outro..."}</option>
    </select>
    {/* Input de IVA Personalizado do Gás - VACINADO */}
    {(![0.06, 0.13, 0.23].includes(energyData.gasIva) || energyData.gasIva === -1) && (
      <input 
        className="f-input" style={{ marginTop: '5px', borderColor: '#7b2cbf' }} 
        type="text" inputMode="decimal" placeholder="0.00"
        value={energyData.gasIva === -1 ? "" : energyData.gasIva} 
        onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, 'gasIva')} 
      />
    )}
  </div>
</div>
 {/* LINHA 3: CARVÃO */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
  <div>
    <label className="f-label">{(t?.carvao || "Carvão")} ({t?.unitKg || "€/kg"})</label>
   {/* LINHA 3: CARVÃO - CORRIGIDO */}
{/* LINHA 3: CARVÃO - AGORA A APONTAR PARA O PREÇO/CUSTO */}
<input
  className="f-input"
  type="text"
  inputMode="decimal"
  placeholder="0.00"
  /* AQUI: Mudar de carvaoQty para carvaoCost */
  value={(energyData as any)["carvaoCost"] || ""} 
  onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, "carvaoCost")}
/>
  </div>
  <div>
     <label className="f-label">{(t?.iva || "IVA")} {(t?.carvao || "Carvão")}</label>
<select 
  className="f-input" 
  value={[0.06, 0.13, 0.23].includes(energyData.carvaoIva) ? energyData.carvaoIva : 'outro'} 
  onChange={(e) => {
    const val = e.target.value;
    setEnergyData({...energyData, carvaoIva: val === 'outro' ? -1 : parseFloat(val)});
  }}
>
  <option value={0.23}>23%</option>
  <option value={0.13}>13%</option>
  <option value={0.06}>6%</option>
  <option value="outro">{t?.other || "Outro..."}</option>
</select>



{/* Input de IVA Personalizado do Carvão - VACINADO */}
{(![0.06, 0.13, 0.23].includes(energyData.carvaoIva) || energyData.carvaoIva === -1) && (
  <input 
    className="f-input" 
    style={{ marginTop: '5px', borderColor: '#7b2cbf' }} 
    type="text" 
    inputMode="decimal" 
    placeholder={t?.placeholderOther || "0.00"}
    /* Mudança: Se for -1, mostramos vazio para o placeholder brilhar */
    value={energyData.carvaoIva === -1 ? "" : energyData.carvaoIva} 
    /* Mudança: A nossa função trata do ponto e da vírgula */
    onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, 'carvaoIva')} 
  />
)}
    </div>
  </div>
</div>

    {/* RESUMO DE CUSTOS REAIS REMOVIDO PARA SIMPLIFICAÇÃO - VALORES DISPONÍVEIS NO RELATÓRIO FINAL */}
<div style={{ marginTop: '20px' }}>
  {/* Este espaço vazio garante que o botão de baixo não fique colado aos inputs */}
</div>

     {/* BOTÃO GUARDAR (Linha ~1688) */}
<button 
  className="save-btn"
  style={{ width: '100%', marginTop: '20px' }}
  onClick={() => {
    // 1. Guarda os valores no localStorage para não desaparecerem ao fechar/mudar de aba
    localStorage.setItem('globalEnergyData', JSON.stringify(energyData));
    
    // 2. Fecha o modal
    setShowEnergyModal(false);
    
    // 3. Opcional: Um aviso visual de que está guardado
    console.log("Preços de energia memorizados:", energyData);
  }}
>
  {t?.saveBtn || "GRAVAR DEFINIÇÕES"}
</button>
    </div>
  </div>
)}
          
          

         
        </div>
      </header>

    {/* ── DASHBOARD ── */}
<main className={`app-main ${activeSection === "dashboard" ? "active" : ""}`}>
  <DashboardSection 
    key={`dash-${extras}`} 
    activeRecipes={activeRecipes} 
    semaphore={semaphore} 
    t={t} 
    fmt={fmt} 
    costAlerts={costAlerts} 
    onAjustar={handleReajustar} 
    onManter={handleManter} 
    extras={extras} 
    calc={calc}
  />

{/* REMOVE O DIV COM POSITION FIXED */}
{/* Mantém o botão dentro do fluxo principal da tua página */}

<div style={{ 
  marginTop: '20px',    // Espaçamento natural entre o gráfico e o botão
  display: 'flex',      // Garante que o conteúdo fica centrado
  justifyContent: 'center',
  width: '100%'         // Ocupa a largura toda
}}>
  <button 
    onClick={() => requirePro(() => {})}
    style={{ 
      backgroundColor: '#B2BCBF', 
      color: 'white', 
      padding: '10px 20px', 
      borderRadius: '8px', 
      border: 'none', 
      cursor: 'pointer', 
      fontWeight: 'bold', 
      fontSize: '13px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap'
    }}
  >
    {t.subscribe}
  </button>
</div>
</main>

      {/* ── RECIPES ── */}
     <main 
  key={`list-${extras}-${savedRecipes.length}`} 
  className={`app-main ${activeSection === "recipes" ? "active" : ""}`}
>
  <div className="section-toolbar">
    <div className="recipes-tabs">
      <button 
        className={`recipes-tab ${recipesTab === "all" ? "active" : ""}`} 
        onClick={() => setRecipesTab("all")}
      >
        {t.allRecipes}
      </button>
      <button 
        className={`recipes-tab ${recipesTab === "ranking" ? "active" : ""}`} 
        onClick={() => setRecipesTab("ranking")}
      >
        🏆 {t.ranking}
      </button>
    </div>
    <button 
      className="btn-small btn-load" 
      onClick={() => { clearForm(); setActiveSection("create"); }}
    >
      {t.newItem}
    </button>
  </div>

  {/* ABA: TODAS AS RECEITAS */}
  {recipesTab === "all" && (
    <div className="recipe-list">
      {savedRecipes.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <div>{t.noRecipes}</div>
        </div>
      )}
   {savedRecipes.map((r) => {
  const isActive = r.active !== false;
  const valorDoVizinho = parseFloat(String(extras)) || 0;
  
  // Garantir que os números são números
  const cIngred = parseFloat(r.totalCost as any) || 0;
  const cEnerg = parseFloat((r as any).energyCost) || 0;
  const lucroBase = parseFloat(r.profit as any) || 0;

  // Cálculos
  const custoTotalDinamico = cIngred + cEnerg + valorDoVizinho;
  const lucroRealFinal = lucroBase - valorDoVizinho;

 return (
  <div key={`${r.key}-${valorDoVizinho}`} className={`recipe-item ${!isActive ? "recipe-item-inactive" : ""}`}>
    <div style={{ flex: 1 }}>
<div className="recipe-item-name" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
  {r.name}        {/* valorDoVizinho > 0 && (
    <span style={{ color: 'orange', fontWeight: 'bold' }}> 
      (+{fmt(valorDoVizinho)})
    </span>
  )
*/}
      </div>
      
   <div className="recipe-item-meta">
  {/* 1. Custo Total (Já vem com Ingredientes + Energia + Extras da linha 414) */}
  {t.totalCost}: <strong>
    {fmt(Number(r.totalCost) || 0)}
  </strong>
  
  {" • "} 
  
  {/* 2. Lucro Real (Se o custo subiu e o preço acompanhou, o lucro é o que está gravado) */}
  {t.realProfit}: <strong style={{ color: (Number(r.profit) || 0) > 0 ? "inherit" : "#ff4d4d" }}>
    {fmt(Number(r.profit) || 0)}
  </strong>
</div>
    </div>

    <div className="recipe-item-actions">
      <button 
        className={`toggle-btn ${isActive ? "toggle-on" : "toggle-off"}`} 
        onClick={() => toggleRecipeActive(r.key)}
      >
        {isActive ? t.activeOn : t.activeOff}
      </button>
      <button className="btn-small btn-load" onClick={() => handleLoad(r)}>
        {t.openRecipe}
      </button>
      <button className="btn-small btn-delete" onClick={() => handleDelete(r.key)}>
        ✕
      </button>
    </div>
  </div>
);
})}
    </div>
  )}

  {/* ABA: RANKING */}
  {recipesTab === "ranking" && (
    <div className="recipe-list">
      <div className="ranking-header">{t.rankingProfit} {t.perDose}</div>
      {rankingRecipes.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div>{t.noRecipes}</div>
        </div>
      )}
      {rankingRecipes.map((r, i) => {
        const vExtras = Number(extras) || 0;
        const custoComTudo = (Number(r.totalCost) || 0) + (Number((r as any).energyCost) || 0) + vExtras;
        
        // Mesma lógica de lucro para o ranking bater certo com a lista
        const margemBase = Number(r.profit) || 0;
        const lucroComTudo = (custoComTudo + margemBase) - (Number(r.totalCost) || 0);

        return (
          <div key={r.key} className="recipe-item ranking-item"> 
            <div className="ranking-position">{i + 1}º</div>
            <div style={{ flex: 1 }}>
              <div className="recipe-item-name">{r.name}</div>
              <div className="recipe-item-meta">
                {t.totalCost}: {fmt(custoComTudo)} • {t.realProfit}: <strong>{fmt(lucroComTudo)}</strong>
              </div>
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

       {/* FRYER - Compact single toggle */}
      <div className="fryer-section">
        <button 
          className={`fryer-single-btn ${fryerOn ? "fryer-active" : ""}`}
          onClick={() => setFryerOn(!fryerOn)}
        >
          {t.fryerToggle}
          <span className={`fryer-state-badge ${fryerOn ? "on" : "off"}`}>
            {fryerOn ? "ON" : "OFF"}
          </span>
        </button>

        {fryerOn && (
          <div className="fryer-compact">
            <div className="fryer-oil-info" style={{ marginBottom: "10px" }}>
              {fryerOilItem ? (
                <span style={{ color: "var(--green)" }}>
                  ✅ {t.oilFoundAt} <strong>{fmt(fryerOilItem.price)}</strong>/L
                </span>
              ) : (
                <span style={{ color: "var(--red)" }}>
                  ⚠️ {t.oilNotFound}
                </span>
              )}
            </div>

           <div className="fryer-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
  {/* Campo Óleo (L) */}
  <div className="energy-input-group" style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "8px", 
    background: "rgba(255,255,255,0.03)", 
    padding: "6px 12px", 
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"
  }}>
    <label className="f-label" style={{ margin: 0, fontSize: "11px", color: "#FFFFFF", fontWeight: "600", whiteSpace: "nowrap" }}>
      {t.fryerOilQty}
    </label>
    <input
      className="f-input"
      style={{ background: "transparent", border: "none", textAlign: "right", width: "100%", padding: "2px", color: "#FFFFFF", fontWeight: "600", outline: "none" }}
      type="text"
      inputMode="decimal"
      value={fryerData.oilLiters || ""}
      onChange={(e) => handleGlobalChange(e.target.value, setFryerData, 'oilLiters')}
    />
  </div>

  {/* Campo USO */}
  <div className="energy-input-group" style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "8px", 
    background: "rgba(255,255,255,0.03)", 
    padding: "6px 12px", 
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"
  }}>
    <label className="f-label" style={{ margin: 0, fontSize: "11px", color: "#FFFFFF", fontWeight: "600", whiteSpace: "nowrap" }}>
      {t.fryerUses}
    </label>
    <input
      className="f-input"
      style={{ background: "transparent", border: "none", textAlign: "right", width: "100%", padding: "2px", color: "#FFFFFF", fontWeight: "600", outline: "none" }}
      type="text"
      inputMode="decimal"
      value={fryerData.uses || ""}
      onChange={(e) => handleGlobalChange(e.target.value, setFryerData, 'uses')}
    />
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
  {/* 1. FONTE DE ENERGIA */}
  <div>
    <label className="f-label">{t.energySource}</label>
    <select 
      className="f-input" 
      value={energyData.type}
      onChange={(e) => {
        const val = e.target.value as any;
        let cost = val === "Eletricidade" ? 0 : val === "Gás" ? 0 : 0;
let power = val === "Eletricidade" ? 0 : val === "Gás" ? 0 : 0;
        setEnergyData((p) => ({ ...p, type: val, cost, power }));
      }}
    >
      <option value="Eletricidade">Eletricidade</option>
      <option value="Gás">Gás</option>
      <option value="Carvão">Carvão</option>
    </select>
  </div>

 {/* 2. MINUTOS (Sempre visível para Eletricidade ou Gás) */}
{(energyData.type === "Eletricidade" || energyData.type === "Gás") && (
  <div>
    <label className="f-label">{t.energyMin}</label>
    <input 
      className="f-input" 
      type="text" 
      inputMode="decimal"
      /* VERIFICA ESTA LINHA ABAIXO */
      value={energyData.time === 0 ? "" : energyData.time}
      /* Vacinado! */
      onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, 'time')} 
    />
  </div>
)}

  {/* 3. POTÊNCIA / KG (A terceira janela que estava a falhar) */}
  <div>
    {/* SE FOR ELETRICIDADE: MOSTRA SELECIONADOR OU INPUT MANUAL */}
{energyData.type === "Eletricidade" && (
  <>
    <label className="f-label">Potência (W)</label>
    {Number(energyData.power) !== 1 ? (
      <select 
        className="f-input" 
        value={energyData.power}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "outro") {
            setEnergyData((p) => ({ ...p, power: 1 }));
            setTempPower(""); // Limpa o temporário para começares a escrever
          } else {
            setEnergyData((p) => ({ ...p, power: Number(val) }));
          }
        }}
      >
        {Number(energyData.power) !== 2000 && Number(energyData.power) !== 1 && (
          <option value={energyData.power}>{energyData.power}W</option>
        )}
        <option value={2000}>2000W (Padrão)</option>
        <option value="outro">Outro...</option>
      </select>
    ) : (
      <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
        <input 
          className="f-input" 
          type="text"
          inputMode="decimal"
          autoFocus
          placeholder="Ex: 3000"
          value={tempPower} 
          onChange={(e) => setTempPower(e.target.value.replace(',', '.'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = parseFloat(tempPower);
              if (!isNaN(val)) {
                setEnergyData(prev => ({ ...prev, power: val }));
                (e.target as HTMLInputElement).blur();
              }
            }
          }}
          style={{ flex: 1 }}
        />
        <button 
          type="button"
          onClick={() => {
            const val = parseFloat(tempPower);
            if (!isNaN(val)) setEnergyData(prev => ({ ...prev, power: val }));
          }}
          style={{ backgroundColor: '#22c55e', color: 'white', padding: '0 10px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
        >
          OK
        </button>
        <button 
          type="button"
          onClick={() => {
            setTempPower("");
            setEnergyData((p) => ({ ...p, power: 2000 }));
          }}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}
        >
          ✕
        </button>
      </div>
    )}
  </>
)}

{/* 4. CONSUMO GÁS */}
{energyData.type === "Gás" && (
  <div style={{ marginTop: '10px' }}>
    <label className="f-label">Consumo do Bico (m³/h)</label>
    
    {!energyData.isManual ? (
     <select 
  className="f-input" 
  // Usamos o 'as any' para o TypeScript não reclamar da gaveta
  value={(energyData as any).gasConsumo} 
  onChange={(e) => {
    const val = e.target.value;
    if (val === "outro") {
      setEnergyData((p: any) => ({ ...p, gasConsumo: "" as any, isManual: true }));
    } else {
      setEnergyData((p: any) => ({ ...p, gasConsumo: parseFloat(val), isManual: false }));
    }
  }}
>
  <option value={0.6}>0.6 m³/h (Padrão)</option>
  <option value={0.4}>0.4 m³/h (Pequeno)</option>
  <option value={1.2}>1.2 m³/h (Industrial)</option>
  <option value="outro">Outro (Manual)...</option>
  
  {/* No check final, também usamos o cast para 'any' */}
  {![0.6, 0.4, 1.2].includes(Number((energyData as any).gasConsumo)) && (
      <option value={(energyData as any).gasConsumo}>{(energyData as any).gasConsumo} m³/h</option>
  )}
</select>
    ) : (
      <div style={{ position: 'relative', display: 'flex', gap: '5px' }}>
        <input 
          className="f-input"
          type="text"
          inputMode="decimal"
          autoFocus
          placeholder="Ex: 0.45"
          value={energyData.power || ""}
          onChange={(e) => {
            const val = e.target.value.replace(',', '.');
            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
              // 🟢 ATUALIZA O VALOR MAS MANTÉM isManual: true
              setEnergyData(p => ({ ...p, power: val as any, isManual: true }));
            }
          }}
        />
        {/* 🟢 BOTÃO PARA SAIR DO MODO MANUAL */}
        <button 
          onClick={() => setEnergyData(p => ({ ...p, isManual: false }))}
          style={{ padding: '0 10px', background: '#4CAF50', color: 'white', borderRadius: '5px', border: 'none' }}
        >
          OK
        </button>
      </div>
    )}
  </div>
)}

{/* SE FOR CARVÃO: QUANTIDADE (GAVETA carvaoQty) */}
{energyData.type === "Carvão" && (
  <div className="energy-row" style={{ display: 'flex', gap: '10px', marginTop: '0px' }}>
    <div style={{ flex: 1 }}>
      <label className="f-label">{t.energyKg || "KG USADOS"}</label>
      <input
        className="f-input"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        style={{ textAlign: 'center' }}
        /* Aqui é o segredo: carvaoQty e NÃO carvaoCost */
        value={(energyData as any).carvaoQty || ""}
        onChange={(e) => handleGlobalChange(e.target.value, setEnergyData, "carvaoQty")}
      />
    </div>
  </div>
)}
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
  type="text" 
  inputMode="decimal" 
  placeholder="0.00"
  value={extras === 0 ? "0" : (extras || "")}
  onChange={(e) => {
    const val = e.target.value.replace(',', '.');
    setExtras(val as any)
  }}
/>
</div>
          <div className="engine-box input-box">
  <div className="engine-box-label">{t.marginPct}</div>
  <input 
    className="engine-box-input" 
    type="text" 
    inputMode="decimal" 
    value={margin || ""} 
    placeholder="0"
    /* Forçamos o 'as any' aqui para o TypeScript aceitar a vacina sem erro */
    onChange={(e) => handleGlobalChange(e.target.value, setMargin as any)} 
  />
</div>

<div className="engine-box output-box">
  <div className="engine-box-label">{t.totalCost}</div>
  <div className="engine-box-value">{fmt(calc.totalCost)}</div>
</div>

<div className="engine-box output-box">
  <div className="engine-box-label">{t.objetivo}</div>
  <div className="engine-box-value">{fmt(calc.objetivo)}</div>
</div>
          <div className="engine-box input-box">
  <div className="engine-box-label">{t.myPrice}</div>
  <input 
    className="engine-box-input" 
    type="text" 
    inputMode="decimal" 
    value={sellPrice || ""} 
    placeholder="0.00"
    /* Vacinado e sem erro de tipo */
    onChange={(e) => handleGlobalChange(e.target.value, setSellPrice as any)} 
  />
</div>

<div className="engine-box input-box">
  <div className="engine-box-label">{t.lossBreak}</div>
  <input 
    className="engine-box-input" 
    type="text" 
    inputMode="decimal" 
    value={loss || ""} 
    placeholder="0"
    /* Vacinado e sem erro de tipo */
    onChange={(e) => handleGlobalChange(e.target.value, setLoss as any)} 
  />
</div>

<div className="engine-box highlight-box">
  <div className="engine-box-label">{t.realProfit}</div>
  <div className="engine-box-value" style={{ 
    color: calc.lucroReal >= 0 ? "white" : "#ff4d4d", 
    fontSize: 26, 
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
                <span style={{ color: "var(--red)", fontWeight: 700 }}>-{fmt(calc.comissaoUberTotal)}</span>
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
    <input 
      className="f-input" 
      type="text" 
      placeholder={t.ingredient} 
      value={item.name}
      onChange={(e) => updateWarehouseDraft(item.id, "name", e.target.value)} 
    />
    
    <select 
      className="f-input" 
      value={item.unit}
      onChange={(e) => updateWarehouseDraft(item.id, "unit", e.target.value)}
    >
      <option value="KG">KG</option>
      <option value="L">L</option>
      <option value="UN">UN</option>
      <option value="DZ">DZ</option>
    </select>

    {/* INPUT VACINADO AQUI: Preço do Produto */}
    <input 
      className="f-input" 
      type="text" 
      inputMode="decimal"
      placeholder={currency} 
      style={{ textAlign: "right" }}
      /* Garante que o zero aparece e o ponto decimal não foge */
      value={item.price === 0 ? "0" : (item.price || "")} 
      onChange={(e) => {
        const val = e.target.value.replace(',', '.');
        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
          // O 'as any' silencia o erro do TypeScript e mantém o ponto
          updateWarehouseDraft(item.id, "price", val as any);
        }
      }} 
    />

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

{/* CORREÇÃO: Mudamos toFixed(0) para permitir decimais e usamos o valor real no value */}
{![0.23, 0.13, 0.06, 0].some(v => Math.abs(v - item.iva) < 0.001) && (
  <option value={item.iva}>
    {Number((item.iva * 100).toFixed(2))}%
  </option>
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
<div className="settings-group" style={{ paddingBottom: "20px", display: "block", height: "auto", minHeight: "250px", overflow: "visible" }}>
  <div className="settings-title">{t.ivaTotal}</div>
  
  {/* IVA Ingredientes */}
  <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px" }}>
    <span style={{ color: '#ffffff' }}>{t.ivaIngredients}</span>
    <span className="settings-value">{fmt(allRecipesIva ? allRecipesIva.ing : (calc.ivaIngredientes || 0))}</span>
  </div>

  {/* IVA Energia */}
  <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px" }}>
    <span style={{ color: '#ffffff' }}>{t.ivaEnergy}</span>
    <span className="settings-value">{fmt(allRecipesIva ? allRecipesIva.energy : (calc.ivaEnergy || 0))}</span>
  </div>

  {/* IVA TOTAL (Soma final limpa) */}
  <div className="settings-row" style={{ borderTop: "1px solid rgba(196,167,120,0.3)", display: "flex", justifyContent: "space-between", padding: "15px 16px" }}>
    <span style={{ fontWeight: 800, color: '#ffffff' }}>{t.ivaTotal}</span>
    <span className="settings-value" style={{ fontSize: 15 }}>{fmt(ivaTotal)}</span>
  </div>
</div>
        

        {/* 1. Contentor com Scroll Solto */}
        
{/* 1. Contentor com Scroll - Mantém o Footer fixo e permite deslizar o meio */}
<div className="flex-1 px-4 pb-[150px]" style={{ height: '100%', overflowY: 'auto' }}>
  
  {/* 2. Espaçamento do topo reduzido para 40px para os dois blocos caberem */}
  <div className="space-y-6" style={{ paddingTop: '20px' }}>
    
    {/* --- BLOCO EXPORTAR / BACKUP --- */}
    <div className="settings-group" style={{ marginTop: '0px' }}> 
      <div className="settings-title">📁 EXPORTAR / BACKUP</div>
      
      <select 
  className="settings-action" 
  onChange={(e) => {
    const val = e.target.value;
    if (val === "recipes") handleExportRecipesJson(); // Era 'pdf'
    else if (val === "warehouse") handleExportWarehouseJson();
    else if (val === "iva") handleExportIvaJson();
    else if (val === "backup") handleExportBackupJson(); // Era 'json_exp'
    else if (val === "import") document.getElementById('file-import-input')?.click();
    e.target.value = "";
  }}
>
  <option value="">{t.options || "Opções"}</option>
  <option value="recipes">{t.exportRecipes || "Exportar Receitas"}</option>
  <option value="warehouse">{t.exportWarehouse || "Exportar Armazém"}</option>
  <option value="iva">{t.exportIva || "Exportar IVA"}</option>
  <option value="backup">{t.exportBackup || "Exportar Backup"}</option>
  <option value="import">{t.importData || "Importar Dados"}</option>
</select>

      <input 
        id="file-import-input"
        type="file" 
        accept=".json" 
        style={{ display: "none" }} 
        onChange={handleImport}
      />
    </div>

    {/* --- BLOCO DADOS (APAGAR) --- */}
    <div className="settings-group" style={{ 
      marginTop: '20px', 
      border: '1px solid rgba(255,0,0,0.4)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)' 
    }}>
      <div className="settings-title" style={{ fontSize: '14px', color: "white" }}>
        ⚠️ {t.data || "Dados"}
      </div>
      <button 
        className="settings-action settings-action-danger" 
        onClick={() => setShowDeleteAllModal(true)}
      >
        {t.deleteAll}
      </button>
    </div>

    {/* --- VERSÃO NO FUNDO --- */}
    <div style={{ textAlign: 'center', opacity: 0.2, fontSize: '10px', marginTop: '20px' }}>
      Chef Margin Pro - v3.0
    </div>

  </div> {/* FECHA o space-y-6 */}
</div> {/* FECHA o flex-1 */}

{/* --- O ESPAÇO ABAIXO FICOU VAZIO PORQUE MOVESTE OS DADOS PARA CIMA --- */}
</main>

{/* --- BLOCO DE IMPRESSÃO EM MASSA (Invisível no ecrã) --- */}
      <div className="print-only-area">
        {false && savedRecipes.map((recipe, index) => (
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

      
{/* O seletor só aparece se a aba ativa for o dashboard/principal */}
{activeSection === 'dashboard' && (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'flex-end', 
    padding: '10px 20px',
    marginTop: '10px' 
  }}>
    <select 
      value={lang} 
      onChange={(e) => setLangSave(e.target.value as Lang)}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        background: '#2d2d2d',
        color: '#fff',
        border: '1px solid #444',
        cursor: 'pointer'
      }}
    >
      {(['PT', 'ES', 'FR', 'EN'] as Lang[]).map((l) => (
        <option key={l} value={l} style={{ background: '#2d2d2d' }}>{l}</option>
      ))}
    </select>
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