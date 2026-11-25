'use client'

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  CookingPot,
  GlassWater,
  History,
  IceCreamBowl,
  Leaf,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Snowflake,
  Sparkles,
  Trash2,
  Wheat,
  X,
} from "lucide-react";
import {
  createPantryItemAction,
  deletePantryItemAction,
  logoutAction,
  recordOutcomeAction,
  undoOutcomeAction,
  updateOutcomeAction,
  updatePantryItemAction,
  updatePreferencesAction,
} from "./actions";

const day = 86400000;
const fromNow = (offset) => new Date(Date.now() + offset * day).toISOString();

const quickProducts = [
  { name: "Latte fresco", days: 5, place: "Frigo", icon: GlassWater, tone: "blue" },
  { name: "Pane integrale", days: 4, place: "Dispensa", icon: Wheat, tone: "sand" },
  { name: "Mozzarella", days: 3, place: "Frigo", icon: IceCreamBowl, tone: "cream" },
  { name: "Yogurt bianco", days: 8, place: "Frigo", icon: GlassWater, tone: "rose" },
  { name: "Spinaci", days: 4, place: "Frigo", icon: Leaf, tone: "green" },
  { name: "Pasta corta", days: 365, place: "Dispensa", icon: Package, tone: "yellow" },
  { name: "Uova", days: 14, place: "Frigo", icon: IceCreamBowl, tone: "cream" },
  { name: "Riso", days: 365, place: "Dispensa", icon: Package, tone: "yellow" },
  { name: "Zucchine", days: 6, place: "Frigo", icon: Leaf, tone: "green" },
  { name: "Pomodori", days: 5, place: "Frigo", icon: Leaf, tone: "rose" },
  { name: "Patate", days: 20, place: "Dispensa", icon: Package, tone: "sand" },
  { name: "Banane", days: 5, place: "Dispensa", icon: Leaf, tone: "yellow" },
];

const storagePlaces = [
  { label: "Frigo", icon: IceCreamBowl },
  { label: "Dispensa", icon: Package },
  { label: "Freezer", icon: Snowflake },
];

