import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { bookAPI, borrowingAPI, statisticsAPI } from '../../utils/api';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import BookViewer from '../../components/BookViewer';
import GlobalAIChat from '../../components/GlobalAIChat';
import BookRecommendations from '../../components/BookRecommendations';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, isConnected, markAllAsRead } = useSocket();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recommendations/trending?limit=5`);
      const data = await response.json();
      setTrendingBooks(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/recommendations/personalized?limit=4`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const getBookCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.split('/api')[0];
    const cleanPath = coverPath.startsWith('/') ? coverPath : `/${coverPath}`;
    return `${baseUrl}${cleanPath}`;
  };

  const getProfileImageUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.split('/api')[0];
    const cleanPath = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
    return `${baseUrl}${cleanPath}?t=${new Date().getTime()}`;
  };

  const itemsPerPage = 6;

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'FR', name: 'French', flag: '🇫🇷' },
    { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'DE', name: 'German', flag: '🇩🇪' },
    { code: 'ZH', name: 'Chinese', flag: '🇨🇳' },
    { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
    { code: 'AR', name: 'Arabic', flag: '🇸🇦' },
    { code: 'RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'PT', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'IT', name: 'Italian', flag: '🇮🇹' }
  ];

  const translations = {
    EN: {
      learnEffectively: "Learn Effectively With Us!",
      accessThousands: "Access thousands of books and resources for your studies.",
      borrowed: "Borrowed",
      readingPoints: "Reading Points",
      availableBooks: "Available Books - View & Download",
      available: "Available",
      popularCourses: "Popular Courses",
      allCourses: "All Courses",
      readingProgress: "Reading Progress",
      booksReadThisMonth: "Books Read This Month",
      currentActivity: "Current Activity",
      monthlyProgress: "Monthly Progress",
      realTimeStats: "Real-time library statistics",
      myBooks: "My Books",
      searchPlaceholder: "Search...",
      notifications: "Notifications",
      markAllAsRead: "Mark all as read",
      viewAllNotifications: "View all notifications",
      liveUpdates: "Live updates",
      connecting: "Connecting...",
      student: "Student",
      view: "View",
      download: "Download",
      selectLanguage: "Select Language",
      overview: "Dashboard",
      mailbox: "Mailbox",
      calendar: "Calendar",
      search: "Search",
      enrolled: "Enrolled",
      resources: "Resources",
      profile: "Profile",
      logout: "Logout",
      myBorrowedBooks: "My Borrowed Books",
      activeLabel: "active",
      librarySearch: "Library Search",
      results: "Results",
      noMessages: "No messages yet",
      newMessage: "New Message",
      upcomingDueDates: "Upcoming Due Dates",
      noDueDates: "No upcoming due dates",
      loadingBooks: "Loading books...",
      noBooksBorrowed: "No borrowed books yet. Visit the Search section to borrow books!",
      searchBooksPlaceholder: "Search books, authors, categories...",
      allAvailableBooks: "Available Books - View & Download",
      menu: "Menu",
      library: "Library",
      account: "Account",
      premiumMember: "Premium Member",
      due: "Due",
      members: "Members",
      open: "Open",
      addResource: "Add Resource",
      studyResources: "Study Resources"
    },
    FR: {
      learnEffectively: "Apprenez efficacement avec nous !",
      accessThousands: "Accédez à des milliers de livres et de ressources pour vos études.",
      borrowed: "Emprunté",
      readingPoints: "Points de lecture",
      availableBooks: "Livres disponibles - Voir & Télécharger",
      available: "Disponible",
      popularCourses: "Cours populaires",
      allCourses: "Tous les cours",
      readingProgress: "Progrès de lecture",
      booksReadThisMonth: "Livres lus ce mois-ci",
      currentActivity: "Activité actuelle",
      monthlyProgress: "Progrès mensuel",
      realTimeStats: "Statistiques de la bibliothèque en temps réel",
      myBooks: "Mes livres",
      searchPlaceholder: "Rechercher...",
      notifications: "Notifications",
      markAllAsRead: "Tout marquer comme lu",
      viewAllNotifications: "Voir toutes les notifications",
      liveUpdates: "Mises à jour en direct",
      connecting: "Connexion...",
      student: "Étudiant",
      view: "Voir",
      download: "Télécharger",
      selectLanguage: "Choisir la langue",
      overview: "Tableau de bord",
      mailbox: "Messagerie",
      calendar: "Calendrier",
      search: "Recherche",
      enrolled: "Inscrit",
      resources: "Ressources",
      profile: "Profil",
      logout: "Déconnexion",
      myBorrowedBooks: "Mes livres empruntés",
      activeLabel: "actif",
      librarySearch: "Recherche bibliothèque",
      results: "Résultats",
      noMessages: "Pas encore de messages",
      newMessage: "Nouveau message",
      upcomingDueDates: "Dates d'échéance à venir",
      noDueDates: "Pas de dates d'échéance à venir",
      loadingBooks: "Chargement des livres...",
      noBooksBorrowed: "Pas encore de livres empruntés. Visitez la section Recherche !",
      searchBooksPlaceholder: "Rechercher des livres, auteurs...",
      allAvailableBooks: "Livres disponibles - Voir & Télécharger",
      menu: "Menu",
      library: "Bibliothèque",
      account: "Compte",
      premiumMember: "Membre Premium",
      due: "Échéance",
      members: "Membres",
      open: "Ouvrir",
      addResource: "Ajouter ressource",
      studyResources: "Ressources d'étude"
    },
    ES: {
      learnEffectively: "¡Aprende eficazmente con nosotros!",
      accessThousands: "Accede a miles de libros y recursos para tus estudios.",
      borrowed: "Prestado",
      readingPoints: "Puntos de lectura",
      availableBooks: "Libros disponibles - Ver y descargar",
      available: "Disponible",
      popularCourses: "Cursos populares",
      allCourses: "Todos los cursos",
      readingProgress: "Progreso de lectura",
      booksReadThisMonth: "Libros leídos este mes",
      currentActivity: "Actividad actual",
      monthlyProgress: "Progreso mensual",
      realTimeStats: "Estadísticas de la biblioteca en tiempo real",
      myBooks: "Mis libros",
      searchPlaceholder: "Buscar...",
      notifications: "Notificaciones",
      markAllAsRead: "Marcar todo como leído",
      viewAllNotifications: "Ver todas las notificaciones",
      liveUpdates: "Actualizaciones en vivo",
      connecting: "Conectando...",
      student: "Estudiante",
      view: "Ver",
      download: "Descargar",
      selectLanguage: "Seleccionar idioma",
      overview: "Panel",
      mailbox: "Correo",
      calendar: "Calendario",
      search: "Buscar",
      enrolled: "Inscrito",
      resources: "Recursos",
      profile: "Perfil",
      logout: "Cerrar sesión",
      myBorrowedBooks: "Mis libros prestados",
      activeLabel: "activo",
      librarySearch: "Búsqueda en biblioteca",
      results: "Resultados",
      noMessages: "No hay mensajes aún",
      newMessage: "Nuevo mensaje",
      upcomingDueDates: "Próximas fechas de vencimiento",
      noDueDates: "No hay fechas de vencimiento próximas",
      loadingBooks: "Cargando libros...",
      noBooksBorrowed: "No hay libros prestados aún. ¡Visita la sección de búsqueda!",
      searchBooksPlaceholder: "Buscar libros, autores...",
      allAvailableBooks: "Libros disponibles - Ver y descargar",
      menu: "Menú",
      library: "Biblioteca",
      account: "Cuenta",
      premiumMember: "Miembro Premium",
      due: "Vencimiento",
      members: "Miembros",
      open: "Abrir",
      addResource: "Añadir recurso",
      studyResources: "Recursos de estudio"
    },
    DE: {
      learnEffectively: "Lernen Sie effektiv mit uns!",
      accessThousands: "Greifen Sie auf Tausende von Büchern und Ressourcen für Ihr Studium zu.",
      borrowed: "Ausgeliehen",
      readingPoints: "Lesepunkte",
      availableBooks: "Verfügbare Bücher - Anzeigen & Herunterladen",
      available: "Verfügbar",
      popularCourses: "Beliebte Kurse",
      allCourses: "Alle Kurse",
      readingProgress: "Lesefortschritt",
      booksReadThisMonth: "Diesen Monat gelesene Bücher",
      currentActivity: "Aktuelle Aktivität",
      monthlyProgress: "Monatlicher Fortschritt",
      realTimeStats: "Bibliotheksstatistiken in Echtzeit",
      myBooks: "Meine Bücher",
      searchPlaceholder: "Suchen...",
      notifications: "Benachrichtigungen",
      markAllAsRead: "Alle als gelesen markieren",
      viewAllNotifications: "Alle Benachrichtigungen anzeigen",
      liveUpdates: "Live-Updates",
      connecting: "Verbinden...",
      student: "Student",
      view: "Ansehen",
      download: "Herunterladen",
      selectLanguage: "Sprache auswählen",
      overview: "Dashboard",
      mailbox: "Postfach",
      calendar: "Kalender",
      search: "Suche",
      enrolled: "Eingeschrieben",
      resources: "Ressourcen",
      profile: "Profil",
      logout: "Abmelden",
      myBorrowedBooks: "Meine ausgeliehenen Bücher",
      activeLabel: "aktiv",
      librarySearch: "Bibliothekssuche",
      results: "Ergebnisse",
      noMessages: "Noch keine Nachrichten",
      newMessage: "Neue Nachricht",
      upcomingDueDates: "Anstehende Termine",
      noDueDates: "Keine anstehenden Termine",
      loadingBooks: "Bücher werden geladen...",
      noBooksBorrowed: "Noch keine Bücher ausgeliehen. Besuchen Sie die Suche!",
      searchBooksPlaceholder: "Bücher, Autoren suchen...",
      allAvailableBooks: "Verfügbare Bücher - Anzeigen & Herunterladen",
      menu: "Menü",
      library: "Bibliothek",
      account: "Konto",
      premiumMember: "Premium-Mitglied",
      due: "Fällig",
      members: "Mitglieder",
      open: "Öffnen",
      addResource: "Ressource hinzufügen",
      studyResources: "Studienressourcen"
    },
    ZH: {
      learnEffectively: "与我们一起高效学习！",
      accessThousands: "获取成千上万的书籍和资源进行学习。",
      borrowed: "已借阅",
      readingPoints: "阅读分数",
      availableBooks: "可用书籍 - 查看与下载",
      available: "可用",
      popularCourses: "热门课程",
      allCourses: "所有课程",
      readingProgress: "阅读进度",
      booksReadThisMonth: "本月阅读书籍",
      currentActivity: "当前活动",
      monthlyProgress: "每月进度",
      realTimeStats: "实时图书馆统计",
      myBooks: "我的书籍",
      searchPlaceholder: "搜索...",
      notifications: "通知",
      markAllAsRead: "全部标记为已读",
      viewAllNotifications: "查看所有通知",
      liveUpdates: "实时更新",
      connecting: "正在连接...",
      student: "学生",
      view: "查看",
      download: "下载",
      selectLanguage: "选择语言",
      overview: "仪表板",
      mailbox: "信箱",
      calendar: "日历",
      search: "搜索",
      enrolled: "已选",
      resources: "资源",
      profile: "个人资料",
      logout: "登出",
      myBorrowedBooks: "我的借阅书籍",
      activeLabel: "活跃",
      librarySearch: "图书馆搜索",
      results: "结果",
      noMessages: "暂无消息",
      newMessage: "新消息",
      upcomingDueDates: "即将到期的日期",
      noDueDates: "没有即将到期的日期",
      loadingBooks: "正在加载书籍...",
      noBooksBorrowed: "尚未借阅书籍。请前往搜索部分！",
      searchBooksPlaceholder: "搜索书籍、作者...",
      allAvailableBooks: "可用书籍 - 查看与下载",
      menu: "菜单",
      library: "图书馆",
      account: "账户",
      premiumMember: "高级会员",
      due: "到期",
      members: "成员",
      open: "打开",
      addResource: "添加资源",
      studyResources: "学习资源"
    },
    JA: {
      learnEffectively: "私たちと一緒に効果的に学びましょう！",
      accessThousands: "学習のための数千冊の本やリソースにアクセスできます。",
      borrowed: "借用中",
      readingPoints: "読書ポイント",
      availableBooks: "利用可能な本 - 閲覧とダウンロード",
      available: "利用可能",
      popularCourses: "人気のコース",
      allCourses: "すべてのコース",
      readingProgress: "読書の進捗",
      booksReadThisMonth: "今月の読了数",
      currentActivity: "現在のアクティビティ",
      monthlyProgress: "月間の進捗",
      realTimeStats: "リアルタイムのライブラリ統計",
      myBooks: "自分の本",
      searchPlaceholder: "検索...",
      notifications: "通知",
      markAllAsRead: "すべて既読にする",
      viewAllNotifications: "すべての通知を表示",
      liveUpdates: "ライブアップデート",
      connecting: "接続中...",
      student: "学生",
      view: "閲覧",
      download: "ダウンロード",
      selectLanguage: "言語を選択",
      overview: "ダッシュボード",
      mailbox: "メールボックス",
      calendar: "カレンダー",
      search: "検索",
      enrolled: "登録済み",
      resources: "リソース",
      profile: "プロフィール",
      logout: "ログアウト",
      myBorrowedBooks: "借りている本",
      activeLabel: "アクティブ",
      librarySearch: "ライブラリ検索",
      results: "結果",
      noMessages: "メッセージはありません",
      newMessage: "新規メッセージ",
      upcomingDueDates: "今後の返却日",
      noDueDates: "今後の返却日はありません",
      loadingBooks: "本を読み込み中...",
      noBooksBorrowed: "まだ本を借りていません。検索セクションをご覧ください！",
      searchBooksPlaceholder: "本、著者、カテゴリを検索...",
      allAvailableBooks: "利用可能な本 - 閲覧とダウンロード",
      menu: "メニュー",
      library: "ライブラリ",
      account: "アカウント",
      premiumMember: "プレミアムメンバー",
      due: "期限",
      members: "メンバー",
      open: "開く",
      addResource: "リソースを追加",
      studyResources: "学習リソース"
    },
    AR: {
      learnEffectively: "تعلم بفعالية معنا!",
      accessThousands: "الوصول إلى آلاف الكتب والموارد لدراستك.",
      borrowed: "مستعار",
      readingPoints: "نقاط القراءة",
      availableBooks: "الكتب المتاحة - عرض وتحميل",
      available: "متاح",
      popularCourses: "الدورات الشعبية",
      allCourses: "جميع الدورات",
      readingProgress: "تقدم القراءة",
      booksReadThisMonth: "الكتب المقروءة هذا الشهر",
      currentActivity: "النشاط الحالي",
      monthlyProgress: "التقدم الشهري",
      realTimeStats: "إحصائيات المكتبة الحية",
      myBooks: "كتبي",
      searchPlaceholder: "بحث...",
      notifications: "إخطارات",
      markAllAsRead: "تحديد الكل كمقروء",
      viewAllNotifications: "عرض جميع الإخطارات",
      liveUpdates: "تحديثات حية",
      connecting: "جاري الاتصال...",
      student: "طالب",
      view: "عرض",
      download: "تحميل",
      selectLanguage: "اختار اللغة",
      overview: "لوحة القيادة",
      mailbox: "بريد",
      calendar: "التقويم",
      search: "بحث",
      enrolled: "مسجل",
      resources: "موارد",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
      myBorrowedBooks: "كتبي المستعارة",
      activeLabel: "نشط",
      librarySearch: "بحث المكتبة",
      results: "نتائج",
      noMessages: "لا توجد رسائل بعد",
      newMessage: "رسالة جديدة",
      upcomingDueDates: "تواريخ الاستحقاق القادمة",
      noDueDates: "لا توجد تواريخ استحقاق قادمة",
      loadingBooks: "جاري تحميل الكتب...",
      noBooksBorrowed: "لم يتم استعارة أي كتب بعد. قم بزيارة قسم البحث!",
      searchBooksPlaceholder: "البحث عن الكتب والمؤلفين...",
      allAvailableBooks: "الكتب المتاحة - عرض وتحميل",
      menu: "قائمة",
      library: "مكتبة",
      account: "حساب",
      premiumMember: "عضو مميز",
      due: "استحقاق",
      members: "أعضاء",
      open: "فتح",
      addResource: "إضافة مورد",
      studyResources: "موارد الدراسة"
    },
    RU: {
      learnEffectively: "Учитесь эффективно с нами!",
      accessThousands: "Получите доступ к тысячам книг и ресурсов для учебы.",
      borrowed: "Взято",
      readingPoints: "Очки чтения",
      availableBooks: "Доступные книги - Просмотр и загрузка",
      available: "Доступно",
      popularCourses: "Популярные курсы",
      allCourses: "Все курсы",
      readingProgress: "Прогресс чтения",
      booksReadThisMonth: "Книг прочитано в этом месяце",
      currentActivity: "Текущая активность",
      monthlyProgress: "Ежемесячный прогресс",
      realTimeStats: "Живая статистика библиотеки",
      myBooks: "Мои книги",
      searchPlaceholder: "Поиск...",
      notifications: "Уведомления",
      markAllAsRead: "Отметить все как прочитанные",
      viewAllNotifications: "Посмотреть все уведомления",
      liveUpdates: "Живые обновления",
      connecting: "Подключение...",
      student: "Студент",
      view: "Просмотр",
      download: "Скачать",
      selectLanguage: "Выберите язык",
      overview: "Панель",
      mailbox: "Почта",
      calendar: "Календарь",
      search: "Поиск",
      enrolled: "Записан",
      resources: "Ресурсы",
      profile: "Профиль",
      logout: "Выход",
      myBorrowedBooks: "Мои взятые книги",
      activeLabel: "активен",
      librarySearch: "Поиск по библиотеке",
      results: "Результатов",
      noMessages: "Сообщений пока нет",
      newMessage: "Новое сообщение",
      upcomingDueDates: "Ближайшие сроки",
      noDueDates: "Ближайших сроков нет",
      loadingBooks: "Загрузка книг...",
      noBooksBorrowed: "Книг пока нет. Посетите раздел Поиска!",
      searchBooksPlaceholder: "Поиск книг, авторов...",
      allAvailableBooks: "Доступные книги - Просмотр и загрузка",
      menu: "Меню",
      library: "Библиотека",
      account: "Аккаунт",
      premiumMember: "Премиум-участник",
      due: "Срок",
      members: "Участники",
      open: "Открыть",
      addResource: "Добавить ресурс",
      studyResources: "Учебные ресурсы"
    },
    PT: {
      learnEffectively: "Aprenda efetivamente conosco!",
      accessThousands: "Aceda a milhares de livros e recursos para os seus estudos.",
      borrowed: "Emprestado",
      readingPoints: "Pontos de leitura",
      availableBooks: "Livros disponíveis - Ver e descarregar",
      available: "Disponível",
      popularCourses: "Cursos populares",
      allCourses: "Todos os cursos",
      readingProgress: "Progresso de leitura",
      booksReadThisMonth: "Livros lidos este mês",
      currentActivity: "Atividade atual",
      monthlyProgress: "Progresso mensal",
      realTimeStats: "Estatísticas da biblioteca em tempo real",
      myBooks: "Meus livros",
      searchPlaceholder: "Pesquisar...",
      notifications: "Notificações",
      markAllAsRead: "Marcar tudo como lido",
      viewAllNotifications: "Ver todas as notificações",
      liveUpdates: "Atualizações ao vivo",
      connecting: "Conectando...",
      student: "Estudante",
      view: "Ver",
      download: "Descarregar",
      selectLanguage: "Selecionar idioma",
      overview: "Painel",
      mailbox: "Correio",
      calendar: "Calendário",
      search: "Pesquisar",
      enrolled: "Inscrito",
      resources: "Recursos",
      profile: "Perfil",
      logout: "Sair",
      myBorrowedBooks: "Meus livros emprestados",
      activeLabel: "ativo",
      librarySearch: "Pesquisa na biblioteca",
      results: "Resultados",
      noMessages: "Ainda sem mensagens",
      newMessage: "Nova mensagem",
      upcomingDueDates: "Próximas datas de entrega",
      noDueDates: "Sem datas de entrega próximas",
      loadingBooks: "Carregando livros...",
      noBooksBorrowed: "Ainda sem livros emprestados. Visite a secção de Pesquisa!",
      searchBooksPlaceholder: "Pesquisar livros, autores...",
      allAvailableBooks: "Livros disponíveis - Ver e descarregar",
      menu: "Menu",
      library: "Biblioteca",
      account: "Conta",
      premiumMember: "Membro Premium",
      due: "Entrega",
      members: "Membros",
      open: "Abrir",
      addResource: "Adicionar recurso",
      studyResources: "Recursos de estudo"
    },
    IT: {
      learnEffectively: "Impara efficacemente con noi!",
      accessThousands: "Accedi a migliaia di libri e risorse per i tuoi studi.",
      borrowed: "In prestito",
      readingPoints: "Punti lettura",
      availableBooks: "Libri disponibili - Visualizza e scarica",
      available: "Disponibile",
      popularCourses: "Corsi popolari",
      allCourses: "Tutti i corsi",
      readingProgress: "Progresso lettura",
      booksReadThisMonth: "Libri letti questo mese",
      currentActivity: "Attività attuale",
      monthlyProgress: "Progresso mensile",
      realTimeStats: "Statistiche della biblioteca in tempo real",
      myBooks: "I miei libri",
      searchPlaceholder: "Cerca...",
      notifications: "Notifiche",
      markAllAsRead: "Segna tutti come letti",
      viewAllNotifications: "Visualizza tutte le notifiche",
      liveUpdates: "Aggiornamenti dal vivo",
      connecting: "Connessione...",
      student: "Studente",
      view: "Visualizza",
      download: "Scarica",
      selectLanguage: "Seleziona lingua",
      overview: "Dashboard",
      mailbox: "Messaggi",
      calendar: "Calendario",
      search: "Cerca",
      enrolled: "Iscritto",
      resources: "Risorse",
      profile: "Profilo",
      logout: "Disconnetti",
      myBorrowedBooks: "I miei libri in prestito",
      activeLabel: "attivo",
      librarySearch: "Ricerca biblioteca",
      results: "Risultati",
      noMessages: "Ancora nessun messaggio",
      newMessage: "Nuovo messaggio",
      upcomingDueDates: "Prossime scadenze",
      noDueDates: "Nessuna scadenza imminente",
      loadingBooks: "Caricamento libri...",
      noBooksBorrowed: "Ancora nessun libro in prestito. Visita la sezione Ricerca!",
      searchBooksPlaceholder: "Cerca libri, autori...",
      allAvailableBooks: "Libri disponibili - Visualizza e scarica",
      menu: "Menu",
      library: "Biblioteca",
      account: "Account",
      premiumMember: "Membro Premium",
      due: "Scadenza",
      members: "Membres",
      open: "Apri",
      addResource: "Aggiungi risorsa",
      studyResources: "Risorse di studio"
    }
  };

  const t = (key) => translations[currentLang]?.[key] || translations['EN'][key] || key;

  // Book Viewer State
  const [viewerBook, setViewerBook] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  // Real data from API
  const [studentData, setStudentData] = useState({
    borrowedCount: 0,
    readCount: 0,
    pendingRequests: 0,
    readingPoints: 0,
    studentId: user?.studentId || '',
    department: user?.department || ''
  });

  const [currentBooks, setCurrentBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [studyResources, setStudyResources] = useState([
    { id: 1, title: 'Study Group - Mathematics', type: 'Group', members: 25, icon: 'G' },
    { id: 2, title: 'Programming Workshop', type: 'Workshop', members: 15, icon: 'W' },
    { id: 3, title: 'Research Papers', type: 'Documents', icon: 'D' }
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch real data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch my borrowed books
        const borrowedData = await borrowingAPI.getMyBooks('BORROWED');
        const formattedBooks = (borrowedData.records || []).map(record => ({
          id: record.id,
          title: record.book?.title || 'Unknown Book',
          author: record.book?.author || 'Unknown Author',
          dueDate: new Date(record.dueDate).toLocaleDateString(),
          progress: Math.floor(Math.random() * 100),
          canRenew: true,
          cover: record.book?.category?.substring(0, 2).toUpperCase() || 'BK',
          coverImage: record.book?.coverImage,
          digitalUrl: record.book?.digitalUrl,
          category: record.book?.category,
          rating: 4.5,
          description: record.book?.description || 'No description available'
        }));
        setCurrentBooks(formattedBooks);

        // Fetch all available books from library
        const booksData = await bookAPI.getAll({ limit: 50, available: 'true' });
        const formattedRecommended = (booksData.books || []).map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          rating: 4.5 + Math.random() * 0.5,
          cover: book.category?.substring(0, 3).toUpperCase() || 'BK',
          coverImage: book.coverImage,
          digitalUrl: book.digitalUrl,
          description: book.description || 'No description available',
          isDemo: false
        }));
        setRecommendedBooks(formattedRecommended);

        // Update student stats
        setStudentData(prev => ({
          ...prev,
          borrowedCount: formattedBooks.length,
          studentId: user?.studentId || prev.studentId,
          department: user?.department || prev.department
        }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Scoped theme for scrollbar targeting
  useEffect(() => {
    document.body.classList.add('student-theme');
    return () => {
      document.body.classList.remove('student-theme');
    };
  }, []);

  // Real-time updates for notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications[0];

      // Trigger Toast for any new unread notification
      if (latestNotif.unread) {
        setActiveToast(latestNotif);
        const timer = setTimeout(() => setActiveToast(null), 5000);
        return () => clearTimeout(timer);
      }

      if (latestNotif.type === 'BORROW_APPROVED' || latestNotif.type === 'BOOK_RETURNED') {
        borrowingAPI.getMyBooks('BORROWED').then(data => {
          const formattedBooks = (data.records || []).map(record => ({
            id: record.id,
            title: record.book?.title || 'Unknown Book',
            author: record.book?.author || 'Unknown Author',
            dueDate: new Date(record.dueDate).toLocaleDateString(),
            progress: Math.floor(Math.random() * 100),
            canRenew: true,
            cover: record.book?.category?.substring(0, 2).toUpperCase() || 'BK',
            digitalUrl: record.book?.digitalUrl
          }));
          setCurrentBooks(formattedBooks);
          setStudentData(prev => ({ ...prev, borrowedCount: formattedBooks.length }));
        });
      }
    }
  }, [notifications]);

  // View book handler - Opens BookViewer
  const handleViewBook = (book) => {
    setViewerBook(book);
    setShowViewer(true);
  };

  // Download book handler - Real download
  const handleDownloadBook = async (book) => {
    if (!book.digitalUrl) {
      alert('This book does not have a digital version available for download');
      return;
    }

    try {
      const blob = await bookAPI.downloadBook(book.digitalUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading book:', error);
      alert('Failed to download book. Please try again.');
    }
  };

  const [eduCourses] = useState([
    { id: 1, title: 'UI/UX Design', author: '30+ Courses', cover: 'U', color: '#FBBF24' },
    { id: 2, title: 'Marketing', author: '20+ Courses', cover: 'M', color: '#F472B6' },
    { id: 3, title: 'Web Dev', author: '35+ Courses', cover: 'W', color: '#2DD4BF' },
    { id: 4, title: 'Mathematics', author: '50+ Courses', cover: 'M', color: '#3B82F6' }
  ]);

  // Voice Search Logic
  const [isListening, setIsListening] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const startVoiceSearch = () => {
    // Switch to search section if not already active
    if (activeSection !== 'search') {
      setActiveSection('search');
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'FR' ? 'fr-FR' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setCurrentPage(1);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        setIsListening(false);
        console.error("Voice search error", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please allow microphone permissions.");
        } else if (event.error === 'no-speech') {
          alert("No speech detected. Please try again.");
        }
      };

      recognition.start();
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  const TeamModal = () => (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal-content" style={{
        background: 'white', padding: '2rem', borderRadius: '16px',
        width: '90%', maxWidth: '500px', position: 'relative'
      }}>
        <button onClick={() => setShowTeamModal(false)} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
        }}><i className="bi bi-x"></i></button>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--ed-primary)' }}>
          🚀 SmartLib Team
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
          The brilliant minds behind this AI-Powered library.
        </p>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[
            'Maniragaba Jean Willson',
            'Uwase Sion',
            'Nyirashikama Joy',
            'Iranzi steven',
            'Ikuzwe Nizeyimana Egide',
            'Muriza Cyiza Briand',
            'Ingabire christella'
          ].map((name, idx) => (
            <li key={idx} style={{
              padding: '0.75rem', borderBottom: '1px solid #eee',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: `hsl(${idx * 50}, 70%, 80%)`, color: '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                {name[0]}
              </div>
              <span style={{ fontWeight: 600 }}>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // --- Sub-sections ---

  // ... (keeping existing sub-sections)

  // EduLearn Overview Section
  const StudentOverview = () => (
    <div className="ed-content">
      {/* Hero Belt */}
      <div className="hero-belt">
        <div className="ed-hero-card">
          <div className="ed-hero-text">
            <h1>{t('learnEffectively')}</h1>
            <p>{t('accessThousands')}</p>
            <div className="hero-stats">
              <div className="h-stat">
                <div className="h-stat-icon"><i className="bi bi-book"></i></div>
                <div className="h-stat-info">
                  <span className="label">{t('borrowed')}</span>
                  <span className="val">{studentData.borrowedCount} Books</span>
                </div>
              </div>
              <div className="h-stat">
                <div className="h-stat-icon" style={{ color: 'var(--ed-yellow)' }}><i className="bi bi-star-fill"></i></div>
                <div className="h-stat-info">
                  <span className="label">{t('readingPoints')}</span>
                  <span className="val">{studentData.readingPoints} Pts</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-visual" style={{ fontSize: '80px', display: 'flex', alignItems: 'center', opacity: 0.2 }}>
            <i className="bi bi-mortarboard-fill"></i>
          </div>
        </div>
      </div>

      {/* Available Books Section */}
      <div className="ed-section">
        <div className="ed-section-head">
          <h2><i className="bi bi-book-half"></i> {t('availableBooks')}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--ed-primary)', fontWeight: 600 }}>{recommendedBooks.length} {t('available')}</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>Loading books...</div>
        ) : recommendedBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>No books available yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {recommendedBooks.slice(0, 6).map(book => (
              <div key={book.id} style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid var(--ed-border)',
                padding: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: book.coverImage ? 'transparent' : 'linear-gradient(135deg, var(--ed-primary) 0%, #6366F1 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '800',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  border: book.coverImage ? '1px solid var(--ed-border)' : 'none'
                }}>
                  {book.coverImage ? (
                    <img
                      src={getBookCoverUrl(book.coverImage)}
                      alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.parentElement.style.background = 'linear-gradient(135deg, var(--ed-primary) 0%, #6366F1 100%)'; e.target.style.display = 'none'; e.target.parentElement.innerHTML = book.cover; }}
                    />
                  ) : book.cover}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: 'var(--ed-text-dark)' }}>
                  {book.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--ed-text-sub)', margin: '0 0 0.5rem 0' }}>
                  <i className="bi bi-person"></i> {book.author}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#FBBF24' }}>
                    <i className="bi bi-star-fill"></i> {book.rating.toFixed(1)}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ed-text-sub)' }}>• {book.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleViewBook(book)}
                    className="item-action-pill"
                    style={{ flex: 1, textAlign: 'center', background: 'var(--ed-primary)', color: 'white', border: 'none' }}
                  >
                    <i className="bi bi-eye"></i> {t('view')}
                  </button>
                  {book.digitalUrl && (
                    <button
                      onClick={() => handleDownloadBook(book)}
                      className="item-action-pill"
                      style={{ flex: 1, textAlign: 'center', border: 'none' }}
                    >
                      <i className="bi bi-download"></i> {t('download')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dash-row-grid">
        {/* Main Grid Left: Popular Courses */}
        <div className="ed-dash-col">
          <div className="ed-section">
            <div className="ed-section-head">
              <h2>{t('popularCourses')}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--ed-primary)', fontWeight: 600 }}>{t('allCourses')}</span>
            </div>
            <div className="ed-list">
              {eduCourses.map(book => (
                <div key={book.id} className="ed-list-item">
                  <div className="item-badge" style={{ backgroundColor: book.color, width: '38px', height: '38px', fontSize: '1rem' }}>{book.cover}</div>
                  <div className="item-info">
                    <span className="name">{book.title}</span>
                    <span className="sub">{book.author}</span>
                  </div>
                  <div className="item-action-pill"><i className="bi bi-chevron-right"></i></div>
                </div>
              ))}
            </div>
          </div>

          <div className="ed-section">
            <h2>{t('readingProgress')}</h2>
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: '0.875rem' }}>
              <div style={{ width: '100%', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span>{t('booksReadThisMonth')}</span>
                  <span style={{ fontWeight: '700', color: 'var(--ed-primary)' }}>{studentData.readCount}/10</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(studentData.readCount / 10) * 100}%`, height: '100%', background: 'var(--ed-primary)', transition: 'width 0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Middle: Activity & Huge Stats */}
        <div className="ed-dash-col">
          <div className="ed-section" style={{ flex: 2 }}>
            <div className="ed-section-head">
              <h2 style={{ fontSize: '1rem', fontWeight: '800' }}>{t('currentActivity')}</h2>
              <span className="item-action-pill">{t('monthlyProgress')}</span>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--ed-text-sub)', marginBottom: '1.5rem' }}>{t('realTimeStats')}</div>
              <div className="chart-area" style={{ height: '120px', position: 'relative', marginTop: '1rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0 }}>
                  <path d="M0 40 L0 35 Q 10 30, 20 38 Q 30 20, 40 32 Q 50 10, 60 25 Q 70 5, 80 18 Q 90 12, 100 20 L 100 40 Z" fill="rgba(59, 130, 246, 0.1)" />
                  <path d="M0 35 Q 10 30, 20 38 Q 30 20, 40 32 Q 50 10, 60 25 Q 70 5, 80 18 Q 90 12, 100 20" stroke="var(--ed-primary)" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
          </div>

          <div className="big-stats-belt">
            <div className="giant-stat-card yellow" style={{ flex: 1 }}>
              <span className="val" style={{ fontSize: '1.75rem' }}>{recommendedBooks.length}</span>
              <span className="lbl" style={{ fontSize: '0.8rem' }}>{t('availableBooks')}</span>
              <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', background: 'rgba(255,255,255,0.2)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </div>
            </div>
            <div className="giant-stat-card pink" style={{ flex: 1 }}>
              <span className="val" style={{ fontSize: '1.75rem' }}>{studentData.borrowedCount}</span>
              <span className="lbl" style={{ fontSize: '0.8rem' }}>{t('myBooks')}</span>
              <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', background: 'rgba(255,255,255,0.2)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MyBooksSection = () => (
    <div className="ed-content">
      <div className="ed-section">
        {/* AI Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="section-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <h2>
              <i className="bi bi-stars" style={{ color: '#8b5cf6', marginRight: '0.5rem' }}></i>
              Recommended for You
            </h2>
            <div className="section-actions">
              <button className="btn-link">See All</button>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            {recommendations.map(book => (
              <div key={book.id} className="book-card" onClick={() => handleBookClick(book)}>
                <div className="book-cover">
                  {book.coverImage ? (
                    <img src={getBookCoverUrl(book.coverImage)} alt={book.title} />
                  ) : (
                    <div className="placeholder-cover">
                      <i className="bi bi-book"></i>
                    </div>
                  )}
                  <div className="book-overlay">
                    <button className="action-btn view-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleBookClick(book);
                    }}>
                      <i className="bi bi-eye"></i> View
                    </button>
                  </div>
                  {book.digitalUrl && <span className="badge pdf-badge">PDF</span>}
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <div className="book-meta">
                    <span className="category">{book.category}</span>
                    <span className="rating">
                      <i className="bi bi-star-fill" style={{ color: '#fbbf24', marginRight: '4px' }}></i>
                      4.5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ed-section-head">
          <h2>My Borrowed Books</h2>
          <span className="item-action-pill">{currentBooks.length} active</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>{t('loadingBooks')}</div>
        ) : currentBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>
            <i className="bi bi-book" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: '#d1d5db' }}></i>
            <p>{t('noBooksBorrowed')}</p>
          </div>
        ) : (
          <div className="ed-list">
            {currentBooks.map(book => (
              <div key={book.id} className="ed-list-item">
                <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {book.coverImage ? (
                    <img src={getBookCoverUrl(book.coverImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : book.cover[0]}
                </div>
                <div className="item-info">
                  <span className="name" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{book.title}</span>
                  <span className="sub">by {book.author} • Due: {book.dueDate}</span>
                </div>
                <div className="item-action-pill" onClick={() => handleViewBook(book)} style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
                  <i className="bi bi-eye" style={{ marginRight: '0.25rem' }}></i>{t('view')}
                </div>
                {book.digitalUrl && (
                  <div className="item-action-pill" onClick={() => handleDownloadBook(book)} style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
                    <i className="bi bi-download" style={{ marginRight: '0.25rem' }}></i>{t('download')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const BookSearchSection = () => {
    const filteredResults = recommendedBooks.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="ed-content">
        <div className="ed-section">
          <div className="ed-section-head">
            <h2>{t('librarySearch')}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--ed-text-sub)' }}>{filteredResults.length} {t('results')}</span>
          </div>
          <div className="ed-search-container" style={{ maxWidth: 'none', marginBottom: '1rem', background: '#F8FAFC', padding: '0.5rem 0.75rem' }}>
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="ed-search-input"
              placeholder={t('searchBooksPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button
              onClick={startVoiceSearch}
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title="Voice Search"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isListening ? '#ef4444' : 'var(--ed-text-sub)',
                transition: 'all 0.2s',
                padding: '4px 8px',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
            >
              <i className={`bi bi-${isListening ? 'mic-fill' : 'mic'}`}></i>
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ed-text-sub)' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>{t('loadingBooks')}</div>
          ) : paginatedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>
              <i className="bi bi-search" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: '#d1d5db' }}></i>
              <p>{t('noBooksFound', { searchQuery })}</p>
            </div>
          ) : (
            <>
              <div className="instructor-list">
                {paginatedItems.map(book => (
                  <div key={book.id} className="instructor-item">
                    <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {book.coverImage ? (
                        <img src={getBookCoverUrl(book.coverImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (book.cover ? book.cover[0] : 'B')}
                    </div>
                    <div className="inst-info">
                      <span className="name" style={{ fontSize: '0.85rem' }}>{book.title}</span>
                      <span className="count">{book.author} • {book.category}</span>
                    </div>
                    <div className="item-action-pill" onClick={() => handleViewBook(book)} style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
                      <i className="bi bi-eye" style={{ marginRight: '0.25rem' }}></i>{t('view')}
                    </div>
                    {book.digitalUrl && (
                      <button
                        className="item-btn-download"
                        onClick={() => handleDownloadBook(book)}
                      >
                        <i className="bi bi-download"></i> {t('download')}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="ed-pagination">
                  <button
                    className="pag-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`pag-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="pag-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const StudyResourcesSection = () => (
    <div className="ed-content">
      <div className="ed-section">
        <div className="ed-section-head">
          <h2>{t('studyResources')}</h2>
          <button className="ed-btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            <i className="bi bi-plus-lg"></i> {t('addResource')}
          </button>
        </div>
        <div className="ed-list">
          {studyResources.map(res => (
            <div key={res.id} className="ed-list-item">
              <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px' }}>
                <i className={`bi bi-${res.icon === 'G' ? 'people' : res.icon === 'W' ? 'code-slash' : 'journal-text'}`}></i>
              </div>
              <div className="item-info">
                <span className="name" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{res.title}</span>
                <span className="sub">{res.type} {res.members ? `• ${res.members} ${t('members')}` : ''}</span>
              </div>
              <div className="item-action-pill" style={{ cursor: 'pointer' }}>
                <i className="bi bi-box-arrow-up-right"></i> {t('open')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MailboxSection = () => (
    <div className="ed-content">
      <div className="ed-section">
        <div className="ed-section-head">
          <h2><i className="bi bi-envelope"></i> {t('mailbox')}</h2>
          <button className="ed-btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            <i className="bi bi-plus-lg"></i> {t('newMessage')}
          </button>
        </div>
        <div className="ed-list">
          {notifications.slice(0, 10).map((notif, idx) => (
            <div key={idx} className="ed-list-item">
              <div className="item-badge" style={{ background: notif.unread ? 'var(--ed-primary-soft)' : '#E2E8F0', color: notif.unread ? 'var(--ed-primary)' : '#6b7280', width: '36px', height: '36px' }}>
                <i className="bi bi-envelope"></i>
              </div>
              <div className="item-info">
                <span className="name" style={{ fontSize: '0.875rem', fontWeight: notif.unread ? 700 : 500 }}>{notif.message || notif.text}</span>
                <span className="sub">{notif.timestamp ? new Date(notif.timestamp).toLocaleString() : notif.time}</span>
              </div>
              {notif.unread && <div style={{ width: '8px', height: '8px', background: 'var(--ed-primary)', borderRadius: '50%' }}></div>}
            </div>
          ))}
          {notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ed-text-sub)' }}>
              <i className="bi bi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: '#d1d5db' }}></i>
              <p>{t('noMessages')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CalendarSection = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

    return (
      <div className="ed-content">
        <div className="ed-section">
          <div className="ed-section-head">
            <h2><i className="bi bi-calendar3"></i> {t('calendar')}</h2>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ed-text-dark)' }}>
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ed-text-sub)', padding: '0.5rem' }}>
                {day}
              </div>
            ))}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: '0.5rem' }}></div>
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate();
              return (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: isToday ? 'var(--ed-primary)' : 'transparent',
                    color: isToday ? 'white' : 'var(--ed-text-dark)',
                    fontWeight: isToday ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => !isToday && (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => !isToday && (e.currentTarget.style.background = 'transparent')}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>{t('upcomingDueDates')}</h3>
            <div className="ed-list">
              {currentBooks.slice(0, 5).map(book => (
                <div key={book.id} className="ed-list-item">
                  <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px' }}>
                    <i className="bi bi-calendar-event"></i>
                  </div>
                  <div className="item-info">
                    <span className="name" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{book.title}</span>
                    <span className="sub">{t('due')}: {book.dueDate}</span>
                  </div>
                </div>
              ))}
              {currentBooks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ed-text-sub)' }}>
                  <p>{t('noDueDates')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="dashboard-lms-shell">
      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`ed-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="ed-brand" onClick={() => setActiveSection('overview')} style={{ cursor: 'pointer' }}>
          <div className="ed-brand-icon"><i className="bi bi-book-half"></i></div>
          <span className="ed-brand-text" style={{ fontSize: '1.1rem' }}>SmartLib</span>
        </div>

        <nav className="ed-nav-menu">
          <div className="sidebar-cat">{t('menu')}</div>
          <button className={`ed-nav-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
            <i className="bi bi-grid-1x2"></i> {t('overview')}
          </button>
          <button className={`ed-nav-item ${activeSection === 'mailbox' ? 'active' : ''}`} onClick={() => setActiveSection('mailbox')}>
            <i className="bi bi-envelope"></i> {t('mailbox')}
          </button>
          <button className={`ed-nav-item ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => setActiveSection('calendar')}>
            <i className="bi bi-calendar3"></i> {t('calendar')}
          </button>

          <div className="sidebar-cat">{t('library')}</div>
          <button className={`ed-nav-item ${activeSection === 'search' ? 'active' : ''}`} onClick={() => setActiveSection('search')}>
            <i className="bi bi-search"></i> {t('search')}
          </button>
          <button className={`ed-nav-item ${activeSection === 'mybooks' ? 'active' : ''}`} onClick={() => setActiveSection('mybooks')}>
            <i className="bi bi-journal-check"></i> {t('myBooks')}
          </button>
          <button className={`ed-nav-item ${activeSection === 'resources' ? 'active' : ''}`} onClick={() => setActiveSection('resources')}>
            <i className="bi bi-journal-bookmark"></i> {t('resources')}
          </button>
          <button className={`ed-nav-item ${activeSection === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveSection('recommendations')}>
            <i className="bi bi-stars"></i> Recommendations
          </button>

          <div className="sidebar-cat">{t('account')}</div>
          <button className="ed-nav-item" onClick={() => navigate('/profile')}>
            <i className="bi bi-person-circle"></i> {t('profile')}
          </button>
          <button className="ed-nav-item" onClick={() => { logout(); navigate('/login'); }}>
            <i className="bi bi-box-arrow-right"></i> {t('logout')}
          </button>

          <div className="sidebar-cat">About</div>
          <button className="ed-nav-item" onClick={() => setShowTeamModal(true)}>
            <i className="bi bi-people"></i> Team
          </button>
        </nav>

        <div className="sidebar-promo">
          <div style={{ background: 'var(--ed-primary-soft)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', color: 'var(--ed-primary)' }}><i className="bi bi-award"></i></div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--ed-text-dark)' }}>{t('premiumMember')}</div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="ed-main">
        <header className="ed-top-bar">
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`bi bi-${mobileMenuOpen ? 'x' : 'list'}`}></i>
          </button>

          <div className="header-search-wrap">
            <div className="ed-search-container" style={{ height: '36px' }}>
              <i className="bi bi-search" style={{ color: 'var(--ed-text-sub)', fontSize: '0.9rem' }}></i>
              <input
                type="text"
                className="ed-search-input"
                placeholder={t('searchPlaceholder')}
                style={{ fontSize: '0.8rem' }}
                value={activeSection === 'search' ? searchQuery : ''}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeSection !== 'search') setActiveSection('search');
                }}
                onFocus={() => setActiveSection('search')}
              />
              <button
                onClick={startVoiceSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isListening ? '#ef4444' : 'var(--ed-text-sub)',
                  padding: '0 8px'
                }}
              >
                <i className={`bi bi-${isListening ? 'mic-fill' : 'mic'}`}></i>
              </button>
            </div>
          </div>

          <div className="top-bar-actions">
            <div className="lang-switcher-wrap" style={{ position: 'relative' }}>
              <button className="icon-btn lang-btn" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                <i className="bi bi-globe" style={{ fontSize: '1.1rem' }}></i>
                <span className="lang-code">{currentLang}</span>
              </button>

              {showLanguageDropdown && (
                <div className="lang-dropdown">
                  <div className="lang-dropdown-header">{t('selectLanguage')}</div>
                  <div className="lang-list">
                    {languages.map(lang => (
                      <div
                        key={lang.code}
                        className={`lang-item ${currentLang === lang.code ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                      >
                        <span className="lang-flag">{lang.flag}</span>
                        <span className="lang-name">{lang.name}</span>
                        {currentLang === lang.code && <i className="bi bi-check2"></i>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn theme-toggle-btn" onClick={toggleTheme}>
              <i className={`bi bi-${isDarkMode ? 'brightness-high' : 'moon-stars'}`} style={{ fontSize: '1.1rem' }}></i>
            </button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <i className="bi bi-bell" style={{ fontSize: '1.1rem' }}></i>
                {notifications.some(n => n.unread) && <span className="notification-dot"></span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <span>{t('notifications')} ({notifications.filter(n => n.unread).length})</span>
                    <span className="mark-read" onClick={markAllAsRead}>{t('markAllAsRead')}</span>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ed-text-sub)', fontSize: '0.75rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                          <div className="notif-icon"><i className="bi bi-info-circle"></i></div>
                          <div className="notif-content">
                            <p>{n.message || n.text}</p>
                            <span>{n.time || (n.timestamp && new Date(n.timestamp).toLocaleDateString())}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="notif-footer">{t('viewAllNotifications')}</div>
                  <div style={{ padding: '0.5rem', fontSize: '0.65rem', color: 'var(--ed-text-sub)', textAlign: 'center', borderTop: '1px solid var(--ed-border)' }}>
                    {isConnected ? `🟢 ${t('liveUpdates')}` : `🔴 ${t('connecting')}`}
                  </div>
                </div>
              )}
            </div>

            <div className="user-hi" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <div className="user-hi-text">
                <span className="name" style={{ fontSize: '0.8rem' }}>{user?.name?.split(' ')[0]}</span>
                <span className="role" style={{ fontSize: '0.65rem' }}>Student</span>
              </div>
              {user?.profilePicture ? (
                <img
                  src={getProfileImageUrl(user.profilePicture)}
                  className="user-avatar"
                  alt="Profile"
                  style={{ width: '32px', height: '32px' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32'; }}
                />
              ) : (
                <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, width: '32px', height: '32px' }}>
                  {user?.name?.[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ed-dash-body">
          {activeSection === 'overview' && <StudentOverview />}
          {activeSection === 'mybooks' && <MyBooksSection />}
          {activeSection === 'search' && <BookSearchSection />}
          {activeSection === 'resources' && <StudyResourcesSection />}
          {activeSection === 'mailbox' && <MailboxSection />}
          {activeSection === 'calendar' && <CalendarSection />}
          {activeSection === 'recommendations' && (
            <div className="dashboard-section" style={{ padding: '2rem' }}>
              <div className="section-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ed-text-dark)' }}>
                  <i className="bi bi-stars" style={{ marginRight: '10px', color: '#8b5cf6' }}></i>
                  Your Recommendations
                </h2>
                <p style={{ color: 'var(--ed-text-sub)' }}>Books picked just for you based on your interests.</p>
              </div>
              <BookRecommendations />
            </div>
          )}
        </main>
      </div>

      {/* Book Viewer Modal */}
      <BookViewer
        book={viewerBook}
        isOpen={showViewer}
        onClose={() => {
          setShowViewer(false);
          setViewerBook(null);
        }}
      />

      {/* Notification Toast */}
      {activeToast && (
        <div className={`notification-toast ${activeToast ? 'show' : ''}`} onClick={() => setActiveToast(null)}>
          <div className="toast-icon">
            <i className="bi bi-bell-fill"></i>
          </div>
          <div className="toast-body">
            <div className="toast-title">{t('notifications')}</div>
            <p>{activeToast.message || activeToast.text}</p>
          </div>
          <button className="toast-close">
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && <TeamModal />}

      {/* Global AI Chat */}
      <GlobalAIChat user={user} currentBook={viewerBook} />
    </div>
  );
};

export default StudentDashboard;
