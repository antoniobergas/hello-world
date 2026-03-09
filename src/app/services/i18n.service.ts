import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'ja';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
}

const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  en: { code: 'en', name: 'English', direction: 'ltr', dateFormat: 'MM/DD/YYYY' },
  es: { code: 'es', name: 'Español', direction: 'ltr', dateFormat: 'DD/MM/YYYY' },
  fr: { code: 'fr', name: 'Français', direction: 'ltr', dateFormat: 'DD/MM/YYYY' },
  de: { code: 'de', name: 'Deutsch', direction: 'ltr', dateFormat: 'DD.MM.YYYY' },
  ja: { code: 'ja', name: '日本語', direction: 'ltr', dateFormat: 'YYYY/MM/DD' },
};

const DEFAULT_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  'app.title': {
    en: 'My App',
    es: 'Mi Aplicación',
    fr: 'Mon Application',
    de: 'Meine App',
    ja: 'マイアプリ',
  },
  'nav.home': { en: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Startseite', ja: 'ホーム' },
  'nav.settings': {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    de: 'Einstellungen',
    ja: '設定',
  },
  'nav.profile': { en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil', ja: 'プロフィール' },
  'nav.logout': {
    en: 'Logout',
    es: 'Cerrar sesión',
    fr: 'Déconnexion',
    de: 'Abmelden',
    ja: 'ログアウト',
  },
  'action.save': { en: 'Save', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern', ja: '保存' },
  'action.cancel': {
    en: 'Cancel',
    es: 'Cancelar',
    fr: 'Annuler',
    de: 'Abbrechen',
    ja: 'キャンセル',
  },
  'action.delete': { en: 'Delete', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', ja: '削除' },
  'action.edit': { en: 'Edit', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', ja: '編集' },
  'action.add': { en: 'Add', es: 'Agregar', fr: 'Ajouter', de: 'Hinzufügen', ja: '追加' },
  'action.search': { en: 'Search', es: 'Buscar', fr: 'Rechercher', de: 'Suchen', ja: '検索' },
  'action.export': {
    en: 'Export',
    es: 'Exportar',
    fr: 'Exporter',
    de: 'Exportieren',
    ja: 'エクスポート',
  },
  'status.active': { en: 'Active', es: 'Activo', fr: 'Actif', de: 'Aktiv', ja: 'アクティブ' },
  'status.inactive': {
    en: 'Inactive',
    es: 'Inactivo',
    fr: 'Inactif',
    de: 'Inaktiv',
    ja: '非アクティブ',
  },
  'status.pending': {
    en: 'Pending',
    es: 'Pendiente',
    fr: 'En attente',
    de: 'Ausstehend',
    ja: '保留中',
  },
  'status.error': { en: 'Error', es: 'Error', fr: 'Erreur', de: 'Fehler', ja: 'エラー' },
  'msg.welcome': {
    en: 'Welcome, {name}!',
    es: '¡Bienvenido, {name}!',
    fr: 'Bienvenue, {name}!',
    de: 'Willkommen, {name}!',
    ja: 'ようこそ、{name}！',
  },
  'msg.confirm_delete': {
    en: 'Are you sure you want to delete {item}?',
    es: '¿Está seguro de que desea eliminar {item}?',
    fr: 'Êtes-vous sûr de vouloir supprimer {item}?',
    de: 'Möchten Sie {item} wirklich löschen?',
    ja: '{item}を削除してもよろしいですか？',
  },
  'msg.no_results': {
    en: 'No results found',
    es: 'No se encontraron resultados',
    fr: 'Aucun résultat trouvé',
    de: 'Keine Ergebnisse gefunden',
    ja: '結果が見つかりません',
  },
  'msg.loading': {
    en: 'Loading...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Lädt...',
    ja: '読み込み中...',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLocaleSubject = new BehaviorSubject<SupportedLocale>('en');
  private translations = new Map<string, Record<SupportedLocale, string>>(
    Object.entries(DEFAULT_TRANSLATIONS) as [string, Record<SupportedLocale, string>][],
  );

  readonly currentLocale$: Observable<SupportedLocale> = this.currentLocaleSubject.asObservable();

  get currentLocale(): SupportedLocale {
    return this.currentLocaleSubject.value;
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocaleSubject.next(locale);
  }

  translate(key: string, params?: Record<string, string>): string {
    const locale = this.currentLocaleSubject.value;
    const translations = this.translations.get(key);
    let text = translations?.[locale] ?? translations?.['en'] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return text;
  }

  getAvailableLocales(): LocaleConfig[] {
    return Object.values(LOCALE_CONFIGS);
  }

  getCurrentLocale(): LocaleConfig {
    return LOCALE_CONFIGS[this.currentLocaleSubject.value];
  }

  formatDate(date: Date): string {
    const config = this.getCurrentLocale();
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear());
    return config.dateFormat.replace('DD', d).replace('MM', m).replace('YYYY', y);
  }

  formatNumber(n: number): string {
    return new Intl.NumberFormat(this.currentLocaleSubject.value).format(n);
  }

  addTranslation(key: string, translations: Record<SupportedLocale, string>): void {
    this.translations.set(key, translations);
  }
}