const recipes = [
  {
    id: 1,
    title: "Pasta cremosa agli spinaci",
    time: "20 min",
    required: ["pasta", "spinaci", "latte"],
    ingredients: "Spinaci · Pasta corta · Latte",
    ingredientList: ["160 g di pasta corta", "150 g di spinaci", "100 ml di latte", "Olio, sale e pepe"],
    note: "Usa 3 ingredienti che hai già",
    servings: "2 persone",
    steps: [
      "Cuoci la pasta in acqua salata e conserva mezzo bicchiere di acqua di cottura.",
      "Salta gli spinaci con un filo d’olio, poi aggiungi il latte e frulla fino a ottenere una crema.",
      "Scola la pasta, uniscila alla crema e manteca per un minuto con poca acqua di cottura.",
    ],
    image: "https://images.unsplash.com/photo-1597393353415-b3730f3719fe?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Pasta cremosa con spinaci e formaggio",
  },
  {
    id: 2,
    title: "Pane tostato, yogurt e erbe",
    time: "10 min",
    required: ["pane", "yogurt"],
    ingredients: "Pane integrale · Yogurt bianco",
    ingredientList: ["4 fette di pane integrale", "1 vasetto di yogurt bianco", "Erbe aromatiche", "Olio, sale e pepe"],
    note: "Puoi farla con quello che hai",
    servings: "2 persone",
    steps: [
      "Tosta il pane in padella o in forno finché diventa dorato e croccante.",
      "Condisci lo yogurt con olio, sale, pepe e le erbe aromatiche che hai a disposizione.",
      "Distribuisci la crema di yogurt sul pane caldo e servi subito.",
    ],
    image: "https://images.unsplash.com/photo-1640209426155-e99de3a39fb9?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Pane tostato con crema e guarnizione di erbe",
  },
  {
    id: 3,
    title: "Bruschette filanti alla mozzarella",
    time: "12 min",
    required: ["pane", "mozzarella"],
    ingredients: "Pane integrale · Mozzarella",
    ingredientList: ["4 fette di pane integrale", "125 g di mozzarella", "Olio extravergine", "Erbe aromatiche"],
    note: "Salva pane e mozzarella in una volta",
    servings: "2 persone",
    steps: [
      "Taglia il pane a fette e tostalo per qualche minuto in padella o in forno.",
      "Aggiungi la mozzarella ben scolata e un pizzico di erbe aromatiche.",
      "Rimetti al caldo finché la mozzarella si scioglie, poi completa con un filo d’olio.",
    ],
    image: "https://images.unsplash.com/photo-1708980108318-4b843e243080?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Bruschette con mozzarella, pomodoro e basilico",
  },
  {
    id: 4,
    title: "Pasta filante alla mozzarella",
    time: "18 min",
    required: ["pasta", "mozzarella", "latte"],
    ingredients: "Pasta corta · Mozzarella · Latte",
    ingredientList: ["160 g di pasta corta", "125 g di mozzarella", "80 ml di latte", "Olio, sale e pepe"],
    note: "Usa 3 ingredienti che hai già",
    servings: "2 persone",
    steps: [
      "Cuoci la pasta al dente e conserva poca acqua di cottura.",
      "Scalda il latte a fuoco dolce e aggiungi la mozzarella a pezzetti.",
      "Unisci la pasta e manteca fino a ottenere una consistenza cremosa e filante.",
    ],
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Pasta corta con salsa cremosa al formaggio",
  },
  {
    id: 5,
    title: "Frittata morbida agli spinaci",
    time: "15 min",
    required: ["uova", "spinaci"],
    ingredients: "Uova · Spinaci",
    ingredientList: ["4 uova", "150 g di spinaci", "Olio extravergine", "Sale e pepe"],
    note: "Usa gli spinaci prima che perdano freschezza",
    servings: "2 persone",
    steps: [
      "Salta gli spinaci in padella con poco olio finché diventano morbidi.",
      "Sbatti le uova con sale e pepe, poi versale sugli spinaci.",
      "Cuoci a fuoco dolce con il coperchio e gira la frittata a metà cottura.",
    ],
    image: "https://images.unsplash.com/photo-1677844592730-ce9c936d8f1a?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Frittata con spinaci ed erbe verdi",
  },
  {
    id: 6,
    title: "Risotto semplice ai piselli",
    time: "28 min",
    required: ["riso", "piselli"],
    ingredients: "Riso · Piselli",
    ingredientList: ["160 g di riso", "150 g di piselli", "Brodo o acqua calda", "Olio, sale e pepe"],
    note: "Una cena calda con due ingredienti",
    servings: "2 persone",
    steps: [
      "Tosta il riso in casseruola con un filo d’olio per un paio di minuti.",
      "Aggiungi i piselli e versa il brodo caldo poco alla volta, mescolando.",
      "Porta a cottura e manteca fuori dal fuoco con olio e pepe.",
    ],
    image: "https://images.unsplash.com/photo-1682944625832-fd710e15b190?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Risotto cremoso con piselli",
  },
  {
    id: 7,
    title: "Pasta veloce alle zucchine",
    time: "20 min",
    required: ["pasta", "zucchin"],
    ingredients: "Pasta corta · Zucchine",
    ingredientList: ["160 g di pasta corta", "2 zucchine", "Olio extravergine", "Sale, pepe ed erbe"],
    note: "Pronta mentre cuoce la pasta",
    servings: "2 persone",
    steps: [
      "Taglia le zucchine sottili e saltale in padella con olio e sale.",
      "Cuoci la pasta e conserva poca acqua di cottura.",
      "Unisci la pasta alle zucchine e manteca con l’acqua tenuta da parte.",
    ],
    image: "https://images.unsplash.com/photo-1720931782210-4ffd1f836b63?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Piatto di pasta con zucchine",
  },
  {
    id: 8,
    title: "Caprese classica",
    time: "8 min",
    required: ["mozzarella", "pomodor"],
    ingredients: "Mozzarella · Pomodori",
    ingredientList: ["250 g di mozzarella", "2 pomodori maturi", "Olio extravergine", "Sale, pepe e basilico"],
    note: "Fresca, semplice e senza cottura",
    servings: "2 persone",
    steps: [
      "Scola bene la mozzarella e tagliala a fette regolari.",
      "Affetta i pomodori e alternali alla mozzarella nel piatto.",
      "Condisci con olio, sale, pepe e le erbe aromatiche disponibili.",
    ],
    image: "https://images.unsplash.com/photo-1676300185089-8781af127fee?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Insalata caprese con pomodoro e mozzarella",
  },
  {
    id: 9,
    title: "Patate e piselli in padella",
    time: "30 min",
    required: ["patat", "piselli"],
    ingredients: "Patate · Piselli",
    ingredientList: ["400 g di patate", "150 g di piselli", "Olio extravergine", "Sale, pepe e rosmarino"],
    note: "Un piatto unico con ciò che hai",
    servings: "2 persone",
    steps: [
      "Taglia le patate a cubetti piccoli e sciacquale sotto l’acqua.",
      "Cuocile in padella con olio e coperchio, mescolando ogni tanto.",
      "Aggiungi i piselli negli ultimi dieci minuti e completa con le erbe.",
    ],
    image: "https://images.unsplash.com/photo-1601579112521-5d6badb0bf3c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Piatto di patate e piselli cotti in padella",
  },
  {
    id: 10,
    title: "Coppa di yogurt e banana",
    time: "5 min",
    required: ["yogurt", "banan"],
    ingredients: "Yogurt bianco · Banane",
    ingredientList: ["2 vasetti di yogurt bianco", "1 banana matura", "Cannella facoltativa", "Frutta secca facoltativa"],
    note: "Usa subito la frutta più matura",
    servings: "2 persone",
    steps: [
      "Distribuisci lo yogurt in due ciotole.",
      "Taglia la banana a rondelle e sistemala sopra lo yogurt.",
      "Completa, se li hai, con cannella o un po’ di frutta secca.",
    ],
    image: "https://images.unsplash.com/photo-1598259298632-e785684cfa90?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Ciotola di yogurt con banana e frutta",
  },
  {
    id: 11,
    title: "Risotto cremoso alle zucchine",
    time: "28 min",
    required: ["riso", "zucchin"],
    ingredients: "Riso · Zucchine",
    ingredientList: ["160 g di riso", "2 zucchine", "Brodo o acqua calda", "Olio, sale e pepe"],
    note: "Una combinazione semplice e delicata",
    servings: "2 persone",
    steps: [
      "Taglia le zucchine a rondelle sottili e falle ammorbidire in casseruola con poco olio.",
      "Aggiungi il riso, tostalo per due minuti e versa il brodo caldo poco alla volta.",
      "Porta a cottura mescolando e completa con pepe e un filo d’olio.",
    ],
    image: "/recipes/risotto-zucchine.webp",
    imageAlt: "Risotto cremoso con rondelle di zucchine",
  },
  {
    id: 12,
    title: "Frittata rustica di patate",
    time: "30 min",
    required: ["patat", "uova"],
    ingredients: "Patate · Uova",
    ingredientList: ["400 g di patate", "4 uova", "Olio extravergine", "Sale, pepe ed erbe"],
    note: "Trasforma due ingredienti in un piatto unico",
    servings: "2 persone",
    steps: [
      "Taglia le patate a fettine sottili e cuocile in padella con poco olio e il coperchio.",
      "Sbatti le uova con sale, pepe ed erbe, poi versale sulle patate morbide.",
      "Cuoci a fuoco dolce, gira la frittata e termina la doratura dall’altro lato.",
    ],
    image: "/recipes/frittata-patate.webp",
    imageAlt: "Frittata dorata con patate in una padella",
  },
  {
    id: 13,
    title: "Pasta al pomodoro e mozzarella",
    time: "22 min",
    required: ["pasta", "pomodor", "mozzarella"],
    ingredients: "Pasta corta · Pomodori · Mozzarella",
    ingredientList: ["160 g di pasta corta", "2 pomodori maturi", "125 g di mozzarella", "Olio, sale e basilico"],
    note: "Usa insieme tre ingredienti freschi",
    servings: "2 persone",
    steps: [
      "Taglia i pomodori e cuocili in padella con olio e sale fino a ottenere un sugo veloce.",
      "Cuoci la pasta al dente, scolala e saltala per un minuto nel sugo.",
      "Spegni il fuoco, aggiungi la mozzarella a pezzetti e mescola finché diventa filante.",
    ],
    image: "/recipes/pasta-pomodoro-mozzarella.webp",
    imageAlt: "Pasta corta con pomodoro, mozzarella e basilico",
  },
  {
    id: 14,
    title: "Pane tostato con uova e pomodoro",
    time: "15 min",
    required: ["pane", "uova", "pomodor"],
    ingredients: "Pane integrale · Uova · Pomodori",
    ingredientList: ["4 fette di pane integrale", "3 uova", "2 pomodori", "Olio, sale e pepe"],
    note: "Una cena veloce con quello che hai",
    servings: "2 persone",
    steps: [
      "Tosta il pane in padella o in forno finché diventa croccante.",
      "Cuoci le uova strapazzate a fuoco dolce, lasciandole morbide.",
      "Distribuisci le uova sul pane e completa con pomodori a cubetti, olio e pepe.",
    ],
    image: "/recipes/pane-uova-pomodoro.webp",
    imageAlt: "Pane tostato con uova morbide e pomodoro fresco",
  },
];

