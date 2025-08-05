"use client"
import { useMemo } from "react"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Languages, Search, Menu, Bell, Download, HelpCircle, MapPin, TrendingUp, Droplets, Fish, AlertTriangle, Thermometer, UserPlus, AlertCircle, Info, LogOut, User, Database, CheckCircle, XCircle, Save, FolderOpen, LogIn, Eye, Volume2, ZoomIn, ZoomOut, Palette, RotateCcw, Activity, BarChart3, FileText, Clock, Settings, Globe, Wind, Sun, Navigation, Shield, Waves, Keyboard,Maximize2} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Portal } from "@radix-ui/react-portal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Map, Marker, Popup } from 'react-map-gl/maplibre'; // 👈 todo desde el build correcto
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Centra el mapa en Ecuador
const center = { latitude: -1.8312, longitude: -78.1834 };

export function EnvironmentalDashboard() {
  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [language, setLanguage] = useState<"es" | "en">("es")

    // Editar informacion de usuario
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [editUserForm, setEditUserForm] = useState(currentUser || {})
  const [editUserHistory, setEditUserHistory] = useState<any[]>([])
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [editUserFeedback, setEditUserFeedback] = useState<{type: string, message: string} | null>(null)

  // Estado para mostrar el historial de cambios
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)


    // Estado para el modal expandido de opciones auditivas
  const [showExpandedAudioOptions, setShowExpandedAudioOptions] = useState(false)

    // Nuevo estado para el modal de atajos de teclado
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  
    // Estado para el modal de resultados de búsqueda
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem("isLoggedIn")
    const storedUser = localStorage.getItem("currentUser")
    if (storedLoggedIn === "true" && storedUser) {
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    if (showEditUserDialog && currentUser) {
      setEditUserForm(currentUser)
    }
  }, [showEditUserDialog, currentUser])

  const [currentView, setCurrentView] = useState("map")

  // Estados de accesibilidad
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState([16])
  const [dyslexiaFont, setDyslexiaFont] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  const [animations, setAnimations] = useState(true)

  // Nuevos estados de accesibilidad
  const [monochromeMode, setMonochromeMode] = useState(false)
  const [selectedThemeColor, setSelectedThemeColor] = useState("default")

  // Referencias para el lector de pantalla
  const speechSynthesis = useRef<SpeechSynthesis | null>(null)
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  // Estados para opciones auditivas (video)
  const [showVideoAlert, setShowVideoAlert] = useState(false)
  const [videoCaptionsEnabled, setVideoCaptionsEnabled] = useState(false)
  const [videoTranscriptionVisible, setVideoTranscriptionVisible] = useState(false)

  const youtubeVideoId = "RRvqhEJbbtQ" // Reemplaza con un video real sobre ambiente costero
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&loop=0&fs=1${videoCaptionsEnabled ? "&cc_load_policy=1" : ""}`

  // Colores predefinidos para temas
  const themeColors = [
    { id: "default", name: "Por defecto", color: "bg-slate-500", hsl: "default" },
    { id: "blue", name: "Azul", color: "bg-blue-500", hsl: "217 91% 60%" },
    { id: "green", name: "Verde", color: "bg-green-500", hsl: "142 76% 36%" },
    { id: "purple", name: "Púrpura", color: "bg-purple-500", hsl: "262 83% 58%" },
    { id: "orange", name: "Naranja", color: "bg-orange-500", hsl: "25 95% 53%" },
    { id: "pink", name: "Rosa", color: "bg-pink-500", hsl: "330 81% 60%" },
    { id: "teal", name: "Verde azulado", color: "bg-teal-500", hsl: "173 80% 40%" },
    { id: "red", name: "Rojo", color: "bg-red-500", hsl: "0 84% 60%" },
  ]

  // Estados para filtros y búsqueda
  const [stationFilter, setStationFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Estados para formularios y diálogos
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAlertConfig, setShowAlertConfig] = useState(false)
  const [showUserRegistration, setShowUserRegistration] = useState(false)
  const [showAdvancedFilters, setShowAdvancedSearch] = useState(false)
  const [showWaterQuality, setShowWaterQuality] = useState(false)
  const [showBiodiversity, setShowBiodiversity] = useState(false)
  const [showContamination, setShowContamination] = useState(false)
  const [showPhysicalConditions, setShowPhysicalConditions] = useState(false)
  const [showMonitoringStations, setShowMonitoringStations] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)

  // Estados para borradores
  const [showDraftsDialog, setShowDraftsDialog] = useState(false)
  const [currentFormType, setCurrentFormType] = useState("")
  const [availableDrafts, setAvailableDrafts] = useState<any[]>([])
  const [draftName, setDraftName] = useState("")

  // Estados de validación y errores
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Estados para resultados y feedback
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [exportSuccess, setExportSuccess] = useState(false)
  const [alertConfigSuccess, setAlertConfigSuccess] = useState(false)
  const [operationFeedback, setOperationFeedback] = useState<{
    type: "success" | "error" | "info"
    message: string
    show: boolean
  }>({ type: "info", message: "", show: false })

  // Estados para formulario de login
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  // Estados para controlar menús abiertos (para atajos de teclado)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false)
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAlertsMenuOpen, setIsAlertsMenuOpen] = useState(false)

  //Ajustar espaciado
  const [lineSpacing, setLineSpacing] = useState(1.5)      // Espaciado de línea (ej: 1, 1.5, 2)
  const [wordSpacing, setWordSpacing] = useState(0)        // Espaciado de palabra en px
  const [letterSpacing, setLetterSpacing] = useState(0)    // Espaciado de caracter en px
    
  // Diccionario simple de traducción
const t = useMemo(() => {
  const dict = {
    es: {
      dashboardTitle: "Dashboard Ambiental Costero",
      login: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      userMenu: "Usuario",
      accessMenu: "Acceder",
      advancedSearch: "Búsqueda Avanzada",
      search: "Buscar",
      searchPlaceholder: "Buscar...",
      stations: "Estaciones",
      trends: "Tendencias",
      alerts: "Alertas",
      waterQuality: "Calidad del Agua",
      biodiversity: "Biodiversidad Marina",
      contamination: "Contaminación",
      physicalConditions: "Condiciones Físicas",
      monitoringStations: "Estaciones de Monitoreo",
      reports: "Reportes y Tendencias",
      helpCenter: "Centro de Ayuda",
      accessibility: "Opciones de Accesibilidad",
      zoom: "Lupa (Zoom)",
      increase: "Aumentar Zoom",
      decrease: "Disminuir Zoom",
      reset: "Restablecer Zoom",
      language: "Idioma",
      spanish: "Español",
      english: "Inglés",
      // Navegación y menús principales
      shortcuts: "Atajos",
      environmentalAlerts: "Alertas Ambientales",
      accessibilityMenu: "Menú de Accesibilidad",
      navigationMenu: "Menú de Navegación",
      accessalldashfeatures: "Accede a todas las funciones del dashboard",
      galapagosArrowLabel: "Estación Arrecife Este",

      // Estados y métricas generales
      activeStations: "Estaciones Activas",
      total: "total",
      averageQuality: "Calidad Promedio",
      good: "Buena",
      activeAlerts: "Alertas Activas",
      critical: "crítica",
      moderate: "moderadas",
      averageTemp: "Temp. Promedio",
      sinceYesterday: "desde ayer",
      
      // Mapa y estaciones
      interactiveMap: "Mapa Interactivo",
      monitoringStationsMap: "Mapa de Estaciones de Monitoreo",
      realTimeView: "Vista en tiempo real de todas las estaciones de monitoreo costero",
      stationStatus: "Estado de Estaciones",
      active: "Activa",
      alert: "Alerta",
      offline: "Fuera de línea",
      showing: "Mostrando",
      of: "de",
      allStations: "Todas las estaciones",
      enviromentaltrds: "Tendencias Ambientales",
      Status: "Estado",
      // Estados de estaciones
      coordinates: "Coordenadas",
      stationOffline: "Estación fuera de línea",
      viewDetails: "Ver detalles",
      
      // Filtros de estaciones
      activeStationsFilter: "Activas",
      withAlerts: "Con alertas",
      offlineStations: "Fuera de línea",
      
      // Tendencias y métricas
      phTrends: "Tendencias de pH",
      last24Hours: "Últimas 24 horas",
      dissolvedOxygen: "Oxígeno Disuelto",
      temperature: "Temperatura",
      
      // Tipos de alertas específicas
      lowOxygenLevel: "Nivel de oxígeno bajo en Puerto Sur",
      elevatedTemperature: "Temperatura elevada en Costa Central",
      phVariation: "Variación de pH en Bahía Norte",
      
      // Tiempos relativos
      minutesAgo: "hace 15 min",
      oneHourAgo: "hace 1 hora",
      twoHoursAgo: "hace 2 horas",
      
      // Niveles de alerta
      criticalLevel: "Crítica",
      moderateLevel: "Moderada",
      lowLevel: "Baja",
      
      // Atajos de teclado - Secciones
      keyboardShortcuts: "Atajos de Teclado",
      shortcutsDescription: "Utilice estos atajos para navegar rápidamente por el dashboard",
      generalNavigation: "Navegación General",
      formsAndAnalysis: "Formularios y Análisis",
      closeDialogs: "Cerrar diálogos/menús",
      navigationTips: "Consejos de Navegación",
      
      // Atajos de teclado - Funciones
      openMainMenu: "Abrir menú principal",
      openAccessibilityMenu: "Abrir menú de accesibilidad",
      viewAlerts: "Ver alertas",
      keyboardShortcutsMenu: "Atajos de teclado",
      quickSearch: "Búsqueda rápida",
      
      // Navegación por números
      goToInteractiveMap: "Ir a Mapa Interactivo",
      goToStations: "Ir a Estaciones",
      goToTrends: "Ir a Tendencias",
      goToAlerts: "Ir a Alertas",
      
      // Análisis específicos
      marineBiodiversity: "Biodiversidad Marina",
      contaminationAnalysis: "Análisis de Contaminación",
      stationManagement: "Gestión de Estaciones",
      reportsAndTrends: "Reportes y Tendencias",
      
      // Instrucciones de navegación
      tabNavigation: "Use Tab y Shift+Tab para navegar entre elementos",
      enterActivation: "Presione Enter para activar botones y enlaces",
      spaceActivation: "Use Espacio para activar switches y checkboxes",
      numberNavigation: "Los números 1-4 cambian entre pestañas principales",
      escapeClose: "Escape cierra cualquier diálogo o menú abierto",

        
      // Opciones de Accesibilidad
      customizeInterface: "Personaliza la interfaz según tus necesidades",
      visualOptions: "Opciones Visuales",
      highContrast: "Alto contraste",
      monochromaticMode: "Modo monocromático",
      textSize: "Tamaño de texto",
      dyslexiaFont: "Fuente para dislexia",
      screenReaderMode: "Modo Lector de Pantalla",
      pauseAnimations: "Pausar animaciones",
      audioOptions: "Opciones Auditivas",
      automaticSubtitles: "Subtítulos automáticos",
      transcriptions: "Transcripciones",

      // Ajustes de espaciado
      lineSpacing: "Espaciado de línea",
      wordSpacing: "Espaciado de palabra",
      letterSpacing: "Espaciado de caracter",

      //borradores
      loadDraftsTitle: "Cargar Borrador",
      loadDraftsDesc: "Seleccione un borrador guardado para aplicarlo al formulario actual.",
      noDrafts: "No hay borradores",
      noDraftsDesc: "No se encontraron borradores guardados para este formulario.",
      applyDraft: "Aplicar",
      cancel: "Cancelar",
    },
    en: {
      dashboardTitle: "Coastal Environmental Dashboard",
      login: "Login",
      logout: "Logout",
      userMenu: "User",
      accessMenu: "Access",
      advancedSearch: "Advanced Search",
      search: "Search",
      searchPlaceholder: "Search...",
      stations: "Stations",
      trends: "Trends",
      alerts: "Alerts",
      waterQuality: "Water Quality",
      biodiversity: "Marine Biodiversity",
      contamination: "Contamination",
      physicalConditions: "Physical Conditions",
      monitoringStations: "Monitoring Stations",
      reports: "Reports & Trends",
      helpCenter: "Help Center",
      accessibility: "Accessibility Options",
      zoom: "Magnifier (Zoom)",
      increase: "Increase Zoom",
      decrease: "Decrease Zoom",
      reset: "Reset Zoom",
      language: "Language",
      spanish: "Spanish",
      english: "English",
        // Navegación y menús principales
      shortcuts: "Shortcuts",
      environmentalAlerts: "Environmental Alerts",
      accessibilityMenu: "Accessibility Menu",
      navigationMenu: "Navigation Menu",
      accessalldashfeatures: "Access all dashboard features",
      galapagosArrowLabel: "Arrecife Este Station",
      
      // Estados y métricas generales
      activeStations: "Active Stations",
      total: "total",
      averageQuality: "Average Quality",
      good: "Good",
      activeAlerts: "Active Alerts",
      critical: "critical",
      moderate: "moderate",
      averageTemp: "Avg. Temp",
      sinceYesterday: "since yesterday",
      
      // Mapa y estaciones
      interactiveMap: "Interactive Map",
      monitoringStationsMap: "Monitoring Stations Map",
      realTimeView: "Real-time view of all coastal monitoring stations",
      stationStatus: "Station Status",
      active: "Active",
      alert: "Alert",
      offline: "Offline",
      showing: "Showing",
      of: "of",
      allStations: "All stations",
      enviromentaltrds: "Environmental trends",
      Status: "Status",
      
      // Estados de estaciones
      coordinates: "Coordinates",
      stationOffline: "Station offline",
      viewDetails: "View details",
      
      // Filtros de estaciones
      activeStationsFilter: "Active",
      withAlerts: "With alerts",
      offlineStations: "Offline",
      
      // Tendencias y métricas
      phTrends: "pH Trends",
      last24Hours: "Last 24 hours",
      dissolvedOxygen: "Dissolved Oxygen",
      temperature: "Temperature",
      
      // Tipos de alertas específicas
      lowOxygenLevel: "Low oxygen level in Southern Port",
      elevatedTemperature: "Elevated temperature in Central Coast",
      phVariation: "pH variation in Northern Bay",
      
      // Tiempos relativos
      minutesAgo: "15 min ago",
      oneHourAgo: "1 hour ago",
      twoHoursAgo: "2 hours ago",
      
      // Niveles de alerta
      criticalLevel: "Critical",
      moderateLevel: "Moderate",
      lowLevel: "Low",
      
      // Atajos de teclado - Secciones
      keyboardShortcuts: "Keyboard Shortcuts",
      shortcutsDescription: "Use these shortcuts to quickly navigate the dashboard",
      generalNavigation: "General Navigation",
      formsAndAnalysis: "Forms and Analysis",
      closeDialogs: "Close dialogs/menus",
      navigationTips: "Navigation Tips",
      
      // Atajos de teclado - Funciones
      openMainMenu: "Open main menu",
      openAccessibilityMenu: "Open accessibility menu",
      viewAlerts: "View alerts",
      keyboardShortcutsMenu: "Keyboard shortcuts",
      quickSearch: "Quick search",
      
      // Navegación por números
      goToInteractiveMap: "Go to Interactive Map",
      goToStations: "Go to Stations",
      goToTrends: "Go to Trends",
      goToAlerts: "Go to Alerts",
      
      // Análisis específicos
      marineBiodiversity: "Marine Biodiversity",
      contaminationAnalysis: "Contamination Analysis",
      stationManagement: "Station Management",
      reportsAndTrends: "Reports and Trends",
      
      // Instrucciones de navegación
      tabNavigation: "Use Tab and Shift+Tab to navigate between elements",
      enterActivation: "Press Enter to activate buttons and links",
      spaceActivation: "Use Space to activate switches and checkboxes",
      numberNavigation: "Numbers 1-4 switch between main tabs",
      escapeClose: "Escape closes any dialog or open menu",
  
      // Opciones de Accesibilidad
      customizeInterface: "Customize the interface according to your needs",
      visualOptions: "Visual Options",
      highContrast: "High contrast",
      monochromaticMode: "Monochromatic mode",
      textSize: "Text size",
      dyslexiaFont: "Dyslexia font",
      screenReaderMode: "Screen Reader Mode",
      pauseAnimations: "Pause animations",
      audioOptions: "Audio Options",
      automaticSubtitles: "Automatic subtitles",
      transcriptions: "Transcriptions",

      // Ajustes de espaciado
      lineSpacing: "Line spacing",
      wordSpacing: "Word spacing",
      letterSpacing: "Letter spacing",

      //borradores
      loadDraftsTitle: "Load Draft",
      loadDraftsDesc: "Select a saved draft to apply it to the current form.",
      noDrafts: "No drafts",
      noDraftsDesc: "No saved drafts found for this form.",
      applyDraft: "Apply",
      cancel: "Cancel",

    }
  }
  return dict[language]
}, [language])

  // Datos de estaciones
  const monitoringStations = [
    {
      id: 1,
      name: "Estación Bahía Norte",
      status: "active",
      ph: 7.8,
      oxygen: 8.2,
      temp: 24.5,
      alerts: 0,
      lat: -0.5976,      // Bahía de Caráquez, Ecuador
      lng: -80.4256,
    },
    {
      id: 2,
      name: "Estación Costa Central",
      status: "active",
      ph: 7.6,
      oxygen: 7.9,
      temp: 25.1,
      alerts: 1,
      lat: -1.0570,     // Manta, Ecuador
      lng: -80.6561,
    },
    {
      id: 3,
      name: "Estación Puerto Sur",
      status: "warning",
      ph: 7.2,
      oxygen: 6.8,
      temp: 26.3,
      alerts: 2,
      lat: -2.2086,     // Salinas, Ecuador
      lng: -80.9586,
    },
    {
      id: 4,
      name: "Estación Arrecife Este",
      status: "offline",
      ph: 0,
      oxygen: 0,
      temp: 0,
      alerts: 0,
      lat: -0.9538,     // Puerto Ayora, Galápagos (referencia para "arrecife")
      lng: -90.9656,
    },
  ];

  const environmentalAlerts = [
    {
      id: 1,
      level: "high",
      message: t.lowOxygenLevel,
      time: t.minutesAgo,
      station: "Puerto Sur",
    },
    {
      id: 2,
      level: "medium",
      message: t.elevatedTemperature,
      time: t.oneHourAgo,
      station: "Costa Central",
    },
    { id: 3, level: "low", message: t.phVariation, time: t.twoHoursAgo, station: "Bahía Norte" },
  ]

  // Secciones disponibles para búsqueda
  const sections = [
    { id: "map", name: t.interactiveMap, icon: MapPin },
    { id: "stations", name: t.monitoringStations, icon: Database },
    { id: "trends", name: t.enviromentaltrds, icon: TrendingUp },
    { id: "alerts", name: t.environmentalAlerts, icon: AlertTriangle },
  ]

  // Filtrar secciones basadas en la búsqueda
  const filteredSections = sections.filter((section) => section.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Estados para formularios específicos con valores iniciales
  const initialExportForm = {
    format: "CSV",
    dateStart: "",
    dateEnd: "",
    stations: [] as string[],
    parameters: [] as string[],
    includeMetadata: true,
    compression: false,
  }

  const initialAlertConfigForm = {
    parameter: "",
    minThreshold: "",
    maxThreshold: "",
    email: "",
    frequency: "60",
    emailNotifications: true,
    smsNotifications: false,
    webhookUrl: "",
    priority: "medium",
  }

  const initialUserRegistrationForm = {
    name: "",
    email: "",
    institution: "",
    role: "",
    password: "",
    confirmPassword: "",
  }

  const initialAdvancedSearchForm = {
    searchType: "comprehensive",
    keywords: "",
    category: "all",
    dateRange: { start: "", end: "" },
    location: { lat: "", lng: "", radius: "" },
    parameters: [] as string[],
    alertLevel: "all",
    includeHistorical: false,
    sortBy: "relevance",
    maxResults: "100",
  }

  const initialWaterQualityForm = {
    analysisType: "current",
    parameters: [] as string[],
    stations: [] as string[],
    dateRange: { start: "", end: "" },
    comparisonMode: false,
    alertThresholds: true,
  }

  const initialBiodiversityForm = {
    monitoringType: "species",
    taxonomicGroups: [] as string[],
    conservationStatus: "all",
    samplingMethod: "visual",
    includeRareSpecies: true,
    generateReport: false,
  }

  const initialContaminationForm = {
    contaminantTypes: [] as string[],
    severityLevel: "all",
    sources: [] as string[],
    mitigationActions: [] as string[],
    notifyAuthorities: false,
    emergencyProtocol: false,
  }

  const initialPhysicalConditionsForm = {
    parameters: [] as string[],
    measurementInterval: "15min",
    extremeConditionAlerts: true,
    weatherIntegration: true,
    forecastPeriod: "24h",
  }

  const initialMonitoringStationsForm = {
    action: "view",
    stationData: {
      name: "",
      latitude: "",
      longitude: "",
      type: "coastal",
      sensors: [] as string[],
      maintenanceSchedule: "monthly",
    },
  }

  const initialReportsForm = {
    reportType: "daily",
    format: "PDF",
    includeCharts: true,
    autoSend: false,
    recipients: [] as string[],
    customParameters: [] as string[],
  }

  // Estados de formularios
  const [exportForm, setExportForm] = useState(initialExportForm)
  const [alertConfigForm, setAlertConfigForm] = useState(initialAlertConfigForm)
  const [userRegistrationForm, setUserRegistrationForm] = useState(initialUserRegistrationForm)
  const [advancedSearchForm, setAdvancedSearchForm] = useState(initialAdvancedSearchForm)
  const [waterQualityForm, setWaterQualityForm] = useState(initialWaterQualityForm)
  const [biodiversityForm, setBiodiversityForm] = useState(initialBiodiversityForm)
  const [contaminationForm, setContaminationForm] = useState(initialContaminationForm)
  const [physicalConditionsForm, setPhysicalConditionsForm] = useState(initialPhysicalConditionsForm)
  const [monitoringStationsForm, setMonitoringStationsForm] = useState(initialMonitoringStationsForm)
  const [reportsForm, setReportsForm] = useState(initialReportsForm)


  // SISTEMA DE ATAJOS DE TECLADO
  const keyboardShortcuts = [
    { key: "Alt + M", description: t.openMainMenu, action: () => setIsMainMenuOpen(true) },
    { key: "Alt + A", description: t.openAccessibilityMenu, action: () => setIsAccessibilityMenuOpen(true) },
    { key: "Alt + F", description: t.advancedSearch, action: () => setShowAdvancedSearch(true) },
    { key: "Alt + N", description: t.viewAlerts, action: () => setIsAlertsMenuOpen(true) },
    { key: "Alt + U", description: t.userMenu, action: () => setIsUserMenuOpen(true) },
    { key: "Alt + H", description: t.helpCenter, action: () => setShowHelpCenter(true) },
    { key: "Alt + K", description: t.keyboardShortcutsMenu, action: () => setShowKeyboardShortcuts(true) },
    {
      key: "Ctrl + K",
      description: t.quickSearch,
      action: () => {
  const input = document.querySelector('input[placeholder="Buscar..."]');
  if (input instanceof HTMLInputElement) {
    input.focus();
     }},
    },
    { key: "1", description: t.goToInteractiveMap, action: () => setCurrentView("map") },
    { key: "2", description: t.goToStations, action: () => setCurrentView("stations") },
    { key: "3", description: t.goToTrends, action: () => setCurrentView("trends") },
    { key: "4", description: t.goToAlerts, action: () => setCurrentView("alerts") },
    { key: "Alt + W", description: t.waterQuality, action: () => setShowWaterQuality(true) },
    { key: "Alt + B", description: t.marineBiodiversity, action: () => setShowBiodiversity(true) },
    { key: "Alt + C", description: t.contaminationAnalysis, action: () => setShowContamination(true) },
    { key: "Alt + P", description: t.physicalConditions, action: () => setShowPhysicalConditions(true) },
    { key: "Alt + S", description: t.stationManagement, action: () => setShowMonitoringStations(true) },
    { key: "Alt + R", description: t.reportsAndTrends, action: () => setShowReports(true) },
    //{ key: "Alt + E", description: "Exportar Datos", action: () => setShowExportDialog(true) },
    { key: "Escape", description: t.escapeClose, action: () => closeAllDialogs() },
  ]

  // Función para cerrar todos los diálogos
  const closeAllDialogs = useCallback(() => {
    setShowAdvancedSearch(false)
    setShowWaterQuality(false)
    setShowBiodiversity(false)
    setShowContamination(false)
    setShowPhysicalConditions(false)
    setShowMonitoringStations(false)
    setShowReports(false)
    setShowExportDialog(false)
    setShowHelpCenter(false)
    setShowKeyboardShortcuts(false)
    setShowLoginDialog(false)
    setShowUserRegistration(false)
    setShowExpandedAudioOptions(false)
    setIsMainMenuOpen(false)
    setIsAccessibilityMenuOpen(false)
    setIsUserMenuOpen(false)
    setIsAlertsMenuOpen(false)
    setShowSuggestions(false)
  }, [])

  // Manejador principal de teclas
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, altKey, ctrlKey, metaKey, shiftKey } = event

      // Prevenir comportamiento por defecto para nuestros atajos
      const isOurShortcut = keyboardShortcuts.some((shortcut) => {
        const keys = shortcut.key.split(" + ")
        if (keys.length === 1) {
          return key === keys[0] && !altKey && !ctrlKey && !metaKey
        } else if (keys.length === 2) {
          const [modifier, mainKey] = keys
          if (modifier === "Alt" && altKey && key.toLowerCase() === mainKey.toLowerCase()) return true
          if (modifier === "Ctrl" && (ctrlKey || metaKey) && key.toLowerCase() === mainKey.toLowerCase()) return true
        }
        return false
      })

      // ...dentro de handleKeyDown...
      const activeElement = document.activeElement as HTMLElement | null;
      const tag = activeElement?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Solo prevenir el comportamiento por defecto si NO estamos en un input
      if (isOurShortcut && !isInput) {
        event.preventDefault();
      }

      // Ejecutar acciones según las teclas presionadas
      if (altKey && key.toLowerCase() === "m") {
        setIsMainMenuOpen(true);
      } else if (altKey && key.toLowerCase() === "a") {
        setIsAccessibilityMenuOpen(true);
      } else if (altKey && key.toLowerCase() === "f") {
        setShowAdvancedSearch(true);
      } else if (altKey && key.toLowerCase() === "n") {
        setIsAlertsMenuOpen(true);
      } else if (altKey && key.toLowerCase() === "u") {
        setIsUserMenuOpen(true);
      } else if (altKey && key.toLowerCase() === "h") {
        setShowHelpCenter(true);
      } else if (altKey && key.toLowerCase() === "k") {
        setShowKeyboardShortcuts(true);
      } else if ((ctrlKey || metaKey) && key.toLowerCase() === "k") {
        const searchInput = document.querySelector('input[placeholder="Buscar..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (key === "1" && !altKey && !ctrlKey && !metaKey && !isInput) {
        setCurrentView("map");
      } else if (key === "2" && !altKey && !ctrlKey && !metaKey && !isInput) {
        setCurrentView("stations");
      } else if (key === "3" && !altKey && !ctrlKey && !metaKey && !isInput) {
        setCurrentView("trends");
      } else if (key === "4" && !altKey && !ctrlKey && !metaKey && !isInput) {
        setCurrentView("alerts");
      } else if (altKey && key.toLowerCase() === "w") {
        setShowWaterQuality(true);
      } else if (altKey && key.toLowerCase() === "b") {
        setShowBiodiversity(true);
      } else if (altKey && key.toLowerCase() === "c") {
        setShowContamination(true);
      } else if (altKey && key.toLowerCase() === "p") {
        setShowPhysicalConditions(true);
      } else if (altKey && key.toLowerCase() === "s") {
        setShowMonitoringStations(true);
      } else if (altKey && key.toLowerCase() === "r") {
        setShowReports(true);
      } else if (altKey && key.toLowerCase() === "e") {
        setShowExportDialog(true);
      } else if (key === "Escape") {
        closeAllDialogs();
      }

      
      // Anunciar la acción si el lector de pantalla está activo
      if (screenReader && isOurShortcut) {
        const shortcut = keyboardShortcuts.find((s) => {
          const keys = s.key.split(" + ")
          if (keys.length === 1) {
            return key === keys[0] && !altKey && !ctrlKey && !metaKey
          } else if (keys.length === 2) {
            const [modifier, mainKey] = keys
            if (modifier === "Alt" && altKey && key.toLowerCase() === mainKey.toLowerCase()) return true
            if (modifier === "Ctrl" && (ctrlKey || metaKey) && key.toLowerCase() === mainKey.toLowerCase()) return true
          }
          return false
        })
        if (shortcut) {
          speakText(`Ejecutando: ${shortcut.description}`)
        }
      }
    },
    [screenReader, closeAllDialogs],
  )

  // Registrar el manejador de teclas
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])



  // Funciones para el lector de pantalla
  const initializeSpeechSynthesis = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.current = window.speechSynthesis
    }
  }

  const speakText = (text: string) => {
    if (!screenReader || !speechSynthesis.current) return

    // Cancelar cualquier síntesis en curso
    if (currentUtterance.current) {
      speechSynthesis.current.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 0.8

    currentUtterance.current = utterance
    speechSynthesis.current.speak(utterance)
  }

  const getElementDescription = (element: HTMLElement): string => {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute("role")
    const ariaLabel = element.getAttribute("aria-label")
    const title = element.getAttribute("title")
    const placeholder = element.getAttribute("placeholder")
    const textContent = element.textContent?.trim()

    // Priorizar aria-label y title
    if (ariaLabel) return ariaLabel
    if (title) return title

    // Descripciones específicas por tipo de elemento
    switch (tagName) {
      case "button":
        return `Botón: ${textContent || "sin texto"}`
      case "input":
        const inputType = element.getAttribute("type") || "text"
        return `Campo de ${inputType}: ${placeholder || textContent || "sin descripción"}`
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return `Título: ${textContent}`
      case "a":
        return `Enlace: ${textContent || "sin texto"}`
      case "img":
        const alt = element.getAttribute("alt")
        return `Imagen: ${alt || "sin descripción"}`
      case "nav":
        return `Navegación: ${textContent || "menú de navegación"}`
      case "main":
        return "Contenido principal"
      case "header":
        return "Encabezado de la página"
      case "footer":
        return "Pie de página"
      case "section":
        return `Sección: ${textContent?.substring(0, 50) || "contenido de sección"}`
      case "div":
        if (role === "button") return `Botón: ${textContent || "sin texto"}`
        if (role === "tab") return `Pestaña: ${textContent || "sin texto"}`
        if (role === "tabpanel") return `Panel de pestaña: ${textContent?.substring(0, 50) || "contenido del panel"}`
        if (element.classList.contains("card"))
          return `Tarjeta: ${textContent?.substring(0, 50) || "contenido de tarjeta"}`
        break
      case "select":
        return `Lista desplegable: ${textContent || "seleccionar opción"}`
      case "textarea":
        return `Área de texto: ${placeholder || "campo de texto multilínea"}`
      case "label":
        return `Etiqueta: ${textContent}`
      case "span":
        if (element.classList.contains("badge")) return `Insignia: ${textContent}`
        break
    }

    // Si tiene un icono (SVG), intentar describir el contexto
    const svg = element.querySelector("svg")
    if (svg) {
      const parentText = element.textContent?.trim()
      return `Icono: ${parentText || "elemento interactivo"}`
    }

    // Fallback general
    if (textContent && textContent.length > 0) {
      return textContent.length > 100 ? `${textContent.substring(0, 100)}...` : textContent
    }

    return "Elemento interactivo"
  }

  const handleMouseEnter = (event: React.MouseEvent<Element>) => {
    if (!screenReader) return
    const element = event.currentTarget
    if (element instanceof HTMLElement) {
      const description = getElementDescription(element)
      speakText(description)
    }
  }

  const handleMouseLeave = () => {
    if (!screenReader || !speechSynthesis.current) return
    // Opcional: cancelar la síntesis cuando el mouse sale del elemento
    // speechSynthesis.current.cancel()
  }

  // Inicializar síntesis de voz
  useEffect(() => {
    initializeSpeechSynthesis()
  }, [])

  // Efecto para manejar el cambio del lector de pantalla
  useEffect(() => {
    if (screenReader) {
      speakText("Lector de pantalla activado. Pase el mouse sobre los elementos para escuchar su descripción.")
    } else {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel()
      }
    }
  }, [screenReader])

  // Funciones para limpiar formularios
  // const clearExportForm = () => {
  //   setExportForm(initialExportForm)
  //   setFormErrors({})
  //   showFeedback("info", "Filtros de exportación limpiados")
  // }

  // const clearAlertConfigForm = () => {
  //   setAlertConfigForm(initialAlertConfigForm)
  //   setFormErrors({})
  //   showFeedback("info", "Configuración de alertas limpiada")
  // }

  const clearAdvancedSearchForm = () => {
    setAdvancedSearchForm(initialAdvancedSearchForm)
    setFormErrors({})
    showFeedback("info", "Filtros de búsqueda avanzada limpiados")
  }

  const clearWaterQualityForm = () => {
    setWaterQualityForm(initialWaterQualityForm)
    setFormErrors({})
    showFeedback("info", "Filtros de calidad del agua limpiados")
  }

  const clearBiodiversityForm = () => {
    setBiodiversityForm(initialBiodiversityForm)
    setFormErrors({})
    showFeedback("info", "Filtros de biodiversidad limpiados")
  }

  const clearContaminationForm = () => {
    setContaminationForm(initialContaminationForm)
    setFormErrors({})
    showFeedback("info", "Filtros de contaminación limpiados")
  }

  const clearPhysicalConditionsForm = () => {
    setPhysicalConditionsForm(initialPhysicalConditionsForm)
    setFormErrors({})
    showFeedback("info", "Filtros de condiciones físicas limpiados")
  }

  const clearMonitoringStationsForm = () => {
    setMonitoringStationsForm(initialMonitoringStationsForm)
    setFormErrors({})
    showFeedback("info", "Formulario de estaciones limpiado")
  }

  const clearReportsForm = () => {
    setReportsForm(initialReportsForm)
    setFormErrors({})
    showFeedback("info", "Configuración de reportes limpiada")
  }

  // Funciones de utilidad para mostrar feedback
  const showFeedback = (type: "success" | "error" | "info", message: string) => {
    setOperationFeedback({ type, message, show: true })
    setTimeout(() => {
      setOperationFeedback((prev) => ({ ...prev, show: false }))
    }, 5000)
  }

  // Funciones de validación
  const validateEmail = (email: string): string => {
    if (!email) return "Email requerido"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido"
    return ""
  }

  const validatePassword = (password: string): string => {
    if (password.length < 8) return "Contraseña débil - mínimo 8 caracteres"
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return "Contraseña debe incluir mayúsculas, minúsculas y números"
    return ""
  }

  const validateDateRange = (start: string, end: string): string => {
    if (!start || !end) return "Ambas fechas son requeridas"
    if (new Date(start) > new Date(end)) return "Fecha de inicio debe ser anterior a fecha de fin"
    return ""
  }

  // Función para login REAL
  const handleLogin = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (!loginForm.email) errors.email = "Email requerido"
    else if (validateEmail(loginForm.email)) errors.email = validateEmail(loginForm.email)

    if (!loginForm.password) errors.password = "Contraseña requerida"

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCurrentUser(result.user)
        setIsLoggedIn(true)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        setShowLoginDialog(false)
        setLoginForm({ email: "", password: "" })
        showFeedback("success", "Inicio de sesión exitoso")
      } else {
        setFormErrors({ general: result.message })
      }
    } catch (error) {
      setFormErrors({ general: "Error de conexión. Intente nuevamente." })
    }

    setIsLoading(false)
  }

  // Función para guardar borrador
  const saveDraft = async (formType: string, formData: any, name?: string) => {
    if (!currentUser) {
      showFeedback("error", "Debe iniciar sesión para guardar borradores")
      return
    }

    const finalName = name && name.trim() !== "" ? name : `Borrador ${new Date().toLocaleString()}`

    try {
      const response = await fetch("/api/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          form_type: formType,
          form_data: formData,
          draft_name: finalName,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", "Borrador guardado exitosamente")
      } else {
        showFeedback("error", result.message)
      }
    } catch (error) {
      showFeedback("error", "Error al guardar borrador")
    }
  }

  // Función para cargar borradores
  const loadDrafts = async (formType: string) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/load-drafts?user_id=${currentUser.id}&form_type=${formType}`)
      const result = await response.json()

      if (result.success) {
        setAvailableDrafts(result.drafts)
        setCurrentFormType(formType)
        setShowDraftsDialog(true)
      } else {
        showFeedback("error", result.message)
      }
    } catch (error) {
      showFeedback("error", "Error al cargar borradores")
    }
  }

  // Función para aplicar borrador
  const applyDraft = (draft: any) => {
    const formData = draft.form_data

    switch (currentFormType) {
      case "export_data":
        setExportForm(formData)
        break
      case "water_quality":
        setWaterQualityForm(formData)
        break
      case "biodiversity":
        setBiodiversityForm(formData)
        break
      case "contamination":
        setContaminationForm(formData)
        break
      case "physical_conditions":
        setPhysicalConditionsForm(formData)
        break
      case "monitoring_stations":
        setMonitoringStationsForm(formData)
        break
      case "reports":
        setReportsForm(formData)
        break
      case "advanced_search":
        setAdvancedSearchForm(formData)
        break
      case "alert_config":
        setAlertConfigForm(formData)
        break
    }

    setShowDraftsDialog(false)
    showFeedback("success", "Borrador aplicado exitosamente")
  }

  // Función para búsqueda avanzada REAL
  const handleAdvancedSearch = async () => {
    setIsLoading(true)
    setFormErrors({})
    // Validaciones
    const errors: Record<string, string> = {}
    if (!advancedSearchForm.keywords.trim()) {
      errors.keywords = "Palabras clave requeridas"
    }
    if (advancedSearchForm.dateRange.start && advancedSearchForm.dateRange.end) {
      const dateError = validateDateRange(advancedSearchForm.dateRange.start, advancedSearchForm.dateRange.end)
      if (dateError) errors.dateRange = dateError
    }
    if (advancedSearchForm.location.lat && advancedSearchForm.location.lng) {
      const lat = Number.parseFloat(advancedSearchForm.location.lat)
      const lng = Number.parseFloat(advancedSearchForm.location.lng)
      if (isNaN(lat) || lat < -90 || lat > 90) errors.latitude = "Latitud inválida (-90 a 90)"
      if (isNaN(lng) || lng < -180 || lng > 180) errors.longitude = "Longitud inválida (-180 a 180)"
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      // Simular búsqueda con resultados variados basados en las palabras clave
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simular tiempo de búsqueda

      const keywords = advancedSearchForm.keywords.toLowerCase()
      let simulatedResults: any[] = []

      // Simular diferentes tipos de resultados basados en palabras clave
      if (keywords.includes("ph") || keywords.includes("acidez")) {
        simulatedResults = [
          {
            id: 1,
            type: "measurement",
            title: "Mediciones de pH - Estación Bahía Norte",
            description: "Valores de pH registrados en las últimas 24 horas",
            data: { value: 7.8, unit: "pH", timestamp: "2024-01-15 14:30", status: "normal" },
            location: "Bahía Norte",
            category: "Calidad del Agua",
          },
          {
            id: 2,
            type: "measurement",
            title: "Mediciones de pH - Estación Puerto Sur",
            description: "Valores de pH con tendencia a la baja",
            data: { value: 7.2, unit: "pH", timestamp: "2024-01-15 14:25", status: "warning" },
            location: "Puerto Sur",
            category: "Calidad del Agua",
          },
        ]
      } else if (keywords.includes("temperatura") || keywords.includes("temp")) {
        simulatedResults = [
          {
            id: 3,
            type: "measurement",
            title: "Temperatura del Agua - Múltiples Estaciones",
            description: "Registro de temperaturas en tiempo real",
            data: { value: 24.9, unit: "°C", timestamp: "2024-01-15 14:35", status: "normal" },
            location: "Todas las estaciones",
            category: "Condiciones Físicas",
          },
          {
            id: 4,
            type: "alert",
            title: "Alerta de Temperatura Elevada",
            description: "Temperatura por encima del promedio histórico",
            data: { value: 26.3, unit: "°C", threshold: 25.5, timestamp: "2024-01-15 13:45", status: "alert" },
            location: "Costa Central",
            category: "Alertas",
          },
        ]
      } else if (keywords.includes("oxigeno") || keywords.includes("o2")) {
        simulatedResults = [
          {
            id: 5,
            type: "measurement",
            title: "Niveles de Oxígeno Disuelto",
            description: "Concentración de oxígeno en el agua marina",
            data: { value: 8.1, unit: "mg/L", timestamp: "2024-01-15 14:40", status: "good" },
            location: "Arrecife Este",
            category: "Calidad del Agua",
          },
        ]
      } else if (keywords.includes("contaminacion") || keywords.includes("contaminante")) {
        simulatedResults = [
          {
            id: 6,
            type: "alert",
            title: "Detección de Microplásticos",
            description: "Concentración elevada de partículas plásticas",
            data: { value: 45, unit: "partículas/L", threshold: 30, timestamp: "2024-01-15 12:15", status: "critical" },
            location: "Puerto Sur",
            category: "Contaminación",
          },
          {
            id: 7,
            type: "measurement",
            title: "Análisis de Hidrocarburos",
            description: "Niveles de hidrocarburos en agua marina",
            data: { value: 0.02, unit: "mg/L", timestamp: "2024-01-15 11:30", status: "low" },
            location: "Bahía Norte",
            category: "Contaminación",
          },
        ]
      } else if (keywords.includes("biodiversidad") || keywords.includes("especies")) {
        simulatedResults = [
          {
            id: 8,
            type: "species",
            title: "Registro de Especies Marinas",
            description: "Censo de biodiversidad en arrecifes coralinos",
            data: { count: 89, category: "Peces", timestamp: "2024-01-15 10:00", status: "stable" },
            location: "Arrecife Este",
            category: "Biodiversidad",
          },
          {
            id: 9,
            type: "species",
            title: "Especies en Riesgo Detectadas",
            description: "Identificación de especies con estado de conservación vulnerable",
            data: { count: 3, category: "Especies vulnerables", timestamp: "2024-01-15 09:15", status: "concern" },
            location: "Coral Norte",
            category: "Biodiversidad",
          },
        ]
      } else if (keywords.includes("estacion") || keywords.includes("monitoreo")) {
        simulatedResults = [
          {
            id: 10,
            type: "station",
            title: "Estado de Estaciones de Monitoreo",
            description: "Información operacional de las estaciones",
            data: { active: 4, warning: 2, offline: 1, timestamp: "2024-01-15 14:45", status: "operational" },
            location: "Red de monitoreo",
            category: "Infraestructura",
          },
        ]
      } else {
        // Si no coincide con palabras clave específicas, simular búsqueda general
        const shouldFindResults = Math.random() > 0.3 // 70% de probabilidad de encontrar algo

        if (shouldFindResults) {
          simulatedResults = [
            {
              id: 11,
              type: "general",
              title: "Datos Ambientales Generales",
              description: "Información general del sistema de monitoreo",
              data: { stations: 6, parameters: 12, alerts: 3, timestamp: "2024-01-15 14:50", status: "active" },
              location: "Sistema completo",
              category: "General",
            },
          ]
        }
      }

      // Filtrar por categoría si se especificó
      if (advancedSearchForm.category !== "all") {
        const categoryMap: Record<string, string> = {
          stations: "Infraestructura",
          parameters: "Calidad del Agua",
          alerts: "Alertas",
          reports: "General",
        }
        const targetCategory = categoryMap[advancedSearchForm.category]
        if (targetCategory) {
          simulatedResults = simulatedResults.filter((result) => result.category === targetCategory)
        }
      }

      // Limitar resultados según maxResults
      const maxResults = Number.parseInt(advancedSearchForm.maxResults)
      if (simulatedResults.length > maxResults) {
        simulatedResults = simulatedResults.slice(0, maxResults)
      }

      setSearchResults(simulatedResults)

      if (simulatedResults.length > 0) {
        showFeedback("success", `Búsqueda completada. ${simulatedResults.length} resultados encontrados.`)
        // Agregar a historial de búsqueda
        const newSearch = advancedSearchForm.keywords
        setSearchHistory((prev) => [newSearch, ...prev.filter((s) => s !== newSearch)].slice(0, 10))

        // Mostrar modal de resultados
        setShowSearchResults(true)
      } else {
        showFeedback("info", "No se encontraron resultados que coincidan con los criterios de búsqueda.")
        setSearchResults([])
        setShowSearchResults(true) // Mostrar modal incluso sin resultados
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Search error:", error)
    }
    setIsLoading(false)
  }

  // Función para exportar datos REAL (simulada)
  const handleExportData = async () => {
    setIsLoading(true)
    setExportProgress(0)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (!exportForm.dateStart || !exportForm.dateEnd) {
      errors.dateRange = "Rango de fechas requerido"
    } else {
      const dateError = validateDateRange(exportForm.dateStart, exportForm.dateEnd)
      if (dateError) errors.dateRange = dateError
    }

    if (exportForm.parameters.length === 0) {
      errors.parameters = "Seleccione al menos un parámetro"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      // Simulación de progreso de exportación
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      const result = { success: true, downloadUrl: "#", filename: "datos_ambientales.csv" } // Simulated result

      clearInterval(progressInterval)
      setExportProgress(100)

      if (result.success) {
        // Simular descarga del archivo
        const link = document.createElement("a")
        link.href = result.downloadUrl
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setExportSuccess(true)
        showFeedback("success", "Datos exportados exitosamente")

        setTimeout(() => {
          setShowExportDialog(false)
          setExportSuccess(false)
          setExportProgress(0)
        }, 2000)
      } else {
        showFeedback("error", "Error en la exportación")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Export error:", error)
    }

    setIsLoading(false)
  }

  // Función para análisis de calidad del agua REAL
  const handleWaterQualityAnalysis = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (waterQualityForm.parameters.length === 0) {
      errors.parameters = "Seleccione al menos un parámetro"
    }

    if (waterQualityForm.stations.length === 0) {
      errors.stations = "Seleccione al menos una estación"
    }

    if (
      waterQualityForm.analysisType === "historical" &&
      (!waterQualityForm.dateRange.start || !waterQualityForm.dateRange.end)
    ) {
      errors.dateRange = "Rango de fechas requerido para análisis histórico"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/water-quality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          analysis_type: waterQualityForm.analysisType,
          parameters: waterQualityForm.parameters,
          stations: waterQualityForm.stations,
          date_range_start: waterQualityForm.dateRange.start,
          date_range_end: waterQualityForm.dateRange.end,
          comparison_mode: waterQualityForm.comparisonMode,
          alert_thresholds: waterQualityForm.alertThresholds,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", `Análisis completado. ${result.results.measurements_processed} mediciones procesadas.`)
        setShowWaterQuality(false)
      } else {
        showFeedback("error", result.message || "Error en el análisis")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Water quality analysis error:", error)
    }

    setIsLoading(false)
  }

  // Función para monitoreo de biodiversidad REAL
  const handleBiodiversityMonitoring = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (biodiversityForm.taxonomicGroups.length === 0) {
      errors.taxonomicGroups = "Seleccione al menos un grupo taxonómico"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/biodiversity-monitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          monitoring_type: biodiversityForm.monitoringType,
          taxonomic_groups: biodiversityForm.taxonomicGroups,
          conservation_status: biodiversityForm.conservationStatus,
          sampling_method: biodiversityForm.samplingMethod,
          include_rare_species: biodiversityForm.includeRareSpecies,
          generate_report: biodiversityForm.generateReport,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", `Monitoreo iniciado. ${result.results.species_registered} especies registradas.`)
        if (biodiversityForm.generateReport) {
          showFeedback("info", "Generando reporte de biodiversidad...")
        }
        setShowBiodiversity(false)
      } else {
        showFeedback("error", result.message || "Error en el monitoreo")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Biodiversity monitoring error:", error)
    }

    setIsLoading(false)
  }

  // Función para análisis de contaminación REAL
  const handleContaminationAnalysis = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (contaminationForm.contaminantTypes.length === 0) {
      errors.contaminantTypes = "Seleccione al menos un tipo de contaminante"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/contamination-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          contaminant_types: contaminationForm.contaminantTypes,
          severity_level: contaminationForm.severityLevel,
          sources: contaminationForm.sources,
          mitigation_actions: contaminationForm.mitigationActions,
          notify_authorities: contaminationForm.notifyAuthorities,
          emergency_protocol: contaminationForm.emergencyProtocol,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", `Análisis completado. ${result.results.alerts_generated} alertas generadas.`)
        if (contaminationForm.notifyAuthorities) {
          showFeedback("info", "Notificando a las autoridades competentes...")
        }
        if (contaminationForm.emergencyProtocol) {
          showFeedback("info", "Activando protocolo de emergencia...")
        }
        setShowContamination(false)
      } else {
        showFeedback("error", result.message || "Error en el análisis")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Contamination analysis error:", error)
    }

    setIsLoading(false)
  }

  // Función para condiciones físicas REAL
  const handlePhysicalConditionsConfig = async () => {
    setIsLoading(true)
    setFormErrors({})

    try {
      const response = await fetch("/api/physical-conditions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          parameters: physicalConditionsForm.parameters,
          measurement_interval: physicalConditionsForm.measurementInterval,
          extreme_condition_alerts: physicalConditionsForm.extremeConditionAlerts,
          weather_integration: physicalConditionsForm.weatherIntegration,
          forecast_period: physicalConditionsForm.forecastPeriod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", "Configuración de monitoreo físico guardada exitosamente.")
        setShowPhysicalConditions(false)
      } else {
        showFeedback("error", result.message || "Error en la configuración")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Physical conditions error:", error)
    }

    setIsLoading(false)
  }

  // Función para gestión de estaciones REAL
  const handleStationManagement = async () => {
    setIsLoading(true)
    setFormErrors({})

    if (monitoringStationsForm.action === "add" || monitoringStationsForm.action === "edit") {
      // Validaciones para agregar/editar estación
      const errors: Record<string, string> = {}
      if (!monitoringStationsForm.stationData.name) errors.name = "Nombre requerido"
      if (!monitoringStationsForm.stationData.latitude) errors.latitude = "Latitud requerida"
      if (!monitoringStationsForm.stationData.longitude) errors.longitude = "Longitud requerida"

      const lat = Number.parseFloat(monitoringStationsForm.stationData.latitude)
      const lng = Number.parseFloat(monitoringStationsForm.stationData.longitude)
      if (isNaN(lat) || lat < -90 || lat > 90) errors.latitude = "Latitud inválida"
      if (isNaN(lng) || lng < -180 || lng > 180) errors.longitude = "Longitud inválida"

      if (monitoringStationsForm.stationData.sensors.length === 0) {
        errors.sensors = "Seleccione al menos un sensor"
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch("/api/station-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          action_type: monitoringStationsForm.action,
          station_name: monitoringStationsForm.stationData.name,
          latitude: monitoringStationsForm.stationData.latitude,
          longitude: monitoringStationsForm.stationData.longitude,
          station_type: monitoringStationsForm.stationData.type,
          sensors: monitoringStationsForm.stationData.sensors,
          maintenance_schedule: monitoringStationsForm.stationData.maintenanceSchedule,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", result.message)
        setShowMonitoringStations(false)
      } else {
        showFeedback("error", result.message || "Error en la gestión de estaciones")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Station management error:", error)
    }

    setIsLoading(false)
  }

  // Función para generar reportes REAL
  const handleGenerateReport = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (reportsForm.autoSend && reportsForm.recipients.length === 0) {
      errors.recipients = "Agregue al menos un destinatario para envío automático"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          report_type: reportsForm.reportType,
          format: reportsForm.format,
          include_charts: reportsForm.includeCharts,
          auto_send: reportsForm.autoSend,
          recipients: reportsForm.recipients,
          custom_parameters: reportsForm.customParameters,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showFeedback("success", result.message)
        // Simular descarga del reporte
        const link = document.createElement("a")
        link.href = result.download_url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (reportsForm.autoSend) {
          showFeedback("info", `Reporte enviado a ${reportsForm.recipients.length} destinatarios.`)
        }
        setShowReports(false)
      } else {
        showFeedback("error", result.message || "Error al generar reporte")
      }
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Report generation error:", error)
    }

    setIsLoading(false)
  }

  // Función para configurar alertas REAL
  const handleAlertConfiguration = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (!alertConfigForm.parameter) errors.parameter = "Parámetro requerido"
    if (!alertConfigForm.minThreshold) errors.minThreshold = "Umbral mínimo requerido"
    if (!alertConfigForm.maxThreshold) errors.maxThreshold = "Umbral máximo requerido"

    if (alertConfigForm.minThreshold && alertConfigForm.maxThreshold) {
      if (Number.parseFloat(alertConfigForm.minThreshold) >= Number.parseFloat(alertConfigForm.maxThreshold)) {
        errors.thresholds = "Umbral mínimo debe ser menor que el máximo"
      }
    }

    if (alertConfigForm.emailNotifications && !alertConfigForm.email) {
      errors.email = "Email requerido para notificaciones"
    } else if (alertConfigForm.email && validateEmail(alertConfigForm.email)) {
      errors.email = validateEmail(alertConfigForm.email)
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      // Simular configuración de alertas (puedes crear una API real si lo deseas)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAlertConfigSuccess(true)
      showFeedback("success", "Configuración de alertas guardada exitosamente")

      setTimeout(() => {
        setShowAlertConfig(false)
        setAlertConfigSuccess(false)
      }, 2000)
    } catch (error) {
      showFeedback("error", "Error de conexión. Intente nuevamente.")
      console.error("Alert config error:", error)
    }

    setIsLoading(false)
  }

  // Función para registro de usuario REAL (ya existente)
  const handleUserRegistration = async () => {
    setIsLoading(true)
    setFormErrors({})

    // Validaciones
    const errors: Record<string, string> = {}
    if (!userRegistrationForm.name) errors.name = "Nombre requerido"
    if (!userRegistrationForm.email) errors.email = "Email requerido"
    else if (validateEmail(userRegistrationForm.email)) errors.email = validateEmail(userRegistrationForm.email)

    if (!userRegistrationForm.institution) errors.institution = "Institución requerida"
    if (!userRegistrationForm.role) errors.role = "Rol requerido"
    if (!userRegistrationForm.password) errors.password = "Contraseña requerida"
    else if (validatePassword(userRegistrationForm.password))
      errors.password = validatePassword(userRegistrationForm.password)

    if (userRegistrationForm.password !== userRegistrationForm.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      // Llamada real a la API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userRegistrationForm.name,
          email: userRegistrationForm.email,
          institution: userRegistrationForm.institution,
          role: userRegistrationForm.role,
          password: userRegistrationForm.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRegistrationSuccess(true)
        setCurrentUser({
          id: result.user_id,
          name: userRegistrationForm.name,
          email: userRegistrationForm.email,
          institution: userRegistrationForm.institution,
          role: userRegistrationForm.role,
        })
        setIsLoggedIn(true)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: result.user_id,
            name: userRegistrationForm.name,
            email: userRegistrationForm.email,
            institution: userRegistrationForm.institution,
            role: userRegistrationForm.role,
          }),
        )

        setShowUserRegistration(false)
        setUserRegistrationForm({
          name: "",
          email: "",
          institution: "",
          role: "",
          password: "",
          confirmPassword: "",
        })
        showFeedback("success", "Usuario registrado exitosamente")
      } else {
        setFormErrors({ general: result.message })
      }
    } catch (error) {
      setFormErrors({ general: "Error de conexión. Intente nuevamente." })
    }

    setIsLoading(false)
  }

  // useEffect para manejar el mensaje de registro exitoso
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        setRegistrationSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [registrationSuccess])

  // Manejar clic fuera del área de búsqueda
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSuggestions(e.target.value.length > 0)
  }

  // Manejar selección de sugerencia
  const handleSuggestionClick = (sectionId: string) => {
    setCurrentView(sectionId)
    setSearchQuery("")
    setShowSuggestions(false)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentView("map")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("currentUser")
    showFeedback("info", "Sesión cerrada exitosamente")
  }

  // Función para cambiar vista
  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  // Filtrar estaciones según filtros aplicados
  const filteredStations = monitoringStations.filter((station) => {
    let matchesStatus = true

    switch (stationFilter) {
      case "active":
        matchesStatus = station.status === "active"
        break
      case "warning":
        matchesStatus = station.status === "warning" || station.alerts > 0
        break
      case "offline":
        matchesStatus = station.status === "offline"
        break
    }

    const matchesSearch = searchQuery === "" || station.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })
  // Componente de Gráfico de Tendencias Ficticio
  const TrendsChart = () => (
    <div className="space-y-6">
      <Card className={highContrast ? "bg-white text-black border-white" : ""}>
        <CardHeader>
          <CardTitle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {t.phTrends}
          </CardTitle>
          <CardDescription
            className={highContrast ? "text-gray-600" : ""}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {t.last24Hours}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="h-48 sm:h-64 relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Gráfico de tendencias de pH"
          >
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Línea de tendencia pH */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points="0,100 50,95 100,90 150,85 200,88 250,92 300,89 350,87 400,85"
              />
              {/* Puntos de datos */}
              {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x, i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={100 - i * 2}
                  r="3"
                  fill="#3b82f6"
                  className={`hover:r-5 ${!animations ? "" : "transition-all"} cursor-pointer`}
                />
              ))}
              {/* Líneas de referencia */}
              <line x1="0" y1="50" x2="400" y2="50" stroke="#ef4444" strokeDasharray="5,5" opacity="0.5" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#ef4444" strokeDasharray="5,5" opacity="0.5" />
            </svg>
            <div className="absolute top-2 right-2 text-xs text-muted-foreground">pH: 7.2 - 8.1</div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={highContrast ? "bg-white text-black border-white" : ""}>
          <CardHeader>
            <CardTitle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              {t.dissolvedOxygen}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-24 sm:h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-end justify-around p-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Gráfico de barras de oxígeno disuelto"
            >
              {[8.2, 7.9, 6.8, 8.5, 7.1].map((value, i) => (
                <div
                  key={i}
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${(value / 10) * 100}%`, width: "15%" }}
                  title={`${value} mg/L`}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className={highContrast ? "bg-white text-black border-white" : ""}>
          <CardHeader>
            <CardTitle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              {t.temperature}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-24 sm:h-32 bg-gradient-to-r from-orange-100 to-red-200 rounded flex items-end justify-around p-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Gráfico de barras de temperatura"
            >
              {[24.5, 25.1, 26.3, 23.8, 25.8].map((value, i) => (
                <div
                  key={i}
                  className="bg-orange-500 rounded-t"
                  style={{ height: `${((value - 20) / 10) * 100}%`, width: "15%" }}
                  title={`${value}°C`}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // useEffect for accessibility classes on body/html
  useEffect(() => {
    const rootElement = document.documentElement

    // Aplicar alto contraste
    if (highContrast) {
      rootElement.classList.add("high-contrast-mode")
    } else {
      rootElement.classList.remove("high-contrast-mode")
    }

    // Aplicar tamaño de fuente
    rootElement.style.fontSize = `${fontSize[0]}px`

    // Aplicar fuente para dislexia
    if (dyslexiaFont) {
      rootElement.classList.add("dyslexia-font-mode")
    } else {
      rootElement.classList.remove("dyslexia-font-mode")
    }

    // Aplicar modo lector de pantalla
    if (screenReader) {
      rootElement.classList.add("sr-mode-active")
    } else {
      rootElement.classList.remove("sr-mode-active")
    }

    // Aplicar pausar animaciones
    if (!animations) {
      rootElement.classList.add("animations-disabled")
    } else {
      rootElement.classList.remove("animations-disabled")
    }

    // Aplicar modo monocromático
    if (monochromeMode) {
      rootElement.classList.add("monochrome-mode")
    } else {
      rootElement.classList.remove("monochrome-mode")
    }

    // Aplicar color de tema
    if (selectedThemeColor !== "default") {
      const selectedColor = themeColors.find((color) => color.id === selectedThemeColor)
      if (selectedColor && selectedColor.hsl !== "default") {
        rootElement.style.setProperty("--primary", `hsl(${selectedColor.hsl})`)
        rootElement.style.setProperty("--accent", `hsl(${selectedColor.hsl})`)
        rootElement.classList.add("custom-theme-active")
      }
    } else {
      rootElement.classList.remove("custom-theme-active")
      // Restaurar colores por defecto
      rootElement.style.removeProperty("--primary")
      rootElement.style.removeProperty("--accent")
    }

    return () => {
      // Cleanup
      rootElement.classList.remove(
        "high-contrast-mode",
        "dyslexia-font-mode",
        "sr-mode-active",
        "animations-disabled",
        "monochrome-mode",
        "custom-theme-active",
      )
    }
  }, [highContrast, fontSize, dyslexiaFont, screenReader, animations, monochromeMode, selectedThemeColor])

  return (
    <div
      className={`min-h-screen ${highContrast ? "bg-black text-white" : "bg-gray-50"} ${dyslexiaFont ? "font-mono" : ""}`}
      style={{
        fontSize: `${fontSize[0]}px`,
        transform: `scale(${zoomLevel})`,
        transformOrigin: "top left",
        lineHeight: lineSpacing,
        wordSpacing: `${wordSpacing}px`,
        letterSpacing: `${letterSpacing}px`
      }}
    >
      {/* Header mejorado */}
      <header className={`${highContrast ? "bg-black text-white border-white" : "bg-white border-gray-200"} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo y Título */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div className="flex items-center space-x-2">
                <Droplets
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${highContrast ? "text-white" : "text-blue-600"} flex-shrink-0`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Icono de gota de agua"
                />
                <h1
                  className="hidden sm:block text-sm sm:text-xl font-bold truncate"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {t.dashboardTitle}
                </h1>
              </div>
            </div>


            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-xs sm:max-w-2xl mx-2 sm:mx-8 relative" ref={searchRef}>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${highContrast ? "text-gray-300" : "text-gray-400"}`}
                />
                <Input
                  placeholder={t.searchPlaceholder}
                  className={`pl-10 w-full text-sm ${highContrast ? "bg-white text-black border-white placeholder:text-gray-500" : ""}`}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Campo de búsqueda principal"
                />
                {/* Sugerencias de búsqueda */}
                {showSuggestions && filteredSections.length > 0 && (
                  <div
                    className={`absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg ${highContrast ? "border border-white" : "border border-gray-200"} ${!animations ? "" : "transition-all"}`}
                  >
                    <div className="py-1">
                      {filteredSections.map((section) => {
                        const Icon = section.icon
                        return (
                          <div
                            key={section.id}
                            className={`px-4 py-2 cursor-pointer flex items-center ${highContrast ? "hover:bg-gray-800 text-white" : "hover:bg-gray-100"} ${!animations ? "" : "transition-colors"}`}
                            onClick={() => handleSuggestionClick(section.id)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label={`Sugerencia: ${section.name}`}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            <span className="text-sm">{section.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Controles de header */}
            <div className="flex items-center space-x-1 sm:space-x-4">
                            {/* Botón de atajos de teclado */}
              <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
                <DialogTrigger asChild>
                  <div className="flex flex-col items-center cursor-pointer">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Atajos de teclado (Alt+K)"
                      title="Alt+K"
                    >
                      <Keyboard className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <span className="text-xs hidden sm:block">{t.shortcuts}</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Keyboard className="h-5 w-5 mr-2" />
                      {t.keyboardShortcuts}
                    </DialogTitle>
                    <DialogDescription>
                      {t.shortcutsDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">{t.generalNavigation}</h3>
                        <div className="space-y-2">
                          {keyboardShortcuts.slice(0, 8).map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <span className="text-sm">{shortcut.description}</span>
                              <Badge variant="outline" className="font-mono text-xs">
                                {shortcut.key}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">{t.generalNavigation}</h3>
                        <div className="space-y-2">
                          {keyboardShortcuts.slice(8).map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded border">
                              <span className="text-sm">{shortcut.description}</span>
                              <Badge variant="outline" className="font-mono text-xs">
                                {shortcut.key}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>{t.navigationTips}</AlertTitle>
                      <AlertDescription>
                        • {t.tabNavigation}
                        <br />• {t.enterActivation}
                        <br />• {t.spaceActivation}
                        <br />• {t.numberNavigation}
                        <br />• {t.escapeClose}
                      </AlertDescription>
                    </Alert>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Usuario logueado o botón de acceder */}
              {isLoggedIn && currentUser ? (
                <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex flex-col items-center cursor-pointer">
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 px-2 sm:px-3 h-8 w-8 sm:h-10 sm:w-10"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        aria-label="Menú de usuario"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <span className="text-xs hidden sm:block">{t.userMenu}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    {/* Editar Información de Usuario */}
                    <DropdownMenuItem
                      onClick={() => setShowEditUserDialog(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Editar Información de Usuario
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex flex-col items-center cursor-pointer">
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 px-2 sm:px-3 h-8 w-8 sm:h-10 sm:w-10"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        aria-label="Opciones de acceso"
                      >
                        <LogIn className="h-4 w-4" />
                      </Button>
                      <span className="text-xs hidden sm:block">{t.accessMenu}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opciones de Acceso</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setShowLoginDialog(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {t.login}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowUserRegistration(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Registro de Usuario
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Búsqueda avanzada */}
              <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedSearch}>
                <DialogTrigger asChild>
                  <div className="flex flex-col items-center cursor-pointer">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Búsqueda avanzada (Alt+F)"
                    >
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <span className="text-xs hidden sm:block">{t.advancedSearch}</span>
                  </div>
                </DialogTrigger>
                <DialogContent
                  className={`max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto ${!animations ? "" : "transition-all"}`}
                >
                  <DialogHeader>
                    <DialogTitle
                      className="text-lg sm:text-xl"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      Búsqueda Avanzada de Datos Ambientales
                    </DialogTitle>
                    <DialogDescription
                      className="text-sm"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      Utilice filtros avanzados para encontrar información específica
                    </DialogDescription>
                  </DialogHeader>
                  {/* Botones de borrador */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveDraft("advanced_search", advancedSearchForm, draftName)}
                        disabled={!currentUser}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Borrador
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadDrafts("advanced_search")}
                        disabled={!currentUser}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Cargar Borrador
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAdvancedSearchForm}
                        className="w-full sm:w-auto bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    </div>
                    {currentUser && (
                      <Input
                        placeholder="Nombre del borrador"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-48"
                      />
                    )}
                  </div>
                  {/* Mostrar resultados de búsqueda si existen */}
                  {searchResults.length > 0 && (
                    <div className="mb-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Resultados de Búsqueda</AlertTitle>
                        <AlertDescription>
                          Se encontraron {searchResults.length} resultados que coinciden con sus criterios.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo de Búsqueda</Label>
                        <RadioGroup
                          value={advancedSearchForm.searchType}
                          onValueChange={(value) => setAdvancedSearchForm((prev) => ({ ...prev, searchType: value }))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="comprehensive" id="comprehensive" />
                            <Label htmlFor="comprehensive">Búsqueda Integral</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="specific" id="specific" />
                            <Label htmlFor="specific">Búsqueda Específica</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="historical" id="historical" />
                            <Label htmlFor="historical">Análisis Histórico</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label>Palabras Clave *</Label>
                        <Textarea
                          placeholder="Ingrese términos de búsqueda separados por comas"
                          value={advancedSearchForm.keywords}
                          onChange={(e) => setAdvancedSearchForm((prev) => ({ ...prev, keywords: e.target.value }))}
                          className={formErrors.keywords ? "border-red-500" : ""}
                        />
                        {formErrors.keywords && (
                          <div className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.keywords}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Categoría</Label>
                        <Select
                          value={advancedSearchForm.category}
                          onValueChange={(value) => setAdvancedSearchForm((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            <SelectItem value="stations">{t.stations}</SelectItem>
                            <SelectItem value="parameters">Parámetros</SelectItem>
                            <SelectItem value="alerts">Alertas</SelectItem>
                            <SelectItem value="reports">Reportes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Máximo de Resultados</Label>
                        <Select
                          value={advancedSearchForm.maxResults}
                          onValueChange={(value) => setAdvancedSearchForm((prev) => ({ ...prev, maxResults: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50 resultados</SelectItem>
                            <SelectItem value="100">100 resultados</SelectItem>
                            <SelectItem value="250">250 resultados</SelectItem>
                            <SelectItem value="500">500 resultados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Ubicación Geográfica</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Latitud"
                            value={advancedSearchForm.location.lat}
                            onChange={(e) =>
                              setAdvancedSearchForm((prev) => ({
                                ...prev,
                                location: { ...prev.location, lat: e.target.value },
                              }))
                            }
                            className={formErrors.latitude ? "border-red-500" : ""}
                          />
                          <Input
                            placeholder="Longitud"
                            value={advancedSearchForm.location.lng}
                            onChange={(e) =>
                              setAdvancedSearchForm((prev) => ({
                                ...prev,
                                location: { ...prev.location, lng: e.target.value },
                              }))
                            }
                            className={formErrors.longitude ? "border-red-500" : ""}
                          />
                          <Input
                            placeholder="Radio (km)"
                            value={advancedSearchForm.location.radius}
                            onChange={(e) =>
                              setAdvancedSearchForm((prev) => ({
                                ...prev,
                                location: { ...prev.location, radius: e.target.value },
                              }))
                            }
                          />
                        </div>
                        {(formErrors.latitude || formErrors.longitude) && (
                          <div className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.latitude || formErrors.longitude}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Rango de Fechas</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={advancedSearchForm.dateRange.start}
                            onChange={(e) =>
                              setAdvancedSearchForm((prev) => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, start: e.target.value },
                              }))
                            }
                          />
                          <Input
                            type="date"
                            value={advancedSearchForm.dateRange.end}
                            onChange={(e) =>
                              setAdvancedSearchForm((prev) => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, end: e.target.value },
                              }))
                            }
                          />
                        </div>
                        {formErrors.dateRange && (
                          <div className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.dateRange}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Parámetros de Interés</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["pH", "Oxígeno", "Temperatura", "Salinidad", "Turbidez", "Contaminantes"].map((param) => (
                            <div key={param} className="flex items-center space-x-2">
                              <Checkbox
                                id={`param-${param}`}
                                checked={advancedSearchForm.parameters.includes(param)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAdvancedSearchForm((prev) => ({
                                      ...prev,
                                      parameters: [...prev.parameters, param],
                                    }))
                                  } else {
                                    setAdvancedSearchForm((prev) => ({
                                      ...prev,
                                      parameters: prev.parameters.filter((p) => p !== param),
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={`param-${param}`} className="text-sm">
                                {param}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-historical"
                            checked={advancedSearchForm.includeHistorical}
                            onCheckedChange={(checked) =>
                              setAdvancedSearchForm((prev) => ({
                                ...prev,
                                includeHistorical: !!checked,
                              }))
                            }
                          />
                          <Label htmlFor="include-historical">Incluir datos históricos</Label>
                        </div>
                        <div>
                          <Label>Ordenar por</Label>
                          <Select
                            value={advancedSearchForm.sortBy}
                            onValueChange={(value) => setAdvancedSearchForm((prev) => ({ ...prev, sortBy: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="relevance">Relevancia</SelectItem>
                              <SelectItem value="date">Fecha</SelectItem>
                              <SelectItem value="location">Ubicación</SelectItem>
                              <SelectItem value="priority">Prioridad</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAdvancedSearch(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAdvancedSearch} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          {t.search}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Alertas */}
              <DropdownMenu open={isAlertsMenuOpen} onOpenChange={setIsAlertsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex flex-col items-center cursor-pointer">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-8 w-8 sm:h-10 sm:w-10"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Alertas ambientales"
                    >
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {environmentalAlerts.length}
                      </Badge>
                    </Button>
                    <span className="text-xs hidden sm:block">{t.environmentalAlerts}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80">
                  <DropdownMenuLabel onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    {t.environmentalAlerts}
                  </DropdownMenuLabel>
                  {environmentalAlerts.map((alert) => (
                    <DropdownMenuItem
                      key={alert.id}
                      className="flex flex-col items-start p-3"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.level === "high"
                              ? "text-red-400"
                              : alert.level === "medium"
                                ? "text-yellow-400"
                                : "text-blue-400"
                          }`}
                        />
                        <span className="font-medium text-sm">{alert.message}</span>
                      </div>
                      <div className="flex justify-between w-full mt-1">
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                        <Badge variant="outline" className="text-xs">
                          {alert.station}
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Menú de Accesibilidad */}
              <Sheet open={isAccessibilityMenuOpen} onOpenChange={setIsAccessibilityMenuOpen}>
                <SheetTrigger asChild>
                  <div className="flex flex-col items-center cursor-pointer">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Opciones de accesibilidad"
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${highContrast ? "hover:bg-gray-800 text-white" : ""}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <span className="text-xs hidden sm:block">{t.accessibilityMenu}</span>
                  </div>
                </SheetTrigger>
                <SheetContent
                  className={`w-full sm:w-96 md:w-[480px] ${highContrast ? "bg-black text-white border-white" : ""} ${!animations ? "" : "transition-all"}`}
                >
                  <SheetHeader className="pb-4">
                    <SheetTitle
                      className={highContrast ? "text-white" : ""}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {t.accessibility}
                    </SheetTitle>
                    <SheetDescription
                      className={highContrast ? "text-gray-300" : ""}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {t.customizeInterface}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-4 px-2 pb-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    {/* Opciones para discapacidad visual */}
                    <div>
                      <h3
                        className="font-semibold mb-3 flex items-center text-base px-2"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t.visualOptions}
                      </h3>
                      <div className="space-y-3 pl-4 pr-2">
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="high-contrast"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.highContrast}
                          </label>
                          <Switch
                            id="high-contrast"
                            checked={highContrast}
                            onCheckedChange={setHighContrast}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Activar alto contraste"
                          />
                        </div>

                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="monochrome-mode"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.monochromaticMode}
                          </label>
                          <Switch
                            id="monochrome-mode"
                            checked={monochromeMode}
                            onCheckedChange={setMonochromeMode}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Activar modo monocromático"
                          />
                        </div>

                        <div className="space-y-2 py-1.5 px-2">
                          <label
                            className="text-sm font-medium block"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.textSize}
                          </label>
                          <div className="flex items-center space-x-3">
                            <ZoomOut
                              className={`h-4 w-4 ${highContrast ? "text-gray-300" : "text-muted-foreground"}`}
                            />
                            <Slider
                              value={fontSize}
                              onValueChange={setFontSize}
                              max={24}
                              min={12}
                              step={1}
                              className="flex-1"
                              aria-label="Tamaño de fuente"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            />
                            <ZoomIn className={`h-4 w-4 ${highContrast ? "text-gray-300" : "text-muted-foreground"}`} />
                          </div>
                          <div className="text-center pt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded ${highContrast ? "bg-white text-black" : "text-muted-foreground bg-muted"}`}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              {fontSize[0]}px
                            </span>
                          </div>
                        </div>

                        {/* Zoom controles */}
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label className="text-sm font-medium flex items-center">
                            <ZoomIn className="h-4 w-4 mr-2" />
                            {t.zoom}
                          </label>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 2))}
                              aria-label={t.increase}
                              className="h-7 w-7"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <span className="text-xs w-10 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.5))}
                              aria-label={t.decrease}
                              className="h-7 w-7"
                            >
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setZoomLevel(1)}
                              aria-label={t.reset}
                              className="h-7 w-7"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>



                        
                        {/* <div className="space-y-3 py-1.5 px-2">
                          <label
                            className="text-sm font-medium block flex items-center"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            <Palette className="h-4 w-4 mr-2" />
                            Color de tema
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {themeColors.map((themeColor) => (
                              <button
                                key={themeColor.id}
                                onClick={() => setSelectedThemeColor(themeColor.id)}
                                className={`
                                  relative w-full h-10 rounded-md border-2 transition-all
                                  ${themeColor.color}
                                  ${
                                    selectedThemeColor === themeColor.id
                                      ? "border-foreground ring-2 ring-ring"
                                      : "border-border hover:border-foreground/50"
                                  }
                                `}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                aria-label={`Seleccionar tema ${themeColor.name}`}
                                title={themeColor.name}
                              >
                                {selectedThemeColor === themeColor.id && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-muted-foreground">
                              Tema actual: {themeColors.find((c) => c.id === selectedThemeColor)?.name}
                            </span>
                          </div>
                        </div> */}

                        {/* Ajustar espaciado */}
                        <div className="space-y-2 py-1.5 px-2">
                          <label className="text-sm font-medium block">{t.lineSpacing || "Espaciado de línea"}</label>
                          <Slider
                            value={[lineSpacing]}
                            onValueChange={([v]) => setLineSpacing(v)}
                            min={1}
                            max={2.5}
                            step={0.1}
                            className="flex-1"
                            aria-label="Espaciado de línea"
                          />
                          <div className="text-xs text-center">{lineSpacing.toFixed(1)}x</div>
                        </div>
                        <div className="space-y-2 py-1.5 px-2">
                          <label className="text-sm font-medium block">{t.wordSpacing || "Espaciado de palabra"}</label>
                          <Slider
                            value={[wordSpacing]}
                            onValueChange={([v]) => setWordSpacing(v)}
                            min={0}
                            max={16}
                            step={1}
                            className="flex-1"
                            aria-label="Espaciado de palabra"
                          />
                          <div className="text-xs text-center">{wordSpacing}px</div>
                        </div>
                        <div className="space-y-2 py-1.5 px-2">
                          <label className="text-sm font-medium block">{t.letterSpacing || "Espaciado de caracter"}</label>
                          <Slider
                            value={[letterSpacing]}
                            onValueChange={([v]) => setLetterSpacing(v)}
                            min={0}
                            max={8}
                            step={0.5}
                            className="flex-1"
                            aria-label="Espaciado de caracter"
                          />
                          <div className="text-xs text-center">{letterSpacing}px</div>
                        </div>

                          {/* Fuente para dislexia */}
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="dyslexia-font"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.dyslexiaFont}
                          </label>
                          <Switch
                            id="dyslexia-font"
                            checked={dyslexiaFont}
                            onCheckedChange={setDyslexiaFont}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Activar fuente para dislexia"
                          />
                        </div>
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="screen-reader"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.screenReaderMode}
                          </label>
                          <Switch
                            id="screen-reader"
                            checked={screenReader}
                            onCheckedChange={setScreenReader}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Activar lector de pantalla"
                          />
                        </div>
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="animations"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.pauseAnimations}
                          </label>
                          <Switch
                            id="animations"
                            checked={!animations}
                            onCheckedChange={(checked) => setAnimations(!checked)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Pausar animaciones"
                          />
                        </div>
                      </div>
                    </div>
                    <Separator className={`my-3 ${highContrast ? "bg-white" : ""}`} />
                    <div className="flex items-center justify-between py-1.5 px-2">
                      <label className="text-sm font-medium flex items-center">
                        <Languages className="h-4 w-4 mr-2" />
                        {t.language}
                      </label>
                      <Select value={language} onValueChange={(value) => setLanguage(value as "es" | "en")}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">{t.spanish}</SelectItem>
                          <SelectItem value="en">{t.english}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator className={`my-3 ${highContrast ? "bg-white" : ""}`} />

                    {/* Opciones para discapacidad auditiva */}
                    <div>
                      <div className="flex items-center justify-between mb-3 px-2">
                        <h3
                          className="font-semibold flex items-center text-base"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          {t.audioOptions}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowExpandedAudioOptions(true)}
                          className="p-1 h-8 w-8"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          aria-label="Expandir opciones auditivas"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3 pl-4 pr-2">
                        <div
                          className={`relative w-full aspect-video mb-4 rounded-lg overflow-hidden border-2 ${showVideoAlert ? "border-red-500 animate-pulse" : "border-gray-200"}`}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          aria-label="Video educativo sobre ambiente costero"
                        >
                          <iframe
                            width="100%"
                            height="100%"
                            src={youtubeEmbedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          ></iframe>
                          {showVideoAlert && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 pointer-events-none">
                              <AlertCircle className="h-12 w-12 text-red-600 animate-bounce" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="auto-captions"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.automaticSubtitles}
                          </label>
                          <Switch
                            id="auto-captions"
                            checked={videoCaptionsEnabled}
                            onCheckedChange={setVideoCaptionsEnabled}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Activar subtítulos automáticos"
                          />
                        </div>
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <label
                            htmlFor="transcriptions"
                            className="text-sm font-medium"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.transcriptions}
                          </label>
                          <Switch
                            id="transcriptions"
                            checked={videoTranscriptionVisible}
                            onCheckedChange={setVideoTranscriptionVisible}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label="Mostrar transcripciones"
                          />
                        </div>
                        {videoTranscriptionVisible && (
                          <div className="space-y-2 mt-4">
                            <Label onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                              Transcripción del Video
                            </Label>
                            <Textarea
                              readOnly
                              rows={5}
                              value="Hola, soy especialista en análisis de datos ambientales, y hoy quiero compartir con ustedes un informe sobre las estadísticas ambientales que ofrece el CINEA, una fuente confiable de indicadores clave. Acceder a esta plataforma es muy sencillo, y nos permite explorar datos como temperaturas, precipitaciones, humedad relativa y residuos sólidos por departamento y año. Estos datos son esenciales para entender el estado del medio ambiente y tomar decisiones informadas. Por ejemplo, al analizar las temperaturas, podemos observar tendencias claras de aumento, lo que refleja el impacto del cambio climático. También es importante monitorear la precipitación y la humedad relativa, ya que influyen directamente en los ecosistemas y en actividades como la agricultura. Otro aspecto clave es el aumento de residuos sólidos. Se ha detectado una mayor cantidad de residuos orgánicos y peligrosos, lo que exige una mejor planificación en la gestión de desechos y programas de educación ambiental. Además, les muestro cómo descargar estos datos en Excel y visualizarlos en Power BI para facilitar su interpretación. Esto permite transformar la información en gráficos útiles para presentaciones o reportes técnicos. No olviden siempre citar las fuentes correctamente. Es una buena práctica que respalda la validez de nuestros análisis y aporta transparencia. Finalmente, los invito a utilizar estos datos para fortalecer sus proyectos y estrategias frente al cambio climático. Contar con información sólida es fundamental para generar un impacto positivo en nuestro entorno."
                              className="resize-y !text-black dark:!text-black high-contrast-mode:!text-black"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              aria-label="Transcripción completa del video"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Menú principal */}
              <Sheet open={isMainMenuOpen} onOpenChange={setIsMainMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    aria-label="Menú principal de navegación"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className={`w-full sm:w-80 ${!animations ? "" : "transition-all"}`}>
                  <SheetHeader>
                    <SheetTitle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                      {t.navigationMenu}
                    </SheetTitle>
                    <SheetDescription onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                      {t.accessalldashfeatures}
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowWaterQuality(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir análisis de calidad del agua"
                    >
                      <Droplets className="mr-2 h-4 w-4" />
                      {t.waterQuality}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowBiodiversity(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir monitoreo de biodiversidad marina"
                    >
                      <Fish className="mr-2 h-4 w-4" />
                      {t.biodiversity}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowContamination(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir análisis de contaminación"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {t.contamination}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowPhysicalConditions(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir monitoreo de condiciones físicas"
                    >
                      <Thermometer className="mr-2 h-4 w-4" />
                      {t.physicalConditions}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowMonitoringStations(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir gestión de estaciones de monitoreo"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {t.monitoringStations}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowReports(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir generación de reportes y tendencias"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {t.reports}
                    </Button>
                    {/* <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowExportDialog(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir exportación de datos"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Datos
                    </Button> */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowHelpCenter(true)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      aria-label="Abrir centro de ayuda"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      {t.helpCenter}
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

       {/* Modal Expandido de Opciones Auditivas - Tamaño Reducido */}
      <Dialog open={showExpandedAudioOptions} onOpenChange={setShowExpandedAudioOptions}>
        <DialogContent className="max-w-[90vw] sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Opciones Auditivas Expandidas
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Configuración completa de accesibilidad auditiva y multimedia
                </DialogDescription>
              </div>

            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Video Principal Expandido - Tamaño Reducido */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Volume2 className="h-4 w-4 mr-2" />
                Video Educativo Principal
              </h3>
              <div
                className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 ${showVideoAlert ? "border-red-500 animate-pulse" : "border-gray-300"} shadow-md`}
                aria-label="Video educativo expandido sobre ambiente costero"
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={youtubeEmbedUrl}
                  title="YouTube video player expandido"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="rounded-md"
                ></iframe>
                {showVideoAlert && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 pointer-events-none">
                    <AlertCircle className="h-12 w-12 text-red-600 animate-bounce" />
                  </div>
                )}
              </div>
            </div>

            {/* Controles de Accesibilidad Auditiva - Layout Compacto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración de Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div>
                      <label className="text-sm font-medium block">Subtítulos Automáticos</label>
                      <p className="text-xs text-muted-foreground">Activa subtítulos generados automáticamente</p>
                    </div>
                    <Switch
                      checked={videoCaptionsEnabled}
                      onCheckedChange={setVideoCaptionsEnabled}
                      aria-label="Activar subtítulos automáticos expandido"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div>
                      <label className="text-sm font-medium block">Mostrar Transcripciones</label>
                      <p className="text-xs text-muted-foreground">Muestra el texto completo del video</p>
                    </div>
                    <Switch
                      checked={videoTranscriptionVisible}
                      onCheckedChange={setVideoTranscriptionVisible}
                      aria-label="Mostrar transcripciones expandido"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Información del Contenido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Título del Video:</h4>
                    <p className="text-xs text-muted-foreground">Análisis de Datos Ambientales - Estadísticas CINEA</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Duración:</h4>
                    <p className="text-xs text-muted-foreground">Aproximadamente 8 minutos</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Idioma:</h4>
                    <p className="text-xs text-muted-foreground">Español con subtítulos disponibles</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Tema:</h4>
                    <p className="text-xs text-muted-foreground">Monitoreo ambiental costero y análisis de datos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transcripción Expandida - Tamaño Reducido */}
            {videoTranscriptionVisible && (
              <Card className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Transcripción Completa del Video
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Texto completo del contenido audiovisual para accesibilidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <Textarea
                      readOnly
                      rows={8}
                      value="Hola, soy especialista en análisis de datos ambientales, y hoy quiero compartir con ustedes un informe sobre las estadísticas ambientales que ofrece el CINEA, una fuente confiable de indicadores clave. Acceder a esta plataforma es muy sencillo, y nos permite explorar datos como temperaturas, precipitaciones, humedad relativa y residuos sólidos por departamento y año. 

Estos datos son esenciales para entender el estado del medio ambiente y tomar decisiones informadas. Por ejemplo, al analizar las temperaturas, podemos observar tendencias claras de aumento, lo que refleja el impacto del cambio climático. También es importante monitorear la precipitación y la humedad relativa, ya que influyen directamente en los ecosistemas y en actividades como la agricultura. 

Otro aspecto clave es el aumento de residuos sólidos. Se ha detectado una mayor cantidad de residuos orgánicos y peligrosos, lo que exige una mejor planificación en la gestión de desechos y programas de educación ambiental."
                      className="resize-none text-sm leading-relaxed !text-black dark:!text-black high-contrast-mode:!text-black border-0 bg-transparent"
                      aria-label="Transcripción completa expandida del video"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recursos Adicionales - Compacto */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Recursos de Accesibilidad Auditiva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Herramientas Disponibles:</h4>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Subtítulos automáticos
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Transcripciones completas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Control de velocidad
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Soporte Técnico:</h4>
                    <p className="text-xs text-muted-foreground">
                      Si experimenta problemas con las funciones de accesibilidad auditiva, contacte nuestro equipo.
                    </p>

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </DialogContent>
      </Dialog>

      {/* Feedback de operaciones */}
      {operationFeedback.show && (
        <Portal>
          <div className="fixed top-16 sm:top-20 left-4 right-4 sm:left-4 sm:right-auto z-[99999] pointer-events-none">
            <Alert
              className={`w-full sm:w-80 pointer-events-auto ${
                operationFeedback.type === "success"
                  ? "border-green-500"
                  : operationFeedback.type === "error"
                    ? "border-red-500"
                    : "border-blue-500"
              } ${highContrast ? "bg-white text-black" : "bg-white/95"}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {operationFeedback.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
              {operationFeedback.type === "error" && <XCircle className="h-4 w-4 text-red-500" />}
              {operationFeedback.type === "info" && <Info className="h-4 w-4 text-blue-500" />}
              <AlertTitle>
                {operationFeedback.type === "success"
                  ? "Éxito"
                  : operationFeedback.type === "error"
                    ? "Error"
                    : "Información"}
              </AlertTitle>
              <AlertDescription>{operationFeedback.message}</AlertDescription>
            </Alert>
          </div>
        </Portal>
      )}
      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mensaje de éxito de registro */}
        {registrationSuccess && (
          <Alert className="mb-6" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Info className="h-4 w-4" />
            <AlertTitle>¡Registro Exitoso!</AlertTitle>
            <AlertDescription>Bienvenido {currentUser?.name}. Su cuenta ha sido creada correctamente.</AlertDescription>
          </Alert>
        )}

        {/* Indicadores Clave */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className={highContrast ? "bg-white text-black border-white" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xs sm:text-sm font-medium"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t.activeStations}
              </CardTitle>
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-lg sm:text-2xl font-bold"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label={`${filteredStations.filter((s) => s.status === "active").length} estaciones activas`}
              >
                {filteredStations.filter((s) => s.status === "active").length}
              </div>
              <p
                className="text-xs text-muted-foreground"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t.of} {monitoringStations.length} {t.total}
              </p>
            </CardContent>
          </Card>
          <Card className={highContrast ? "bg-white text-black border-white" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xs sm:text-sm font-medium"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t.averageQuality}
              </CardTitle>
              <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-lg sm:text-2xl font-bold"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Calidad promedio del agua: Buena"
              >
                {t.good}
              </div>
              <p
                className="text-xs text-muted-foreground"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                pH: 7.8 | O₂: 8.1 mg/L
              </p>
            </CardContent>
          </Card>
          <Card className={highContrast ? "bg-white text-black border-white" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xs sm:text-sm font-medium"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t.activeAlerts}
              </CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-lg sm:text-2xl font-bold"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label={`${environmentalAlerts.length} alertas activas`}
              >
                {environmentalAlerts.length}
              </div>
              <p
                className="text-xs text-muted-foreground"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                1 {t.critical}, 2 {t.moderate}
              </p>
            </CardContent>
          </Card>
          <Card className={highContrast ? "bg-white text-black border-white" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xs sm:text-sm font-medium"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t.averageTemp}
              </CardTitle>
              <Thermometer className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-lg sm:text-2xl font-bold"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Temperatura promedio: 24.9 grados Celsius"
              >
                24.9°C
              </div>
              <p
                className="text-xs text-muted-foreground"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                +0.5°C {t.sinceYesterday}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido por pestañas */}
        <Tabs defaultValue="map" className="space-y-6" value={currentView} onValueChange={handleViewChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger
              value="map"
              className="text-xs sm:text-sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Pestaña de mapa interactivo"
            >
              {t.interactiveMap}
            </TabsTrigger>
            <TabsTrigger
              value="stations"
              className="text-xs sm:text-sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Pestaña de estaciones de monitoreo"
            >
              {t.stations}
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="text-xs sm:text-sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Pestaña de tendencias ambientales"
            >
              {t.trends}
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="text-xs sm:text-sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Pestaña de alertas ambientales"
            >
              {t.alerts}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <RealMap stations={monitoringStations} t={t}/>
          </TabsContent>

          <TabsContent value="stations" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2
                className="text-xl sm:text-2xl font-bold"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {t.monitoringStations}
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <span
                  className="text-sm text-muted-foreground"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {t.showing} {filteredStations.length} {t.of} {monitoringStations.length} {t.stations}
                </span>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger
                    className="w-full sm:w-48"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    aria-label="Filtrar estaciones por estado"
                  >
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStations}</SelectItem>
                    <SelectItem value="active">{t.activeStationsFilter}</SelectItem>
                    <SelectItem value="warning">{t.withAlerts}</SelectItem>
                    <SelectItem value="offline">{t.offlineStations}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4">
              {filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className={highContrast ? "bg-white text-black border-white" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label={`Tarjeta de estación ${station.name}`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            station.status === "active"
                              ? "bg-green-500"
                              : station.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          aria-label={`Estado de la estación: ${station.status}`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-semibold truncate"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {station.name}
                          </h3>
                          {station.status !== "offline" ? (
                            <p
                              className="text-sm text-muted-foreground"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              pH: {station.ph} | O₂: {station.oxygen} mg/L | Temp: {station.temp}°C
                            </p>
                          ) : (
                            <p
                              className="text-sm text-muted-foreground"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              {t.stationOffline}
                            </p>
                          )}
                          <p
                            className="text-xs text-muted-foreground"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            {t.coordinates}: {station.lat}, {station.lng}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        {station.alerts > 0 && (
                          <Badge
                            variant="destructive"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            aria-label={`${station.alerts} alertas activas`}
                          >
                            {station.alerts} {t.alerts}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            station.status === "active"
                              ? "default"
                              : station.status === "warning"
                                ? "destructive"
                                : "secondary"
                          }
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                    {station.status === "active"
                      ? t.active
                      : station.status === "warning"
                        ? t.alert
                        : t.offline}


                        </Badge>
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          aria-label={`Ver detalles de ${station.name}`}
                        >
                          Ver detalles
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendsChart />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-4">
              {environmentalAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={highContrast ? "bg-white text-black border-white" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label={`Alerta: ${alert.message}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <AlertTriangle
                        className={`h-5 w-5 flex-shrink-0 ${
                          alert.level === "high"
                            ? "text-red-500"
                            : alert.level === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                          {alert.message}
                        </p>
                        <p
                          className="text-sm text-muted-foreground"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          {alert.time} - {alert.station}
                        </p>
                      </div>
                      <Badge
                        variant={
                          alert.level === "high" ? "destructive" : alert.level === "medium" ? "default" : "secondary"
                        }
                        className="flex-shrink-0"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        {alert.level === "high" ? t.criticalLevel : alert.level === "medium" ? t.moderateLevel : t.lowLevel}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal para cargar borradores */}
        <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t && t.loadDraftsTitle ? t.loadDraftsTitle : "Cargar Borrador"}
              </DialogTitle>
              <DialogDescription>
                {t && t.loadDraftsDesc
                  ? t.loadDraftsDesc
                  : "Seleccione un borrador guardado para aplicarlo al formulario actual."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {availableDrafts.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>
                    {t && t.noDrafts ? t.noDrafts : "No hay borradores"}
                  </AlertTitle>
                  <AlertDescription>
                    {t && t.noDraftsDesc
                      ? t.noDraftsDesc
                      : "No se encontraron borradores guardados para este formulario."}
                  </AlertDescription>
                </Alert>
              ) : (
                availableDrafts.map((draft, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{draft.draft_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {draft.updated_at
                            ? new Date(draft.updated_at).toLocaleString()
                            : ""}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyDraft(draft)}
                      >
                        {t && t.applyDraft ? t.applyDraft : "Aplicar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDraftsDialog(false)}>
                {t && t.cancel ? t.cancel : "Cancelar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* Diálogo de Login */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className={`max-w-[95vw] sm:max-w-md ${!animations ? "" : "transition-all"}`}>
          <DialogHeader>
            <DialogTitle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              {t.login}
            </DialogTitle>
            <DialogDescription onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              Ingrese sus credenciales para acceder al sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formErrors.general && (
              <Alert variant="destructive" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? "border-red-500" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Campo de email para iniciar sesión"
              />
              {formErrors.email && (
                <div className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {formErrors.email}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                Contraseña
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Contraseña"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className={formErrors.password ? "border-red-500" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Campo de contraseña para iniciar sesión"
              />
              {formErrors.password && (
                <div className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {formErrors.password}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="w-full sm:w-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Cancelar inicio de sesión"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full sm:w-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Confirmar inicio de sesión"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t.login}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Resultados de Búsqueda */}
      <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Resultados de Búsqueda Avanzada
            </DialogTitle>
            <DialogDescription>
              {searchResults.length > 0
                ? `Se encontraron ${searchResults.length} resultados para "${advancedSearchForm.keywords}"`
                : `No se encontraron resultados para "${advancedSearchForm.keywords}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {searchResults.length > 0 ? (
              <>
                {/* Resumen de resultados */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Total Encontrado</p>
                          <p className="text-2xl font-bold">{searchResults.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">Alertas</p>
                          <p className="text-2xl font-bold">{searchResults.filter((r) => r.type === "alert").length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Mediciones</p>
                          <p className="text-2xl font-bold">
                            {searchResults.filter((r) => r.type === "measurement").length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de resultados */}
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {result.type === "measurement" && <Activity className="h-4 w-4 text-blue-500" />}
                              {result.type === "alert" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              {result.type === "species" && <Fish className="h-4 w-4 text-green-500" />}
                              {result.type === "station" && <MapPin className="h-4 w-4 text-purple-500" />}
                              {result.type === "general" && <Info className="h-4 w-4 text-gray-500" />}
                              <h3 className="font-semibold text-sm sm:text-base truncate">{result.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{result.description}</p>

                            {/* Datos específicos según el tipo */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {result.data.value !== undefined && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="font-medium">Valor</p>
                                  <p className="text-lg font-bold">
                                    {result.data.value} {result.data.unit}
                                  </p>
                                </div>
                              )}
                              {result.data.count !== undefined && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="font-medium">Cantidad</p>
                                  <p className="text-lg font-bold">{result.data.count}</p>
                                </div>
                              )}
                              {result.data.active !== undefined && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="font-medium">Activas</p>
                                  <p className="text-lg font-bold text-green-600">{result.data.active}</p>
                                </div>
                              )}
                              {result.data.timestamp && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="font-medium">Fecha</p>
                                  <p className="text-sm">{new Date(result.data.timestamp).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                            <Badge
                              variant={
                                result.data.status === "critical" || result.data.status === "alert"
                                  ? "destructive"
                                  : result.data.status === "warning" || result.data.status === "concern"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {result.data.status === "normal" && "Normal"}
                              {result.data.status === "good" && "Bueno"}
                              {result.data.status === "warning" && "Advertencia"}
                              {result.data.status === "alert" && "Alerta"}
                              {result.data.status === "critical" && "Crítico"}
                              {result.data.status === "low" && "Bajo"}
                              {result.data.status === "stable" && "Estable"}
                              {result.data.status === "concern" && "Preocupante"}
                              {result.data.status === "operational" && "Operacional"}
                              {result.data.status === "active" && "Activo"}
                            </Badge>
                            <p className="text-xs text-muted-foreground text-right">{result.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              /* Sin resultados */
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron datos</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No se encontraron resultados que coincidan con los criterios de búsqueda especificados. Intente con
                  diferentes palabras clave o ajuste los filtros.
                </p>

                <div className="space-y-3">
                  <Alert className="max-w-md mx-auto">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Sugerencias de búsqueda</AlertTitle>
                    <AlertDescription className="text-left">
                      • Intente con términos como: "pH", "temperatura", "oxígeno", "contaminación"
                      <br />• Verifique la ortografía de las palabras clave
                      <br />• Use términos más generales
                      <br />• Ajuste el rango de fechas o ubicación
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdvancedSearchForm((prev) => ({ ...prev, keywords: "pH" }))
                        setShowSearchResults(false)
                      }}
                    >
                      Buscar pH
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdvancedSearchForm((prev) => ({ ...prev, keywords: "temperatura" }))
                        setShowSearchResults(false)
                      }}
                    >
                      Buscar Temperatura
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdvancedSearchForm((prev) => ({ ...prev, keywords: "contaminación" }))
                        setShowSearchResults(false)
                      }}
                    >
                      Buscar Contaminación
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
            {searchResults.length > 0 && (
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar Resultados
              </Button>
            )}
            <Button onClick={() => setShowSearchResults(false)} className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Registro de Usuario */}
      <Dialog open={showUserRegistration} onOpenChange={setShowUserRegistration}>
        <DialogContent
          className={`max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto ${!animations ? "" : "transition-all"}`}
        >
          <DialogHeader>
            <DialogTitle onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              Registro de Usuario
            </DialogTitle>
            <DialogDescription onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              Cree una cuenta para acceder al sistema de monitoreo ambiental
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formErrors.general && (
              <Alert variant="destructive" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Nombre Completo *
                </Label>
                <Input
                  id="user-name"
                  placeholder="Juan Pérez"
                  value={userRegistrationForm.name}
                  onChange={(e) => setUserRegistrationForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={formErrors.name ? "border-red-500" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Campo de nombre completo"
                />
                {formErrors.name && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Email *
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="juan@universidad.edu"
                  value={userRegistrationForm.email}
                  onChange={(e) => setUserRegistrationForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={formErrors.email ? "border-red-500" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Campo de email"
                />
                {formErrors.email && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.email}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-institution" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Institución *
                </Label>
                <Input
                  id="user-institution"
                  placeholder="Universidad Nacional"
                  value={userRegistrationForm.institution}
                  onChange={(e) => setUserRegistrationForm((prev) => ({ ...prev, institution: e.target.value }))}
                  className={formErrors.institution ? "border-red-500" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Campo de institución"
                />
                {formErrors.institution && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.institution}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Rol *
                </Label>
                <Select
                  value={userRegistrationForm.role}
                  onValueChange={(value) => setUserRegistrationForm((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger
                    id="user-role"
                    className={formErrors.role ? "border-red-500" : ""}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    aria-label="Seleccionar rol de usuario"
                  >
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researcher">Investigador</SelectItem>
                    <SelectItem value="analyst">Analista</SelectItem>
                    <SelectItem value="viewer">Observador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.role}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-password" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Contraseña *
                </Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={userRegistrationForm.password}
                  onChange={(e) => setUserRegistrationForm((prev) => ({ ...prev, password: e.target.value }))}
                  className={formErrors.password ? "border-red-500" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Campo de contraseña"
                />
                {formErrors.password && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.password}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-confirm-password" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Confirmar Contraseña *
                </Label>
                <Input
                  id="user-confirm-password"
                  type="password"
                  placeholder="Repetir contraseña"
                  value={userRegistrationForm.confirmPassword}
                  onChange={(e) => setUserRegistrationForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className={formErrors.confirmPassword ? "border-red-500" : ""}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="Campo de confirmación de contraseña"
                />
                {formErrors.confirmPassword && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
            <Alert onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <Info className="h-4 w-4" />
              <AlertTitle>Información de Seguridad</AlertTitle>
              <AlertDescription>
                Su contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
            <Button
              variant="outline"
              onClick={() => setShowUserRegistration(false)}
              className="w-full sm:w-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Cancelar registro"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUserRegistration}
              disabled={isLoading}
              className="w-full sm:w-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Crear cuenta de usuario"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Cuenta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calidad del Agua REAL */}
      <Dialog open={showWaterQuality} onOpenChange={setShowWaterQuality}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análisis de Calidad del Agua</DialogTitle>
            <DialogDescription>Monitoreo integral de parámetros fisicoquímicos del agua marina</DialogDescription>
          </DialogHeader>
          {/* Botones de borrador y limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraft("water_quality", waterQualityForm, draftName)}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrafts("water_quality")}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Cargar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearWaterQualityForm}
                className="w-full sm:w-auto bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
            {currentUser && (
              <Input
                placeholder="Nombre del borrador"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full sm:w-48 mt-2 sm:mt-0"
              />
            )}
          </div>
          {/* Advertencia sobre nombre automático */}
          {currentUser && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Información sobre Borradores</AlertTitle>
              <AlertDescription>
                Si no especifica un nombre, el borrador se guardará automáticamente con la fecha actual.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuración de Análisis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo de Análisis</Label>
                      <RadioGroup
                        value={waterQualityForm.analysisType}
                        onValueChange={(value) => setWaterQualityForm((prev) => ({ ...prev, analysisType: value }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="current" id="current" />
                          <Label htmlFor="current">Datos Actuales</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="historical" id="historical" />
                          <Label htmlFor="historical">Análisis Histórico</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="comparative" id="comparative" />
                          <Label htmlFor="comparative">Análisis Comparativo</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {waterQualityForm.analysisType === "historical" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Fecha Inicio</Label>
                          <Input
                            type="date"
                            value={waterQualityForm.dateRange.start}
                            onChange={(e) =>
                              setWaterQualityForm((prev) => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, start: e.target.value },
                              }))
                            }
                            className={formErrors.dateRange ? "border-red-500" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha Fin</Label>
                          <Input
                            type="date"
                            value={waterQualityForm.dateRange.end}
                            onChange={(e) =>
                              setWaterQualityForm((prev) => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, end: e.target.value },
                              }))
                            }
                            className={formErrors.dateRange ? "border-red-500" : ""}
                          />
                        </div>
                      </div>
                    )}
                    {formErrors.dateRange && (
                      <div className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formErrors.dateRange}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Parámetros a Analizar *</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {["pH", "Oxígeno Disuelto", "Temperatura", "Salinidad", "Turbidez", "Nutrientes"].map(
                          (param) => (
                            <div key={param} className="flex items-center space-x-2">
                              <Checkbox
                                id={`water-param-${param}`}
                                checked={waterQualityForm.parameters.includes(param)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setWaterQualityForm((prev) => ({
                                      ...prev,
                                      parameters: [...prev.parameters, param],
                                    }))
                                  } else {
                                    setWaterQualityForm((prev) => ({
                                      ...prev,
                                      parameters: prev.parameters.filter((p) => p !== param),
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={`water-param-${param}`} className="text-sm">
                                {param}
                              </Label>
                            </div>
                          ),
                        )}
                      </div>
                      {formErrors.parameters && (
                        <div className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.parameters}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Estaciones a Incluir *</Label>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {monitoringStations.map((station) => (
                          <div key={station.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`water-station-${station.id}`}
                              checked={waterQualityForm.stations.includes(station.id.toString())}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setWaterQualityForm((prev) => ({
                                    ...prev,
                                    stations: [...prev.stations, station.id.toString()],
                                  }))
                                } else {
                                  setWaterQualityForm((prev) => ({
                                    ...prev,
                                    stations: prev.stations.filter((s) => s !== station.id.toString()),
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={`water-station-${station.id}`} className="text-sm">
                              {station.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formErrors.stations && (
                        <div className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.stations}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="comparison-mode">Modo Comparativo</Label>
                        <Switch
                          id="comparison-mode"
                          checked={waterQualityForm.comparisonMode}
                          onCheckedChange={(checked) =>
                            setWaterQualityForm((prev) => ({ ...prev, comparisonMode: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="alert-thresholds">Mostrar Umbrales de Alerta</Label>
                        <Switch
                          id="alert-thresholds"
                          checked={waterQualityForm.alertThresholds}
                          onCheckedChange={(checked) =>
                            setWaterQualityForm((prev) => ({ ...prev, alertThresholds: checked }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parámetros Actuales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>pH:</span>
                      <Badge variant="outline">7.8 (Óptimo)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Oxígeno Disuelto:</span>
                      <Badge variant="outline">8.1 mg/L (Bueno)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Salinidad:</span>
                      <Badge variant="outline">35.2 PSU (Normal)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Turbidez:</span>
                      <Badge variant="outline">2.3 NTU (Bajo)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperatura:</span>
                      <Badge variant="outline">24.9°C (Normal)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Nutrientes:</span>
                      <Badge variant="outline">2.1 mg/L (Normal)</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tendencia Semanal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded flex items-center justify-center">
                      <Activity className="h-8 w-8 text-blue-600" />
                      <span className="ml-2">Gráfico de tendencias</span>
                    </div>
                  </CardContent>
                </Card>
                <Alert>
                  <Droplets className="h-4 w-4" />
                  <AlertTitle>Estado General</AlertTitle>
                  <AlertDescription>
                    La calidad del agua se mantiene en niveles óptimos en el 85% de las estaciones monitoreadas.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowWaterQuality(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleWaterQualityAnalysis} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Iniciar Análisis
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Biodiversidad Marina REAL */}
      <Dialog open={showBiodiversity} onOpenChange={setShowBiodiversity}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monitoreo de Biodiversidad Marina</DialogTitle>
            <DialogDescription>Seguimiento de especies y ecosistemas marinos costeros</DialogDescription>
          </DialogHeader>

          {/* Botones de borrador y limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraft("biodiversity", biodiversityForm, draftName)}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrafts("biodiversity")}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Cargar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearBiodiversityForm}
                className="w-full sm:w-auto bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
            {currentUser && (
              <Input
                placeholder="Nombre del borrador"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full sm:w-48 mt-2 sm:mt-0"
              />
            )}
          </div>

          {/* Advertencia sobre nombre automático */}
          {currentUser && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Información sobre Borradores</AlertTitle>
              <AlertDescription>
                Si no especifica un nombre, el borrador se guardará automáticamente con la fecha actual.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Especies Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">247</div>
                  <p className="text-sm text-muted-foreground">+12 este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Índice de Diversidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">3.8</div>
                  <p className="text-sm text-muted-foreground">Shannon-Weaver</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Especies en Riesgo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">5</div>
                  <p className="text-sm text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Configuración de Monitoreo</h3>
                <div className="space-y-2">
                  <Label>Tipo de Monitoreo</Label>
                  <RadioGroup
                    value={biodiversityForm.monitoringType}
                    onValueChange={(value) => setBiodiversityForm((prev) => ({ ...prev, monitoringType: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="species" id="species" />
                      <Label htmlFor="species">Conteo de Especies</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="population" id="population" />
                      <Label htmlFor="population">Análisis Poblacional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="habitat" id="habitat" />
                      <Label htmlFor="habitat">Evaluación de Hábitat</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Grupos Taxonómicos *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {["Peces", "Crustáceos", "Moluscos", "Corales", "Algas", "Equinodermos"].map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bio-group-${group}`}
                          checked={biodiversityForm.taxonomicGroups.includes(group)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBiodiversityForm((prev) => ({
                                ...prev,
                                taxonomicGroups: [...prev.taxonomicGroups, group],
                              }))
                            } else {
                              setBiodiversityForm((prev) => ({
                                ...prev,
                                taxonomicGroups: prev.taxonomicGroups.filter((g) => g !== group),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`bio-group-${group}`} className="text-sm">
                          {group}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formErrors.taxonomicGroups && (
                    <div className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.taxonomicGroups}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estado de Conservación</Label>
                  <Select
                    value={biodiversityForm.conservationStatus}
                    onValueChange={(value) => setBiodiversityForm((prev) => ({ ...prev, conservationStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="endangered">En peligro</SelectItem>
                      <SelectItem value="vulnerable">Vulnerable</SelectItem>
                      <SelectItem value="near-threatened">Casi amenazado</SelectItem>
                      <SelectItem value="least-concern">Preocupación menor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Método de Muestreo</Label>
                  <Select
                    value={biodiversityForm.samplingMethod}
                    onValueChange={(value) => setBiodiversityForm((prev) => ({ ...prev, samplingMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Censo Visual</SelectItem>
                      <SelectItem value="transect">Transecto</SelectItem>
                      <SelectItem value="quadrat">Cuadrante</SelectItem>
                      <SelectItem value="photo">Fotografía Submarina</SelectItem>
                      <SelectItem value="collection">Recolección</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-rare">Incluir Especies Raras</Label>
                    <Switch
                      id="include-rare"
                      checked={biodiversityForm.includeRareSpecies}
                      onCheckedChange={(checked) =>
                        setBiodiversityForm((prev) => ({ ...prev, includeRareSpecies: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="generate-bio-report">Generar Reporte Automático</Label>
                    <Switch
                      id="generate-bio-report"
                      checked={biodiversityForm.generateReport}
                      onCheckedChange={(checked) =>
                        setBiodiversityForm((prev) => ({ ...prev, generateReport: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Distribución por Grupos</h3>
                <div className="space-y-2">
                  {[
                    { name: "Peces", count: 89, color: "bg-blue-500" },
                    { name: "Crustáceos", count: 45, color: "bg-orange-500" },
                    { name: "Moluscos", count: 67, color: "bg-purple-500" },
                    { name: "Corales", count: 23, color: "bg-pink-500" },
                    { name: "Algas", count: 23, color: "bg-green-500" },
                  ].map((group) => (
                    <div key={group.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${group.color}`}></div>
                        <span>{group.name}</span>
                      </div>
                      <Badge variant="outline">{group.count}</Badge>
                    </div>
                  ))}
                </div>

                <Alert>
                  <Fish className="h-4 w-4" />
                  <AlertTitle>Especies Destacadas</AlertTitle>
                  <AlertDescription>
                    Se han registrado 3 nuevas especies de peces en el último mes, incluyendo una posible especie
                    endémica.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Índices de Diversidad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Shannon-Weaver:</span>
                      <span className="text-sm font-medium">3.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Simpson:</span>
                      <span className="text-sm font-medium">0.92</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Margalef:</span>
                      <span className="text-sm font-medium">12.4</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowBiodiversity(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleBiodiversityMonitoring} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando Monitoreo...
                  </>
                ) : (
                  <>
                    <Fish className="h-4 w-4 mr-2" />
                    Iniciar Monitoreo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Análisis de Contaminación REAL */}
      <Dialog open={showContamination} onOpenChange={setShowContamination}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análisis de Contaminación Marina</DialogTitle>
            <DialogDescription>Detección y evaluación de contaminantes en el ecosistema costero</DialogDescription>
          </DialogHeader>

          {/* Botones de borrador y limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraft("contamination", contaminationForm, draftName)}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrafts("contamination")}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Cargar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearContaminationForm}
                className="w-full sm:w-auto bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
            {currentUser && (
              <Input
                placeholder="Nombre del borrador"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full sm:w-48 mt-2 sm:mt-0"
              />
            )}
          </div>

          {/* Advertencia sobre nombre automático */}
          {currentUser && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Información sobre Borradores</AlertTitle>
              <AlertDescription>
                Si no especifica un nombre, el borrador se guardará automáticamente con la fecha actual.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hidrocarburos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">Bajo</div>
                  <p className="text-xs text-muted-foreground">0.02 mg/L</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Metales Pesados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">Medio</div>
                  <p className="text-xs text-muted-foreground">0.15 mg/L</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Plásticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-red-600">Alto</div>
                  <p className="text-xs text-muted-foreground">45 partículas/L</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Nutrientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">Normal</div>
                  <p className="text-xs text-muted-foreground">2.1 mg/L</p>
                </CardContent>
              </Card>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerta de Contaminación</AlertTitle>
              <AlertDescription>
                Se detectaron niveles elevados de microplásticos en la Estación Puerto Sur. Se recomienda investigación
                inmediata.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Configuración de Análisis</h3>
                <div className="space-y-2">
                  <Label>Tipos de Contaminantes *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {["Hidrocarburos", "Metales Pesados", "Plásticos", "Pesticidas", "Nutrientes", "Patógenos"].map(
                      (contaminant) => (
                        <div key={contaminant} className="flex items-center space-x-2">
                          <Checkbox
                            id={`contaminant-${contaminant}`}
                            checked={contaminationForm.contaminantTypes.includes(contaminant)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setContaminationForm((prev) => ({
                                  ...prev,
                                  contaminantTypes: [...prev.contaminantTypes, contaminant],
                                }))
                              } else {
                                setContaminationForm((prev) => ({
                                  ...prev,
                                  contaminantTypes: prev.contaminantTypes.filter((c) => c !== contaminant),
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`contaminant-${contaminant}`} className="text-sm">
                            {contaminant}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                  {formErrors.contaminantTypes && (
                    <div className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.contaminantTypes}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Nivel de Severidad</Label>
                  <Select
                    value={contaminationForm.severityLevel}
                    onValueChange={(value) => setContaminationForm((prev) => ({ ...prev, severityLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los niveles</SelectItem>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuentes de Contaminación</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[
                      "Descargas industriales",
                      "Aguas residuales urbanas",
                      "Escorrentía agrícola",
                      "Tráfico marítimo",
                      "Actividades portuarias",
                    ].map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={contaminationForm.sources.includes(source)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setContaminationForm((prev) => ({
                                ...prev,
                                sources: [...prev.sources, source],
                              }))
                            } else {
                              setContaminationForm((prev) => ({
                                ...prev,
                                sources: prev.sources.filter((s) => s !== source),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`source-${source}`} className="text-sm">
                          {source}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Acciones de Respuesta</h3>
                <div className="space-y-2">
                  <Label>Medidas de Mitigación</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[
                      "Contención inmediata",
                      "Limpieza de área afectada",
                      "Monitoreo intensivo",
                      "Restricción de actividades",
                      "Tratamiento de agua",
                    ].map((action) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`action-${action}`}
                          checked={contaminationForm.mitigationActions.includes(action)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setContaminationForm((prev) => ({
                                ...prev,
                                mitigationActions: [...prev.mitigationActions, action],
                              }))
                            } else {
                              setContaminationForm((prev) => ({
                                ...prev,
                                mitigationActions: prev.mitigationActions.filter((a) => a !== action),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`action-${action}`} className="text-sm">
                          {action}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-authorities">Notificar Autoridades</Label>
                    <Switch
                      id="notify-authorities"
                      checked={contaminationForm.notifyAuthorities}
                      onCheckedChange={(checked) =>
                        setContaminationForm((prev) => ({ ...prev, notifyAuthorities: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emergency-protocol">Activar Protocolo de Emergencia</Label>
                    <Switch
                      id="emergency-protocol"
                      checked={contaminationForm.emergencyProtocol}
                      onCheckedChange={(checked) =>
                        setContaminationForm((prev) => ({ ...prev, emergencyProtocol: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Shield className="mr-2 h-4 w-4" />
                    Protocolo de emergencia
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Generar reporte
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Bell className="mr-2 h-4 w-4" />
                    Notificar autoridades
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowContamination(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleContaminationAnalysis} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Iniciar Análisis
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Condiciones Físicas REAL */}
      <Dialog open={showPhysicalConditions} onOpenChange={setShowPhysicalConditions}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monitoreo de Condiciones Físicas</DialogTitle>
            <DialogDescription>
              Seguimiento de parámetros físicos y meteorológicos del ambiente marino
            </DialogDescription>
          </DialogHeader>

          {/* Botones de borrador y limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraft("physical_conditions", physicalConditionsForm, draftName)}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrafts("physical_conditions")}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Cargar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearPhysicalConditionsForm}
                className="w-full sm:w-auto bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
            {currentUser && (
              <Input
                placeholder="Nombre del borrador"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full sm:w-48 mt-2 sm:mt-0"
              />
            )}
          </div>

          {/* Advertencia sobre nombre automático */}
          {currentUser && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Información sobre Borradores</AlertTitle>
              <AlertDescription>
                Si no especifica un nombre, el borrador se guardará automáticamente con la fecha actual.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">24.9°C</div>
                  <p className="text-xs text-muted-foreground">+0.5°C {t.sinceYesterday}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Corrientes</CardTitle>
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">1.2 m/s</div>
                  <p className="text-xs text-muted-foreground">Dirección: NE</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oleaje</CardTitle>
                  <Waves className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">0.8 m</div>
                  <p className="text-xs text-muted-foreground">Moderado</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Configuración de Monitoreo</h3>
                <div className="space-y-2">
                  <Label>Parámetros a Monitorear</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {["Temperatura", "Corrientes", "Oleaje", "Viento", "Presión", "Humedad"].map((param) => (
                      <div key={param} className="flex items-center space-x-2">
                        <Checkbox
                          id={`physical-param-${param}`}
                          checked={physicalConditionsForm.parameters.includes(param)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPhysicalConditionsForm((prev) => ({
                                ...prev,
                                parameters: [...prev.parameters, param],
                              }))
                            } else {
                              setPhysicalConditionsForm((prev) => ({
                                ...prev,
                                parameters: prev.parameters.filter((p) => p !== param),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`physical-param-${param}`} className="text-sm">
                          {param}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Intervalo de Medición</Label>
                  <Select
                    value={physicalConditionsForm.measurementInterval}
                    onValueChange={(value) =>
                      setPhysicalConditionsForm((prev) => ({ ...prev, measurementInterval: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5min">5 minutos</SelectItem>
                      <SelectItem value="15min">15 minutos</SelectItem>
                      <SelectItem value="30min">30 minutos</SelectItem>
                      <SelectItem value="1hour">1 hora</SelectItem>
                      <SelectItem value="3hours">3 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Período de Pronóstico</Label>
                  <Select
                    value={physicalConditionsForm.forecastPeriod}
                    onValueChange={(value) => setPhysicalConditionsForm((prev) => ({ ...prev, forecastPeriod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6h">6 horas</SelectItem>
                      <SelectItem value="12h">12 horas</SelectItem>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="48h">48 horas</SelectItem>
                      <SelectItem value="72h">72 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extreme-alerts">Alertas de Condiciones Extremas</Label>
                    <Switch
                      id="extreme-alerts"
                      checked={physicalConditionsForm.extremeConditionAlerts}
                      onCheckedChange={(checked) =>
                        setPhysicalConditionsForm((prev) => ({ ...prev, extremeConditionAlerts: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weather-integration">Integración Meteorológica</Label>
                    <Switch
                      id="weather-integration"
                      checked={physicalConditionsForm.weatherIntegration}
                      onCheckedChange={(checked) =>
                        setPhysicalConditionsForm((prev) => ({ ...prev, weatherIntegration: checked }))
                      }
                    />
                  </div>
                </div>

                {physicalConditionsForm.extremeConditionAlerts && (
                  <div className="space-y-2">
                    <Label>Umbrales de Alerta</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="temp-alert" defaultChecked />
                        <Label htmlFor="temp-alert" className="text-sm">
                          Temperatura {">"} 30°C
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="wind-alert" />
                        <Label htmlFor="wind-alert" className="text-sm">
                          Viento {">"} 50 km/h
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="wave-alert" />
                        <Label htmlFor="wave-alert" className="text-sm">
                          Oleaje {">"} 2.5 m
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Condiciones Actuales</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4" />
                      <span>Viento</span>
                    </div>
                    <Badge variant="outline">15 km/h E</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Radiación Solar</span>
                    </div>
                    <Badge variant="outline">850 W/m²</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4" />
                      <span>Humedad</span>
                    </div>
                    <Badge variant="outline">78%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Presión Atmosférica</span>
                    </div>
                    <Badge variant="outline">1013 hPa</Badge>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pronóstico 24h</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Temperatura:</span>
                        <span className="text-sm">22-27°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Viento:</span>
                        <span className="text-sm">10-20 km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Oleaje:</span>
                        <span className="text-sm">0.5-1.2 m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Visibilidad:</span>
                        <span className="text-sm">Excelente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Condiciones Favorables</AlertTitle>
                  <AlertDescription>
                    Las condiciones físicas son óptimas para actividades de monitoreo y muestreo.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowPhysicalConditions(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handlePhysicalConditionsConfig} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Configurando...
                  </>
                ) : (
                  <>
                    <Thermometer className="h-4 w-4 mr-2" />
                    Aplicar Configuración
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gestión de Estaciones REAL */}
      <Dialog open={showMonitoringStations} onOpenChange={setShowMonitoringStations}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión de Estaciones de Monitoreo</DialogTitle>
            <DialogDescription>Administración y configuración de estaciones de monitoreo ambiental</DialogDescription>
          </DialogHeader>

          {/* Botones de borrador y limpiar */}
          {(monitoringStationsForm.action === "add" || monitoringStationsForm.action === "edit") && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveDraft("monitoring_stations", monitoringStationsForm, draftName)}
                    disabled={!currentUser}
                    className="w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Borrador
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDrafts("monitoring_stations")}
                    disabled={!currentUser}
                    className="w-full sm:w-auto"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Cargar Borrador
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMonitoringStationsForm}
                    className="w-full sm:w-auto bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                </div>
                {currentUser && (
                  <Input
                    placeholder="Nombre del borrador"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full sm:w-48 mt-2 sm:mt-0"
                  />
                )}
              </div>

              {/* Advertencia sobre nombre automático */}
              {currentUser && (
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Información sobre Borradores</AlertTitle>
                  <AlertDescription>
                    Si no especifica un nombre, el borrador se guardará automáticamente con la fecha actual.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="space-y-1">
                <h3 className="font-semibold">Estaciones Registradas</h3>
                <p className="text-sm text-muted-foreground">{monitoringStations.length} estaciones en total</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button
                  variant={monitoringStationsForm.action === "view" ? "default" : "outline"}
                  onClick={() => setMonitoringStationsForm((prev) => ({ ...prev, action: "view" }))}
                  className="w-full sm:w-auto"
                >
                  Ver Estaciones
                </Button>
                <Button
                  variant={monitoringStationsForm.action === "add" ? "default" : "outline"}
                  onClick={() => setMonitoringStationsForm((prev) => ({ ...prev, action: "add" }))}
                  className="w-full sm:w-auto"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Agregar Estación
                </Button>
              </div>
            </div>

            {monitoringStationsForm.action === "view" && (
              <div className="grid gap-4 max-h-60 sm:max-h-96 overflow-y-auto">
                {monitoringStations.map((station) => (
                  <Card key={station.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              station.status === "active"
                                ? "bg-green-500"
                                : station.status === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{station.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {station.lat}, {station.lng}
                            </p>
                            {station.status !== "offline" && (
                              <p className="text-xs text-muted-foreground">
                                pH: {station.ph} | O₂: {station.oxygen} mg/L | Temp: {station.temp}°C
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMonitoringStationsForm((prev) => ({
                                ...prev,
                                action: "edit",
                                stationData: {
                                  name: station.name,
                                  latitude: station.lat.toString(),
                                  longitude: station.lng.toString(),
                                  type: "coastal",
                                  sensors: ["pH", "Oxígeno", "Temperatura"],
                                  maintenanceSchedule: "monthly",
                                },
                              }))
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Database className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {(monitoringStationsForm.action === "add" || monitoringStationsForm.action === "edit") && (
              <div className="space-y-4">
                <h3 className="font-semibold">
                  {monitoringStationsForm.action === "add" ? "Agregar Nueva Estación" : "Editar Estación"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="station-name">Nombre de la Estación *</Label>
                    <Input
                      id="station-name"
                      placeholder="Estación Bahía Norte"
                      value={monitoringStationsForm.stationData.name}
                      onChange={(e) =>
                        setMonitoringStationsForm((prev) => ({
                          ...prev,
                          stationData: { ...prev.stationData, name: e.target.value },
                        }))
                      }
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <div className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="station-type">Tipo de Estación</Label>
                    <Select
                      value={monitoringStationsForm.stationData.type}
                      onValueChange={(value) =>
                        setMonitoringStationsForm((prev) => ({
                          ...prev,
                          stationData: { ...prev.stationData, type: value },
                        }))
                      }
                    >
                      <SelectTrigger id="station-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coastal">Costera</SelectItem>
                        <SelectItem value="offshore">Mar Abierto</SelectItem>
                        <SelectItem value="estuary">Estuario</SelectItem>
                        <SelectItem value="reef">Arrecife</SelectItem>
                        <SelectItem value="mangrove">Manglar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="station-lat">Latitud *</Label>
                    <Input
                      id="station-lat"
                      placeholder="10.4806"
                      value={monitoringStationsForm.stationData.latitude}
                      onChange={(e) =>
                        setMonitoringStationsForm((prev) => ({
                          ...prev,
                          stationData: { ...prev.stationData, latitude: e.target.value },
                        }))
                      }
                      className={formErrors.latitude ? "border-red-500" : ""}
                    />
                    {formErrors.latitude && (
                      <div className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formErrors.latitude}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="station-lng">Longitud *</Label>
                    <Input
                      id="station-lng"
                      placeholder="-75.5133"
                      value={monitoringStationsForm.stationData.longitude}
                      onChange={(e) =>
                        setMonitoringStationsForm((prev) => ({
                          ...prev,
                          stationData: { ...prev.stationData, longitude: e.target.value },
                        }))
                      }
                      className={formErrors.longitude ? "border-red-500" : ""}
                    />
                    {formErrors.longitude && (
                      <div className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formErrors.longitude}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sensores Instalados *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {[
                      "pH",
                      "Oxígeno",
                      "Temperatura",
                      "Salinidad",
                      "Turbidez",
                      "Corrientes",
                      "Presión",
                      "Conductividad",
                    ].map((sensor) => (
                      <div key={sensor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sensor-${sensor}`}
                          checked={monitoringStationsForm.stationData.sensors.includes(sensor)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMonitoringStationsForm((prev) => ({
                                ...prev,
                                stationData: {
                                  ...prev.stationData,
                                  sensors: [...prev.stationData.sensors, sensor],
                                },
                              }))
                            } else {
                              setMonitoringStationsForm((prev) => ({
                                ...prev,
                                stationData: {
                                  ...prev.stationData,
                                  sensors: prev.stationData.sensors.filter((s) => s !== sensor),
                                },
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`sensor-${sensor}`} className="text-sm">
                          {sensor}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formErrors.sensors && (
                    <div className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.sensors}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Programa de Mantenimiento</Label>
                  <Select
                    value={monitoringStationsForm.stationData.maintenanceSchedule}
                    onValueChange={(value) =>
                      setMonitoringStationsForm((prev) => ({
                        ...prev,
                        stationData: { ...prev.stationData, maintenanceSchedule: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quincenal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="biannual">Semestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowMonitoringStations(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              {(monitoringStationsForm.action === "add" || monitoringStationsForm.action === "edit") && (
                <Button onClick={handleStationManagement} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {monitoringStationsForm.action === "add" ? "Agregando..." : "Actualizando..."}
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      {monitoringStationsForm.action === "add" ? "Agregar Estación" : "Actualizar Estación"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reportes y Tendencias REAL */}
      <Dialog open={showReports} onOpenChange={setShowReports}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generación de Reportes y Análisis</DialogTitle>
            <DialogDescription>Creación de reportes personalizados y análisis de tendencias</DialogDescription>
          </DialogHeader>

          {/* Botones de borrador y limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraft("reports", reportsForm, draftName)}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrafts("reports")}
                disabled={!currentUser}
                className="w-full sm:w-auto"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Cargar Borrador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearReportsForm}
                className="w-full sm:w-auto bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
            {currentUser && (
              <Input
                placeholder="Nombre del borrador"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full sm:w-48 mt-2 sm:mt-0"
              />
            )}
          </div>

          {/* Advertencia sobre nombre automático */}
          {currentUser && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Información sobre Borradores</AlertTitle>
              <AlertDescription>
                Si no especifica un nombre, el borrador se guardará automáticamente con la fecha actual.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Configuración del Reporte</h3>
                <div className="space-y-2">
                  <Label>Tipo de Reporte</Label>
                  <Select
                    value={reportsForm.reportType}
                    onValueChange={(value) => setReportsForm((prev) => ({ ...prev, reportType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Reporte Diario</SelectItem>
                      <SelectItem value="weekly">Reporte Semanal</SelectItem>
                      <SelectItem value="monthly">Reporte Mensual</SelectItem>
                      <SelectItem value="quarterly">Reporte Trimestral</SelectItem>
                      <SelectItem value="annual">Reporte Anual</SelectItem>
                      <SelectItem value="custom">Reporte Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Salida</Label>
                  <RadioGroup
                    value={reportsForm.format}
                    onValueChange={(value) => setReportsForm((prev) => ({ ...prev, format: value }))}
                    className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PDF" id="report-pdf" />
                      <Label htmlFor="report-pdf">PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="EXCEL" id="report-excel" />
                      <Label htmlFor="report-excel">Excel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="HTML" id="report-html" />
                      <Label htmlFor="report-html">HTML</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Parámetros Personalizados</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {[
                      "Calidad del Agua",
                      "Biodiversidad",
                      "Contaminación",
                      "Condiciones Físicas",
                      "Alertas",
                      "Tendencias",
                    ].map((param) => (
                      <div key={param} className="flex items-center space-x-2">
                        <Checkbox
                          id={`report-param-${param}`}
                          checked={reportsForm.customParameters.includes(param)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setReportsForm((prev) => ({
                                ...prev,
                                customParameters: [...prev.customParameters, param],
                              }))
                            } else {
                              setReportsForm((prev) => ({
                                ...prev,
                                customParameters: prev.customParameters.filter((p) => p !== param),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`report-param-${param}`} className="text-sm">
                          {param}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-charts">Incluir Gráficos</Label>
                    <Switch
                      id="include-charts"
                      checked={reportsForm.includeCharts}
                      onCheckedChange={(checked) => setReportsForm((prev) => ({ ...prev, includeCharts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-send-report">Envío Automático</Label>
                    <Switch
                      id="auto-send-report"
                      checked={reportsForm.autoSend}
                      onCheckedChange={(checked) => setReportsForm((prev) => ({ ...prev, autoSend: checked }))}
                    />
                  </div>
                </div>

                {reportsForm.autoSend && (
                  <div className="space-y-2">
                    <Label>Destinatarios</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Agregar email del destinatario"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const email = e.currentTarget.value.trim()
                            if (email && validateEmail(email) === "") {
                              setReportsForm((prev) => ({
                                ...prev,
                                recipients: [...prev.recipients, email],
                              }))
                              e.currentTarget.value = ""
                            }
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {reportsForm.recipients.map((email, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {email}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => {
                                setReportsForm((prev) => ({
                                  ...prev,
                                  recipients: prev.recipients.filter((_, i) => i !== index),
                                }))
                              }}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {formErrors.recipients && (
                      <div className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formErrors.recipients}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Reportes Disponibles</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Reporte Diario
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Análisis Semanal
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Tendencias Mensuales
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Globe className="mr-2 h-4 w-4" />
                    Reporte Anual
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Últimos Reportes Generados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { name: "Reporte Semanal - Calidad del Agua", date: "2024-01-15", size: "2.3 MB" },
                        { name: "Análisis Mensual - Biodiversidad", date: "2024-01-10", size: "5.1 MB" },
                        { name: "Reporte de Contaminación", date: "2024-01-08", size: "1.8 MB" },
                      ].map((report, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 border rounded space-y-2 sm:space-y-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{report.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {report.date} • {report.size}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Programación Automática</AlertTitle>
                  <AlertDescription>
                    Los reportes se generan automáticamente según la configuración establecida.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setShowReports(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Centro de Ayuda */}
      <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Centro de Ayuda</DialogTitle>
            <DialogDescription>Documentación, tutoriales y soporte técnico</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Documentación</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Manual de Usuario
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="mr-2 h-4 w-4" />
                    Guía de Configuración
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Database className="mr-2 h-4 w-4" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Preguntas Frecuentes
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Soporte Técnico</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <p className="font-medium">Contacto Directo</p>
                    <p className="text-sm text-muted-foreground">soporte@dashboard-ambiental.com</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">Horario de Atención</p>
                    <p className="text-sm text-muted-foreground">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">Tiempo de Respuesta</p>
                    <p className="text-sm text-muted-foreground">Promedio: 2-4 horas</p>
                  </div>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Tutoriales Interactivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: "Configurar Alertas", duration: "5 min", level: "Básico" },
                    { title: "Exportar Datos", duration: "3 min", level: "Básico" },
                    { title: "Análisis Avanzado", duration: "15 min", level: "Avanzado" },
                  ].map((tutorial, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{tutorial.title}</h4>
                        <p className="text-sm text-muted-foreground">{tutorial.duration}</p>
                        <Badge variant="outline" className="mt-2">
                          {tutorial.level}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo para editar informacion del usuario */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl lg:max-w-2xl py-4 px-6 sm:px-8 rounded-2xl max-h-[98vh] flex flex-col">
          <DialogHeader className="space-y-1 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-gray-900">Editar Información de Usuario</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Modifique los datos permitidos de su cuenta.<br />
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                Los campos críticos requieren confirmación.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEditUserLoading(true);

              const changes: any = {};
              Object.keys(editUserForm).forEach((key) => {
                if (editUserForm[key] !== currentUser[key]) changes[key] = editUserForm[key];
              });

              if (Object.keys(changes).length === 0) {
                showFeedback("info", "No se detectaron cambios.");
                setEditUserLoading(false);
                return;
              }

              // Confirmación si cambia email, rol o password
              if (changes.email || changes.rol || changes.password) {
                if (!window.confirm("Está a punto de modificar datos críticos. ¿Desea continuar?")) {
                  setEditUserLoading(false);
                  return;
                }
              }

              try {
                const response = await fetch("/api/users", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: currentUser.id, ...changes }),
                });
                const result = await response.json();
                if (result.success) {
                  setEditUserHistory((h) => [...h, { ...currentUser, fecha: new Date().toLocaleString() }]);
                  setCurrentUser({ ...currentUser, ...changes });
                  localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, ...changes }));
                  setShowEditUserDialog(false);
                  showFeedback("success", "Datos actualizados correctamente.");
                } else {
                  showFeedback("error", result.message || "Error al actualizar usuario.");
                }
              } catch (err) {
                showFeedback("error", "Error de conexión.");
              }
              setEditUserLoading(false);
            }}
            className="space-y-3 mt-3 flex-1 min-h-0"
          >
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">ID</Label>
              <Input 
                value={editUserForm.id || ""} 
                disabled 
                className="bg-gray-50 cursor-not-allowed border-gray-200 text-gray-500 h-8" 
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editUserForm.nombre_completo || ""}
                onChange={e => setEditUserForm((f: typeof editUserForm) => ({ ...f, nombre_completo: e.target.value }))}
                required
                className="w-full h-8 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Ingrese el nombre completo"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={editUserForm.email || ""}
                onChange={e => setEditUserForm((f: typeof editUserForm) => ({ ...f, email: e.target.value }))}
                required
                className="w-full h-8 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Institución <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editUserForm.institucion || ""}
                onChange={e => setEditUserForm((f: typeof editUserForm) => ({ ...f, institucion: e.target.value }))}
                required
                className="w-full h-8 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Nombre de la institución"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editUserForm.rol || ""}
                onValueChange={value => setEditUserForm((f: typeof editUserForm) => ({ ...f, rol: value }))}
              >
                <SelectTrigger className="w-full h-8 focus:ring-2 focus:ring-blue-500 transition-all">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="admin">👑 Administrador</SelectItem>
                  <SelectItem value="analyst">📊 Analista</SelectItem>
                  <SelectItem value="researcher">🔬 Investigador</SelectItem>
                  <SelectItem value="viewer">👁️ Observador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Nueva Contraseña 
                <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </Label>
              <Input
                type="password"
                value={editUserForm.password || ""}
                onChange={e => setEditUserForm((f: typeof editUserForm) => ({ ...f, password: e.target.value }))}
                className="w-full h-8 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Dejar en blanco para no cambiar"
              />
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex flex-1 gap-2 order-2 sm:order-1">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowEditUserDialog(false)}
                  className="flex-1 h-8 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editUserLoading}
                  className="flex-1 h-8 bg-blue-600 hover:bg-blue-700 transition-colors text-sm"
                >
                  {editUserLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : "Actualizar"}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="order1 sm:order-2 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-xs"
                onClick={() => setShowHistoryDialog(true)}
              >
                📋 Ver Historial
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/*Modal para historial de cambios*/}
      
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Historial de Cambios</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto text-xs space-y-2">
            {editUserHistory.length === 0
              ? <div>No hay historial.</div>
              : editUserHistory.map((h, i) => (
                  <div key={i} className="border-b pb-2">
                    {h.fecha}: {h.nombre_completo}, {h.email}, {h.institucion}, {h.rol}
                  </div>
                ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function RealMap({ stations, t }: { stations: any[], t: any }) {
  const [selected, setSelected] = useState<any>(null);
  const [arrowPosition, setArrowPosition] = useState<{ x: number, y: number, angle: number } | null>(null);
  const mapRef = useRef<any>(null);

  // Función para calcular la posición y ángulo de la flecha
  function getArrowPosition(map: any, galapagos: any) {
    if (!map || !galapagos) return null;
    const mapCanvas = map.getCanvas();
    const galapagosPixel = map.project([galapagos.lng, galapagos.lat]);
    const width = mapCanvas.width;
    const height = mapCanvas.height;

    // Si está visible, no mostrar flecha
    if (
      galapagosPixel.x > 0 && galapagosPixel.x < width &&
      galapagosPixel.y > 0 && galapagosPixel.y < height
    ) {
      return null;
    }

    // Calcular dirección desde el centro del mapa hacia galápagos
    const center = { x: width / 2, y: height / 2 };
    const dx = galapagosPixel.x - center.x;
    const dy = galapagosPixel.y - center.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Llevar la flecha al borde del mapa
    const radius = Math.min(width, height) / 2 - 40;
    const x = center.x + radius * Math.cos(angle * Math.PI / 180);
    const y = center.y + radius * Math.sin(angle * Math.PI / 180);

    return { x, y, angle };
  }

  // Actualiza la posición de la flecha en cada movimiento del mapa
  const handleMove = (e: any) => {
    const galapagos = stations.find(s => s.name === "Estación Arrecife Este");
    if (!galapagos) {
      setArrowPosition(null);
      return;
    }
    const map = e.target;
    setArrowPosition(getArrowPosition(map, galapagos));
  };

  // Al montar, calcula la posición inicial
  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    const galapagos = stations.find(s => s.name === "Estación Arrecife Este");
    if (map && galapagos) {
      setArrowPosition(getArrowPosition(map, galapagos));
    }
  }, [stations]);

  return (
    <div style={{ position: "relative" }}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: 6,
        }}
        style={{ width: "100%", height: 400, borderRadius: 12 }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onMove={handleMove}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            longitude={station.lng}
            latitude={station.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelected(station);
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Nombre de la estación encima del marcador */}
              <span
                style={{
                  background: "#fff",
                  color: "#333",
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: 4,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  padding: "2px 8px",
                  marginBottom: 4,
                  border: "1px solid #eee",
                  whiteSpace: "nowrap"
                }}
              >
                {station.name}
              </span>
              {/* El marcador */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: station.status === "active" ? "#22c55e" : station.status === "warning" ? "#eab308" : "#ef4444",
                  borderRadius: "50%",
                  border: "2px solid white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  cursor: "pointer"
                }}
                title={station.name}
              />
            </div>
          </Marker>
        ))}
        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            onClose={() => setSelected(null)}
            closeOnClick={false}
          >
            <div>
              <strong>{selected.name}</strong><br />
              {t.Status}: {selected.status}<br />
              pH: {selected.ph} | O₂: {selected.oxygen} mg/L | Temp: {selected.temp}°C
            </div>
          </Popup>
        )}
      </Map>

      {/* Leyenda de colores */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "12px 16px",
          zIndex: 10,
          fontSize: 14,
          minWidth: 160,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.stationStatus}</div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#22c55e", display: "inline-block", marginRight: 8, border: "2px solid #fff" }} />
          {t.active}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#eab308", display: "inline-block", marginRight: 8, border: "2px solid #fff" }} />
          {t.alert}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444", display: "inline-block", marginRight: 8, border: "2px solid #fff" }} />
          {t.offline}
        </div>
      </div>

      {/* Flecha dinámica hacia Galápagos */}
      {arrowPosition && (
        <div
          style={{
            position: "absolute",
            left: 32,
            bottom: 32,
            zIndex: 30,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `rotate(${arrowPosition.angle}deg)`,
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#ef4444",
              padding: "2px 10px",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              fontWeight: 700,
              fontSize: 13,
              border: "1.5px solid #ef4444",
              marginBottom: 2,
              minWidth: 70,
              textAlign: "center",
              transform: `rotate(${-arrowPosition.angle}deg)`, // Mantiene el texto horizontal
            }}
          >
            Estación Arrecife Este
          </div>
          <svg width="32" height="32">
            <polygon points="16,0 32,32 0,32" fill="#ef4444" />
          </svg>
        </div>
      )}
    </div>
  );
}