function daysUntil(date) {
  return Math.ceil((new Date(date).setHours(23, 59, 59, 999) - Date.now()) / day);
}

function expiryCopy(date) {
  const days = daysUntil(date);
  if (days < 0) return `Scaduto ${Math.abs(days) === 1 ? "ieri" : `${Math.abs(days)} giorni fa`}`;
  if (days === 0) return "Scade oggi";
  if (days === 1) return "Scade domani";
  return `Scade tra ${days} giorni`;
}

function dateInputValue(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

function formatChosenDate(value) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function normalizeIngredient(value) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasIngredient(products, ingredient) {
  const target = normalizeIngredient(ingredient);
  return products.some((product) => normalizeIngredient(product.name).includes(target));
}

const iconMap = {
  glass: GlassWater,
  wheat: Wheat,
  bowl: IceCreamBowl,
  leaf: Leaf,
  package: Package,
  snowflake: Snowflake,
};

function iconKeyFor(icon) {
  if (icon === GlassWater) return "glass";
  if (icon === Wheat) return "wheat";
  if (icon === IceCreamBowl) return "bowl";
  if (icon === Leaf) return "leaf";
  if (icon === Snowflake) return "snowflake";
  return "package";
}

function hydrateProduct(item) {
  return {
    id: item.id,
    name: item.name,
    place: item.place,
    expires: item.expiresAt,
    meta: item.quantity || "Quantità non indicata",
    iconKey: item.iconKey,
    icon: iconMap[item.iconKey] || Package,
    tone: item.tone,
  };
}

function hydrateEvent(event) {
  return {
    id: event.id,
    name: event.productName,
    action: event.outcome === "saved" ? "Salvato" : "Buttato",
    date: new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" }).format(
      new Date(event.occurredAt),
    ),
    occurredAt: event.occurredAt,
  };
}

function ProductIcon({ product, size = "normal" }) {
  const Icon = product.icon || Package;
  return (
    <div className={`product-icon ${product.tone || "cream"} ${size}`}>
      <Icon strokeWidth={1.7} />
    </div>
  );
}

function App({ currentUser, initialEvents, initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(() => initialProducts.map(hydrateProduct));
  const userName = currentUser.name;
  const [onboardingStep, setOnboardingStep] = useState(
    initialProducts.length === 0 ? "start" : null,
  );
  const [tab, setTab] = useState("pantry");
  const [filter, setFilter] = useState("Tutti");
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [expiryDraft, setExpiryDraft] = useState("");
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [quantityDraft, setQuantityDraft] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [pendingProduct, setPendingProduct] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sessionAdded, setSessionAdded] = useState([]);
  const [toast, setToast] = useState(null);
  const [alertDays, setAlertDays] = useState(currentUser.alertDays);
  const [dailyLimit, setDailyLimit] = useState(currentUser.dailyLimit);
  const [quietHours, setQuietHours] = useState(currentUser.quietHours);
  const [notificationPermission, setNotificationPermission] = useState("unknown");
  const [history, setHistory] = useState(() => initialEvents.map(hydrateEvent));

  const alertThreshold = Number(alertDays) || 2;
  const alertProducts = useMemo(
    () => [...products]
      .filter((product) => daysUntil(product.expires) <= alertThreshold)
      .sort((a, b) => new Date(a.expires) - new Date(b.expires)),
    [products, alertThreshold],
  );
  const urgentCount = alertProducts.length;
  const savedCount = history.filter((item) => item.action === "Salvato").length;
  const filteredProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => new Date(a.expires) - new Date(b.expires));
    if (filter === "Tutti") return sorted;
    if (filter === "In scadenza") return sorted.filter((product) => daysUntil(product.expires) <= alertThreshold);
    return sorted.filter((product) => product.place === filter);
  }, [products, filter, alertThreshold]);

  const quickResults = quickProducts.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    setNotificationPermission(
      "Notification" in window ? window.Notification.permission : "unsupported",
    );
  }, []);

  useEffect(() => {
    if (notificationPermission !== "granted" || alertProducts.length === 0) return;
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    if (quietHours && (hour >= 22.5 || hour < 7)) return;

    const today = dateInputValue(now);
    alertProducts.forEach((product) => {
      const sessionKey = `dispensa-notification-session:${product.id}:${today}`;
      const dailyKey = `dispensa-notification-day:${product.id}`;
      if (window.sessionStorage.getItem(sessionKey)) return;
      if (dailyLimit && window.localStorage.getItem(dailyKey) === today) return;

      const notification = new window.Notification(`Scadenza: ${product.name}`, {
        body: `${expiryCopy(product.expires)} · ${product.place}`,
        tag: `dispensa-expiry-${product.id}`,
      });
      notification.onclick = () => window.focus();
      window.sessionStorage.setItem(sessionKey, "sent");
      if (dailyLimit) window.localStorage.setItem(dailyKey, today);
    });
  }, [alertProducts, dailyLimit, notificationPermission, quietHours]);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  }

  async function addProduct(item) {
    if (!selectedPlace) {
      setToast({ type: "duplicate", message: "Scegli Frigo, Dispensa o Freezer." });
      return;
    }
    const existing = products.find(
      (product) => product.name.toLowerCase() === item.name.toLowerCase(),
    );
    if (existing || sessionAdded.includes(item.name)) {
      setToast({ type: "duplicate", message: `${item.name} è già in dispensa.` });
      return;
    }
    const expires = expiryDate
      ? new Date(`${expiryDate}T12:00:00`).toISOString()
      : fromNow(item.days);
    const result = await createPantryItemAction({
      name: item.name,
      quantity: quantity.trim(),
      place: selectedPlace,
      expiresAt: expires,
      iconKey: iconKeyFor(item.icon),
      tone: item.tone,
    });
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    const product = hydrateProduct(result.data);
    setProducts((current) => [...current, product]);
    setSessionAdded((current) => [...current, item.name]);
    setToast({
      type: "added",
      message: `${item.name} aggiunto${quantity.trim() ? ` · ${quantity.trim()}` : ""} · ${expiryCopy(expires).toLowerCase()}`,
      product,
    });
    setQuantity("");
    setExpiryDate("");
    setPendingProduct(null);
    setSelectedPlace(null);
    setQuery("");
    setFilter("Tutti");
  }

  async function undoAdd() {
    if (toast?.product) {
      const result = await deletePantryItemAction(String(toast.product.id));
      if (!result.ok) {
        setToast({ type: "duplicate", message: result.error });
        return;
      }
      setProducts((current) => current.filter((product) => product.id !== toast.product.id));
      setSessionAdded((current) => current.filter((name) => name !== toast.product.name));
    }
    setToast(null);
  }

  async function markProduct(product, action) {
    const outcome = action === "Salvato" ? "saved" : "wasted";
    const result = await recordOutcomeAction(String(product.id), product.name, outcome);
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    const event = hydrateEvent(result.data);
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setHistory((current) => [
      { ...event, date: "Adesso" },
      ...current,
    ]);
    setSelected(null);
    setToast({ type: "outcome", message: `${product.name}: ${action.toLowerCase()}.`, product, action, outcomeId: event.id });
  }

  async function undoOutcome() {
    const product = toast?.product;
    if (!product) return;
    const result = await undoOutcomeAction({
      name: product.name,
      quantity: product.meta === "Quantità non indicata" ? "" : product.meta,
      place: product.place,
      expiresAt: product.expires,
      iconKey: product.iconKey || iconKeyFor(product.icon),
      tone: product.tone,
    }, String(toast.outcomeId));
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    setProducts((current) => [...current, hydrateProduct(result.data)]);
    setHistory((current) => current.filter((item) => item.id !== toast.outcomeId));
    setToast(null);
  }

  function closeAdd() {
    setAddOpen(false);
    setQuery("");
    setQuantity("");
    setExpiryDate("");
    setPendingProduct(null);
    setSelectedPlace(null);
    setSessionAdded([]);
    setFilter("Tutti");
  }

  function openProduct(product) {
    setEditingExpiry(false);
    setExpiryDraft(dateInputValue(product.expires));
    setEditingQuantity(false);
    setQuantityDraft(product.meta === "Quantità non indicata" ? "" : product.meta);
    setSelected(product);
  }

  async function saveExpiry() {
    if (!expiryDraft || !selected) return;
    const expires = new Date(`${expiryDraft}T12:00:00`).toISOString();
    const result = await updatePantryItemAction(String(selected.id), { expiresAt: expires });
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    const updated = hydrateProduct(result.data);
    setSelected(updated);
    setProducts((current) =>
      current.map((product) => product.id === selected.id ? updated : product),
    );
    setEditingExpiry(false);
    setToast({ type: "info", message: `Scadenza di ${selected.name} aggiornata.` });
  }

  async function saveQuantity() {
    if (!selected) return;
    const meta = quantityDraft.trim() || "Quantità non indicata";
    const result = await updatePantryItemAction(String(selected.id), {
      quantity: meta === "Quantità non indicata" ? "" : meta,
    });
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    const updated = hydrateProduct(result.data);
    setSelected(updated);
    setProducts((current) =>
      current.map((product) => product.id === selected.id ? updated : product),
    );
    setEditingQuantity(false);
    setToast({ type: "info", message: `Quantità di ${selected.name} aggiornata.` });
  }

  async function savePreferences() {
    const result = await updatePreferencesAction({ alertDays, dailyLimit, quietHours });
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    setSettingsOpen(false);
    setToast({
      type: "info",
      message: `Preferenze salvate · avviso ${alertDays === "1" ? "1 giorno" : `${alertDays} giorni`} prima.`,
    });
  }

  async function correctOutcome(item) {
    const nextAction = item.action === "Salvato" ? "Buttato" : "Salvato";
    const result = await updateOutcomeAction(
      String(item.id),
      nextAction === "Salvato" ? "saved" : "wasted",
    );
    if (!result.ok) {
      setToast({ type: "duplicate", message: result.error });
      return;
    }
    setHistory((current) =>
      current.map((entry) => entry.id === item.id ? { ...entry, action: nextAction } : entry),
    );
    setToast({ type: "info", message: `Esito di ${item.name} aggiornato.` });
  }

  async function signOut() {
    await logoutAction();
    router.refresh();
  }

  return (
    <div className="app-shell">
      {onboardingStep && (
        <div className="onboarding">
          <section className="onboarding-card" aria-live="polite">
            <div className="onboarding-copy">
              <div className="brand">
                <span className="brand-mark"><Leaf /></span>
                <span>dispensa</span>
              </div>

              <div className="start-step">
                <p className="eyebrow">Piacere, {userName}</p>
                <h1>La tua dispensa parte da qui.</h1>
                <p>Il tuo account è pronto. Inserisci ciò che hai in casa e lo ritroverai anche al prossimo accesso.</p>
                <div className="onboarding-benefits">
                  <span><Clock3 /><small>Scadenze sotto controllo</small></span>
                  <span><CookingPot /><small>Ricette con ciò che hai</small></span>
                  <span><Leaf /><small>Dati salvati nel tuo account</small></span>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setOnboardingStep(null);
                    setAddOpen(true);
                  }}
                >
                  <Plus /> Aggiungi il primo prodotto
                </button>
              </div>
            </div>
            <aside className="onboarding-visual" aria-hidden="true">
              <div className="visual-orbit orbit-one"><Package /></div>
              <div className="visual-orbit orbit-two"><Clock3 /></div>
              <div className="visual-orbit orbit-three"><CookingPot /></div>
              <div className="visual-center"><Leaf /></div>
              <p>Quello che hai.<br />Prima che scada.</p>
            </aside>
          </section>
        </div>
      )}

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Leaf /></span>
          <span>dispensa</span>
        </div>

        <nav className="side-nav" aria-label="Navigazione principale">
          <NavButton icon={Package} label="La mia dispensa" active={tab === "pantry"} onClick={() => setTab("pantry")} />
          <NavButton icon={CookingPot} label="Cucina ora" active={tab === "cook"} onClick={() => setTab("cook")} />
          <NavButton icon={History} label="Cibi salvati" active={tab === "saved"} onClick={() => setTab("saved")} />
        </nav>

        <div className="impact-card">
          <div className="impact-icon"><Sparkles /></div>
          <p className="eyebrow">Questo mese</p>
          <strong>{savedCount} {savedCount === 1 ? "cibo salvato" : "cibi salvati"}</strong>
          <p>{savedCount ? "Piccoli gesti, meno sprechi." : "Qui vedrai il tuo impatto."}</p>
          <div className="impact-track"><span style={{ width: `${Math.min(100, savedCount * 8)}%` }} /></div>
        </div>

        <button className="profile-button" onClick={() => setSettingsOpen(true)}>
          <span className="avatar">{userName.slice(0, 1).toUpperCase()}</span>
          <span><strong>Casa di {userName}</strong><small>{currentUser.email}</small></span>
          <Settings2 />
        </button>
      </aside>

      <main className="main">
        <header className="mobile-header">
          <div className="brand"><span className="brand-mark"><Leaf /></span><span>dispensa</span></div>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Apri impostazioni"><Settings2 /></button>
        </header>

        {tab === "pantry" && (
          <section className="page">
            <div className="page-heading">
              <div>
                <p className="eyebrow">Martedì, 17 novembre</p>
                <h1>Buongiorno, {userName}.</h1>
                <p className="subtitle">Ecco cosa usare per primo nella tua dispensa.</p>
              </div>
              <div className="header-actions">
                <button
                  className="icon-button notification-button"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Apri notifiche"
                >
                  <Bell />{urgentCount > 0 && <span />}
                </button>
                <button className="primary-button" onClick={() => setAddOpen(true)}><Plus /> Aggiungi cibo</button>
              </div>
            </div>

            <button className="expiry-banner" onClick={() => setFilter(filter === "In scadenza" ? "Tutti" : "In scadenza")}>
              <span className="banner-icon"><Clock3 /></span>
              <span>
                <small>Da usare presto</small>
                <strong>{urgentCount} {urgentCount === 1 ? "prodotto richiede" : "prodotti richiedono"} attenzione</strong>
              </span>
              <span className="banner-action">{filter === "In scadenza" ? "Mostra tutto" : "Filtra lista"} <ChevronRight /></span>
            </button>

            <div className="section-top">
              <div>
                <h2>La tua dispensa</h2>
                <p>Ordinata per scadenza, così non devi ricordare tutto.</p>
              </div>
              <div className="filters" aria-label="Filtra prodotti">
                {["Tutti", "Frigo", "Dispensa", "Freezer"].map((item) => (
                  <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="product-list">
              {filteredProducts.map((product) => {
                const expired = daysUntil(product.expires) < 0;
                return (
                  <article className={`product-row ${expired ? "expired" : ""}`} key={product.id}>
                    <button className="product-main" onClick={() => openProduct(product)}>
                      <ProductIcon product={product} />
                      <span className="product-copy">
                        <strong>{product.name}</strong>
                        <small><MapPin /> {product.place} <i /> {product.meta}</small>
                      </span>
                    </button>
                    <div className="expiry-column">
                      <span className={`expiry-badge ${expired ? "danger" : daysUntil(product.expires) <= alertThreshold ? "soon" : ""}`}>
                        {expiryCopy(product.expires)}
                      </span>
                      {expired && (
                        <button className="inline-action" onClick={() => markProduct(product, "Buttato")}>Segna esito</button>
                      )}
                    </div>
                    <button className="row-arrow" onClick={() => openProduct(product)} aria-label={`Apri ${product.name}`}><ChevronRight /></button>
                  </article>
                );
              })}
              {filteredProducts.length === 0 && (
                products.length === 0 ? (
                  <div className="empty-state pantry-empty">
                    <Package />
                    <h3>La tua dispensa è vuota</h3>
                    <p>Aggiungi il primo prodotto per iniziare a monitorare quantità e scadenze.</p>
                    <button className="primary-button" onClick={() => setAddOpen(true)}><Plus /> Aggiungi un prodotto</button>
                  </div>
                ) : (
                  <div className="empty-state"><Check /><h3>Tutto in ordine</h3><p>Non ci sono prodotti in questa sezione.</p></div>
                )
              )}
            </div>
          </section>
        )}

        {tab === "cook" && <CookPage products={products} onOpenRecipe={setSelectedRecipe} />}
        {tab === "saved" && <SavedPage history={history} onCorrect={correctOutcome} />}

        <nav className="mobile-nav" aria-label="Navigazione mobile">
          <NavButton icon={Package} label="Dispensa" active={tab === "pantry"} onClick={() => setTab("pantry")} />
          <NavButton icon={CookingPot} label="Cucina" active={tab === "cook"} onClick={() => setTab("cook")} />
          <button className="mobile-add" onClick={() => setAddOpen(true)} aria-label="Aggiungi cibo"><Plus /></button>
          <NavButton icon={History} label="Salvati" active={tab === "saved"} onClick={() => setTab("saved")} />
          <NavButton icon={CircleUserRound} label="Profilo" active={settingsOpen} onClick={() => setSettingsOpen(true)} />
        </nav>
      </main>

      {addOpen && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && closeAdd()}>
          <section className="add-panel" role="dialog" aria-modal="true" aria-label="Aggiungi prodotti">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Aggiunta rapida</p>
                <h2>Aggiungi ciò che hai comprato</h2>
              </div>
              <button className="icon-button" onClick={closeAdd} aria-label="Chiudi"><X /></button>
            </div>

            {sessionAdded.length > 0 && (
              <div className="session-strip">
                <span><Check /> {sessionAdded.length} {sessionAdded.length === 1 ? "prodotto aggiunto" : "prodotti aggiunti"}</span>
                <button onClick={closeAdd}>Fatto</button>
              </div>
            )}

            {pendingProduct ? (
              <div className="add-confirmation">
                <button
                  className="back-button"
                  onClick={() => {
                    setPendingProduct(null);
                    setSelectedPlace(null);
                  }}
                >
                  <ArrowLeft /> Scegli un altro prodotto
                </button>
                <div className="confirmation-product">
                  <ProductIcon product={pendingProduct} />
                  <div>
                    <p className="eyebrow">Prodotto da inserire</p>
                    <h3>{pendingProduct.name}</h3>
                  </div>
                </div>

                <fieldset className="place-field">
                  <legend>Dove vuoi inserirlo?</legend>
                  <p>Scegli una sezione per continuare.</p>
                  <div className="place-options">
                    {storagePlaces.map(({ label, icon: PlaceIcon }) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedPlace === label}
                        className={selectedPlace === label ? "active" : ""}
                        key={label}
                        onClick={() => setSelectedPlace(label)}
                      >
                        <PlaceIcon />
                        {label}
                        {selectedPlace === label && <Check />}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="quantity-field">
                  <span>
                    <strong>Quantità</strong>
                    <small>Facoltativa</small>
                  </span>
                  <input
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="es. 2 confezioni"
                    aria-label="Quantità del prodotto"
                  />
                </label>

                <label className="quantity-field expiry-entry-field">
                  <span>
                    <strong>Data di scadenza</strong>
                    <small>Facoltativa · sostituisce la stima automatica</small>
                  </span>
                  <div className="expiry-picker">
                    <input
                      type="date"
                      min={dateInputValue(new Date())}
                      value={expiryDate}
                      onChange={(event) => setExpiryDate(event.target.value)}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      aria-label="Data di scadenza del prodotto"
                    />
                  </div>
                </label>

                <button
                  className="primary-button confirmation-submit"
                  disabled={!selectedPlace}
                  onClick={() => addProduct(pendingProduct)}
                >
                  <Plus />
                  {selectedPlace ? `Aggiungi in ${selectedPlace}` : "Scegli dove inserirlo"}
                </button>
                <p className="estimate-note"><Clock3 /> Le scadenze sono stimate e puoi correggerle in qualsiasi momento.</p>
              </div>
            ) : (
              <>
                <label className="search-field">
                  <Search />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca un prodotto…" autoFocus />
                  {query && <button onClick={() => setQuery("")} aria-label="Cancella ricerca"><X /></button>}
                </label>

                <div className="quick-heading">
                  <div><h3>{query ? "Risultati" : "I tuoi soliti"}</h3><p>Scegli un prodotto, poi indica dove conservarlo.</p></div>
                  <span>Scadenza stimata</span>
                </div>

                <div className="quick-grid">
                  {quickResults.map((product) => {
                    const exists = products.some((item) => item.name.toLowerCase() === product.name.toLowerCase());
                    return (
                      <button className={`quick-card ${exists ? "already" : ""}`} key={product.name} onClick={() => setPendingProduct(product)}>
                        <ProductIcon product={product} size="small" />
                        <span>
                          <strong>{product.name}</strong>
                          <small>{product.days > 100 ? "Lunga durata" : `Scadenza stimata: ${product.days} giorni`}</small>
                        </span>
                        <span className="quick-plus">{exists ? <Check /> : <ChevronRight />}</span>
                      </button>
                    );
                  })}
                </div>

                {query && quickResults.length === 0 && (
                  <div className="empty-search">
                    <Search />
                    <h3>Nessun risultato per “{query}”</h3>
                    <p>Controlla il nome oppure aggiungilo come nuovo prodotto.</p>
                    <button className="secondary-button" onClick={() => setPendingProduct({ name: query, days: 3, place: "Frigo", icon: Package, tone: "cream" })}>
                      <Plus /> Continua
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {selected && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section className="detail-panel" role="dialog" aria-modal="true">
            <button className="back-button" onClick={() => setSelected(null)}><ArrowLeft /> Torna alla dispensa</button>
            <ProductIcon product={selected} size="large" />
            <p className="eyebrow">{selected.place}</p>
            <h2>{selected.name}</h2>
            <div className="detail-quantity">
              <div>
                <small>Quantità</small>
                {editingQuantity ? (
                  <input
                    value={quantityDraft}
                    onChange={(event) => setQuantityDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveQuantity();
                    }}
                    placeholder="es. 2 confezioni"
                    aria-label={`Quantità di ${selected.name}`}
                    autoFocus
                  />
                ) : (
                  <strong>{selected.meta}</strong>
                )}
              </div>
              <button
                onClick={() => {
                  if (editingQuantity) {
                    saveQuantity();
                  } else {
                    setQuantityDraft(selected.meta === "Quantità non indicata" ? "" : selected.meta);
                    setEditingQuantity(true);
                  }
                }}
              >
                {editingQuantity ? "Salva" : "Modifica"}
              </button>
            </div>

            <div className="detail-date">
              <span className={daysUntil(selected.expires) < 0 ? "danger-dot" : ""}><Clock3 /></span>
              <div>
                <small>Scadenza stimata</small>
                {editingExpiry ? (
                  <div className="expiry-picker detail-expiry-picker">
                    <input
                      className="expiry-input"
                      type="date"
                      min={dateInputValue(new Date())}
                      value={expiryDraft}
                      onChange={(event) => setExpiryDraft(event.target.value)}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      aria-label={`Data di scadenza di ${selected.name}`}
                      autoFocus
                    />
                  </div>
                ) : (
                  <strong>{expiryCopy(selected.expires)}</strong>
                )}
              </div>
              <button
                onClick={() => {
                  if (editingExpiry) {
                    saveExpiry();
                  } else {
                    setExpiryDraft(dateInputValue(selected.expires));
                    setEditingExpiry(true);
                  }
                }}
                disabled={editingExpiry && !expiryDraft}
              >
                {editingExpiry ? "Salva" : "Correggi"}
              </button>
            </div>

            <div className="detail-note">
              <Sparkles />
              <p><strong>Usalo per primo.</strong> Puoi abbinarlo a pane integrale e spinaci per una cena veloce.</p>
            </div>

            <button className="primary-button full" onClick={() => markProduct(selected, "Salvato")}><Check /> L’ho consumato</button>
            <button className="destructive-link" onClick={() => markProduct(selected, "Buttato")}><Trash2 /> L’ho buttato</button>
          </section>
        </div>
      )}

      {selectedRecipe && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedRecipe(null)}>
          <article className="recipe-detail-panel" role="dialog" aria-modal="true" aria-labelledby="recipe-title">
            <div className="recipe-detail-image">
              <Image src={selectedRecipe.image} alt={selectedRecipe.imageAlt} fill sizes="(max-width: 680px) 100vw, 620px" />
              <button className="icon-button" onClick={() => setSelectedRecipe(null)} aria-label="Chiudi ricetta"><X /></button>
            </div>
            <div className="recipe-detail-content">
              <p className="eyebrow">{selectedRecipe.note}</p>
              <h2 id="recipe-title">{selectedRecipe.title}</h2>
              <div className="recipe-facts">
                <span><Clock3 /> {selectedRecipe.time}</span>
                <span><CookingPot /> {selectedRecipe.servings}</span>
              </div>

              <section className="recipe-section">
                <h3>Quello che ti serve</h3>
                <ul className="ingredient-list">
                  {selectedRecipe.ingredientList.map((ingredient) => (
                    <li key={ingredient}><Check /> <span>{ingredient}</span></li>
                  ))}
                </ul>
              </section>

              <section className="recipe-section">
                <h3>Come prepararla</h3>
                <ol className="recipe-steps">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={step}><span>{index + 1}</span><p>{step}</p></li>
                  ))}
                </ol>
              </section>
              <button className="primary-button full" onClick={() => setSelectedRecipe(null)}><Check /> Ho tutto, inizio a cucinare</button>
            </div>
          </article>
        </div>
      )}

      {settingsOpen && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setSettingsOpen(false)}>
          <section className="settings-panel" role="dialog" aria-modal="true">
            <div className="panel-header">
              <div><p className="eyebrow">Preferenze</p><h2>Avvisi</h2></div>
              <button className="icon-button" onClick={() => setSettingsOpen(false)}><X /></button>
            </div>
            <div className="permission-ok">
              <Bell />
              <div>
                <strong>
                  {notificationPermission === "granted"
                    ? "Notifiche del dispositivo attive"
                    : "Avvisi nell’app attivi"}
                </strong>
                <p>
                  {notificationPermission === "denied"
                    ? "Le notifiche di sistema sono bloccate nel browser, ma gli avvisi restano visibili qui."
                    : notificationPermission === "unsupported"
                      ? "Questo browser non supporta le notifiche di sistema, ma gli avvisi restano visibili qui."
                      : products.length
                        ? `Mostriamo i prodotti in scadenza entro ${alertThreshold} ${alertThreshold === 1 ? "giorno" : "giorni"}.`
                        : "Nessun avviso programmato: aggiungi il primo prodotto."}
                </p>
              </div>
            </div>
            {notificationPermission === "default" && (
              <button className="secondary-button notification-permission" onClick={enableNotifications}>
                <Bell /> Attiva notifiche sul dispositivo
              </button>
            )}
            <section className="alerts-section" aria-labelledby="alerts-title">
              <div className="alerts-heading">
                <div>
                  <p className="eyebrow">Scadenze imminenti</p>
                  <h3 id="alerts-title">I tuoi avvisi</h3>
                </div>
                <span>{urgentCount}</span>
              </div>
              {alertProducts.length > 0 ? (
                <div className="alerts-list">
                  {alertProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSettingsOpen(false);
                        openProduct(product);
                      }}
                    >
                      <ProductIcon product={product} size="tiny" />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.place} · {expiryCopy(product.expires)}</small>
                      </span>
                      <ChevronRight />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="alerts-empty">Nessun prodotto scade entro la soglia scelta.</p>
              )}
            </section>
            <div className="setting-row"><span><strong>Avvisami prima</strong><small>Soglia predefinita</small></span><select value={alertDays} onChange={(event) => setAlertDays(event.target.value)}><option value="1">1 giorno</option><option value="2">2 giorni</option><option value="3">3 giorni</option></select></div>
            <div className="setting-row"><span><strong>Massimo un avviso</strong><small>Al giorno, per prodotto</small></span><button className={`switch ${dailyLimit ? "on" : ""}`} onClick={() => setDailyLimit((value) => !value)} aria-pressed={dailyLimit} aria-label="Massimo un avviso al giorno"><i /></button></div>
            <div className="setting-row"><span><strong>Non disturbare</strong><small>Dalle 22:30 alle 7:00</small></span><button className={`switch ${quietHours ? "on" : ""}`} onClick={() => setQuietHours((value) => !value)} aria-pressed={quietHours} aria-label="Non disturbare"><i /></button></div>
            <button className="primary-button full" onClick={savePreferences}>Salva preferenze</button>
            <button className="logout-button" onClick={signOut}>Esci dall’account</button>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <span className={`toast-icon ${toast.type}`}><Check /></span>
          <p>{toast.message}</p>
          {toast.type === "added" && <button onClick={undoAdd}><RotateCcw /> Annulla</button>}
          {toast.type === "outcome" && <button onClick={undoOutcome}><RotateCcw /> Annulla</button>}
          {toast.type === "duplicate" && <button onClick={() => setToast(null)}>Ho capito</button>}
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Chiudi"><X /></button>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return <button className={active ? "active" : ""} onClick={onClick}><Icon /><span>{label}</span></button>;
}

function CookPage({ products, onOpenRecipe }) {
  const urgent = [...products].sort((a, b) => new Date(a.expires) - new Date(b.expires)).slice(0, 3);
  const availableRecipes = recipes.filter((recipe) =>
    recipe.required.every((ingredient) => hasIngredient(products, ingredient)),
  );
  return (
    <section className="page cook-page">
      <div className="page-heading">
        <div><p className="eyebrow">Ispirazione, non una lista della spesa</p><h1>Cucina con quello che hai.</h1><p className="subtitle">Idee semplici a partire dai cibi che vanno usati prima.</p></div>
      </div>
      <div className="cook-layout">
        <div className="recipe-column">
          <div className="recipe-heading">
            <div>
              <h2>Per stasera</h2>
              <p>Solo ricette che puoi preparare con ciò che hai.</p>
            </div>
            <span>{availableRecipes.length} {availableRecipes.length === 1 ? "idea" : "idee"}</span>
          </div>
          {availableRecipes.length > 0 ? (
            <div className="recipe-grid">
              {availableRecipes.map((recipe) => (
                <article
                  className="recipe-card"
                  key={recipe.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Apri la ricetta ${recipe.title}`}
                  onClick={() => onOpenRecipe(recipe)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenRecipe(recipe);
                    }
                  }}
                >
                  <div className="recipe-image">
                    <Image src={recipe.image} alt={recipe.imageAlt} fill sizes="(max-width: 680px) 100vw, 40vw" />
                    <span><Clock3 /> {recipe.time}</span>
                  </div>
                  <div className="recipe-copy"><p className="eyebrow">{recipe.note}</p><h3>{recipe.title}</h3><p>{recipe.ingredients}</p><span className="recipe-link">Apri idea <ChevronRight /></span></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="recipe-empty">
              <span><CookingPot /></span>
              <h3>Nessuna combinazione pronta</h3>
              <p>Aggiungi qualche alimento alla dispensa: le idee compariranno automaticamente quando avrai tutti gli ingredienti necessari.</p>
            </div>
          )}
        </div>
        <aside className="use-first">
          <p className="eyebrow">Da usare per primi</p>
          <h3>Parti da qui</h3>
          {urgent.map((product) => <div className="mini-product" key={product.id}><ProductIcon product={product} size="tiny" /><span><strong>{product.name}</strong><small>{expiryCopy(product.expires)}</small></span></div>)}
        </aside>
      </div>
    </section>
  );
}

function SavedPage({ history, onCorrect }) {
  const saved = history.filter((item) => item.action === "Salvato").length;
  const wasted = history.filter((item) => item.action === "Buttato").length;
  return (
    <section className="page saved-page">
      <div className="page-heading"><div><p className="eyebrow">Il tuo impatto</p><h1>Cibi salvati.</h1><p className="subtitle">Uno storico concreto, senza punti o classifiche.</p></div></div>
      <div className="stats-grid">
        <div className="stat-card positive"><span><Leaf /></span><strong>{saved}</strong><p>prodotti salvati a novembre</p></div>
        <div className="stat-card neutral"><span><Minus /></span><strong>{wasted}</strong><p>prodotti buttati a novembre</p></div>
      </div>
      <div className="history-card">
        <div className="section-top"><div><h2>Ultimi esiti</h2><p>Puoi tenere sotto controllo le tue abitudini.</p></div></div>
        {history.length > 0 ? history.map((item) => (
            <div className="history-row" key={item.id}>
              <span className={item.action === "Salvato" ? "saved" : "wasted"}>{item.action === "Salvato" ? <Check /> : <Trash2 />}</span>
              <div><strong>{item.name}</strong><small>{item.action} · {item.date}</small></div>
              <button onClick={() => onCorrect(item)}>Correggi</button>
            </div>
          )) : (
            <div className="history-empty"><History /><p>Lo storico si riempirà quando segnerai un prodotto come consumato o buttato.</p></div>
          )}
      </div>
    </section>
  );
}

export default App;
